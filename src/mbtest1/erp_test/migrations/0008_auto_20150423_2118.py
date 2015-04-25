# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('erp_test', '0007_auto_20150423_2026'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='basket',
            name='servers',
        ),
        migrations.AddField(
            model_name='basket',
            name='slots',
            field=models.PositiveSmallIntegerField(default=8, verbose_name='Total slots'),
        ),
        migrations.AddField(
            model_name='server',
            name='basket',
            field=models.ForeignKey(related_name='servers', default=8, to='erp_test.Basket'),
            preserve_default=False,
        ),
    ]
