# coding: utf-8
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.reverse import reverse


@api_view(('GET',))
def api_root(request, format=None):
    return Response({
        'nodes': reverse('api:node-list', request=request, format=format),
        'floors': reverse('api:floor-list', request=request, format=format),
        'rooms': reverse('api:room-list', request=request, format=format),
        'rows': reverse('api:row-list', request=request, format=format),
        'racks': reverse('api:rack-list', request=request, format=format),
        'server-templates': reverse('api:server-template-list', request=request, format=format),
        'baskets': reverse('api:basket-list', request=request, format=format),
        'components': reverse('api:component-list', request=request, format=format),
        'servers': reverse('api:server-list', request=request, format=format),
        'properties': reverse('api:property-list', request=request, format=format),
    })
