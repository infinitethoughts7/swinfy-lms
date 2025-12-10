"""
Core views including content moderation API.
"""
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from core.services.content_moderation_service import get_content_moderation_service


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def check_content(request):
    """
    Real-time content moderation check.
    
    Request body:
    {
        "text": "Text to check",
        "field_name": "optional field name for context"
    }
    
    Response:
    {
        "is_clean": true/false,
        "field_name": "field_name if provided",
        "reason": "Error message if not clean",
        "bad_words": ["list", "of", "bad", "words"] if found
    }
    """
    text = request.data.get('text', '')
    field_name = request.data.get('field_name', '')
    
    # Don't check very short text (less than 3 chars)
    if len(text.strip()) < 3:
        return Response({
            'is_clean': True,
            'field_name': field_name,
            'reason': '',
            'bad_words': []
        })
    
    try:
        moderation_service = get_content_moderation_service()
        result = moderation_service.moderate_text(text, skip_ai_check=True)  # Skip AI for real-time
        
        bad_words = []
        if not result.is_clean and result.details:
            bad_words = result.details.get('bad_words_found', [])
        
        return Response({
            'is_clean': result.is_clean,
            'field_name': field_name,
            'reason': result.reason if not result.is_clean else '',
            'bad_words': bad_words
        })
        
    except Exception as e:
        # On error, allow content (don't block users for our issues)
        return Response({
            'is_clean': True,
            'field_name': field_name,
            'reason': '',
            'bad_words': [],
            'error': str(e)
        })


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def check_content_batch(request):
    """
    Batch content moderation check for multiple fields.
    
    Request body:
    {
        "fields": {
            "title": "Course title text",
            "description": "Course description",
            "bio": "User bio text"
        }
    }
    
    Response:
    {
        "results": {
            "title": {
                "is_clean": true,
                "reason": "",
                "bad_words": []
            },
            "description": {
                "is_clean": false,
                "reason": "Contains inappropriate language",
                "bad_words": ["word1"]
            }
        },
        "all_clean": false
    }
    """
    fields = request.data.get('fields', {})
    
    if not fields:
        return Response({
            'results': {},
            'all_clean': True
        })
    
    try:
        moderation_service = get_content_moderation_service()
        results = {}
        all_clean = True
        
        for field_name, text in fields.items():
            if not text or len(str(text).strip()) < 3:
                results[field_name] = {
                    'is_clean': True,
                    'reason': '',
                    'bad_words': []
                }
                continue
            
            result = moderation_service.moderate_text(str(text), skip_ai_check=True)
            
            bad_words = []
            if not result.is_clean and result.details:
                bad_words = result.details.get('bad_words_found', [])
                all_clean = False
            
            results[field_name] = {
                'is_clean': result.is_clean,
                'reason': result.reason if not result.is_clean else '',
                'bad_words': bad_words
            }
        
        return Response({
            'results': results,
            'all_clean': all_clean
        })
        
    except Exception as e:
        # On error, allow all content
        return Response({
            'results': {field: {'is_clean': True, 'reason': '', 'bad_words': []} for field in fields},
            'all_clean': True,
            'error': str(e)
        })
