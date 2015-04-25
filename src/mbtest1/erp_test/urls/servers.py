from django.conf.urls import url
from ..views import servers as views


urlpatterns = [
    url(r'^$',
        views.ServerList.as_view(),
        name='server-list'),

    url(r'^(?P<pk>\d+)/$',
        views.ServerDetail.as_view(),
        name='server-detail'),

    url(r'^(?P<pk>\d+)/components/$',
        views.ServerComponentList.as_view(),
        name='server-component-list'),

    url(r'^(?P<pk>\d+)/actions/$',
        views.ServerActions.as_view(),
        name='server-actions'),
]
