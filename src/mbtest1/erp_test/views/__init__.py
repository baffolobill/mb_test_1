# coding: utf-8
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.reverse import reverse


@api_view(('GET',))
def api_root(request, format=None):
    return Response({
        'nodes': reverse('node-list', request=request, format=format),
        'floors': reverse('floor-list', request=request, format=format),
        'rooms': reverse('room-list', request=request, format=format),
        'rows': reverse('row-list', request=request, format=format),
        'racks': reverse('rack-list', request=request, format=format),
        'server-templates': reverse('server-template-list', request=request, format=format),
        'baskets': reverse('basket-list', request=request, format=format),
        'components': reverse('component-list', request=request, format=format),

        'servers': reverse('server-list', request=request, format=format),

        'properties': reverse('property-list', request=request, format=format),
    })
