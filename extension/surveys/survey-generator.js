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
  this.isDependentChild = false;
}

/**
 * Stores the answer chosen by the user. Should be used after the respondent
 * has submitted the survey form.
 * @param {string} The text of the user's answer.
 */
Question.prototype.setUserResponse = function(response) {
  this.userResponse = response;
};

/**
 * Creates the DOM representation of a question. This should be implemented
 * by any subclasses!
 * @return {object} The DOM node that contains the question.
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
 * @param {String} randomize Type of randomization (constants.Randomize).
 */
function FixedQuestion(
    questionType, question, required, answers, randomize) {
  Question.call(this, questionType, question, required);
  this.answers = answers;
  this.randomize = randomize;
}

FixedQuestion.prototype = Object.create(Question.prototype);
FixedQuestion.prototype.constructor = FixedQuestion;

/**
 * Attaches a dependent question to this one. The dependent question will only
 * be shown when the user selects a specific fixed answer. |this| is the parent.
 * @param {object} child The question conditional on this one.
 * @param {string} answer Show the conditional when this answer is selected.
 */
FixedQuestion.prototype.addDependentQuestion = function(child, answer) {
  this.depChild = child;
  this.depChildAnswer = answer;
  child.isDependentChild = true;
};

/**
 * Creates the DOM representation of a FixedQuestion question.
 * @return {object} The DOM node that contains the question.
 */
FixedQuestion.prototype.makeDOMTree = function() {
  var container = document.createElement('div');
  if (this.isDependentChild) {
    container.classList.add('hidden');
    container.classList.add('dependent');
    this.required = false;  // Children might be hidden.
  } else {
    container.classList.add('fieldset');
  }

  var legend = document.createElement('legend');
  legend.textContent = this.question;
  container.appendChild(legend);

  var shrunkenQuestion = getDomNameFromValue(this.question);
  switch (this.questionType) {
    case constants.QuestionType.CHECKBOX:
    case constants.QuestionType.RADIO:
      var answerChoices = [];
      for (var i = 0; i < this.answers.length; i++) {
        var answer = document.createElement('div');
        var shrunkenAnswer = i + '-' + getDomNameFromValue(this.answers[i]) +
            '-' + shrunkenQuestion;
        var input = document.createElement('input');
        input.setAttribute('id', shrunkenAnswer);
        input.setAttribute('name', shrunkenQuestion);
        input.setAttribute('type', this.questionType);
        input.setAttribute('value', shrunkenAnswer);
        if (this.required) {
          input.setAttribute('required', this.required);
          if (this.questionType === constants.QuestionType.CHECKBOX) {
            // By default, HTML5 requires *all* of the checkboxes to be checked
            // for submission. Since we only want one of a group to be
            // submitted, remove the requirement once one is checked.
            input.addEventListener('change', function removeRequired(unused) {
              var elems = document.getElementsByName(shrunkenQuestion);
              for (var i = 0; i < elems.length; i++) {
                elems[i].removeAttribute('required');
                elems[i].removeEventListener('click', removeRequired);
              }
            });
          }
        }
        answer.appendChild(input);

        var label = document.createElement('label');
        label.setAttribute('for', shrunkenAnswer);
        label.textContent = this.answers[i];
        answer.appendChild(label);

        if (this.answers[i] == constants.OTHER) {
          var textInput = document.createElement('input');
          textInput.setAttribute('type', 'text');
          textInput.setAttribute('name', shrunkenAnswer);
          answer.appendChild(textInput);
        }

        if (this.depChild && this.depChildAnswer === this.answers[i]) {
          var dependentQuestion = getDomNameFromValue(this.depChild.question);
          input.addEventListener('change', function(unused) {
            $(dependentQuestion).classList.remove('hidden');
          });
        } else if (this.depChild) {
          var dependentQuestion = getDomNameFromValue(this.depChild.question);
          input.addEventListener('change', function(unused) {
            $(dependentQuestion).classList.add('hidden');
          });
        }
        answerChoices.push(answer);
      }
      if (this.randomize != constants.Randomize.NONE)
        answerChoices = knuthShuffle(answerChoices, this.randomize);
      for (var i = 0; i < answerChoices.length; i++)
        container.appendChild(answerChoices[i]);
      break;
    case constants.QuestionType.DROPDOWN:
      var select = document.createElement('select');
      select.setAttribute('name', shrunkenQuestion);
      var depAnswer;
      var answerChoices = [];
      for (var i = 0; i < this.answers.length; i++) {
        var option = document.createElement('option');
        option.value = i + '-' + getDomNameFromValue(this.answers[i]);
        option.textContent = this.answers[i];
        answerChoices.push(option);
        if (this.answers[i] === this.depChildAnswer)
          depAnswer = option.value;
      }
      if (this.randomize != constants.Randomize.NONE)
        answerChoices = knuthShuffle(answerChoices, this.randomize);
      if (!this.required) {
        var blankOption = document.createElement('option');
        blankOption.value = this.answers.length + '-NONE';
        blankOption.textContent = ' ';
        select.appendChild(blankOption);
      }
      for (var i = 0; i < answerChoices.length; i++)
        select.appendChild(answerChoices[i]);

      if (this.depChild && depAnswer) {
        var depQuest = getDomNameFromValue(this.depChild.question);
        select.addEventListener('change', function(unused) {
          if (select.value === depAnswer)
            $(depQuest).classList.toggle('hidden');
          else
            $(depQuest).classList.add('hidden');
        });
      }
      container.appendChild(select);
      break;
    default:
      throw new Error('Question "' + this.question + '" has an unexpected ' +
        'question type: ' + this.questionType);
  }

  if (this.depChild) {
    var child = this.depChild.makeDOMTree();
    child.setAttribute('id', getDomNameFromValue(this.depChild.question));
    container.appendChild(child);
  }

  return container;
}

// SCALE

/**
 * Represents scale questions. Currently supports HORIZONTAL_SCALE and
 * VERTICAL_SCALE question types. Randomization simply flips the order to
 * preserve the scale structure.
 * @param {string} questionType Question presentation (constants.QuestionType).
 * @param {string} question The question to be asked.
 * @param {boolean} required Whether the question needs to be answered.
 * @param {Array.string} scale The labels for each point on the scale.
 * @param {String} randomize Type of randomization (constants.Randomize).
 */
function ScaleQuestion(questionType, question, required, scale, randomize) {
  Question.call(this, questionType, question, required);
  this.scale = scale;
  this.randomize = randomize;
  this.attributes = [];
}

ScaleQuestion.prototype = Object.create(Question.prototype);
ScaleQuestion.prototype.constructor = ScaleQuestion;

/**
 * For multiple horizontal scales, like this:
 *    How are you feeling?
 *    - Sad 1 2 3 4 5
 *    - Happy 1 2 3 4 5
 * Here the adjectives "Sad" and "Happy" are attributes. This must be set
 * before makeDOMTree().
 * @param {Array.string} attributes The attributes that the user is rating.
 */
ScaleQuestion.prototype.setAttributes = function(attributes) {
  if (this.questionType != constants.QuestionType.MULT_HORIZ_SCALE)
    throw new Error('Only set attributes for MULT_HORIZ_SCALE questions.');
  this.attributes = attributes;
};

/**
 * A helper method for makeDOMTree.
 * @param {boolean} horizontal Whether it is a horizontal scale.
 * @param {string} questionName The DOM-ready question name.
 * @param {boolean} reverse Whether to flip the array.
 * @param {boolean} showLabels If horizontal, whether to show the labels.
 * @private
 */
ScaleQuestion.prototype.makeSingleRow =
    function(horizontal, questionName, reverse, showLabels) {
  var container = document.createElement('div');
  var scaleElements = [];
  for (var i = 0; i < this.scale.length; i++) {
    var answer = document.createElement('div');
    if (horizontal)
      answer.classList.add('horizontal-scale');
    var shrunkenAnswer =
        i + '-' + getDomNameFromValue(this.scale[i]) + '-' + questionName;

    var radio = document.createElement('input');
    radio.setAttribute('id', shrunkenAnswer);
    radio.setAttribute('name', questionName);
    radio.setAttribute('type', 'radio');
    radio.setAttribute('value', shrunkenAnswer);
    if (this.required)
      radio.setAttribute('required', this.required);

    var label = document.createElement('label');
    label.setAttribute('for', shrunkenAnswer);
    label.textContent = this.scale[i];

    if (horizontal) {
      if (showLabels) {
        answer.appendChild(label);
        answer.appendChild(document.createElement('br'));
      }
      answer.appendChild(radio);
    } else {
      answer.appendChild(radio);
      answer.appendChild(label);
    }
    scaleElements.push(answer);
  }
  if (reverse) {
    scaleElements = flipArray(
        scaleElements, (this.randomize == constants.Randomize.ANCHOR_LAST));
  }
  for (var i = 0; i < scaleElements.length; i++)
    container.appendChild(scaleElements[i]);

  if (horizontal) {
    var clearDiv = document.createElement('div');
    clearDiv.classList.add('clear-div');
    container.appendChild(clearDiv);
  }
  return container;
};

/**
 * Creates the DOM representation of a ScaleQuestion.
 * @return {object} The DOM node that contains the question.
 */
ScaleQuestion.prototype.makeDOMTree = function() {
  var horizontal =
      this.questionType == constants.QuestionType.HORIZ_SCALE ||
      this.questionType == constants.QuestionType.MULT_HORIZ_SCALE;
  var multi =
      (this.questionType == constants.QuestionType.MULT_HORIZ_SCALE) &&
      this.attributes.length > 0;

  var container = document.createElement('div');
  if (this.isDependentChild) {
    container.classList.add('hidden');
    container.classList.add('dependent');
  } else {
    container.classList.add('fieldset');
  }

  var legend = document.createElement('legend');
  legend.textContent = this.question;
  container.appendChild(legend);

  var reverse = this.randomize == constants.Randomize.NONE ? false : coinToss();
  var shrunkenQuestion = getDomNameFromValue(this.question);
  if (multi) {
    var shuffledAttributes =
        knuthShuffle(this.attributes, constants.Randomize.ALL);
    for (var i = 0; i < shuffledAttributes.length; i++) {
      var floatScale = document.createElement('div');
      floatScale.classList.add('horizontal-rowlabel');
      if (i == 0)
        floatScale.classList.add('first-rowlabel');
      floatScale.textContent = shuffledAttributes[i] + ':';
      container.appendChild(floatScale);
      var questionName =
          getDomNameFromValue(shuffledAttributes[i]) + shrunkenQuestion;
      container.appendChild(
          this.makeSingleRow(horizontal, questionName, reverse, (i == 0)));
    }
  } else {
    container.appendChild(
        this.makeSingleRow(horizontal, shrunkenQuestion, reverse, true));
  }
  return container;
};

// ESSAY

/**
 * Represents free response questions. Currently supports SHORT_STRING,
 * SHORT_ESSAY and LONG_ESSAY question types.
 * @param {string} questionType Question presentation (constants.QuestionType).
 * @param {string} question The question to be asked.
 * @param {boolean} required Whether the question needs to be answered.
 */
function EssayQuestion(questionType, question, required) {
  Question.call(this, questionType, question, required);
}

EssayQuestion.prototype = Object.create(Question.prototype);
EssayQuestion.prototype.constructor = EssayQuestion;

/**
 * Creates the DOM representation of an EssayQuestion.
 * @return {object} The DOM node that contains the question.
 */
EssayQuestion.prototype.makeDOMTree = function() {
  var container = document.createElement('div');
  if (this.isDependentChild) {
    container.classList.add('hidden');
    container.classList.add('dependent');
  } else {
    container.classList.add('fieldset');
  }

  var legend = document.createElement('legend');
  legend.textContent = this.question;
  container.appendChild(legend);

  switch (this.questionType) {
    case constants.QuestionType.SHORT_STRING:
      var input = document.createElement('input');
      input.setAttribute('type', 'text');
      input.setAttribute('name', getDomNameFromValue(this.question));
      input.setAttribute('size', 60);
      if (this.required)
        input.setAttribute('required', this.required);
      container.appendChild(input);
      break;
    case constants.QuestionType.SHORT_ESSAY:
    case constants.QuestionType.LONG_ESSAY:
      var textarea = document.createElement('textarea');
      textarea.setAttribute('name', getDomNameFromValue(this.question));
      textarea.setAttribute('cols', 60);
      textarea.setAttribute(
          'rows',
          this.questionType == constants.QuestionType.SHORT_ESSAY ? 5 : 10);
      if (this.required)
        textarea.setAttribute('required', this.required);
      container.appendChild(textarea);
      break;
    default:
      throw new Error('Question "' + this.question + '" has an unexpected ' +
        'question type: ' + this.questionType);
  }
  return container;
}

// HELPER METHODS

/**
 * Turns the full string into a short name for a value property. It does this
 * by removing all non-alphabetic characters and truncating to 40 characters.
 * @param {string} The original input answer.
 * @returns {string} The shrunken version of the answer.
 */
function getDomNameFromValue(answer) {
  return answer.replace(/[\W\s]+/g, '').substring(0, 40);
}

/**
 * Use the knuth (aka Fisher-Yates) shuffle to randomize an array.
 * http://en.wikipedia.org/wiki/Fisher%E2%80%93Yates_shuffle
 * @param {Array.Object} arr The array to randomize.
 * @param {string} randomType The type of randomization (constants.Randomize)
 * @returns {Array.Object} The randomized array.
 */
function knuthShuffle(arr, randomType) {
  var end = randomType == constants.Randomize.ANCHOR_LAST ?
            arr.length - 1 : arr.length;
  for (var i = 0; i < end; i++) {
    // Random int: i <= randomIndex < arr.length
    var randomIndex = Math.floor(Math.random() * (end - i)) + i;

    // Swap with current element.
    var swapTemp = arr[i];
    arr[i] = arr[randomIndex];
    arr[randomIndex] = swapTemp;
  }
  return arr;
}

/**
 * A wrapper method for Math.random.
 * @returns {boolean} Returns true half the time.
 */
function coinToss() {
  return (Math.random() < 0.5);
}

/**
 * Flip an array.
 * @param {Array.Object} arr The array to flip.
 * @param {bool} anchorLast Whether to anchor the last element.
 * @returns {Array.Object} The flipped array.
 */
function flipArray(arr, anchorLast) {
  var end = anchorLast ? arr.length - 1 : arr.length;
  var reverseArr = [];
  for (var i = end - 1; i >= 0; i--)
    reverseArr.push(arr[i]);
  if (anchorLast)
    reverseArr.push(arr[arr.length - 1]);
  return reverseArr;
}

/**
 * Creates a submit button for a form.
 * @returns {object} The DOM node with the submit button.
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

/**
 * Extracts the question and answer values from a completed survey form.
 * @param {Array.Question} questionArr The set of questions.
 * @param {Object} form The containing <form> DOM node.
 * @returns {SurveySubmission.Response} The question and associated answer.
 */
function getFormValues(questionArr, form) {
  var responses = [];
  for (var i = 0; i < questionArr.length; i++) {
    var question = questionArr[i];  // The Question object
    var questionStr = questionArr[i].question;  // The question text
    var questionLookup = getDomNameFromValue(questionStr);  // The DOM ID
    if (question.questionType === constants.QuestionType.CHECKBOX) {
      // Checkboxes may have multiple answers.
      var answerList = document.querySelectorAll(
          'input[name="' + questionLookup + '"]:checked');
      for (var j = 0; j < answerList.length; j++) {
        var response = new SurveySubmission.Response(
            questionStr, answerList[j].value || 'NOANSWER');
        responses.push(response);
      }
    } else if (question.questionType ===
               constants.QuestionType.MULT_HORIZ_SCALE) {
      // MULT_HOR_SCALE questions have multiple levels of responses.
      for (var j = 0; j < question.attributes.length; j++) {
        var attrQuestion = questionStr + '(' + question.attributes[j] + ')';
        var attrLookup = getDomNameFromValue(question.attributes[j]) +
            questionLookup;
        var answer = form[attrLookup].value || 'NOANSWER';
        var response = new SurveySubmission.Response(attrQuestion, answer);
        responses.push(response);
      }
    } else {
      var answer = form[questionLookup].value || 'NOANSWER';
      var response = new SurveySubmission.Response(questionStr, answer);
      responses.push(response);
    }
  }
  return responses;
}
