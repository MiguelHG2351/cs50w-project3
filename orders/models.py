from email.policy import default
from django.db import models
from django.contrib.auth.models import User 

TYPES_ORDER = (
    ('pending', 'Pending'),
    ('accepted', 'Accepted'),
    ('rejected', 'Rejected'),
    ('delivered', 'Delivered'),
)
TYPES_FOOD = (
    ('salad', 'Salad'),
    ('subs', 'Subs'),
    ('dinner', 'Dinner'),
    ('pizza', 'Pizza'),
    ('pasta', 'Pasta'),
)

SIZES = (
    ('small & large', 'Small & Large'),
    ('small', 'Small'),
    ('large', 'Large'),
    ('normal', 'Normal')
)

class Popular_Food(models.Model):
    # relation with Food
    food_id = models.ForeignKey('Food', on_delete=models.CASCADE)
    def __str__(self):
        return f'Promoción {self.food_id}'


class Toppings(models.Model):
    name = models.CharField(max_length=200)
    price = models.DecimalField(max_digits=6, decimal_places=2)

    def __str__(self):
        return self.name


class Food_Toppings(models.Model):
    name = models.CharField(max_length=200)
    toppings = models.ManyToManyField(Toppings)

    def __str__(self):
        return self.name
    

class Food(models.Model):
    food_name = models.CharField(max_length=50)
    image = models.ImageField(upload_to='orders/images/food/', default='orders/images/default-food.png')
    description = models.TextField()
    list_toppings = models.ForeignKey(Food_Toppings, on_delete=models.CASCADE, null=True, blank=True)
    max_topping = models.IntegerField(default=0)
    price_type = models.CharField(max_length=50, choices=SIZES, default='')
    base_price = models.CharField(max_length=50, default='0')
    type_food = models.CharField(choices=TYPES_FOOD, max_length=64, default='breakfast')
    pub_date = models.DateTimeField('date published')

    def set_max_topping(self):
        if self.max_topping < 0:
            self.max_topping = 0

    def __str__(self):
        return self.food_name


class Cart(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    food = models.ForeignKey(Food, on_delete=models.CASCADE)
    toppings = models.ManyToManyField(Toppings)
    quantity = models.IntegerField()
    total_price = models.DecimalField(max_digits=6, decimal_places=2)
    pub_date = models.DateTimeField('date published')

class Order(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    food = models.ForeignKey(Food, on_delete=models.CASCADE)
    toppings = models.ManyToManyField(Toppings)
    quantity = models.IntegerField()
    price = models.DecimalField(max_digits=6, decimal_places=2)
    status = models.CharField(choices=TYPES_ORDER, max_length=64, default='pending')
