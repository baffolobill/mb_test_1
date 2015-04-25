from django.conf.urls import url
from ..views import baskets as views


urlpatterns = [
    url(r'^$',
        views.BasketList.as_view(),
        name='basket-list'),

    url(r'^(?P<pk>\d+)/$',
        views.BasketDetail.as_view(),
        name='basket-detail'),

    url(r'^(?P<pk>\d+)/servers/$',
        views.BasketServerList.as_view(),
        name='basket-server-list'),

    url(r'^(?P<pk>\d+)/actions/$',
        views.BasketActions.as_view(),
        name='basket-actions'),
]
