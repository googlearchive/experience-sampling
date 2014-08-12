"""Chrome Experience Sampling backend API

Implemented using Google Cloud Endpoints.
"""

import endpoints
import webapp2
from protorpc import messages
from protorpc import message_types
from protorpc import remote
from google.appengine.ext import ndb
from google.appengine.api import users

import json
import logging

import models

package = 'ChromeExperienceSampling'


class Response(messages.Message):
  question = messages.StringField(1, required=True)
  answer = messages.StringField(2, required=True)

def response_model_to_msg(model):
  return Response(question=model.question,
                  answer=model.answer)

def response_msg_to_model(msg):
  return models.Response(question=msg.question,
                         answer=msg.answer)


class Survey(messages.Message):
  participant_id = messages.IntegerField(1, required=True)
  date = message_types.DateTimeField(2, required=True)
  responses = messages.MessageField(Response, 3, repeated=True)

def survey_model_to_msg(model):
  return Survey(participant_id=model.participant_id,
                date=model.date_taken,
                responses=map(response_model_to_msg, model.responses))

def survey_msg_to_model(msg):
  return models.Survey(participant_id=msg.participant_id,
                       date_taken=msg.date,
                       responses=map(response_msg_to_model, msg.responses))


class SurveyCollection(messages.Message):
  items = messages.MessageField(Survey, 1, repeated=True)


@endpoints.api(name='cesp', version='v1',
               scopes=[endpoints.EMAIL_SCOPE])
class ExperienceSamplingApi(remote.Service):
  """CESP Backend API v1."""

  @endpoints.method(Survey, message_types.VoidMessage,
                    path='submitsurvey', http_method='POST',
                    name='cesp.submitSurvey')
  def survey_submit(self, request):
    survey = survey_msg_to_model(request)
    survey.put()
    return message_types.VoidMessage()

  @endpoints.method(message_types.VoidMessage, SurveyCollection,
                    path='getsurveys', http_method='GET',
                    name='cesp.getSurveys')
  def surveys_list(self, unused_request):
    # AUTHORIZATION: Must be admin user to access this endpoint. 
    #if not users.is_current_user_admin():
    #  raise endpoints.UnauthorizedException('Administrative access required.')

    # Get all surveys from the datastore.
    surveys = models.Survey.query().fetch()
    survey_collection = SurveyCollection()
    for survey in surveys:
      survey_collection.items.append(survey_model_to_msg(survey))
    return survey_collection

APPLICATION = endpoints.api_server([ExperienceSamplingApi])
