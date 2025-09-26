# AWS Cognito WhatsApp OTP Authentication System

A complete, production-ready serverless authentication system that uses AWS Cognito custom authentication flows with WhatsApp OTP verification via free SendZen API. This system provides secure phone number-based authentication without requiring email verification, making it perfect for mobile-first applications and international users.

## 🚀 Overview

This authentication system implements a modern, secure, and user-friendly authentication flow using:

- **AWS Cognito User Pool** with custom authentication triggers
- **AWS Lambda Functions** for authentication logic
- **SendZen WhatsApp API** for OTP delivery
- **Next.js Frontend** with modern React components
- **Serverless Architecture** for scalability and cost-effectiveness

## 🎯 Key Features & Capabilities

### 🔐 Authentication Features
- ✅ **Phone Number Authentication**: E.164 format phone number validation with real-time feedback
- ✅ **WhatsApp OTP Delivery**: Secure OTP delivery via WhatsApp Business API
- ✅ **Custom Authentication Flow**: Seamless integration with AWS Cognito triggers
- ✅ **Dual Client Architecture**: Separate clients for signup and login flows
- ✅ **Session Management**: Robust session handling with automatic cleanup
- ✅ **Error Handling**: Comprehensive error handling and user feedback
- ✅ **Security**: Secret hash authentication and secure token management
- ✅ **Rate Limiting**: Built-in protection against brute force attacks
- ✅ **Auto-Confirmation**: Streamlined user onboarding process

### 📱 WhatsApp Integration Features
- ✅ **SendZen API Integration**: Reliable WhatsApp Business API for OTP delivery
- ✅ **Template Messages**: Pre-approved message templates for consistent branding
- ✅ **Multi-Language Support**: Support for different languages and regions
- ✅ **Error Handling**: Graceful API failure handling with retry mechanisms
- ✅ **Delivery Tracking**: Comprehensive logging and monitoring of message delivery
- ✅ **Template Management**: Easy template configuration and updates
- ✅ **Fallback Handling**: Alternative delivery methods when WhatsApp fails

### 🏗️ Architecture Features
- ✅ **Serverless Architecture**: AWS Lambda functions for scalability and cost-effectiveness
- ✅ **Cloud-Native**: Built on AWS services (Cognito, Lambda, CloudWatch)
- ✅ **Microservices Design**: Modular Lambda functions for maintainability
- ✅ **Infrastructure as Code**: Serverless Framework for automated deployment
- ✅ **Monitoring & Logging**: CloudWatch integration for observability
- ✅ **Auto-Scaling**: Automatic scaling based on demand
- ✅ **High Availability**: Multi-AZ deployment for reliability

### 🎨 Frontend Features
- ✅ **Modern UI/UX**: Clean, intuitive interface with modern design patterns
- ✅ **Real-time Validation**: Client-side form validation with immediate feedback
- ✅ **Progressive Enhancement**: Mobile-first design with desktop optimization
- ✅ **Accessibility**: WCAG 2.1 AA compliant interface
- ✅ **Error Recovery**: Comprehensive error handling with user-friendly messages
- ✅ **Loading States**: Visual feedback during authentication processes
- ✅ **Responsive Design**: Works seamlessly on all device sizes
- ✅ **Dark/Light Mode**: Ready for theme switching (configurable)

### 🔒 Security Features
- ✅ **Input Validation**: E.164 phone number format validation
- ✅ **XSS Protection**: Framework built-in XSS protection
- ✅ **CSRF Protection**: AWS Cognito's built-in CSRF protection
- ✅ **Secure Storage**: Proper token storage with automatic cleanup
- ✅ **Audit Trail**: Comprehensive logging for security monitoring
- ✅ **Rate Limiting**: Protection against brute force attacks
- ✅ **Secret Hash**: HMAC-SHA256 for secure client-server communication
- ✅ **Token Security**: Secure JWT token management with automatic expiration

## 📁 Project Structure

```
whatsapp-only-authentication/
├── nodejs-backend/           # AWS Lambda backend implementation
│   ├── lambda-functions/     # Cognito trigger functions
│   ├── serverless.yml       # Serverless Framework configuration
│   ├── package.json         # Backend dependencies
│   ├── README.md           # Backend documentation
│   ├── INSTALLATION.md     # Backend setup guide
│   ├── DIAGRAMS.md         # Architecture diagrams guide
│   └── *.puml              # PlantUML diagram sources
├── nextjs-frontend/         # React/Next.js frontend
│   ├── src/app/            # Next.js app directory
│   │   ├── components/     # React components
│   │   ├── services/       # AWS Cognito integration
│   │   └── page.tsx        # Main application page
│   ├── package.json        # Frontend dependencies
│   ├── README.md          # Frontend documentation
│   └── INSTALLATION.md    # Frontend setup guide
└── c#-backend/            # C# backend implementation (coming soon)
    └── sample.txt
```

## 🏗 Architecture Overview

### Authentication Flow

The system implements a sophisticated authentication flow with two distinct phases:

#### 1. Signup Flow
**Purpose**: Create new user accounts with WhatsApp verification

**Detailed Steps**:
1. **User Registration**:
   - User enters phone number in E.164 format (+1234567890)
   - Password validation (8+ characters with complexity requirements)
   - Real-time form validation with immediate feedback
   - Account creation with auto-confirmation enabled

2. **Account Creation**:
   - AWS Cognito creates user account with phone number as username
   - PreSignUp trigger automatically confirms the account
   - Custom attributes set (auth_purpose = "signup")
   - Account status set to confirmed

3. **Custom Auth Trigger**:
   - System automatically triggers custom authentication flow
   - DefineAuthChallenge determines challenge type (CUSTOM_CHALLENGE)
   - Challenge session established for OTP verification

4. **OTP Generation**:
   - CreateAuthChallenge Lambda function generates cryptographically secure 6-digit OTP
   - OTP stored securely in challenge parameters
   - OTP expiry set (default: 5 minutes)

5. **WhatsApp Delivery**:
   - OTP sent via SendZen WhatsApp API to user's registered number
   - Template message used for consistent branding
   - Delivery status logged for monitoring

6. **OTP Verification**:
   - User enters 6-digit OTP in the application
   - VerifyAuthChallenge validates OTP against generated code
   - OTP expiry and format validation performed

7. **Account Confirmation**:
   - User attributes updated (whatsapp_verified = true)
   - PostConfirmation trigger completes account setup
   - JWT tokens issued for authenticated access

#### 2. Login Flow
**Purpose**: Authenticate existing users with WhatsApp OTP

**Detailed Steps**:
1. **Phone Number Entry**:
   - User enters registered phone number
   - Real-time validation and format checking
   - Account existence verification

2. **Account Validation**:
   - System validates account exists and is confirmed
   - User status and verification status checked
   - Account eligibility for login verified

3. **Custom Auth Initiation**:
   - Custom authentication flow triggered
   - DefineAuthChallenge determines challenge type
   - Challenge session established

4. **OTP Generation**:
   - New OTP generated and sent via WhatsApp
   - OTP stored securely with expiry
   - Delivery confirmation logged

5. **OTP Verification**:
   - User enters 6-digit OTP
   - System validates OTP against generated code
   - Verification status updated

6. **Authentication Complete**:
   - JWT tokens issued and stored securely
   - Session established with proper expiration
   - User redirected to authenticated dashboard

7. **Dashboard Access**:
   - User gains access to protected resources
   - Token refresh mechanism activated
   - Session management enabled

### Infrastructure Components

#### AWS Cognito User Pool
**Configuration**:
- **Username Attribute**: `phone_number` (E.164 format)
- **Custom Attributes**: 
  - `custom:whatsapp_verified` (String) - Tracks WhatsApp verification status
  - `custom:auth_purpose` (String) - Identifies signup vs login flow
- **Password Policy**: 8+ characters with complexity requirements
- **MFA Configuration**: OFF (using custom auth instead)
- **Lambda Triggers**: 5 custom triggers configured
- **Auto-Confirmation**: Enabled for streamlined onboarding
- **Email Verification**: Disabled (WhatsApp-only flow)

**Security Features**:
- **Secret Hash Authentication**: HMAC-SHA256 for secure client communication
- **Token Expiration**: Configurable token lifetimes
- **Rate Limiting**: Built-in protection against abuse
- **Audit Logging**: Comprehensive logging for security monitoring

#### Lambda Functions
**1. PreSignUp Trigger**:
- **Purpose**: Auto-confirms users and sets custom attributes
- **Functionality**: 
  - Validates phone number format
  - Sets auto-confirmation to true
  - Sets custom attributes (auth_purpose = "signup")
  - Enables custom authentication flow
- **Error Handling**: Comprehensive error logging and validation

**2. DefineAuthChallenge Trigger**:
- **Purpose**: Determines authentication flow logic
- **Functionality**:
  - Identifies challenge type (CUSTOM_CHALLENGE)
  - Manages challenge state transitions
  - Handles retry logic and attempt limits
  - Determines next challenge step
- **State Management**: Tracks authentication progress

**3. CreateAuthChallenge Trigger**:
- **Purpose**: Generates OTP and sends via WhatsApp
- **Functionality**:
  - Generates cryptographically secure 6-digit OTP
  - Sends OTP via SendZen WhatsApp API
  - Validates user verification status
  - Handles API errors and retries
- **Security**: Secure OTP generation and storage

**4. VerifyAuthChallenge Trigger**:
- **Purpose**: Validates OTP and updates user attributes
- **Functionality**:
  - Validates OTP against generated code
  - Handles OTP expiry and format validation
  - Updates user verification status
  - Manages attempt limits and retry logic
- **Validation**: Comprehensive OTP validation

**5. PostConfirmation Trigger**:
- **Purpose**: Post-confirmation setup and finalization
- **Functionality**:
  - Finalizes user account setup
  - Updates custom attributes
  - Completes verification process
  - Sets up user preferences
- **Completion**: Ensures account is fully configured

#### User Pool Clients
**Signup Client** (`WhatsApp-otp-signup-{stage}`):
- **Purpose**: Handles user registration flow
- **Configuration**:
  - Custom authentication enabled
  - Secret generation disabled for simplicity
  - OAuth flows configured
  - Allowed origins set for frontend

**Login Client** (`WhatsApp-otp-login-{stage}`):
- **Purpose**: Handles user authentication flow
- **Configuration**:
  - Custom authentication enabled
  - Secret generation disabled for simplicity
  - OAuth flows configured
  - Allowed origins set for frontend

**Security Configuration**:
- **Secret Hash**: HMAC-SHA256 authentication
- **Token Expiration**: Configurable lifetimes
- **Rate Limiting**: Protection against abuse
- **CORS**: Proper cross-origin configuration

## 📊 Architecture Diagrams

The system includes comprehensive PlantUML diagrams that are automatically generated as SVG images:

### 1. **Complete Architecture Diagram**
![Complete Architecture](docs/architecture-diagram.svg)

### 2. **Authentication Flow Sequence**
![Authentication Flow](docs/sequence-diagram.svg)

### 3. **Infrastructure Components**
![Infrastructure Components](docs/component-diagram.svg)

### 4. **Deployment Architecture**
![Deployment Architecture](docs/deployment-diagram.svg)

> **Note**: These diagrams are automatically generated from PlantUML source files (`.puml`) in the `nodejs-backend/` directory. When you edit any `.puml` file and push to GitHub, the GitHub Actions workflow will automatically regenerate the corresponding SVG images.

## 🛠 Quick Start

### Prerequisites

- **Node.js 18+** installed
- **AWS CLI** configured with appropriate permissions
- **SendZen API** account and credentials
- **AWS Account** with Cognito, Lambda, and IAM access

### 1. Deploy Backend

```bash
# Navigate to backend directory
cd nodejs-backend

# Install dependencies
npm install
npm install -g serverless

# Configure environment variables
cp env.example .env
# Edit .env with your SendZen API credentials

# Deploy to AWS
npm run deploy:dev
```

**Save the deployment outputs:**
- `UserPoolId`: `{region}_xxxxxxxxx` (e.g., `eu-west-1_xxxxxxxxx`)
- `SignupClientId`: `xxxxxxxxxxxxxxxxxxxxxxxxxx`
- `LoginClientId`: `xxxxxxxxxxxxxxxxxxxxxxxxxx`

### 2. Setup Frontend

```bash
# Navigate to frontend directory
cd ../nextjs-frontend

# Install dependencies
npm install

# Configure environment variables
cp env.example .env.local
# Edit .env.local with backend deployment outputs

# Start development server
npm run dev
```

### 3. Test the Application

1. **Open**: `http://localhost:3000`
2. **Signup**: Create account with phone number
3. **Verify**: Check WhatsApp for OTP
4. **Login**: Test login flow
5. **Dashboard**: Verify token management

## 🔧 Configuration

### Backend Configuration

The `serverless.yml` file configures:

- **Provider**: AWS with Node.js 18.x runtime
- **Environment Variables**: Loaded from `.env` file
- **IAM Role**: Permissions for Lambda functions
- **Functions**: 5 Lambda functions for authentication triggers
- **Resources**: CloudFormation resources for Cognito and permissions
- **Outputs**: User Pool ID, Client IDs

### Frontend Configuration

Environment variables required:

```env
NEXT_PUBLIC_AWS_REGION=your_aws_region  # Must match backend deployment region
NEXT_PUBLIC_USER_POOL_ID=your_user_pool_id
NEXT_PUBLIC_SIGNUP_CLIENT_ID=your_signup_client_id
NEXT_PUBLIC_LOGIN_CLIENT_ID=your_login_client_id
```

### SendZen API Configuration

Required SendZen API settings (configure these in your `.env` file):

```env
SENDZEN_API_URL=https://api.sendzen.com/v1/messages
SENDZEN_API_KEY=your_sendzen_api_key_here
WHATSAPP_FROM=your_whatsapp_business_number
WHATSAPP_TEMPLATE_NAME=your_template_name
WHATSAPP_LANG_CODE=your_template_language_code  # e.g., 'en_US', etc.
```

## 🚀 Deployment

### Backend Deployment

```bash
# Development deployment
npm run deploy:dev

# Production deployment
npm run deploy:prod

# Custom deployment
serverless deploy --stage production --region us-east-1
```

### Frontend Deployment

```bash
# Build for production
npm run build

# Deploy to Vercel
vercel --prod

# Deploy to AWS Amplify
amplify publish
```

## 📱 Frontend Components

### SignupForm
- **Phone Number Validation**: E.164 format validation with real-time feedback
- **Password Requirements**: Minimum 8 characters with strength validation
- **Password Confirmation**: Matching password validation
- **Form Validation**: Real-time validation using react-hook-form
- **Error Handling**: User-friendly error messages

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

## 🔒 Security Features

### Authentication Security
- **Custom Authentication Flow**: Secure OTP-based authentication
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

## 📊 Monitoring and Logs

### CloudWatch Logs
- Each Lambda function creates its own log group
- Log groups are automatically created and managed
- Logs include detailed execution information and errors

### Viewing Logs
```bash
# View logs for specific function
serverless logs --function preSignUp

# Follow logs in real-time
serverless logs --function preSignUp --tail

# View logs for all functions
serverless logs
```

## 🔍 Troubleshooting

### Common Issues

1. **Deployment Fails with Permission Errors**:
   - Check AWS credentials: `aws sts get-caller-identity`
   - Verify IAM permissions (see backend README for required permissions)

2. **Lambda Functions Not Created**:
   - Check CloudFormation stack in AWS Console
   - Verify serverless.yml syntax

3. **OTP Not Being Sent**:
   - Verify SendZen API credentials in `.env`
   - Check CloudWatch logs for Lambda function errors
   - Ensure WhatsApp template is approved

4. **CORS Errors**:
   - Ensure your Cognito User Pool allows your domain in the allowed origins
   - Check User Pool Client configuration

5. **Authentication Failures**:
   - Verify User Pool triggers are properly configured
   - Check token expiry and refresh logic
   - Ensure phone numbers are in E.164 format

### Debug Commands

```bash
# Check serverless configuration
serverless print

# Check AWS credentials
aws sts get-caller-identity

# List existing resources
aws cognito-idp list-user-pools --max-items 10
aws lambda list-functions
```

## 🧹 Cleanup

### Remove All Resources
```bash
# Remove entire stack
serverless remove

# Remove specific stage
serverless remove --stage dev
```

### Manual Cleanup
If automatic cleanup fails, manually remove:
1. Cognito User Pool
2. Lambda Functions
3. CloudWatch Log Groups
4. IAM Roles and Policies

## 🔒 Security Considerations

- **IAM Permissions**: Use least privilege principle
- **Environment Variables**: Never commit sensitive data to version control
- **Lambda Permissions**: Each function has minimal required permissions
- **Cognito Security**: User Pool configured with security best practices
- **Secret Management**: Consider using AWS Secrets Manager for production

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](../../LICENSE) file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📞 Support

For support and questions:
- Check the AWS Cognito documentation
- Review the backend lambda functions
- Open an issue in the repository

---

**Note**: This system is designed for production use with proper security configurations. Always test thoroughly in a development environment before deploying to production.