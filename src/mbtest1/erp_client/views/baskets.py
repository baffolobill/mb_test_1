# coding: utf-8
from django.views.generic import ListView, DetailView

from erp_test.models import Basket
from erp_client.views.common import (
    BaseDeleteView, BaseUpdateView, BaseCreateView)
from erp_client.forms import BasketForm


class BasketModelMixin(object):
    model = Basket


class BasketListView(BasketModelMixin, ListView):
    template_name = 'erp_client/baskets/list.html'


class BasketDetailView(BasketModelMixin, DetailView):
    template_name = 'erp_client/baskets/detail.html'


class BasketUpdateView(BasketModelMixin, BaseUpdateView):
    form_class = BasketForm


class BasketCreateView(BasketModelMixin, BaseCreateView):
    form_class = BasketForm


class BasketDeleteView(BasketModelMixin, BaseDeleteView):
    pass
