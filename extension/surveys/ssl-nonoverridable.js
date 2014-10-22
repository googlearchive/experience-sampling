/**
 * SSL non-overridable survey.
 */

/**
 * Adds the questions for the SSL survey.
 * @param {object} parentNode The DOM node to attach the surveys to.
 */
function addQuestions(parentNode) {
  parentNode.appendChild(commonQuestions.createPageMeaningQuestion());
  parentNode.appendChild(commonQuestions.createPageSourceQuestion());
  parentNode.appendChild(commonQuestions.createPreviousVisitQuestion());
  parentNode.appendChild(commonQuestions.createPreviousExposureQuestion());
  parentNode.appendChild(commonQuestions.createReferrerQuestion());
  parentNode.appendChild(commonQuestions.createAttributesQuestion());
  parentNode.appendChild(commonQuestions.createRecordUrlQuestion());
  parentNode.appendChild(commonQuestions.createClarificationQuestion());
}
