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
 * Check whether the ReplaceUrl method gives the expected output.
 * @param {string} testInput The input URL.
 * @param {string} expectedOutput The anticipated output URL.
 * @returns {boolean} Whether they result matches the output.
 */
function runTest(testInput, expectedOutput) {
  var actualOutput = urlHandler.GetMinimalUrl(testInput);
  addResult(testInput, actualOutput, actualOutput === expectedOutput);
}

/**
 * Runs a set of tests with URLs.
 */
function runTests() {
  // Basic origin.
  runTest('www.example.com', 'www.example.com');

  // Origin with a trailing slash.
  runTest('www.example.com/', 'www.example.com');

  // Origin with a simple path.
  runTest('www.example.com/path', 'www.example.com');

  // Origin with a longer path.
  runTest('www.example.com/path.path/path/', 'www.example.com');

  // Origin with a mix of numbers and letters.
  runTest('www.exa123mple.com', 'www.exa123mple.com');

  // Origin with scheme.
  runTest('https://www.example.com', 'www.example.com');

  // Origin with scheme.
  runTest('http://www.example.com', 'www.example.com');

  // Origin with non-standard scheme.
  runTest('file://www.example.com', 'file://www.example.com');

  // Origin with missing scheme.
  runTest('://www.example.com', '');

  // Origin with standard port.
  runTest('http://www.example.com:80', 'www.example.com');

  // Origin with non-standard port.
  runTest('http://www.example.com:3000', 'www.example.com:3000');

  // Origin with 
}

document.addEventListener('DOMContentLoaded', runTests);
