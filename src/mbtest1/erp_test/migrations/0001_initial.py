# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Basket',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('name', models.CharField(max_length=255, verbose_name='Name')),
            ],
            options={
                'abstract': False,
            },
        ),
        migrations.CreateModel(
            name='Component',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('name', models.CharField(max_length=255, verbose_name='Name')),
                ('manufacturer', models.CharField(max_length=200)),
                ('model_name', models.CharField(max_length=200)),
                ('serial_number', models.CharField(max_length=200)),
                ('stock_amount', models.PositiveSmallIntegerField(default=0)),
            ],
            options={
                'verbose_name': 'Server Component',
                'verbose_name_plural': 'Servers Components',
            },
        ),
        migrations.CreateModel(
            name='ComponentAndTemplatePropertyValue',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('value', models.CharField(max_length=100, verbose_name='Value', blank=True)),
                ('value_as_float', models.FloatField(null=True, verbose_name='Value as float', blank=True)),
                ('component', models.ForeignKey(related_name='property_values', verbose_name='Component', blank=True, to='erp_test.Component', null=True)),
            ],
        ),
        migrations.CreateModel(
            name='ComponentsPropertiesRelation',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('position', models.IntegerField(default=999, verbose_name='Position')),
                ('component', models.ForeignKey(related_name='componentsproperties', verbose_name='Components', to='erp_test.Component')),
            ],
            options={
                'ordering': ('position',),
            },
        ),
        migrations.CreateModel(
            name='Floor',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('name', models.CharField(max_length=255, verbose_name='Name')),
            ],
            options={
                'verbose_name': 'Floor',
                'verbose_name_plural': 'Floors',
            },
        ),
        migrations.CreateModel(
            name='GroupsPropertiesRelation',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('position', models.IntegerField(default=999, verbose_name='Position')),
            ],
            options={
                'ordering': ('position',),
            },
        ),
        migrations.CreateModel(
            name='Node',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('name', models.CharField(max_length=255, verbose_name='Name')),
                ('address', models.TextField(blank=True)),
            ],
            options={
                'verbose_name': 'Node',
                'verbose_name_plural': 'Nodes',
            },
        ),
        migrations.CreateModel(
            name='Property',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('name', models.CharField(max_length=100, verbose_name='Name')),
                ('title', models.CharField(max_length=100, verbose_name='Title')),
                ('position', models.IntegerField(null=True, verbose_name='Position', blank=True)),
                ('unit', models.CharField(max_length=15, verbose_name='Unit', blank=True)),
                ('type', models.PositiveSmallIntegerField(default=2, verbose_name='Type', choices=[(1, 'Float field'), (2, 'Text field'), (3, 'Select field')])),
                ('required', models.BooleanField(default=False, verbose_name='Required')),
                ('components', models.ManyToManyField(related_name='properties', verbose_name='Components', to='erp_test.Component', through='erp_test.ComponentsPropertiesRelation', blank=True)),
            ],
            options={
                'ordering': ['position'],
                'verbose_name_plural': 'Properties',
            },
        ),
        migrations.CreateModel(
            name='PropertyGroup',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('name', models.CharField(max_length=50, verbose_name='Name', blank=True)),
                ('position', models.IntegerField(default=1000, verbose_name='Position')),
                ('components', models.ManyToManyField(related_name='property_groups', verbose_name='Servers Components', to='erp_test.Component', blank=True)),
            ],
            options={
                'ordering': ('position',),
            },
        ),
        migrations.CreateModel(
            name='PropertyOption',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('name', models.CharField(max_length=100, verbose_name='Name')),
                ('position', models.IntegerField(default=99, verbose_name='Position')),
                ('property', models.ForeignKey(related_name='options', verbose_name='Property', to='erp_test.Property')),
            ],
            options={
                'ordering': ['position'],
            },
        ),
        migrations.CreateModel(
            name='Rack',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('name', models.CharField(max_length=255, verbose_name='Name')),
            ],
            options={
                'verbose_name': 'Rack',
                'verbose_name_plural': 'Racks',
            },
        ),
        migrations.CreateModel(
            name='Room',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('name', models.CharField(max_length=255, verbose_name='Name')),
                ('floor', models.ForeignKey(to='erp_test.Floor')),
            ],
            options={
                'verbose_name': 'Room',
                'verbose_name_plural': 'Rooms',
            },
        ),
        migrations.CreateModel(
            name='Row',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('name', models.CharField(max_length=255, verbose_name='Name')),
                ('room', models.ForeignKey(to='erp_test.Room')),
            ],
            options={
                'verbose_name': 'Row',
                'verbose_name_plural': 'Rows',
            },
        ),
        migrations.CreateModel(
            name='Server',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('name', models.CharField(max_length=255, verbose_name='Name')),
            ],
            options={
                'abstract': False,
            },
        ),
        migrations.CreateModel(
            name='ServerComponents',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('quantity', models.PositiveSmallIntegerField(default=0)),
                ('component', models.ForeignKey(to='erp_test.Component')),
                ('server', models.ForeignKey(to='erp_test.Server')),
            ],
        ),
        migrations.CreateModel(
            name='ServerTemplate',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('name', models.CharField(max_length=255, verbose_name='Name')),
            ],
            options={
                'abstract': False,
            },
        ),
        migrations.CreateModel(
            name='TemplatesPropertiesRelation',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('position', models.IntegerField(default=999, verbose_name='Position')),
                ('property', models.ForeignKey(verbose_name='Property', to='erp_test.Property')),
                ('template', models.ForeignKey(related_name='templatesproperties', verbose_name='Servers Templates', to='erp_test.ServerTemplate')),
            ],
            options={
                'ordering': ('position',),
            },
        ),
        migrations.CreateModel(
            name='Unit',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('position', models.PositiveSmallIntegerField(default=1)),
                ('unit_takes', models.PositiveSmallIntegerField(default=1, verbose_name='height in units')),
                ('basket', models.ForeignKey(blank=True, to='erp_test.Basket', null=True)),
                ('rack', models.ForeignKey(to='erp_test.Rack')),
                ('server', models.ForeignKey(blank=True, to='erp_test.Server', null=True)),
            ],
            options={
                'verbose_name': 'Unit',
                'verbose_name_plural': 'Units',
            },
        ),
        migrations.AddField(
            model_name='server',
            name='components',
            field=models.ManyToManyField(to='erp_test.Component', through='erp_test.ServerComponents'),
        ),
        migrations.AddField(
            model_name='server',
            name='template',
            field=models.ForeignKey(to='erp_test.ServerTemplate'),
        ),
        migrations.AddField(
            model_name='rack',
            name='row',
            field=models.ForeignKey(to='erp_test.Row'),
        ),
        migrations.AddField(
            model_name='propertygroup',
            name='templates',
            field=models.ManyToManyField(related_name='property_groups', verbose_name='Servers Templates', to='erp_test.ServerTemplate', blank=True),
        ),
        migrations.AddField(
            model_name='property',
            name='groups',
            field=models.ManyToManyField(related_name='properties', verbose_name='Group', to='erp_test.PropertyGroup', through='erp_test.GroupsPropertiesRelation', blank=True),
        ),
        migrations.AddField(
            model_name='property',
            name='templates',
            field=models.ManyToManyField(related_name='properties', verbose_name='Servers Templates', to='erp_test.ServerTemplate', through='erp_test.TemplatesPropertiesRelation', blank=True),
        ),
        migrations.AddField(
            model_name='groupspropertiesrelation',
            name='group',
            field=models.ForeignKey(related_name='groupproperties', verbose_name='Group', to='erp_test.PropertyGroup'),
        ),
        migrations.AddField(
            model_name='groupspropertiesrelation',
            name='property',
            field=models.ForeignKey(verbose_name='Property', to='erp_test.Property'),
        ),
        migrations.AddField(
            model_name='floor',
            name='node',
            field=models.ForeignKey(to='erp_test.Node'),
        ),
        migrations.AddField(
            model_name='componentspropertiesrelation',
            name='property',
            field=models.ForeignKey(verbose_name='Property', to='erp_test.Property'),
        ),
        migrations.AddField(
            model_name='componentandtemplatepropertyvalue',
            name='property',
            field=models.ForeignKey(related_name='property_values', verbose_name='Property', to='erp_test.Property'),
        ),
        migrations.AddField(
            model_name='componentandtemplatepropertyvalue',
            name='property_group',
            field=models.ForeignKey(related_name='property_values', verbose_name='Property group', blank=True, to='erp_test.PropertyGroup', null=True),
        ),
        migrations.AddField(
            model_name='componentandtemplatepropertyvalue',
            name='template',
            field=models.ForeignKey(related_name='property_values', verbose_name='Servers Templates', blank=True, to='erp_test.ServerTemplate', null=True),
        ),
        migrations.AddField(
            model_name='basket',
            name='servers',
            field=models.ManyToManyField(to='erp_test.Server'),
        ),
        migrations.AlterUniqueTogether(
            name='templatespropertiesrelation',
            unique_together=set([('template', 'property')]),
        ),
        migrations.AlterUniqueTogether(
            name='servercomponents',
            unique_together=set([('server', 'component')]),
        ),
        migrations.AlterUniqueTogether(
            name='groupspropertiesrelation',
            unique_together=set([('group', 'property')]),
        ),
        migrations.AlterUniqueTogether(
            name='componentspropertiesrelation',
            unique_together=set([('component', 'property')]),
        ),
        migrations.AlterUniqueTogether(
            name='componentandtemplatepropertyvalue',
            unique_together=set([('component', 'template', 'property', 'property_group', 'value')]),
        ),
    ]
