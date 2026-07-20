from rest_framework import serializers
from .models import User, Idea, IdeaVersion, Comment, IdeaEvaluation, AIEvaluation, IdeaFile

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'role', 'department', 'company_name']

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'password', 'first_name', 'role', 'department', 'company_name']

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            password=validated_data['password'],
            first_name=validated_data.get('first_name', ''),
            role=validated_data.get('role', 'employee'),
            department=validated_data.get('department', ''),
            company_name=validated_data.get('company_name', '')
        )
        return user



class IdeaEvaluationSerializer(serializers.ModelSerializer):
    evaluator_name = serializers.CharField(source='evaluator.username', read_only=True)

    class Meta:
        model = IdeaEvaluation
        fields = '__all__'

class AIEvaluationSerializer(serializers.ModelSerializer):
    class Meta:
        model = AIEvaluation
        fields = '__all__'

class IdeaVersionSerializer(serializers.ModelSerializer):
    class Meta:
        model = IdeaVersion
        fields = '__all__'

class CommentSerializer(serializers.ModelSerializer):
    evaluator_name = serializers.CharField(source='evaluator.username', read_only=True)

    class Meta:
        model = Comment
        fields = '__all__'

class IdeaFileSerializer(serializers.ModelSerializer):
    class Meta:
        model = IdeaFile
        fields = ['id', 'file', 'created_at']

class IdeaSerializer(serializers.ModelSerializer):
    owner_name = serializers.CharField(source='owner.username', read_only=True)
    owner = serializers.PrimaryKeyRelatedField(read_only=True)
    target_audience = serializers.PrimaryKeyRelatedField(many=True, queryset=User.objects.all(), required=False)
    ai_evaluation = AIEvaluationSerializer(read_only=True)
    versions = IdeaVersionSerializer(many=True, read_only=True)
    files = IdeaFileSerializer(many=True, read_only=True)

    class Meta:
        model = Idea
        fields = '__all__'
