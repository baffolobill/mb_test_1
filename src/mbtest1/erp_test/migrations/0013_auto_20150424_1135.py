# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('erp_test', '0012_auto_20150424_1050'),
    ]

    operations = [
        migrations.CreateModel(
            name='ComponentPropertyValue',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('value', models.CharField(max_length=100, verbose_name='Value', blank=True)),
                ('value_as_float', models.FloatField(null=True, verbose_name='Value as float', blank=True)),
            ],
        ),
        migrations.AlterUniqueTogether(
            name='componentandtemplatepropertyvalue',
            unique_together=set([]),
        ),
        migrations.RemoveField(
            model_name='componentandtemplatepropertyvalue',
            name='component',
        ),
        migrations.RemoveField(
            model_name='componentandtemplatepropertyvalue',
            name='property',
        ),
        migrations.RemoveField(
            model_name='componentandtemplatepropertyvalue',
            name='property_group',
        ),
        migrations.RemoveField(
            model_name='componentandtemplatepropertyvalue',
            name='template',
        ),
        migrations.AlterUniqueTogether(
            name='templatespropertiesrelation',
            unique_together=set([]),
        ),
        migrations.RemoveField(
            model_name='templatespropertiesrelation',
            name='property',
        ),
        migrations.RemoveField(
            model_name='templatespropertiesrelation',
            name='template',
        ),
        migrations.RemoveField(
            model_name='property',
            name='templates',
        ),
        migrations.RemoveField(
            model_name='propertygroup',
            name='templates',
        ),
        migrations.RemoveField(
            model_name='server',
            name='components',
        ),
        migrations.AddField(
            model_name='component',
            name='server',
            field=models.ForeignKey(related_name='components', blank=True, to='erp_test.Server', null=True),
        ),
        migrations.AlterField(
            model_name='servertemplatehdd',
            name='hdd_qty',
            field=models.PositiveSmallIntegerField(default=1),
        ),
        migrations.AlterField(
            model_name='servertemplatehdd',
            name='template',
            field=models.ForeignKey(related_name='hdds', to='erp_test.ServerTemplate'),
        ),
        migrations.DeleteModel(
            name='ComponentAndTemplatePropertyValue',
        ),
        migrations.DeleteModel(
            name='TemplatesPropertiesRelation',
        ),
        migrations.AddField(
            model_name='componentpropertyvalue',
            name='component',
            field=models.ForeignKey(related_name='property_values', verbose_name='Component', to='erp_test.Component'),
        ),
        migrations.AddField(
            model_name='componentpropertyvalue',
            name='option',
            field=models.ForeignKey(blank=True, to='erp_test.PropertyOption', null=True),
        ),
        migrations.AddField(
            model_name='componentpropertyvalue',
            name='property',
            field=models.ForeignKey(related_name='property_values', verbose_name='Property', to='erp_test.Property'),
        ),
        migrations.AddField(
            model_name='componentpropertyvalue',
            name='property_group',
            field=models.ForeignKey(related_name='property_values', verbose_name='Property group', blank=True, to='erp_test.PropertyGroup', null=True),
        ),
        migrations.AlterUniqueTogether(
            name='componentpropertyvalue',
            unique_together=set([('component', 'property', 'property_group', 'value')]),
        ),
    ]
