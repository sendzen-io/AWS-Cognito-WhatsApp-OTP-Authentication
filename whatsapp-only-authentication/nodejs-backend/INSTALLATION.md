# Backend Installation Guide

This guide will walk you through setting up and deploying the AWS Cognito WhatsApp OTP Authentication backend.

## 📋 Prerequisites

- **Node.js 18+** installed
- **AWS CLI** configured with appropriate permissions
- **SendZen API** account and credentials
- **AWS Account** with Cognito, Lambda, and IAM access

## 🚀 Step-by-Step Installation

### Step 1: Navigate to Backend Directory
```bash
cd backend
```

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Install Serverless Framework Globally
```bash
npm install -g serverless
```

### Step 4: Configure Environment Variables
```bash
# Copy environment template
cp env.example .env
```

Edit the `.env` file with your actual credentials:

```env
# AWS Configuration
AWS_REGION=your_aws_region  # e.g., 'eu-west-1', 'us-east-1', 'ap-south-1'
AWS_ACCESS_KEY_ID=your_access_key_here
AWS_SECRET_ACCESS_KEY=your_secret_key_here

# SendZen WhatsApp API Configuration
SENDZEN_API_URL=https://api.sendzen.com/v1/messages
SENDZEN_API_KEY=your_sendzen_api_key_here
WHATSAPP_FROM=your_whatsapp_business_number
WHATSAPP_TEMPLATE_NAME=your_template_name
WHATSAPP_LANG_CODE=your_template_language_code  # e.g., 'en_US', etc.

# Application Configuration
OTP_EXPIRY_MINUTES=5
MAX_LOGIN_ATTEMPTS=3
NODE_ENV=development
LOG_LEVEL=info
```

### Step 5: Deploy to AWS
```bash
# Deploy to development environment
serverless deploy --stage dev

# Or deploy to production
serverless deploy --stage prod
```

### Step 6: Note Deployment Outputs
After successful deployment, you'll see output like this:

```
Stack Outputs:
UserPoolId: {region}_xxxxxxxxx  # e.g., eu-west-1_xxxxxxxxx
SignupClientId: xxxxxxxxxxxxxxxxxxxxxxxxxx
LoginClientId: xxxxxxxxxxxxxxxxxxxxxxxxxx
```

**Save these values** - you'll need them for the frontend configuration.

## 🔍 Verification

### Check AWS Console
1. **Lambda Functions**: Go to AWS Lambda console and verify 5 functions are created:
   - `preSignUp`
   - `defineAuthChallenge`
   - `createAuthChallenge`
   - `verifyAuthChallenge`
   - `postConfirmation`

2. **Cognito User Pool**: Go to AWS Cognito console and verify:
   - User Pool is created with name `WhatsApp-otp-auth-pool-{stage}`
   - Two User Pool Clients are created: `WhatsApp-otp-signup-{stage}` and `WhatsApp-otp-login-{stage}`
   - Both clients have custom auth flows enabled

3. **CloudWatch Logs**: Check for any deployment errors in CloudWatch logs

## 🚨 Troubleshooting

### Common Issues

1. **Deployment Fails with Permission Errors**:
   - Check AWS credentials: `aws sts get-caller-identity`
   - Verify IAM permissions (see main README for required permissions)

2. **Lambda Functions Not Created**:
   - Check CloudFormation stack in AWS Console
   - Verify serverless.yml syntax

3. **OTP Not Being Sent**:
   - Verify SendZen API credentials in `.env`
   - Check CloudWatch logs for Lambda function errors
   - Ensure WhatsApp template is approved

### Debug Commands
```bash
# Check serverless configuration
serverless print

# View deployment logs
serverless deploy --verbose

# Check AWS credentials
aws sts get-caller-identity

# List existing Lambda functions
aws lambda list-functions
```

## 🧹 Cleanup

To remove all deployed resources:
```bash
serverless remove --stage dev
```

## 📚 Next Steps

After successful backend deployment:
1. Note the UserPoolId, UserPoolClientId, and UserPoolClientSecret
2. Proceed to frontend installation
3. Use the backend outputs to configure the frontend environment variables
