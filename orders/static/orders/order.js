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
    const addCartBtn = document.querySelector('#add-cart-btn');

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

    // addCartBtn.addEventListener('click', () => {
    //     loca
    // })
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

function setData() {
    const params = queryParams()
    console.log(`Estas buscando una ${params.food_name} en el catalogo ${params.type}`)
    fetch(`/orders/api/food/${params.food_id}`)
    .then(res => res.json())
    .then((data) => {
        if(!data?.error) { 
            setFoodInfo(data.food_name, data.type_food, data.description, data.base_price, data.price_type, data.image);
            localStorage.setItem('current-food', JSON.stringify(data));
        }
        else {
            console.log('No se encontro ningun producto')
            window.history.pushState(null, null, `/orders?food_id=1`)
            document.dispatchEvent(routeChange());
        }
    }).catch(err => console.error(err))
}

function setFoodInfo(name, category, description, price, priceType, image) {
    const $foodName = document.querySelector('#food-name');
    const $category = document.querySelector('#category');
    const $description = document.querySelector('#description');
    const $prices = document.querySelector('#prices');
    const $foodImage = document.querySelector('#food-image');
    const quantity = document.querySelector('#quantity');
    
    $foodName.innerHTML = name;
    $category.innerHTML = category;
    $description.innerHTML = description;
    $prices.innerHTML = `$${price.split(',').join(' - ')}`;
    $foodImage.setAttribute('src', `/media/${image}`);
    quantity.innerHTML = '01';
    
    const $sizes = document.querySelector('#sizes');
    if(priceType == 'normal') {
        $sizes.innerHTML = '';
        const $btnAddToppings = document.querySelector('#btn-add-toppings');
        $btnAddToppings?.remove();
    } else {
        
    }
}
