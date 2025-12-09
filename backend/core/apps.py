from django.apps import AppConfig
import logging

logger = logging.getLogger(__name__)


class CoreConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'core'
    verbose_name = 'Core Services'  # ← ADD THIS (optional, makes admin panel look nice)
    
    def ready(self):  # ← ADD THIS ENTIRE METHOD
        """
        This runs once when Django starts
        Perfect place to initialize our moderation system!
        """
        try:
            # Initialize bad words filter
            from core.utils.bad_words import initialize_profanity_filter
            initialize_profanity_filter()
            
            logger.info("✅ Core app initialized successfully")
            
        except Exception as e:
            logger.error(f"❌ Failed to initialize core app: {str(e)}")