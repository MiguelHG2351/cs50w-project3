from django import template

register = template.Library()

def split_price(string):
    return ' - '.join(string.split(','))

register.filter('split_price', split_price)
