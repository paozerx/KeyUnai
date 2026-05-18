from django.db import models

# Create your models here.
from django.db import models

class Game(models.Model):
    PLATFORM_CHOICES = [
        ('STEAM', 'Steam'),
        ('ORIGIN', 'Origin'),
        ('EPIC', 'Epic Games'),
    ]
    
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    platform = models.CharField(max_length=20, choices=PLATFORM_CHOICES, default='STEAM')
    cover_image_url = models.URLField(blank=True, null=True) # ใช้ URL รูปภาพไปก่อนเพื่อประหยัดพื้นที่ Database
    created_at = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True) # ไว้กดซ่อนเกมที่เลิกขาย

    def __str__(self):
        return self.title
