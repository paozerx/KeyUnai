from django.db import models
from django.contrib.auth.models import User
from products.models import Game
from inventory.models import GameKey


class PaymentSettings(models.Model):
    """ข้อมูลบัญชีรับชำระเงิน (ตั้งค่าใน Django Admin)"""
    bank_name = models.CharField(max_length=100, default='ธนาคารกสิกรไทย')
    account_name = models.CharField(max_length=100, default='KeyUnai')
    account_number = models.CharField(max_length=50, default='000-0-00000-0')
    qr_code = models.ImageField(upload_to='payment_qr/', blank=True, null=True)
    is_active = models.BooleanField(default=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'ตั้งค่าการชำระเงิน'
        verbose_name_plural = 'ตั้งค่าการชำระเงิน'

    def __str__(self):
        return f'{self.bank_name} - {self.account_number}'


class Order(models.Model):
    STATUS_CHOICES = [
        ('PENDING', 'รอชำระเงิน'),
        ('AWAITING_APPROVAL', 'รอตรวจสอบสลิป'),
        ('COMPLETED', 'ชำระเงินแล้ว'),
        ('REJECTED', 'ปฏิเสธ'),
        ('CANCELED', 'ยกเลิก'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='orders')
    total_price = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')
    payment_slip = models.ImageField(upload_to='payment_slips/', blank=True, null=True)
    slip_uploaded_at = models.DateTimeField(blank=True, null=True)
    admin_note = models.TextField(blank=True, help_text='หมายเหตุจากแอดมิน (เช่น เหตุผลที่ปฏิเสธ)')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Order #{self.id} - {self.user.username} ({self.status})"


class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    game = models.ForeignKey(Game, on_delete=models.CASCADE)
    game_key = models.OneToOneField(
        GameKey,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        verbose_name='คีย์ที่ส่งให้ลูกค้า',
        help_text='เลือกจากคีย์ว่างของเกมนี้ หรือใช้ action อนุมัติเพื่อดึงจากสต็อกอัตโนมัติ',
    )
    price = models.DecimalField(max_digits=10, decimal_places=2)
    key_revealed = models.BooleanField(default=False)

    def save(self, *args, **kwargs):
        old_key_id = None
        if self.pk:
            old_key_id = (
                OrderItem.objects.filter(pk=self.pk)
                .values_list('game_key_id', flat=True)
                .first()
            )
        super().save(*args, **kwargs)
        if old_key_id != self.game_key_id:
            if old_key_id:
                GameKey.objects.filter(pk=old_key_id).update(is_sold=False)
            if self.game_key_id:
                GameKey.objects.filter(pk=self.game_key_id).update(is_sold=True)

    def __str__(self):
        return f"{self.game.title} - Order #{self.order.id}"
