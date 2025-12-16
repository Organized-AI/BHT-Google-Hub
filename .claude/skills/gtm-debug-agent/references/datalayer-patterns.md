# dataLayer Validation Patterns

Common dataLayer structures and validation logic for GTM debugging.

## Standard Event Structures

### Page View (GA4)
```javascript
{
  event: 'page_view',
  page_title: 'Product Page',
  page_location: 'https://example.com/product/123',
  page_referrer: 'https://example.com/'
}
```

### E-commerce: View Item
```javascript
{
  event: 'view_item',
  ecommerce: {
    currency: 'USD',
    value: 29.99,
    items: [{
      item_id: 'SKU123',
      item_name: 'Product Name',
      item_brand: 'Brand',
      item_category: 'Category',
      price: 29.99,
      quantity: 1
    }]
  }
}
```

### E-commerce: Add to Cart
```javascript
{
  event: 'add_to_cart',
  ecommerce: {
    currency: 'USD',
    value: 29.99,
    items: [{
      item_id: 'SKU123',
      item_name: 'Product Name',
      price: 29.99,
      quantity: 1
    }]
  }
}
```

### E-commerce: Purchase
```javascript
{
  event: 'purchase',
  ecommerce: {
    transaction_id: 'T12345',
    value: 59.98,
    tax: 4.90,
    shipping: 5.99,
    currency: 'USD',
    coupon: 'SUMMER20',
    items: [{
      item_id: 'SKU123',
      item_name: 'Product Name',
      price: 29.99,
      quantity: 2
    }]
  }
}
```

### Lead / Form Submit
```javascript
{
  event: 'generate_lead',
  currency: 'USD',
  value: 100,
  lead_source: 'contact_form'
}
```

## Validation Functions

### Check Event Exists
```javascript
const hasEvent = (dataLayer, eventName) => {
  return dataLayer.some(item => item.event === eventName);
};
```

### Get Event Data
```javascript
const getEventData = (dataLayer, eventName) => {
  return dataLayer.find(item => item.event === eventName);
};
```

### Get All Events of Type
```javascript
const getAllEvents = (dataLayer, eventName) => {
  return dataLayer.filter(item => item.event === eventName);
};
```

### Validate Required Fields
```javascript
const validateRequiredFields = (eventData, requiredFields) => {
  const missing = [];
  const present = [];
  
  requiredFields.forEach(field => {
    const value = getNestedValue(eventData, field);
    if (value === undefined || value === null || value === '') {
      missing.push(field);
    } else {
      present.push({ field, value });
    }
  });
  
  return { missing, present, valid: missing.length === 0 };
};

// Helper for nested paths like 'ecommerce.transaction_id'
const getNestedValue = (obj, path) => {
  return path.split('.').reduce((acc, key) => acc?.[key], obj);
};
```

### Validate E-commerce Purchase
```javascript
const validatePurchase = (dataLayer) => {
  const purchaseEvent = getEventData(dataLayer, 'purchase');
  
  if (!purchaseEvent) {
    return { valid: false, error: 'No purchase event found' };
  }
  
  const required = [
    'ecommerce.transaction_id',
    'ecommerce.value',
    'ecommerce.currency',
    'ecommerce.items'
  ];
  
  const validation = validateRequiredFields(purchaseEvent, required);
  
  // Additional item validation
  if (purchaseEvent.ecommerce?.items) {
    const itemRequired = ['item_id', 'item_name', 'price', 'quantity'];
    
    purchaseEvent.ecommerce.items.forEach((item, index) => {
      itemRequired.forEach(field => {
        if (!item[field]) {
          validation.missing.push(`items[${index}].${field}`);
          validation.valid = false;
        }
      });
    });
  }
  
  return validation;
};
```

## Comparison Utilities

### Compare Before/After dataLayer
```javascript
const compareDataLayers = (before, after) => {
  const diff = {
    added: [],
    modified: [],
    eventsFired: []
  };
  
  // Find new entries
  after.forEach((item, index) => {
    if (index >= before.length) {
      diff.added.push(item);
      if (item.event) {
        diff.eventsFired.push(item.event);
      }
    }
  });
  
  return diff;
};
```

### Match Against Expected Outcomes
```javascript
const matchExpectations = (dataLayer, expected) => {
  const results = {
    passed: [],
    failed: []
  };
  
  // Check expected events
  if (expected.dataLayerEvents) {
    expected.dataLayerEvents.forEach(eventName => {
      if (hasEvent(dataLayer, eventName)) {
        results.passed.push(`Event '${eventName}' found`);
      } else {
        results.failed.push(`Event '${eventName}' NOT found`);
      }
    });
  }
  
  // Check expected data fields
  if (expected.dataLayerContains) {
    Object.entries(expected.dataLayerContains).forEach(([path, expectedValue]) => {
      const latestWithPath = [...dataLayer].reverse().find(item => {
        return getNestedValue(item, path) !== undefined;
      });
      
      if (!latestWithPath) {
        results.failed.push(`Field '${path}' not found`);
      } else {
        const actualValue = getNestedValue(latestWithPath, path);
        if (expectedValue === '*' && actualValue !== undefined) {
          results.passed.push(`Field '${path}' exists: ${actualValue}`);
        } else if (actualValue === expectedValue) {
          results.passed.push(`Field '${path}' = ${actualValue}`);
        } else {
          results.failed.push(`Field '${path}': expected ${expectedValue}, got ${actualValue}`);
        }
      }
    });
  }
  
  return results;
};
```

## Common Issues & Detection

### Detect Duplicate Events
```javascript
const detectDuplicates = (dataLayer) => {
  const eventCounts = {};
  const duplicates = [];
  
  dataLayer.forEach(item => {
    if (item.event) {
      eventCounts[item.event] = (eventCounts[item.event] || 0) + 1;
    }
  });
  
  Object.entries(eventCounts).forEach(([event, count]) => {
    if (count > 1 && !['gtm.js', 'gtm.dom', 'gtm.load'].includes(event)) {
      duplicates.push({ event, count });
    }
  });
  
  return duplicates;
};
```

### Detect GTM Errors
```javascript
const detectGTMErrors = (dataLayer) => {
  return dataLayer.filter(item => 
    item.event === 'gtm.error' || 
    item['gtm.errorMessage']
  );
};
```

### Check Consent State
```javascript
const checkConsentState = (dataLayer) => {
  const consentUpdates = dataLayer.filter(item => 
    Array.isArray(item) && item[0] === 'consent'
  );
  
  const latestConsent = consentUpdates[consentUpdates.length - 1];
  
  return {
    hasConsentMode: consentUpdates.length > 0,
    latestState: latestConsent?.[2] || null,
    analyticsAllowed: latestConsent?.[2]?.analytics_storage === 'granted',
    adsAllowed: latestConsent?.[2]?.ad_storage === 'granted'
  };
};
```
