# coding: utf-8
from collections import OrderedDict

from django import forms
from django.utils.translation import ugettext as _

from crispy_forms.helper import FormHelper
from crispy_forms.layout import Layout, Div, Submit, HTML, Button, Row, Field
from crispy_forms.bootstrap import AppendedText, PrependedText, FormActions

from erp_test.models import Component, PropertyOption, PropertyGroup, ComponentPropertyValue
from erp_test.defaults import ComponentState


class ComponentFilterForm(forms.Form):
    def _kind_choices():
        return PropertyOption.objects\
            .values_list('id', 'name')\
            .filter(property__name='component.kind')

    kind = forms.ChoiceField(
        choices=[('', 'All')]+list(_kind_choices()),
        required=False)
    state = forms.ChoiceField(
        choices=[(ComponentState._ALL, 'All')]+list(ComponentState.CHOICES),
        required=False)


class ComponentForm(forms.ModelForm):

    helper = FormHelper()
    helper.form_class = 'form-horizontal'
    helper.form_tag = False
    helper.layout = Layout(
        Div(
            Div('name'),
            css_class='row-fluid'
        ),
        Div(
            Div('manufacturer'),
            css_class='row-fluid'
        ),
        Div(
            Div('model_name'),
            css_class='row-fluid'
        ),
        Div(
            Div('serial_number'),
            css_class='row-fluid'
        ),
        Div(
            Div('kind'),
            css_class='row-fluid'
        ),
        FormActions(
            Submit('save_changes', _('Save changes'), css_class="btn-primary"),
            Submit('cancel', 'Cancel'),
        )
    )

    def __init__(self, *args, **kwargs):
        super(ComponentForm, self).__init__(*args, **kwargs)
        self.fields['kind'].choices = [
            (o.pk, o.name)
            for o in self.fields['kind'].queryset.all()
        ]

    class Meta:
        model = Component
        fields = ('name', 'manufacturer', 'model_name', 'serial_number', 'kind')


class ComponentPropertiesForm(forms.Form):

    def __init__(self, *args, **kwargs):
        self.instance = kwargs.pop('instance', None)
        initial = kwargs.pop('initial', {})
        fields = OrderedDict()
        layout = Layout()
        property_group = PropertyGroup.objects.get(name=self.instance.kind.name)
        values = ComponentPropertyValue.objects.filter(component=self.instance)
        values_map = dict([(v.property_id, v) for v in values])
        for prop in property_group.properties.all():
            field_name = prop.name.replace('.', '_')
            field_kwargs = {
                'label': prop.title,
                'required': prop.required,
            }
            if field_name not in initial and prop.pk in values_map:
                if prop.is_select_field:
                    initial[field_name] = values_map[prop.pk].option_id
                else:
                    initial[field_name] = values_map[prop.pk].get_value()

            if prop.is_text_field:
                field_class = forms.CharField
            elif prop.is_number_field:
                field_class = forms.IntegerField
            elif prop.is_select_field:
                field_class = forms.ChoiceField
                field_kwargs['choices'] = [
                    (o.id, o.name)
                    for o in prop.options.all()
                ]
            else:
                continue
            fields[field_name] = field_class(**field_kwargs)
            layout.append(
                Div(
                    Div(field_name, css_class='col-xs-12'),
                    css_class='row-fluid'
                )
            )
        layout.append(
            FormActions(
                Submit('save_changes', _('Save changes'), css_class="btn-primary"),
                Submit('cancel', 'Cancel'),
            )
        )
        super(ComponentPropertiesForm, self).__init__(*args, **kwargs)
        self.helper = FormHelper()
        self.helper.form_class = 'form-horizontal'
        self.helper.form_tag = False
        self.helper.layout = layout
        self.fields = fields
        self.initial = initial

    def save(self, *args, **kwargs):
        property_group = PropertyGroup.objects.get(name=self.instance.kind.name)
        properties = property_group.properties.all()
        values = ComponentPropertyValue.objects.filter(component=self.instance)
        values_map = dict([(v.property_id, v) for v in values])
        options_map = dict([(o.pk, o) for o in PropertyOption.objects.filter(property__in=properties)])
        for prop in properties:
            field_name = prop.name.replace('.', '_')

            if field_name not in self.cleaned_data:
                if prop.pk in values_map:
                    values_map[prop.pk].delete()
                    values_map.pop(prop.pk)
                continue

            value = self.cleaned_data[field_name]
            if prop.pk in values_map:
                cpv = values_map[prop.pk]
                if prop.is_select_field:
                    cpv.option = options_map[int(value)]
                else:
                    cpv.value = value or ''
                cpv.save()
            else:
                kw = {
                    'component': self.instance,
                    'property': prop,
                    'property_group': property_group,
                    'value': value or '',
                }
                if prop.is_select_field:
                    kw['option'] = options_map[int(value)]
                ComponentPropertyValue.objects.create(**kw)
        return self.instance
