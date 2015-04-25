# coding: utf-8
from django.conf.urls import url, include
from rest_framework.urlpatterns import format_suffix_patterns
from ..views import api_root


urlpatterns = format_suffix_patterns([
    url(r'^$', api_root),
    url(r'^baskets/', include('erp_test.urls.baskets')),
    url(r'^components/', include('erp_test.urls.components')),
    url(r'^floors/', include('erp_test.urls.floors')),
    url(r'^nodes/', include('erp_test.urls.nodes')),
    url(r'^properties/', include('erp_test.urls.properties')),
    url(r'^racks/', include('erp_test.urls.racks')),
    url(r'^rooms/', include('erp_test.urls.rooms')),
    url(r'^rows/', include('erp_test.urls.rows')),
    url(r'^server-templates/', include('erp_test.urls.server_templates')),
    url(r'^servers/', include('erp_test.urls.servers')),
])
