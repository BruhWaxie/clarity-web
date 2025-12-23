from rest_framework import serializers
from .models import Review, CustomUser, Problem


class ReviewAuthorSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['first_name', 'pfp']


class ReviewProblemSerializer(serializers.ModelSerializer):
    class Meta:
        model = Problem
        fields = ['name']


class ReviewSerializer(serializers.ModelSerializer):
    author = ReviewAuthorSerializer(read_only=True)
    problem = ReviewProblemSerializer(read_only=True)
    created_at = serializers.DateTimeField(format='%d.%m.%Y')
    
    class Meta:
        model = Review
        fields = ['id', 'author', 'problem', 'text', 'rating', 'created_at']