/**
 * GoogleApiClient - Wrapper for authenticated Google API requests
 * Automatically handles token injection and refresh on 401 responses
 */

import { TokenManager, TokenData, TokenError } from './token-manager';

export interface GoogleApiClientOptions {
  tokenManager: TokenManager;
  userId: string;
}

export interface GoogleApiError {
  error: {
    code: number;
    message: string;
    status?: string;
    errors?: Array<{
      message: string;
      domain: string;
      reason: string;
    }>;
  };
}

// Rate limit tracking
const rateLimitMap = new Map<string, number>();
const RATE_LIMIT_WINDOW = 60000; // 1 minute

export class GoogleApiClient {
  private tokenManager: TokenManager;
  private userId: string;
  private token: TokenData | null = null;

  constructor(options: GoogleApiClientOptions) {
    this.tokenManager = options.tokenManager;
    this.userId = options.userId;
  }

  /**
   * Make an authenticated request to a Google API
   */
  async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    // Check rate limit
    this.checkRateLimit(endpoint);

    // Get valid token (auto-refresh if needed)
    if (!this.token) {
      this.token = await this.tokenManager.getValidToken(this.userId);
    }

    // Make the request
    const response = await this.makeRequest<T>(endpoint, options);
    return response;
  }

  /**
   * Make the actual HTTP request with retry logic
   */
  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit,
    isRetry = false
  ): Promise<T> {
    const headers = new Headers(options.headers);
    headers.set('Authorization', `Bearer ${this.token!.access_token}`);

    if (!headers.has('Content-Type') && options.body) {
      headers.set('Content-Type', 'application/json');
    }

    const response = await fetch(endpoint, {
      ...options,
      headers,
    });

    // Handle 401 - Token expired
    if (response.status === 401 && !isRetry) {
      console.log('Token expired, refreshing...');
      this.token = await this.tokenManager.refreshToken(this.userId);
      return this.makeRequest<T>(endpoint, options, true);
    }

    // Handle 429 - Rate limited
    if (response.status === 429) {
      this.handleRateLimit(endpoint, response);
      throw new ApiError(
        'Rate limited by Google API. Please wait and try again.',
        'RATE_LIMITED',
        -32003,
        429
      );
    }

    // Handle other errors
    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({})) as GoogleApiError;
      const errorMessage = errorBody.error?.message || response.statusText;
      throw new ApiError(
        `Google API error: ${errorMessage}`,
        'API_ERROR',
        -32003,
        response.status
      );
    }

    // Handle empty responses
    const text = await response.text();
    if (!text) {
      return {} as T;
    }

    return JSON.parse(text) as T;
  }

  /**
   * Check if we're rate limited for this endpoint
   */
  private checkRateLimit(endpoint: string): void {
    const domain = new URL(endpoint).hostname;
    const limitUntil = rateLimitMap.get(domain);

    if (limitUntil && Date.now() < limitUntil) {
      const waitTime = Math.ceil((limitUntil - Date.now()) / 1000);
      throw new ApiError(
        `Rate limited. Please wait ${waitTime} seconds.`,
        'RATE_LIMITED',
        -32003,
        429
      );
    }
  }

  /**
   * Handle rate limit response
   */
  private handleRateLimit(endpoint: string, response: Response): void {
    const domain = new URL(endpoint).hostname;
    const retryAfter = response.headers.get('Retry-After');
    const waitMs = retryAfter
      ? parseInt(retryAfter, 10) * 1000
      : RATE_LIMIT_WINDOW;

    rateLimitMap.set(domain, Date.now() + waitMs);
  }

  /**
   * GET request helper
   */
  async get<T>(endpoint: string, params?: Record<string, string>): Promise<T> {
    let url = endpoint;
    if (params) {
      const searchParams = new URLSearchParams(params);
      url = `${endpoint}?${searchParams.toString()}`;
    }
    return this.request<T>(url, { method: 'GET' });
  }

  /**
   * POST request helper
   */
  async post<T>(endpoint: string, body?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  /**
   * PUT request helper
   */
  async put<T>(endpoint: string, body?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  /**
   * PATCH request helper
   */
  async patch<T>(endpoint: string, body?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  /**
   * DELETE request helper
   */
  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  /**
   * Get the current token (for inspection)
   */
  getToken(): TokenData | null {
    return this.token;
  }

  /**
   * Get the user ID
   */
  getUserId(): string {
    return this.userId;
  }
}

/**
 * Custom error class for API operations
 */
export class ApiError extends Error {
  code: string;
  mcpErrorCode: number;
  httpStatus: number;

  constructor(message: string, code: string, mcpErrorCode: number, httpStatus: number) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.mcpErrorCode = mcpErrorCode;
    this.httpStatus = httpStatus;
  }
}

/**
 * Factory function to create a GoogleApiClient
 */
export function createGoogleApiClient(
  tokenManager: TokenManager,
  userId: string
): GoogleApiClient {
  return new GoogleApiClient({ tokenManager, userId });
}
