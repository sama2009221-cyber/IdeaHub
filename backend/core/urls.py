from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)
from .views import UserViewSet, IdeaViewSet, IdeaVersionViewSet, CommentViewSet, RegisterView

router = DefaultRouter()
router.register(r'users', UserViewSet)
router.register(r'ideas', IdeaViewSet)
router.register(r'versions', IdeaVersionViewSet)
router.register(r'comments', CommentViewSet)

urlpatterns = [
    path('auth/register/', RegisterView.as_view(), name='auth_register'),
    path('auth/login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('', include(router.urls)),
]
