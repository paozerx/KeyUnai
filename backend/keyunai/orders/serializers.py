from rest_framework import serializers
from .models import Order, OrderItem

class OrderItemSerializer(serializers.ModelSerializer):
    game_title = serializers.ReadOnlyField(source='game.title')
    game_cover = serializers.ReadOnlyField(source='game.cover_image_url')
    # จะโชว์ key_code ก็ต่อเมื่อจ่ายเงินแล้วเท่านั้น!
    key_code = serializers.SerializerMethodField()

    class Meta:
        model = OrderItem
        fields = ['id', 'game', 'game_title', 'game_cover', 'price', 'key_code']

    def get_key_code(self, obj):
        # ถ้ามี game_key ถูกจ่ายให้แล้ว ค่อยส่งรหัสกลับไป
        if obj.game_key:
            return obj.game_key.key_code
        return None

class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)

    class Meta:
        model = Order
        fields = ['id', 'user', 'total_price', 'status', 'created_at', 'items']