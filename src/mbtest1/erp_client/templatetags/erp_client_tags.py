# coding: utf-8
from collections import OrderedDict

from django import template
from django.core.urlresolvers import reverse

from erp_test.models import (
    Node, Floor, Room, Row, Rack, Basket, Server, ServerTemplate,
    Component)

register = template.Library()


@register.filter
def multiply(value, m):
    try:
        return int(value) * m
    except ValueError:
        return ''


@register.inclusion_tag('erp_client/templatetags/rack_scheme.html', takes_context=True)
def render_rack_scheme(context, rack):
    units = dict([(u, {'id': u, 'rack': rack, 'unit_takes': 1, 'server': None, 'basket': None})
             for u in xrange(1, rack.total_units+1)])

    for runit in rack.units.all():
        units[runit.position].update({
            'unit_takes': runit.unit_takes,
            'basket': runit.basket,
            'server': runit.server,
            })
    for uid, unit in units.items():
        if unit['unit_takes'] > 1:
            for uuid in xrange(uid+1, uid+unit['unit_takes']):
                units[uuid]['unit_takes'] = 0
    return {
        'rack': rack,
        'units': units.values(),
    }


@register.inclusion_tag('erp_client/templatetags/rack_unit.html')
def render_unit(unit):
    basket = None
    if unit['basket']:
        slots = dict([(s, {'id': s, 'server': None})
             for s in xrange(1, unit['basket'].slot_qty+1)])

        for bslot in unit['basket'].slots.all():
            slots[bslot.position].update({
                'server': bslot.server,
                })
        basket = {'slots': slots.values()}

    return {
        'unit': unit,
        'basket': basket,
    }


@register.inclusion_tag('erp_client/templatetags/basket_scheme.html')
def render_basket_scheme(basket_obj):
    basket = None
    if basket_obj:
        slots = dict([(s, {'id': s, 'server': None})
             for s in xrange(1, basket_obj.slot_qty+1)])

        for bslot in basket_obj.slots.all():
            slots[bslot.position].update({
                'server': bslot.server,
                })
        basket = {'slots': slots.values()}
    return {
        'basket': basket,
        'object': basket_obj,
    }


@register.inclusion_tag('erp_client/templatetags/breadcrumbs.html')
def render_breadcrumbs(obj):
    crumbs = [{
        'url': reverse('client:{}-list'.format(obj._meta.model_name.lower())),
        'name': obj._meta.verbose_name_plural,
    }]
    object_path = OrderedDict([(k, None)
                               for k in ['node', 'floor', 'room', 'row', 'rack',
                                         'basket', 'server', 'server-template',
                                         'component']])

    if isinstance(obj, Node):
        object_path['node'] = obj

    elif isinstance(obj, Floor):
        object_path['node'] = obj.node
        object_path['floor'] = obj

    elif isinstance(obj, Room):
        object_path['node'] = obj.floor.node
        object_path['floor'] = obj.floor
        object_path['room'] = obj

    elif isinstance(obj, Row):
        object_path['node'] = obj.room.floor.node
        object_path['floor'] = obj.room.floor
        object_path['room'] = obj.room
        object_path['row'] = obj

    elif isinstance(obj, Rack):
        object_path['node'] = obj.node
        object_path['floor'] = obj.row.room.floor
        object_path['room'] = obj.row.room
        object_path['row'] = obj.row
        object_path['rack'] = obj

    elif isinstance(obj, Basket):
        if obj.rack:
            object_path['node'] = obj.node
            object_path['floor'] = obj.rack.row.room.floor
            object_path['room'] = obj.rack.row.room
            object_path['row'] = obj.rack.row
            object_path['rack'] = obj.rack
        object_path['basket'] = obj

    elif isinstance(obj, Server):
        rack = obj.rack
        if obj.basket:
            rack = obj.basket.rack

        if rack:
            object_path['node'] = obj.node
            object_path['floor'] = rack.row.room.floor
            object_path['room'] = rack.row.room
            object_path['row'] = rack.row
            object_path['rack'] = rack
        if obj.basket:
            object_path['basket'] = obj.basket
        object_path['server'] = obj

    elif isinstance(obj, ServerTemplate):
        object_path['server-template'] = obj

    elif isinstance(obj, Component):
        object_path['component'] = obj

    for k, v in object_path.items():
        if v is not None:
            crumbs.append({
                'url': reverse('client:{}-detail'.format(k), args=[v.pk]),
                'name': v.get_name(),
                })

    return {
        'crumbs': crumbs,
    }
