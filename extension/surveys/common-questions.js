/**
 * Defines common questions that are repeated across surveys.
 */

var commonQuestions = {};

/**
 * What website were you trying to visit when the page was displayed?
 * @returns {object} The DOM subtree with the question.
*/
commonQuestions.createWhatWebsiteQuestion = function() {
  var whatWebsite = new EssayQuestion(
      constants.QuestionType.LONG_ESSAY,
      'What website were you trying to visit when the page (shown above)' +
          ' was displayed?',
      true);
  return whatWebsite;
};

/**
 * How did you choose between the two options? Note that the options should be
 * flipped for the proceed & no-proceed scenarios.
 * @param {string} The option that the user chose.
 * @param {string} The option that the user didn't choose.
 * @returns {object} The DOM subtree with the question.
 */
commonQuestions.createChoiceQuestion = function(chosen, alternative) {
  var howChoose = new EssayQuestion(
      constants.QuestionType.LONG_ESSAY,
      'You chose "' + chosen + '" instead of "' + alternative + '."' +
      ' How did you choose between the two options?',
      true);
  howChoose.setPlaceholder('You chose "[CHOSEN]" instead of "[ALTERNATIVE]."' +
      ' How did you choose between the two options?');
  return howChoose;
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
      'You chose the "' + chosen + '" option, or you closed the page' +
      ' (shown above).' +
      ' Why did you choose not to proceed to ' + surveyDriver.questionUrl +
      '?', true);
  howChoose.setPlaceholder(
      'You chose the "' + chosen + '" option, or you closed the' +
      ' page (shown above).' +
      ' Why did you choose not to proceed to [URL]?');
  return howChoose;
};

/**
 * What was the page trying to tell you?
 * @returns {object} The DOM subtree with the question.
 */
commonQuestions.createPageMeaningQuestion = function() {
  var meaning = new EssayQuestion(
      constants.QuestionType.LONG_ESSAY,
      'What was the page (shown above) trying to tell you, in your own words?',
      true);
  return meaning;
};

/**
 * What was the dialog trying to tell you?
 * This variant is for extension/app install dialogs.
 * @returns {object} The DOM subtree with the question.
 */
commonQuestions.createDialogMeaningQuestion = function() {
  var meaning = new EssayQuestion(
      constants.QuestionType.LONG_ESSAY,
      'What was the dialog (shown above) trying to tell you, in your own' +
      ' words?',
      true);
  return meaning;
};

/**
 * Who do you think the page was from?
 * @returns {object} The DOM subtree with the question.
 */
commonQuestions.createPageSourceQuestion = function() {
  var source = new FixedQuestion(
      constants.QuestionType.RADIO,
      'Who was the page (shown above) from?',
      true,
      [
        'Chrome (my browser)',
        'A hacker',
        prettyPrintOS(),
        surveyDriver.questionUrl,
        'I don\'t know',
        constants.OTHER
      ],
      constants.Randomize.ANCHOR_LAST_TWO);
  return source;
};

/**
 * Who do you think the dialog was from?
 * This variant is for extension/app install dialogs. 
 * @returns {object} The DOM subtree with the question.
 */
commonQuestions.createDialogSourceQuestion = function() {
  var source = new FixedQuestion(
      constants.QuestionType.RADIO,
      'Who was the dialog (shown above) from?',
      true,
      [
        'Chrome (my browser)',
        'A hacker',
        prettyPrintOS(),
        'I don\'t know',
        constants.OTHER
      ],
      constants.Randomize.ANCHOR_LAST_TWO);
  return source;
};

/**
 * Have you visited example.com before?
 * @returns {object} The DOM subtree with the question.
 */
commonQuestions.createHistoryQuestions = function() {
  var hist = new FixedQuestion(
      constants.QuestionType.RADIO,
      'Have you visited ' + surveyDriver.questionUrl + ' before?',
      true,
      ['Yes', 'No', 'I don\'t know'],
      constants.Randomize.ANCHOR_LAST);
  hist.setPlaceholder('Have you visited [URL] before?');
  var errorBefore = new FixedQuestion(
      constants.QuestionType.RADIO,
      'Have you seen a page like the one shown above when trying to visit ' +
          surveyDriver.questionUrl + ' before?',
      true,
      ['Yes', 'No', 'I don\'t know'],
      constants.Randomize.ANCHOR_LAST);
  errorBefore.setPlaceholder(
      'Have you seen a page like the one shown above when trying to visit ' +
      '[URL] before?');
  hist.addDependentQuestion(errorBefore, 'Yes');
  return hist;
};

/**
 * What led you to the page?
 * @returns {object} The DOM subtree with the question.
 */
commonQuestions.createReferrerQuestion = function() {
  var referrer = new FixedQuestion(
      constants.QuestionType.RADIO,
      'What led you to the page (shown above)?',
      true,
      [
        'Entered or typed a URL',
        'Used a search engine',
        'Clicked link from an email message',
        'Clicked link in a chat window',
        'Clicked link on a web page',
        'I don\'t know',
        constants.OTHER
      ],
      constants.Randomize.ANCHOR_LAST_TWO);
  return referrer;
};

/**
 * What led you to install the extension or app mentioned in the dialog?
 * This variant is for extension/app install dialogs.
 * @returns {object} The DOM subtree with the question.
 */
commonQuestions.createDialogReferrerQuestion = function() {
  var referrer = new EssayQuestion(
      constants.QuestionType.LONG_ESSAY,
      'What led you to try to install the extension or app mentioned' +
      ' in the dialog (shown above)?',
      true);
  return referrer;
};

/**
 * Do you have an account on example.com?
 * @returns {object} The DOM subtree with the question.
 */
commonQuestions.createAccountQuestion = function() {
  var account = new FixedQuestion(
      constants.QuestionType.RADIO,
      'Do you have an account on ' + surveyDriver.questionUrl + '?',
      true,
      ['Yes', 'No', 'I\'m not sure', constants.NO_ANSWER],
      constants.Randomize.ANCHOR_LAST);
  account.setPlaceholder('Do you have an account on [URL]?');
  return account;
};

/**
 * Were you trying to visit example.com when you saw the page instead?
 * @returns {object} The DOM subtree with the question.
 */
commonQuestions.createVisitQuestion = function() {
  var visit = new FixedQuestion(
      constants.QuestionType.RADIO,
      'Were you trying to visit ' + surveyDriver.questionUrl + '?',
      true,
      ['Yes', 'No', 'I\'m not sure', constants.NO_ANSWER],
      constants.Randomize.ANCHOR_LAST);
  visit.setPlaceholder('Were you trying to visit [URL] when you saw the page' +
      ' (shown above) instead?');
  return visit;
};

/**
 * How much do you trust example.com?
 * @returns {object} The DOM subtree with the question.
 */
commonQuestions.createTrustQuestion = function() {
  var trust = new ScaleQuestion(
      constants.QuestionType.VERTICAL_SCALE,
      'How much do you trust ' + surveyDriver.questionUrl + '?',
      true,
      [
        'Strongly distrust',
        'Somewhat distrust',
        'Neither trust nor distrust',
        'Somewhat trust',
        'Strongly trust',
        'I don\'t know'
      ],
      constants.Randomize.ANCHOR_LAST);
  trust.setPlaceholder('How much do you trust [URL]?');
  return trust;
};

/**
 * Rank how much the attributes describe the page.
 * @returns {object} The DOM subtree with the question.
 */
commonQuestions.createAttributesQuestion = function() {
  var attributes = new ScaleQuestion(
      constants.QuestionType.MULT_HORIZ_SCALE,
      'To what degree do each of the following adjectives describe this' +
      ' page (shown above)?',
      true,
      [
        'Not at all',
        'A little bit',
        'A moderate amount',
        'A lot',
        'A great deal',
        'I\'m not sure'
      ],
      constants.Randomize.ANCHOR_LAST);
  attributes.setAttributes(
      [
        'annoying',
        'comforting',
        'scary',
        'helpful',
        'confusing',
        'informative'
      ]);
  return attributes;
};

/**
 * Rank how much the attributes describe the dialog.
 * This variant is for extension/app install dialogs.
 * @returns {object} The DOM subtree with the question.
 */
commonQuestions.createDialogAttributesQuestion = function() {
  var attributes = new ScaleQuestion(
      constants.QuestionType.MULT_HORIZ_SCALE,
      'To what degree do each of the following adjectives describe the' +
      ' dialog (shown above)?',
      true,
      [
        'Not at all',
        'A little bit',
        'A moderate amount',
        'A lot',
        'A great deal',
        'I\'m not sure'
      ],
      constants.Randomize.ANCHOR_LAST);
  attributes.setAttributes(
      [
        'annoying',
        'comforting',
        'scary',
        'helpful',
        'confusing',
        'informative'
      ]);
  return attributes;
};

/**
 * Record the URL?
 * @returns {object} The DOM subtree with the question.
 */
commonQuestions.createRecordUrlQuestion = function() {
  var url = new FixedQuestion(
      constants.QuestionType.RADIO,
      'May we record the URL of the website you were trying to visit, ' +
          surveyDriver.questionUrl + ', with your responses?',
      true,
      ['Yes', 'No'],
      constants.Randomize.NONE);
  url.setPlaceholder(
      'May we record the URL of the website you were trying to visit, ' +
      '[URL], with your responses?');
  return url;
};

/**
 * What is the name of the extension or app you were trying to install?
 * @returns {object} The DOM subtree with the question.
 */ 
commonQuestions.createExtensionNameQuestion = function() {
  var extensionName = new EssayQuestion(
      constants.QuestionType.SHORT_STRING,
      'What is the name of the extension or app you were trying to install?',
      false);
  return extensionName;
}

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
  return extra;
};

/**
 * Did you notice the symbol on the left?
 * @returns {object} The DOM subtree with the question.
 */
commonQuestions.createHttpNoticeSymbolQuestion = function() {
  var symbol = new FixedQuestion(
      constants.QuestionType.RADIO,
      'Have you ever noticed a white symbol next to the URL before?',
      true,
      ['Yes', 'No', 'I\'m not sure', constants.NO_ANSWER],
      constants.Randomize.ANCHOR_LAST);
  symbol.setPlaceholder('Have you ever noticed the symbol on the left of the ' +
      'screenshot?');
  return symbol;
};

/**
 * Did you notice the symbol on the left?
 * @returns {object} The DOM subtree with the question.
 */
commonQuestions.createHttpsNoticeSymbolQuestion = function() {
  var symbol = new FixedQuestion(
      constants.QuestionType.RADIO,
      'Have you ever noticed a green symbol next to the URL before?',
      true,
      ['Yes', 'No', 'I\'m not sure', constants.NO_ANSWER],
      constants.Randomize.ANCHOR_LAST);
  symbol.setPlaceholder('Have you ever noticed the symbol on the left of the ' +
      'screenshot?');
  return symbol;
};


/**
 * What does the symbol mean?
 * @returns {object} The DOM subtree with the question.
 */
commonQuestions.createHttpSymbolMeaningQuestion = function() {
  var symbol = new EssayQuestion(
      constants.QuestionType.SHORT_ESSAY,
      'What does the white symbol next to the URL make you think of?',
      false);
  symbol.setPlaceholder('What does the symbol make you think of?');
  return symbol;
};

/**
 * What does the symbol mean?
 * @returns {object} The DOM subtree with the question.
 */
commonQuestions.createHttpsSymbolMeaningQuestion = function() {
  var symbol = new EssayQuestion(
      constants.QuestionType.SHORT_ESSAY,
      'What does the green symbol next to the URL make you think of?',
      false);
  symbol.setPlaceholder('What does the symbol make you think of?');
  return symbol;
};

/**
 * Would you expect a difference between http://site and https://site?
 * @returns {object} The DOM subtree with the question.
 */
commonQuestions.createDifferenceQuestion = function() {
  var difference = new EssayQuestion(
      constants.QuestionType.SHORT_ESSAY,
      'Would you expect a difference between http://' +
          surveyDriver.questionUrl + ' and https://' +
          surveyDriver.questionUrl + '?',
      false);
  difference.setPlaceholder('What does the symbol make you think of?');
  return difference;
};
