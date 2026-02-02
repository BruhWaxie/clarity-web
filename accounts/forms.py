from django import forms
from django.contrib.auth.forms import AuthenticationForm, UserCreationForm
from .models import CustomUser


class LoginForm(AuthenticationForm):
    class Meta:
        model = CustomUser
        fields = ['username', 'password']

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        for field in self.fields:
            self.fields[field].widget.attrs.update({'class': 'form-control mb-2'})


class RegisterForm(UserCreationForm):
    # Role field for customer/psychologist selection (not saved to model)
    ROLE_CHOICES = [
        ('customer', 'Customer'),
        ('psychologist', 'Psychologist'),
    ]
    user_role = forms.ChoiceField(
        choices=ROLE_CHOICES, 
        widget=forms.RadioSelect,
        initial='customer',
        required=False
    )
    
    class Meta:
        model = CustomUser
        # Remove user_role from fields since it's not a model field
        fields = ['username', 'first_name', 'last_name', 'email', 'password1', 'password2', 'birth_date']

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        for field in self.fields:
            if field != 'user_role':
                self.fields[field].widget.attrs.update({'class': 'form-control mb-2'})

        self.fields['password1'].widget = forms.PasswordInput(attrs={'class': 'form-control mb-2'})
        self.fields['password2'].widget = forms.PasswordInput(attrs={'class': 'form-control mb-2'})
        
        # Make birth_date optional
        self.fields['birth_date'].required = False
        
    def save(self, commit=True):
        user = super().save(commit=False)
        if commit:
            user.save()
        return user