'use client';

import { useState } from 'react';
import { 
  Shield, 
  Key, 
  Clock, 
  Copy, 
  Check, 
  LogOut, 
  User, 
  Phone,
  Eye,
  EyeOff
} from 'lucide-react';
import toast from 'react-hot-toast';
import { authService } from '../services/authService';

interface DashboardProps {
  tokens: {
    accessToken: string;
    refreshToken: string;
    idToken: string;
    expiresIn: number;
  };
  userInfo: {
    phoneNumber: string;
  };
  onLogout: () => void;
}

export default function Dashboard({ tokens, userInfo, onLogout }: DashboardProps) {
  const [showTokens, setShowTokens] = useState(false);
  const [copiedToken, setCopiedToken] = useState<string | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const copyToClipboard = async (text: string, tokenType: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedToken(tokenType);
      toast.success(`${tokenType} copied to clipboard!`);
      setTimeout(() => setCopiedToken(null), 2000);
    } catch (error) {
      toast.error('Failed to copy to clipboard');
    }
  };

  const formatToken = (token: string) => {
    if (showTokens) {
      return token;
    }
    return `${token.substring(0, 20)}...${token.substring(token.length - 20)}`;
  };

  const getTokenExpiry = () => {
    const now = new Date();
    const expiry = new Date(now.getTime() + tokens.expiresIn * 1000);
    return expiry.toLocaleString();
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    
    try {
      await authService.logout(tokens.accessToken);
      toast.success('Logged out successfully');
      onLogout();
    } catch (error: any) {
      console.error('Logout error:', error);
      toast.error('Error during logout');
      // Still call onLogout to clear local state
      onLogout();
    } finally {
      setIsLoggingOut(false);
    }
  };

  const TokenCard = ({ 
    title, 
    token, 
    icon: Icon, 
    description, 
    tokenType 
  }: {
    title: string;
    token: string;
    icon: any;
    description: string;
    tokenType: string;
  }) => (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <Icon className="h-5 w-5 text-blue-600 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        </div>
        <button
          onClick={() => copyToClipboard(token, tokenType)}
          className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
        >
          {copiedToken === tokenType ? (
            <Check className="h-4 w-4 text-green-600" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
        </button>
      </div>
      <p className="text-sm text-gray-600 mb-3">{description}</p>
      <div className="bg-gray-50 rounded-lg p-3 font-mono text-sm break-all text-gray-900">
        {formatToken(token)}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <Shield className="h-8 w-8 text-blue-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            </div>
            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoggingOut ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2"></div>
              ) : (
                <LogOut className="h-4 w-4 mr-2" />
              )}
              {isLoggingOut ? 'Logging out...' : 'Logout'}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* User Info */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
          <div className="flex items-center mb-4">
            <User className="h-5 w-5 text-blue-600 mr-2" />
            <h2 className="text-xl font-semibold text-gray-900">User Information</h2>
          </div>
          <div className="grid grid-cols-1 gap-4">
            <div className="flex items-center">
              <Phone className="h-4 w-4 text-gray-400 mr-2" />
              <span className="text-sm text-gray-600">Phone:</span>
              <span className="ml-2 text-sm font-medium text-gray-900">{userInfo.phoneNumber}</span>
            </div>
          </div>
        </div>

        {/* Token Visibility Toggle */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Authentication Tokens</h2>
              <p className="text-sm text-gray-600">
                Your authentication tokens are displayed below. Click the eye icon to toggle visibility.
              </p>
            </div>
            <button
              onClick={() => setShowTokens(!showTokens)}
              className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              {showTokens ? (
                <EyeOff className="h-4 w-4 mr-2" />
              ) : (
                <Eye className="h-4 w-4 mr-2" />
              )}
              {showTokens ? 'Hide' : 'Show'} Tokens
            </button>
          </div>
        </div>

        {/* Tokens Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <TokenCard
            title="Access Token"
            token={tokens.accessToken}
            icon={Key}
            description="Used to authenticate API requests and access protected resources."
            tokenType="Access Token"
          />
          
          <TokenCard
            title="ID Token"
            token={tokens.idToken}
            icon={Shield}
            description="Contains user identity information and claims."
            tokenType="ID Token"
          />
          
          <TokenCard
            title="Refresh Token"
            token={tokens.refreshToken}
            icon={Clock}
            description="Used to obtain new access tokens when they expire."
            tokenType="Refresh Token"
          />
        </div>

        {/* Token Expiry Info */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center mb-4">
            <Clock className="h-5 w-5 text-blue-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">Token Information</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <span className="text-sm text-gray-600">Access Token Expires:</span>
              <p className="text-sm font-medium text-gray-900">{getTokenExpiry()}</p>
            </div>
            <div>
              <span className="text-sm text-gray-600">Token Type:</span>
              <p className="text-sm font-medium text-gray-900">Bearer</p>
            </div>
          </div>
        </div>

        {/* Security Notice */}
        <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <div className="flex">
            <Shield className="h-5 w-5 text-yellow-600 mr-3 mt-0.5" />
            <div>
              <h3 className="text-sm font-medium text-yellow-800">Security Notice</h3>
              <p className="text-sm text-yellow-700 mt-1">
                Keep your tokens secure and never share them. These tokens provide access to your account and should be treated as sensitive information.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
