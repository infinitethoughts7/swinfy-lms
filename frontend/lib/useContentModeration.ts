'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { authenticatedFetch } from './auth';

interface ModerationResult {
  is_clean: boolean;
  reason: string;
  bad_words: string[];
}

interface FieldErrors {
  [fieldName: string]: ModerationResult;
}

interface UseContentModerationOptions {
  debounceMs?: number;
  onError?: (error: string) => void;
}

/**
 * Hook for real-time content moderation
 * 
 * Usage:
 * const { checkField, fieldErrors, isChecking, clearFieldError } = useContentModeration();
 * 
 * // In your input handler:
 * const handleChange = (e) => {
 *   setValue(e.target.value);
 *   checkField('title', e.target.value);
 * };
 * 
 * // Show error in UI:
 * {fieldErrors.title && !fieldErrors.title.is_clean && (
 *   <p className="text-red-500">{fieldErrors.title.reason}</p>
 * )}
 */
export function useContentModeration(options: UseContentModerationOptions = {}) {
  const { debounceMs = 300, onError } = options;
  
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [isChecking, setIsChecking] = useState<{ [key: string]: boolean }>({});
  const timeoutsRef = useRef<{ [key: string]: NodeJS.Timeout }>({});

  // Cleanup timeouts on unmount
  useEffect(() => {
    const timeouts = timeoutsRef.current;
    return () => {
      Object.values(timeouts).forEach(clearTimeout);
    };
  }, []);

  /**
   * Check a single field for content moderation
   */
  const checkField = useCallback(async (fieldName: string, text: string) => {
    // Clear existing timeout for this field
    if (timeoutsRef.current[fieldName]) {
      clearTimeout(timeoutsRef.current[fieldName]);
    }

    // Don't check empty or very short text
    if (!text || text.trim().length < 3) {
      setFieldErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[fieldName];
        return newErrors;
      });
      return;
    }

    // Debounce the API call
    timeoutsRef.current[fieldName] = setTimeout(async () => {
      setIsChecking(prev => ({ ...prev, [fieldName]: true }));

      try {
        const apiUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/core/moderation/check/`;
        
        const response = await authenticatedFetch(apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            text,
            field_name: fieldName,
          }),
        });
        
        if (response.ok) {
          const result = await response.json();
          
          if (!result.is_clean) {
            setFieldErrors(prev => ({
              ...prev,
              [fieldName]: {
                is_clean: result.is_clean,
                reason: result.reason,
                bad_words: result.bad_words || [],
              },
            }));
          } else {
            // Clear error if content is now clean
            setFieldErrors(prev => {
              const newErrors = { ...prev };
              delete newErrors[fieldName];
              return newErrors;
            });
          }
        }
      } catch (error) {
        console.error('Content moderation check failed:', error);
        if (onError) {
          onError('Content moderation check failed');
        }
      } finally {
        setIsChecking(prev => ({ ...prev, [fieldName]: false }));
      }
    }, debounceMs);
  }, [debounceMs, onError]);

  /**
   * Check multiple fields at once (for form submission)
   */
  const checkMultipleFields = useCallback(async (fields: { [key: string]: string }) => {
    setIsChecking(prev => {
      const newChecking = { ...prev };
      Object.keys(fields).forEach(key => {
        newChecking[key] = true;
      });
      return newChecking;
    });

    try {
      const response = await authenticatedFetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/core/moderation/check-batch/`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ fields }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        
        const newErrors: FieldErrors = {};
        Object.entries(data.results).forEach(([fieldName, result]) => {
          const typedResult = result as ModerationResult;
          if (!typedResult.is_clean) {
            newErrors[fieldName] = typedResult;
          }
        });
        
        setFieldErrors(newErrors);
        return data.all_clean;
      }
      
      return true; // Allow if API fails
    } catch (error) {
      console.error('Batch content moderation check failed:', error);
      if (onError) {
        onError('Content moderation check failed');
      }
      return true; // Allow if API fails
    } finally {
      setIsChecking(prev => {
        const newChecking = { ...prev };
        Object.keys(fields).forEach(key => {
          newChecking[key] = false;
        });
        return newChecking;
      });
    }
  }, [onError]);

  /**
   * Clear error for a specific field
   */
  const clearFieldError = useCallback((fieldName: string) => {
    setFieldErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[fieldName];
      return newErrors;
    });
  }, []);

  /**
   * Clear all field errors
   */
  const clearAllErrors = useCallback(() => {
    setFieldErrors({});
  }, []);

  /**
   * Check if any field has an error
   */
  const hasErrors = Object.keys(fieldErrors).length > 0;

  /**
   * Get error message for a specific field
   */
  const getFieldError = useCallback((fieldName: string): string | null => {
    const error = fieldErrors[fieldName];
    if (error && !error.is_clean) {
      return error.reason;
    }
    return null;
  }, [fieldErrors]);

  /**
   * Get bad words found in a specific field
   */
  const getFieldBadWords = useCallback((fieldName: string): string[] => {
    const error = fieldErrors[fieldName];
    if (error && !error.is_clean) {
      return error.bad_words;
    }
    return [];
  }, [fieldErrors]);

  return {
    checkField,
    checkMultipleFields,
    fieldErrors,
    isChecking,
    hasErrors,
    getFieldError,
    getFieldBadWords,
    clearFieldError,
    clearAllErrors,
  };
}

/**
 * Moderated input wrapper component props
 */
export interface ModeratedInputProps {
  value: string;
  onChange: (value: string) => void;
  fieldName: string;
  checkField: (fieldName: string, text: string) => void;
  error?: string | null;
  isChecking?: boolean;
}

export default useContentModeration;
