from django.db import models


class Game(models.Model):
    PLATFORM_CHOICES = [
        ('STEAM', 'Steam'),
        ('ORIGIN', 'Origin'),
        ('EPIC', 'Epic Games'),
    ]

    title = models.CharField(max_length=255)
    description = models.TextField(
        blank=True,
        null=True,
        verbose_name='คำอธิบายสั้น (หน้าร้าน)',
        help_text='แสดงในหน้ารายการเกม / การ์ด',
    )
    detail_info = models.TextField(
        blank=True,
        default='',
        verbose_name='รายละเอียดเกม (หน้าเกม)',
        help_text='ข้อความยาว เช่น ระบบความต้องการ ฟีเจอร์ เนื้อเรื่อง — แสดงในหน้ารายละเอียดเกม',
    )
    key_usage_guide = models.TextField(
        blank=True,
        default='',
        verbose_name='วิธีใช้คีย์ / แลกคีย์',
        help_text='ขั้นตอนเปิด Steam/Epic ฯลฯ — แสดงในหน้ารายละเอียดเกม',
    )
    price = models.DecimalField(max_digits=10, decimal_places=2)
    platform = models.CharField(max_length=20, choices=PLATFORM_CHOICES, default='STEAM')
    cover_image_url = models.URLField(
        blank=True,
        null=True,
        verbose_name='URL รูปปก',
    )
    created_at = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True, verbose_name='แสดงในร้าน')

    class Meta:
        verbose_name = 'เกม'
        verbose_name_plural = 'เกม'

    def __str__(self):
        return self.title
