/**
 * HTTP survey
 */

/**
 * Adds the questions for the HTTPS survey.
 * @param {object} parentNode The DOM node to attach the surveys to.
 */
function addQuestions(parentNode) {
  addQuestion(parentNode, commonQuestions.createNoticeSymbolQuestion());
  addQuestion(parentNode, commonQuestions.createSymbolMeaningQuestion());
  addQuestion(parentNode, commonQuestions.createDifferenceQuestion());
}

/**
 * Adds the screenshot for the survey.
 */
function setScreenshot() {
  switch (surveyDriver.operatingSystem) {
    case constants.OS.MAC:
      $('example-img').src = 'screenshots/http-mac.png';
      break;
    case constants.OS.LINUX:
      $('example-img').src = 'screenshots/http-linux.png';
      break;
    case constants.OS.WIN:
    case constants.OS.CROS:
    default:
      $('example-img').src = 'screenshots/http-win.png';
  }
}
