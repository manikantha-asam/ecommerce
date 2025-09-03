from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin, User
from django.contrib.auth import get_user_model


class Product(models.Model):
    CATEGORY_CHOICES = [
        ('macbook', 'MacBook'),
        ('iphone', 'iPhone'),
        ('ipad', 'iPad'),
        ('watch', 'Watch'),
        ('airpods', 'AirPods'),
        ('tvandhome', 'TvAndHome'),
        ('others', 'Others'),
    ]

    name = models.CharField(max_length=150, null=True, blank=True)
    description = models.TextField(null=True, blank=True)
    image = models.ImageField(null=True, blank=True)
    price = models.IntegerField(null=True, blank=True)
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES, null=True, blank=True)
    id = models.AutoField(primary_key=True, editable=False)

    def __str__(self):
        return self.name

class CustomerManager(BaseUserManager):
    def create_user(self, username, email, password=None, **extra_fields):
        if not email:
            raise ValueError("Users must have an email address")
        if not username:
            raise ValueError("Users must have a username")

        user = self.model(
            email=self.normalize_email(email),
            username=username,
            **extra_fields
        )
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, username, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_active', True)
        extra_fields.setdefault('customer_name', extra_fields.get('customer_name', 'Admin')) # Set a default name for superuser
        extra_fields.setdefault('phone_number', extra_fields.get('phone_number', '0000000000'))
        extra_fields.setdefault('address', extra_fields.get('address', 'Admin Address'))
        extra_fields.setdefault('city', extra_fields.get('city', 'Admin City'))
        extra_fields.setdefault('state', extra_fields.get('state', 'Admin State'))
        
        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')
            
        return self.create_user(username, email, password, **extra_fields)

class Customer(AbstractBaseUser, PermissionsMixin):
    username = models.CharField(max_length=150, unique=True)
    customer_name = models.CharField(max_length=255)
    email = models.EmailField(unique=True)
    phone_number = models.CharField(max_length=15)
    address = models.TextField()
    city = models.CharField(max_length=100)
    state = models.CharField(max_length=100)
    profile_picture = models.ImageField(upload_to='profile_pictures/', null=True, blank=True)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    is_superuser = models.BooleanField(default=False)
    last_login = models.DateTimeField(null=True, blank=True)
    groups = models.ManyToManyField('auth.Group', related_name='customer_users', blank=True)
    user_permissions = models.ManyToManyField('auth.Permission', related_name='customer_users_permissions', blank=True)

    objects = CustomerManager()

    USERNAME_FIELD = 'username'
    REQUIRED_FIELDS = ['customer_name', 'email', 'phone_number', 'address', 'city', 'state']

    def __str__(self):
        return self.username

    def has_perm(self, perm, obj=None):
        return self.is_superuser or super().has_perm(perm, obj=obj)

    def has_module_perms(self, app_label):
        return self.is_superuser or super().has_module_perms(app_label)
    
User = get_user_model()

class Cart(models.Model):
    user = models.OneToOneField(get_user_model(), on_delete=models.CASCADE)
    items = models.ManyToManyField(Product, through='CartItem')

class CartItem(models.Model):
    cart = models.ForeignKey(Cart, on_delete=models.CASCADE)
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField(default=1)

class Orders(models.Model):
    user = models.ForeignKey(get_user_model(), on_delete=models.CASCADE)
    items = models.ManyToManyField(Product, through='OrderItem')
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)
    SHIPPING_STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('shipped', 'Shipped'),
        ('delivered', 'Delivered'),
        ('cancelled', 'Cancelled'),
    ]
    shipping_status = models.CharField(max_length=20, choices=SHIPPING_STATUS_CHOICES, default='pending')

    def __str__(self):
        return f"Order {self.id} by {self.user.username}"

class OrderItem(models.Model):
    order = models.ForeignKey(Orders, on_delete=models.CASCADE)
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField(default=1)
    price = models.DecimalField(max_digits=10, decimal_places=2, null=True) # Add price field