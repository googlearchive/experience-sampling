/**
 * Experience Sampling submission functionality.
 *
 * This file contains classes and functions for saving and processing completed
 * surveys and sending them to the backend server.
 */

/**
 * SurveySubmission namespace.
 */
var SurveySubmission = SurveySubmission || {};

// Submission settings.
SurveySubmission.SERVER_URL = 'https://chrome-experience-sampling.appspot.com';
SurveySubmission.SUBMIT_SURVEY_ACTION = '/_ah/api/cesp/v1/submitsurvey';
SurveySubmission.XHR_TIMEOUT = 4000;  // milliseconds
SurveySubmission.DB_NAME = 'pendingResponsesDB';
SurveySubmission.DB_VERSION = 2;
SurveySubmission.QUEUE_ALARM_NAME = 'surveySubmissionAlarm';

/**
 * A question and response.
 * @constructor
 * @param {string} question The question being answered.
 * @param {string} answer The answer to that question.
 */
SurveySubmission.Response = function(question, answer) {
  this.question = question;
  this.answer = answer;
  if (typeof this.question !== "string")
    console.error(JSON.stringify(this.question) + " is not a string!");
  if (typeof this.answer !== "string")
    console.error(JSON.stringify(this.answer) + " is not a string!");
}

/**
 * A completed survey.
 * @constructor
 * @param {string} type The type of survey.
 * @param {int} participantId The participant ID.
 * @param {Date} dateTaken The date and time when the survey was taken.
 * @param {Array.Response} responses An array of Response objects.
*/
SurveySubmission.SurveyRecord = function(type, participantId, dateTaken,
    responses) {
  this.type = type;
  this.participantId = participantId;
  this.dateTaken = dateTaken;
  this.responses = responses;
}

/**
 * A completed survey pending submission to the backend.
 * @constructor
 * @param {SurveyRecord} surveyRecord The completed survey that is pending.
 * @param {int} timeToSend The time when we want the survey to be sent, in ms
 *     since epoch. The survey will not be sent before this time, but may be 
 *     delayed arbitrarily.
 * @param {int} tries The number of attempts made to send this survey so far.
 */
SurveySubmission.PendingSurveyRecord = function(surveyRecord, timeToSend,
    tries) {
  this.surveyRecord = surveyRecord;
  this.timeToSend = timeToSend;
  this.tries = tries;
}

/**
 * Saves a completed survey into the database of pending completed surveys.
 * Applies an exponential backoff based on the number of attempts made to
 * submit the survey so far.
 * @param {SurveyRecord} surveyRecord The completed survey to add to the
 *     queue.
 * @param {int=} tries The number of tries so far (optional, defaults to 0).
 */
SurveySubmission.saveSurveyRecord = function(surveyRecord, tries) {
  tries = tries || 0;
  function makePendingRecord(store) {
    var timeToSend = Date.now() + SurveySubmission.calculateSendingDelay(tries);
    var pendingSurveyRecord = new SurveySubmission.PendingSurveyRecord(
        surveyRecord, timeToSend, tries);
    store.add(pendingSurveyRecord);
    console.log('Survey added to queue');
  }
  SurveySubmission.withObjectStore(
      'PendingSurveyRecords', 'readwrite', makePendingRecord);
}

/**
 * Compute the sending delay, in ms. This is an exponential backoff.
 * @param {int} tries The number of tries to send so far.
 * @returns {int} The delay in ms.
 */
SurveySubmission.calculateSendingDelay = function(tries) {
  return (Math.pow(2, tries) - 1) * 60000;
}

/**
 * Get all pending surveyRecords with timeToSend less than the current time,
 * and try to send them. If sending succeeds, delete them from the database. If
 * sending fails, update the timeToSend so we try again later.
 * @params {Alarm} alarm The alarm that triggered.
 */
SurveySubmission.processQueue = function(alarm) {
  if (alarm.name != SurveySubmission.QUEUE_ALARM_NAME) return;

  function makeSuccessCallback(id) {
    return function(response) {
      console.log('Survey successfully submitted');
      SurveySubmission.deleteSurveyRecord(id);
    };
  }

  function makeErrorCallback(id) {
    return function(status) {
      console.log('Survey cannot be uploaded: ' + status);
      SurveySubmission.updateTimeToSend(id);
    };
  }

  function maybeSendSurvey(store) {
    var surveysToSubmit = [];
    var index = store.index('timeToSend');
    var keyRange = IDBKeyRange.upperBound(Date.now());
    index.openCursor(keyRange).onsuccess = function(event) {
      var cursor = event.target.result;
      if (cursor) {
        surveysToSubmit.push({
          id: cursor.value.id,
          surveyRecord: cursor.value.surveyRecord
        });
        cursor.continue();
      } else {
        // After collecting all the surveys over the cursor, make async calls
        // to sendSurvey.
        for (var i = 0; i < surveysToSubmit.length; i++) {
          var id = surveysToSubmit[i].id;
          var surveyRecord = surveysToSubmit[i].surveyRecord;
          SurveySubmission.sendSurveyRecord(
              surveysToSubmit[i].surveyRecord,
              makeSuccessCallback(id),
              makeErrorCallback(id));
        }
      }
    };
  }
  SurveySubmission.withObjectStore(
      'PendingSurveyRecords', 'readonly', maybeSendSurvey);
}
chrome.alarms.onAlarm.addListener(SurveySubmission.processQueue);

/**
 * Delete the survey with the specified key from the database.
 * @param {int} id The ID primary key of survey to delete.
 */
SurveySubmission.deleteSurveyRecord = function(id) {
  SurveySubmission.withObjectStore(
      'PendingSurveyRecords',
      'readwrite',
      function(store) {
        store.delete(id);
  });
}

/**
 * Updates the timeToSend field of a survey with a given ID key based on the
 * number of times we've tried to send it.
 * @param {int} id The ID primary key of the survey to update.
 */
SurveySubmission.updateTimeToSend = function(id) {
  function update(store) {
    var request = store.get(id);
    request.onsuccess =  function(event) {
      var record = event.target.result;
      record.tries = record.tries + 1;
      record.timeToSend = Date.now() +
          SurveySubmission.calculateSendingDelay(record.tries);
      store.put(record);
    }
  }
  SurveySubmission.withObjectStore('PendingSurveyRecords', 'readwrite', update);
}

/**
 * Perform a callback action after opening the database and a given
 * object store.
 * @param {string} storeName The name of the object store to open.
 * @param {string} mode The transaction mode ('readwrite' or 'readonly').
 * @param {function(IDBObjectStore)} action 
 */
SurveySubmission.withObjectStore = function(storeName, mode, action) {
  var request = indexedDB.open(
      SurveySubmission.DB_NAME, SurveySubmission.DB_VERSION);
  request.onsuccess = function(event) {
    var db = event.target.result;
    var transaction = db.transaction([storeName], mode);
    transaction.onerror = function(event) {
      console.error("Transaction error: " + event.target.errorCode);
    };
    action(transaction.objectStore(storeName));
  };
  request.onerror = function(event) {
    console.error("Database Error: " + event.target.errorCode);
  };
  request.onupgradeneeded = function(event) {
    var db = event.target.result;
    var objectStore = db.createObjectStore(
        'PendingSurveyRecords', {keyPath: 'id', autoIncrement: true});
    objectStore.createIndex('timeToSend', 'timeToSend', {unique: false});
  };
}

/**
 * Sends a completed survey to the CESP backend via XHR.
 * @param {SurveyRecord} surveyRecord The completed survey to send to the
 *     backend.
 * @param {function(string)} successCallback A function to call on receiving a
 *     successful response (HTTP 204). It should look like
 *     "function(response) {...};" where "response" is the text of the response
 *     (if there is any).
 * @param {function(!number=)} errorCallback A function to call on receiving an
 *     error from the server, or on timing out. It should look like
 *     "function(status) {...};" where "status" is an HTTP status code integer,
 *     if there is one. For a timeout, there is no status.
 */
SurveySubmission.sendSurveyRecord = function(surveyRecord, successCallback,
    errorCallback) {
  var url = SurveySubmission.SERVER_URL + SurveySubmission.SUBMIT_SURVEY_ACTION;
  var method = 'POST';
  var dateTaken = surveyRecord.dateTaken.toISOString();
  // Get rid of timezone 'Z' on end of ISO String for AppEngine compatibility.
  if (dateTaken.slice(-1) === 'Z') {
    dateTaken = dateTaken.slice(0, -1);
  }
  var data = {
    'date_taken': dateTaken,
    'participant_id': surveyRecord.participantId,
    'responses': [],
    'survey_type': surveyRecord.type
  };
  for (var i = 0; i < surveyRecord.responses.length; i++) {
    data.responses.push(surveyRecord.responses[i]);
  }
  var xhr = new XMLHttpRequest();
  function onLoadHandler(event) {
    if (xhr.readyState === 4) {
      if (xhr.status === 204) {
        successCallback(xhr.response);
      } else {
        errorCallback(xhr.status);
      }
    }
  }
  function onErrorHandler(event) {
    errorCallback(xhr.status);
  }
  function onTimeoutHandler(event) {
    errorCallback();
  }
  xhr.open(method, url, true);
  xhr.setRequestHeader('Content-Type', 'application/JSON');
  xhr.timeout = SurveySubmission.XHR_TIMEOUT;
  xhr.onload = onLoadHandler;
  xhr.onerror = onErrorHandler;
  xhr.ontimeout = onTimeoutHandler;
  xhr.send(JSON.stringify(data));
}
