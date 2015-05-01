# coding: utf-8
from django.views.generic import ListView, DetailView

from erp_test.models import Component
from erp_client.views.common import (
    BaseDeleteView, BaseUpdateView, BaseCreateView)
from erp_client.forms import ComponentForm, ComponentFilterForm, ComponentPropertiesForm


class ComponentModelMixin(object):
    model = Component


class ComponentListView(ComponentModelMixin, ListView):
    template_name = 'erp_client/components/list.html'

    def get_queryset(self):
        qs = super(ComponentListView, self).get_queryset()
        kind = self.request.GET.get('kind', None)
        state = self.request.GET.get('state', None)
        return qs.of_kind(kind=kind).with_state(state)

    def get_context_data(self, **kwargs):
        ctx = super(ComponentListView, self).get_context_data(**kwargs)
        ctx['filter_form'] = ComponentFilterForm(data=self.request.GET)
        return ctx


class ComponentDetailView(ComponentModelMixin, DetailView):
    template_name = 'erp_client/components/detail.html'


class ComponentUpdateView(ComponentModelMixin, BaseUpdateView):
    form_class = ComponentForm


class ComponentCreateView(ComponentModelMixin, BaseCreateView):
    form_class = ComponentForm


class ComponentDeleteView(ComponentModelMixin, BaseDeleteView):
    pass


class ComponentUpdatePropertiesView(ComponentModelMixin, BaseUpdateView):
    form_class = ComponentPropertiesForm
