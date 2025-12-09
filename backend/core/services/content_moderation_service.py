"""
Content Moderation Service
Combines multiple layers of protection:
- Layer 1: Bad words filter (instant, local)
- Layer 2: AI context analysis (OpenAI Moderation API)

This is the MAIN service you'll use in serializers and views!
"""

from typing import Dict, Any, List, Optional
from django.conf import settings
import logging

from core.utils.bad_words import (
    contains_bad_words,
    censor_bad_words,
    get_bad_words_from_text
)
from core.adapters.openai_adapter import get_openai_adapter

logger = logging.getLogger(__name__)


# ============================================
# MODERATION RESULT CLASS
# ============================================
class ContentModerationResult:
    """
    Clean result object for moderation checks
    Makes it easy to work with results in views/serializers
    """
    
    def __init__(
        self,
        is_clean: bool,
        layer_failed: Optional[str] = None,
        reason: str = "",
        details: Optional[Dict[str, Any]] = None
    ):
        """
        Args:
            is_clean: True if content passed all checks
            layer_failed: Which layer caught the violation ('layer1', 'layer2', or None)
            reason: Human-readable reason for blocking
            details: Additional details for logging/debugging
        """
        self.is_clean = is_clean
        self.layer_failed = layer_failed
        self.reason = reason
        self.details = details or {}
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for API responses"""
        return {
            'is_clean': self.is_clean,
            'layer_failed': self.layer_failed,
            'reason': self.reason,
            'details': self.details
        }
    
    def __bool__(self):
        """Allow using result in if statements: if result: ..."""
        return self.is_clean
    
    def __str__(self):
        """String representation for logging"""
        status = "CLEAN" if self.is_clean else " BLOCKED"
        return f"{status} - {self.reason}" if self.reason else status


# ============================================
# CONTENT MODERATION SERVICE
# ============================================
class ContentModerationService:
    """
    Main service for content moderation
    Orchestrates Layer 1 and Layer 2 checks
    """
    
    def __init__(self):
        """Initialize the service"""
        self.openai_adapter = get_openai_adapter()
        logger.info(" ContentModerationService initialized")
    
    # ========================================
    # MAIN MODERATION METHOD
    # ========================================
    
    def moderate_text(
        self,
        text: str,
        skip_ai_check: bool = False,
        custom_thresholds: Optional[Dict[str, float]] = None
    ) -> ContentModerationResult:
        """
        Moderate text content through multiple layers
        
        Flow:
        1. Check Layer 1 (bad words) - instant
        2. If passes, check Layer 2 (AI) - 1-2 seconds
        3. Return result
        
        Args:
            text: The text content to moderate
            skip_ai_check: If True, only run Layer 1 (for testing/performance)
            custom_thresholds: Optional custom AI thresholds
            
        Returns:
            ContentModerationResult object
            
        Example:
            >>> service = ContentModerationService()
            >>> result = service.moderate_text("This is great content")
            >>> if result.is_clean:
            ...     # Save to database
            >>> else:
            ...     # Show error to user: result.reason
        """
        # Handle empty text
        if not text or not text.strip():
            logger.warning("Empty text provided for moderation")
            return ContentModerationResult(
                is_clean=True,
                reason="Empty content is allowed"
            )
        
        text = text.strip()
        logger.info(f"🔍 Moderating text (length: {len(text)} chars)")
        
        # ========================================
        # LAYER 1: BAD WORDS CHECK (Fast!)
        # ========================================
        try:
            if contains_bad_words(text):
                bad_words = get_bad_words_from_text(text)
                censored = censor_bad_words(text)
                
                logger.warning(f" Layer 1 BLOCKED - Bad words found: {bad_words}")
                
                return ContentModerationResult(
                    is_clean=False,
                    layer_failed='layer1',
                    reason="Your content contains inappropriate language. Please revise and try again.",
                    details={
                        'bad_words_found': bad_words,
                        'censored_text': censored,
                        'original_length': len(text)
                    }
                )
            
            logger.info(" Layer 1 PASSED - No bad words detected")
            
        except Exception as e:
            logger.error(f" Layer 1 ERROR: {str(e)}")
            # Continue to Layer 2 even if Layer 1 fails
        
        # ========================================
        # LAYER 2: AI CONTEXT CHECK (Smart!)
        # ========================================
        if skip_ai_check:
            logger.info("⏭️ Skipping Layer 2 (AI check disabled)")
            return ContentModerationResult(
                is_clean=True,
                reason="Content passed Layer 1 check"
            )
        
        try:
            ai_result = self.openai_adapter.moderate_text(text)
            
            if ai_result.is_harmful(custom_thresholds):
                violations = ai_result.get_violations(custom_thresholds)
                highest_risk = ai_result.get_highest_risk_category()
                
                logger.warning(
                    f"Layer 2 BLOCKED - AI detected violations: {violations}"
                )
                
                # Create user-friendly message based on violation type
                reason = self._get_user_friendly_reason(violations)
                
                return ContentModerationResult(
                    is_clean=False,
                    layer_failed='layer2',
                    reason=reason,
                    details={
                        'violations': violations,
                        'highest_risk_category': highest_risk[0],
                        'highest_risk_score': highest_risk[1],
                        'ai_flagged': ai_result.flagged
                    }
                )
            
            logger.info(" Layer 2 PASSED - AI analysis complete, content is clean")
            
            return ContentModerationResult(
                is_clean=True,
                reason="Content passed all moderation checks",
                details={
                    'highest_risk_category': ai_result.get_highest_risk_category()[0],
                    'ai_flagged': ai_result.flagged
                }
            )
            
        except Exception as e:
            logger.error(f"Layer 2 ERROR: {str(e)}")
            
            # IMPORTANT DECISION: What to do if AI fails?
            # Option A: Allow content (assume innocent)
            # Option B: Block content (assume guilty)
            # We choose Option A - don't punish users for our API issues
            
            return ContentModerationResult(
                is_clean=True,
                reason="Content passed Layer 1, Layer 2 unavailable",
                details={'error': str(e)}
            )
    
    # ========================================
    # BATCH MODERATION
    # ========================================
    
    def moderate_multiple(
        self,
        texts: List[str],
        skip_ai_check: bool = False
    ) -> List[ContentModerationResult]:
        """
        Moderate multiple texts at once
        Useful when checking multiple fields (title + description + bio)
        
        Args:
            texts: List of text strings to moderate
            skip_ai_check: If True, only run Layer 1
            
        Returns:
            List of ContentModerationResult objects (same order as input)
            
        Example:
            >>> results = service.moderate_multiple([
            ...     course.title,
            ...     course.description,
            ...     course.short_description
            ... ])
            >>> if all(r.is_clean for r in results):
            ...     # All content is clean
        """
        if not texts:
            return []
        
        logger.info(f"🔍 Batch moderating {len(texts)} texts")
        
        results = []
        for i, text in enumerate(texts):
            try:
                result = self.moderate_text(text, skip_ai_check=skip_ai_check)
                results.append(result)
            except Exception as e:
                logger.error(f" Error moderating text {i}: {str(e)}")
                # Add a "failed" result
                results.append(ContentModerationResult(
                    is_clean=False,
                    reason=f"Moderation check failed: {str(e)}"
                ))
        
        clean_count = sum(1 for r in results if r.is_clean)
        logger.info(f" Batch moderation complete: {clean_count}/{len(results)} clean")
        
        return results
    
    # ========================================
    # HELPER METHODS
    # ========================================
    
    def _get_user_friendly_reason(self, violations: Dict[str, float]) -> str:
        """
        Convert technical violation categories to user-friendly messages
        
        Args:
            violations: Dict of {category: score}
            
        Returns:
            User-friendly error message
        """
        # Priority order - show most severe first
        priority_categories = [
            ('sexual/minors', "Content involving minors is strictly prohibited."),
            ('sexual', "Your content contains inappropriate sexual material."),
            ('hate', "Your content contains hate speech or discriminatory language."),
            ('hate/threatening', "Your content contains threatening hate speech."),
            ('harassment/threatening', "Your content contains threatening or harassing language."),
            ('harassment', "Your content contains harassing or bullying language."),
            ('violence/graphic', "Your content contains graphic violent material."),
            ('violence', "Your content contains violent or aggressive language."),
            ('self-harm', "Your content references self-harm. If you need help, please contact support."),
        ]
        
        # Find the first matching category
        for category, message in priority_categories:
            if category in violations:
                return message
        
        # Default message
        return "Your content violates our community guidelines. Please revise and try again."


# ============================================
# SINGLETON INSTANCE
# ============================================
_content_moderation_service = None


def get_content_moderation_service() -> ContentModerationService:
    """
    Get singleton instance of ContentModerationService
    Use this in your views and serializers!
    
    Returns:
        ContentModerationService instance
        
    Example:
        >>> from core.services.content_moderation_service import get_content_moderation_service
        >>> service = get_content_moderation_service()
        >>> result = service.moderate_text(user_input)
    """
    global _content_moderation_service
    
    if _content_moderation_service is None:
        _content_moderation_service = ContentModerationService()
    
    return _content_moderation_service


# ============================================
# CONVENIENCE FUNCTION (Shortcut!)
# ============================================
def moderate_text(text: str, skip_ai_check: bool = False) -> ContentModerationResult:
    """
    Convenience function - shortcut for quick moderation
    
    Args:
        text: Text to moderate
        skip_ai_check: Skip AI layer (Layer 2)
        
    Returns:
        ContentModerationResult
        
    Example:
        >>> from core.services.content_moderation_service import moderate_text
        >>> result = moderate_text("Hello world")
        >>> if not result.is_clean:
        ...     raise ValidationError(result.reason)
    """
    service = get_content_moderation_service()
    return service.moderate_text(text, skip_ai_check)


# ============================================
# TESTING HELPER
# ============================================
def test_content_moderation():
    """
    Comprehensive test of the moderation system
    Run in Django shell:
    >>> from core.services.content_moderation_service import test_content_moderation
    >>> test_content_moderation()
    """
    print("\n" + "="*70)
    print("🧪 TESTING COMPLETE CONTENT MODERATION SYSTEM")
    print("="*70 + "\n")
    
    service = get_content_moderation_service()
    
    test_cases = [
        # (text, should_pass, description)
        ("This course is excellent and well-structured", True, "Clean educational content"),
        ("This is shit content", False, "Layer 1: Bad words"),
        ("You are fucking stupid", False, "Layer 1: Profanity + Layer 2: Harassment"),
        ("I love this damn course", False, "Layer 1: Mild profanity"),
        ("This course teaches Python programming", True, "Clean technical content"),
        ("You're a worthless idiot", False, "Layer 2: Harassment (no bad words)"),
        ("I want to hurt myself", False, "Layer 2: Self-harm content"),
        ("Amazing tutorial, learned so much!", True, "Positive feedback"),
        ("This is a scam, don't enroll", False, "Layer 1: Custom bad word 'scam'"),
        ("", True, "Empty content (allowed)"),
    ]
    
    passed = 0
    failed = 0
    
    for text, should_pass, description in test_cases:
        print(f"📝 Test: {description}")
        print(f"   Input: '{text}'")
        
        try:
            result = service.moderate_text(text)
            
            # Check if result matches expectation
            test_passed = result.is_clean == should_pass
            
            if test_passed:
                print(f"   ✅ TEST PASSED")
                passed += 1
            else:
                print(f"   ❌ TEST FAILED")
                print(f"      Expected: {'CLEAN' if should_pass else 'BLOCKED'}")
                print(f"      Got: {'CLEAN' if result.is_clean else 'BLOCKED'}")
                failed += 1
            
            print(f"   Result: {result}")
            
            if not result.is_clean:
                print(f"   Layer Failed: {result.layer_failed}")
                print(f"   User Message: {result.reason}")
                if result.details:
                    print(f"   Details: {result.details}")
            
        except Exception as e:
            print(f"   ❌ ERROR: {str(e)}")
            failed += 1
        
        print()
    
    print("="*70)
    print(f"📊 RESULTS: {passed} passed, {failed} failed out of {len(test_cases)} tests")
    print("="*70 + "\n")
    
    return passed, failed