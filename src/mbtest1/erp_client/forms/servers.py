# coding: utf-8
from django import forms
from django.utils.translation import ugettext as _

from crispy_forms.helper import FormHelper
from crispy_forms.layout import Layout, Div, Submit, HTML, Button, Row, Field
from crispy_forms.bootstrap import AppendedText, PrependedText, FormActions

from erp_test.models import Server, Rack, Basket


class ServerForm(forms.ModelForm):

    helper = FormHelper()
    helper.form_class = 'form-horizontal'
    helper.layout = Layout(
        Div(
            Div('name'),
            css_class='row-fluid'
        ),
        Div(
            Div('template'),
            css_class='row-fluid'
        ),

        FormActions(
            Submit('save_changes', _('Save changes'), css_class="btn-primary"),
            Submit('cancel', 'Cancel'),
        )
    )

    class Meta:
        model = Server
        fields = ('name', 'template')


class ServerComponentForm(forms.Form):

    component = forms.ChoiceField(
        choices=[('', 'Choose component')],
        required=True)

    def __init__(self, *args, **kwargs):
        self.server = kwargs.pop('server', None)
        super(ServerComponentForm, self).__init__(*args, **kwargs)
        if self.server:
            self.fields['component'].choices += [
                (c.id, c.get_name())
                for c in self.server.find_all_valid_components()
            ]

        self.helper = FormHelper()
        self.helper.form_tag = False
        self.helper.form_class = 'form-horizontal'
        self.helper.layout = Layout(
            Div(
                Div('component'),
                css_class='row-fluid'
            ),

            FormActions(
                Submit('save_changes', _('Save changes'), css_class="btn-primary"),
                Submit('cancel', 'Cancel'),
            )
        )


class ServerRackForm(forms.Form):
    rack = forms.ChoiceField(
        choices=[('', 'Choose a rack')],
        required=True,
        help_text='displayed only racks with empty units which can fit the server')
    position = forms.IntegerField(
        required=False,
        min_value=1)

    def __init__(self, *args, **kwargs):
        self.server = kwargs.pop('server', None)
        self.rack = kwargs.pop('rack', None)
        super(ServerRackForm, self).__init__(*args, **kwargs)
        if self.server:
            racks = Rack.objects.with_fullness(fullness='has_empty_height', height=self.server.get_height())
            if self.rack:
                racks = list(racks.exclude(id=self.rack.pk))
                racks.insert(0, self.rack)
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

    def clean(self):
        cd = super(ServerRackForm, self).clean()
        rack_id = cd.get('rack')
        position = cd.get('position')
        if rack_id:
            try:
                rack = Rack.objects.get(id=rack_id)
            except Rack.DoesNotExist:
                self.add_error('rack', _('There is no Rack with ID:{}').format(rack_id))
            else:
                if position:
                    is_position_ok = False
                    for gap in rack.find_gaps():
                        gap_start = gap['position']
                        gap_end = gap_start + gap['position'] - 1
                        if position >= gap_start and (position+self.server.get_height()-1)<=gap_end:
                            is_position_ok = True
                            break
                    if not is_position_ok:
                        self.add_error('position',
                                       _('Server height is greater than the gap at the'
                                         ' selected position. Server height is {}. Gap'
                                         ' size is {}.').format(self.server.get_height(), gap['height']))

        return cd


class ServerBasketForm(forms.Form):
    basket = forms.ChoiceField(
        choices=[('', 'Choose a basket')],
        required=True,
        help_text='displayed only baskets with empty slots')
    position = forms.IntegerField(
        required=False,
        min_value=1)

    def __init__(self, *args, **kwargs):
        self.server = kwargs.pop('server', None)
        self.basket = kwargs.pop('basket', None)
        super(ServerBasketForm, self).__init__(*args, **kwargs)
        if self.server:
            baskets = Basket.objects.with_empty_slots()
            if self.basket:
                baskets = list(baskets.exclude(id=self.basket.pk))
                baskets.insert(0, self.basket)
            self.fields['basket'].choices += [
                (b.id, b.get_name())
                for b in baskets
            ]

        self.helper = FormHelper()
        self.helper.form_tag = False
        self.helper.form_class = 'form-horizontal'
        self.helper.layout = Layout(
            Div(
                Div('basket'),
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

    def clean(self):
        cd = super(ServerBasketForm, self).clean()
        basket_id = cd.get('basket')
        position = cd.get('position')
        if basket_id:
            try:
                basket = Basket.objects.get(id=basket_id)
            except Basket.DoesNotExist:
                self.add_error('basket', _('There is no Basket with ID:{}').format(basket_id))
            else:
                if position:
                    is_position_ok = False
                    for gap in basket.find_gaps():
                        gap_start = gap['position']
                        gap_end = gap['position'] + gap['slots'] - 1
                        if position >= gap_start and position <= gap_end:
                            is_position_ok = True
                            break
                    if not is_position_ok:
                        self.add_error('position',
                                       _('Server takes more slots than basket has. Server size is {}.'
                                         ' Gap size is {}.').format(server.slot_takes, gap['slots']))
        return cd
