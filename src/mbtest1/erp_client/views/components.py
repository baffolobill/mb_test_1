# coding: utf-8
from django.views.generic import ListView, DetailView

from erp_test.models import Component
from erp_client.views.common import (
    BaseDeleteView, BaseUpdateView, BaseCreateView)
from erp_client.forms import ComponentForm, ComponentForm


class ComponentModelMixin(object):
    model = Component


class ComponentListView(ComponentModelMixin, ListView):
    template_name = 'erp_client/components/list.html'


class ComponentDetailView(ComponentModelMixin, DetailView):
    template_name = 'erp_client/components/detail.html'


class ComponentUpdateView(ComponentModelMixin, BaseUpdateView):
    form_class = ComponentForm


class ComponentCreateView(ComponentModelMixin, BaseCreateView):
    form_class = ComponentForm


class ComponentDeleteView(ComponentModelMixin, BaseDeleteView):
    pass
