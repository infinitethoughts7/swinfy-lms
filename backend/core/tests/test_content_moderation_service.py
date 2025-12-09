"""
Tests for complete content moderation service (Layer 1 + Layer 2)
"""

from django.test import TestCase
from unittest.mock import patch, MagicMock
from core.services.content_moderation_service import (
    ContentModerationService,
    moderate_text,
    get_content_moderation_service
)


class ContentModerationServiceTestCase(TestCase):
    """Test content moderation service"""
    
    def setUp(self):
        """Set up test fixtures"""
        self.service = get_content_moderation_service()
    
    # ==========================================
    # LAYER 1 TESTS (Bad Words)
    # ==========================================
    
    def test_layer1_blocks_profanity(self):
        """Test that Layer 1 blocks obvious profanity"""
        result = self.service.moderate_text("This is shit content")
        
        self.assertFalse(result.is_clean)
        self.assertEqual(result.layer_failed, 'layer1')
        self.assertIn('inappropriate language', result.reason)
    
    def test_layer1_allows_clean_text(self):
        """Test that Layer 1 allows clean text"""
        # Skip Layer 2 to test Layer 1 only
        result = self.service.moderate_text(
            "This is excellent content",
            skip_ai_check=True
        )
        
        self.assertTrue(result.is_clean)
    
    # ==========================================
    # LAYER 2 TESTS (AI - Mocked)
    # ==========================================
    
    def test_layer2_detects_harassment(self):
        """Test that Layer 2 detects harassment without bad words"""
        # Mock OpenAI response by patching the adapter on the service instance
        mock_result = MagicMock()
        mock_result.is_harmful.return_value = True
        mock_result.get_violations.return_value = {'harassment': 0.85}
        mock_result.get_highest_risk_category.return_value = ('harassment', 0.85)
        mock_result.flagged = True
        
        # Patch the adapter's moderate_text method directly on the service instance
        self.service.openai_adapter.moderate_text = MagicMock(return_value=mock_result)
        
        result = self.service.moderate_text("Go away and never return")
        
        self.assertFalse(result.is_clean)
        self.assertEqual(result.layer_failed, 'layer2')
    
    def test_layer2_allows_clean_text(self):
        """Test that Layer 2 allows clean text"""
        # Mock OpenAI response
        mock_result = MagicMock()
        mock_result.is_harmful.return_value = False
        mock_result.get_highest_risk_category.return_value = ('harassment', 0.01)
        mock_result.flagged = False
        
        # Patch the adapter's moderate_text method directly on the service instance
        self.service.openai_adapter.moderate_text = MagicMock(return_value=mock_result)
        
        result = self.service.moderate_text("This course is amazing")
        
        self.assertTrue(result.is_clean)
    
    # ==========================================
    # ERROR HANDLING TESTS
    # ==========================================
    
    def test_graceful_degradation_on_api_failure(self):
        """Test that service degrades gracefully if OpenAI fails"""
        # Mock OpenAI failure on the service instance
        self.service.openai_adapter.moderate_text = MagicMock(side_effect=Exception("API Error"))
        
        # Clean text should still pass if Layer 1 passes
        result = self.service.moderate_text("Clean content here")
        
        self.assertTrue(result.is_clean)
        self.assertIn('Layer 2 unavailable', result.reason)
    
    # ==========================================
    # BATCH MODERATION TESTS
    # ==========================================
    
    def test_batch_moderation(self):
        """Test moderating multiple texts at once"""
        texts = [
            "Great course content",
            "This is shit",
            "Excellent tutorial",
        ]
        
        results = self.service.moderate_multiple(texts, skip_ai_check=True)
        
        self.assertEqual(len(results), 3)
        self.assertTrue(results[0].is_clean)  # Clean
        self.assertFalse(results[1].is_clean)  # Profanity
        self.assertTrue(results[2].is_clean)  # Clean
    
    # ==========================================
    # EDGE CASES
    # ==========================================
    
    def test_empty_text_handling(self):
        """Test that empty text is handled properly"""
        result = self.service.moderate_text("")
        self.assertTrue(result.is_clean)
        
        result = self.service.moderate_text(None)
        self.assertTrue(result.is_clean)
    
    def test_convenience_function(self):
        """Test the convenience moderate_text() function"""
        result = moderate_text("Test content", skip_ai_check=True)
        self.assertIsNotNone(result)
        self.assertTrue(hasattr(result, 'is_clean'))