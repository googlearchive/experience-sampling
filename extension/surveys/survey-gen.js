/**
 * Provides the prototypes for dynamically creating survey questions.
 */

/**
 * Represents a survey question.
 * @constructor
 * @param {string} questionType Question presentation (constants.QuestionType).
 * @param {string} question The question to be asked.
 * @param {boolean} required Whether the question needs to be answered.
 */
function Question(questionType, question, required) {
  this.questionType = questionType;
  this.question = question;
  this.required = required;
  this.userResponse = "";
}

/**
 * Stores the answer chosen by the user. Should be used after the respondent
 * has submitted the survey form.
 * @param {string} The text of the user's answer.
 */
Question.prototype.setUserResponse = function (response) {
  this.userResponse = response;
};


/**
 * Creates the DOM representation of a question. This should be implemented
 * by any subclasses!
 * @return {Object} The DOM node that contains the question.
 */
Question.prototype.makeDOMTree = function() {
  return document.createElement('div');
};

// FIXED

/**
 * Represents questions with a fixed set of non-scale responses. Currently
 * supports CHECKBOX, RADIO, and DROPDOWN question types. If randomized, the
 * full list will be ordered pseudorandomly.
 * @param {string} questionType Question presentation (constants.QuestionType).
 * @param {string} question The question to be asked.
 * @param {boolean} required Whether the question needs to be answered.
 * @param {Array.string} answers The list of answers to be shown.
 * @param {boolean} randomize Whether to randomize the question order.
 */
function Fixed(questionType, question, required, answers, randomize) {
  Question.call(this, questionType, question, required);
  this.answers = answers;
  this.randomize = randomize;
}

Fixed.prototype = Object.create(Question.prototype);
Fixed.prototype.constructor = Fixed;

/**
 * Creates the DOM representation of a Fixed question.
 * @return {Object} The DOM node that contains the question.
 */
// TODO(felt): Implement answer randomization.
Fixed.prototype.makeDOMTree = function() {
  var container = document.createElement('div');
  container.classList.add('fieldset');

  var legend = document.createElement('legend');
  legend.innerText = this.question;
  container.appendChild(legend);

  var shrunkenQuestion = shrink(this.question);
  if (this.questionType == constants.QuestionType.CHECKBOX ||
      this.questionType == constants.QuestionType.RADIO) {
    for (var i = 0; i < this.answers.length; i++) {
      var shrunkenAnswer = i + '-' + shrink(this.answers[i]);
      var input = document.createElement('input');
      input.setAttribute('id', shrunkenAnswer);
      input.setAttribute('name', shrunkenQuestion);
      input.setAttribute('type', this.questionType);
      input.setAttribute('value', shrunkenAnswer);
      input.setAttribute('required', this.required);
      container.appendChild(input);

      var label = document.createElement('label');
      label.setAttribute('for', shrunkenAnswer);
      label.innerText = this.answers[i];
      container.appendChild(label);

      if (this.answers[i] == constants.OTHER) {
        var textInput = document.createElement('input');
        textInput.setAttribute('type', 'text');
        textInput.setAttribute('name', shrunkenAnswer);
        container.appendChild(textInput);
      }

      if (i < this.answers.length - 1)
        container.appendChild(document.createElement('br'));
    }
  } else if (this.questionType == constants.QuestionType.DROPDOWN) {
    var select = document.createElement('select');
    for (var i = 0; i < this.answers.length; i++) {
      var option = document.createElement('option');
      option.value = i + '-' + shrink(this.answers[i]);
      option.innerText = this.answers[i];
      select.appendChild(option);
    }
    container.appendChild(select);
  } else {
    throw new Error('Question "' + this.question + '" has an unexpected ' +
      'question type: ' + this.questionType);
  }
  return container;
}

// SCALE

// TODO(felt): Implement and document this.
function Scale(questionType, question, required, direction, labels, randomize) {
  Question.call(this, questionType, question, required);
}

Scale.prototype = Object.create(Question.prototype);
Scale.prototype.constructor = Scale;

// ESSAY

// TODO(felt): Implement and document this.
function Essay(questionType, question, required) {
  Question.call(this, questionType, question, required);
}

Essay.prototype = Object.create(Question.prototype);
Essay.prototype.constructor = Essay;

// HELPER METHODS

/**
 * Turns the full string into a short name for a value property. It does this
 * by removing all non-alphabetic characters and truncating to 40 characters.
 * @param {string} The original input answer.
 * @returns {string} The shrunken version of the answer.
 */
function shrink(answer) {
  return answer.replace(/[\W\s]+/g, '').substring(0, 40);
}

/**
 * Creates a submit button for a form.
 * @returns {Object} The DOM node with the submit button.
 */
function makeSubmitButtonDOM() {
  var button = document.createElement('input');
  button.setAttribute('id', 'submit-button');
  button.setAttribute('type', 'submit');
  button.setAttribute('value', 'Submit');

  var fieldset = document.createElement('fieldset');
  fieldset.classList.add('submit');
  fieldset.appendChild(button);
  return fieldset;
}
