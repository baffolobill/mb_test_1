# coding: utf-8
from django.conf.urls import url
from django.views.generic.base import TemplateView

from . import views


urlpatterns = [
    url(r'^crossdomain.xml$',
        TemplateView.as_view(template_name='erp_client_emberjs/crossdomain.xml')),
    url(r'^robots.txt$',
        TemplateView.as_view(template_name='erp_client_emberjs/robots.txt')),
    url(r'^', views.IndexView.as_view(), name='index'),
]
