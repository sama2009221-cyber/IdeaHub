from rest_framework import viewsets, generics
from rest_framework.permissions import AllowAny
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status
from .models import User, Idea, IdeaVersion, Comment, IdeaEvaluation, AIEvaluation, IdeaFile
from .serializers import (UserSerializer, RegisterSerializer, IdeaSerializer,
                          IdeaVersionSerializer, CommentSerializer,
                          IdeaEvaluationSerializer, AIEvaluationSerializer)
from .ai_service import evaluate_idea, chat_with_ideas


class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (AllowAny,)
    serializer_class = RegisterSerializer


class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer

    @action(detail=False, methods=['get'])
    def me(self, request):
        serializer = self.get_serializer(request.user)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def list_evaluators(self, request):
        """Return all users who can be assigned as evaluators (managers + owners)."""
        evaluators = User.objects.filter(role__in=['manager', 'owner'])
        serializer = self.get_serializer(evaluators, many=True)
        return Response(serializer.data)


class IdeaViewSet(viewsets.ModelViewSet):
    queryset = Idea.objects.all()
    serializer_class = IdeaSerializer

    def get_queryset(self):
        """Users can see ideas they created OR ideas targeted to them."""
        user = self.request.user
        if user.is_authenticated:
            return (Idea.objects.filter(owner=user) |
                    Idea.objects.filter(target_audience=user)).distinct()
        return Idea.objects.none()

    def perform_create(self, serializer):
        idea = serializer.save(owner=self.request.user)

        # Auto-assign to managers/owners if no specific audience provided
        if not idea.target_audience.exists():
            managers_owners = User.objects.filter(role__in=['manager', 'owner'])
            idea.target_audience.set(managers_owners)

        # Handle file uploads
        files = self.request.FILES.getlist('files')
        uploaded_file_paths = []
        for f in files:
            idea_file = IdeaFile.objects.create(idea=idea, file=f)
            uploaded_file_paths.append(idea_file.file.path)

        # Extract all idea fields from request data
        data = self.request.data
        description = data.get('description', 'No description provided.')
        problem = data.get('problem', '')
        approach = data.get('approach', '')
        impact = data.get('impact', '')

        # Create initial IdeaVersion with all details
        IdeaVersion.objects.create(
            idea=idea,
            version_number=1,
            description=description,
            problem=problem,
            approach=approach,
            impact=impact,
        )

        # Trigger AI Evaluation immediately using full context
        ai_res = evaluate_idea(
            title=idea.title,
            description=description,
            problem=problem,
            approach=approach,
            impact=impact,
            file_paths=uploaded_file_paths,
        )

        AIEvaluation.objects.create(
            idea=idea,
            concept_score=ai_res.get('concept_score', 5),
            feasibility_score=ai_res.get('feasibility_score', 5),
            application_score=ai_res.get('application_score', 5),
            overall_notes=ai_res.get('overall_notes', ''),
        )

    @action(detail=False, methods=['post'])
    def rag_chat(self, request):
        """
        RAG chatbot endpoint: answers questions about all ideas the user has access to.
        Builds a rich context block for each idea and calls Groq.
        """
        question = request.data.get('question', '').strip()
        if not question:
            return Response({'answer': 'الرجاء إدخال سؤال.'})

        ideas = (self.get_queryset()
                 .select_related('owner', 'ai_evaluation')
                 .prefetch_related('versions', 'evaluations'))

        context_parts = []
        for idea in ideas[:25]:  # Cap at 25 ideas to avoid token overflow
            latest_version = idea.versions.order_by('-version_number').first()
            ai_eval = getattr(idea, 'ai_evaluation', None)
            evaluations = idea.evaluations.all()

            block = [
                f"=== Idea: {idea.title} ===",
                f"Status: {idea.get_status_display()}",
                f"Category: {idea.category or 'General'}",
                f"Submitted by: {idea.owner.get_full_name() or idea.owner.username}"
                f" | Department: {idea.owner.department or 'N/A'}",
            ]

            if latest_version:
                block.append(f"Description: {latest_version.description}")
                if latest_version.problem:
                    block.append(f"Problem: {latest_version.problem}")
                if latest_version.approach:
                    block.append(f"Approach: {latest_version.approach}")
                if latest_version.impact:
                    block.append(f"Impact: {latest_version.impact}")

            if ai_eval:
                overall_short = (ai_eval.overall_notes[:400] + '...'
                                 if len(ai_eval.overall_notes) > 400
                                 else ai_eval.overall_notes)
                block.append(
                    f"AI Evaluation → Concept: {ai_eval.concept_score}/10 | "
                    f"Feasibility: {ai_eval.feasibility_score}/10 | "
                    f"Application: {ai_eval.application_score}/10"
                )
                block.append(f"AI Notes: {overall_short}")

            if evaluations.exists():
                avg = sum(e.numeric_score for e in evaluations) / len(evaluations)
                block.append(
                    f"Human Evaluations: {evaluations.count()} review(s), "
                    f"Average Score: {avg:.1f}/10"
                )

            block.append("===")
            context_parts.append("\n".join(block))

        context = "\n\n".join(context_parts) if context_parts else "No ideas have been submitted yet."
        answer = chat_with_ideas(question, context)
        return Response({"answer": answer})

    @action(detail=True, methods=['post'])
    def chat(self, request, pk=None):
        """
        Per-idea chatbot: answers questions about a specific idea only.
        """
        idea = self.get_object()
        message = request.data.get('message', '').strip()
        if not message:
            return Response({'reply': 'الرجاء إدخال رسالة.'})

        latest_version = idea.versions.order_by('-version_number').first()
        ai_eval = getattr(idea, 'ai_evaluation', None)

        context_parts = [
            f"=== Idea: {idea.title} ===",
            f"Status: {idea.get_status_display()}",
            f"Category: {idea.category or 'General'}",
            f"Submitted by: {idea.owner.username}",
        ]
        if latest_version:
            context_parts.append(f"Description: {latest_version.description}")
            if latest_version.problem:
                context_parts.append(f"Problem: {latest_version.problem}")
            if latest_version.approach:
                context_parts.append(f"Approach: {latest_version.approach}")
            if latest_version.impact:
                context_parts.append(f"Impact: {latest_version.impact}")
        if ai_eval:
            context_parts.append(
                f"AI Scores → Concept: {ai_eval.concept_score}/10 | "
                f"Feasibility: {ai_eval.feasibility_score}/10 | "
                f"Application: {ai_eval.application_score}/10"
            )
            context_parts.append(f"AI Notes: {ai_eval.overall_notes}")
        context_parts.append("===")

        context = "\n".join(context_parts)
        answer = chat_with_ideas(message, context)
        return Response({"reply": answer})

    @action(detail=True, methods=['get', 'post'])
    def comments(self, request, pk=None):
        idea = self.get_object()
        if request.method == 'GET':
            # Collect comments from all versions of this idea
            from django.db.models import Q
            all_comments = Comment.objects.filter(
                idea_version__idea=idea
            ).select_related('evaluator').order_by('-created_at')
            serializer = CommentSerializer(all_comments, many=True)
            return Response(serializer.data)

        # POST — add a comment to the latest version
        latest_version = idea.versions.order_by('-version_number').first()
        if not latest_version:
            return Response(
                {'detail': 'No version found for this idea.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        data = {**request.data, 'idea_version': latest_version.id, 'evaluator': request.user.id}
        serializer = CommentSerializer(data=data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'])
    def evaluate(self, request, pk=None):
        """Submit a human evaluation (numeric score + written feedback) for an idea."""
        if request.user.role == 'employee':
            return Response(
                {'detail': 'الموظفون غير مسموح لهم بتقييم الأفكار. هذه الصلاحية للمدراء والملاك فقط.'},
                status=status.HTTP_403_FORBIDDEN,
            )

        idea = self.get_object()
        serializer = IdeaEvaluationSerializer(
            data={**request.data, 'idea': idea.id, 'evaluator': request.user.id}
        )
        if serializer.is_valid():
            serializer.save()
            # Update idea status to under_review once it gets its first evaluation
            if idea.status == 'submitted':
                idea.status = 'under_review'
                idea.save(update_fields=['status'])
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class IdeaVersionViewSet(viewsets.ModelViewSet):
    queryset = IdeaVersion.objects.all()
    serializer_class = IdeaVersionSerializer


class CommentViewSet(viewsets.ModelViewSet):
    queryset = Comment.objects.all()
    serializer_class = CommentSerializer
