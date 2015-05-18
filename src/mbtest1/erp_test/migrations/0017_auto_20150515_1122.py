# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('erp_test', '0016_auto_20150425_2310'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='basket',
            options={'verbose_name': 'Basket', 'verbose_name_plural': 'Baskets'},
        ),
        migrations.AlterModelOptions(
            name='server',
            options={'verbose_name': 'Server', 'verbose_name_plural': 'Servers'},
        ),
        migrations.AlterModelOptions(
            name='servertemplate',
            options={'verbose_name': 'Server Template', 'verbose_name_plural': 'Server Templates'},
        ),
        migrations.AddField(
            model_name='room',
            name='node',
            field=models.ForeignKey(blank=True, to='erp_test.Node', null=True),
        ),
        migrations.AddField(
            model_name='row',
            name='floor',
            field=models.ForeignKey(blank=True, to='erp_test.Floor', null=True),
        ),
        migrations.AddField(
            model_name='row',
            name='node',
            field=models.ForeignKey(blank=True, to='erp_test.Node', null=True),
        ),
        migrations.AddField(
            model_name='server',
            name='floor',
            field=models.ForeignKey(related_name='servers', blank=True, to='erp_test.Floor', null=True),
        ),
        migrations.AddField(
            model_name='server',
            name='room',
            field=models.ForeignKey(related_name='servers', blank=True, to='erp_test.Room', null=True),
        ),
        migrations.AddField(
            model_name='server',
            name='row',
            field=models.ForeignKey(related_name='servers', blank=True, to='erp_test.Row', null=True),
        ),
        migrations.AlterField(
            model_name='rack',
            name='node',
            field=models.ForeignKey(blank=True, to='erp_test.Node', null=True),
        ),
        migrations.AlterField(
            model_name='unit',
            name='basket',
            field=models.ForeignKey(related_name='units', blank=True, to='erp_test.Basket', null=True),
        ),
        migrations.AlterField(
            model_name='unit',
            name='server',
            field=models.ForeignKey(related_name='units', blank=True, to='erp_test.Server', null=True),
        ),
    ]
