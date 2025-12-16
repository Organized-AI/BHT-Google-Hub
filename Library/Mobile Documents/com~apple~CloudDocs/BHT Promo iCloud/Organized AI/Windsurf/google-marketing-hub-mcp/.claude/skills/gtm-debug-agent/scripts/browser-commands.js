/**
 * GTM Debug Agent - Browser Automation Commands
 * 
 * Reusable browser automation snippets for GTM debugging.
 * Compatible with Playwright, Puppeteer, and browser-use MCP.
 */

// ============================================
// INITIALIZATION
// ============================================

/**
 * Launch GTM Preview Mode
 * @param {Page} page - Browser page object
 * @param {string} containerId - GTM container ID (GTM-XXXXXXX)
 * @param {string} targetUrl - URL to debug
 */
async function launchGTMPreview(page, containerId, targetUrl) {
  const previewUrl = `https://tagassistant.google.com/#/?id=${containerId}&url=${encodeURIComponent(targetUrl)}`;
  
  await page.goto(previewUrl);
  
  // Wait for Tag Assistant to load
  await page.waitForSelector('[data-testid="connect-button"], button:has-text("Connect")', {
    timeout: 10000
  });
  
  // Click Connect button
  await page.click('[data-testid="connect-button"], button:has-text("Connect")');
  
  // Wait for new tab with target URL
  const newPage = await page.context().waitForEvent('page');
  await newPage.waitForLoadState('networkidle');
  
  return newPage;
}

// ============================================
// DATA LAYER CAPTURE
// ============================================

/**
 * Capture current dataLayer state
 * @param {Page} page - Browser page object
 */
async function captureDataLayer(page) {
  return await page.evaluate(() => {
    return {
      timestamp: new Date().toISOString(),
      url: window.location.href,
      dataLayer: window.dataLayer ? JSON.parse(JSON.stringify(window.dataLayer)) : [],
      gtmContainers: window.google_tag_manager ? Object.keys(window.google_tag_manager).filter(k => k.startsWith('GTM-')) : []
    };
  });
}

/**
 * Monitor dataLayer changes in real-time
 * @param {Page} page - Browser page object
 * @param {Function} callback - Called when dataLayer changes
 */
async function watchDataLayer(page, callback) {
  await page.exposeFunction('__onDataLayerPush', callback);
  
  await page.evaluate(() => {
    const originalPush = window.dataLayer.push.bind(window.dataLayer);
    window.dataLayer.push = function(...args) {
      window.__onDataLayerPush(args);
      return originalPush(...args);
    };
  });
}

// ============================================
// USER ACTIONS
// ============================================

/**
 * Execute a test action
 * @param {Page} page - Browser page object
 * @param {Object} action - Action definition
 */
async function executeAction(page, action) {
  const result = {
    action: action.type,
    timestamp: new Date().toISOString(),
    success: false,
    error: null
  };
  
  try {
    switch (action.type) {
      case 'click':
        await page.waitForSelector(action.selector, { timeout: action.timeout || 5000 });
        await page.click(action.selector);
        result.success = true;
        break;
        
      case 'fill':
        await page.waitForSelector(action.selector, { timeout: action.timeout || 5000 });
        await page.fill(action.selector, action.value);
        result.success = true;
        break;
        
      case 'scroll':
        await page.evaluate((target) => {
          if (target === 'bottom') {
            window.scrollTo(0, document.body.scrollHeight);
          } else if (typeof target === 'number') {
            window.scrollTo(0, target);
          }
        }, action.target || 'bottom');
        result.success = true;
        break;
        
      case 'wait':
        if (action.selector) {
          await page.waitForSelector(action.selector, { timeout: action.timeout || 5000 });
        } else {
          await page.waitForTimeout(action.duration || 1000);
        }
        result.success = true;
        break;
        
      case 'navigate':
        await page.goto(action.url);
        await page.waitForLoadState('networkidle');
        result.success = true;
        break;
        
      case 'capture':
        result.dataLayer = await captureDataLayer(page);
        result.success = true;
        break;
        
      default:
        result.error = `Unknown action type: ${action.type}`;
    }
  } catch (error) {
    result.error = error.message;
  }
  
  return result;
}

/**
 * Execute a sequence of actions with captures
 * @param {Page} page - Browser page object
 * @param {Array} actions - Array of action definitions
 */
async function executeTestSequence(page, actions) {
  const results = [];
  
  // Capture baseline
  results.push({
    step: 'baseline',
    ...await captureDataLayer(page)
  });
  
  // Execute each action
  for (let i = 0; i < actions.length; i++) {
    const action = actions[i];
    const actionResult = await executeAction(page, action);
    
    // Auto-capture after each action
    if (action.type !== 'capture') {
      await page.waitForTimeout(500); // Brief wait for dataLayer updates
      actionResult.dataLayerAfter = await captureDataLayer(page);
    }
    
    results.push({
      step: i + 1,
      ...actionResult
    });
  }
  
  return results;
}

// ============================================
// NETWORK MONITORING
// ============================================

/**
 * Intercept tracking requests
 * @param {Page} page - Browser page object
 */
async function interceptTrackingRequests(page) {
  const trackingRequests = [];
  
  const patterns = {
    ga4: /google-analytics\.com\/g\/collect/,
    ua: /google-analytics\.com\/collect/,
    gtm: /googletagmanager\.com\/gtm\.js/,
    metaPixel: /facebook\.com\/tr/,
    tiktok: /analytics\.tiktok\.com/,
    linkedin: /px\.ads\.linkedin\.com/,
    twitter: /analytics\.twitter\.com/,
    pinterest: /ct\.pinterest\.com/
  };
  
  page.on('request', request => {
    const url = request.url();
    
    for (const [platform, pattern] of Object.entries(patterns)) {
      if (pattern.test(url)) {
        trackingRequests.push({
          timestamp: new Date().toISOString(),
          platform,
          url,
          method: request.method(),
          postData: request.postData()
        });
        break;
      }
    }
  });
  
  return () => trackingRequests; // Return getter function
}

// ============================================
// ANALYSIS & REPORTING
// ============================================

/**
 * Compare dataLayer states
 * @param {Array} before - dataLayer before action
 * @param {Array} after - dataLayer after action
 */
function compareDataLayers(before, after) {
  const diff = {
    newEntries: [],
    newEvents: []
  };
  
  after.forEach((item, index) => {
    if (index >= before.length) {
      diff.newEntries.push(item);
      if (item.event) {
        diff.newEvents.push(item.event);
      }
    }
  });
  
  return diff;
}

/**
 * Validate against expected outcomes
 * @param {Array} dataLayer - Current dataLayer
 * @param {Object} expected - Expected outcomes
 */
function validateOutcomes(dataLayer, expected) {
  const results = {
    passed: [],
    failed: [],
    warnings: []
  };
  
  // Check expected events
  if (expected.dataLayerEvents) {
    expected.dataLayerEvents.forEach(eventName => {
      const found = dataLayer.some(item => item.event === eventName);
      if (found) {
        results.passed.push(`✅ Event '${eventName}' fired`);
      } else {
        results.failed.push(`❌ Event '${eventName}' NOT fired`);
      }
    });
  }
  
  // Check expected tags (requires Tag Assistant parsing)
  if (expected.tagsFired) {
    results.warnings.push(`⚠️ Tag validation requires Tag Assistant panel access`);
  }
  
  // Check data fields
  if (expected.dataLayerContains) {
    Object.entries(expected.dataLayerContains).forEach(([path, expectedValue]) => {
      const parts = path.split('.');
      
      const found = dataLayer.find(item => {
        let value = item;
        for (const part of parts) {
          value = value?.[part];
        }
        if (expectedValue === '*') return value !== undefined;
        return value === expectedValue;
      });
      
      if (found) {
        results.passed.push(`✅ Field '${path}' present`);
      } else {
        results.failed.push(`❌ Field '${path}' not found or mismatch`);
      }
    });
  }
  
  return results;
}

/**
 * Generate debug report
 * @param {Object} testResults - Results from executeTestSequence
 * @param {Object} expected - Expected outcomes
 */
function generateReport(testResults, expected) {
  const finalCapture = testResults[testResults.length - 1];
  const dataLayer = finalCapture.dataLayerAfter?.dataLayer || finalCapture.dataLayer || [];
  
  const validation = validateOutcomes(dataLayer, expected);
  
  return {
    summary: {
      totalSteps: testResults.length - 1,
      passed: validation.passed.length,
      failed: validation.failed.length,
      warnings: validation.warnings.length,
      success: validation.failed.length === 0
    },
    validation,
    steps: testResults,
    finalDataLayer: dataLayer
  };
}

// ============================================
// EXPORTS
// ============================================

module.exports = {
  launchGTMPreview,
  captureDataLayer,
  watchDataLayer,
  executeAction,
  executeTestSequence,
  interceptTrackingRequests,
  compareDataLayers,
  validateOutcomes,
  generateReport
};
