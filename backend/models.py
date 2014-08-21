"""AppEngine Datastore models for the Chrome Experience Sampling backend.

These classes define the data models for form and survey responses.
"""

from google.appengine.ext import ndb

package = 'ChromeExperienceSampling'


class ResponseModel(ndb.Model):
  question = ndb.TextProperty()
  answer = ndb.TextProperty()

  @staticmethod
  def fromMessage(message):
    return ResponseModel(question=message.question,
                         answer=message.answer)


class SurveyModel(ndb.Model):
  survey_type = ndb.StringProperty(indexed=True)
  participant_id = ndb.IntegerProperty(indexed=True)
  date_taken = ndb.DateTimeProperty()
  date_received = ndb.DateTimeProperty(auto_now_add=True)
  responses = ndb.StructuredProperty(ResponseModel, repeated=True)

  @staticmethod
  def fromMessage(message):
    return SurveyModel(survey_type=message.survey_type,
                       participant_id=message.participant_id,
                       date_taken=message.date_taken,
                       responses=map(ResponseModel.fromMessage,
                                     message.responses))
