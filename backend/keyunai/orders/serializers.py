from rest_framework import serializers
from .models import Order, OrderItem, PaymentSettings


class PaymentSettingsSerializer(serializers.ModelSerializer):
    qr_code_url = serializers.SerializerMethodField()

    class Meta:
        model = PaymentSettings
        fields = ['bank_name', 'account_name', 'account_number', 'qr_code_url']

    def get_qr_code_url(self, obj):
        if not obj.qr_code:
            return None
        request = self.context.get('request')
        if request:
            return request.build_absolute_uri(obj.qr_code.url)
        return obj.qr_code.url


class OrderItemSerializer(serializers.ModelSerializer):
    game_title = serializers.ReadOnlyField(source='game.title')
    game_cover = serializers.ReadOnlyField(source='game.cover_image_url')
    key_code = serializers.SerializerMethodField()
    has_key = serializers.SerializerMethodField()
    can_reveal = serializers.SerializerMethodField()

    class Meta:
        model = OrderItem
        fields = [
            'id', 'game', 'game_title', 'game_cover', 'price',
            'key_code', 'has_key', 'key_revealed', 'can_reveal',
        ]

    def get_key_code(self, obj):
        order = obj.order
        if (
            obj.game_key
            and order.status == 'COMPLETED'
            and obj.key_revealed
        ):
            return obj.game_key.key_code
        return None

    def get_has_key(self, obj):
        return bool(obj.game_key_id) and obj.order.status == 'COMPLETED'

    def get_can_reveal(self, obj):
        return (
            bool(obj.game_key_id)
            and obj.order.status == 'COMPLETED'
            and not obj.key_revealed
        )


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    payment_slip_url = serializers.SerializerMethodField()

    class Meta:
        model = Order
        fields = [
            'id', 'user', 'total_price', 'status', 'created_at',
            'payment_slip_url', 'slip_uploaded_at', 'admin_note', 'items',
        ]
        read_only_fields = [
            'id', 'user', 'total_price', 'status', 'created_at',
            'payment_slip_url', 'slip_uploaded_at', 'admin_note', 'items',
        ]

    def get_payment_slip_url(self, obj):
        if not obj.payment_slip:
            return None
        request = self.context.get('request')
        if request:
            return request.build_absolute_uri(obj.payment_slip.url)
        return obj.payment_slip.url
