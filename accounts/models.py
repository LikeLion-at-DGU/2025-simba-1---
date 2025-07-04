from django.db import models
from django.contrib.auth.models import User

class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    nickname = models.TextField(max_length=10, default='unknown')
    pfp = models.ImageField(upload_to="profile/", blank=True, null=True)

    def __str__(self):
        return self.nickname