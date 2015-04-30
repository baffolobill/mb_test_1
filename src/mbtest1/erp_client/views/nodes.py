# coding: utf-8
from django.views.generic import ListView, DetailView

from erp_test.models import Node
from erp_client.views.common import (
    BaseDeleteView, BaseUpdateView, BaseCreateView)
from erp_client.forms import NodeForm


class NodeModelMixin(object):
    model = Node


class NodeListView(NodeModelMixin, ListView):
    template_name = 'erp_client/nodes/list.html'


class NodeDetailView(NodeModelMixin, DetailView):
    template_name = 'erp_client/nodes/detail.html'


class NodeUpdateView(NodeModelMixin, BaseUpdateView):
    form_class = NodeForm


class NodeCreateView(NodeModelMixin, BaseCreateView):
    form_class = NodeForm


class NodeDeleteView(NodeModelMixin, BaseDeleteView):
    pass
