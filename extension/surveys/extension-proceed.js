/**
 * Extension (did install) survey.
 */

/**
 * Adds the questions for the example survey.
 * @param {object} parentNode The DOM node to attach the surveys to.
 */
function addQuestions(parentNode) {
  addQuestion(parentNode, commonQuestions.createChoiceQuestion(
      'Add', 'Cancel'));
  addQuestion(parentNode, commonQuestions.createDialogMeaningQuestion());
  addQuestion(parentNode, commonQuestions.createDialogSourceQuestion());
  addQuestion(parentNode, commonQuestions.createDialogReferrerQuestion());
  addQuestion(parentNode, commonQuestions.createDialogAttributesQuestion());
  addQuestion(parentNode, commonQuestions.createExtensionNameQuestion());
  addQuestion(parentNode, commonQuestions.createClarificationQuestion());
}

/**
 * Adds the screenshot for the survey.
 */
function setScreenshot() {
  switch (surveyDriver.operatingSystem) {
    case constants.OS.MAC:
      $('example-img').src = 'screenshots/extension-mac.png';
      $('example-img').style.width = 'auto';
      $('example-img').style.height = 'auto';
      break;
    case constants.OS.LINUX:
      $('example-img').src = 'screenshots/extension-linux.png';
      break;
    case constants.OS.WIN:
    case constants.OS.CROS:
    default:
      $('example-img').src = 'screenshots/extension-win.png';
  }

  // For extensions, we also want to update the caption.
  $('saw-a-page').textContent =
      'You just now saw a dialog like the one shown above.';
  $('following-questions').textContent =
      'The following questions are about that dialog.';
}
