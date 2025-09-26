# Installation Guide - Node.js Backend

This guide provides step-by-step instructions for installing and deploying the WhatsApp-Email Authentication backend system.

## Prerequisites

### System Requirements
- **Node.js**: Version 18.0.0 or higher
- **npm**: Version 8.0.0 or higher (comes with Node.js)
- **AWS CLI**: Version 2.0.0 or higher
- **Serverless Framework**: Version 3.0.0 or higher

### AWS Account Requirements
- AWS Account with administrative access
- AWS CLI configured with appropriate credentials
- IAM permissions for:
  - AWS Cognito
  - AWS Lambda
  - AWS CloudFormation
  - AWS IAM
  - AWS CloudWatch Logs

### Third-Party Services
- **SendZen Account**: For WhatsApp message delivery
- **WhatsApp Business Account**: For sending messages

## Installation Steps

### Step 1: System Setup

#### Install Node.js
```bash
# Using Node Version Manager (recommended)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc
nvm install 18
nvm use 18

# Or download from nodejs.org
# Visit https://nodejs.org and download LTS version
```

#### Install AWS CLI
```bash
# macOS
brew install awscli

# Linux
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install

# Windows
# Download from https://aws.amazon.com/cli/
```

#### Install Serverless Framework
```bash
npm install -g serverless
```

### Step 2: AWS Configuration

#### Configure AWS CLI
```bash
aws configure
```

Enter your AWS credentials:
- **AWS Access Key ID**: Your access key
- **AWS Secret Access Key**: Your secret key
- **Default region**: e.g., `us-east-1`
- **Default output format**: `json`

#### Verify AWS Configuration
```bash
aws sts get-caller-identity
```

### Step 3: SendZen Setup

#### Create SendZen Account
1. Visit [sendzen.io](https://app.sendzen.io/signup)
2. Sign up for an account
3. Complete account verification
4. Get your API key from the dashboard

#### Configure WhatsApp Template
1. In SendZen dashboard, go to Templates
2. Create a new template with the following content:
   ```
   Your verification code is {{1}}
   ```
3. Note the template name and language code
4. Ensure the template is approved
5. Update your `.env` file with the actual template name and language code:
   ```env
   WHATSAPP_TEMPLATE_NAME=your_actual_template_name
   WHATSAPP_LANG_CODE=your_actual_language_code
   ```

**Example Template Configuration:**
```env
WHATSAPP_TEMPLATE_NAME=otp_verification
WHATSAPP_LANG_CODE=en_US
```

### Step 4: Project Setup

#### Clone Repository
```bash
git clone <repository-url>
cd whatsapp-email-authentication/nodejs-backend
```

#### Install Dependencies
```bash
npm install
```

#### Environment Configuration
```bash
# Copy environment template
cp env.example .env

# Edit environment file
nano .env
```

Configure the following variables:
```env
# AWS Configuration
AWS_REGION=your_preferred_aws_region
AWS_ACCESS_KEY_ID=your_aws_access_key_id
AWS_SECRET_ACCESS_KEY=your_aws_secret_access_key

# SendZen API Configuration
SENDZEN_API_URL=https://api.sendzen.net/v1/messages
SENDZEN_API_KEY=your_sendzen_api_key
WHATSAPP_FROM=your_whatsapp_number
WHATSAPP_TEMPLATE_NAME=your_template_name
WHATSAPP_LANG_CODE=your_language_code

# Optional Configuration
OTP_EXPIRY_MINUTES=5
MAX_LOGIN_ATTEMPTS=3
NODE_ENV=development
LOG_LEVEL=info
COGNITO_USER_POOL_NAME=your_custom_user_pool_name
```

**Important Configuration Notes:**
- **AWS_REGION**: Choose your preferred AWS region (e.g., `us-east-1`, `us-west-2`, `eu-west-1`, `ap-southeast-1`)
- **COGNITO_USER_POOL_NAME**: Choose a unique name for your Cognito User Pool (e.g., `my-app-auth-pool`)
- **WHATSAPP_TEMPLATE_NAME**: Your approved WhatsApp template name from SendZen (e.g., `otp_verification`, `login_code`)
- **WHATSAPP_LANG_CODE**: Language code for your template (e.g., `en_US`, `es_ES`, `fr_FR`, `de_DE`)

### Step 5: Deployment

#### Development Deployment
```bash
# Deploy to development environment
npm run deploy:dev

----OR----

serverless deploy

# Check deployment status
serverless info --stage dev
```

#### Production Deployment
```bash
# Deploy to production environment
npm run deploy:prod

# Check deployment status
serverless info --stage prod
```

### Step 6: Post-Deployment Configuration

#### Get Configuration Values
After successful deployment, note the following values from the output:
- `UserPoolId`: Cognito User Pool ID
- `SignupUserPoolClientId`: Signup client ID
- `LoginUserPoolClientId`: Login client ID

#### Update Frontend Configuration
Use these values to configure the React frontend:
```env
VITE_AWS_REGION=your_preferred_aws_region
VITE_USER_POOL_ID=your_generated_user_pool_id
VITE_SIGNUP_CLIENT_ID=your_generated_signup_client_id
VITE_LOGIN_CLIENT_ID=your_generated_login_client_id
```

**Copy required values to your frontend `.env` file from AWS Console:**
```env
VITE_AWS_REGION=us-east-1
VITE_USER_POOL_ID=us-east-1_AbCdEfGhI
VITE_SIGNUP_CLIENT_ID=1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p
VITE_LOGIN_CLIENT_ID=9z8y7x6w5v4u3t2s1r0q9p8o7n6m5l4k
```

## Configuration Details

### AWS Cognito Configuration

#### User Pool Settings
- **Username Attributes**: Email and phone number
- **MFA Configuration**: OFF (using custom auth)
- **Email Configuration**: Cognito default
- **Auto-verified Attributes**: Email

#### User Pool Clients
- **Signup Client**: For user registration
- **Login Client**: For user authentication
- **Explicit Auth Flows**: CUSTOM_AUTH, REFRESH_TOKEN_AUTH

### Lambda Function Configuration

#### Function Settings
- **Runtime**: Node.js 18.x
- **Memory**: 256 MB
- **Timeout**: 30 seconds
- **Environment Variables**: From .env file

#### IAM Permissions
- `cognito-idp:*`
- `lambda:InvokeFunction`
- `logs:CreateLogGroup`
- `logs:CreateLogStream`
- `logs:PutLogEvents`

### SendZen Integration

#### API Configuration
- **Endpoint**: https://api.sendzen.net/v1/messages
- **Authentication**: Bearer token
- **Content-Type**: application/json

#### Message Template
```json
{
  "from": "your_whatsapp_number",
  "to": "user_phone_number",
  "type": "template",
  "template": {
    "name": "your_template_name",
    "lang_code": "your_language_code",
    "components": [
      {
        "type": "body",
        "parameters": [
          {
            "type": "text",
            "text": "123456"
          }
        ]
      }
    ]
  }
}
```

**Example with actual values:**
```json
{
  "from": "+1234567890",
  "to": "+0987654321",
  "type": "template",
  "template": {
    "name": "otp_verification",
    "lang_code": "en_US",
    "components": [
      {
        "type": "body",
        "parameters": [
          {
            "type": "text",
            "text": "123456"
          }
        ]
      }
    ]
  }
}
```

## Testing

### Local Testing
```bash
# Run tests
npm test

# Lint code
npm run lint

# Format code
npm run format
```

### Integration Testing
```bash
# Test with serverless offline
npm run offline

# Test specific function
serverless invoke local --function preSignUp --data '{"request":{"userAttributes":{"email":"test@example.com","phone_number":"+1234567890"}}}'
```

### Manual Testing
1. **Signup Flow**:
   - Create user with email and phone
   - Verify email confirmation
   - Test WhatsApp OTP delivery
   - Complete verification

2. **Login Flow**:
   - Login with existing user
   - Test WhatsApp OTP delivery
   - Complete authentication

## Troubleshooting

### Common Issues

#### 1. AWS Permissions Error
```
Error: User is not authorized to perform: cognito-idp:CreateUserPool
```
**Solution**: Ensure AWS credentials have sufficient permissions.

#### 2. SendZen API Error
```
Error: WhatsApp send failed - Status: 401
```
**Solution**: Check SendZen API key and configuration.

#### 3. Lambda Deployment Error
```
Error: The role defined for the function cannot be assumed by Lambda
```
**Solution**: Check IAM role configuration in [serverless.yml](serverless.yml).

#### 4. Environment Variables Not Set
```
Error: WhatsApp provider env not set
```
**Solution**: Verify all required environment variables are set.

### Debug Mode
Enable debug logging:
```env
LOG_LEVEL=debug
NODE_ENV=development
```

### Logs and Monitoring
```bash
# View Lambda logs
serverless logs -f preSignUp --stage dev

# View all logs
serverless logs --stage dev

# Monitor CloudWatch
aws logs describe-log-groups --log-group-name-prefix /aws/lambda
```

## Updates and Maintenance

### Updating Dependencies
```bash
# Check for updates
npm outdated

# Update dependencies
npm update

# Update specific package
npm install package-name@latest
```

### Redeployment
```bash
# Redeploy after changes
npm run deploy:dev

# Force redeploy
serverless deploy --force --stage dev
```

### Rollback
```bash
# List deployments
serverless deploy list --stage dev

# Rollback to previous version
serverless rollback --timestamp <timestamp> --stage dev
```

## Monitoring

### CloudWatch Metrics
- **Lambda Invocations**: Function call count
- **Lambda Duration**: Execution time
- **Lambda Errors**: Error rate
- **Cognito Metrics**: User pool activity

### Custom Metrics
- **OTP Generation**: OTP creation count
- **WhatsApp Delivery**: Message delivery success rate
- **Authentication Success**: Successful auth rate
- **Error Rates**: Error categorization

### Alerts
Set up CloudWatch alarms for:
- High error rates
- Long execution times
- Failed deployments
- API rate limits

## Security Considerations

### Environment Variables
- Never commit `.env` files
- Use AWS Systems Manager Parameter Store for production
- Rotate API keys regularly
- Use least privilege IAM policies

### Network Security
- Use VPC for Lambda functions if needed
- Configure security groups appropriately
- Enable AWS WAF for API protection
- Use HTTPS for all communications

### Data Protection
- Encrypt sensitive data at rest
- Use AWS KMS for key management
- Implement proper logging and monitoring
- Regular security audits

## Additional Resources

### Documentation
- [AWS Cognito Documentation](https://docs.aws.amazon.com/cognito/)
- [Serverless Framework Documentation](https://www.serverless.com/framework/docs/)
- [SendZen API Documentation](https://docs.sendzen.net/)
- [Node.js Documentation](https://nodejs.org/docs/)

### Support
- AWS Support (if you have a support plan)
- Serverless Framework Community
- SendZen Support
- GitHub Issues

---

**Note**: This installation guide assumes you have basic knowledge of AWS services, Node.js, and serverless architecture. For advanced configurations, consult the respective documentation.
