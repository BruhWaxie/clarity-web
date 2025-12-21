from django.contrib import admin
from accounts.models import *
# Register your models here.
admin.site.register(CustomUser)
admin.site.register(Language)
admin.site.register(Specialization)
admin.site.register(Problem)
admin.site.register(Abilities)
admin.site.register(Psychologist)
admin.site.register(Education)
admin.site.register(DiplomaImage)
admin.site.register(WorkSchedule)
admin.site.register(TimeSlot)
admin.site.register(Review)
admin.site.register(TypeOfTherapy)