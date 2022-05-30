from django.contrib import admin
from .models import Cart, Food

admin.site.register([Cart, Food])
