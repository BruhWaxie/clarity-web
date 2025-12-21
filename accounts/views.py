from django.shortcuts import render, get_object_or_404
from django.contrib.auth.views import LoginView, LogoutView
from django.views.generic import CreateView
from django.contrib.auth.models import User
from django.urls import reverse_lazy

from accounts.models import CustomUser, Abilities
from django.contrib.auth.decorators import login_required
from django.db.models import Avg, Count, Prefetch
from .models import Psychologist, Education, DiplomaImage, Review



from accounts.forms import LoginForm, RegisterForm


class CustomLoginView(LoginView):
    template_name = 'accounts/login.html'
    redirect_authenticated_user = True
    form_class = LoginForm


class CustomLogoutView(LogoutView):
    next_page = reverse_lazy('login')


class RegisterView(CreateView):
    model = User
    template_name = 'accounts/register.html'
    form_class = RegisterForm
    success_url = reverse_lazy('login')


@login_required
def profile_view(request, username=None):
    # Якщо username не передали — відкриваємо свій профіль
    if username:
        user = get_object_or_404(CustomUser, username=username)
    else:
        user = request.user

    context = {
        'profile_user': user,
        'psychologist': None,

        # Загальні поля
        'rating': 0,
        'reviews_count': 0,
        'sessions_count': 0,

        'specialization': None,
        'years_of_exp': None,
        'place': None,
        'description': None,
        'type_of_therapy': None,

        'problems': [],
        'languages': [],
        'educations': [],
        'abilities': [],
        'reviews': [],
    }

    if hasattr(user, 'psychologist'):
        psychologist = (
            Psychologist.objects
            .select_related('specialization', 'user')
            .prefetch_related(
                'problems',
                'languages',
                'type_of_therapy',
                Prefetch(
                    'educations',
                    queryset=Education.objects.prefetch_related('diplomas')
                ),
                'reviews__problem',
                'reviews__author',
            )
            .get(user=user)
        )

        # ⭐ рейтинг
        rating = psychologist.reviews.aggregate(
            avg=Avg('rating')
        )['avg'] or 0
        last_review = psychologist.reviews.order_by('-created_at').first()

        context.update({
            'psychologist': psychologist,

            'rating': round(rating, 1),
            'reviews_count': psychologist.reviews.count(),
            'sessions_count': psychologist.sessions,
            'last_review': last_review,

            'specialization': psychologist.specialization,
            'years_of_exp': psychologist.years_of_exp,
            'place': psychologist.place,
            'description': psychologist.description,

            'problems': psychologist.problems.all(),
            'languages': psychologist.languages.all(),

            'educations': psychologist.educations.all(),
            'abilities': psychologist.abilities.all(),
            'type_of_therapy': psychologist.type_of_therapy.all(),

            'reviews': psychologist.reviews.all().order_by('-created_at'),
        })

    return render(request, 'main/profile.html', context)