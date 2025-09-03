from django.contrib import admin
from .models import Product, Customer, Orders, OrderItem
from django.contrib.auth.models import User

class CustomerAdmin(admin.ModelAdmin):
    list_display = ('username', 'customer_name', 'email', 'phone_number', 'address', 'city', 'state','is_active', 'is_staff', 'is_superuser', 'last_login')
    readonly_fields = ('username', 'customer_name', 'email', 'phone_number', 'address', 'city', 'state', 'profile_picture','last_login')

    def has_add_permission(self, request):
        return True # Allow adding users in the admin, as long as it's a Customer instance

    def has_change_permission(self, request, obj=None):
        return True

    def has_delete_permission(self, request, obj=None):
        return True

class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0  # Do not display extra empty fields

class OrdersAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'total_amount', 'created_at', 'shipping_status')
    search_fields = ('user__username', 'id')  # Allow searching by user and order ID
    list_filter = ('created_at','shipping_status')  # Allow filtering by creation date
    inlines = [OrderItemInline]  # Display order items inline
    readonly_fields = ('id', 'user', 'total_amount', 'created_at')  # Ensure these fields are read-only

    def get_readonly_fields(self, request, obj=None):
        if obj and request.user.is_superuser:  # Editing an existing object as a superuser
            return self.readonly_fields
        elif obj:  # Editing as a non-superuser admin
             return self.readonly_fields + ('shipping_status',)
        else:  # Adding a new object
            return self.readonly_fields

    def has_delete_permission(self, request, obj=None):
        return False  # Prevent deletion of orders in admin

admin.site.register(Product)
admin.site.register(Customer, CustomerAdmin)
admin.site.register(Orders, OrdersAdmin)
