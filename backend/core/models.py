from django.db import models
from django.contrib.auth.models import AbstractUser
import uuid

class User(AbstractUser):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    role = models.CharField(max_length=50, choices=[
        ('employee', 'Employee'),
        ('manager', 'Manager'),
        ('owner', 'Owner'),
    ], default='employee')
    department = models.CharField(max_length=255, blank=True, null=True)
    company_name = models.CharField(max_length=255, blank=True, null=True)

class Idea(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name='ideas')
    title = models.CharField(max_length=512)
    category = models.CharField(max_length=128, blank=True, null=True)
    status = models.CharField(max_length=50, choices=[
        ('draft', 'Draft'),
        ('submitted', 'Submitted'),
        ('under_review', 'Under Review'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
    ], default='draft')
    target_audience = models.ManyToManyField(User, related_name='targeted_ideas', blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title

class IdeaEvaluation(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    idea = models.ForeignKey(Idea, on_delete=models.CASCADE, related_name='evaluations')
    evaluator = models.ForeignKey(User, on_delete=models.CASCADE, related_name='given_evaluations')
    numeric_score = models.IntegerField()
    feedback_text = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

class AIEvaluation(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    idea = models.OneToOneField(Idea, on_delete=models.CASCADE, related_name='ai_evaluation')
    concept_score = models.IntegerField()
    feasibility_score = models.IntegerField()
    application_score = models.IntegerField()
    overall_notes = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

class IdeaVersion(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    idea = models.ForeignKey(Idea, on_delete=models.CASCADE, related_name='versions')
    version_number = models.IntegerField()
    description = models.TextField()
    problem = models.TextField(blank=True, null=True)
    approach = models.TextField(blank=True, null=True)
    impact = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('idea', 'version_number')

    def __str__(self):
        return f"{self.idea.title} - v{self.version_number}"

class Comment(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    idea_version = models.ForeignKey(IdeaVersion, on_delete=models.CASCADE, related_name='comments')
    evaluator = models.ForeignKey(User, on_delete=models.CASCADE)
    text = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Comment by {self.evaluator.username}"

class IdeaFile(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    idea = models.ForeignKey(Idea, on_delete=models.CASCADE, related_name='files')
    file = models.FileField(upload_to='idea_files/')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.file.name
