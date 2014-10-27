var surveySetup = {};
surveySetup.QuestionUrl = '';  // Holds the URL or extension name.

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
  var query = window.location.search.substring(1);
  if (!query) handleError();
  var splitIntoParams = query.split('&');
  if (!splitIntoParams || splitIntoParams.length < 2) handleError();

  // Determine the type of survey to show.
  var jsParamArr = splitIntoParams[0].split('=');
  var extensionSurvey = false;
  if (jsParamArr.length != 2 || jsParamArr[0] !== 'js') handleError();
  var jsUrl = jsParamArr[1];
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

  // Get the URL or extension name that the survey is about.
  if (!extensionSurvey) {
    var urlParamArr = splitIntoParams[1].split('=');
    if (urlParamArr.length != 2 || urlParamArr[0] != 'url') handleError();
    var questionUrl = sanitizers.ReplaceUrl(urlParamArr[1]);
    if (!questionUrl) handleError();
    surveySetup.QuestionUrl = questionUrl;
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
}

/**
 * Handles the submission of the setup survey.
 * @param {object} The submission button click event.
 */
function setupFormSubmitted(event) {
  console.log('Survey submitted');
  event.preventDefault();
  $('explanation').classList.add('hidden');
  $('survey-container').classList.add('hidden');
  $('thank-you').classList.remove('hidden');
  setTimeout(window.close, constants.SURVEY_CLOSE_TIME);
}

document.addEventListener('DOMContentLoaded', loadSurveyScript);
