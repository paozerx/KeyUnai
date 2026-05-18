from django.shortcuts import render

# Create your views here.
# 💡 1. นำเข้า filters เพิ่มเติม
from rest_framework import generics, filters 
from .models import Game
from .serializers import GameSerializer

class GameListView(generics.ListAPIView):
    queryset = Game.objects.filter(is_active=True).order_by('-created_at')
    serializer_class = GameSerializer
    
    # 💡 2. เปิดใช้งานระบบค้นหาของ DRF
    filter_backends = [filters.SearchFilter]
    
    # 💡 3. กำหนดว่าจะให้ค้นหาจากคอลัมน์ไหนได้บ้าง (เช่น ชื่อเกม หรือ แพลตฟอร์ม)
    search_fields = ['title', 'platform'] 

class GameDetailView(generics.RetrieveAPIView):
    queryset = Game.objects.filter(is_active=True)
    serializer_class = GameSerializer