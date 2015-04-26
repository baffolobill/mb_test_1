from django.conf.urls import url
from ..views import components as views


urlpatterns = [
    url(r'^$',
        views.ComponentList.as_view(),
        name='component-list'),

    url(r'^(?P<pk>[0-9]+)/$',
        views.ComponentDetail.as_view(),
        name='component-detail'),

    url(r'^(?P<kind>[a-z]+)/$',
        views.ComponentList.as_view(),
        name='component-list-of_kind'),

    #url(r'^(?P<pk>[0-9]+)/actions/$', views.ComponentActions.as_view(), name='component-actions'),
]
