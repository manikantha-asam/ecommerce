from rest_framework import serializers
from .models import Product, Customer, Orders, OrderItem, CartItem

class ProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = ['id', 'name', 'description', 'image', 'price', 'category']

class CustomerSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=False)
    confirm_password = serializers.CharField(write_only=True, required=False)
    is_staff = serializers.BooleanField(read_only=True)

    class Meta:
        model = Customer
        fields = ['username', 'customer_name', 'email', 'phone_number', 'address', 'city', 'state', 'password', 'confirm_password', 'profile_picture','last_login', 'is_staff']

    def validate(self, data):
        # Existing validation for create method
        if 'password' in data and data['password'] != data.get('confirm_password'):
            raise serializers.ValidationError({"confirm_password": "Password fields didn't match."})
        return data

    def create(self, validated_data):
        validated_data.pop('confirm_password')
        password = validated_data.pop('password')
        customer = Customer.objects.create_user(**validated_data)
        customer.set_password(password)
        customer.save()
        return customer

    def update(self, instance, validated_data):
        # Enforce password validation during update
        password = validated_data.pop('password', None)
        confirm_password = validated_data.pop('confirm_password', None)

        if password and confirm_password and password != confirm_password:
            raise serializers.ValidationError({"confirm_password": "Password fields didn't match."})

        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        if password:
            instance.set_password(password)

        instance.save()
        return instance

class OrderItemSerializer(serializers.ModelSerializer):
    product = ProductSerializer()
    product_name = serializers.ReadOnlyField(source='product.name')
    price = serializers.DecimalField(source='product.price', max_digits=10, decimal_places=2)

    class Meta:
        model = OrderItem
        fields = ['product', 'quantity', 'product_name', 'price']

class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(source='orderitem_set', many=True, read_only=True)
    shipping_status = serializers.ChoiceField(choices=Orders.SHIPPING_STATUS_CHOICES)
    user = serializers.CharField(source='user.username', read_only=True)

    class Meta:
        model = Orders
        fields = ['id', 'user', 'items', 'total_amount', 'created_at', 'shipping_status']
        read_only_fields = ['id', 'user', 'items', 'total_amount', 'created_at']

    def update(self, instance, validated_data):
        user = self.context.get('request').user
        if not user or not user.is_staff:
            raise serializers.ValidationError({"detail": "Only admin users can update shipping status."})

        instance.shipping_status = validated_data.get('shipping_status', instance.shipping_status)
        instance.save()
        return instance

class CartItemSerializer(serializers.ModelSerializer):
    product = ProductSerializer()

    class Meta:
        model = CartItem
        fields = ['id', 'product', 'quantity']

class ContactFormSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=100)
    email = serializers.EmailField()
    message = serializers.CharField()