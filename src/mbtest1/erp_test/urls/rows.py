from django.conf.urls import url
from ..views import rows as views


urlpatterns = [
    url(r'^$',
        views.RowList.as_view(),
        name='row-list'),

    url(r'^/(?P<pk>\d+)/?$',
        views.RowDetail.as_view(),
        name='row-detail'),

    url(r'^/(?P<pk>\d+)/servers/?$',
        views.RowServerList.as_view(),
        name='row-server-list'),
]
