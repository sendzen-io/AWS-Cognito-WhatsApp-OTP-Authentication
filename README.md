# AWS Cognito WhatsApp OTP Authentication System

A comprehensive, production-ready authentication system that provides multiple ways to implement WhatsApp OTP authentication with AWS Cognito. This project offers isolated, ready-to-use implementations for different authentication scenarios and technology stacks.

## Overview

This project demonstrates WhatsApp OTP authentication using AWS Cognito with free SendZen API. It includes:

- **WhatsApp Only Authentication**: Phone number-based authentication with WhatsApp OTP
- **WhatsApp + Email Authentication**: Dual-channel authentication with both WhatsApp and email verification
- **Node.js Implementation**: Working Lambda functions and frontend
- **C# Implementation**: Placeholder (coming soon)

## Key Features & Capabilities

### Authentication Features
- **WhatsApp OTP**: Phone number-based authentication with WhatsApp OTP
- **Email + WhatsApp**: Dual-channel authentication (email verification + WhatsApp OTP)
- **Custom Authentication Flow**: AWS Cognito triggers for authentication logic
- **Basic Session Management**: JWT token handling

### WhatsApp Integration
- **SendZen API**: WhatsApp Business API for OTP delivery
- **Basic Error Handling**: Simple error handling for API failures

### Architecture Features
- **Serverless**: AWS Lambda functions
- **AWS Services**: Cognito, Lambda, CloudWatch
- **Serverless Framework**: Infrastructure deployment
- **Basic Logging**: Console.log to CloudWatch

### Frontend Features
- **React/Next.js**: Basic UI with responsive design
- **Form Validation**: Client-side validation
- **Error Handling**: Basic error messages

### Security Features
- **Input Validation**: E.164 phone number and email format validation

## 📁 Project Structure

<details>
<summary>Click to expand project structure</summary>

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
</details>

##  Authentication Methods & Flows

### 1. WhatsApp Only Authentication
**Use case**: Simple phone number authentication

**Core Features**:
- **Phone Number Registration**: E.164 format validation with real-time feedback
- **WhatsApp OTP Verification**: Secure 6-digit OTP delivery via WhatsApp Business API
- **Auto-Confirmation**: Streamlined account activation process
- **Passwordless Login**: Login using phone number + WhatsApp OTP
- **Session Management**: Basic JWT token handling

**Detailed Authentication Flow**:
1. **User Registration**:
   - User enters phone number in E.164 format (+1234567890)
   - Password validation (8+ characters with complexity requirements)
   - Real-time form validation with immediate feedback
   - Account creation with auto-confirmation

2. **WhatsApp OTP Verification**:
   - System automatically triggers custom authentication flow
   - Lambda function generates cryptographically secure 6-digit OTP
   - OTP sent via SendZen WhatsApp API to user's registered number
   - User receives WhatsApp message with OTP code

3. **Account Activation**:
   - User enters 6-digit OTP in the application
   - System validates OTP against generated code
   - User attributes updated (whatsapp_verified = true)
   - JWT tokens issued for authenticated access

4. **Login Process**:
   - User enters registered phone number
   - System validates account exists and is confirmed
   - New OTP generated and sent via WhatsApp
   - User verifies OTP to complete authentication
   - Session established with secure token management

### 2. Email + WhatsApp Authentication
**Use case**: Email + WhatsApp dual verification

**Core Features**:
- **Dual-Channel Verification**: WhatsApp OTP + Email confirmation
- **Email-First Flow**: Email confirmation before WhatsApp verification
- **Flexible Login**: Login using either phone number or email
- **Client Role System**: Separate flows for signup and login

**Detailed Authentication Flow**:
1. **User Registration**:
   - User enters email, phone number, and password
   - Email format validation and phone number E.164 validation
   - Account created with email verification required
   - Auto-confirmation disabled to enable email verification

2. **Email Verification**:
   - AWS Cognito sends 6-digit verification code to user's email
   - User enters email verification code
   - Email confirmed and account status updated
   - System prepares for WhatsApp verification

3. **WhatsApp OTP Verification**:
   - Custom authentication flow automatically triggered
   - OTP generated and sent via SendZen WhatsApp API
   - User receives WhatsApp message with OTP code
   - User enters OTP to complete dual verification

4. **Account Activation**:
   - Both email and WhatsApp verification completed
   - User attributes updated (email_verified = true, whatsapp_verified = true)
   - Account fully activated with enhanced security
   - JWT tokens issued for authenticated access

5. **Login Process**:
   - User can login using either email or phone number
   - System validates account and verification status
   - OTP sent to registered WhatsApp number
   - User verifies OTP to complete authentication
   - Session established with secure token management

## Technology Stack & Architecture

### Node.js Implementation
**Backend Architecture**:
- **Runtime**: AWS Lambda with Node.js 18.x
- **Language**: TypeScript for type safety and better development experience
- **Framework**: Serverless Framework for infrastructure as code
- **Authentication**: AWS Cognito with custom authentication triggers
- **API Integration**: SendZen WhatsApp Business API
- **Monitoring**: CloudWatch for logging and metrics

**Frontend Architecture**:
- **Framework**: Next.js 14+ with React 18
- **Styling**: Tailwind CSS for utility-first styling
- **State Management**: React Hooks and Context API
- **Form Handling**: React Hook Form for validation
- **HTTP Client**: AWS SDK v3 for Cognito integration
- **Build Tool**: Vite for fast development and building

**Deployment & DevOps**:
- **Infrastructure**: Serverless Framework with 
CloudFormation
- **CI/CD**: Basic deployment scripts
- **Environment Management**: Basic multi-stage deployment
- **Monitoring**: Basic CloudWatch logging
- **Security**: Basic IAM roles

### C# Implementation
**Status**: Coming soon (placeholder only)
- **Runtime**: AWS Lambda with .NET 8
- **Language**: C#
- **Framework**: AWS SAM or Serverless Framework
- **Authentication**: AWS Cognito with custom triggers
- **API Integration**: SendZen WhatsApp API
- **Monitoring**: Basic CloudWatch logging

**Frontend Architecture**:
- **Framework**: Next.js 14+ with React 18 (shared frontend)
- **Styling**: Tailwind CSS for consistent UI
- **State Management**: React Hooks and Context API
- **Form Handling**: React Hook Form for validation
- **HTTP Client**: AWS SDK v3 for Cognito integration
- **Build Tool**: Vite for fast development and building

**Deployment & DevOps**:
- **Infrastructure**: AWS SAM or Serverless Framework
- **CI/CD**: GitHub Actions for automated deployment
- **Environment Management**: Multi-stage deployment
- **Monitoring**: CloudWatch dashboards and alerts
- **Security**: IAM roles with least privilege principle

### Shared Frontend Approach
**Note**: The frontend works with different backend implementations:
- **Consistent UI**: Same interface for different backends
- **Single Codebase**: One frontend for multiple backends
- **Backend Flexibility**: Works with Node.js or C# backends
- **Independent Deployment**: Deploy frontend separately from backend

## Quick Start

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

**Note**: The frontend works with any backend implementation. You need to:
1. Deploy your chosen backend (Node.js or C#)
2. Update frontend environment variables with backend outputs
3. Run the frontend - it works with any backend!

**Frontend Locations**:
- **WhatsApp Only**: `whatsapp-only-authentication/nextjs-frontend/`
- **WhatsApp + Email**: `whatsapp-email-authentication/react-frontend/`

## Step-by-Step Installation Guide

### Backend Installation (Node.js)

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
- **UserPoolId**: `{region}_xxxxxxxxx` (e.g., `eu-west-1_xxxxxxxxx`)
- **SignupClientId**: `xxxxxxxxxxxxxxxxxxxxxxxxxx`
- **LoginClientId**: `xxxxxxxxxxxxxxxxxxxxxxxxxx`
- **Region**: `your_aws_region` (your chosen region)

### Frontend Installation (Node.js)

#### Step 1: Navigate to Frontend Directory
```bash
cd whatsapp-only-authentication/nextjs-frontend
```

#### Step 2: Configure Environment Variables
```bash
# Copy environment template
cp env.example .env.local

# Edit .env.local with values from backend deployment
NEXT_PUBLIC_AWS_REGION=your_aws_region  # Must match backend deployment region
NEXT_PUBLIC_USER_POOL_ID=your_user_pool_id
NEXT_PUBLIC_SIGNUP_CLIENT_ID=your_signup_client_id
NEXT_PUBLIC_LOGIN_CLIENT_ID=your_login_client_id
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

### Verification Steps

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

### Troubleshooting

#### Backend Issues
- **Deployment Fails**: Check AWS credentials and permissions
- **Lambda Errors**: Check CloudWatch logs
- **OTP Not Sent**: Verify SendZen API credentials

#### Frontend Issues
- **CORS Errors**: Check Cognito User Pool allowed origins
- **Authentication Fails**: Verify environment variables
- **Build Errors**: Check Node.js version compatibility

##  Configuration

### Required Environment Variables

#### Backend Configuration
```env
# AWS Configuration
AWS_REGION=your_aws_region  # e.g., 'eu-west-1', 'us-east-1', 'ap-south-1'
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key

# SendZen WhatsApp API
SENDZEN_API_URL=https://api.sendzen.com/v1/messages
SENDZEN_API_KEY=your_sendzen_api_key
WHATSAPP_FROM=your_whatsapp_business_number
WHATSAPP_TEMPLATE_NAME=your_template_name
WHATSAPP_LANG_CODE=your_template_language_code  # e.g., 'en_US', etc.

# Application Settings
OTP_EXPIRY_MINUTES=5
MAX_LOGIN_ATTEMPTS=3
```

#### Frontend Configuration
```env
# AWS Cognito
NEXT_PUBLIC_AWS_REGION=your_aws_region  # Must match backend deployment region
NEXT_PUBLIC_USER_POOL_ID=your_user_pool_id
NEXT_PUBLIC_SIGNUP_CLIENT_ID=your_signup_client_id
NEXT_PUBLIC_LOGIN_CLIENT_ID=your_login_client_id
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
- `email_verified` (required attribute for dual auth)
- `custom:auth_purpose` (custom attribute)
- `custom:whatsapp_verified` (custom attribute)

#### User Pool Clients
- **Signup Client**: `WhatsApp-otp-signup-{stage}`
- **Login Client**: `WhatsApp-otp-login-{stage}`
- **Auth Flows**: Custom authentication enabled
- **Secret Generation**: Disabled for simplicity

## Deployment

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


## Troubleshooting

### Common Issues

1. **OTP Not Received**:
   - Check Template status
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

## Architecture Diagrams

Each implementation includes comprehensive PlantUML diagrams:

### WhatsApp Only Authentication
- **Complete Architecture Diagram**: Shows complete backend architecture with all components
- **Authentication Flow Sequence**: Step-by-step authentication flow
- **Infrastructure Components**: AWS infrastructure components and relationships
- **Deployment Architecture**: Serverless deployment structure

### WhatsApp + Email Authentication
- **Dual-Channel Flow**: Shows both WhatsApp and email verification flows
- **Enhanced Security**: Multi-step verification process
- **Backup Authentication**: Alternative verification methods


## Documentation

Each implementation includes detailed documentation:

- **Backend README**: Lambda functions, deployment, configuration
- **Frontend README**: UI components, authentication flow, deployment
- **Installation Guides**: Step-by-step setup instructions
- **API Documentation**: Authentication service methods
- **Deployment Guides**: Platform-specific deployment instructions

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support and questions:
- Check the individual implementation README files
- Review AWS Cognito documentation
- Check [SendZen API documentation](https://www.sendzen.io/docs)
- Open an issue in the repository

## Version History

- **v1.0.0**: Initial release with WhatsApp-only authentication
- **v1.1.0**: Added WhatsApp + Email authentication
- **v1.2.0**: Added C# implementations
- **v1.3.0**: Enhanced security features and error handling

---

**Choose the implementation that best fits your needs and get started with secure WhatsApp OTP authentication today!**