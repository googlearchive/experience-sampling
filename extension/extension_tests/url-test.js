/**
 * Add the result of a test to the page for display. Color it green for pasing,
 * red for failing.
 * @param {string} testInput The input URL.
 * @param {string} testOutput The test output.
 * @param {boolean} passed Whether the test passed.
 */
function addResult(testInput, testOutput, passed) {
  var newEntry = document.createElement('p');
  var color = passed ? 'green' : 'red';
  newEntry.setAttribute('style', 'color: ' + color);
  newEntry.textContent = testInput + ' : ' + testOutput;
  $('test-result-display').appendChild(newEntry);
}

/**
 * Check whether the GetMinimalUrl method gives the expected output.
 * @param {string} testInput The input URL.
 * @param {string} expectedOutput The anticipated output URL.
 * @returns {boolean} Whether the result matches the output.
 */
function runMinimizerTest(testInput, expectedOutput) {
  var actualOutput = urlHandler.GetMinimalUrl(testInput);
  addResult(testInput, actualOutput, actualOutput === expectedOutput);
}

/**
 * Check whether the ReplaceUrl method gives the expected output.
 * @param {string} testInput The input URL.
 * @param {bool} expectedOutput The anticipated result.
 * @returns {boolean} Whether the result matches the output.
 */
function runGreenLockTest(testInput, expectedOutput) {
  var actualOutput = urlHandler.IsGreenLockSite(testInput);
  addResult(testInput, actualOutput, actualOutput === expectedOutput);
}

/**
 * Runs a set of tests with URLs.
 */
function runTests() {
  // Basic origin.
  runMinimizerTest('www.example.com', 'www.example.com');

  // Origin with a trailing slash.
  runMinimizerTest('www.example.com/', 'www.example.com');

  // Origin with a simple path.
  runMinimizerTest('www.example.com/path', 'www.example.com');

  // Origin with a longer path.
  runMinimizerTest('www.example.com/path.path/path/', 'www.example.com');

  // Origin with a mix of numbers and letters.
  runMinimizerTest('www.exa123mple.com', 'www.exa123mple.com');

  // Origin with scheme.
  runMinimizerTest('https://www.example.com', 'www.example.com');

  // Origin with scheme.
  runMinimizerTest('http://www.example.com', 'www.example.com');

  // Origin with non-standard scheme.
  runMinimizerTest('file://www.example.com', 'file://www.example.com');

  // Origin with standard port.
  runMinimizerTest('http://www.example.com:80', 'www.example.com');

  // Origin with non-standard port.
  runMinimizerTest('http://www.example.com:3000', 'www.example.com:3000');

  // chrome:// scheme.
  runMinimizerTest('chrome://interstitials', 'chrome://interstitials');

  // Check that whitelisting works.
  runGreenLockTest('https://www.google.com', true);
  runGreenLockTest('https://google.com', true);
  runGreenLockTest('https://mail.google.com', true);
  runGreenLockTest('https://googlefoo.com', false);
  runGreenLockTest('https://foogoogle.com', false);
  runGreenLockTest('https://googleqcom', false);
  runGreenLockTest('https://foo.com', false);
  runGreenLockTest('https://google.co.uk', true);
  runGreenLockTest('https://www.google.fr', true);

  // Check that blacklisting works.
  runGreenLockTest('https://images.google.com', false);
  runGreenLockTest('https://images.google.com/sldfkj', false);
}

document.addEventListener('DOMContentLoaded', runTests);
