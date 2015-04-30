# coding: utf-8
from django.views.generic import ListView, DetailView

from erp_test.models import Row
from erp_client.views.common import (
    BaseDeleteView, BaseUpdateView, BaseCreateView)
from erp_client.forms import RowForm


class RowModelMixin(object):
    model = Row


class RowListView(RowModelMixin, ListView):
    template_name = 'erp_client/rows/list.html'


class RowDetailView(RowModelMixin, DetailView):
    template_name = 'erp_client/rows/detail.html'


class RowUpdateView(RowModelMixin, BaseUpdateView):
    form_class = RowForm


class RowCreateView(RowModelMixin, BaseCreateView):
    form_class = RowForm


class RowDeleteView(RowModelMixin, BaseDeleteView):
    pass
