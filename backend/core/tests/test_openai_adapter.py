from core.adapters.openai_adapter import get_openai_adapter

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