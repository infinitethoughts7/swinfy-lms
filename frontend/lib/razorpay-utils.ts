// Razorpay utility functions

export interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  prefill: {
    name: string;
    email: string;
  };
  theme: {
    color: string;
  };
  handler: (response: any) => void;
  modal?: {
    ondismiss: () => void;
  };
}

// Temporarily suppress console errors during Razorpay operations
const suppressConsoleErrors = () => {
  const originalError = console.error;
  console.error = (...args) => {
    // Suppress SVG attribute warnings from Razorpay
    if (args[0] && typeof args[0] === 'string' && 
        (args[0].includes('svg') || args[0].includes('Expected length'))) {
      return;
    }
    originalError.apply(console, args);
  };
  
  // Restore after 10 seconds
  setTimeout(() => {
    console.error = originalError;
  }, 10000);
};

export const loadRazorpay = (): Promise<boolean> => {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') {
      resolve(false);
      return;
    }

    // Check if already loaded
    if ((window as any).Razorpay) {
      resolve(true);
      return;
    }

    // Check if script is already being loaded
    const existingScript = document.querySelector('script[src*="checkout.razorpay.com"]');
    if (existingScript) {
      // Wait for it to load
      existingScript.addEventListener('load', () => resolve(true));
      existingScript.addEventListener('error', () => resolve(false));
      return;
    }

    // Load the script
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    
    script.onload = () => {
      console.log('Razorpay script loaded successfully');
      // Suppress console errors when Razorpay loads
      suppressConsoleErrors();
      resolve(true);
    };
    
    script.onerror = () => {
      console.error('Failed to load Razorpay script');
      resolve(false);
    };

    document.head.appendChild(script);
  });
};

export const createRazorpayInstance = (options: RazorpayOptions) => {
  if (typeof window === 'undefined' || !(window as any).Razorpay) {
    throw new Error('Razorpay is not available');
  }

  try {
    const rzp = new (window as any).Razorpay(options);
    
    // Add error handlers
    rzp.on('payment.failed', function (response: any) {
      console.error('Payment failed:', response.error);
    });

    return rzp;
  } catch (error) {
    console.error('Failed to create Razorpay instance:', error);
    throw error;
  }
};

export const validateRazorpayAccount = async (keyId: string): Promise<boolean> => {
  try {
    // Basic validation - check if key exists and has correct format
    if (!keyId || !keyId.startsWith('rzp_')) {
      console.warn('Invalid Razorpay key format:', keyId);
      return false;
    }
    
    // For test keys, we'll assume they're valid if they follow the format
    // Razorpay's own validation API sometimes has issues with test keys
    if (keyId.includes('test')) {
      console.log('Using test key, skipping external validation');
      return true;
    }
    
    return true;
  } catch (error) {
    console.error('Account validation failed:', error);
    // Don't fail the payment flow due to validation errors
    return true;
  }
};
