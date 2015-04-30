# coding: utf-8
from django.conf.urls import include, url

from . import views


urlpatterns = [
    url(r'^nodes/', include([
        url(r'^$', views.NodeListView.as_view(), name='node-list'),
        url(r'^(?P<pk>\d+)/$', views.NodeDetailView.as_view(), name='node-detail'),
    ])),

    url(r'^floors/', include([
        url(r'^$', views.FloorListView.as_view(), name='floor-list'),
        url(r'^(?P<pk>\d+)/$', views.FloorDetailView.as_view(), name='floor-detail'),
    ])),

    url(r'^rooms/', include([
        url(r'^$', views.RoomListView.as_view(), name='room-list'),
        url(r'^(?P<pk>\d+)/$', views.RoomDetailView.as_view(), name='room-detail'),
    ])),

    url(r'^rows/', include([
        url(r'^$', views.RowListView.as_view(), name='row-list'),
        url(r'^(?P<pk>\d+)/$', views.RowDetailView.as_view(), name='row-detail'),
    ])),

    url(r'^racks/', include([
        url(r'^$', views.RackListView.as_view(), name='rack-list'),
        url(r'^(?P<pk>\d+)/$', views.RackDetailView.as_view(), name='rack-detail'),
    ])),

    url(r'^baskets/', include([
        url(r'^$', views.BasketListView.as_view(), name='basket-list'),
        url(r'^(?P<pk>\d+)/$', views.BasketDetailView.as_view(), name='basket-detail'),
    ])),

    url(r'^servers/', include([
        url(r'^$', views.ServerListView.as_view(), name='server-list'),
        url(r'^(?P<pk>\d+)/$', views.ServerDetailView.as_view(), name='server-detail'),
    ])),

    url(r'^server-templates/', include([
        url(r'^$', views.ServerTemplateListView.as_view(), name='server-template-list'),
        url(r'^(?P<pk>\d+)/$', views.ServerTemplateDetailView.as_view(), name='server-template-detail'),
    ])),

    url(r'^components/', include([
        url(r'^$', views.ComponentListView.as_view(), name='component-list'),
        url(r'^(?P<pk>\d+)/$', views.ComponentDetailView.as_view(), name='component-detail'),
    ])),
]
