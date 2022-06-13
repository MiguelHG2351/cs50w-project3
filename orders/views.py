from datetime import datetime
from django.http import JsonResponse
from django.shortcuts import redirect, render
from django.contrib.auth import authenticate, login
from django.forms.models import model_to_dict

from orders.form import RegistroForm
from .models import Food, Order, Popular_Food, Cart, TYPES_FOOD as TYPE_LIST, Toppings

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

    if request.method == 'POST':
        # cart = Cart(request)
        print(request.POST)
        if(request.POST['action-cart'] == 'add'):
            food = Food.objects.get(pk=request.POST['food_id'])
            
            create_cart = Cart.objects.create(
                user=request.user,
                food=food,
                quantity=request.POST['quantity'],
                total_price=request.POST['total_price'],
                pub_date = datetime.now()
            )
            create_cart.save()

            array_topping_ids = request.POST['toppings']
            
            if len(array_topping_ids) > 0:
                for topping_id in array_topping_ids.split(','):
                    topping = Toppings.objects.get(pk=topping_id)
                    create_cart.toppings.add(topping)
                print(request.POST['total_price'])

            return JsonResponse({'success': True})

    return render(request,'orders/order.html')


def register(request):
    data = {
        'form': RegistroForm()
    }
    if request.method == 'POST':
        formulario = RegistroForm(request.POST)
        if formulario.is_valid():
            formulario.save()
            username = formulario.cleaned_data['username']
            password = formulario.cleaned_data['password1']
            user = authenticate(username=username, password=password)
            login(request, user)
            return redirect(to='index')
        else:
            data['form'] = formulario
    return render(request, 'registration/register.html', data)


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
    try:
        food = Food.objects.get(pk=food_id)
        toppings = []
        if not (food.list_toppings is None):
            toppings = list(food.list_toppings.toppings.values())

        food_item = {
            **model_to_dict(food),
            'image': food.image.url,
            'list_toppings': toppings
        }
        return JsonResponse(food_item, safe=True)
    except:
        return JsonResponse({'error': 'Food not found'}, status=404)

def api_cart(request):
    if request.method == 'POST':
        print('POST')
        ACTIONS = ('add', 'remove')
        if request.POST['action'] == ACTIONS[0]:
            # pasar los datos al modelo order
            print(request.POST)
            order = Order.objects.create(user=request.user, food=Food.objects.get(pk=request.POST['food_id']), quantity=request.POST['quantity'], price=request.POST['total_price'])
            order.save()
            # remove of cart
            cart = Cart.objects.get(pk=request.POST['cart_id'])
            cart.delete()
            return JsonResponse({'success': True, 'order': True})
        if request.POST['action'] == ACTIONS[1]:
            cart_id = request.POST['cart_id']
            Cart.objects.filter(id=cart_id).delete()
            return JsonResponse({'success': True, 'remove': True})
    
    try:
        cart = list(Cart.objects.filter(user=request.user))
        item_cart_list = list()
        for food in cart:
            if not (food.toppings is None):
                toppings = list(food.toppings.values())
            item_cart_list.append({
                **model_to_dict(food),
                'user': food.user.username,
                'food': food.food.food_name,
                'food_id': food.food.id,
                'image': food.food.image.url,
                'toppings': toppings
            })
        return JsonResponse(item_cart_list, safe=False)
    except Exception as e:
        print(e)
        return JsonResponse({'error': 'Food not found'}, status=404)