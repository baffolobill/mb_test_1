# coding: utf-8
from django.utils.translation import ugettext as _

from rest_framework import status
from rest_framework.exceptions import APIException, ValidationError


class Base400Exception(APIException):
    status_code = status.HTTP_400_BAD_REQUEST


class ComponentAlreadyInstalled(Base400Exception):
    default_detail = _('Component already installed.')


class ComponentNotInstalled(Base400Exception):
    default_detail = _('Component is not installed.')


class ComponentIsBroken(Base400Exception):
    default_detail = _('Component is broken.')


class ComponentNotSupported(Base400Exception):
    default_detail = _('Component is not supported.')


class RackIsFilled(Base400Exception):
    default_detail = _('Rack is filled.')


class RackUnitIsBusy(Base400Exception):
    default_detail = _('Rack unit is busy.')


class BasketIsFilled(Base400Exception):
    default_detail = _('Basket is filled.')


class BasketSlotIsBusy(Base400Exception):
    default_detail = _('Basket slot is busy.')


class ServerHasNoFreeSlotForComponent(Base400Exception):
    default_detail = _('Server does not have free slot for the component.')


class ComponentPlugFailed(ValidationError):
    default_detail = _('Component(s) plug is failed.')
