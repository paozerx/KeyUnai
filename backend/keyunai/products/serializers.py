from rest_framework import serializers

from .models import Game


class GameSerializer(serializers.ModelSerializer):
    class Meta:
        model = Game
        fields = [
            'id',
            'title',
            'description',
            'detail_info',
            'key_usage_guide',
            'price',
            'platform',
            'cover_image_url',
            'is_active',
        ]
