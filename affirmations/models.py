from django.db import models
from django.conf import settings  # <-- Імпортуємо налаштування

class Affirmation(models.Model):
    text = models.TextField()
    media = models.ImageField(upload_to='affirmations/')
    
    # Використовуємо посилання на налаштування, а не прямий імпорт
    likes = models.ManyToManyField(settings.AUTH_USER_MODEL, related_name='liked_affirmations', blank=True)

    def __str__(self):
        return f'Affirmation: {self.text[:30]}...'