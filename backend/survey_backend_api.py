"""Chrome Experience Sampling backend API.

Implemented using Google Cloud Endpoints for App Engine.
"""

import endpoints
from protorpc import message_types
from protorpc import messages
from protorpc import remote

import models

from google.appengine.api import users

package = 'ChromeExperienceSampling'


class Response(messages.Message):
  question = messages.StringField(1, required=True)
  answer = messages.StringField(2, required=True)


def response_msg_to_model(msg):
  return models.Response(question=msg.question,
                         answer=msg.answer)


class Survey(messages.Message):
  participant_id = messages.IntegerField(1, required=True)
  date = message_types.DateTimeField(2, required=True)
  responses = messages.MessageField(Response, 3, repeated=True)


def survey_msg_to_model(msg):
  return models.Survey(participant_id=msg.participant_id,
                       date_taken=msg.date,
                       responses=map(response_msg_to_model, msg.responses))


@endpoints.api(name='cesp', version='v1',
               scopes=[endpoints.EMAIL_SCOPE])
class ExperienceSamplingApi(remote.Service):
  """CESP Backend API v1."""

  @endpoints.method(Survey, message_types.VoidMessage,
                    path='submitsurvey', http_method='POST',
                    name='submitSurvey')
  def survey_submit(self, request):
    survey = survey_msg_to_model(request)
    survey.put()
    return message_types.VoidMessage()

APPLICATION = endpoints.api_server([ExperienceSamplingApi])
