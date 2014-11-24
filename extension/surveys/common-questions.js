/**
 * Defines common questions that are repeated across surveys.
 */

var commonQuestions = {};

/**
 * How did you choose between the two options?
 * @param {string} The option that the user chose.
 * @param {string} The option that the user didn't choose.
 * @returns {object} The DOM subtree with the question.
 */
commonQuestions.createProceedChoiceQuestion = function(chosen, alternative) {
  var howChoose = new EssayQuestion(
      constants.QuestionType.LONG_ESSAY,
      'You chose "' + chosen + '" instead of "' + alternative + '."' +
          ' How did you choose between the two options?',
      true);
  return howChoose.makeDOMTree();
};

/**
 * Why did you choose not to proceed to <website>?
 * @param {string} The option that the user may have chosen, 
 *     without enclosing quotes.
 * @returns {object} The DOM subtree with the question.
*/
commonQuestions.createNotProceedChoiceQuestion = function(chosen) {
  var howChoose = new EssayQuestion(
      constants.QuestionType.LONG_ESSAY,
      'You chose the "' + chosen + '"option, or you closed the page.' +
      ' Why did you choose not to proceed to ' + surveySetup.QuestionUrl +
      '?', true);
  return howChoose.makeDOMTree();
};

/**
 * What was the page trying to tell you?
 * @returns {object} The DOM subtree with the question.
 */
commonQuestions.createPageMeaningQuestion = function() {
  var meaning = new EssayQuestion(
      constants.QuestionType.LONG_ESSAY,
      'What was the page trying to tell you, in your own words?',
      true);
  return meaning.makeDOMTree();
};

/**
 * Who do you think the page was from?
 * @returns {object} The DOM subtree with the question.
 */
commonQuestions.createPageSourceQuestion = function() {
  var source = new FixedQuestion(
      constants.QuestionType.RADIO,
      'Who do you think the page was from?',
      true,
      [
        'Chrome (my browser)', 
        'A hacker', 
        'Windows', 
        surveySetup.QuestionUrl,
        constants.OTHER
      ],
      constants.Randomize.ANCHOR_LAST););
  return source.makeDOMTree();
};

/**
 * Have you visited example.com before?
 * @returns {object} The DOM subtree with the question.
 */
commonQuestions.createHistoryQuestions = function() {
  var hist = new FixedQuestion(
      constants.QuestionType.RADIO,
      'Have you visited ' + surveySetup.QuestionUrl + ' before?',
      true,
      ['Yes', 'No', 'I don\'t know'],
      constants.Randomize.ANCHOR_LAST);
  var errorBefore = new FixedQuestion(
      constants.QuestionType.RADIO,
      'Have you seen a page like the one pictured above when trying to visit ' +
          surveySetup.QuestionUrl + ' before?',
      true,
      ['Yes', 'No', 'I don\'t know'],
      constants.Randomize.ANCHOR_LAST);
  hist.addDependentQuestion(errorBefore, 'Yes');
  return hist.makeDOMTree();
};

/**
 * What led you to the page?
 * @returns {object} The DOM subtree with the question.
 */
commonQuestions.createReferrerQuestion = function() {
  var referrer = new FixedQuestion(
      constants.QuestionType.RADIO,
      'What led you to the page?',
      true,
      [
        'Entered or typed a URL',
        'Used a search engine',
        'Clicked link from an email message',
        'Clicked link in a chat window',
        'Clicked link on a web page',
        constants.OTHER
      ],
      constants.Randomize.ANCHOR_LAST);
  return referrer.makeDOMTree();
};

/**
 * Do you have an account on example.com?
 * @returns {object} The DOM subtree with the question.
 */
commonQuestions.createAccountQuestion = function() {
  var account = new FixedQuestion(
      constants.QuestionType.RADIO,
      'Do you have an account on ' + surveySetup.QuestionUrl + '?',
      true,
      ['Yes', 'No', 'I\'m not sure', 'I prefer not to answer'],
      constants.Randomize.ANCHOR_LAST);
  return account.makeDOMTree();
};

/**
 * Were you trying to visit example.com when you saw the page instead?
 * @returns {object} The DOM subtree with the question.
 */
commonQuestions.createVisitQuestion = function() {
  var visit = new FixedQuestion(
      constants.QuestionType.RADIO,
      'Were you trying to visit ' + surveySetup.QuestionUrl +
           'when you saw the page instead?',
      true,
      ['Yes', 'No', 'I\'m not sure', 'I prefer not to answer'],
      constants.Randomize.ANCHOR_LAST);
  return visit.makeDOMTree();
};

/**
 * How much do you trust example.com?
 * @returns {object} The DOM subtree with the question.
 */
commonQuestions.createTrustQuestion = function() {
  var trust = new FixedQuestion(
      constants.QuestionType.VERTICAL_SCALE,
      'How much do you trust ' + surveySetup.QuestionUrl + '?',
      true,
      [
        'Strongly distrust',
        'Somewhat distrust',
        'Neither trust nor distrust',
        'Somewhat trust',
        'Strongly trust'
      ],
      constants.Randomize.ALL);
  return trust.makeDOMTree();
};

/**
 * Rank how much the attributes describe the page.
 * @returns {object} The DOM subtree with the question.
 */
commonQuestions.createAttributesQuestion = function() {
  var attributes = new ScaleQuestion(
      constants.QuestionType.MULT_HORIZ_SCALE,
      'To what degree do each of the following adjectives describe this page?',
      true,
      [
        'Not at all',
        'A little bit',
        'A moderate amount',
        'Very much',
        'A great deal'
      ],
      constants.Randomize.ALL);
  attributes.setAttributes(
      [
        'annoying',
        'comforting',
        'scary',
        'helpful',
        'confusing',
        'informative'
      ]);
  return attributes.makeDOMTree();
};

/**
 * Record the URL?
 * @returns {object} The DOM subtree with the question.
 */
commonQuestions.createRecordUrlQuestion = function() {
  var url = new FixedQuestion(
      constants.QuestionType.RADIO,
      'May we record the URL of the website you were trying to visit, ' +
          surveySetup.QuestionUrl + ', with your responses?',
      true,
      ['Yes', 'No'],
      constants.Randomize.NONE);
  return url.makeDOMTree();
};

/**
 * Anything else?
 * @returns {object} The DOM subtree with the question.
 */
commonQuestions.createClarificationQuestion = function() {
  var extra = new EssayQuestion(
      constants.QuestionType.SHORT_ESSAY,
      'Please use this space to clarify any of your responses from above or ' +
          'let us know how we can improve this survey.',
      false);
  return extra.makeDOMTree();
};
