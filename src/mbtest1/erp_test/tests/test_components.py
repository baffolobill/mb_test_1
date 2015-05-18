# coding: utf-8
"""
1.1 Пользователь может управлять компонентами и их характеристиками (CRUD).
1.2 Пользователь может просмотривать свободные компоненты
    (недобавленные к серверу)

TODO:
    1) add tests for ComponentSerializer.to_internal_value
"""
import copy

from django.test import TestCase
from django.core.urlresolvers import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from ..models import Component
from ..defaults import ComponentState


class TestComponentsCRUD(APITestCase):
    fixtures = ['erp_test/tests/fixtures/components_crud.json',]

    def test_component_list(self):
        url = reverse('api:component-list')
        response = self.client.get(url, format='json')
        prop_value = lambda v: {'id': v.option_id, 'name': v.option.name} if v.option else v.get_value()
        data = [{'id': obj.id, 'name': obj.name, 'manufacturer': obj.manufacturer,
                 'model_name': obj.model_name, 'serial_number': obj.serial_number,
                 'state': obj.state, 'kind': obj.kind_id, 'server': obj.server,
                 'properties': [{
                        'id': prop['id'],
                        'name': prop['name'],
                        'title': prop['title'],
                        'type': prop['type'],
                        'type_str': prop['property'].get_type_display(),
                        'value': prop_value(prop['value']) if prop['value'] else None,
                  } for prop in obj.get_properties()]
                } for obj in Component.objects.all()]
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data, data)

    def test_component_list_of_kind(self):
        url = reverse('api:component-list-of_kind', args=['cpu'])
        response = self.client.get(url, format='json')
        prop_value = lambda v: {'id': v.option_id, 'name': v.option.name} if v.option else v.get_value()
        data = [{'id': obj.id, 'name': obj.name, 'manufacturer': obj.manufacturer,
                 'model_name': obj.model_name, 'serial_number': obj.serial_number,
                 'state': obj.state, 'kind': obj.kind_id, 'server': obj.server,
                 'properties': [{
                        'id': prop['id'],
                        'name': prop['name'],
                        'title': prop['title'],
                        'type': prop['type'],
                        'type_str': prop['property'].get_type_display(),
                        'value': prop_value(prop['value']) if prop['value'] else None,
                  } for prop in obj.get_properties()]
                } for obj in Component.objects.of_kind('cpu')]
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data, data)

    def test_component_detail(self):
        url = reverse('api:component-detail', args=[1])
        response = self.client.get(url, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data,
                {
                    'id': 1,
                    'name': 'Intel Xeon Haswell-EP',
                    'state': 'free',
                    'serial_number': '1234',
                    'model_name': 'Xeon Haswell-EP',
                    'manufacturer': 'Intel',
                    'kind': 1,
                    'server': None,
                    'properties': [
                        {
                            'id': 2,
                            'name': 'cpu.socket',
                            'title': 'CPU Socket',
                            'type': 3,
                            'type_str': 'Select field',
                            'value': {
                                'id': 4,
                                'name': 'LGA2011-3',
                            }
                        }
                    ]
                })

    def test_component_create_valid(self):
        url = reverse('api:component-list')
        data = {
            'name': 'Intel Outside',
            'state': 'free',
            'serial_number': '4321',
            'model_name': 'Outside',
            'manufacturer': 'Intel',
            'kind': 1,
            'properties': [
                {'property_id': 2, 'value': 4},
            ]
        }
        have_to_return = {
            'id': 5,
            'kind': 1,
            'name': u'Intel Outside',
            'state': 'free',
            'server': None,
            'properties': [
                {
                    'name': u'cpu.socket',
                    'title': u'CPU Socket',
                    'value': {
                        'id': 4,
                        'name': u'LGA2011-3'
                    },
                    'type_str': u'Select field',
                    'type': 3,
                    'id': 2
                }
            ],
            'serial_number': u'4321',
            'model_name': u'Outside',
            'manufacturer': u'Intel',
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data, have_to_return)

    def test_component_create__kind_required(self):
        url = reverse('api:component-list')
        data = {
            'name': 'Intel Outside',
            'state': 'free',
            'serial_number': '4321',
            'model_name': 'Outside',
            'manufacturer': 'Intel',
            'properties': [
                {'property_id': 2, 'value': 4},
            ]
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_component_create_of_kind(self):
        url = reverse('api:component-list-of_kind', args=['cpu'])
        data = {
            'name': 'Intel Outside',
            'state': 'free',
            'serial_number': '4321',
            'model_name': 'Outside',
            'manufacturer': 'Intel',
            'properties': [
                {'property_id': 2, 'value': 4},
            ]
        }
        have_to_return = {
            'id': 5,
            'kind': 1,
            'name': u'Intel Outside',
            'state': 'free',
            'server': None,
            'properties': [
                {
                    'name': u'cpu.socket',
                    'title': u'CPU Socket',
                    'value': {
                        'id': 4,
                        'name': u'LGA2011-3'
                    },
                    'type_str': u'Select field',
                    'type': 3,
                    'id': 2
                }
            ],
            'serial_number': u'4321',
            'model_name': u'Outside',
            'manufacturer': u'Intel',
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data, have_to_return)

    def test_component_update(self):
        url = reverse('api:component-detail', args=[2])
        data = {'state': 'installed'}
        response = self.client.patch(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['state'], data['state'])

    def test_component_delete(self):
        url = reverse('api:component-detail', args=[3])
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(Component.objects.count(), 3)



class TestComponentModel(TestCase):
    fixtures = ['erp_test/tests/fixtures/basket_model_test.json']

    def test_get_properties(self):
        pass


class TestComponentActions(APITestCase):
    fixtures = ['erp_test/tests/fixtures/component_actions.json']

    def test_list_all_free_components(self):
        url = reverse('api:component-list')
        url = "{}?state=free".format(url)
        response = self.client.get(url, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(Component.objects.with_state(ComponentState.FREE).count(), 4)

    def test_list_free_components_of_kind(self):
        url = reverse('api:component-list')
        url = "{}?state=free".format(url)
        response = self.client.get(url, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(Component.objects.of_kind(kind='cpu').with_state(ComponentState.FREE).count(), 1)
