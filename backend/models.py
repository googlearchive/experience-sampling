"""TODO(cthomp): DO NOT SUBMIT without one-line documentation for models.

TODO(cthomp): DO NOT SUBMIT without a detailed description of models.
"""

from google.appengine.ext import ndb


class ConsentForm(ndb.Model):
  """Models a response to the consent form"""
  legal_name = ndb.StringProperty()
  date_signed = ndb.StringProperty()
  date_received = ndb.DateTimeProperty(auto_now_add=True)


class Response(ndb.Model):
  question = ndb.StringProperty()
  answer = ndb.TextProperty()


class DemographicsForm(ndb.Model):
  participant_id = ndb.IntegerProperty(indexed=True)
  date_taken = ndb.DateTimeProperty()
  date_received = ndb.DateTimeProperty(auto_now_add=True)
  responses = ndb.StructuredProperty(Response, repeated=True)


class Survey(ndb.Model):
  participant_id = ndb.IntegerProperty(indexed=True)
  date_taken = ndb.DateTimeProperty()
  date_received = ndb.DateTimeProperty(auto_now_add=True)
  responses = ndb.StructuredProperty(Response, repeated=True)


