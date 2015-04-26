# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('erp_test', '0015_auto_20150425_1127'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='servertemplate',
            options={'verbose_name': 'Server Template', 'verbose_name_plural': 'Servers Templates'},
        ),
        migrations.AddField(
            model_name='component',
            name='kind',
            field=models.ForeignKey(related_name='kind_opts', default=1, to='erp_test.PropertyOption'),
            preserve_default=False,
        ),
        migrations.AlterUniqueTogether(
            name='servertemplatehdd',
            unique_together=set([('template', 'hdd_form_factor', 'hdd_connection_type')]),
        ),
    ]
