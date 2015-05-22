# coding: utf-8
from django.conf import settings
from django.views.generic.base import TemplateView


class IndexView(TemplateView):
    template_name = 'erp_client_emberjs/index.html'

