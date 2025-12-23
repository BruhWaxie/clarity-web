from django.shortcuts import render, get_object_or_404, redirect
from django.contrib.auth.views import LoginView, LogoutView
from django.views.generic import CreateView
from django.contrib.auth.models import User
from django.urls import reverse_lazy
from django.views.decorators.http import require_http_methods
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from django.db.models import Avg, Count, Prefetch

from accounts.models import CustomUser, Abilities, Psychologist, Education, DiplomaImage, Review, Problem
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
    if username:
        user = get_object_or_404(CustomUser, username=username)
    else:
        user = request.user

    context = {
        'profile_user': user,
        'psychologist': None,

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

        rating_avg = psychologist.reviews.aggregate(avg=Avg('rating'))['avg']
        rating = rating_avg if rating_avg is not None else 0
        rating_for_js = float(rating) if rating else 0.0
        
        last_review = psychologist.reviews.order_by('-created_at').first()

        context.update({
            'psychologist': psychologist,
            'psychologist_id': psychologist.id,
            
            'rating': rating,
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
            'rating_for_js': rating_for_js,

            'reviews': psychologist.reviews.all().order_by('-created_at'),
        })

    return render(request, 'main/profile.html', context)


@login_required
@require_http_methods(["POST"])
def add_review_view(request):
    try:
        rating = request.POST.get('rating')
        problem_id = request.POST.get('problem')
        text = request.POST.get('text')
        psychologist_id = request.POST.get('psychologist')
        
        if not all([rating, problem_id, text, psychologist_id]):
            return JsonResponse({'success': False, 'error': 'Missing required fields'}, status=400)
        
        rating = int(rating)
        if rating < 1 or rating > 5:
            return JsonResponse({'success': False, 'error': 'Invalid rating value'}, status=400)
        
        psychologist = Psychologist.objects.get(id=int(psychologist_id))
        problem = Problem.objects.get(id=int(problem_id))
        
        review = Review.objects.create(
            author=request.user,
            psychologist=psychologist,
            problem=problem,
            rating=rating,
            text=text
        )
        
        return JsonResponse({
            'success': True,
            'review_id': review.id
        })
        
    except Psychologist.DoesNotExist:
        return JsonResponse({'success': False, 'error': 'Psychologist not found'}, status=404)
    except Problem.DoesNotExist:
        return JsonResponse({'success': False, 'error': 'Problem not found'}, status=404)
    except ValueError:
        return JsonResponse({'success': False, 'error': 'Invalid data format'}, status=400)
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)}, status=500)