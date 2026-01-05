from django.shortcuts import render, get_object_or_404
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.conf import settings
from .models import Affirmation
from .serializers import AffirmationSerializer
import random

# 1. Головна сторінка (віддає HTML + перші 3 слайди)
def affirmations_page(request):
    user = request.user
    
    # --- Логіка формування черги (Лайкнуті -> Рандомні) ---
    if user.is_authenticated:
        # ID лайкнутих
        liked_ids = list(Affirmation.objects.filter(likes=user).values_list('id', flat=True))
        # ID всіх інших (виключаючи лайкнуті)
        other_ids = list(Affirmation.objects.exclude(id__in=liked_ids).values_list('id', flat=True))
    else:
        liked_ids = []
        other_ids = list(Affirmation.objects.values_list('id', flat=True))

    # Перемішуємо тільки "інші", лайкнуті залишаємо в порядку додавання (або теж можна перемішати)
    random.shuffle(other_ids)
    
    # Повна черга показів
    full_queue = liked_ids + other_ids
    
    # Зберігаємо чергу в сесії користувача, щоб API знало, що показувати далі
    request.session['slides_queue'] = full_queue

    # --- Готуємо перші 3 слайди для шаблону ---
    initial_ids = full_queue[:3]
    initial_affirmations = []
    
    # Отримуємо об'єкти, зберігаючи порядок черги
    for af_id in initial_ids:
        obj = Affirmation.objects.get(id=af_id)
        # Додаємо атрибут is_liked "на льоту" для шаблону
        obj.is_liked_by_user = (user.is_authenticated and af_id in liked_ids)
        initial_affirmations.append(obj)

    context = {
        'initial_slides': initial_affirmations,
        'has_more': len(full_queue) > 3
    }
    return render(request, 'affirmations/affirmations.html', context)


# 2. DRF API для підтягування наступних слайдів (+1)
class GetNextAffirmation(APIView):
    def get(self, request):
        index = int(request.query_params.get('index', 0)) # Який номер слайду хоче JS
        queue = request.session.get('slides_queue', [])

        if index >= len(queue):
             return Response({"end_of_content": True}, status=status.HTTP_200_OK)

        affirmation_id = queue[index]
        affirmation = get_object_or_404(Affirmation, id=affirmation_id)
        
        serializer = AffirmationSerializer(affirmation, context={'request': request})
        return Response(serializer.data)

# 3. API для лайків
class LikeAffirmationView(APIView):
    def post(self, request, pk):
        if not request.user.is_authenticated:
            return Response({"error": "Login required"}, status=status.HTTP_401_UNAUTHORIZED)
        
        affirmation = get_object_or_404(Affirmation, pk=pk)
        
        if request.user in affirmation.likes.all():
            affirmation.likes.remove(request.user)
            liked = False
        else:
            affirmation.likes.add(request.user)
            liked = True
            
        return Response({"liked": liked})