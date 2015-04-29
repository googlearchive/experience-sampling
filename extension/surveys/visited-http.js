/**
 * HTTP survey
 */

/**
 * Adds the questions for the HTTPS survey.
 * @param {object} parentNode The DOM node to attach the surveys to.
 */
function addQuestions(parentNode) {
  addQuestion(parentNode, commonQuestions.createHttpNoticeSymbolQuestion());
  addQuestion(parentNode, commonQuestions.createHttpSymbolMeaningQuestion());
  addQuestion(parentNode, commonQuestions.createDifferenceQuestion());
}

/**
 * Adds the screenshot for the survey.
 */
function setScreenshot() {
  switch (surveyDriver.operatingSystem) {
    case constants.OS.MAC:
    case constants.OS.CROS:
      $('example-img').src = 'screenshots/http-mac.png';
      break;
    case constants.OS.LINUX:
      $('example-img').src = 'screenshots/http-linux.png';
      break;
    case constants.OS.WIN:
    default:
      $('example-img').src = 'screenshots/http-win.png';
  }
  $('example-img').style.width = 'auto';
  $('example-img').style.height = 'auto';

  // For HTTP/HTTPS, we also want to update the caption.
  $('saw-a-page').textContent =
      'You just now saw a URL bar, like the one shown above.';
  $('following-questions').textContent =
      'The following questions are about the URL bar.';
}
