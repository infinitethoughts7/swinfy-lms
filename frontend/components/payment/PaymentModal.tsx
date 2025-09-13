'use client';

import { useState, useEffect } from 'react';
import { X, CreditCard, Shield, Clock } from 'lucide-react';
import { paymentsApi } from '@/lib/api';
import { loadRazorpay, createRazorpayInstance, validateRazorpayAccount } from '@/lib/razorpay-utils';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  course: {
    id: string;
    title: string;
    price: string;
    slug: string;
  };
  onPaymentSuccess: (paymentData: unknown) => void;
}

interface RazorpayOrder {
  order_id: string;
  amount: number;
  currency: string;
  key: string;
  course_title: string;
  user_name: string;
  user_email: string;
  description: string;
  prefill: {
    name: string;
    email: string;
  };
  theme: {
    color: string;
  };
}

export default function PaymentModal({ isOpen, onClose, course, onPaymentSuccess }: PaymentModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [, setOrderData] = useState<RazorpayOrder | null>(null);

  // Check if Razorpay is loaded
  useEffect(() => {
    if (isOpen) {
      const initializeRazorpay = async () => {
        setError('Loading payment system...');
        
        try {
          const loaded = await loadRazorpay();
          if (loaded) {
            setError('');
          } else {
            setError('Failed to load payment system. Please refresh the page.');
          }
        } catch (error) {
          console.error('Razorpay initialization error:', error);
          setError('Payment system unavailable. Please try again.');
        }
      };
      
      initializeRazorpay();
    }
  }, [isOpen]);

  const createPaymentOrder = async () => {
    try {
      setLoading(true);
      setError('');

      const data = await paymentsApi.createOrder(course.slug);
      setOrderData(data);
      return data;
    } catch (err) {
      setError('Failed to create payment order. Please try again.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const openRazorpay = async (orderData: RazorpayOrder) => {
    try {
      // Validate Razorpay account
      const isValidAccount = await validateRazorpayAccount(orderData.key);
      if (!isValidAccount) {
        setError('Invalid payment configuration. Please contact support.');
        return;
      }

      const options = {
        key: orderData.key,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'Swinfy LMS',
        description: orderData.description,
        order_id: orderData.order_id,
        prefill: orderData.prefill,
        theme: orderData.theme,
        handler: async function (response: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) {
          try {
            // Verify payment
            const verifyData = await paymentsApi.verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            onPaymentSuccess(verifyData);
            onClose();
          } catch (err) {
            console.error('Payment verification error:', err);
            setError('Payment verification failed. Please contact support.');
          }
        },
        modal: {
          ondismiss: () => {
            setError('');
          }
        }
      };

      console.log('Opening Razorpay with options:', options);
      const rzp = createRazorpayInstance(options);
      
      // Add error handling for Razorpay open
      rzp.on('payment.failed', function (response: { error: { description?: string } }) {
        console.error('Payment failed:', response.error);
        setError(`Payment failed: ${response.error.description || 'Unknown error'}`);
      });
      
      rzp.open();
    } catch (err) {
      console.error('Razorpay initialization error:', err);
      setError('Failed to initialize payment. Please try again.');
    }
  };

  const handlePayment = async () => {
    try {
      const order = await createPaymentOrder();
      openRazorpay(order);
    } catch (err) {
      console.error('Payment error:', err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-sora font-bold text-gray-900">
            Complete Enrollment
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Course Info */}
          <div className="bg-gray-50 rounded-xl p-4 mb-6">
            <h3 className="font-sora font-semibold text-gray-900 mb-2">
              {course.title}
            </h3>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Course Price</span>
              <span className="text-2xl font-sora font-bold text-blue-600">
                ₹{parseFloat(course.price).toLocaleString()}
              </span>
            </div>
          </div>

          {/* Payment Features */}
          <div className="space-y-4 mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <Shield className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h4 className="font-sora font-semibold text-gray-900">Secure Payment</h4>
                <p className="text-sm text-gray-600">Powered by Razorpay</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h4 className="font-sora font-semibold text-gray-900">Multiple Payment Options</h4>
                <p className="text-sm text-gray-600">Cards, UPI, Net Banking, Wallets</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                <Clock className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h4 className="font-sora font-semibold text-gray-900">Instant Access</h4>
                <p className="text-sm text-gray-600">Start learning immediately after payment</p>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {/* Payment Button */}
          <button
            onClick={handlePayment}
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-sora font-bold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 disabled:hover:scale-100 shadow-lg"
          >
            {loading ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Processing...</span>
              </div>
            ) : (
              `Pay ₹${parseFloat(course.price).toLocaleString()} & Enroll`
            )}
          </button>

          {/* Terms */}
          <p className="text-xs text-gray-500 text-center mt-4">
            By proceeding, you agree to our Terms of Service and Privacy Policy.
            Payment is processed securely by Razorpay.
          </p>
        </div>
      </div>
    </div>
  );
}
