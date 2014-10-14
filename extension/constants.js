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
  SCALE: 'scale',

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

// Handle "other" specially. Remember to do ANCHOR_LAST if you use the
// OTHER field as your last answer choice!
constants.OTHER = 'Other: ';

// An element lookup shortcut, per convention.
var $ = function(id) { return document.getElementById(id); };
