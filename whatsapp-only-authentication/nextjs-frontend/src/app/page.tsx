'use client';

import { useState } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import SignupForm from './components/SignupForm';
import LoginForm from './components/LoginForm';
import OTPVerification from './components/OTPVerification';
import Dashboard from './components/Dashboard';
import { Shield, UserPlus, LogIn } from 'lucide-react';
import { authService } from './services/authService';

type AppState = 'home' | 'signup' | 'signup-otp' | 'login' | 'login-otp' | 'dashboard';

interface UserData {
  phoneNumber: string;
  tokens?: any;
}

export default function Home() {
  const [currentState, setCurrentState] = useState<AppState>('home');
  const [userData, setUserData] = useState<UserData | null>(null);

  const handleSignupSuccess = (phoneNumber: string) => {
    // OTP is now automatically triggered during signUp()
    setUserData({ phoneNumber });
    setCurrentState('signup-otp');
  };

  const handleLoginSuccess = (phoneNumber: string) => {
    setUserData({ phoneNumber });
    setCurrentState('login-otp');
  };

  const handleOTPVerificationSuccess = (tokens: any) => {
    if (userData) {
      setUserData({ ...userData, tokens });
      setCurrentState('dashboard');
    }
  };

  const handleSignupComplete = () => {
    setCurrentState('login');
  };

  const handleBack = () => {
    switch (currentState) {
      case 'signup-otp':
        setCurrentState('signup');
        break;
      case 'login-otp':
        setCurrentState('login');
        break;
      case 'signup':
      case 'login':
        setCurrentState('home');
        break;
      default:
        setCurrentState('home');
    }
  };

  const handleLogout = () => {
    setUserData(null);
    setCurrentState('home');
  };

  const renderCurrentState = () => {
    switch (currentState) {
      case 'signup':
        return <SignupForm onSignupSuccess={handleSignupSuccess} />;
      
      case 'signup-otp':
        return (
          <OTPVerification
            phoneNumber={userData?.phoneNumber || ''}
            onVerificationSuccess={handleOTPVerificationSuccess}
            onBack={handleBack}
            onSignupComplete={handleSignupComplete}
            isSignup={true}
          />
        );
      
      case 'login':
        return (
          <LoginForm
            onLoginSuccess={handleLoginSuccess}
            onBack={handleBack}
          />
        );
      
      case 'login-otp':
        return (
          <OTPVerification
            phoneNumber={userData?.phoneNumber || ''}
            onVerificationSuccess={handleOTPVerificationSuccess}
            onBack={handleBack}
            isSignup={false}
          />
        );
      
      case 'dashboard':
        return (
          <Dashboard
            tokens={userData?.tokens || {}}
            userInfo={userData || { phoneNumber: '' }}
            onLogout={handleLogout}
          />
        );
      
      default:
        return (
          <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="w-full max-w-md mx-auto">
              <div className="bg-white shadow-xl rounded-lg p-8">
                <div className="text-center mb-8">
                  <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 mb-4">
                    <Shield className="h-8 w-8 text-blue-600" />
                  </div>
                  <h1 className="text-3xl font-bold text-gray-900">Welcome</h1>
                  <p className="text-gray-600 mt-2">
                    Choose an option to get started
                  </p>
                </div>

                <div className="space-y-4">
                  <button
                    onClick={() => setCurrentState('signup')}
                    className="w-full flex items-center justify-center px-6 py-4 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                  >
                    <UserPlus className="h-5 w-5 mr-2" />
                    Create New Account
                  </button>

                  <button
                    onClick={() => setCurrentState('login')}
                    className="w-full flex items-center justify-center px-6 py-4 border border-gray-300 rounded-lg shadow-sm text-base font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                  >
                    <LogIn className="h-5 w-5 mr-2" />
                    Sign In
                  </button>
                </div>

                <div className="mt-8 text-center">
                  <p className="text-xs text-gray-500">
                    Secure authentication with WhatsApp OTP verification
                  </p>
                </div>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <>
      {renderCurrentState()}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: '#10B981',
              secondary: '#fff',
            },
          },
          error: {
            duration: 4000,
            iconTheme: {
              primary: '#EF4444',
              secondary: '#fff',
            },
          },
        }}
      />
    </>
  );
}