# coding: utf-8
"""
2.2 Пользователь может добавить сервер определенного типа (CRUD).
2.3 Пользователь может добавлять совместимые компоненты к серверу
    (Добавление несовместимых компонентов вызывает ошибку).
2.4 Пользователь может просмотравать связанные с сервером компоненты.

3.3 Пользователь может размещать сервера в
3.3.1 юнитах
3.3.2 корзинах
"""
from django.test import TestCase
from django.core.urlresolvers import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from ..models import Component, Server, Basket, Rack
from ..defaults import ComponentState


class TestServersCRUD(APITestCase):
    fixtures = ['erp_test/tests/fixtures/servers_crud.json',]

    def test_server_list(self):
        url = reverse('server-list')
        response = self.client.get(url, format='json')
        data = [{'id': obj.id, 'name': obj.name, 'template': obj.template_id,
                } for obj in Server.objects.all()]
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data, data)

    def test_server_create(self):
        url = reverse('server-list')
        data = {'template': 1, 'name': 'test server create via api'}
        have_to_return = {
            'template': 1,
            'name': 'test server create via api',
            'id': 3
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data, have_to_return)

    def test_server_update(self):
        url = reverse('server-detail', args=[2])
        data = {'name': 'new server'}
        response = self.client.patch(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['name'], data['name'])

    def test_server_delete(self):
        url = reverse('server-detail', args=[1])
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(Server.objects.count(), 1)


class TestServerComponents(APITestCase):
    fixtures = ['erp_test/tests/fixtures/server_components.json',]

    def test_server_component_list(self):
        url = reverse('server-component-list', args=[1])
        response = self.client.get(url, format='json')
        server = Server.objects.get(id=1)
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
                } for obj in server.get_installed_components()]
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data, data)

    def test_server_plug_component(self):
        server = Server.objects.get(id=1)
        component = Component.objects.get(id=1)
        server.uninstall_components(server.get_installed_components())
        self.assertEqual(list(server.get_installed_components()), [])

        url = reverse('server-component-list', args=[1])
        data = {'type': 'plug', 'component_id': 1}
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        self.assertEqual(list(server.get_installed_components()), [component])

    def test_server_plug_multiple_components(self):
        server = Server.objects.get(id=1)
        server.uninstall_components(server.get_installed_components())
        self.assertEqual(list(server.get_installed_components()), [])

        url = reverse('server-component-list', args=[1])
        data = {'type': 'plug', 'component_ids': [1,3]}
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        self.assertEqual(list(server.get_installed_components()),
                         list(Component.objects.filter(id__in=[1,3])))

    def test_server_unplug_component(self):
        server = Server.objects.get(id=1)
        component = Component.objects.get(id=1)
        server.uninstall_components(server.get_installed_components())
        self.assertEqual(list(server.get_installed_components()), [])

        # plug cpu
        server.install_component(component)
        self.assertEqual(list(server.get_installed_components()), [component])

        url = reverse('server-component-list', args=[1])
        data = {'type': 'unplug', 'component_id': 1}
        response = self.client.delete(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)

        self.assertEqual(list(server.get_installed_components()), [])

    def test_server_unplug_multiple_components(self):
        server = Server.objects.get(id=1)
        components = list(Component.objects.filter(id__in=[1,3]))
        server.uninstall_components(server.get_installed_components())
        self.assertEqual(list(server.get_installed_components()), [])

        # plug cpu, hdd
        server.install_components(components)
        self.assertEqual(list(server.get_installed_components()), components)

        # unplug via API request
        url = reverse('server-component-list', args=[1])
        data = {'type': 'unplug', 'component_ids': [1,3]}
        response = self.client.delete(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)

        # ensure its really unplugged
        self.assertEqual(list(server.get_installed_components()), [])

    def test_server_plug_unsupported_component(self):
        server = Server.objects.get(id=1)
        server.uninstall_components(server.get_installed_components())
        self.assertEqual(list(server.get_installed_components()), [])

        url = reverse('server-component-list', args=[1])
        data = {'type': 'plug', 'component_id': 4}
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data, [{'component_id': u'4', 'error': u'Component is not supported.'}])
        self.assertEqual(list(server.get_installed_components()), [])

    def test_server_plug_supported_and_not_components(self):
        server = Server.objects.get(id=1)
        server.uninstall_components(server.get_installed_components())
        self.assertEqual(list(server.get_installed_components()), [])

        url = reverse('server-component-list', args=[1])
        data = {'type': 'plug', 'component_ids': [3,4]}
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data, [{'component_id': u'4', 'error': u'Component is not supported.'}])
        self.assertEqual(list(server.get_installed_components()), [Component.objects.get(id=3)])


class TestServerActions(APITestCase):
    fixtures = ['erp_test/tests/fixtures/server_actions.json']

    def test_mount_to_rack(self):
        url = reverse('server-actions', args=[1])
        data = {'type': 'mount_to_rack', 'rack_id': 1}
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        server = Server.objects.get(id=1)
        self.assertEqual(server.rack_id, 1)

    def test_unmount_from_rack(self):
        rack = Rack.objects.get(id=1)
        server = Server.objects.get(id=1)
        rack.mount(server=server, position=1)
        self.assertEqual(rack.units.count(), 1)

        url = reverse('server-actions', args=[1])
        data = {'type': 'unmount_from_rack', 'rack_id': 1}
        response = self.client.delete(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)

        self.assertEqual(Server.objects.get(id=1).rack, None)

    def test_mount_to_basket(self):
        url = reverse('server-actions', args=[1])
        data = {'type': 'mount_to_basket', 'basket_id': 1}
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        basket = Basket.objects.get(id=1)
        self.assertEqual(basket.slots.count(), 1)

    def test_unmount_from_basket(self):
        basket = Basket.objects.get(id=1)
        server = Server.objects.get(id=1)
        basket.mount(server=server)
        self.assertEqual(basket.slots.count(), 1)

        url = reverse('server-actions', args=[1])
        data = {'type': 'unmount_from_basket', 'basket_id': 1}
        response = self.client.delete(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(basket.slots.count(), 0)
