from django.db import models

# Create your models here.
from django.db import models
from products.models import Game

class GameKey(models.Model):
    game = models.ForeignKey(Game, on_delete=models.CASCADE, related_name='keys')
    key_code = models.CharField(max_length=255, unique=True) # รหัสคีย์เกม (ของจริงควรเข้ารหัสก่อนเซฟลง DB)
    is_sold = models.BooleanField(default=False)
    added_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        status = "Sold" if self.is_sold else "Available"
        return f"{self.game.title} - {status}"