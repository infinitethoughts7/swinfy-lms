"""
OpenAI Adapter
Handles all communication with OpenAI's Moderation API
Follows Adapter Pattern - abstracts external dependency
"""

from openai import OpenAI
from django.conf import settings
import logging
from typing import Dict, Any, Optional

logger = logging.getLogger(__name__)


# ============================================
# MODERATION RESULT CLASS
# ============================================
class ModerationResult:
    """
    Clean data structure to hold moderation results
    Makes it easy to work with API response
    """
    
    def __init__(self, raw_response: Dict[str, Any]):
        """
        Args:
            raw_response: Raw response from OpenAI API
        """
        self.raw_response = raw_response
        self.results = raw_response.get('results', [{}])[0]
        
        # Extract scores and flags
        self.categories = self.results.get('categories', {})
        self.category_scores = self.results.get('category_scores', {})
        self.flagged = self.results.get('flagged', False)
    
    def is_harmful(self, custom_thresholds: Optional[Dict[str, float]] = None) -> bool:
        """
        Check if content is harmful based on thresholds
        
        Args:
            custom_thresholds: Optional custom thresholds to override defaults
            
        Returns:
            bool: True if content violates any threshold
        """
        thresholds = custom_thresholds or settings.MODERATION_THRESHOLDS
        
        for category, threshold in thresholds.items():
            score = self.category_scores.get(category, 0.0)
            if score >= threshold:
                logger.warning(
                    f"⚠️ Content flagged - Category: {category}, "
                    f"Score: {score:.2f}, Threshold: {threshold}"
                )
                return True
        
        return False
    
    def get_violations(self, custom_thresholds: Optional[Dict[str, float]] = None) -> Dict[str, float]:
        """
        Get all categories that exceeded thresholds
        
        Returns:
            Dict mapping category names to their scores
        """
        thresholds = custom_thresholds or settings.MODERATION_THRESHOLDS
        violations = {}
        
        for category, threshold in thresholds.items():
            score = self.category_scores.get(category, 0.0)
            if score >= threshold:
                violations[category] = score
        
        return violations
    
    def get_highest_risk_category(self) -> tuple[str, float]:
        """
        Get the category with highest risk score
        
        Returns:
            Tuple of (category_name, score)
        """
        if not self.category_scores:
            return ("none", 0.0)
        
        max_category = max(self.category_scores.items(), key=lambda x: x[1])
        return max_category
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert result to dictionary for logging/debugging"""
        return {
            'flagged': self.flagged,
            'categories': self.categories,
            'category_scores': self.category_scores,
            'violations': self.get_violations(),
            'highest_risk': self.get_highest_risk_category(),
        }


# ============================================
# OPENAI ADAPTER CLASS
# ============================================
class OpenAIAdapter:
    """
    Adapter for OpenAI Moderation API
    Handles authentication, requests, and error handling
    """
    
    def __init__(self):
        """Initialize OpenAI client with API key from settings"""
        api_key = settings.OPENAI_API_KEY
        
        if not api_key:
            logger.error("❌ OPENAI_API_KEY not found in settings!")
            raise ValueError("OPENAI_API_KEY is required for content moderation")
        
        self.client = OpenAI(api_key=api_key)
        logger.info("✅ OpenAI Adapter initialized successfully")
    
    def moderate_text(self, text: str) -> ModerationResult:
        """
        Send text to OpenAI Moderation API
        
        Args:
            text (str): Text content to moderate
            
        Returns:
            ModerationResult: Structured moderation results
            
        Raises:
            Exception: If API call fails
            
        Example:
            >>> adapter = OpenAIAdapter()
            >>> result = adapter.moderate_text("This is great content")
            >>> result.is_harmful()
            False
        """
        if not text or not text.strip():
            logger.warning("⚠️ Empty text provided for moderation")
            # Return a safe "clean" result for empty text
            return ModerationResult({
                'results': [{
                    'flagged': False,
                    'categories': {},
                    'category_scores': {},
                }]
            })
        
        try:
            logger.info(f"🔍 Moderating text (length: {len(text)} chars)")
            
            # Call OpenAI Moderation API
            response = self.client.moderations.create(
                input=text,
                model="omni-moderation-latest"  # Using latest model
            )
            
            # Convert to dict (OpenAI SDK returns Pydantic models)
            response_dict = response.model_dump()
            
            logger.info(f"✅ Moderation complete - Flagged: {response_dict['results'][0]['flagged']}")
            
            return ModerationResult(response_dict)
            
        except Exception as e:
            logger.error(f"❌ OpenAI API error: {str(e)}")
            raise Exception(f"Content moderation failed: {str(e)}")
    
    def moderate_multiple(self, texts: list[str]) -> list[ModerationResult]:
        """
        Moderate multiple texts in one API call (more efficient!)
        
        Args:
            texts: List of text strings to moderate
            
        Returns:
            List of ModerationResult objects
            
        Example:
            >>> results = adapter.moderate_multiple([
            ...     "Good content",
            ...     "Bad content with profanity"
            ... ])
        """
        if not texts:
            return []
        
        try:
            logger.info(f"🔍 Moderating {len(texts)} texts in batch")
            
            # Filter out empty texts
            valid_texts = [t for t in texts if t and t.strip()]
            
            if not valid_texts:
                logger.warning("⚠️ No valid texts to moderate")
                return []
            
            # Call API with multiple inputs
            response = self.client.moderations.create(
                input=valid_texts,
                model="omni-moderation-latest"
            )
            
            response_dict = response.model_dump()
            
            # Create ModerationResult for each input
            results = []
            for i, result in enumerate(response_dict['results']):
                results.append(ModerationResult({
                    'results': [result]
                }))
            
            logger.info(f"✅ Batch moderation complete - {len(results)} results")
            
            return results
            
        except Exception as e:
            logger.error(f"❌ Batch moderation error: {str(e)}")
            raise Exception(f"Batch content moderation failed: {str(e)}")


# ============================================
# SINGLETON INSTANCE
# ============================================
# Create a single instance to reuse (efficient!)
_openai_adapter_instance = None


def get_openai_adapter() -> OpenAIAdapter:
    """
    Get singleton instance of OpenAI Adapter
    Reuses same instance to avoid recreating client
    
    Returns:
        OpenAIAdapter: The singleton adapter instance
    """
    global _openai_adapter_instance
    
    if _openai_adapter_instance is None:
        _openai_adapter_instance = OpenAIAdapter()
    
    return _openai_adapter_instance


#============================================
# TESTING HELPER
#============================================
def test_openai_moderation():
    """
    Test function to verify OpenAI integration works
    Run in Django shell: python manage.py shell
    >>> from core.adapters.openai_adapter import test_openai_moderation
    >>> test_openai_moderation()
    """
    print("\n" + "="*60)
    print("🧪 TESTING OPENAI MODERATION API")
    print("="*60 + "\n")
    
    adapter = get_openai_adapter()
    
    test_cases = [
        ("This course is absolutely amazing!", False, "Clean positive text"),
        ("I fucking love this content", True, "Profanity but positive context"),
        ("You are stupid and worthless", True, "Harassment"),
        ("I want to kill myself", True, "Self-harm content"),
        ("This tutorial is damn good", None, "Mild profanity - borderline"),
    ]
    
    for text, expected_harmful, description in test_cases:
        print(f"📝 Test: {description}")
        print(f"   Text: '{text}'")
        
        try:
            result = adapter.moderate_text(text)
            is_harmful = result.is_harmful()
            
            print(f"   Result: {'❌ HARMFUL' if is_harmful else '✅ CLEAN'}")
            print(f"   Flagged by OpenAI: {result.flagged}")
            
            if result.get_violations():
                print(f"   Violations: {result.get_violations()}")
            
            highest_risk = result.get_highest_risk_category()
            print(f"   Highest Risk: {highest_risk[0]} ({highest_risk[1]:.2f})")
            
            if expected_harmful is not None:
                status = "✅ PASS" if is_harmful == expected_harmful else "⚠️ UNEXPECTED"
                print(f"   {status}")
            
        except Exception as e:
            print(f"   ❌ ERROR: {str(e)}")
        
        print()
    
    print("="*60 + "\n")