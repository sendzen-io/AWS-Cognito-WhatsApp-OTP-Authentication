# Cognito WhatsApp OTP Frontend

A modern React/Next.js frontend application for AWS Cognito authentication with WhatsApp OTP verification. This application implements a complete authentication system with phone number-based signup and login using custom authentication flows.

## Features

- **Phone Number Signup**: Registration with phone number and password validation
- **WhatsApp OTP Verification**: Secure OTP verification via WhatsApp for both signup and login
- **Custom Authentication Flow**: Seamless integration with AWS Cognito custom auth triggers
- **Secret Hash Authentication**: Secure authentication using HMAC-SHA256 secret hashes
- **Token Management**: JWT token storage and management with automatic refresh
- **Responsive Design**: Mobile-first design with Tailwind CSS
- **Real-time Validation**: Form validation with react-hook-form
- **Error Handling**: Comprehensive error handling and user feedback
- **Dashboard**: User information display and token management

## Prerequisites

- Node.js 18+ 
- npm or yarn
- AWS Cognito User Pool configured with custom auth flow
- WhatsApp API integration (SendZen or similar)

## Installation

1. **Clone the repository and navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   
   Copy the example environment file:
   ```bash
   cp env.example .env.local
   ```
   
   Update `.env.local` with your AWS Cognito configuration:
   ```env
   NEXT_PUBLIC_AWS_REGION=eu-west-1
   NEXT_PUBLIC_USER_POOL_ID=your-user-pool-id
   NEXT_PUBLIC_CLIENT_ID=your-client-id
   NEXT_PUBLIC_CLIENT_SECRET=your-client-secret
   ```

## AWS Cognito Setup

Your AWS Cognito User Pool should be configured with:

1. **Custom Authentication Flow** with the following triggers:
   - `PreSignUp`: Auto-confirm users and set custom attributes
   - `CreateAuthChallenge`: Generate and send WhatsApp OTP
   - `DefineAuthChallenge`: Define the authentication flow
   - `VerifyAuthChallenge`: Verify the OTP code

2. **User Pool Attributes**:
   - `phone_number` (required)
   - `custom:auth_purpose` (custom attribute)
   - `custom:whatsapp_verified` (custom attribute)

3. **App Client Settings**:
   - Enable custom authentication flow
   - Generate and note the client secret (required for secret hash)
   - Configure OAuth flows as needed

## Development

1. **Start the development server**
   ```bash
   npm run dev
   ```

2. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Project Structure

```
frontend/
├── src/
│   └── app/
│       ├── components/
│       │   ├── SignupForm.tsx      # User registration form
│       │   ├── LoginForm.tsx       # Phone number login form
│       │   ├── OTPVerification.tsx # OTP verification component
│       │   └── Dashboard.tsx       # User dashboard with tokens
│       ├── services/
│       │   └── authService.ts      # AWS Cognito integration
│       ├── globals.css             # Global styles
│       ├── layout.tsx              # Root layout
│       └── page.tsx                # Main application page
├── public/                         # Static assets
├── package.json                    # Dependencies and scripts
└── README.md                       # This file
```

## Authentication Flow

### Signup Flow
1. **User Registration**: User enters phone number (E.164 format) and password
2. **Account Creation**: AWS Cognito creates account with auto-confirmation
3. **OTP Trigger**: System automatically triggers custom auth challenge
4. **WhatsApp OTP**: OTP is sent to user's WhatsApp number via SendZen API
5. **OTP Verification**: User enters 6-digit OTP to verify WhatsApp number
6. **Account Activation**: User attributes are updated and tokens are issued
7. **Dashboard Access**: User is redirected to dashboard with full access

### Login Flow
1. **Phone Number Entry**: User enters registered phone number
2. **Account Validation**: System validates account exists and is confirmed
3. **Custom Auth Initiation**: Custom authentication flow is triggered
4. **WhatsApp OTP**: OTP is sent to user's WhatsApp number
5. **OTP Verification**: User enters 6-digit OTP
6. **Authentication Complete**: JWT tokens are issued and stored
7. **Dashboard Access**: User is redirected to dashboard

### Token Management
- **Access Token**: Short-lived token for API authentication
- **Refresh Token**: Long-lived token for token renewal
- **ID Token**: Contains user identity information
- **Local Storage**: Secure token storage with automatic cleanup on logout

## Key Components

### SignupForm
- **Phone Number Validation**: E.164 format validation with real-time feedback
- **Password Requirements**: Minimum 8 characters with strength validation
- **Password Confirmation**: Matching password validation
- **Form Validation**: Real-time validation using react-hook-form
- **Error Handling**: User-friendly error messages for all validation failures

### LoginForm
- **Phone Number Input**: E.164 format validation
- **Custom Auth Flow**: Initiates AWS Cognito custom authentication
- **Session Management**: Handles authentication session state
- **Error Handling**: Comprehensive error handling for login failures

### OTPVerification
- **6-Digit Input**: Auto-focusing input fields for OTP entry
- **Paste Support**: Automatic OTP parsing from clipboard
- **Resend Functionality**: OTP resend with cooldown timer
- **Expiry Timer**: 5-minute countdown timer for OTP validity
- **Visual Feedback**: Clear success/error states and loading indicators

### Dashboard
- **Token Display**: Secure token viewing with show/hide functionality
- **Copy to Clipboard**: One-click token copying functionality
- **User Information**: Display of user phone number and ID
- **Secure Logout**: Complete session cleanup and token invalidation
- **Token Refresh**: Automatic token refresh handling

## API Integration

The application uses AWS SDK v3 for Cognito integration with comprehensive secret hash authentication:

### Core Authentication Methods
- **SignUp**: Create new user accounts with secret hash authentication
- **InitiateAuth**: Start custom authentication flow with CUSTOM_AUTH flow type
- **RespondToAuthChallenge**: Verify OTP codes and complete authentication
- **GetUser**: Retrieve user information using access tokens
- **GlobalSignOut**: Secure logout with token invalidation

### Secret Hash Implementation
The application implements HMAC-SHA256 secret hash generation using the Web Crypto API:

```typescript
// Secret hash generation for all Cognito operations
const secretHash = await generateSecretHash(username);
```

**Why Secret Hash is Required:**
- Cognito User Pools with client secrets require HMAC-SHA256 authentication
- Prevents unauthorized access to user pools
- Ensures secure communication between client and Cognito

### Session Management
- **Authentication Session**: Stored during custom auth flow
- **Token Storage**: Secure localStorage implementation
- **Session Cleanup**: Automatic cleanup on logout or errors
- **Token Refresh**: Handles token expiration and renewal

## Styling

- **Tailwind CSS**: Utility-first CSS framework
- **Lucide React**: Beautiful icon library
- **Responsive Design**: Mobile-first approach
- **Dark/Light Mode**: Ready for theme switching

## Error Handling

- Form validation with react-hook-form
- API error handling with user-friendly messages
- Toast notifications for feedback
- Loading states for better UX

## Security Features

### Authentication Security
- **Secret Hash Authentication**: HMAC-SHA256 for all Cognito operations
- **Token Security**: Secure token storage and management
- **Session Management**: Proper session cleanup and invalidation
- **Input Validation**: E.164 phone number format validation
- **Error Handling**: Secure error messages without sensitive information

### Data Protection
- **Local Storage**: Secure token storage with automatic cleanup
- **HTTPS Enforcement**: Production-ready HTTPS configuration
- **Input Sanitization**: Form input validation and sanitization
- **XSS Protection**: React's built-in XSS protection
- **CSRF Protection**: Cognito's built-in CSRF protection

### Privacy Features
- **Minimal Data Collection**: Only phone number and password required
- **Token Expiration**: Automatic token expiration handling
- **Secure Logout**: Complete session and token cleanup
- **No Sensitive Logging**: Avoids logging sensitive authentication data

## Deployment

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Start production server**
   ```bash
   npm start
   ```

3. **Deploy to your preferred platform**
   - Vercel (recommended for Next.js)
   - AWS Amplify
   - Netlify
   - Docker container

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_AWS_REGION` | AWS region for Cognito | Yes |
| `NEXT_PUBLIC_USER_POOL_ID` | Cognito User Pool ID | Yes |
| `NEXT_PUBLIC_CLIENT_ID` | Cognito App Client ID | Yes |
| `NEXT_PUBLIC_CLIENT_SECRET` | Cognito App Client Secret | Yes |
| `NEXT_PUBLIC_API_BASE_URL` | Backend API URL | No |

## Troubleshooting

### Common Issues

1. **CORS Errors**: Ensure your Cognito User Pool allows your domain in the allowed origins
2. **OTP Not Received**: Check WhatsApp API configuration and template setup
3. **Authentication Failures**: Verify User Pool triggers are properly configured
4. **Token Issues**: Check token expiry and refresh logic
5. **Secret Hash Errors**: Ensure client secret is correctly configured and generated
6. **InvalidParameterException**: Verify all required environment variables are set
7. **Phone Number Format**: Ensure phone numbers are in E.164 format (+1234567890)
8. **Session Expired**: Handle session timeout and re-authentication flow

### Debug Mode

Enable debug logging by setting:
```env
NODE_ENV=development
```

### Environment Validation

Ensure all required environment variables are properly set:
- `NEXT_PUBLIC_AWS_REGION`: AWS region for Cognito
- `NEXT_PUBLIC_USER_POOL_ID`: Cognito User Pool ID
- `NEXT_PUBLIC_CLIENT_ID`: Cognito App Client ID
- `NEXT_PUBLIC_CLIENT_SECRET`: Cognito App Client Secret

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions:
- Check the AWS Cognito documentation
- Review the backend lambda functions
- Open an issue in the repository