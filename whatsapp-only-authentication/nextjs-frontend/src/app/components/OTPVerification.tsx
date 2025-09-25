'use client';

import { useState, useEffect, useRef } from 'react';
import { MessageSquare, ArrowLeft, RotateCcw } from 'lucide-react';
import toast from 'react-hot-toast';
import { authService } from '../services/authService';

interface OTPVerificationProps {
  phoneNumber: string;
  onVerificationSuccess: (tokens: any) => void;
  onBack: () => void;
  onSignupComplete?: () => void;
  isSignup?: boolean;
}

export default function OTPVerification({ 
  phoneNumber, 
  onVerificationSuccess, 
  onBack, 
  onSignupComplete,
  isSignup = false 
}: OTPVerificationProps) {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [timeLeft, setTimeLeft] = useState(45); // 1 minute
  const [canResend, setCanResend] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Timer for OTP expiry
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [timeLeft]);

  // Auto-focus first input
  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return; // Prevent multiple characters
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '');
    if (pastedData.length === 6) {
      const newOtp = pastedData.split('');
      setOtp(newOtp);
      inputRefs.current[5]?.focus();
    }
  };

  const handleSubmit = async () => {
    const otpCode = otp.join('');
    if (otpCode.length !== 6) {
      toast.error('Please enter the complete 6-digit OTP');
      return;
    }

    setIsLoading(true);
    
    try {
      // Call AWS Cognito to verify OTP
      console.log(`Verifying OTP for ${phoneNumber}, isSignup: ${isSignup}, OTP: ${otpCode}`);
      const result = await authService.verifyOTP(phoneNumber, otpCode, isSignup);
      
      // Check if this is signup completion (no tokens)
      if ('signupComplete' in result && result.signupComplete) {
        setShowSuccessMessage(true);
        toast.success(result.message);
        // Call the signup complete callback after a short delay
        setTimeout(() => {
          if (onSignupComplete) {
            onSignupComplete();
          }
        }, 3000);
        return;
      }
      
      // Normal login flow with tokens
      toast.success('OTP verified successfully!');
      onVerificationSuccess(result);
    } catch (error: any) {
      console.error('OTP verification error:', error);
      toast.error(error.message || 'Invalid OTP. Please try again.');
      // Clear OTP on error
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setIsResending(true);
    
    try {
      // Call AWS Cognito to resend OTP
      const result = await authService.resendOTP(phoneNumber);
      
      toast.success(result.message);
      setTimeLeft(45);
      setCanResend(false);
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } catch (error: any) {
      console.error('Resend OTP error:', error);
      toast.error(error.message || 'Failed to resend OTP. Please try again.');
    } finally {
      setIsResending(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Show success message for signup completion
  if (showSuccessMessage) {
    return (
      <div className="w-full max-w-md mx-auto">
        <div className="bg-white shadow-xl rounded-lg p-8">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
              <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Account Verified!</h2>
            <p className="text-gray-600 mb-4">
              Your WhatsApp account has been successfully verified.
            </p>
            <p className="text-sm text-gray-500 mb-6">
              Redirecting you to sign in...
            </p>
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white shadow-xl rounded-lg p-8">
        <div className="text-center mb-8">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
            <MessageSquare className="h-6 w-6 text-green-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900">
            {isSignup ? 'Verify Your Account' : 'Enter Verification Code'}
          </h2>
          <p className="text-gray-600 mt-2">
            We've sent a 6-digit code to your WhatsApp
          </p>
          <p className="text-sm font-medium text-gray-900 mt-1">
            {phoneNumber}
          </p>
        </div>

        <div className="space-y-6">
          {/* OTP Input Fields */}
          <div className="flex justify-center space-x-3">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => {inputRefs.current[index] = el}}
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={1}
                value={digit}
                onChange={(e) => handleOtpChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={handlePaste}
                className="w-12 h-12 text-center text-xl font-bold border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
              />
            ))}
          </div>

          {/* Timer */}
          <div className="text-center">
            {!canResend ? (
              <p className="text-sm text-gray-600">
                Code expires in <span className="font-medium text-red-600">{formatTime(timeLeft)}</span>
              </p>
            ) : (
              <p className="text-sm text-red-600 font-medium">
                Code expired
              </p>
            )}
          </div>

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            disabled={isLoading || otp.join('').length !== 6}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Verifying...
              </div>
            ) : (
              'Verify Code'
            )}
          </button>

          {/* Resend OTP */}
          <div className="text-center">
            {canResend ? (
              <button
                onClick={handleResendOTP}
                disabled={isResending}
                className="text-blue-600 hover:text-blue-500 font-medium text-sm disabled:opacity-50"
              >
                {isResending ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                    Resending...
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    <RotateCcw className="h-4 w-4 mr-1" />
                    Resend Code
                  </div>
                )}
              </button>
            ) : (
              <p className="text-sm text-gray-500">
                Didn't receive the code? You can resend in {formatTime(timeLeft)}
              </p>
            )}
          </div>

          {/* Back Button */}
          <div className="text-center">
            <button
              onClick={onBack}
              className="text-gray-600 hover:text-gray-500 font-medium text-sm flex items-center justify-center mx-auto"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to {isSignup ? 'Sign Up' : 'Login'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
