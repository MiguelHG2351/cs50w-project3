from django.db import models
from django.contrib.auth.models import User 

# Create your models here.

# class User(models.Model):
#     first_name = models.CharField(max_length=50)
#     last_name = models.CharField(max_length=50)
#     username = models.CharField(max_length=50)
#     email = models.EmailField(max_length=254)
#     password = models.CharField(max_length=50)
#     # created_at = models.DateTimeField(auto_now_add=True)
#     # updated_at = models.DateTimeField(auto_now=True)
#     pub_date = models.DateTimeField('date published')
TYPES_ORDER = (
    ('pending', 'Pending'),
    ('accepted', 'Accepted'),
    ('rejected', 'Rejected'),
    ('delivered', 'Delivered'),
)
TYPES_FOOD = (
    ('breakfast1', 'Breakfast'),
    ('lunch', 'Lunch'),
    ('dinner', 'Dinner'),
    ('pizza', 'Pizza'),
    ('drink', 'Drink'),
)

class Food(models.Model):
    
    food_name = models.CharField(max_length=50)
    description = models.TextField()
    size = models.CharField(max_length=50)
    base_price = models.DecimalField(max_digits=6, decimal_places=2)
    type_food = models.CharField(choices=TYPES_FOOD, max_length=64, default='breakfast1')
    # topping = models.one('Topping', on_delete=models.CASCADE)
    pub_date = models.DateTimeField('date published')

class Toppings(models.Model):
    name = models.CharField(max_length=200)
    price = models.IntegerField()

class Order(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    food = models.ForeignKey(Food, on_delete=models.CASCADE)
    toppings = models.ManyToManyField(Toppings)
    quantity = models.IntegerField()
    total_price = models.DecimalField(max_digits=6, decimal_places=2)
    pub_date = models.DateTimeField('date published')


class Cart(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    food = models.ForeignKey(Food, on_delete=models.CASCADE)
    toppings = models.ManyToManyField(Toppings)
    quantity = models.IntegerField()
    total_price = models.DecimalField(max_digits=6, decimal_places=2)
    status = models.CharField(choices=TYPES_ORDER, max_length=64, default='pending')
    pub_date = models.DateTimeField('date published')

