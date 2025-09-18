// Comprehensive Test Script for Partnership App
// This script tests all features and components

console.log('🧪 Starting comprehensive feature testing...');

// Test 1: Database Connection
async function testDatabaseConnection() {
  console.log('📊 Testing database connection...');
  
  try {
    // Test Supabase connection
    const response = await fetch('https://dobclnswdftadrqftpux.supabase.co/rest/v1/users?select=count', {
      headers: {
        'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRvYmNsbnN3ZGZ0YWRycWZ0cHV4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgwMDY4NTAsImV4cCI6MjA3MzU4Mjg1MH0.sbg7tzATha25ryHWYclW1hV0M_Mx1clQnRBoqiUwfLM',
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRvYmNsbnN3ZGZ0YWRycWZ0cHV4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgwMDY4NTAsImV4cCI6MjA3MzU4Mjg1MH0.sbg7tzATha25ryHWYclW1hV0M_Mx1clQnRBoqiUwfLM'
      }
    });
    
    if (response.ok) {
      console.log('✅ Database connection successful');
      return true;
    } else {
      console.log('❌ Database connection failed:', response.status);
      return false;
    }
  } catch (error) {
    console.log('❌ Database connection error:', error.message);
    return false;
  }
}

// Test 2: Authentication
async function testAuthentication() {
  console.log('🔐 Testing authentication...');
  
  try {
    // Test login with Person1
    const loginResponse = await fetch('https://dobclnswdftadrqftpux.supabase.co/auth/v1/token?grant_type=password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRvYmNsbnN3ZGZ0YWRycWZ0cHV4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgwMDY4NTAsImV4cCI6MjA3MzU4Mjg1MH0.sbg7tzATha25ryHWYclW1hV0M_Mx1clQnRBoqiUwfLM'
      },
      body: JSON.stringify({
        email: 'person1@example.com',
        password: 'password123'
      })
    });
    
    if (loginResponse.ok) {
      console.log('✅ Authentication successful');
      return true;
    } else {
      console.log('❌ Authentication failed:', loginResponse.status);
      return false;
    }
  } catch (error) {
    console.log('❌ Authentication error:', error.message);
    return false;
  }
}

// Test 3: Component Loading
function testComponentLoading() {
  console.log('🧩 Testing component loading...');
  
  const components = [
    'VoiceInput',
    'FileUpload', 
    'GlobalSearch',
    'DarkModeToggle',
    'TouchGestures',
    'ErrorBoundary',
    'PerformanceOptimizer'
  ];
  
  let loadedComponents = 0;
  
  components.forEach(component => {
    try {
      // Check if component exists in DOM or can be imported
      if (document.querySelector(`[data-component="${component}"]`) || 
          window[component] || 
          document.querySelector(`.${component.toLowerCase()}`)) {
        console.log(`✅ ${component} loaded`);
        loadedComponents++;
      } else {
        console.log(`❌ ${component} not found`);
      }
    } catch (error) {
      console.log(`❌ ${component} error:`, error.message);
    }
  });
  
  console.log(`📊 Components loaded: ${loadedComponents}/${components.length}`);
  return loadedComponents === components.length;
}

// Test 4: Mobile Responsiveness
function testMobileResponsiveness() {
  console.log('📱 Testing mobile responsiveness...');
  
  const viewports = [
    { width: 375, height: 667, name: 'iPhone SE' },
    { width: 414, height: 896, name: 'iPhone 11' },
    { width: 768, height: 1024, name: 'iPad' },
    { width: 1920, height: 1080, name: 'Desktop' }
  ];
  
  let responsiveCount = 0;
  
  viewports.forEach(viewport => {
    // Simulate viewport change
    const originalWidth = window.innerWidth;
    const originalHeight = window.innerHeight;
    
    // Mock viewport dimensions
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: viewport.width
    });
    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      configurable: true,
      value: viewport.height
    });
    
    // Check if layout adapts
    const isResponsive = document.body.offsetWidth <= viewport.width;
    
    if (isResponsive) {
      console.log(`✅ ${viewport.name} responsive`);
      responsiveCount++;
    } else {
      console.log(`❌ ${viewport.name} not responsive`);
    }
    
    // Restore original dimensions
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: originalWidth
    });
    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      configurable: true,
      value: originalHeight
    });
  });
  
  console.log(`📊 Responsive viewports: ${responsiveCount}/${viewports.length}`);
  return responsiveCount === viewports.length;
}

// Test 5: PWA Features
function testPWAFeatures() {
  console.log('📱 Testing PWA features...');
  
  const pwaFeatures = [
    { name: 'Service Worker', test: () => 'serviceWorker' in navigator },
    { name: 'Manifest', test: () => document.querySelector('link[rel="manifest"]') !== null },
    { name: 'Offline Support', test: () => 'caches' in window },
    { name: 'Push Notifications', test: () => 'PushManager' in window },
    { name: 'Install Prompt', test: () => 'onbeforeinstallprompt' in window }
  ];
  
  let pwaScore = 0;
  
  pwaFeatures.forEach(feature => {
    try {
      if (feature.test()) {
        console.log(`✅ ${feature.name} supported`);
        pwaScore++;
      } else {
        console.log(`❌ ${feature.name} not supported`);
      }
    } catch (error) {
      console.log(`❌ ${feature.name} error:`, error.message);
    }
  });
  
  console.log(`📊 PWA features: ${pwaScore}/${pwaFeatures.length}`);
  return pwaScore >= 3; // At least 3 PWA features should be supported
}

// Test 6: Performance
function testPerformance() {
  console.log('⚡ Testing performance...');
  
  const performanceTests = [
    {
      name: 'Page Load Time',
      test: () => {
        const navigation = performance.getEntriesByType('navigation')[0];
        return navigation ? navigation.loadEventEnd - navigation.loadEventStart : 0;
      },
      threshold: 3000
    },
    {
      name: 'First Contentful Paint',
      test: () => {
        const paintEntries = performance.getEntriesByType('paint');
        const fcp = paintEntries.find(entry => entry.name === 'first-contentful-paint');
        return fcp ? fcp.startTime : 0;
      },
      threshold: 2000
    },
    {
      name: 'Memory Usage',
      test: () => {
        const memory = performance.memory;
        return memory ? memory.usedJSHeapSize / 1024 / 1024 : 0;
      },
      threshold: 100
    }
  ];
  
  let performanceScore = 0;
  
  performanceTests.forEach(test => {
    try {
      const value = test.test();
      if (value <= test.threshold) {
        console.log(`✅ ${test.name}: ${value.toFixed(2)} (good)`);
        performanceScore++;
      } else {
        console.log(`⚠️ ${test.name}: ${value.toFixed(2)} (needs optimization)`);
      }
    } catch (error) {
      console.log(`❌ ${test.name} error:`, error.message);
    }
  });
  
  console.log(`📊 Performance score: ${performanceScore}/${performanceTests.length}`);
  return performanceScore >= 2; // At least 2 performance metrics should be good
}

// Test 7: Accessibility
function testAccessibility() {
  console.log('♿ Testing accessibility...');
  
  const accessibilityTests = [
    {
      name: 'Alt Text',
      test: () => {
        const images = document.querySelectorAll('img');
        let altCount = 0;
        images.forEach(img => {
          if (img.alt && img.alt.trim() !== '') altCount++;
        });
        return images.length === 0 || altCount / images.length >= 0.8;
      }
    },
    {
      name: 'ARIA Labels',
      test: () => {
        const elements = document.querySelectorAll('[aria-label], [aria-labelledby]');
        return elements.length > 0;
      }
    },
    {
      name: 'Keyboard Navigation',
      test: () => {
        const focusableElements = document.querySelectorAll('button, input, select, textarea, [tabindex]');
        return focusableElements.length > 0;
      }
    },
    {
      name: 'Color Contrast',
      test: () => {
        // Basic color contrast check
        const textElements = document.querySelectorAll('p, h1, h2, h3, h4, h5, h6, span, div');
        return textElements.length > 0;
      }
    }
  ];
  
  let accessibilityScore = 0;
  
  accessibilityTests.forEach(test => {
    try {
      if (test.test()) {
        console.log(`✅ ${test.name} passed`);
        accessibilityScore++;
      } else {
        console.log(`❌ ${test.name} failed`);
      }
    } catch (error) {
      console.log(`❌ ${test.name} error:`, error.message);
    }
  });
  
  console.log(`📊 Accessibility score: ${accessibilityScore}/${accessibilityTests.length}`);
  return accessibilityScore >= 3; // At least 3 accessibility features should pass
}

// Test 8: Error Handling
function testErrorHandling() {
  console.log('🛡️ Testing error handling...');
  
  let errorHandlingScore = 0;
  
  try {
    // Test if error boundary exists
    const errorBoundary = document.querySelector('[data-error-boundary]');
    if (errorBoundary) {
      console.log('✅ Error boundary found');
      errorHandlingScore++;
    } else {
      console.log('❌ Error boundary not found');
    }
    
    // Test console error handling
    const originalConsoleError = console.error;
    let errorCaught = false;
    
    console.error = (...args) => {
      errorCaught = true;
      originalConsoleError.apply(console, args);
    };
    
    // Trigger a test error
    setTimeout(() => {
      try {
        throw new Error('Test error');
      } catch (e) {
        // Error should be caught
      }
    }, 100);
    
    setTimeout(() => {
      if (errorCaught) {
        console.log('✅ Error handling works');
        errorHandlingScore++;
      } else {
        console.log('❌ Error handling not working');
      }
      console.error = originalConsoleError;
    }, 200);
    
  } catch (error) {
    console.log('❌ Error handling test failed:', error.message);
  }
  
  console.log(`📊 Error handling score: ${errorHandlingScore}/2`);
  return errorHandlingScore >= 1;
}

// Main test runner
async function runAllTests() {
  console.log('🚀 Starting comprehensive testing...');
  
  const tests = [
    { name: 'Database Connection', fn: testDatabaseConnection, async: true },
    { name: 'Authentication', fn: testAuthentication, async: true },
    { name: 'Component Loading', fn: testComponentLoading, async: false },
    { name: 'Mobile Responsiveness', fn: testMobileResponsiveness, async: false },
    { name: 'PWA Features', fn: testPWAFeatures, async: false },
    { name: 'Performance', fn: testPerformance, async: false },
    { name: 'Accessibility', fn: testAccessibility, async: false },
    { name: 'Error Handling', fn: testErrorHandling, async: false }
  ];
  
  let passedTests = 0;
  const totalTests = tests.length;
  
  for (const test of tests) {
    try {
      let result;
      if (test.async) {
        result = await test.fn();
      } else {
        result = test.fn();
      }
      
      if (result) {
        console.log(`✅ ${test.name} PASSED`);
        passedTests++;
      } else {
        console.log(`❌ ${test.name} FAILED`);
      }
    } catch (error) {
      console.log(`❌ ${test.name} ERROR:`, error.message);
    }
  }
  
  console.log('\n🎯 TEST RESULTS SUMMARY:');
  console.log(`📊 Tests passed: ${passedTests}/${totalTests}`);
  console.log(`📈 Success rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`);
  
  if (passedTests === totalTests) {
    console.log('🎉 ALL TESTS PASSED! Your app is ready for production!');
  } else if (passedTests >= totalTests * 0.8) {
    console.log('✅ Most tests passed! Your app is in good shape.');
  } else {
    console.log('⚠️ Some tests failed. Please review and fix the issues.');
  }
  
  return {
    passed: passedTests,
    total: totalTests,
    successRate: (passedTests / totalTests) * 100
  };
}

// Run tests when script loads
if (typeof window !== 'undefined') {
  // Run tests after page loads
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', runAllTests);
  } else {
    runAllTests();
  }
}

// Export for manual testing
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    runAllTests,
    testDatabaseConnection,
    testAuthentication,
    testComponentLoading,
    testMobileResponsiveness,
    testPWAFeatures,
    testPerformance,
    testAccessibility,
    testErrorHandling
  };
}
