from django.db import models

# Create your models here.
from django.db import models
from django.contrib.auth.models import User
from products.models import Game
from inventory.models import GameKey

class Order(models.Model):
    STATUS_CHOICES = [
        ('PENDING', 'รอชำระเงิน'),
        ('COMPLETED', 'ชำระเงินแล้ว'),
        ('CANCELED', 'ยกเลิก'),
    ]
    
    # ชี้ไปหา User ของ Django (ในอนาคตจะเชื่อมกับ NextAuth)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='orders')
    total_price = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Order #{self.id} - {self.user.username} ({self.status})"

class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    game = models.ForeignKey(Game, on_delete=models.CASCADE)
    # game_key จะถูกใส่ค่าก็ต่อเมื่อ Order มีสถานะ COMPLETED แล้ว
    game_key = models.OneToOneField(GameKey, on_delete=models.SET_NULL, null=True, blank=True)
    price = models.DecimalField(max_digits=10, decimal_places=2) # เก็บราคา ณ วันที่ซื้อ (เผื่ออนาคตเกมลดราคา)

    def __str__(self):
        return f"{self.game.title} - Order #{self.order.id}"