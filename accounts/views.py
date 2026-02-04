from django.shortcuts import render, get_object_or_404, redirect
from django.contrib.auth.views import LoginView, LogoutView
from django.views.generic import CreateView
from django.contrib.auth.models import User
from django.urls import reverse_lazy
from django.views.decorators.http import require_http_methods
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from django.db.models import Avg, Count, Prefetch, Q
from django.contrib import messages
import json

from accounts.models import CustomUser, Abilities, Psychologist, Education, DiplomaImage, Review, Problem, Specialization, Language, TypeOfTherapy
from accounts.forms import LoginForm, RegisterForm


class CustomLoginView(LoginView):
    template_name = 'accounts/login.html'
    redirect_authenticated_user = True
    form_class = LoginForm
    
    def get_success_url(self):
        user = self.request.user
        # Check if user is a psychologist
        if hasattr(user, 'psychologist'):
            return '/profile-info'
        return '/homepage/'


class CustomLogoutView(LogoutView):
    next_page = reverse_lazy('login')


class RegisterView(CreateView):
    model = CustomUser
    template_name = 'accounts/register.html'
    form_class = RegisterForm
    
    def get_success_url(self):
        # Get the user role from the form
        user_role = self.request.POST.get('user_role', 'customer')
        if user_role == 'psychologist':
            return '/profile-info'
        return '/homepage/'
    
    def form_valid(self, form):
        import base64
        from django.core.files.base import ContentFile
        
        # Save the user with profile picture
        user = form.save(commit=False)

        # Handle user role
        user_role = self.request.POST.get('user_role', 'customer')
        if user_role == 'psychologist':
            user.role = 'psychologist'
        else:
            user.role = 'user'
        
        # Handle cropped profile picture (base64 data)
        cropped_data = self.request.POST.get('pfp_cropped', '')
        if cropped_data and cropped_data.startswith('data:image'):
            # Parse the base64 data
            format_str, imgstr = cropped_data.split(';base64,')
            ext = format_str.split('/')[-1]  # Get extension (jpeg, png, etc.)
            
            # Decode and create a file
            image_data = base64.b64decode(imgstr)
            filename = f"profile_{user.username}.{ext}"
            user.pfp.save(filename, ContentFile(image_data), save=False)
        
        user.save()
        
        # Create Psychologist profile if needed
        if user_role == 'psychologist':
            # Create an empty psychologist profile since fields are now nullable
            if not hasattr(user, 'psychologist'):
                Psychologist.objects.create(user=user)
        
        # Store role in session for potential use
        self.request.session['user_role'] = user_role
        
        # Log the user in after registration
        from django.contrib.auth import login
        login(self.request, user)
        
        return redirect(self.get_success_url())

    def form_invalid(self, form):
        print("Register Form Invalid!")
        print(form.errors)
        return super().form_invalid(form)


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


@login_required
def therapist_settings_view(request):
    """View for therapist to edit their profile settings"""
    user = request.user
    
    # Ensure user is a psychologist or create profile
    if not hasattr(user, 'psychologist'):
        if user.role == 'psychologist':
            Psychologist.objects.create(user=user)
        else:
            messages.error(request, 'This page is only for therapists.')
            return redirect('homepage')
    
    psychologist = user.psychologist
    
    if request.method == 'POST':
        # Update user basic info
        user.first_name = request.POST.get('first_name', user.first_name)
        user.last_name = request.POST.get('last_name', user.last_name)
        
        # Handle profile picture upload
        if 'pfp' in request.FILES:
            user.pfp = request.FILES['pfp']
        
        user.save()
        
        # Update psychologist info
        psychologist.description = request.POST.get('description', '')
        
        # Handle specialization
        spec_id = request.POST.get('specialization')
        if spec_id:
            try:
                psychologist.specialization = Specialization.objects.get(id=int(spec_id))
            except Specialization.DoesNotExist:
                pass
        else:
            psychologist.specialization = None
        
        # Handle years of experience
        years_exp = request.POST.get('years_of_exp')
        if years_exp:
            try:
                psychologist.years_of_exp = int(years_exp)
            except ValueError:
                pass
        else:
            psychologist.years_of_exp = None
        
        # Handle place
        psychologist.place = request.POST.get('place', '')
        
        # Handle languages (many-to-many)
        language_ids = request.POST.getlist('languages')
        psychologist.languages.clear()
        for lang_id in language_ids:
            try:
                lang = Language.objects.get(id=int(lang_id))
                psychologist.languages.add(lang)
            except Language.DoesNotExist:
                pass
        
        # Handle therapy types (many-to-many)
        therapy_ids = request.POST.getlist('type_of_therapy')
        psychologist.type_of_therapy.clear()
        for therapy_id in therapy_ids:
            try:
                therapy = TypeOfTherapy.objects.get(id=int(therapy_id))
                psychologist.type_of_therapy.add(therapy)
            except TypeOfTherapy.DoesNotExist:
                pass
        
        # Handle problems (many-to-many)
        problem_ids = request.POST.getlist('problems')
        psychologist.problems.clear()
        for problem_id in problem_ids:
            try:
                problem = Problem.objects.get(id=int(problem_id))
                psychologist.problems.add(problem)
            except Problem.DoesNotExist:
                pass
        
        psychologist.save()
        
        # Handle education data (JSON)
        educations_data = request.POST.get('educations_data', '[]')
        try:
            educations = json.loads(educations_data)
            # Keep track of existing education IDs
            existing_ids = set()
            
            for edu_data in educations:
                edu_id = edu_data.get('id', '')
                
                # Skip if it's a new entry (starts with 'new_')
                if str(edu_id).startswith('new_'):
                    # Create new education
                    Education.objects.create(
                        psychologist=psychologist,
                        institution=edu_data.get('institution', ''),
                        degree=edu_data.get('degree', ''),
                        field_of_study=edu_data.get('field_of_study', ''),
                        start_year=int(edu_data.get('start_year', 2020)),
                        end_year=int(edu_data.get('end_year')) if edu_data.get('end_year') else None
                    )
                else:
                    # Existing education - just track it
                    try:
                        existing_ids.add(int(edu_id))
                    except ValueError:
                        pass
            
            # Delete educations that are no longer in the list
            psychologist.educations.exclude(id__in=existing_ids).delete()
        except json.JSONDecodeError:
            pass
        
        # Handle abilities data (JSON)
        abilities_data = request.POST.get('abilities_data', '[]')
        try:
            abilities = json.loads(abilities_data)
            # Keep track of existing ability IDs
            existing_ability_ids = set()
            
            for ability_data in abilities:
                ability_id = ability_data.get('id', '')
                
                if str(ability_id).startswith('new_'):
                    # Create new ability
                    Abilities.objects.create(
                        user=psychologist,
                        ability=ability_data.get('ability', '')
                    )
                else:
                    try:
                        existing_ability_ids.add(int(ability_id))
                    except ValueError:
                        pass
            
            # Delete abilities that are no longer in the list
            psychologist.abilities.exclude(id__in=existing_ability_ids).delete()
        except json.JSONDecodeError:
            pass
        
        messages.success(request, 'Your profile has been updated successfully!')
        return redirect('therapist_settings')
    
    # GET request - display form
    context = {
        'user': user,
        'psychologist': psychologist,
        'specializations': Specialization.objects.all(),
        'languages': Language.objects.all(),
        'therapy_types': TypeOfTherapy.objects.all(),
        'problems': Problem.objects.all(),
        'educations': psychologist.educations.all(),
        'abilities': psychologist.abilities.all(),
    }
    
    return render(request, 'accounts/therapist-settings.html', context)


def find_therapist_view(request):
    """View to search and filter therapists"""
    queryset = Psychologist.objects.all().select_related('user', 'specialization').prefetch_related('problems', 'type_of_therapy')
    
    # Text Search (Name, Description, Specialization Name)
    q = request.GET.get('q')
    if q:
        queryset = queryset.filter(
            Q(user__first_name__icontains=q) |
            Q(user__last_name__icontains=q) |
            Q(description__icontains=q) |
            Q(specialization__name__icontains=q)
        )
    
    # Exact Filters
    spec_id = request.GET.get('specialization')
    if spec_id:
        queryset = queryset.filter(specialization__id=spec_id)
        
    problem_ids = request.GET.getlist('problems')
    if problem_ids:
        queryset = queryset.filter(problems__id__in=problem_ids)
        
    type_ids = request.GET.getlist('type')
    if type_ids:
        queryset = queryset.filter(type_of_therapy__id__in=type_ids)
        
    lang_ids = request.GET.getlist('language')
    if lang_ids:
        queryset = queryset.filter(languages__id__in=lang_ids)
    
    # Dedup
    queryset = queryset.distinct()
    
    # Ordering
    order = request.GET.get('order')
    if order == 'experience':
        queryset = queryset.order_by('-years_of_exp')
    elif order == 'rating':
        queryset = queryset.annotate(avg_rating=Avg('reviews__rating')).order_by('-avg_rating')
    else:
        queryset = queryset.order_by('?')
    
    # Context for filters
    context = {
        'therapists': queryset,
        'specializations': Specialization.objects.all(),
        'problems': Problem.objects.all(),
        'therapy_types': TypeOfTherapy.objects.all(),
        'languages': Language.objects.all(),
        
        # Keep filter state
        'selected_problems': problem_ids,
        'selected_types': type_ids,
        'selected_languages': lang_ids,
    }
    
    return render(request, 'find_therapist.html', context)
