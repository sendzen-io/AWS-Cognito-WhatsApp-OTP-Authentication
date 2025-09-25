# AWS Cognito WhatsApp OTP Authentication System

A comprehensive authentication system that provides multiple ways to implement WhatsApp OTP authentication with AWS Cognito. This project offers isolated, ready-to-use implementations for different authentication scenarios and technology stacks.

## 🚀 Overview

This project provides a complete authentication solution using AWS Cognito with WhatsApp OTP verification via SendZen API. It includes multiple implementation options to suit different requirements:

- **WhatsApp Only Authentication**: Phone number-based authentication with WhatsApp OTP
- **WhatsApp + Email Authentication**: Dual-channel authentication with both WhatsApp and email verification
- **Multiple Technology Stacks**: Node.js and C# implementations
- **Isolated Dependencies**: Each project is self-contained with its own dependencies

## 📁 Project Structure

```
AWS-Cognito-WhatsApp-OTP-Authentication/
├── whatsapp-only-authentication/        # WhatsApp Only Authentication
│   ├── nodejs-backend/                  # Node.js AWS Lambda functions
│   │   ├── lambda-functions/            # Lambda trigger functions
│   │   ├── serverless.yml               # Serverless configuration
│   │   ├── package.json                 # Dependencies
│   │   ├── env.example                  # Environment template
│   │   ├── README.md                    # Backend documentation
│   │   ├── INSTALLATION.md              # Step-by-step setup guide
│   │   └── *.puml                       # PlantUML diagram sources
│   ├── c#-backend/                      # C# AWS Lambda functions (.NET)
│   │   └── (coming soon)                # C# implementation
│   └── nextjs-frontend/                 # Shared Next.js React frontend
│       ├── src/                         # Source code
│       ├── package.json                 # Dependencies
│       ├── env.example                  # Environment template
│       ├── README.md                    # Frontend documentation
│       └── INSTALLATION.md              # Step-by-step setup guide
├── whatsapp-email-authentication/       # WhatsApp + Email Authentication
│   ├── nodejs-backend/                  # Node.js AWS Lambda functions
│   │   ├── src/                         # Source code
│   │   ├── serverless.yml               # Serverless configuration
│   │   ├── package.json                 # Dependencies
│   │   ├── env.example                  # Environment template
│   │   └── README.md                    # Backend documentation
│   ├── c#-backend/                      # C# AWS Lambda functions (.NET)
│   │   └── (coming soon)                # C# implementation
│   └── react-frontend/                  # Shared React frontend
│       ├── src/                         # Source code
│       ├── package.json                 # Dependencies
│       ├── env.example                  # Environment template
│       └── README.md                    # Frontend documentation
├── docs/                                # Documentation
├── .github/workflows/                   # GitHub Actions
├── LICENSE                              # License file
└── README.md                            # This file
```

## 🔐 Authentication Methods

### 1. WhatsApp Only Authentication
**Perfect for**: Mobile-first applications, international users, simplified onboarding

**Features**:
- Phone number registration with password
- WhatsApp OTP verification
- Auto-confirmation upon signup
- Passwordless login with WhatsApp OTP
- E.164 phone number validation

**Flow**:
1. User signs up with phone number + password
2. System auto-confirms the account
3. WhatsApp OTP is sent for verification
4. User verifies OTP to activate account
5. Login uses phone number + WhatsApp OTP

### 2. WhatsApp + Email Authentication
**Perfect for**: Enterprise applications, enhanced security, backup verification

**Features**:
- Dual-channel verification (WhatsApp + Email)
- Email confirmation before WhatsApp verification
- Backup authentication methods
- Enhanced security with multiple verification steps
- Flexible verification order

**Flow**:
1. User signs up with phone number + email + password
2. Email confirmation is sent first
3. After email confirmation, WhatsApp OTP is sent
4. User verifies WhatsApp OTP to complete registration
5. Login can use either phone number or email with WhatsApp OTP

## 🛠 Technology Stack Options

### Node.js Implementation
- **Backend**: AWS Lambda with TypeScript
- **Frontend**: Next.js with React
- **Deployment**: Serverless Framework
- **Styling**: Tailwind CSS
- **State Management**: React Hooks

### C# Implementation
- **Backend**: AWS Lambda with .NET
- **Frontend**:  Next.js with React
- **Deployment**: AWS SAM or Serverless Framework
- **Styling**: Tailwind CSS
- **State Management**: React Hooks

## 🚀 Quick Start

### Prerequisites
- **Node.js 18+** (for Node.js implementations)
- **AWS CLI** configured with appropriate permissions
- **SendZen API** account and credentials
- **AWS Account** with Cognito, Lambda, and IAM access

### Choose Your Implementation

1. **WhatsApp Only Authentication (Node.js Backend)**:
   ```bash
   cd whatsapp-only-authentication/nodejs-backend
   ```

2. **WhatsApp Only Authentication (C# Backend)**:
   ```bash
   cd whatsapp-only-authentication/c#-backend
   ```

3. **WhatsApp + Email Authentication (Node.js Backend)**:
   ```bash
   cd whatsapp-email-authentication/nodejs-backend
   ```

4. **WhatsApp + Email Authentication (C# Backend)**:
   ```bash
   cd whatsapp-email-authentication/c#-backend
   ```

### Shared Frontend Approach

**Key Innovation**: The frontend is shared between different backend implementations. You only need to:
1. Deploy your chosen backend (Node.js or C#)
2. Update frontend environment variables with backend outputs
3. Run the frontend - it works with any backend!

**Frontend Locations**:
- **WhatsApp Only**: `whatsapp-only-authentication/nextjs-frontend/`
- **WhatsApp + Email**: `whatsapp-email-authentication/react-frontend/`

## 📋 Step-by-Step Installation Guide

### 🔧 Backend Installation (Node.js)

#### Step 1: Navigate to Backend Directory
```bash
cd whatsapp-only-authentication/nodejs-backend
```

#### Step 2: Install Dependencies
```bash
npm install
```

#### Step 3: Install Serverless Framework Globally
```bash
npm install -g serverless
```

#### Step 4: Configure Environment Variables
```bash
# Copy environment template
cp env.example .env

# Edit .env file with your credentials
# Required variables:
# - AWS credentials (AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY)
# - SendZen API credentials (SENDZEN_API_KEY, WHATSAPP_FROM, etc.)
# - Application settings (OTP_EXPIRY_MINUTES, MAX_LOGIN_ATTEMPTS)
```

#### Step 5: Deploy to AWS
```bash
# Deploy to development environment
serverless deploy --stage dev

# Or deploy to production
serverless deploy --stage prod
```

#### Step 6: Note Deployment Outputs
After successful deployment, note these values from the output:
- **UserPoolId**: `eu-west-1_xxxxxxxxx`
- **UserPoolClientId**: `xxxxxxxxxxxxxxxxxxxxxxxxxx`
- **UserPoolClientSecret**: `xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`
- **Region**: `eu-west-1` (or your chosen region)

### 🎨 Frontend Installation (Node.js)

#### Step 1: Navigate to Frontend Directory
```bash
cd whatsapp-only-authentication/nextjs-frontend
```

#### Step 2: Configure Environment Variables
```bash
# Copy environment template
cp env.example .env.local

# Edit .env.local with values from backend deployment
NEXT_PUBLIC_AWS_REGION=eu-west-1
NEXT_PUBLIC_USER_POOL_ID=eu-west-1_xxxxxxxxx
NEXT_PUBLIC_CLIENT_ID=xxxxxxxxxxxxxxxxxxxxxxxxxx
NEXT_PUBLIC_CLIENT_SECRET=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

#### Step 3: Install Dependencies
```bash
npm install
```

#### Step 4: Start Development Server
```bash
npm run dev
```

#### Step 5: Access the Application
Open your browser and navigate to:
```
http://localhost:3000
```

### 🔍 Verification Steps

#### Backend Verification
1. **Check AWS Console**:
   - Go to AWS Lambda console
   - Verify 5 Lambda functions are created
   - Check CloudWatch logs for any errors

2. **Check Cognito Console**:
   - Go to AWS Cognito console
   - Verify User Pool is created
   - Check User Pool Client configuration

#### Frontend Verification
1. **Test Signup Flow**:
   - Enter phone number in E.164 format (+1234567890)
   - Enter password
   - Check if OTP is received on WhatsApp

2. **Test Login Flow**:
   - Enter registered phone number
   - Check if OTP is received
   - Verify successful authentication

### 🚨 Troubleshooting

#### Backend Issues
- **Deployment Fails**: Check AWS credentials and permissions
- **Lambda Errors**: Check CloudWatch logs
- **OTP Not Sent**: Verify SendZen API credentials

#### Frontend Issues
- **CORS Errors**: Check Cognito User Pool allowed origins
- **Authentication Fails**: Verify environment variables
- **Build Errors**: Check Node.js version compatibility

## 🔧 Configuration

### Required Environment Variables

#### Backend Configuration
```env
# AWS Configuration
AWS_REGION=eu-west-1
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key

# SendZen WhatsApp API
SENDZEN_API_URL=https://api.sendzen.com/v1/messages
SENDZEN_API_KEY=your_sendzen_api_key
WHATSAPP_FROM=your_whatsapp_business_number
WHATSAPP_TEMPLATE_NAME=your_template_name
WHATSAPP_LANG_CODE=en

# Application Settings
OTP_EXPIRY_MINUTES=5
MAX_LOGIN_ATTEMPTS=3
```

#### Frontend Configuration
```env
# AWS Cognito
NEXT_PUBLIC_AWS_REGION=eu-west-1
NEXT_PUBLIC_USER_POOL_ID=your_user_pool_id
NEXT_PUBLIC_CLIENT_ID=your_client_id
NEXT_PUBLIC_CLIENT_SECRET=your_client_secret
```

### AWS Cognito Setup

Each implementation requires specific Cognito configuration:

#### Lambda Triggers
- **PreSignUp**: Auto-confirm users and set custom attributes
- **DefineAuthChallenge**: Define authentication flow logic
- **CreateAuthChallenge**: Generate and send OTP
- **VerifyAuthChallenge**: Verify OTP and update user attributes
- **PostConfirmation**: Post-confirmation setup (optional)

#### User Pool Attributes
- `phone_number` (required)
- `email` (required for WhatsApp + Email)
- `email_verified` (required  attribute for dual auth)
- `custom:auth_purpose` (custom attribute)
- `custom:whatsapp_verified` (custom attribute)

## 📱 Features

### Core Features
- ✅ **Multi-Channel Authentication**: WhatsApp and Email support
- ✅ **Auto-Confirmation**: Seamless user onboarding
- ✅ **OTP Verification**: Secure 6-digit OTP with expiry
- ✅ **Retry Logic**: Up to 3 verification attempts
- ✅ **Session Management**: Secure token handling
- ✅ **Error Handling**: Comprehensive error management
- ✅ **Responsive Design**: Mobile-first UI
- ✅ **Security**: Secret hash authentication, input validation

### WhatsApp Integration
- ✅ **SendZen API**: Reliable WhatsApp Business API
- ✅ **Template Messages**: Pre-approved message templates
- ✅ **Multi-Language**: Support for different languages
- ✅ **Error Handling**: Graceful API failure handling
- ✅ **Rate Limiting**: Built-in rate limiting protection

### AWS Cognito Integration
- ✅ **Custom Auth Flow**: Flexible authentication triggers
- ✅ **User Management**: Complete user lifecycle management
- ✅ **Token Management**: JWT token handling
- ✅ **Security**: Built-in security features
- ✅ **Scalability**: Serverless architecture

## 🔒 Security Features

### Authentication Security
- **Secret Hash Authentication**: HMAC-SHA256 for all Cognito operations
- **Token Security**: Secure JWT token storage and management
- **Session Management**: Proper session cleanup and invalidation
- **Input Validation**: E.164 phone number and email validation
- **Error Handling**: Secure error messages without sensitive information

### Data Protection
- **Local Storage**: Secure token storage with automatic cleanup
- **HTTPS Enforcement**: Production-ready HTTPS configuration
- **Input Sanitization**: Form input validation and sanitization
- **XSS Protection**: Framework built-in XSS protection
- **CSRF Protection**: Cognito's built-in CSRF protection

### Privacy Features
- **Minimal Data Collection**: Only necessary user data
- **Token Expiration**: Automatic token expiration handling
- **Secure Logout**: Complete session and token cleanup
- **No Sensitive Logging**: Avoids logging sensitive data

## 🚀 Deployment

### Backend Deployment

#### Node.js (Serverless Framework)
```bash
# Development
npm run deploy:dev

# Production
npm run deploy:prod
```

#### C# (AWS SAM)
```bash
# Build and deploy
sam build
sam deploy --guided
```

### Frontend Deployment

#### Node.js (Next.js)
```bash
# Build
npm run build

# Deploy to Vercel
vercel --prod

# Deploy to AWS Amplify
amplify publish
```

#### C# (Blazor)
```bash
# Build
dotnet publish -c Release

# Deploy to Azure/AWS
# Follow platform-specific deployment guides
```


## 🔧 Troubleshooting

### Common Issues

1. **OTP Not Received**:
   - Check SendZen API credentials
   - Verify WhatsApp template configuration
   - Ensure phone number is in E.164 format

2. **Authentication Failures**:
   - Verify User Pool triggers are configured
   - Check Lambda function permissions
   - Validate environment variables

3. **CORS Errors**:
   - Ensure Cognito User Pool allows your domain
   - Check allowed origins configuration

4. **Secret Hash Errors**:
   - Verify client secret is correctly configured
   - Check secret hash generation logic

### Debug Steps

1. **Check AWS CloudWatch Logs**:
   - Lambda function execution logs
   - Cognito trigger logs
   - Error details and stack traces

2. **Verify SendZen API**:
   - Test API connectivity
   - Check template approval status
   - Validate message delivery

3. **Validate Configuration**:
   - Environment variables
   - AWS credentials
   - Cognito User Pool settings

## 📚 Documentation

Each implementation includes detailed documentation:

- **Backend README**: Lambda functions, deployment, configuration
- **Frontend README**: UI components, authentication flow, deployment
- **API Documentation**: Authentication service methods
- **Deployment Guides**: Platform-specific deployment instructions

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Check the individual implementation README files
- Review AWS Cognito documentation
- Check [SendZen API documentation](https://www.sendzen.io/docs)
- Open an issue in the repository

## 🔄 Version History

- **v1.0.0**: Initial release with WhatsApp-only authentication
- **v1.1.0**: Added WhatsApp + Email authentication
- **v1.2.0**: Added C# implementations
- **v1.3.0**: Enhanced security features and error handling

---

**Choose the implementation that best fits your needs and get started with secure WhatsApp OTP authentication today!**