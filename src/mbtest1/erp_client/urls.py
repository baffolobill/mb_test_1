# coding: utf-8
from django.conf.urls import include, url

from . import views


urlpatterns = [
    url(r'^nodes/', include([
        url(r'^$', views.NodeListView.as_view(), name='node-list'),
        url(r'^create/$', views.NodeCreateView.as_view(), name='node-create'),
        url(r'^(?P<pk>\d+)/$', views.NodeDetailView.as_view(), name='node-detail'),
        url(r'^(?P<pk>\d+)/update/$', views.NodeUpdateView.as_view(), name='node-update'),
        url(r'^(?P<pk>\d+)/delete/$', views.NodeDeleteView.as_view(), name='node-delete'),
    ])),

    url(r'^floors/', include([
        url(r'^$', views.FloorListView.as_view(), name='floor-list'),
        url(r'^create/$', views.FloorCreateView.as_view(), name='floor-create'),
        url(r'^(?P<pk>\d+)/$', views.FloorDetailView.as_view(), name='floor-detail'),
        url(r'^(?P<pk>\d+)/update/$', views.FloorUpdateView.as_view(), name='floor-update'),
        url(r'^(?P<pk>\d+)/delete/$', views.FloorDeleteView.as_view(), name='floor-delete'),
    ])),

    url(r'^rooms/', include([
        url(r'^$', views.RoomListView.as_view(), name='room-list'),
        url(r'^create/$', views.RoomCreateView.as_view(), name='room-create'),
        url(r'^(?P<pk>\d+)/$', views.RoomDetailView.as_view(), name='room-detail'),
        url(r'^(?P<pk>\d+)/update/$', views.RoomUpdateView.as_view(), name='room-update'),
        url(r'^(?P<pk>\d+)/delete/$', views.RoomDeleteView.as_view(), name='room-delete'),
    ])),

    url(r'^rows/', include([
        url(r'^$', views.RowListView.as_view(), name='row-list'),
        url(r'^create/$', views.RowCreateView.as_view(), name='row-create'),
        url(r'^(?P<pk>\d+)/$', views.RowDetailView.as_view(), name='row-detail'),
        url(r'^(?P<pk>\d+)/update/$', views.RowUpdateView.as_view(), name='row-update'),
        url(r'^(?P<pk>\d+)/delete/$', views.RowDeleteView.as_view(), name='row-delete'),
    ])),

    url(r'^racks/', include([
        url(r'^$', views.RackListView.as_view(), name='rack-list'),
        url(r'^create/$', views.RackCreateView.as_view(), name='rack-create'),
        url(r'^(?P<pk>\d+)/$', views.RackDetailView.as_view(), name='rack-detail'),
        url(r'^(?P<pk>\d+)/update/$', views.RackUpdateView.as_view(), name='rack-update'),
        url(r'^(?P<pk>\d+)/delete/$', views.RackDeleteView.as_view(), name='rack-delete'),
        url(r'^(?P<pk>\d+)/actions/$', views.RackActionsView.as_view(), name='rack-actions'),
    ])),

    url(r'^baskets/', include([
        url(r'^$', views.BasketListView.as_view(), name='basket-list'),
        url(r'^create/$', views.BasketCreateView.as_view(), name='basket-create'),
        url(r'^(?P<pk>\d+)/$', views.BasketDetailView.as_view(), name='basket-detail'),
        url(r'^(?P<pk>\d+)/update/$', views.BasketUpdateView.as_view(), name='basket-update'),
        url(r'^(?P<pk>\d+)/delete/$', views.BasketDeleteView.as_view(), name='basket-delete'),
        url(r'^(?P<pk>\d+)/actions/$', views.BasketActionsView.as_view(), name='basket-actions'),
    ])),

    url(r'^servers/', include([
        url(r'^$', views.ServerListView.as_view(), name='server-list'),
        url(r'^create/$', views.ServerCreateView.as_view(), name='server-create'),
        url(r'^(?P<pk>\d+)/$', views.ServerDetailView.as_view(), name='server-detail'),
        url(r'^(?P<pk>\d+)/update/$', views.ServerUpdateView.as_view(), name='server-update'),
        url(r'^(?P<pk>\d+)/delete/$', views.ServerDeleteView.as_view(), name='server-delete'),
        url(r'^(?P<pk>\d+)/actions/$', views.ServerActionsView.as_view(), name='server-actions'),
    ])),

    url(r'^server-templates/', include([
        url(r'^$', views.ServerTemplateListView.as_view(), name='servertemplate-list'),
        url(r'^create/$', views.ServerTemplateCreateView.as_view(), name='servertemplate-create'),
        url(r'^(?P<pk>\d+)/$', views.ServerTemplateDetailView.as_view(), name='servertemplate-detail'),
        url(r'^(?P<pk>\d+)/update/$', views.ServerTemplateUpdateView.as_view(), name='servertemplate-update'),
        url(r'^(?P<pk>\d+)/delete/$', views.ServerTemplateDeleteView.as_view(), name='servertemplate-delete'),
    ])),

    url(r'^components/', include([
        url(r'^$', views.ComponentListView.as_view(), name='component-list'),
        url(r'^create/$', views.ComponentCreateView.as_view(), name='component-create'),
        url(r'^(?P<pk>\d+)/$', views.ComponentDetailView.as_view(), name='component-detail'),
        url(r'^(?P<pk>\d+)/update/$', views.ComponentUpdateView.as_view(), name='component-update'),
        url(r'^(?P<pk>\d+)/delete/$', views.ComponentDeleteView.as_view(), name='component-delete'),
    ])),
]
