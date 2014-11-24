"""Endpoints messages for the Chrome Experience Sampling backend.

These classes define the messages received and sent by the endpoints.
"""

from protorpc import message_types
from protorpc import messages

package = 'ChromeExperienceSampling'


class ResponseMessage(messages.Message):
  question = messages.StringField(1, required=True)
  answer = messages.StringField(2, required=True)


class SurveyMessage(messages.Message):
  survey_type = messages.StringField(1, required=True)
  participant_id = messages.StringField(2, required=True)
  date_taken = message_types.DateTimeField(3, required=True)
  responses = messages.MessageField(ResponseMessage, 4, repeated=True)

