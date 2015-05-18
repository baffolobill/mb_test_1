# coding: utf-8
"""
2.1 Пользователь может добавить тип сервера указав сокет,
    слоты памяти типоразмер и стандарты подключения дисков. (CRUD)
"""
import copy

#from django.test import TestCase
from django.core.urlresolvers import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from ..models import ServerTemplate, ServerTemplateHdd


class TestServerTemplateCRUD(APITestCase):
    fixtures = ['erp_test/tests/fixtures/server_templates_crud.json',]

    def test_server_template_list(self):
        url = reverse('api:server-template-list')
        response = self.client.get(url, format='json')
        data = [{'id': obj.id, 'name': obj.name, 'cpu_socket': obj.cpu_socket_id,
                 'cpu_qty': obj.cpu_qty, 'ram_standard': obj.ram_standard_id,
                 'ram_qty': obj.ram_qty, 'unit_takes': obj.unit_takes,
                 'hdds': [{'hdd_qty': hdd.hdd_qty, 'hdd_form_factor': hdd.hdd_form_factor_id, 'hdd_connection_type': hdd.hdd_connection_type_id}
                          for hdd in obj.hdds.all()]}
                for obj in ServerTemplate.objects.all()]
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data, data)

    def test_server_template_detail(self):
        url = reverse('api:server-template-detail', args=[1])
        response = self.client.get(url, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data, {'id': 1, 'name': 'Base Server', 'cpu_socket': 4,
                 'cpu_qty': 10, 'ram_standard': 6, 'ram_qty': 20, 'unit_takes': 1,
                 'hdds': [{'hdd_qty': 3, 'hdd_form_factor': 7, 'hdd_connection_type': 8}]})

    def test_server_template_create(self):
        url = reverse('api:server-template-list')
        data = {'name': 'Create Server Template via API', 'cpu_socket': 4,
                 'cpu_qty': 1, 'ram_standard': 6, 'ram_qty': 2, 'unit_takes': 10,
                 'hdds': [{'hdd_qty': 99, 'hdd_form_factor': 7, 'hdd_connection_type': 8}]}
        have_to_return = copy.copy(data)
        have_to_return['id'] = 2

        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data, have_to_return)

    def test_server_template_update(self):
        url = reverse('api:server-template-detail', args=[1])
        data = {'name': 'ST #4'}
        response = self.client.patch(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['name'], data['name'])

    def test_server_template_update_hdds(self):
        url = reverse('api:server-template-detail', args=[1])
        data = {'hdds': [{'hdd_qty': 999, 'hdd_form_factor': 7, 'hdd_connection_type': 8}]}
        response = self.client.patch(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['hdds'], data['hdds'])

    def test_server_template_delete(self):
        url = reverse('api:server-template-detail', args=[1])
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(ServerTemplate.objects.count(), 0)
        self.assertEqual(ServerTemplateHdd.objects.count(), 0)
