# coding: utf-8
from django.test import TestCase
from django.core.urlresolvers import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from ..models import Unit, Basket, Rack, Row, Room, Floor, Node
from ..exceptions import RackIsFilled


class TestRackCRUD(APITestCase):
    """
        3.1.5 Пользователь может выполнять CRUD операции с стойками
    """

    def setUp(self):
        nodes = [
            {'name': 'ams1', 'address': 'Washington DC'},
        ]

        for item in nodes:
            Node.objects.create(**item)

        floors = [
            {'name': '#1', 'node_id': 1},
        ]

        for item in floors:
            Floor.objects.create(**item)

        rooms = [
            {'name': '#1', 'floor_id': 1},
        ]

        for item in rooms:
            Room.objects.create(**item)

        rows = [
            {'name': '#1', 'room_id': 1},
            {'name': '#2', 'room_id': 1},
        ]

        for item in rows:
            Row.objects.create(**item)

        racks = [
            {'name': 'rack #1', 'row_id': 1, 'node_id': 1, 'total_units': 48},
            {'name': 'rack #2', 'row_id': 2, 'node_id': 1, 'total_units': 48},
            {'name': 'rack #4', 'row_id': 1, 'node_id': 1, 'total_units': 48},
        ]

        for item in racks:
            Rack.objects.create(**item)

    def test_rack_list(self):
        url = reverse('rack-list')
        response = self.client.get(url, format='json')
        data = [{'id': obj.id, 'name': obj.name, 'row': obj.row_id,
                 'total_units': obj.total_units, 'max_gap': obj.max_gap,
                 'node': obj.node_id}
                for obj in Rack.objects.all()]
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data, data)

    def test_rack_detail(self):
        url = reverse('rack-detail', args=[1])
        response = self.client.get(url, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data, {'id': 1, 'name': 'rack #1', 'row': 1,
                                         'total_units': 48, 'max_gap': 48, 'node': 1})

    def test_rack_create(self):
        url = reverse('rack-list')
        data = {'name': 'baz', 'row': 2, 'node': 1, 'total_units': 48}
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data,
                         {'id': 4, 'name': 'baz', 'row': 2, 'node': 1,
                          'total_units': 48, 'max_gap': 48})

    def test_rack_update(self):
        url = reverse('rack-detail', args=[2])
        data = {'row': 1}
        response = self.client.patch(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['row'], data['row'])

    def test_rack_delete(self):
        url = reverse('rack-detail', args=[3])
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(Rack.objects.count(), 2)


class TestRackModel(TestCase):

    def setUp(self):
        nodes = [
            {'name': 'ams1', 'address': 'Washington DC'},
        ]

        for item in nodes:
            Node.objects.create(**item)

        floors = [
            {'name': '#1', 'node_id': 1},
        ]

        for item in floors:
            Floor.objects.create(**item)

        rooms = [
            {'name': '#1', 'floor_id': 1},
        ]

        for item in rooms:
            Room.objects.create(**item)

        rows = [
            {'name': '#1', 'room_id': 1},
            {'name': '#2', 'room_id': 1},
        ]

        for item in rows:
            Row.objects.create(**item)

        racks = [
            {'name': 'rack #1', 'row_id': 1, 'node_id': 1, 'total_units': 48},
            {'name': 'rack #2', 'row_id': 2, 'node_id': 1, 'total_units': 48},
            {'name': 'rack #4', 'row_id': 1, 'node_id': 1, 'total_units': 48},
        ]

        for item in racks:
            Rack.objects.create(**item)

    def test_find_gap(self):
        basket_1 = Basket.objects.create(unit_takes=1)
        basket_2 = Basket.objects.create(unit_takes=2)
        basket_4 = Basket.objects.create(unit_takes=4)
        basket_8 = Basket.objects.create(unit_takes=8)
        rack = Rack.objects.all()[0]

        self.assertEqual(rack.find_gaps(), [{'position': 1, 'height': 48}])

        Unit.objects.create(rack=rack, position=1, basket=basket_1)
        self.assertEqual(rack.find_gaps(), [{'position': 2, 'height': 47}])

        Unit.objects.create(rack=rack, position=4, basket=basket_2)
        self.assertEqual(rack.find_gaps(), [{'position': 2, 'height': 2},
                                            {'position': 6, 'height': 43}])

        Unit.objects.create(rack=rack, position=6, basket=basket_4)
        self.assertEqual(rack.find_gaps(), [{'position': 2, 'height': 2},
                                            {'position': 10, 'height': 39}])

        Unit.objects.create(rack=rack, position=40, basket=basket_8)
        self.assertEqual(rack.find_gaps(), [{'position': 2, 'height': 2},
                                            {'position': 10, 'height': 30},
                                            {'position': 48, 'height': 1}])

    def test_find_position_of_height(self):
        basket_1 = Basket.objects.create(unit_takes=1)
        basket_2 = Basket.objects.create(unit_takes=2)
        basket_4 = Basket.objects.create(unit_takes=4)
        rack = Rack.objects.all()[0]

        self.assertEqual(rack.find_position_of_height(height=1), 1)

        Unit.objects.create(rack=rack, position=1, basket=basket_1)
        self.assertEqual(rack.find_position_of_height(height=2), 2)

        Unit.objects.create(rack=rack, position=4, basket=basket_2)
        self.assertEqual(rack.find_position_of_height(height=4), 6)

        Unit.objects.create(rack=rack, position=6, basket=basket_4)
        self.assertEqual(rack.find_position_of_height(height=4), 10)

        rack_2 = Rack.objects.all()[1]
        basket_48 = Basket.objects.create(unit_takes=48)
        Unit.objects.create(rack=rack_2, position=1, basket=basket_48)
        with self.assertRaises(RackIsFilled):
            rack_2.find_position_of_height(height=1)

    def test_mount(self):
        basket_1 = Basket.objects.create(unit_takes=1)
        basket_2 = Basket.objects.create(unit_takes=2)
        basket_4 = Basket.objects.create(unit_takes=4)
        basket_8 = Basket.objects.create(unit_takes=8)
        rack = Rack.objects.all()[0]

        self.assertEqual(Unit.objects.count(), 0)

        rack.mount(basket=basket_1, position=1, height=basket_1.get_height())
        self.assertEqual(Unit.objects.count(), 1)

        rack.mount(basket=basket_2,
                   position=rack.find_position_of_height(basket_2.get_height()),
                   height=basket_2.get_height())
        self.assertEqual(Unit.objects.count(), 2)

        rack.mount(basket=basket_4,
                   position=rack.find_position_of_height(basket_4.get_height()),
                   height=basket_4.get_height())
        self.assertEqual(Unit.objects.count(), 3)

        rack.mount(basket=basket_8,
                   position=rack.find_position_of_height(basket_8.get_height()),
                   height=basket_8.get_height())
        self.assertEqual(Unit.objects.count(), 4)

    def test_unmount(self):
        rack = Rack.objects.all()[0]
        basket_1 = Basket.objects.create(unit_takes=1)

        self.assertEqual(Unit.objects.count(), 0)

        rack.mount(basket=basket_1, position=1, height=basket_1.get_height())
        self.assertEqual(Unit.objects.count(), 1)

        rack.unmount(basket=basket_1)
        self.assertEqual(Unit.objects.count(), 0)


class TestRackServer(APITestCase):
    """
        3.5 Пользователь может просмотривать список
            стоек, имеющих свободные юниты

        all | empty | has_empty | filled | has_empty_height
    """
    fixtures = ['erp_test/tests/fixtures/rack_servers.json',]

    def test_rack_fullness__all(self):
        url = reverse('rack-list')
        url = "{}?fullness=all".format(url)
        response = self.client.get(url, format='json')
        # тупая проверка количеством
        self.assertEqual(len(response.data), 4)

    def test_rack_fullness__empty(self):
        url = reverse('rack-list')
        url = "{}?fullness=empty".format(url)
        response = self.client.get(url, format='json')
        # тупая проверка количеством
        self.assertEqual(len(response.data), 1)

    def test_rack_fullness__has_empty(self):
        url = reverse('rack-list')
        url = "{}?fullness=has_empty".format(url)
        response = self.client.get(url, format='json')
        # тупая проверка количеством
        self.assertEqual(len(response.data), 3)

    def test_rack_fullness__filled(self):
        url = reverse('rack-list')
        url = "{}?fullness=filled".format(url)
        response = self.client.get(url, format='json')
        # тупая проверка количеством
        self.assertEqual(len(response.data), 1)

    def test_rack_fullness__has_empty_height__ret_1(self):
        url = reverse('rack-list')
        url = "{}?fullness=has_empty_height&height=3".format(url)
        response = self.client.get(url, format='json')
        # тупая проверка количеством
        self.assertEqual(len(response.data), 2)

    def test_rack_fullness__has_empty_height__ret_0(self):
        url = reverse('rack-list')
        url = "{}?fullness=has_empty_height&height=50".format(url)
        response = self.client.get(url, format='json')
        # тупая проверка количеством
        self.assertEqual(len(response.data), 0)
