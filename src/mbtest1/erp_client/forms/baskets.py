# coding: utf-8
from django import forms
from django.utils.translation import ugettext as _

from crispy_forms.helper import FormHelper
from crispy_forms.layout import Layout, Div, Submit, HTML, Button, Row, Field
from crispy_forms.bootstrap import AppendedText, PrependedText, FormActions

from erp_test.models import Basket, Rack, Server
from erp_test.exceptions import BasketIsFilled, BasketSlotIsBusy


class BasketForm(forms.ModelForm):

    helper = FormHelper()
    helper.form_class = 'form-horizontal'
    helper.layout = Layout(
        Div(
            Div('name'),
            css_class='row-fluid'
        ),
        Div(
            Div('slot_qty'),
            css_class='row-fluid'
        ),
        Div(
            Div('unit_takes'),
            css_class='row-fluid'
        ),

        FormActions(
            Submit('save_changes', _('Save changes'), css_class="btn-primary"),
            Submit('cancel', 'Cancel'),
        )
    )

    class Meta:
        model = Basket
        fields = ('name', 'slot_qty', 'unit_takes')


class BasketRackForm(forms.Form):

    rack = forms.ChoiceField(
        choices=[('', 'Choose a rack')],
        required=True,
        help_text='displayed only racks with enough gap for the basket')
    position = forms.IntegerField(
        required=False,
        min_value=1)

    def __init__(self, *args, **kwargs):
        self.basket = kwargs.pop('basket', None)
        super(BasketRackForm, self).__init__(*args, **kwargs)
        if self.basket:
            racks = Rack.objects.with_fullness('has_empty_height', self.basket.get_height())
            if self.basket.rack:
                racks = list(racks.exclude(id=self.basket.rack.pk))
                racks.insert(0, self.basket.rack)
            self.fields['rack'].choices += [
                (r.id, r.get_name())
                for r in racks
            ]

        self.helper = FormHelper()
        self.helper.form_tag = False
        self.helper.form_class = 'form-horizontal'
        self.helper.layout = Layout(
            Div(
                Div('rack'),
                css_class='row-fluid'
            ),
            Div(
                Div('position'),
                css_class='row-fluid'
            ),

            FormActions(
                Submit('save_changes', _('Save changes'), css_class="btn-primary"),
                Submit('cancel', 'Cancel'),
            )
        )


class BasketServerForm(forms.Form):

    server = forms.ChoiceField(
        choices=[('', 'Choose a server')],
        required=True,
        help_text='displayed only uninstalled servers')
    position = forms.IntegerField(
        required=False,
        min_value=1)

    def __init__(self, *args, **kwargs):
        self.basket = kwargs.pop('basket', None)
        self.server = kwargs.pop('server', None)
        super(BasketServerForm, self).__init__(*args, **kwargs)

        servers = Server.objects.uninstalled()
        if self.server:
            servers = list(servers.exclude(id=self.server.pk))
            servers.insert(0, self.server)
        self.fields['server'].choices += [
            (s.id, s.get_name())
            for s in servers
        ]

        self.helper = FormHelper()
        self.helper.form_tag = False
        self.helper.form_class = 'form-horizontal'
        self.helper.layout = Layout(
            Div(
                Div('server'),
                css_class='row-fluid'
            ),
            Div(
                Div('position'),
                css_class='row-fluid'
            ),

            FormActions(
                Submit('save_changes', _('Save changes'), css_class="btn-primary"),
                Submit('cancel', 'Cancel'),
            )
        )

    def clean_position(self):
        pos = self.cleaned_data.get('position', None)
        if not pos:
            try:
                pos = self.basket.find_free_position()
            except BasketIsFilled:
                raise forms.ValidationError(_('Basket has no free slots.'), code='invalid')

        if pos > self.basket.slot_qty:
            raise forms.ValidationError(_('Basket has only {} slots.').format(self.basket.slot_qty), code='invalid')

        try:
            self.basket.validate_position(pos)
        except BasketSlotIsBusy:
            raise forms.ValidationError(_('This slot already taken.'), code='invalid')

        return pos
