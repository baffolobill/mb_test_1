from django.conf.urls import url
from ..views import nodes as views


urlpatterns = [
    url(r'^$',
        views.NodeList.as_view(),
        name='node-list'),

    url(r'^(?P<pk>\d+)/$',
        views.NodeDetail.as_view(),
        name='node-detail'),

    url(r'^(?P<pk>\d+)/servers/$',
        views.NodeServerList.as_view(),
        name='node-server-list'),
]
