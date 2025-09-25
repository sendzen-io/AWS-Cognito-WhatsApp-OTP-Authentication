# AWS Cognito Custom Auth - WhatsApp OTP Handler

A passwordless authentication system using AWS Cognito Custom Authentication with WhatsApp OTP delivery via SendZen API.

## 🚀 Features

- **Passwordless Authentication**: No passwords required, just phone number + OTP
- **WhatsApp OTP Delivery**: Uses SendZen API for reliable WhatsApp message delivery
- **AWS Cognito Integration**: Leverages AWS Cognito for user management and session handling
- **Custom Auth Flow**: Implements Cognito Custom Authentication triggers
- **Serverless Architecture**: Built with AWS Lambda and Serverless Framework
- **Modern Frontend**: Clean, responsive web interface with AWS Amplify
- **Security First**: Enterprise-grade security with AWS Cognito

## 🏗️ Architecture

This system implements the following flow:

1. **User enters phone number** (E.164 format)
2. **Custom Auth Challenge** is initiated via AWS Cognito
3. **Lambda triggers** handle the authentication flow:
   - `DefineAuthChallenge`: Determines next step
   - `CreateAuthChallenge`: Generates OTP and sends via WhatsApp
   - `VerifyAuthChallenge`: Validates OTP code
4. **User receives OTP** on WhatsApp
5. **User enters OTP** to complete authentication
6. **AWS Cognito issues tokens** for authenticated session

## 📋 Prerequisites

- AWS Account with appropriate permissions
- Node.js 18+ installed
- Serverless Framework installed globally
- SendZen API account and credentials
- AWS Cognito User Pool configured

## 🛠️ Setup Instructions

### 1. Clone and Install

```bash
git clone <repository-url>
cd Simplified_AWS_Handler
npm install
```

### 2. Configure Environment Variables

Copy the example environment file and update with your values:

```bash
cp env.example .env
```

Update `.env` with your actual values:

```env
# AWS Configuration
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_aws_access_key_id
AWS_SECRET_ACCESS_KEY=your_aws_secret_access_key

# Cognito Configuration
USER_POOL_ID=us-east-1_XXXXXXXXX
APP_CLIENT_ID=your_cognito_app_client_id

# SendZen WhatsApp API Configuration
SENDZEN_API_URL=https://api.sendzen.net/v1/messages
SENDZEN_API_KEY=your_sendzen_api_key
```

### 3. Configure AWS Cognito User Pool

#### Create User Pool with Custom Auth:

1. **Create User Pool**:
   - Go to AWS Cognito Console
   - Create new User Pool
   - Enable Custom Authentication
   - Configure triggers (see Lambda Functions section)

2. **Configure App Client**:
   - Create App Client
   - Enable Custom Authentication Flow
   - Set appropriate OAuth scopes

3. **Set up Lambda Triggers**:
   - DefineAuthChallenge
   - CreateAuthChallenge  
   - VerifyAuthChallenge
   - PreSignUp (optional)
   - PostConfirmation (optional)

### 4. Deploy Lambda Functions

```bash
# Deploy to development
npm run deploy:dev

# Deploy to production
npm run deploy:prod
```

### 5. Update Frontend Configuration

Update the Amplify configuration in `index.html`:

```javascript
const amplifyConfig = {
    Auth: {
        region: 'us-east-1', // Your AWS region
        userPoolId: 'us-east-1_XXXXXXXXX', // Your User Pool ID
        userPoolWebClientId: 'your-app-client-id', // Your App Client ID
        authenticationFlowType: 'CUSTOM_AUTH'
    }
};
```

### 6. Test the Application

1. Open `index.html` in a web browser
2. Enter a phone number in E.164 format (e.g., +1234567890)
3. Click "Send OTP to WhatsApp"
4. Check WhatsApp for the OTP code
5. Enter the code to complete authentication

## 📁 Project Structure

```
Simplified_AWS_Handler/
├── lambda-functions.js      # Lambda trigger functions
├── serverless.yml          # Serverless configuration
├── package.json           # Node.js dependencies
├── env.example           # Environment variables template
├── index.html            # Frontend application
├── style.css            # Frontend styles
├── cognito-custom-auth-sequence.puml  # UML sequence diagram
└── README.md            # This file
```

## 🔧 Lambda Functions

### DefineAuthChallenge
- Determines the authentication flow steps
- Handles retry logic and failure conditions
- Issues tokens when authentication succeeds

### CreateAuthChallenge
- Generates 6-digit OTP code
- Sends OTP via SendZen WhatsApp API
- Stores challenge parameters securely

### VerifyAuthChallenge
- Validates OTP code entered by user
- Checks OTP expiration (5 minutes)
- Returns verification result

## 🌐 API Integration

### SendZen WhatsApp API

The system integrates with SendZen API for WhatsApp message delivery:

```javascript
const payload = {
    to: phoneNumber,
    message: `Your verification code is: ${otpCode}`,
    type: 'text'
};
```

## 🔒 Security Features

- **OTP Expiration**: Codes expire after 5 minutes
- **Attempt Limiting**: Maximum 3 failed attempts
- **Secure Storage**: Challenge parameters stored securely
- **AWS Cognito Security**: Enterprise-grade user management
- **CORS Protection**: Configured for specific origins

## 🚀 Deployment

### Development Deployment

```bash
npm run deploy:dev
```

### Production Deployment

```bash
npm run deploy:prod
```

### Local Development

```bash
npm run offline
```

## 🧪 Testing

```bash
# Run tests
npm test

# Run with coverage
npm run test:coverage
```

## 📊 Monitoring

Monitor your Lambda functions through:

- AWS CloudWatch Logs
- AWS X-Ray (if enabled)
- Serverless Framework dashboard

## 🔧 Troubleshooting

### Common Issues

1. **Cognito Triggers Not Working**:
   - Verify Lambda functions are deployed
   - Check IAM permissions
   - Ensure triggers are properly configured

2. **WhatsApp Messages Not Sending**:
   - Verify SendZen API credentials
   - Check phone number format (E.164)
   - Review API rate limits

3. **Frontend Not Loading**:
   - Check Amplify configuration
   - Verify CORS settings
   - Check browser console for errors

### Debug Mode

Enable debug logging by setting:

```env
NODE_ENV=development
LOG_LEVEL=debug
```

## 📈 Performance Considerations

- **Lambda Cold Starts**: Consider provisioned concurrency for production
- **OTP Storage**: Currently in-memory, consider Redis for production
- **Rate Limiting**: Implement API rate limiting
- **Monitoring**: Set up CloudWatch alarms

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:

- Create an issue in the repository
- Check AWS Cognito documentation
- Review SendZen API documentation

## 🔄 Version History

- **v1.0.0**: Initial release with basic custom auth flow
- **v1.1.0**: Added WhatsApp integration
- **v1.2.0**: Enhanced security and error handling

---

**Built with ❤️ using AWS Cognito, SendZen API, and Serverless Framework**
