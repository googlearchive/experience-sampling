var surveyDriver = {};
surveyDriver.SurveyType = '';  // Holds the type of survey.
surveyDriver.QuestionUrl = '';  // Holds the URL for putting into questions.
surveyDriver.Questions = [];  // Holds the questions for a given survey.

/**
 * Convenience method for adding questions.
 * @param {Object} parentNode The DOM node to add the question to.
 * @param {Question} question The Question you want to add.
 */
function addQuestion(parentNode, question) {
  surveyDriver.Questions.push(question);
  parentNode.appendChild(question.makeDOMTree());
}

/**
 * Finds and loads the appropriate JS file, which has the questions for this
 * particular survey. Parameters here are not trusted. The JS value should be
 * discarded unless it matches a known JS file location, and the question URL
 * value must be sanitized before being used.
 */
function loadSurveyScript() {
  function handleError() {
    console.log('Unexpected query: ' + window.location);
    window.location = '../consent.html';
  }
  function parseKeyValuePair(keyName, pairStr) {
    var paramArr = pairStr.split('=');
    if (!paramArr || paramArr.length != 2 || paramArr[0] !== keyName) {
      handleError();
      return '';  // Won't be reached because handleError will navigate.
    }
    return paramArr[1];
  }
  var query = window.location.search.substring(1);
  if (!query) handleError();
  var splitIntoPairs = query.split('&');
  if (!splitIntoPairs || splitIntoPairs.length < 2) handleError();

  // Determine the type of survey to show.
  var jsUrl = parseKeyValuePair('js', splitIntoPairs[0]);
  var extensionSurvey = false;
  switch (jsUrl) {
    case constants.SurveyLocation.SSL_OVERRIDABLE_PROCEED:
    case constants.SurveyLocation.SSL_OVERRIDABLE_NOPROCEED:
    case constants.SurveyLocation.SSL_NONOVERRIDABLE:
    case constants.SurveyLocation.MALWARE_PROCEED:
    case constants.SurveyLocation.MALWARE_NOPROCEED:
    case constants.SurveyLocation.PHISHING_PROCEED:
    case constants.SurveyLocation.PHISHING_NOPROCEED:
      break;
    case constants.SurveyLocation.EXTENSION_PROCEED:
    case constants.SurveyLocation.EXTENSION_NOPROCEED:
      extensionSurvey = true;
      break;
    default:
      handleError();
      return;
  }
  if (!jsUrl) handleError();
  surveyDriver.SurveyType = jsUrl;

  // Get the URL or extension name that the survey is about.
  if (!extensionSurvey) {
    var questionUrl = decodeURIComponent(
        parseKeyValuePair('url', splitIntoPairs[1]));
    if (!questionUrl) handleError();
    surveyDriver.QuestionUrl = questionUrl;
  }

  // Load the JS file and start the survey setup.
  var head = document.head;
  var script = document.createElement('script');
  script.addEventListener('load', setupSurvey);
  script.setAttribute('src', jsUrl);
  head.appendChild(script);
}

/**
 * Sets up the survey form.
 */
function setupSurvey() {
  console.log('Setting up a survey');
  setScreenshot();
  $('explanation').classList.remove('hidden');
  $('survey-container').classList.remove('hidden');
  addQuestions($('survey-form'));
  $('survey-form').appendChild(makeSubmitButtonDOM());
  document.forms['survey-form'].addEventListener(
      'submit', setupFormSubmitted);
  var selectElements = document.getElementsByTagName('select');
  for (var i = 0; i < selectElements.length; i++) {
    selectElements[i].selectedIndex = -1;
  }
}

/**
 * Handles the submission of the setup survey.
 * @param {object} The submission button click event.
 */
function setupFormSubmitted(event) {
  event.preventDefault();
  chrome.runtime.sendMessage(
    {
      'survey_type': surveyDriver.SurveyType,
      'responses': getFormValues(
                       surveyDriver.Questions, document['survey-form'])
    }
  );
  $('explanation').classList.add('hidden');
  $('survey-container').classList.add('hidden');
  $('thank-you').classList.remove('hidden');
  setTimeout(window.close, constants.SURVEY_CLOSE_TIME);
}

document.addEventListener('DOMContentLoaded', loadSurveyScript);
