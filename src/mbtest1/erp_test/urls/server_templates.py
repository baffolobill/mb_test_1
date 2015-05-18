from django.conf.urls import url
from ..views import server_templates as views


urlpatterns = [
    url(r'^$',
        views.ServerTemplateList.as_view(),
        name='server-template-list'),

    url(r'^/(?P<pk>\d+)/?$',
        views.ServerTemplateDetail.as_view(),
        name='server-template-detail'),

    url(r'^/(?P<pk>\d+)/servers/?$',
        views.ServerTemplateServerList.as_view(),
        name='server-template-server-list'),
]
