# coding: utf-8
from django.utils.translation import ugettext as _

PROPERTY_NUMBER_FIELD = 1
PROPERTY_TEXT_FIELD = 2
PROPERTY_SELECT_FIELD = 3

PROPERTY_FIELD_CHOICES = (
    (PROPERTY_NUMBER_FIELD, _("Float field")),
    (PROPERTY_TEXT_FIELD, _("Text field")),
    (PROPERTY_SELECT_FIELD, _("Select field")),
)

class ComponentState(object):
    INSTALLED = 'installed'
    FREE = 'free'
    BROKEN = 'broken'

    _ALL = 'all'

    CHOICES = (
        (INSTALLED, _('Installed')),
        (FREE, _('Free')),
        (BROKEN, _('Broken')),
    )

    @staticmethod
    def is_valid(value):
        return value in dict(ComponentState.CHOICES)

    @staticmethod
    def show_all(value):
        return value == ComponentState._ALL
