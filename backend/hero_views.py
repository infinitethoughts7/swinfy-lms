from django.shortcuts import render
from django.http import HttpResponse

def hero_demo(request):
    """Render the hero demo template"""
    return render(request, 'hero_demo.html')
