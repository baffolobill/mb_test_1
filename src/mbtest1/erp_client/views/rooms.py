# coding: utf-8
from django.views.generic import ListView, DetailView

from erp_test.models import Room
from erp_client.views.common import (
    BaseDeleteView, BaseUpdateView, BaseCreateView)
from erp_client.forms import RoomForm


class RoomModelMixin(object):
    model = Room


class RoomListView(RoomModelMixin, ListView):
    template_name = 'erp_client/rooms/list.html'


class RoomDetailView(RoomModelMixin, DetailView):
    template_name = 'erp_client/rooms/detail.html'


class RoomUpdateView(RoomModelMixin, BaseUpdateView):
    form_class = RoomForm


class RoomCreateView(RoomModelMixin, BaseCreateView):
    form_class = RoomForm


class RoomDeleteView(RoomModelMixin, BaseDeleteView):
    pass
