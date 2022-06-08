from django.http import JsonResponse
from django.shortcuts import render
from .models import Food, Popular_Food, TYPES_FOOD as TYPE_LIST

def type_food_list():
    type_list = []
    for type_ in TYPE_LIST:
        type_list.append(type_[0])
    
    return type_list

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


def orders_view(request):
    popular_food = Popular_Food.objects.all()
    foods = Food.objects.all()
    # get data of foreign key
    # a_popular_food = popular_food[0].food_id
    # print(a_popular_food.food_name)
    return render(request,'orders/order.html', {
        'foods':foods,
        'popular_foods':popular_food
    })

def api_food(request):
    category = request.GET.get('category').replace('"', '')

    try:
        if category in type_food_list():
            foods = Food.objects.filter(type_food=category)
        else:
            foods = Food.objects.all()
        return JsonResponse(list(foods.values()), safe=False)
    except:
        return JsonResponse({'error': 'Food not found'}, status=404)
    
def api_food_2(request, food_id):
    qs = Food.objects.filter(id=food_id)
    food_list = list(qs.values())
    if len(food_list) == 0:
        return JsonResponse({'error': 'Food not found'}, status=404)

    print(food_list[0]['list_toppings_id'])
    return JsonResponse(food_list[0], safe=True)
