# coding: utf-8
from django.contrib import messages
from django.core.urlresolvers import reverse
from django.shortcuts import redirect, get_object_or_404
from django.views.generic import ListView, DetailView

from erp_test.models import Basket, Rack, Server
from erp_client.views.common import (
    BaseDeleteView, BaseUpdateView, BaseCreateView)
from erp_client.forms import BasketForm, BasketRackForm, BasketServerForm


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


class BasketActionsView(BasketModelMixin, DetailView):

    supported_actions = ['mount_to_rack', 'unmount_from_rack',
        'install_server', 'uninstall_server']

    def get_rack(self, pk=None):
        pk = pk or self.request.REQUEST.get('rack_id')
        return get_object_or_404(Rack, pk=pk)

    def get_server(self, pk=None):
        pk = pk or self.request.REQUEST.get('server_id')
        return get_object_or_404(Server, pk=pk)

    def get_basket(self):
        return get_object_or_404(Basket, pk=self.kwargs['pk'])

    def get_action(self):
        action = self.request.REQUEST.get('action')
        if action in self.supported_actions:
            return action
        return None

    def _mount_to_rack(self):
        """
        from GET request
        """
        self.template_name = 'erp_client/baskets/actions/mount_to_rack.html'

    def _process_mount_to_rack(self):
        """
        from POST request
        """
        basket = self.get_object()
        form = BasketRackForm(self.request.POST, basket=basket)
        if not form.is_valid():
            self._mount_to_rack()
            return self.render_to_response(self.get_context_data(form=form))

        rack = self.get_rack(form.cleaned_data['rack'])
        position = form.cleaned_data.get('position', None)
        if basket.rack:
            basket.rack.unmount(basket=basket)

        try:
            rack.mount(basket=basket, position=position)
        except Exception as exc:
            messages.error(self.request, str(exc))
        else:
            messages.success(self.request, u'Basket "{}" has been mount to the rack {}.'.format(basket.get_name, rack.get_name()))

        return redirect(self.get_success_url())

    def _process_unmount_from_rack(self):
        basket = self.get_object()
        if not basket.rack:
            messages.error(self.request, 'Basket is not mounted.')
            return

        try:
            basket.rack.unmount(basket=basket)
        except Exception as exc:
            messages.error(self.request, str(exc))
        else:
            messages.success(self.request, u'Basket "{}" has been unmounted.'.format(basket.get_name()))

    def _install_server(self):
        """
        from GET request.
        """
        self.template_name = 'erp_client/baskets/actions/install_server.html'

    def _process_install_server(self):
        """
        from POST request.
        """
        basket = self.get_object()
        form = BasketServerForm(self.request.POST, basket=basket)
        if not form.is_valid():
            self._install_server()
            return self.render_to_response(self.get_context_data(form=form))

        server = self.get_server(form.cleaned_data['server'])
        position = form.cleaned_data.get('position', None)
        if server.is_mounted():
            basket.unmount(server=server)

        try:
            basket.mount(server=server, position=position)
        except Exception as exc:
            messages.error(self.request, str(exc))
        else:
            messages.success(self.request, u'Server "{}" has been installed to the basket {}.'.format(server.get_name(), basket.get_name()))

        return redirect(self.get_success_url())

    def _process_uninstall_server(self):
        basket = self.get_object()
        server = self.get_server()
        if not server.is_mounted():
            messages.error(self.request, u'Server is not mounted/installed.')
            return

        try:
            basket.unmount(server=server)
        except Exception as exc:
            messages.error(self.request, str(exc))
        else:
            messages.success(self.request, u'Server "{}" has been uninstalled from Basket "{}".'.format(server.get_name(), basket.get_name()))

    def get_context_data(self, **kwargs):
        ctx = super(BasketActionsView, self).get_context_data(**kwargs)
        action = self.get_action()
        if action == 'mount_to_rack' and 'form' not in ctx:
            basket = self.get_object()
            form_kwargs = {
                'basket': self.get_object()
            }
            if basket.rack:
                form_kwargs['initial'] = {
                    'rack': basket.rack.pk,
                    'position': basket.get_position_in_rack(),
                }
            ctx['form'] = BasketRackForm(**form_kwargs)
        elif action == 'install_server' and 'form' not in ctx:
            basket = self.get_object()
            form_kwargs = {
                'basket': self.get_object()
            }
            if self.request.GET.get('position'):
                form_kwargs['initial'] = {
                    'position': self.request.GET['position'],
                }
            ctx['form'] = BasketServerForm(**form_kwargs)

        return ctx

    def get(self, request, *args, **kwargs):
        action = self.get_action()
        if action == 'mount_to_rack':
            self._mount_to_rack()
        elif action == 'install_server':
            self._install_server()
        return super(BasketActionsView, self).get(request, *args, **kwargs)

    def post(self, request, *args, **kwargs):
        if 'cancel' in request.POST:
            return redirect(self.get_success_url())
        self.object = self.get_object()
        action = self.get_action()
        if action == 'unmount_from_rack':
            self._process_unmount_from_rack()
        elif action == 'mount_to_rack':
            return self._process_mount_to_rack()
        elif action == 'uninstall_server':
            self._process_uninstall_server()
        elif action == 'install_server':
            return self._process_install_server()
        return redirect(self.get_success_url())

    def get_success_url(self):
        return reverse('basket-detail', args=[self.kwargs['pk']])
