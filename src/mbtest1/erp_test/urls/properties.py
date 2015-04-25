from django.conf.urls import url
from ..views import properties as views


urlpatterns = [
    url(r'^$',
        views.PropertyList.as_view(),
        name='property-list'),

    url(r'^(?P<kind>[\w]+)/$',
        views.PropertyList.as_view(),
        name='property-list'),

    url(r'^(?P<pk>[0-9]+)/$',
        views.PropertyDetail.as_view(),
        name='property-detail'),

    #url(r'^(?P<pk>[0-9]+)/options$', views.PropertyOptions.as_view(), name='property-options'),
]
