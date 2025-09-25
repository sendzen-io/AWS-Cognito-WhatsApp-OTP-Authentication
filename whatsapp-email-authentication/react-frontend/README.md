# AWS Cognito Custom Auth Test - React Frontend

This is a React application built with Vite to test AWS Cognito custom authentication with WhatsApp OTP using AWS Lambda functions.

## Features

- **Complete Authentication Flow**: Login and Signup with custom auth challenges
- **WhatsApp OTP**: Integrates with SendZen API for WhatsApp OTP delivery
- **User Registration**: Create new accounts with phone, email, and name
- **Secret Hash Support**: Properly handles AWS Cognito User Pool Client Secret
- **Direct API Integration**: Uses direct Cognito API calls with secret hash calculation
- **Modern React**: Built with React 18 and modern hooks
- **AWS Amplify v6**: Uses the latest AWS Amplify SDK for authentication
- **Responsive Design**: Mobile-friendly interface with modern styling
- **Error Handling**: Comprehensive error handling and user feedback

## Prerequisites

- Node.js 18+ 
- npm or yarn
- AWS Cognito User Pool configured with custom auth triggers
- SendZen API credentials for WhatsApp messaging

## Installation

1. Navigate to the vite-frontend directory:
   ```bash
   cd Simplified_AWS_Handler/vite-frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

## Configuration

The app is pre-configured with the following AWS Cognito settings:
- **User Pool ID**: `eu-west-1_NhDQ2Z6ed`
- **User Pool Client ID**: `21gcqcb1d7f6g3tgc8hb1sil37`
- **User Pool Client Secret**: `1peam6d6cqfhme7b5svor9gtta58tfloe51egp1fo4lhhr6dr8av`

### Environment Variables (Optional)

For better security, you can use environment variables:

1. Copy `env.example` to `.env.local`:
   ```bash
   cp env.example .env.local
   ```

2. Update the values in `.env.local` with your actual credentials

3. The app will automatically use environment variables if available, otherwise fall back to the hardcoded values.

### Manual Configuration

To modify these settings manually, edit the `amplifyConfig` object in `src/App.jsx`.

## Running the Application

### Development Mode
```bash
npm run dev
```

The app will be available at `http://localhost:3000`

### Production Build
```bash
npm run build
npm run preview
```

## Testing the Authentication Flow

### For New Users (Signup):
1. **Choose Signup**: Click "Create New Account" on the welcome screen
2. **Fill Details**: Enter your name, email, and phone number (E.164 format)
3. **Create Account**: Click "Create Account" to register
4. **Login**: After successful signup, you'll be redirected to login
5. **Send OTP**: Enter your phone number and click "Send OTP to WhatsApp"
6. **Check WhatsApp**: You should receive a 6-digit OTP code
7. **Verify Code**: Enter the OTP code to complete authentication
8. **Dashboard**: Upon successful authentication, you'll see the user dashboard

### For Existing Users (Login):
1. **Choose Login**: Click "Login with WhatsApp OTP" on the welcome screen
2. **Enter Phone**: Use the same phone number you registered with
3. **Send OTP**: Click "Send OTP to WhatsApp" to trigger the Lambda function
4. **Check WhatsApp**: You should receive a 6-digit OTP code
5. **Verify Code**: Enter the OTP code to complete authentication
6. **Dashboard**: Upon successful authentication, you'll see the user dashboard

## Lambda Functions Integration

This app tests the following AWS Lambda functions:

- **defineAuthChallenge**: Determines the authentication flow steps
- **createAuthChallenge**: Generates and sends OTP via WhatsApp
- **verifyAuthChallenge**: Verifies the OTP code entered by the user
- **preSignUp**: Auto-confirms users (optional)
- **postConfirmation**: Post-authentication setup (optional)

## Troubleshooting

### Common Issues

1. **CORS Errors**: Ensure your Cognito User Pool allows the frontend domain
2. **OTP Not Received**: Check SendZen API configuration and phone number format
3. **Authentication Failures**: Verify Lambda function deployment and permissions
4. **Client Secret Errors**: Ensure your Cognito User Pool Client has a secret configured and it matches the one in the app
5. **Signup Failures**: Check if your User Pool allows signup and if the preSignUp Lambda is properly configured

### Debug Mode

Open browser developer tools to see detailed authentication flow logs.

## Project Structure

```
vite-frontend/
├── src/
│   ├── App.jsx          # Main application component
│   ├── App.css          # Application styles
│   ├── main.jsx         # Application entry point
│   └── index.css        # Global styles
├── index.html           # HTML template
├── package.json         # Dependencies and scripts
├── vite.config.js      # Vite configuration
└── README.md           # This file
```

## Dependencies

- **React 18**: Modern React with hooks
- **AWS Amplify 6**: Latest AWS SDK for authentication
- **Vite**: Fast build tool and dev server

## Contributing

1. Make changes to the React components
2. Test the authentication flow
3. Ensure all Lambda functions are properly deployed
4. Update documentation as needed

## Support

For issues related to:
- **AWS Lambda Functions**: Check the main project documentation
- **React App**: Review browser console for errors
- **Authentication Flow**: Verify Cognito configuration and Lambda triggers
