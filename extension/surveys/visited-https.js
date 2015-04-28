/**
 * HTTP survey
 */

/**
 * Adds the questions for the HTTPS survey.
 * @param {object} parentNode The DOM node to attach the surveys to.
 */
function addQuestions(parentNode) {
  addQuestion(parentNode, commonQuestions.createPlaceholderHTTPSurvey());
}

/**
 * Adds the screenshot for the survey.
 */
function setScreenshot() {
  $('example-img').src = 'screenshots/ssl-nonoverridable.png';
}
