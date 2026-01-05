from django.shortcuts import render, get_object_or_404
from .models import Quiz

def quiz_detail(request, quiz_slug):
    # Отримуємо конкретний тест або 404 помилку
    quiz = get_object_or_404(Quiz, slug=quiz_slug)
    
    # Отримуємо питання та "жадібно" завантажуємо відповіді, щоб уникнути зайвих запитів до БД
    questions = quiz.questions.prefetch_related('answers').all()
    
    # Отримуємо результати
    results = quiz.results.all()

    context = {
        'quiz': quiz,
        'questions': questions,
        'results': results,
    }
    return render(request, 'test/test.html', context)