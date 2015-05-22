# coding: utf-8
from django.contrib import messages
from django.core.urlresolvers import reverse
from django.shortcuts import get_object_or_404, redirect
from django.views.generic import ListView, DetailView

from erp_test.exceptions import (
    ComponentNotInstalled, ComponentAlreadyInstalled, ComponentNotSupported,
    ServerHasNoFreeSlotForComponent, ComponentIsBroken)
from erp_test.models import Server, Component, Basket, Rack
from erp_client.views.common import (
    BaseDeleteView, BaseUpdateView, BaseCreateView)
from erp_client.forms import (
    ServerForm, ServerComponentForm, ServerRackForm, ServerBasketForm)


class ServerModelMixin(object):
    model = Server


class ServerListView(ServerModelMixin, ListView):
    template_name = 'erp_client/servers/list.html'


class ServerDetailView(ServerModelMixin, DetailView):
    template_name = 'erp_client/servers/detail.html'


class ServerUpdateView(ServerModelMixin, BaseUpdateView):
    form_class = ServerForm


class ServerCreateView(ServerModelMixin, BaseCreateView):
    form_class = ServerForm


class ServerDeleteView(ServerModelMixin, BaseDeleteView):
    pass


class ServerActionsView(ServerModelMixin, DetailView):

    supported_actions = ['install_component', 'uninstall_component',
        'mount', 'install_server', 'mount_server']

    def get_component(self, pk=None):
        pk = pk or self.request.REQUEST.get('component_id')
        return get_object_or_404(Component, pk=pk)

    def get_rack(self, pk=None):
        pk = pk or self.request.REQUEST.get('rack_id')
        return get_object_or_404(Rack, pk=pk)

    def get_basket(self, pk=None):
        pk = pk or self.request.REQUEST.get('basket_id')
        return get_object_or_404(Basket, pk=pk)

    def get_server(self):
        return self.get_object()

    def get_action(self):
        action = self.request.REQUEST.get('action')
        if action in self.supported_actions:
            return action
        return None

    def _install_component(self):
        """
        from GET request
        """
        self.template_name = 'erp_client/servers/actions/install_component.html'

    def _process_install_component(self):
        """
        from POST request
        """
        server = self.get_object()
        form = ServerComponentForm(self.request.POST, server=server)
        if not form.is_valid():
            self._install_component()
            return self.render_to_response(self.get_context_data(form=form))

        component = self.get_component(form.cleaned_data['component'])
        try:
            server.install_component(component)
        except ComponentAlreadyInstalled:
            messages.error(self.request, u'Component "{}" already installed.'.format(component.get_name()))
        except ComponentNotSupported:
            messages.error(self.request, u'Component "{}" not supported.'.format(component.get_name()))
        except ComponentIsBroken:
            messages.error(self.request, u'Component "{}" is broken.'.format(component.get_name()))
        except ServerHasNoFreeSlotForComponent:
            messages.error(self.request, u'Server does not have free slot for the component.')
        except Exception as exc:
            messages.error(self.request, str(exc))
        else:
            messages.success(self.request, u'Component "{}" has been installed.'.format(component.get_name()))

        return redirect(reverse('server-detail', args=[self.kwargs['pk']]))

    def _process_uninstall_component(self):
        server = self.get_object()
        component = self.get_component()
        try:
            server.uninstall_component(component)
        except ComponentNotInstalled:
            messages.error(self.request, u'Component "{}" is not installed.'.format(component.get_name()))
        except Exception as exc:
            messages.error(self.request, str(exc))
        else:
            messages.success(self.request, u'Component "{}" has been uninstalled.'.format(component.get_name()))

    def _mount(self):
        """
        from GET request.
        """
        self.template_name = 'erp_client/servers/actions/mount_where.html'

    def _install_server(self):
        self.template_name = 'erp_client/servers/actions/install_server.html'

    def _process_install_server(self):
        """
        from POST request.
        """
        server = self.get_object()
        form = ServerBasketForm(self.request.POST, server=server)
        if not form.is_valid():
            self._install_server()
            return self.render_to_response(self.get_context_data(form=form))

        basket = self.get_basket(form.cleaned_data['basket'])
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


    def _mount_server(self):
        self.template_name = 'erp_client/servers/actions/mount_server.html'

    def _process_mount_server(self):
        """
        from POST request.
        """
        server = self.get_object()
        form = ServerRackForm(self.request.POST, server=server)
        if not form.is_valid():
            self._mount_server()
            return self.render_to_response(self.get_context_data(form=form))

        rack = self.get_rack(form.cleaned_data['rack'])
        position = form.cleaned_data.get('position', None)
        if server.is_mounted():
            rack.unmount(server=server)

        try:
            rack.mount(server=server, position=position)
        except Exception as exc:
            messages.error(self.request, str(exc))
        else:
            messages.success(self.request, u'Server "{}" has been mounted to the rack {}.'.format(server.get_name(), rack.get_name()))

        return redirect(self.get_success_url())

    def get_context_data(self, **kwargs):
        ctx = super(ServerActionsView, self).get_context_data(**kwargs)
        action = self.get_action()
        server = self.get_object()
        if action == 'install_component' and 'form' not in ctx:
            ctx['form'] = ServerComponentForm(server=server)
        elif action == 'install_server' and 'form' not in ctx:
            form_kwargs = {
                'server': server
            }
            if self.request.GET.get('position'):
                form_kwargs['initial'] = {
                    'position': self.request.GET['position'],
                }
            ctx['form'] = ServerBasketForm(**form_kwargs)
        elif action == 'mount_server' and 'form' not in ctx:
            form_kwargs = {
                'server': server
            }
            if self.request.GET.get('position'):
                form_kwargs['initial'] = {
                    'position': self.request.GET['position'],
                }
            ctx['form'] = ServerRackForm(**form_kwargs)
        elif action == 'mount':
            ctx['position'] = self.request.GET.get('position')

        return ctx

    def get(self, request, *args, **kwargs):
        action = self.get_action()
        if action == 'install_component':
            self._install_component()
        elif action == 'mount':
            self._mount()
        elif action == 'mount_server':
            self._mount_server()
        elif action == 'install_server':
            self._install_server()
        return super(ServerActionsView, self).get(request, *args, **kwargs)

    def post(self, request, *args, **kwargs):
        if 'cancel' in request.POST:
            return redirect(self.get_success_url())
        self.object = self.get_server()
        action = self.get_action()
        if action == 'uninstall_component':
            self._process_uninstall_component()
        elif action == 'install_component':
            return self._process_install_component()
        elif action == 'install_server':
            return self._process_install_server()
        elif action == 'mount_server':
            return self._process_mount_server()
        return redirect(self.get_success_url())

    def get_success_url(self):
        return reverse('server-detail', args=[self.kwargs['pk']])
