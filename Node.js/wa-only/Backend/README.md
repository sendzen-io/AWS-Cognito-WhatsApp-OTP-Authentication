# Cognito WhatsApp OTP Authentication Backend

This backend provides AWS Cognito custom authentication using WhatsApp OTP via SendZen API. The system implements a passwordless authentication flow where users sign up with phone numbers and passwords, then verify their WhatsApp numbers through OTP.

## Features

- **Auto-confirmed User Registration**: Users are automatically confirmed upon signup
- **Custom Authentication Flow**: WhatsApp OTP verification for both signup and login
- **SendZen Integration**: Secure OTP delivery via WhatsApp Business API
- **Phone Number Validation**: E.164 format validation for international numbers
- **Retry Logic**: Up to 3 OTP verification attempts
- **Serverless Architecture**: AWS Lambda functions with Serverless Framework

## Prerequisites

- Node.js 18.x or higher
- AWS CLI configured
- SendZen API account and credentials
- Serverless Framework

## Setup Instructions

### 1. Install Dependencies

```bash
# Install npm packages
npm install

# Install Serverless Framework globally (if not already installed)
npm install -g serverless
```

### 2. Environment Configuration

1. Copy the environment template:
   ```bash
   cp env.example .env
   ```

2. Fill in your actual values in `.env`:
   - AWS credentials
   - SendZen API credentials
   - WhatsApp template configuration

### 3. Deploy to AWS

```bash
# Deploy to development
npm run deploy:dev

# Deploy to production
npm run deploy:prod
```

### 4. Update Environment Variables

After deployment, update your `.env` file with the generated User Pool ID from the AWS Console.

## Project Structure

```
Backend/
├── lambda-functions/
│   ├── CreateAuthChallenge.ts    # Generates OTP and sends via SendZen WhatsApp API
│   ├── DefineAuthChallenge.ts    # Defines custom auth flow logic and user state management
│   ├── VerifyAuthChallenge.ts    # Verifies OTP codes and updates user attributes
│   ├── PreSignup.ts              # Auto-confirms users and sets custom attributes
│   └── PostConfirmation.ts       # Post-confirmation setup (optional)
├── cognito.ts                    # AWS Cognito client configuration
├── utils.ts                      # OTP generation, phone validation, and SendZen API integration
├── constants.ts                  # Configuration constants and environment variables
├── serverless.yml                # Serverless Framework deployment configuration
├── package.json                  # Dependencies and scripts
└── tsconfig.json                 # TypeScript configuration
```

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `SENDZEN_API_URL` | SendZen API endpoint | Yes |
| `SENDZEN_API_KEY` | SendZen API key | Yes |
| `WHATSAPP_FROM` | WhatsApp business number | Yes |
| `WHATSAPP_TEMPLATE_NAME` | WhatsApp template name | Yes |
| `WHATSAPP_LANG_CODE` | Template language code | Yes |
| `OTP_EXPIRY_MINUTES` | OTP expiration time | No (default: 5) |
| `MAX_LOGIN_ATTEMPTS` | Max login attempts | No (default: 3) |

## Development

```bash
# Run locally with Serverless Offline
npm run offline

# Build TypeScript
npm run build
```

## Authentication Flow

### Signup Flow
1. **User Registration**: User signs up with phone number and password
2. **Auto-Confirmation**: PreSignup trigger automatically confirms the user
3. **WhatsApp Verification**: System sends OTP via WhatsApp using SendZen API
4. **OTP Verification**: User enters OTP to verify WhatsApp number
5. **Account Activation**: User attributes are updated (whatsapp_verified=true, phone_number_verified=true)

### Login Flow
1. **Phone Number Login**: User enters phone number to initiate login
2. **Account Validation**: System checks if user is confirmed and WhatsApp verified
3. **OTP Generation**: System generates and sends OTP via WhatsApp
4. **OTP Verification**: User enters OTP to complete authentication
5. **Token Issuance**: System issues JWT tokens upon successful verification

### Lambda Trigger Flow
1. **PreSignup**: Auto-confirms users and sets up custom attributes
2. **DefineAuthChallenge**: Determines authentication flow based on user state
3. **CreateAuthChallenge**: Generates OTP and sends via WhatsApp
4. **VerifyAuthChallenge**: Validates OTP and updates user attributes
5. **PostConfirmation**: Optional post-confirmation setup (if needed)

## Key Implementation Details

### Custom User Attributes
- `custom:auth_purpose`: Set to "signup_whatsapp_verify" during signup
- `custom:whatsapp_verified`: Boolean flag indicating WhatsApp verification status
- `phone_number_verified`: Standard Cognito attribute for phone verification

### SendZen WhatsApp Integration
- Uses SendZen Business API for OTP delivery
- Supports template-based messages with OTP parameters
- Includes both body text and button components
- Handles API errors and network failures gracefully

### Security Features
- Cryptographically secure OTP generation using Node.js crypto module
- E.164 phone number format validation
- Session-based authentication with retry limits
- Private challenge parameters for secure OTP storage

## Troubleshooting

### Common Issues
- **OTP Not Received**: Check SendZen API credentials and template configuration
- **Invalid Phone Format**: Ensure phone numbers are in E.164 format (+1234567890)
- **Authentication Failures**: Verify User Pool triggers are properly configured
- **WhatsApp API Errors**: Check CloudWatch logs for SendZen API response details

### Debug Steps
1. Check AWS CloudWatch logs for Lambda function errors
2. Verify SendZen API credentials and template configuration
3. Ensure WhatsApp business number is properly configured
4. Validate environment variables are correctly set
5. Test phone number format validation

## License

ISC
