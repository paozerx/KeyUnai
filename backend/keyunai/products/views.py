from django.shortcuts import render

# Create your views here.
from rest_framework import generics
from .models import Game
from .serializers import GameSerializer

# API สำหรับดึงรายชื่อเกมทั้งหมด (หรือหน้า Store)
class GameListView(generics.ListAPIView):
    # ดึงมาเฉพาะเกมที่เปิดขายอยู่ (is_active=True)
    queryset = Game.objects.filter(is_active=True).order_by('-created_at')
    serializer_class = GameSerializer

# API สำหรับดึงข้อมูลเกมแบบเจาะจง 1 เกม (สำหรับหน้ารายละเอียดเกม)
class GameDetailView(generics.RetrieveAPIView):
    queryset = Game.objects.filter(is_active=True)
    serializer_class = GameSerializer