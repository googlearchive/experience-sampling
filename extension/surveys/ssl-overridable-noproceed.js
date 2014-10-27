/**
 * SSL overridable (didn't proceed) survey.
 */

/**
 * Adds the questions for the SSL survey.
 * @param {object} parentNode The DOM node to attach the surveys to.
 */
function addQuestions(parentNode) {
  parentNode.appendChild(commonQuestions.createChoiceQuestion(
      'Back to safety', 'Proceed to ' + surveySetup.QuestionUrl));

  parentNode.appendChild(commonQuestions.createPageMeaningQuestion());
  parentNode.appendChild(commonQuestions.createPageSourceQuestion());
  parentNode.appendChild(commonQuestions.createHistoryQuestions());
  parentNode.appendChild(commonQuestions.createReferrerQuestion());
  parentNode.appendChild(commonQuestions.createAttributesQuestion());
  parentNode.appendChild(commonQuestions.createRecordUrlQuestion());
  parentNode.appendChild(commonQuestions.createClarificationQuestion());
}

/**
 * Adds the screenshot for the survey.
 */
function setScreenshot() {
  $('example-img').src = 'screenshots/ssl.png';
}
