from django.conf.urls import include, url
from django.contrib import admin

urlpatterns = [
    # Examples:
    # url(r'^$', 'mbtest1.views.home', name='home'),
    # url(r'^blog/', include('blog.urls')),

    url(r'^admin/', include(admin.site.urls)),
    url(r'^api/v1/', include('erp_test.urls', namespace='api', app_name='erp_test')),
    url(r'^client/', include('erp_client.urls')),
    url(r'^', include('erp_client_emberjs.urls')),
]
