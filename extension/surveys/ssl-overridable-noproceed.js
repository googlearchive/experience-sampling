/**
 * SSL overridable (didn't proceed) survey.
 */

/**
 * Adds the questions for the SSL survey.
 * @param {object} parentNode The DOM node to attach the surveys to.
 */
function addQuestions(parentNode) {
  // TODO: FILL IN CORRECT WEBSITE NAME!
  parentNode.appendChild(commonQuestions.createChoiceQuestion(
      'Back to safety', 'Proceed to www.example.com'));

  parentNode.appendChild(commonQuestions.createPageMeaningQuestion());
  parentNode.appendChild(commonQuestions.createPageSourceQuestion());
  parentNode.appendChild(commonQuestions.createPreviousVisitQuestion());
  parentNode.appendChild(commonQuestions.createPreviousExposureQuestion());
  parentNode.appendChild(commonQuestions.createReferrerQuestion());
  parentNode.appendChild(commonQuestions.createAttributesQuestion());
  parentNode.appendChild(commonQuestions.createRecordUrlQuestion());
  parentNode.appendChild(commonQuestions.createClarificationQuestion());
}
