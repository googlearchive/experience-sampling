/**
 * Adapted from driver.js. These functions are needed for testing, but 
 * including the whole driver.js file in SpecRunner.html causes a redirect
 * to consent.html, so testing is prevented.
 */

var surveyDriver = {};
surveyDriver.questionUrl = 'example.com';

// See driver.js for documentation.
function addQuestion(parentNode, question) {
  parentNode.appendChild(question.makeDOMTree());
}

// See driver.js for documentation.
function prettyPrintOS() {
  switch (surveyDriver.operatingSystem) {
    case constants.OS.MAC:
      return 'Mac OS X';
    case constants.OS.WIN:
      return 'Windows';
    case constants.OS.CROS:
      return 'Chrome OS';
    case constants.OS.LINUX:
      return 'Linux';
    case constants.OS.OTHER:
    default:
      return 'Your operating system';
  }
  return 'Your operating system';
}
