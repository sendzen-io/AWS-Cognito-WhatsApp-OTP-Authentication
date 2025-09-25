# AWS Cognito WhatsApp OTP Authentication - Node.js Backend

This Node.js backend provides AWS Cognito custom authentication using WhatsApp OTP via free SendZen API. The system implements a complete serverless architecture with automatic User Pool and Lambda function creation using Serverless Framework.

> **NOTE**: Refer to the shared frontend implementation in [Next.js Frontend](../nextjs-frontend/README.md) and [C# Backend](../c#-backend/) for alternative implementations.

## 🚀 Overview

The repo automatically creates and configures:
- **AWS Cognito User Pool** with custom authentication flow
- **AWS Lambda Functions** for authentication triggers
  1. **PreSignUp**: Auto-confirms users and sets custom attributes
  2. **DefineAuthChallenge**: Defines authentication flow logic
  3. **CreateAuthChallenge**: Generates OTP and sends via WhatsApp
  4. **VerifyAuthChallenge**: Verifies OTP and updates user attributes
  5. **PostConfirmation**: Post-confirmation setup
- **User Pool Client** with secret hash authentication
- **IAM Permissions** for Lambda-Cognito integration
- **CloudWatch Logs** for monitoring and debugging

## 📋 Prerequisites

### Required Software
- **Node.js 18.x or higher**
- **AWS CLI** configured with appropriate credentials
- **Serverless Framework** (installed globally)
- **Free SendZen API** account and credentials

### AWS Account Requirements
- AWS Account with appropriate permissions (see [AWS Permissions](#aws-permissions) section)
- Access to AWS Cognito, Lambda, IAM, and CloudWatch services
- Ability to create and manage IAM roles and policies

## 🔐 AWS Permissions Required

### Minimum Required Permissions

Your AWS credentials must have the following permissions to deploy this serverless application:

#### 1. Lambda Service Permissions
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "lambda:CreateFunction",
        "lambda:UpdateFunctionCode",
        "lambda:UpdateFunctionConfiguration",
        "lambda:DeleteFunction",
        "lambda:GetFunction",
        "lambda:GetFunctionConfiguration",
        "lambda:ListFunctions",
        "lambda:InvokeFunction",
        "lambda:AddPermission",
        "lambda:RemovePermission",
        "lambda:GetPolicy"
      ],
      "Resource": "*"
    }
  ]
}
```

#### 2. Cognito Identity Provider Permissions
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "cognito-idp:CreateUserPool",
        "cognito-idp:UpdateUserPool",
        "cognito-idp:DeleteUserPool",
        "cognito-idp:DescribeUserPool",
        "cognito-idp:ListUserPools",
        "cognito-idp:CreateUserPoolClient",
        "cognito-idp:UpdateUserPoolClient",
        "cognito-idp:DeleteUserPoolClient",
        "cognito-idp:DescribeUserPoolClient",
        "cognito-idp:ListUserPoolClients",
        "cognito-idp:AdminGetUser",
        "cognito-idp:AdminUpdateUserAttributes",
        "cognito-idp:AdminConfirmSignUp",
        "cognito-idp:AdminCreateUser",
        "cognito-idp:AdminDeleteUser",
        "cognito-idp:AdminSetUserPassword",
        "cognito-idp:AdminResetUserPassword"
      ],
      "Resource": "*"
    }
  ]
}
```

#### 3. IAM Service Permissions
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "iam:CreateRole",
        "iam:DeleteRole",
        "iam:GetRole",
        "iam:PassRole",
        "iam:AttachRolePolicy",
        "iam:DetachRolePolicy",
        "iam:PutRolePolicy",
        "iam:DeleteRolePolicy",
        "iam:GetRolePolicy",
        "iam:ListRolePolicies",
        "iam:ListAttachedRolePolicies",
        "iam:CreatePolicy",
        "iam:DeletePolicy",
        "iam:GetPolicy",
        "iam:GetPolicyVersion",
        "iam:ListPolicyVersions",
        "iam:CreatePolicyVersion",
        "iam:DeletePolicyVersion"
      ],
      "Resource": "*"
    }
  ]
}
```

#### 4. CloudWatch Logs Permissions
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "logs:CreateLogGroup",
        "logs:CreateLogStream",
        "logs:PutLogEvents",
        "logs:DescribeLogGroups",
        "logs:DescribeLogStreams",
        "logs:DeleteLogGroup",
        "logs:DeleteLogStream"
      ],
      "Resource": "*"
    }
  ]
}
```

#### 5. CloudFormation Permissions
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "cloudformation:CreateStack",
        "cloudformation:UpdateStack",
        "cloudformation:DeleteStack",
        "cloudformation:DescribeStacks",
        "cloudformation:DescribeStackEvents",
        "cloudformation:DescribeStackResources",
        "cloudformation:GetTemplate",
        "cloudformation:ValidateTemplate"
      ],
      "Resource": "*"
    }
  ]
}
```

### Complete AWS Policy

For convenience, here's a complete IAM policy that includes all required permissions:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "lambda:*",
        "cognito-idp:*",
        "iam:*",
        "logs:*",
        "cloudformation:*",
        "s3:CreateBucket",
        "s3:DeleteBucket",
        "s3:GetBucketLocation",
        "s3:ListBucket",
        "s3:GetObject",
        "s3:PutObject",
        "s3:DeleteObject",
        "apigateway:*"
      ],
      "Resource": "*"
    }
  ]
}
```

## 🛠 Setup Instructions

### 1. Install Dependencies

```bash
# Install npm packages
npm install

# Install Serverless Framework globally (if not already installed)
npm install -g serverless
```

### 2. Configure AWS Credentials

#### Option A: AWS CLI Configuration
```bash
aws configure
# Enter your AWS Access Key ID
# Enter your AWS Secret Access Key
# Enter your default region (e.g., eu-west-1)
# Enter your default output format (json)
```

#### Option B: Environment Variables
```bash
export AWS_ACCESS_KEY_ID=your_access_key_here
export AWS_SECRET_ACCESS_KEY=your_secret_key_here
export AWS_REGION=eu-west-1
```

#### Option C: AWS Profile
```bash
# Create a profile
aws configure --profile whatsapp-auth

# Use the profile
export AWS_PROFILE=whatsapp-auth
```

### 3. Environment Configuration

1. Copy the environment template:
   ```bash
   cp env.example .env
   ```

2. Fill in your actual values in `.env`:
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

### 4. Deploy to AWS

```bash
# Deploy to development environment
npm run deploy:dev

# Deploy to production environment
npm run deploy:prod

# Deploy to specific stage
serverless deploy --stage production

# Deploy to specific region
serverless deploy --region us-east-1
```

## 🏗 Architecture Overview

### Authentication Flow Diagram

![WhatsApp OTP Authentication Flow](../../docs/whatsapp-only-sequence.svg)

### Infrastructure Components Diagram

![Backend Infrastructure Components](../../docs/whatsapp-only-components.svg)

### Complete Architecture Diagram

![Complete System Architecture](../../docs/whatsapp-only-architecture.svg)

### Deployment Architecture Diagram

![Serverless Deployment Architecture](../../docs/whatsapp-only-deployment.svg)

> **Note**: These diagrams are automatically generated from PlantUML source files (`.puml`) in this directory. To modify diagrams, edit the corresponding `.puml` files and the GitHub Actions workflow will automatically render updated SVG files.

### Resources Created by Serverless Framework

#### 1. AWS Cognito User Pool for WhatsApp OTP
- **Name**: `WhatsApp-otp-auth-pool-{stage}`
- **Username Attribute**: `phone_number`
- **Custom Attributes**:
  - `custom:whatsapp_verified` (String)
  - `custom:auth_purpose` (String)
- **Password Policy**: 8+ characters with complexity requirements
- **MFA Configuration**: OFF (using custom auth instead)

#### 2. Lambda Functions
- **PreSignUp**: Auto-confirms users and sets custom attributes
- **DefineAuthChallenge**: Defines authentication flow logic
- **CreateAuthChallenge**: Generates OTP and sends via WhatsApp
- **VerifyAuthChallenge**: Verifies OTP and updates user attributes
- **PostConfirmation**: Post-confirmation setup (optional)

#### 3. User Pool Clients
- **Signup Client**: `WhatsApp-otp-signup-{stage}`
- **Login Client**: `WhatsApp-otp-login-{stage}`
- **Generate Secret**: false (simplified for this implementation)
- **Auth Flows**: Custom authentication enabled

#### 4. Lambda Permissions
- Each Lambda function gets permission to be invoked by Cognito
- Source ARN points to the User Pool for security

### Authentication Flow

1. **User Registration**: User signs up with phone number and password
2. **PreSignUp Trigger**: Auto-confirms user and sets `auth_purpose` attribute
3. **Custom Auth Initiation**: System triggers custom authentication flow
4. **DefineAuthChallenge**: Determines if OTP challenge is needed
5. **CreateAuthChallenge**: Generates OTP and sends via SendZen WhatsApp API
6. **VerifyAuthChallenge**: Validates OTP and updates user attributes
7. **Token Issuance**: System issues JWT tokens upon successful verification

## 🔧 Configuration Details

### Serverless Framework Configuration

The `serverless.yml` file configures:

- **Provider**: AWS with Node.js 18.x runtime
- **Environment Variables**: Loaded from `.env` file
- **IAM Role**: Permissions for Lambda functions
- **Functions**: 5 Lambda functions for authentication triggers
- **Resources**: CloudFormation resources for Cognito and permissions
- **Outputs**: User Pool ID, Client ID, and Client Secret

### Lambda Function Environment Variables

Each Lambda function receives:
- `SENDZEN_API_URL`: SendZen API endpoint
- `SENDZEN_API_KEY`: SendZen API key
- `WHATSAPP_FROM`: WhatsApp business number
- `WHATSAPP_TEMPLATE_NAME`: WhatsApp template name
- `WHATSAPP_LANG_CODE`: Template language code
- `OTP_EXPIRY_MINUTES`: OTP expiration time
- `MAX_LOGIN_ATTEMPTS`: Maximum login attempts

## 🚀 Deployment Commands

### Development Deployment
```bash
# Deploy to development
npm run deploy:dev

# Deploy with specific stage
serverless deploy --stage dev
```

### Production Deployment
```bash
# Deploy to production
npm run deploy:prod

# Deploy with specific stage
serverless deploy --stage prod
```

### Custom Deployment
```bash
# Deploy to specific region
serverless deploy --region us-east-1

# Deploy with verbose output
serverless deploy --verbose

# Deploy specific function only
serverless deploy function --function preSignUp
```

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

### Common Deployment Issues

1. **Insufficient Permissions**:
   - Ensure your AWS credentials have all required permissions
   - Check IAM policy attached to your user/role
   - Verify AWS CLI configuration

2. **Region Issues**:
   - Ensure the region is supported for all services
   - Check if Cognito is available in your chosen region

3. **Resource Conflicts**:
   - User Pool names must be unique within a region
   - Check if resources already exist with the same name

4. **Environment Variables**:
   - Ensure all required environment variables are set
   - Check `.env` file is properly formatted

### Debug Commands
```bash
# Validate serverless configuration
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

## 📚 Additional Resources

- [AWS Cognito Documentation](https://docs.aws.amazon.com/cognito/)
- [Serverless Framework Documentation](https://www.serverless.com/framework/docs/)
- [SendZen API Documentation](https://www.sendzen.io/docs)
- [AWS Lambda Documentation](https://docs.aws.amazon.com/lambda/)

## 🔒 Security Considerations

- **IAM Permissions**: Use least privilege principle
- **Environment Variables**: Never commit sensitive data to version control
- **Lambda Permissions**: Each function has minimal required permissions
- **Cognito Security**: User Pool configured with security best practices
- **Secret Management**: Consider using AWS Secrets Manager for production

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](../../LICENSE) file for details.