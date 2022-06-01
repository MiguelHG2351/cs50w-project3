from django.shortcuts import render
from .models import Food, Popular_Food
# Create your views here.
def index(request):
    popular_food = Popular_Food.objects.all()
    foods = Food.objects.all()
    # get data of foreign key
    # a_popular_food = popular_food[0].food_id
    # print(a_popular_food.food_name)
    return render(request,'orders/index.html', {
        'foods':foods,
        'popular_foods':popular_food
    })
