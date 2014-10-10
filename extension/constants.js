/**
 * Experience Sampling constants that are used in multiple files.
 */

var constants = {};  // Namespace variable

// Constants for the consent form.
constants.CONSENT_KEY =       'consent';  // Storage lookup key.
constants.CONSENT_PENDING =   'pending';
constants.CONSENT_GRANTED =   'granted';
constants.CONSENT_REJECTED =  'rejected';

// Constants for the setup survey form.
constants.SETUP_KEY =         'setup';  // Setup lookup key.
constants.SETUP_PENDING =     'pending';
constants.SETUP_COMPLETED =   'completed';

// An element lookup shortcut, per convention.
var $ = function(id) { return document.getElementById(id); };
