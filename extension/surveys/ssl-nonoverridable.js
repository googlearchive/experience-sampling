/**
 * SSL non-overridable survey.
 */

/**
 * Adds the questions for the SSL survey.
 * @param {object} parentNode The DOM node to attach the surveys to.
 */
function addQuestions(parentNode) {
  addQuestion(parentNode, commonQuestions.createPageMeaningQuestion());
  addQuestion(parentNode, commonQuestions.createPageSourceQuestion());
  addQuestion(parentNode, commonQuestions.createHistoryQuestions());
  addQuestion(parentNode, commonQuestions.createReferrerQuestion());
  addQuestion(parentNode, commonQuestions.createAttributesQuestion());
  addQuestion(parentNode, commonQuestions.createRecordUrlQuestion());
  addQuestion(parentNode, commonQuestions.createClarificationQuestion());
}

/**
 * Adds the screenshot for the survey.
 */
function setScreenshot() {
  $('example-img').src = 'screenshots/ssl.png';
}
