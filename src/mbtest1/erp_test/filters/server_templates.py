# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django_filters import FilterSet

from ..models import ServerTemplate


class ServerTemplateFilter(FilterSet):
    class Meta:
        model = ServerTemplate
        fields = ['cpu_socket', 'cpu_qty', 'ram_standard', 'ram_qty',
                  'unit_takes', 'servers_uses', 'hdds__hdd_connection_type',
                  'hdds__hdd_form_factor', 'hdds__hdd_qty']
