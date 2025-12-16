# GTM Debug Panel Selectors

Reference for targeting elements in the GTM Tag Assistant debug panel.

## Tag Assistant Panel Structure

The GTM Tag Assistant creates an iframe overlay with debug information.

### Main Panel Selectors

```javascript
// Tag Assistant container
const TAG_ASSISTANT = {
  // Main panel frame
  panel: 'iframe[src*="tagassistant.google.com"]',
  
  // Summary view
  summaryTab: '[data-tab="summary"]',
  tagsTab: '[data-tab="tags"]',
  variablesTab: '[data-tab="variables"]',
  dataLayerTab: '[data-tab="dataLayer"]',
  
  // Event timeline (left sidebar)
  eventList: '.event-list',
  eventItem: '.event-list-item',
  activeEvent: '.event-list-item.active',
  
  // Tags section
  tagsFired: '.tags-fired',
  tagsNotFired: '.tags-not-fired',
  tagItem: '.tag-item',
  tagName: '.tag-name',
  tagStatus: '.tag-status',
  
  // Variables section
  variableList: '.variable-list',
  variableItem: '.variable-item',
  variableName: '.variable-name',
  variableValue: '.variable-value'
};
```

## Event Types to Monitor

```javascript
const GTM_EVENTS = {
  // Standard events
  CONTAINER_LOADED: 'Container Loaded',
  DOM_READY: 'DOM Ready',
  WINDOW_LOADED: 'Window Loaded',
  PAGE_VIEW: 'Page View',
  
  // Custom events (from dataLayer.push)
  CUSTOM: 'Custom Event',
  
  // Click events
  LINK_CLICK: 'Link Click',
  ELEMENT_CLICK: 'Element Click',
  
  // Form events
  FORM_SUBMIT: 'Form Submission',
  
  // Scroll events
  SCROLL_DEPTH: 'Scroll Depth',
  
  // Video events
  VIDEO_START: 'Video Start',
  VIDEO_PROGRESS: 'Video Progress',
  VIDEO_COMPLETE: 'Video Complete'
};
```

## Extracting Tag Status

```javascript
// Function to extract fired tags from debug panel
const extractFiredTags = async (page) => {
  return await page.evaluate(() => {
    const tags = [];
    const tagElements = document.querySelectorAll('.tag-item.fired');
    
    tagElements.forEach(el => {
      tags.push({
        name: el.querySelector('.tag-name')?.textContent?.trim(),
        type: el.querySelector('.tag-type')?.textContent?.trim(),
        trigger: el.querySelector('.tag-trigger')?.textContent?.trim(),
        status: 'fired'
      });
    });
    
    return tags;
  });
};

// Function to extract NOT fired tags
const extractNotFiredTags = async (page) => {
  return await page.evaluate(() => {
    const tags = [];
    const tagElements = document.querySelectorAll('.tag-item.not-fired');
    
    tagElements.forEach(el => {
      tags.push({
        name: el.querySelector('.tag-name')?.textContent?.trim(),
        type: el.querySelector('.tag-type')?.textContent?.trim(),
        blockingReason: el.querySelector('.blocking-reason')?.textContent?.trim(),
        status: 'not_fired'
      });
    });
    
    return tags;
  });
};
```

## Alternative: Console-Based Capture

If browser-use cannot access Tag Assistant iframe, use console injection:

```javascript
// Inject into target page console
const captureGTMState = () => {
  const state = {
    dataLayer: window.dataLayer ? [...window.dataLayer] : [],
    gtmContainers: [],
    errors: []
  };
  
  // Find loaded GTM containers
  if (window.google_tag_manager) {
    Object.keys(window.google_tag_manager).forEach(key => {
      if (key.startsWith('GTM-')) {
        state.gtmContainers.push(key);
      }
    });
  }
  
  // Check for GTM errors
  if (window.dataLayer) {
    window.dataLayer.forEach((item, index) => {
      if (item.event === 'gtm.error') {
        state.errors.push({
          index,
          error: item
        });
      }
    });
  }
  
  return state;
};
```

## Network Request Monitoring

```javascript
// Monitor outgoing tracking requests
const TRACKING_ENDPOINTS = {
  ga4: /google-analytics\.com\/g\/collect/,
  ua: /google-analytics\.com\/collect/,
  gtm: /googletagmanager\.com/,
  metaPixel: /facebook\.com\/tr/,
  tiktok: /analytics\.tiktok\.com/,
  linkedin: /px\.ads\.linkedin\.com/
};

// Intercept tracking calls
const interceptTrackingCalls = (page) => {
  page.on('request', request => {
    const url = request.url();
    
    Object.entries(TRACKING_ENDPOINTS).forEach(([platform, pattern]) => {
      if (pattern.test(url)) {
        console.log(`[${platform}] Request captured:`, {
          url: url,
          method: request.method(),
          postData: request.postData()
        });
      }
    });
  });
};
```
