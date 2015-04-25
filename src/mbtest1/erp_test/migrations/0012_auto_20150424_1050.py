# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('erp_test', '0011_auto_20150424_1026'),
    ]

    operations = [
        migrations.AddField(
            model_name='servertemplate',
            name='cpu_qty',
            field=models.PositiveSmallIntegerField(default=1),
        ),
        migrations.AddField(
            model_name='servertemplate',
            name='cpu_socket',
            field=models.ForeignKey(related_name='cpu_socket_opts', default=1, to='erp_test.PropertyOption'),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='servertemplate',
            name='ram_qty',
            field=models.PositiveSmallIntegerField(default=1),
        ),
        migrations.AddField(
            model_name='servertemplate',
            name='ram_standard',
            field=models.ForeignKey(related_name='ram_standard_opts', default=1, to='erp_test.PropertyOption'),
            preserve_default=False,
        ),
    ]
