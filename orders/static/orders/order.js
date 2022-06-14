// !localStorage.getItem('attemps') && localStorage.setItem('attemps', 0);
localStorage.setItem('attemps', 0);

function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
}

function toppingItemHandler() {
    const $toppingList = document.querySelectorAll('.topping-item.active');
    const toppingMax = JSON.parse(localStorage.getItem('current-food')).max_topping;
    if($toppingList.length < toppingMax) {
        this.classList.toggle('active')
    } else if(this.classList.contains('active')) {
        this.classList.remove('active')
    } else {
        alert('Solo puedes agregar 4 topping')
    }
}

function cartTemplate(name, image, count, price, id, foodId) {
    const template = document.createElement('template');
    template.innerHTML = `
    <li class="action-menu-item-cart">
        <img src="${image}" width="48" alt="${name}"/>
        <div class="container-temp">
            <span class="img-count">
                <div class="info-card-food">
                    <p>${name}</p>
                    <span>Cantidad: <b>${count}</b></span>
                </div>
            </span>
            <span>
                <button class="btn-order">Ordenar</button>
                <button class="btn-remove">Quitar</button>
            </span>
        </div>
    </li>
    `;
    const element = template.content.cloneNode(true)
    const order = element.querySelector('.btn-order')
    const remove = element.querySelector('.btn-remove')

    remove.addEventListener('click', function() {
        const formData = new FormData();
        formData.append('food_id', foodId);
        formData.append('action', 'remove')
        formData.append('cart_id', id)

        const csrf = getCookie('csrftoken');
        formData.append('csrfmiddlewaretoken', csrf)

        fetch('/orders/api/cart', {
            method: 'POST',
            body: formData
        }).then(response => response.json())
        .then(data => {
            if(data.success) {
                remove.parentElement.parentElement.parentElement.remove()
            } else {
                console.log('Error al quitar del carrito')
            }
        })
    })

    order.addEventListener('click', function() {
        const formData = new FormData();
        formData.append('food_id', foodId)
        formData.append('total_price', price)
        formData.append('quantity', count)
        formData.append('action', 'add')
        const csrf = getCookie('csrftoken');
        formData.append('csrfmiddlewaretoken', csrf)
        formData.append('cart_id', id)

        fetch('/orders/api/cart', {
            method: 'POST',
            body: formData
        }).then(response => response.json())
        .then(data => {
            if(data.success) {
                console.log(remove.parentElement.parentElement.parentElement)
                remove.parentElement.parentElement.parentElement.remove()
            } else {
                console.log('Error al quitar del carrito')
            }
        })
    })

    return element;
}

function orderTemplate(name, image, count, status) {
    const template = document.createElement('template');
    template.innerHTML = `
    <li class="action-menu-item">
        <span class="img-count">
            <img src="${image}" width="48" alt="keso">
            <div class="info-card-food">
                <p>${name}</p>
                <span>Cantidad: <b>${count}</b></span>
            </div>
        </span>
        <span>
            <button class="btn-order">${status}</button>
        </span>
    </li>
    `;
    const element = template.content.cloneNode(true)

    return element;
}

const routeChange = () => new CustomEvent('routeChange', {
    detail: {
        route: location.pathname + location.search
    },
  });

function queryParams() {
    return new Proxy(new URLSearchParams(window.location.search), {
        get: (paramSearch, prop) => paramSearch.get(prop),
    });
}

document.addEventListener('routeChange', e => {
    const params = queryParams()
    console.log(params.food_id)
    checkFood()
})

document.addEventListener('DOMContentLoaded', () => {
    checkFood()
    // food count
    const decrementBtn = document.querySelector('#decrement'); 
    const incrementBtn = document.querySelector('#increment');
    const quantity = document.querySelector('#quantity');

    // arrow food
    const arrowLeft = document.querySelector('#arrow-left');
    const arrowRight = document.querySelector('#arrow-right');

    // add to cart
    const btnSmallSize = document.querySelector('#btn-small-size');
    const btnLargeSize = document.querySelector('#btn-large-size');
    const addCartBtn = document.querySelector('#add-cart-btn');

    // topping list
    const toppingItem = document.querySelectorAll('.topping-item');

    decrementBtn.addEventListener('click', () => {
        const quantityValue = parseInt(quantity.innerHTML);
        
        if (quantityValue > 1) {
            quantity.innerHTML = `${quantityValue - 1}`.padStart(2, '0');
        }
    });
    
    incrementBtn.addEventListener('click', () => {
        const quantityValue = parseInt(quantity.innerHTML);
        if(quantityValue < 10) {
            quantity.innerHTML = `${quantityValue + 1}`.padStart(2, '0');;
        } else {
            alert('No puedes pedir mas de 10 unidades');
        }
    });

    arrowLeft.addEventListener('click', () => {
        if(parseInt(queryParams().food_id) > 1) {
            history.pushState(null, null, `/orders?food_id=${parseInt(queryParams().food_id) - 1}`)
            document.dispatchEvent(routeChange());
        }
    });
    
    arrowRight.addEventListener('click', () => {
        history.pushState(null, null, `/orders?food_id=${parseInt(queryParams().food_id) + 1}`)
        document.dispatchEvent(routeChange());
    });

    function sizeHandler() {
        btnSmallSize.classList.contains('active') ?  btnSmallSize.classList.remove('active') : btnSmallSize.classList.add('active')
        btnLargeSize.classList.contains('active') ?  btnLargeSize.classList.remove('active') : btnLargeSize.classList.add('active')
    }

    btnSmallSize.addEventListener('click', sizeHandler);
    btnLargeSize.addEventListener('click', sizeHandler);

    addCartBtn.addEventListener('click', () => {
        const size = document.querySelector('.btn-size.active').innerHTML
        const currentFood = JSON.parse(localStorage.getItem('current-food'));
        const priceArray = currentFood.base_price.split(',');
        let arrayToppings = [];
        const formData = new FormData();
        const csrf = getCookie('csrftoken');
        const controller = new AbortController();
        const signal = controller.signal;
        // debugger
        let totalPrice = quantity.innerHTML - 0.0;
        if(currentFood.price_type !== 'normal') {
            totalPrice *= (size == 'L' ? parseFloat(priceArray[1]) : parseFloat(priceArray[0]));
        } else {
            totalPrice = priceArray[0] - 0;
        }
        // debugger
        if(currentFood.list_toppings.length > 0) {
            const $toppingList = document.querySelectorAll('.topping-item.active');
            if($toppingList.length < 1) {
                alert(`Selecciona minimo ${currentFood.max_topping} topping`)
                controller.abort()
                location.reload()
            }
            arrayToppings = Array.prototype.map.call($toppingList, item => item.dataset.toppingId - 0)
            const arrPrice = currentFood.list_toppings.filter((item) => arrayToppings.includes(item.id) ? item.price: false)
            arrPrice.forEach(price => {
                totalPrice += price.price - 0
                console.log(price.price - 0)
            })
        }
        
        console.log('Fetching data...')
        formData.append('csrfmiddlewaretoken', csrf)
        formData.append('food_id', currentFood.id)
        formData.append('quantity', quantity.innerHTML - 0)
        formData.append('total_price', totalPrice)
        formData.append('toppings', arrayToppings)
        formData.append('action-cart', 'add')
        
        addCartBtn.classList.add('disabled');
        fetch('/orders', {
            method: 'POST',
            credentials: 'same-origin',
            body: formData,
            signal
        }).then(res => {
            if(res.status == 403) {
                window.location.href = '/auth/login'
                throw new Error('Error al agregar al carrito')
            }
            return res.json();
        })
        .then((data) => {
            addCartBtn.classList.remove('disabled');
            if(data.success) {
                setCartInfo()
            } else {
                alert('Error al agregar al carrito')
            }
        }).catch(err => console.error(err))
    })

    toppingItem.forEach($item => {
        $item.addEventListener('click', toppingItemHandler)
    })
})

function checkFood() {
    const params = queryParams()
    if (!isNaN(params.food_id) && params?.food_id) {
        setData();
    } else {
        window.history.pushState(null, null, `/orders?food_id=1`)
        document.dispatchEvent(routeChange());
    }
}

async function setData() {
    const params = queryParams()
    // console.log(`Estas buscando una ${params.food_name} en el catalogo ${params.type}`)
    try {
        // arrow food
        const arrowLeft = document.querySelector('#arrow-left');
        const arrowRight = document.querySelector('#arrow-right');
        arrowLeft.classList.add('disabled');
        arrowRight.classList.add('disabled');
        const food = await fetch(`/orders/api/food/${params.food_id}`)
        const data = await food.json()
        
        arrowLeft.classList.remove('disabled');
        arrowRight.classList.remove('disabled');
        
        const attemps = localStorage.getItem('attemps') - 0;
        // console.log(data)
        if(!data?.error) { 
            setFoodInfo(data.food_name, data.type_food, data.description, data.base_price, data.price_type, data.image, data.list_toppings);
            localStorage.setItem('current-food', JSON.stringify(data));
        } else if (attemps === 4) {
            return window.location.href = '/';
        } else {
            console.log('No se encontro ningun producto, reintentando...')
            localStorage.setItem('attemps', JSON.stringify(attemps+1));
            window.history.pushState(null, null, `/orders?food_id=1`)
            document.dispatchEvent(routeChange());
        }
    } catch (error) {
        console.error(error)
    }
}
// data.append('csrfmiddlewaretoken', "Zts8twwrfxkot1UHsWYDx4XXVHicssjwXLcoe6dyJGYKJfr7yTzv14yTOCbTg7F7");

async function setCartInfo() {
    try {
        const cart = await fetch('/orders/api/cart')
        const cartList = await cart.json()
        if(cartList?.error) {
            console.log('No estas loggeado')
        } else {
            const $cartList = document.querySelector('#cart-list');
            $cartList.innerHTML = ''
            for(const cartItem of cartList) {
                console.log(cartItem)
                $cartList.appendChild(cartTemplate(cartItem.food, cartItem.image, cartItem.quantity, cartItem.total_price, cartItem.id, cartItem.food_id))
            }
        }
    } catch (error) {
        console.error(error)
    }
}

async function setOrderInfo() {
    try {
        console.log('ordenes')
        const order = await fetch('/orders/api/orders')
        const orderList = await order.json()
        if(orderList?.error) {
            console.log('No estas loggeado')
        } else {
            const $orderList = document.querySelector('#order-list');
            $orderList.innerHTML = ''
            for(const orderItem of orderList) {
                console.log(orderItem)
                $orderList.appendChild(orderTemplate(orderItem.food, orderItem.image, orderItem.quantity, orderItem.status))
            }
        }
    } catch (error) {
        console.error(error)
    }
}

function setFoodInfo(name, category, description, price, priceType, image, toppingList) {
    const $foodName = document.querySelector('#food-name');
    const $category = document.querySelector('#category');
    const $description = document.querySelector('#description');
    const $prices = document.querySelector('#prices');
    const $foodImage = document.querySelector('#food-image');
    const quantity = document.querySelector('#quantity');
    const $toppingList = document.querySelector('#topping-list');

    document.title = `${name} - ${category}`;
    
    $foodName.innerHTML = name;
    $category.innerHTML = category;
    $description.innerHTML = description;
    $prices.innerHTML = `$${price.split(',').join(' - ')}`;
    $foodImage.setAttribute('src', image);
    quantity.innerHTML = '01';

    $toppingList.innerHTML = '';
    toppingList.forEach(topping => {
        const li = document.createElement('li');
        li.classList.add('topping-item')
        li.setAttribute('data-topping-id', topping.id);
        li.setAttribute('data-topping-name', topping.name);
        li.setAttribute('data-topping-price', topping.price);
        li.innerHTML = topping.name;
        li.addEventListener('click', toppingItemHandler)
        $toppingList.appendChild(li);
    })
    
    const $sizes = document.querySelector('#sizes');
    const $toppingsContainer = document.querySelector('#toppings-container');
    
    priceType == 'normal' ? $sizes.classList.add('hidden') : $sizes.classList.remove('hidden')
    toppingList.length === 0 ? $toppingsContainer.classList.add('hidden') :  $toppingsContainer.classList.remove('hidden')
    setCartInfo()
    setOrderInfo()
}