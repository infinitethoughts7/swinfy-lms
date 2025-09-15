from rest_framework import generics, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response

from users.models import KPProfile
from ..serializers import KnowledgePartnerSerializer, KnowledgePartnerListSerializer


class KnowledgePartnerListView(generics.ListAPIView):
    """List all active knowledge partners."""
    queryset = KPProfile.objects.filter(is_active=True)
    serializer_class = KnowledgePartnerListSerializer
    permission_classes = [permissions.AllowAny]


class KnowledgePartnerDetailView(generics.RetrieveAPIView):
    """Retrieve a specific knowledge partner."""
    queryset = KPProfile.objects.filter(is_active=True)
    serializer_class = KnowledgePartnerSerializer
    permission_classes = [permissions.AllowAny]


@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def knowledge_partner_list(request):
    """Legacy knowledge partner list endpoint."""
    knowledge_partners = KnowledgePartner.objects.filter(is_active=True)
    serializer = KnowledgePartnerListSerializer(knowledge_partners, many=True)
    return Response(serializer.data)
