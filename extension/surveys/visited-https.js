/**
 * HTTP survey
 */

/**
 * Adds the questions for the HTTPS survey.
 * @param {object} parentNode The DOM node to attach the surveys to.
 */
function addQuestions(parentNode) {
  addQuestion(parentNode, commonQuestions.createHttpsNoticeSymbolQuestion());
  addQuestion(parentNode, commonQuestions.createHttpsSymbolMeaningQuestion());
  addQuestion(parentNode, commonQuestions.createDifferenceQuestion());
}

/**
 * Adds the screenshot for the survey.
 */
function setScreenshot() {
  switch (surveyDriver.operatingSystem) {
    case constants.OS.MAC:
      $('example-img').src = 'screenshots/https-mac.png';
      break;
    case constants.OS.LINUX:
      $('example-img').src = 'screenshots/https-linux.png';
      break;
    case constants.OS.WIN:
    case constants.OS.CROS:
    default:
      $('example-img').src = 'screenshots/https-win.png';
  }
  $('example-img').style.width = 'auto';
  $('example-img').style.height = 'auto';

  // For HTTP/HTTPS, we also want to update the caption.
  $('saw-a-page').textContent =
      'You just now saw a URL bar, like the one shown above.';
  $('following-questions').textContent =
      'The following questions are about the URL bar.';
}
