# coding: utf-8
from django.views.generic import ListView, DetailView

from erp_test.models import Floor
from erp_client.views.common import (
    BaseDeleteView, BaseUpdateView, BaseCreateView)
from erp_client.forms import FloorForm


class FloorModelMixin(object):
    model = Floor


class FloorListView(FloorModelMixin, ListView):
    template_name = 'erp_client/floors/list.html'


class FloorDetailView(FloorModelMixin, DetailView):
    template_name = 'erp_client/floors/detail.html'


class FloorUpdateView(FloorModelMixin, BaseUpdateView):
    form_class = FloorForm


class FloorCreateView(FloorModelMixin, BaseCreateView):
    form_class = FloorForm


class FloorDeleteView(FloorModelMixin, BaseDeleteView):
    pass
