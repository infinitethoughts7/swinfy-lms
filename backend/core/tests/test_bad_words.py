"""
Tests for bad words detection (Layer 1)
"""

from django.test import TestCase
from core.utils.bad_words import (
    contains_bad_words,
    censor_bad_words,
    get_bad_words_from_text
)


class BadWordsTestCase(TestCase):
    """Test bad words detection functionality"""
    
    def test_clean_text_passes(self):
        """Test that clean text is not flagged"""
        clean_texts = [
            "This is a great course",
            "Learn Python programming",
            "Excellent tutorial on Django",
            "Amazing content for beginners",
        ]
        
        for text in clean_texts:
            with self.subTest(text=text):
                self.assertFalse(contains_bad_words(text))
    
    def test_profanity_detected(self):
        """Test that profanity is detected"""
        profane_texts = [
            "This is shit content",
            "You are fucking stupid",
            "What the hell is this",
            "Damn this course",
        ]
        
        for text in profane_texts:
            with self.subTest(text=text):
                self.assertTrue(contains_bad_words(text))
    
    def test_custom_words_detected(self):
        """Test that custom bad words are detected"""
        custom_bad_texts = [
            "This is a scam",
            "Total fraud course",
            "Don't trust this cheat",
        ]
        
        for text in custom_bad_texts:
            with self.subTest(text=text):
                self.assertTrue(contains_bad_words(text))
    
    def test_censoring_works(self):
        """Test that bad words are properly censored"""
        test_cases = [
            ("This is shit", "This is ****"),
            ("Fucking amazing", "**** amazing"),
        ]
        
        for original, expected in test_cases:
            with self.subTest(original=original):
                censored = censor_bad_words(original)
                self.assertEqual(censored, expected)
    
    def test_get_bad_words_from_text(self):
        """Test extracting bad words from text"""
        text = "This shit is fucking bad"
        bad_words = get_bad_words_from_text(text)
        
        self.assertIn('shit', bad_words)
        self.assertIn('fucking', bad_words)
        self.assertEqual(len(bad_words), 2)
    
    def test_empty_text_handling(self):
        """Test that empty text doesn't cause errors"""
        self.assertFalse(contains_bad_words(""))
        self.assertFalse(contains_bad_words(None))
        self.assertEqual(censor_bad_words(""), "")