from django.contrib import admin
from .models import Cart, Food, Popular_Food, Toppings, Food_Toppings, Order

admin.site.register(Cart)
admin.site.register(Food)
admin.site.register(Popular_Food)
admin.site.register(Toppings)
admin.site.register(Food_Toppings)
admin.site.register(Order)
