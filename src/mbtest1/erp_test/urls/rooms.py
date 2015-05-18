from django.conf.urls import url
from ..views import rooms as views


urlpatterns = [
    url(r'^$',
        views.RoomList.as_view(),
        name='room-list'),

    url(r'^/(?P<pk>\d+)/?$',
        views.RoomDetail.as_view(),
        name='room-detail'),

    url(r'^/(?P<pk>\d+)/servers/?$',
        views.RoomServerList.as_view(),
        name='room-server-list'),
]
