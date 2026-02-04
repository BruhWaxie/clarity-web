from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from django.shortcuts import get_object_or_404
from .models import Psychologist, Review
from .serializers import ReviewSerializer


class ReviewViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = ReviewSerializer
    permission_classes = [AllowAny]
    
    def get_queryset(self):
        psychologist_id = self.request.query_params.get('psychologist_id')
        if psychologist_id:
            return Review.objects.filter(
                psychologist_id=psychologist_id
            ).select_related('author', 'problem').order_by('-created_at')
        return Review.objects.none()
    
    @action(detail=False, methods=['get'])
    def psychologist_reviews(self, request):
        """
        Отримати відгуки для конкретного психолога з пагінацією
        """
        psychologist_id = request.query_params.get('psychologist_id')
        offset = int(request.query_params.get('offset', 0))
        limit = int(request.query_params.get('limit', 5))
        
        if not psychologist_id:
            return Response({'error': 'psychologist_id is required'}, status=400)
        
        psychologist = get_object_or_404(Psychologist, id=psychologist_id)
        
        reviews = Review.objects.filter(
            psychologist=psychologist
        ).select_related('author', 'problem').order_by('-created_at')
        
        total_count = reviews.count()
        reviews_page = reviews[offset:offset + limit]
        
        serializer = self.get_serializer(reviews_page, many=True)
        
        return Response({
            'reviews': serializer.data,
            'total': total_count,
            'offset': offset,
            'limit': limit,
            'has_more': (offset + limit) < total_count
        })


class MetadataViewSet(viewsets.ViewSet):
    permission_classes = [AllowAny]  # Adjust permissions as needed

    @action(detail=False, methods=['get'])
    def search(self, request):
        term_type = request.query_params.get('type')
        query = request.query_params.get('q', '').strip()
        
        if not query:
            return Response([])
            
        from .models import Specialization, TypeOfTherapy, Problem
        
        if term_type == 'specialization':
            model = Specialization
        elif term_type == 'therapy':
            model = TypeOfTherapy
        elif term_type == 'problem':
            model = Problem
        else:
            return Response({'error': 'Invalid type'}, status=400)
            
        results = model.objects.filter(name__icontains=query)[:20]
        data = [{'id': r.id, 'name': r.name} for r in results]
        return Response(data)

    @action(detail=False, methods=['post'])
    def create_term(self, request):
        term_type = request.data.get('type')
        name = request.data.get('name', '').strip()
        
        if not name:
            return Response({'error': 'Name is required'}, status=400)

        from .models import Specialization, TypeOfTherapy, Problem

        if term_type == 'specialization':
            model = Specialization
        elif term_type == 'therapy':
            model = TypeOfTherapy
        elif term_type == 'problem':
            model = Problem
        else:
            return Response({'error': 'Invalid type'}, status=400)
            
        term, created = model.objects.get_or_create(
            name__iexact=name,
            defaults={'name': name}
        )
        
        return Response({'id': term.id, 'name': term.name, 'created': created})