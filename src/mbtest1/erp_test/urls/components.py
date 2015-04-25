from django.conf.urls import url
from ..views import components as views


urlpatterns = [
    url(r'^$',
        views.ComponentList.as_view(),
        name='component-list'),

    url(r'^(?P<kind>[\w]+)/$',
        views.ComponentList.as_view(),
        name='component-list'),

    url(r'^(?P<kind>[\w]+)/(?P<pk>[0-9]+)/$',
        views.ComponentDetail.as_view(),
        name='component-kind-detail'),

    url(r'^(?P<pk>[0-9]+)/$',
        views.ComponentDetail.as_view(),
        name='component-detail'),

    #url(r'^(?P<pk>[0-9]+)/install$', views.ComponentServer.as_view(), name='component-server'),
    #url(r'^(?P<pk>[0-9]+)/properties$', views.ComponentProperties.as_view(), name='component-properties'),
]
