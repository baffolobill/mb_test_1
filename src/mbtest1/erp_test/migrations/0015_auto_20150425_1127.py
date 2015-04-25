# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('erp_test', '0014_auto_20150424_1519'),
    ]

    operations = [
        migrations.CreateModel(
            name='BasketSlot',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('position', models.PositiveSmallIntegerField(default=1)),
            ],
            options={
                'verbose_name': 'Basket slot',
                'verbose_name_plural': 'Baskets slots',
            },
        ),
        migrations.RemoveField(
            model_name='basket',
            name='slots',
        ),
        migrations.AddField(
            model_name='basket',
            name='node',
            field=models.ForeignKey(related_name='baskets', blank=True, to='erp_test.Node', null=True),
        ),
        migrations.AddField(
            model_name='basket',
            name='rack',
            field=models.ForeignKey(related_name='baskets', blank=True, to='erp_test.Rack', null=True),
        ),
        migrations.AddField(
            model_name='basket',
            name='slot_qty',
            field=models.PositiveSmallIntegerField(default=8, verbose_name='Total slots Qty'),
        ),
        migrations.AddField(
            model_name='rack',
            name='node',
            field=models.ForeignKey(default=1, to='erp_test.Node'),
            preserve_default=False,
        ),
        migrations.AlterField(
            model_name='server',
            name='node',
            field=models.ForeignKey(related_name='servers', blank=True, to='erp_test.Node', null=True),
        ),
        migrations.AlterField(
            model_name='server',
            name='rack',
            field=models.ForeignKey(related_name='servers', blank=True, to='erp_test.Rack', null=True),
        ),
        migrations.AddField(
            model_name='basketslot',
            name='basket',
            field=models.ForeignKey(related_name='slots', to='erp_test.Basket'),
        ),
        migrations.AddField(
            model_name='basketslot',
            name='server',
            field=models.ForeignKey(to='erp_test.Server'),
        ),
        migrations.AlterUniqueTogether(
            name='basketslot',
            unique_together=set([('basket', 'server')]),
        ),
    ]
