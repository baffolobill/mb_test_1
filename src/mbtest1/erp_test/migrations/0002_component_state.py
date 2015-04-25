# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations
import django_fsm


class Migration(migrations.Migration):

    dependencies = [
        ('erp_test', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='component',
            name='state',
            field=django_fsm.FSMField(default=b'free', max_length=50, verbose_name='Component State', choices=[(b'installed', 'Installed'), (b'free', 'Free'), (b'broken', 'Broken')]),
        ),
    ]
