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
  ANCHOR_LAST: 'anchorLast'  // Last element will stay in its place.
};

// Handle "other" specially.
constants.OTHER = 'Other: ';

// The different types of events that trigger survey notifications.
constants.EventType = {
  SSL: 'ssl_interstitial',
  MALWARE: 'safebrowsing_interstitial',
  PHISHING: 'phishing_interstitial',
  HARMFUL: 'harmful_interstitial',
  SB_OTHER: 'safebrowsing_other',

  DOWNLOAD_MALICIOUS: 'download_warning_malicious',
  DOWNLOAD_DANGEROUS: 'download_warning_dangerous',
  DOWNLOAD_DANGER_PROMPT: 'download_danger_prompt',

  EXTENSION_INSTALL: 'extension_install_dialog',

  UNKNOWN: 'unknown',
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
constants.SURVEY_CLOSE_TIME = 3000;  // Three seconds, in milliseconds.

// An element lookup shortcut, per convention.
var $ = function(id) { return document.getElementById(id); };
