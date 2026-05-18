from django.shortcuts import render

# Create your views here.
from django.contrib.auth.models import User
from rest_framework import generics
from rest_framework.permissions import AllowAny
from .serializers import RegisterSerializer

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (AllowAny,) # ยอมให้ใครก็ได้เข้ามาใช้ API นี้โดยไม่ต้อง Login
    serializer_class = RegisterSerializer