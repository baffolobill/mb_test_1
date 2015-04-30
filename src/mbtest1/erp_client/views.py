# coding: utf-8
from django.views.generic import ListView, DetailView

from erp_test.models import (
    Node, Floor, Room, Row, Rack, Basket, Server, ServerTemplate,
    Component)


class NodeListView(ListView):
    model = Node
    template_name = 'erp_client/nodes/list.html'


class NodeDetailView(DetailView):
    model = Node
    template_name = 'erp_client/nodes/detail.html'


###############
# Floors
###############
class FloorListView(ListView):
    model = Floor
    template_name = 'erp_client/floors/list.html'


class FloorDetailView(DetailView):
    model = Floor
    template_name = 'erp_client/floors/detail.html'


###############
# Rooms
###############
class RoomListView(ListView):
    model = Room
    template_name = 'erp_client/rooms/list.html'


class RoomDetailView(DetailView):
    model = Room
    template_name = 'erp_client/rooms/detail.html'


###############
# Rows
###############
class RowListView(ListView):
    model = Row
    template_name = 'erp_client/rows/list.html'


class RowDetailView(DetailView):
    model = Row
    template_name = 'erp_client/rows/detail.html'


###############
# Racks
###############
class RackListView(ListView):
    model = Rack
    template_name = 'erp_client/racks/list.html'


class RackDetailView(DetailView):
    model = Rack
    template_name = 'erp_client/racks/detail.html'


###############
# Baskets
###############
class BasketListView(ListView):
    model = Basket
    template_name = 'erp_client/baskets/list.html'


class BasketDetailView(DetailView):
    model = Basket
    template_name = 'erp_client/baskets/detail.html'


###############
# Servers
###############
class ServerListView(ListView):
    model = Server
    template_name = 'erp_client/servers/list.html'


class ServerDetailView(DetailView):
    model = Server
    template_name = 'erp_client/servers/detail.html'


##################
# Server Templates
##################
class ServerTemplateListView(ListView):
    model = ServerTemplate
    template_name = 'erp_client/server_templates/list.html'


class ServerTemplateDetailView(DetailView):
    model = ServerTemplate
    template_name = 'erp_client/server_templates/detail.html'


###############
# Components
###############
class ComponentListView(ListView):
    model = Component
    template_name = 'erp_client/components/list.html'


class ComponentDetailView(DetailView):
    model = Component
    template_name = 'erp_client/components/detail.html'
