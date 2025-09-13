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
    // This is a simple validation - in production you might want to validate differently
    if (!keyId || !keyId.startsWith('rzp_')) {
      return false;
    }
    return true;
  } catch (error) {
    console.error('Account validation failed:', error);
    return false;
  }
};
