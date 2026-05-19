from django.db import models

from products.models import Game


class GameKey(models.Model):
    game = models.ForeignKey(Game, on_delete=models.CASCADE, related_name='keys')
    key_code = models.CharField(
        max_length=255,
        unique=True,
        verbose_name='รหัสคีย์',
        help_text='รหัสที่ลูกค้าใช้เปิดเกม (ต้องไม่ซ้ำกับคีย์อื่น)',
    )
    is_sold = models.BooleanField(
        default=False,
        verbose_name='ขายแล้ว / จองแล้ว',
        help_text='ติ๊กเมื่อคีย์ถูกใช้กับคำสั่งซื้อแล้ว (ระบบอาจอัปเดตให้อัตโนมัติ)',
    )
    added_at = models.DateTimeField(auto_now_add=True, verbose_name='เพิ่มเมื่อ')

    class Meta:
        verbose_name = 'คีย์เกม'
        verbose_name_plural = 'คีย์เกมในคลัง'

    def __str__(self):
        status = 'ขายแล้ว' if self.is_sold else 'ว่าง'
        return f'{self.game.title} — {status}'
