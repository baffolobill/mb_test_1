from django.conf.urls import url
from ..views import floors as views


urlpatterns = [
    url(r'^$',
        views.FloorList.as_view(),
        name='floor-list'),

    url(r'^/(?P<pk>\d+)/?$',
        views.FloorDetail.as_view(),
        name='floor-detail'),

    url(r'^/(?P<pk>\d+)/servers/?$',
        views.FloorServerList.as_view(),
        name='floor-server-list'),
]
