from django.shortcuts import render, get_object_or_404
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.conf import settings
from .models import Quote
from .serializers import QuoteSerializer
import random
from django.contrib.auth.decorators import login_required
from django.contrib.auth.mixins import LoginRequiredMixin


# 1. Main page (returns HTML + first 3 slides)
@login_required
def quotes_page(request):
    user = request.user
    
    # --- Queue logic (Liked -> Random) ---
    if user.is_authenticated:
        # IDs of liked quotes
        liked_ids = list(Quote.objects.filter(likes=user).values_list('id', flat=True))
        # IDs of all others (excluding liked)
        other_ids = list(Quote.objects.exclude(id__in=liked_ids).values_list('id', flat=True))
    else:
        liked_ids = []
        other_ids = list(Quote.objects.values_list('id', flat=True))

    # Shuffle only "others", liked stay in order
    random.shuffle(other_ids)
    
    # Full display queue
    full_queue = liked_ids + other_ids
    
    # Save queue in user session for API to know what to show next
    request.session['quotes_queue'] = full_queue

    # --- Prepare first 3 slides for template ---
    initial_ids = full_queue[:3]
    initial_quotes = []
    
    # Get objects, preserving queue order
    for q_id in initial_ids:
        obj = Quote.objects.get(id=q_id)
        # Add is_liked attribute "on the fly" for template
        obj.is_liked_by_user = (user.is_authenticated and q_id in liked_ids)
        initial_quotes.append(obj)

    context = {
        'initial_slides': initial_quotes,
        'has_more': len(full_queue) > 3
    }
    return render(request, 'quotes/quotes.html', context)


# 2. DRF API for fetching next slides (+1)
class GetNextQuote(LoginRequiredMixin, APIView):
    def get(self, request):
        index = int(request.query_params.get('index', 0))  # Which slide number JS wants
        queue = request.session.get('quotes_queue', [])

        if index >= len(queue):
            return Response({"end_of_content": True}, status=status.HTTP_200_OK)

        quote_id = queue[index]
        quote = get_object_or_404(Quote, id=quote_id)
        
        serializer = QuoteSerializer(quote, context={'request': request})
        return Response(serializer.data)


# 3. API for likes
class LikeQuoteView(LoginRequiredMixin, APIView):
    def post(self, request, pk):
        if not request.user.is_authenticated:
            return Response({"error": "Login required"}, status=status.HTTP_401_UNAUTHORIZED)
        
        quote = get_object_or_404(Quote, pk=pk)
        
        if request.user in quote.likes.all():
            quote.likes.remove(request.user)
            liked = False
        else:
            quote.likes.add(request.user)
            liked = True
            
        return Response({"liked": liked})
