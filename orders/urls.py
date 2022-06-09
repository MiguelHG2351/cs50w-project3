from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("orders", views.orders_view, name="index2"),
    path("orders/api/food", views.api_food, name="api"),
    path("orders/api/food/<int:food_id>", views.api_food_2, name="api2"),
    path("orders/register", views.register, name="register")
]
