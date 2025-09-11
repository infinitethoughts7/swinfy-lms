from rest_framework import generics, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response

from users.models import TrainingPartner
from ..serializers import TrainingPartnerSerializer, TrainingPartnerListSerializer


class TrainingPartnerListView(generics.ListAPIView):
    """List all active training partners."""
    queryset = TrainingPartner.objects.filter(is_active=True)
    serializer_class = TrainingPartnerListSerializer
    permission_classes = [permissions.AllowAny]


class TrainingPartnerDetailView(generics.RetrieveAPIView):
    """Retrieve a specific training partner."""
    queryset = TrainingPartner.objects.filter(is_active=True)
    serializer_class = TrainingPartnerSerializer
    permission_classes = [permissions.AllowAny]


@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def training_partner_list(request):
    """Legacy training partner list endpoint."""
    training_partners = TrainingPartner.objects.filter(is_active=True)
    serializer = TrainingPartnerListSerializer(training_partners, many=True)
    return Response(serializer.data)
