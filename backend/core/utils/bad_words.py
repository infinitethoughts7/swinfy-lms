"""
Bad Words Detection Utility
Uses better-profanity library + custom words for OLLA platform
"""

from better_profanity import profanity
import logging

logger = logging.getLogger(__name__)


# ============================================
# CUSTOM BAD WORDS (OLLA-Specific)
# ============================================
# Add words specific to Indian context, education scams, etc.
CUSTOM_BAD_WORDS = [
    # Scam/Fraud related (common in education platforms)
    'scam', 'fraud', 'cheat', 'fake', 'bogus', 'ripoff',
    
    # Harassment related
    'harass', 'stalk', 'threaten', 'abuse',
    
    # Spam/Promotional
    'bitcoin', 'crypto', 'mlm', 'pyramid', 'stupid'
    
    # Add more as needed based on OLLA's moderation needs
]


# ============================================
# INITIALIZATION
# ============================================
def initialize_profanity_filter():
    """
    Initialize the profanity filter with library words + custom words
    Call this once when Django starts (in apps.py)
    """
    try:
        # Load the library's default bad words (1000+ words)
        profanity.load_censor_words()
        
        # Add our custom words
        profanity.add_censor_words(CUSTOM_BAD_WORDS)
        
        logger.info("✅ Profanity filter initialized successfully")
        
    except Exception as e:
        logger.error(f"❌ Failed to initialize profanity filter: {str(e)}")
        raise


# ============================================
# MAIN FUNCTIONS
# ============================================

def contains_bad_words(text: str) -> bool:
    """
    Check if text contains any bad words
    
    Args:
        text (str): The text to check
        
    Returns:
        bool: True if bad words found, False otherwise
        
    Example:
        >>> contains_bad_words("This is shit")
        True
        >>> contains_bad_words("This is great")
        False
    """
    if not text:
        return False
    
    try:
        return profanity.contains_profanity(text)
    except Exception as e:
        logger.error(f"Error checking bad words: {str(e)}")
        return False


def censor_bad_words(text: str) -> str:
    """
    Replace bad words with asterisks
    
    Args:
        text (str): The text to censor
        
    Returns:
        str: Text with bad words replaced by ****
        
    Example:
        >>> censor_bad_words("This is shit")
        "This is ****"
    """
    if not text:
        return text
    
    try:
        return profanity.censor(text)
    except Exception as e:
        logger.error(f"Error censoring bad words: {str(e)}")
        return text


def get_bad_words_from_text(text: str) -> list:
    """
    Extract all bad words found in text
    Useful for logging/reporting what was blocked
    
    Args:
        text (str): The text to analyze
        
    Returns:
        list: List of bad words found
        
    Example:
        >>> get_bad_words_from_text("This shit is damn bad")
        ['shit', 'damn']
    """
    if not text:
        return []
    
    try:
        # Split text into words and check each one
        words = text.lower().split()
        bad_words_found = []
        
        for word in words:
            # Check if this word or any variation is profane
            if profanity.contains_profanity(word):
                bad_words_found.append(word)
        
        return bad_words_found
        
    except Exception as e:
        logger.error(f"Error extracting bad words: {str(e)}")
        return []


def add_custom_bad_word(word: str):
    """
    Add a new custom bad word to the filter
    Useful for dynamic moderation updates
    
    Args:
        word (str): The word to add to bad words list
    """
    try:
        profanity.add_censor_words([word.lower()])
        logger.info(f" Added custom bad word: {word}")
    except Exception as e:
        logger.error(f"Failed to add custom bad word: {str(e)}")


# ============================================
# TESTING HELPER
# ============================================
def test_bad_words_detection():
    """
    Quick test function to verify bad words detection works
    Run this in Django shell to test
    """
    test_cases = [
        ("This course is great", False, "Should pass - clean text"),
        ("This is shit", True, "Should fail - contains profanity"),
        ("You are a scam", True, "Should fail - custom word"),
        ("This is fucking amazing", True, "Should fail - profanity (but context is positive)"),
        ("Damn good course", True, "Should fail - mild profanity"),
    ]
    
    print("\n" + "="*60)
    print("🧪 TESTING BAD WORDS DETECTION")
    print("="*60 + "\n")
    
    for text, should_fail, description in test_cases:
        result = contains_bad_words(text)
        status = "PASS" if result == should_fail else " FAIL"
        
        print(f"{status} | {description}")
        print(f"   Text: '{text}'")
        print(f"   Expected: {should_fail} | Got: {result}")
        
        if result:
            censored = censor_bad_words(text)
            found_words = get_bad_words_from_text(text)
            print(f"   Censored: '{censored}'")
            print(f"   Bad words: {found_words}")
        print()
    
    print("="*60 + "\n")