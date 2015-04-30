# coding: utf-8
from django.views.generic import ListView, DetailView

from erp_test.models import Server
from erp_client.views.common import (
    BaseDeleteView, BaseUpdateView, BaseCreateView)
from erp_client.forms import ServerForm


class ServerModelMixin(object):
    model = Server


class ServerListView(ServerModelMixin, ListView):
    template_name = 'erp_client/servers/list.html'


class ServerDetailView(ServerModelMixin, DetailView):
    template_name = 'erp_client/servers/detail.html'


class ServerUpdateView(ServerModelMixin, BaseUpdateView):
    form_class = ServerForm


class ServerCreateView(ServerModelMixin, BaseCreateView):
    form_class = ServerForm


class ServerDeleteView(ServerModelMixin, BaseDeleteView):
    pass
