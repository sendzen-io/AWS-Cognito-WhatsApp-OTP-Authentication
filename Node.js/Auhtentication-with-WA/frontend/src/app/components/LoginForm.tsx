'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Phone, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import { authService } from '../services/authService';

interface LoginFormData {
  phoneNumber: string;
}

interface LoginFormProps {
  onLoginSuccess: (phoneNumber: string) => void;
  onBack: () => void;
}

export default function LoginForm({ onLoginSuccess, onBack }: LoginFormProps) {
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>();

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    
    try {
      // Validate phone number format (E.164)
      const phoneRegex = /^\+[1-9]\d{1,14}$/;
      if (!phoneRegex.test(data.phoneNumber)) {
        toast.error('Please enter a valid phone number in E.164 format (e.g., +1234567890)');
        return;
      }

      // Call AWS Cognito to initiate custom auth flow
      const result = await authService.initiateLogin({
        phoneNumber: data.phoneNumber
      });
      
      toast.success(result.message);
      onLoginSuccess(data.phoneNumber);
    } catch (error: any) {
      console.error('Login error:', error);
      toast.error(error.message || 'Failed to send OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white shadow-xl rounded-lg p-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Welcome Back</h2>
          <p className="text-gray-600 mt-2">Enter your phone number to sign in</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Phone Number Field */}
          <div>
            <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Phone className="h-5 w-5 text-gray-400" />
              </div>
              <input
                {...register('phoneNumber', {
                  required: 'Phone number is required',
                  pattern: {
                    value: /^\+[1-9]\d{1,14}$/,
                    message: 'Please enter a valid phone number in E.164 format (e.g., +1234567890)',
                  },
                })}
                type="tel"
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500"
                placeholder="+1234567890"
                autoComplete="tel"
              />
            </div>
            {errors.phoneNumber && (
              <p className="mt-1 text-sm text-red-600">{errors.phoneNumber.message}</p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              We'll send a verification code to your WhatsApp
            </p>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Sending OTP...
              </div>
            ) : (
              'Send Verification Code'
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Don't have an account?{' '}
            <button
              onClick={() => window.location.href = '/signup'}
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              Sign up
            </button>
          </p>
        </div>

        {/* Back Button */}
        <div className="mt-4 text-center">
          <button
            onClick={onBack}
            className="text-gray-600 hover:text-gray-500 font-medium text-sm flex items-center justify-center mx-auto"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}
