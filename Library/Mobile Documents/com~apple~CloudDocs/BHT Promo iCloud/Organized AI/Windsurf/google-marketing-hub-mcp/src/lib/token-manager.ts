/**
 * TokenManager - Handles OAuth token storage, retrieval, and refresh
 * Stores tokens in D1 database with automatic refresh before expiry
 */

export interface TokenData {
  user_id: string;
  access_token: string;
  refresh_token: string;
  expires_at: number;
  scopes: string;
  created_at: number;
  updated_at: number;
}

export interface TokenManagerEnv {
  DB: D1Database;
  GOOGLE_CLIENT_ID: string;
  GOOGLE_CLIENT_SECRET: string;
}

// Token refresh buffer - refresh 5 minutes before expiry
const REFRESH_BUFFER_SECONDS = 5 * 60;

export class TokenManager {
  private db: D1Database;
  private clientId: string;
  private clientSecret: string;

  constructor(env: TokenManagerEnv) {
    this.db = env.DB;
    this.clientId = env.GOOGLE_CLIENT_ID;
    this.clientSecret = env.GOOGLE_CLIENT_SECRET;
  }

  /**
   * Generate a new token ID with ghub_ prefix
   */
  static generateTokenId(): string {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let result = 'ghub_';
    for (let i = 0; i < 24; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  /**
   * Store a new token in the database
   */
  async storeToken(
    userId: string,
    accessToken: string,
    refreshToken: string,
    expiresIn: number,
    scopes: string
  ): Promise<TokenData> {
    const now = Math.floor(Date.now() / 1000);
    const expiresAt = now + expiresIn;

    await this.db
      .prepare(
        `INSERT OR REPLACE INTO tokens
         (user_id, access_token, refresh_token, expires_at, scopes, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?)`
      )
      .bind(userId, accessToken, refreshToken, expiresAt, scopes, now, now)
      .run();

    return {
      user_id: userId,
      access_token: accessToken,
      refresh_token: refreshToken,
      expires_at: expiresAt,
      scopes,
      created_at: now,
      updated_at: now,
    };
  }

  /**
   * Get token by user ID
   */
  async getToken(userId: string): Promise<TokenData | null> {
    const result = await this.db
      .prepare('SELECT * FROM tokens WHERE user_id = ?')
      .bind(userId)
      .first<TokenData>();

    return result || null;
  }

  /**
   * Check if token is expired or will expire soon
   */
  isTokenExpired(tokenData: TokenData): boolean {
    const now = Math.floor(Date.now() / 1000);
    return tokenData.expires_at <= now + REFRESH_BUFFER_SECONDS;
  }

  /**
   * Refresh an expired or near-expiry token
   */
  async refreshToken(userId: string): Promise<TokenData> {
    const existingToken = await this.getToken(userId);
    if (!existingToken) {
      throw new TokenError('Token not found', 'TOKEN_NOT_FOUND', -32001);
    }

    try {
      const response = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: this.clientId,
          client_secret: this.clientSecret,
          refresh_token: existingToken.refresh_token,
          grant_type: 'refresh_token',
        }),
      });

      if (!response.ok) {
        const error = await response.json() as { error?: string; error_description?: string };
        throw new TokenError(
          `Token refresh failed: ${error.error_description || error.error || 'Unknown error'}`,
          'REFRESH_FAILED',
          -32002
        );
      }

      const data = await response.json() as {
        access_token: string;
        expires_in: number;
        scope?: string;
      };

      const now = Math.floor(Date.now() / 1000);
      const expiresAt = now + data.expires_in;

      // Update the token in the database
      await this.db
        .prepare(
          `UPDATE tokens
           SET access_token = ?, expires_at = ?, updated_at = ?
           WHERE user_id = ?`
        )
        .bind(data.access_token, expiresAt, now, userId)
        .run();

      return {
        ...existingToken,
        access_token: data.access_token,
        expires_at: expiresAt,
        updated_at: now,
      };
    } catch (error) {
      if (error instanceof TokenError) {
        throw error;
      }
      throw new TokenError(
        `Token refresh error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'REFRESH_ERROR',
        -32002
      );
    }
  }

  /**
   * Get a valid token, refreshing if necessary
   */
  async getValidToken(userId: string): Promise<TokenData> {
    const token = await this.getToken(userId);
    if (!token) {
      throw new TokenError('Token not found', 'TOKEN_NOT_FOUND', -32001);
    }

    if (this.isTokenExpired(token)) {
      return this.refreshToken(userId);
    }

    return token;
  }

  /**
   * Revoke and delete a token
   */
  async revokeToken(userId: string): Promise<void> {
    const token = await this.getToken(userId);
    if (!token) {
      throw new TokenError('Token not found', 'TOKEN_NOT_FOUND', -32001);
    }

    // Revoke at Google
    try {
      await fetch(
        `https://oauth2.googleapis.com/revoke?token=${token.access_token}`,
        { method: 'POST' }
      );
    } catch {
      // Continue even if revoke fails - we'll delete locally anyway
      console.warn('Failed to revoke token at Google');
    }

    // Delete from database
    await this.db
      .prepare('DELETE FROM tokens WHERE user_id = ?')
      .bind(userId)
      .run();
  }

  /**
   * List all tokens (for admin purposes)
   */
  async listTokens(): Promise<Array<{ user_id: string; scopes: string; expires_at: number }>> {
    const result = await this.db
      .prepare('SELECT user_id, scopes, expires_at FROM tokens ORDER BY updated_at DESC')
      .all<{ user_id: string; scopes: string; expires_at: number }>();

    return result.results || [];
  }
}

/**
 * Custom error class for token operations
 */
export class TokenError extends Error {
  code: string;
  mcpErrorCode: number;

  constructor(message: string, code: string, mcpErrorCode: number) {
    super(message);
    this.name = 'TokenError';
    this.code = code;
    this.mcpErrorCode = mcpErrorCode;
  }
}
