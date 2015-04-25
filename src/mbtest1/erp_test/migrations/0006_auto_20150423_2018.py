# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('erp_test', '0005_remove_component_stock_amount'),
    ]

    operations = [
        migrations.AddField(
            model_name='rack',
            name='max_gap',
            field=models.PositiveSmallIntegerField(default=0, verbose_name='max gap'),
        ),
        migrations.AddField(
            model_name='rack',
            name='total_units',
            field=models.PositiveSmallIntegerField(default=1, verbose_name='total units'),
        ),
        migrations.AlterField(
            model_name='unit',
            name='rack',
            field=models.ForeignKey(related_name='units', to='erp_test.Rack'),
        ),
    ]
