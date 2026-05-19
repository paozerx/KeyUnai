# Generated manually for payment system

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('orders', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='PaymentSettings',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('bank_name', models.CharField(default='ธนาคารกสิกรไทย', max_length=100)),
                ('account_name', models.CharField(default='KeyUnai', max_length=100)),
                ('account_number', models.CharField(default='000-0-00000-0', max_length=50)),
                ('qr_code', models.ImageField(blank=True, null=True, upload_to='payment_qr/')),
                ('is_active', models.BooleanField(default=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
            ],
            options={
                'verbose_name': 'ตั้งค่าการชำระเงิน',
                'verbose_name_plural': 'ตั้งค่าการชำระเงิน',
            },
        ),
        migrations.AddField(
            model_name='order',
            name='admin_note',
            field=models.TextField(blank=True, help_text='หมายเหตุจากแอดมิน (เช่น เหตุผลที่ปฏิเสธ)'),
        ),
        migrations.AddField(
            model_name='order',
            name='payment_slip',
            field=models.ImageField(blank=True, null=True, upload_to='payment_slips/'),
        ),
        migrations.AddField(
            model_name='order',
            name='slip_uploaded_at',
            field=models.DateTimeField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='orderitem',
            name='key_revealed',
            field=models.BooleanField(default=False),
        ),
        migrations.AlterField(
            model_name='order',
            name='status',
            field=models.CharField(
                choices=[
                    ('PENDING', 'รอชำระเงิน'),
                    ('AWAITING_APPROVAL', 'รอตรวจสอบสลิป'),
                    ('COMPLETED', 'ชำระเงินแล้ว'),
                    ('REJECTED', 'ปฏิเสธ'),
                    ('CANCELED', 'ยกเลิก'),
                ],
                default='PENDING',
                max_length=20,
            ),
        ),
    ]
