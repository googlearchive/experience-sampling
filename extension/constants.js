/**
 * Experience Sampling constants that are used in multiple files.
 */

var constants = {};  // Namespace variable

// Constants for the consent form.
constants.CONSENT_KEY = 'consent';  // Storage lookup key.
constants.CONSENT_PENDING = 'pending';
constants.CONSENT_GRANTED = 'granted';
constants.CONSENT_REJECTED = 'rejected';

// Constants for the setup survey form.
constants.SETUP_KEY = 'setup';  // Setup lookup key.
constants.SETUP_PENDING = 'pending';
constants.SETUP_COMPLETED = 'completed';

// Constants for message passing.
constants.MSG_TYPE = 'message_type';
constants.MSG_CONSENT = 'consent_complete'; // Consent complete.
constants.MSG_SETUP = 'setup_complete'; // Setup complete.
constants.MSG_SURVEY = 'survey_complete';  // Survey finished.

// The different types of survey questions that are possible.
constants.QuestionType = {
  // Handled by the Fixed class.
  CHECKBOX: 'checkbox',
  RADIO: 'radio',
  DROPDOWN: 'dropdown',

  // Handled by the Scale class.
  HORIZ_SCALE: 'horizontalScale',
  MULT_HORIZ_SCALE: 'multipleHorizontalScale',
  VERTICAL_SCALE: 'verticalScale',

  // Handled by the Essay class.
  SHORT_STRING: 'shortString',
  SHORT_ESSAY: 'shortEssay',
  LONG_ESSAY: 'longEssay'
};

// The type of randomization desired for answer choices.
constants.Randomize = {
  NONE: 'none',
  ALL: 'all',
  ANCHOR_LAST: 'anchorLast',  // Last element will stay in its place.
  ANCHOR_LAST_TWO: 'anchorLastTwo' // Last 2 elements will stay in place.
};

// Handle "other" and "I prefer not to answer" specially.
constants.OTHER = 'Other: ';
constants.NO_ANSWER = 'I prefer not to answer';

// The different types of events that trigger survey notifications.
// The strings need to match the definitions in Chrome.
constants.EventType = {
  // Defined in ssl_blocking_page.cc.
  SSL_OVERRIDABLE: 'ssl_interstitial_overridable',
  SSL_NONOVERRIDABLE: 'ssl_interstitial_notoverridable',

  // Defined in safe_browsing_blocking_page.cc.
  MALWARE: 'safebrowsing_interstitial',
  PHISHING: 'phishing_interstitial',
  HARMFUL: 'harmful_interstitial',
  SB_OTHER: 'safebrowsing_other',

  // Defined in experience_sampling_private/experience_sampling.cc.
  DOWNLOAD_MALICIOUS: 'download_warning_malicious',
  DOWNLOAD_DANGEROUS: 'download_warning_dangerous',
  DOWNLOAD_DANGER_PROMPT: 'download_danger_prompt',

  // Prefix defined in experience_sampling_private/experience_sampling.cc.
  // Postfixes are from ExtensionInstallPrompt::PromptTypeToString.
  EXTENSION_INSTALL: 'extension_install_dialog_INSTALL_PROMPT',
  EXTENSION_INLINE_INSTALL: 'extension_install_dialog_INLINE_INSTALL_PROMPT',
  EXTENSION_BUNDLE: 'extension_install_dialog_BUNDLE_INSTALL_PROMPT',
  EXTENSION_OTHER: 'extension_install_dialog',  // Catch-all

  UNKNOWN: 'unknown',
};

// The JavaScript files that load each survey.
constants.SurveyLocation = {
  SETUP: 'setup.js',
  SSL_OVERRIDABLE_PROCEED: 'ssl-overridable-proceed.js',
  SSL_OVERRIDABLE_NOPROCEED: 'ssl-overridable-noproceed.js',
  SSL_NONOVERRIDABLE: 'ssl-nonoverridable.js',
  MALWARE_PROCEED: 'malware-proceed.js',
  MALWARE_NOPROCEED: 'malware-noproceed.js',
  PHISHING_PROCEED: 'phishing-proceed.js',
  PHISHING_NOPROCEED: 'phishing-noproceed.js',
  EXTENSION_PROCEED: 'extension-proceed.js',
  EXTENSION_NOPROCEED: 'extension-noproceed.js'
};

// The different types of user decisions.
constants.DecisionType = {
  PROCEED: 'proceed',
  DENY: 'deny',
  IGNORE: 'ignore',
  CANCEL: 'cancel',
  RELOAD: 'reload'
};

constants.OS = {
  MAC: 'mac',
  WIN: 'win',
  CROS: 'cros',
  LINUX: 'linux',
  OTHER: 'other'
};

/**
 * The chrome.experienceSamplingPrivate event types are often post-fixed, e.g.,
 * ssl_interstitial_overridable_net::ERR_CERT_COMMON_NAME_INVALID. This
 * is a convenience method for mapping an event type string to an EventType.
 * @param {string} str The string event type.
 * @returns {string} The matching EventType.
 */
constants.FindEventType = function(str) {
  for (var evt in constants.EventType) {
    var re = new RegExp('^' + constants.EventType[evt]);
    if (str.match(re))
      return constants.EventType[evt];
  }
  return constants.EventType.UNKNOWN;
};

// After a survey is completed, automatically close the survey after a pause.
constants.SURVEY_CLOSE_TIME = 9000;  // Nine seconds, in milliseconds.

// An element lookup shortcut, per convention.
var $ = function(id) { return document.getElementById(id); };
