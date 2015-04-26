# coding: utf-8
"""
/properties/
/properties/:id/
/properties/groups/
/properties/groups/:id/
/properties/groups/:name/
"""
from django.test import TestCase
from django.core.urlresolvers import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from ..models import Property, PropertyGroup
from ..defaults import PROPERTY_TEXT_FIELD


class TestPropertiesCRUD(APITestCase):
    fixtures = ['erp_test/tests/fixtures/properties_crud.json',]

    def test_property_list(self):
        url = reverse('property-list')
        response = self.client.get(url, format='json')
        data = [{'id': obj.id, 'name': obj.name, 'title': obj.title,
                 'required': obj.required, 'position': obj.position,
                 'type': obj.type, 'unit': obj.unit
                } for obj in Property.objects.all()]
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data, data)

    def test_property_create(self):
        url = reverse('property-list')
        data = {'name': 'test', 'title': 'Test', 'required': False,
                'position': 999, 'type': PROPERTY_TEXT_FIELD}
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_405_METHOD_NOT_ALLOWED)

    def test_server_update(self):
        url = reverse('property-detail', args=[1])
        data = {'name': 'new server'}
        response = self.client.patch(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_405_METHOD_NOT_ALLOWED)

    def test_server_delete(self):
        url = reverse('property-detail', args=[1])
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_405_METHOD_NOT_ALLOWED)


class TestPropertyGroupCRUD(APITestCase):
    fixtures = ['erp_test/tests/fixtures/property_groups.json',]

    def test_property_group_list(self):
        url = reverse('property-group-list')
        data = [{'id': obj.id, 'name': obj.name}
                for obj in PropertyGroup.objects.all()]
        response = self.client.get(url, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data, data)

    def test_property_group_detail_by_pk(self):
        url = reverse('property-group-detail', args=[2])
        data = {'id': 2, 'name': 'cpu',
                'properties': [
                    {'id': 2, 'name': 'cpu.socket',
                    'title': 'CPU Socket', 'required': True,
                    'position': 2, 'type': 3, 'unit': ''},
                ]}
        response = self.client.get(url, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data, data)

    def test_property_group_detail_by_name(self):
        url = reverse('property-group-detail-by_name', args=['cpu'])
        data = {'id': 2, 'name': 'cpu',
                'properties': [
                    {'id': 2, 'name': 'cpu.socket',
                    'title': 'CPU Socket', 'required': True,
                    'position': 2, 'type': 3, 'unit': ''},
                ]}
        response = self.client.get(url, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data, data)
