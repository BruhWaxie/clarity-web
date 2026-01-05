from rest_framework import serializers
from .models import Affirmation

class AffirmationSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    text = serializers.CharField()
    media_url = serializers.SerializerMethodField()
    is_liked = serializers.SerializerMethodField()

    def get_media_url(self, obj):
        request = self.context.get('request')
        if obj.media:
            return request.build_absolute_uri(obj.media.url)
        return None

    def get_is_liked(self, obj):
        user = self.context.get('request').user
        if user.is_authenticated:
            return obj.likes.filter(id=user.id).exists()
        return False