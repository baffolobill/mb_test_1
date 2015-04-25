from django.conf.urls import url
from ..views import racks as views


urlpatterns = [
    url(r'^$',
        views.RackList.as_view(),
        name='rack-list'),

    url(r'^(?P<pk>\d+)/$',
        views.RackDetail.as_view(),
        name='rack-detail'),
]
