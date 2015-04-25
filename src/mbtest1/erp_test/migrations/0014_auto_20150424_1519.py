# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('erp_test', '0013_auto_20150424_1135'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='component',
            options={'verbose_name': 'Component', 'verbose_name_plural': 'Components'},
        ),
        migrations.AddField(
            model_name='servertemplate',
            name='unit_takes',
            field=models.PositiveSmallIntegerField(default=1, verbose_name='height in units'),
        ),
        migrations.AlterField(
            model_name='groupspropertiesrelation',
            name='property',
            field=models.ForeignKey(related_name='groupproperties', verbose_name='Property', to='erp_test.Property'),
        ),
    ]
