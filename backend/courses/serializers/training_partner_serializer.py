from rest_framework import serializers
from users.models import TrainingPartner


class TrainingPartnerSerializer(serializers.ModelSerializer):
    """Serializer for TrainingPartner model."""
    courses_count = serializers.SerializerMethodField()
    
    class Meta:
        model = TrainingPartner
        fields = [
            'id', 'name', 'type', 'description', 'website', 'email', 'phone',
            'address', 'logo', 'is_active', 'created_at', 'courses_count'
        ]
        read_only_fields = ['id', 'created_at', 'courses_count']
    
    def get_courses_count(self, obj):
        """Get the number of courses for this training partner."""
        return obj.courses.count()


class TrainingPartnerListSerializer(serializers.ModelSerializer):
    """Simplified serializer for training partner lists."""
    
    class Meta:
        model = TrainingPartner
        fields = ['id', 'name', 'type', 'logo', 'is_active']
