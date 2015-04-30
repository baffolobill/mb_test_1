# coding: utf-8
from django.views.generic import ListView, DetailView

from erp_test.models import Rack
from erp_client.views.common import (
    BaseDeleteView, BaseUpdateView, BaseCreateView)
from erp_client.forms import RackForm


class RackModelMixin(object):
    model = Rack


class RackListView(RackModelMixin, ListView):
    template_name = 'erp_client/racks/list.html'


class RackDetailView(RackModelMixin, DetailView):
    template_name = 'erp_client/racks/detail.html'


class RackUpdateView(RackModelMixin, BaseUpdateView):
    form_class = RackForm


class RackCreateView(RackModelMixin, BaseCreateView):
    form_class = RackForm


class RackDeleteView(RackModelMixin, BaseDeleteView):
    pass
