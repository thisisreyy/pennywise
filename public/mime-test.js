// Simple test file to verify MIME type handling
console.log('MIME type test successful - JavaScript is loading correctly');

// Test module syntax
export const testFunction = () => {
  return 'Module syntax working';
};

// Test if this file loads with correct MIME type
if (typeof window !== 'undefined') {
  window.mimeTestPassed = true;
}