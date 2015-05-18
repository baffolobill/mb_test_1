from django.conf.urls import url
from ..views import properties as views


urlpatterns = [
    url(r'^$',
        views.PropertyList.as_view(),
        name='property-list'),

    url(r'^/(?P<pk>\d+)/?$',
        views.PropertyDetail.as_view(),
        name='property-detail'),

    url(r'^/(?P<name>[a-z\._]+)/?$',
        views.PropertyDetail.as_view(),
        name='property-detail'),

    url(r'^/(?P<name>[a-z\._]+)/options/?$',
        views.PropertyOptionList.as_view(),
        name='property-option-list'),

    url(r'^/groups/?$',
        views.PropertyGroupList.as_view(),
        name='property-group-list'),

    url(r'^/groups/(?P<pk>\d+)/?$',
        views.PropertyGroupDetail.as_view(),
        name='property-group-detail'),

    url(r'^/groups/(?P<name>[\w]+)/?$',
        views.PropertyGroupDetail.as_view(),
        name='property-group-detail-by_name'),
]
