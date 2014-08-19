"""Chrome Experience Sampling backend API.

Implemented using Google Cloud Endpoints for App Engine.
"""

import endpoints
from protorpc import message_types
from protorpc import remote

from messages import SurveyMessage
import models

package = 'ChromeExperienceSampling'


@endpoints.api(name='cesp', version='v1',
               scopes=[endpoints.EMAIL_SCOPE])
class ExperienceSamplingApi(remote.Service):
  """CESP Backend API v1."""

  @endpoints.method(SurveyMessage, message_types.VoidMessage,
                    path='submitsurvey', http_method='POST',
                    name='submitSurvey')
  def survey_submit(self, request):
    survey = models.SurveyModel.fromMessage(request)
    survey.put()
    return message_types.VoidMessage()

APPLICATION = endpoints.api_server([ExperienceSamplingApi])
