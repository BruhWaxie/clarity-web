from django.contrib import admin
from messanger.models import Message, PrivateChat
# Register your models here.

admin.site.register(Message)
admin.site.register(PrivateChat)

