# Frontend Installation Guide

This guide will walk you through setting up and running the Next.js frontend for AWS Cognito WhatsApp OTP Authentication.

## Prerequisites

- **Node.js 18+** installed
- **Backend successfully deployed** (see backend INSTALLATION.md)
- **Backend deployment outputs** (UserPoolId, ClientId, ClientSecret)

## Step-by-Step Installation

### Step 1: Navigate to Frontend Directory
```bash
cd frontend
```

### Step 2: Configure Environment Variables
```bash
# Copy environment template
cp env.example .env.local
```

Edit the `.env.local` file with values from your backend deployment:

```env
# AWS Cognito Configuration (from backend deployment)
NEXT_PUBLIC_AWS_REGION=your_aws_region  # Must match backend deployment region
NEXT_PUBLIC_USER_POOL_ID=your_user_pool_id
NEXT_PUBLIC_SIGNUP_CLIENT_ID=your_signup_client_id
NEXT_PUBLIC_LOGIN_CLIENT_ID=your_login_client_id
```

**Where to find these values:**
- **NEXT_PUBLIC_AWS_REGION**: Same region you deployed backend to
- **NEXT_PUBLIC_USER_POOL_ID**: From backend deployment output (e.g., `eu-west-1_xxxxxxxxx`)
- **NEXT_PUBLIC_SIGNUP_CLIENT_ID**: From backend deployment output (SignupClientId)
- **NEXT_PUBLIC_LOGIN_CLIENT_ID**: From backend deployment output (LoginClientId)

### Step 3: Install Dependencies
```bash
npm install
```

### Step 4: Start Development Server
```bash
npm run dev
```

### Step 5: Access the Application
Open your browser and navigate to:
```
http://localhost:3000
```

## Verification

### Test the Application

1. **Signup Flow**:
   - Click "Create Account"
   - Enter phone number in E.164 format (e.g., `+1234567890`)
   - Enter password (minimum 8 characters)
   - Click "Create Account"
   - Check your WhatsApp for OTP
   - Enter the 6-digit OTP
   - Verify successful account creation

2. **Login Flow**:
   - Click "Sign in"
   - Enter your registered phone number
   - Click "Send OTP"
   - Check your WhatsApp for OTP
   - Enter the 6-digit OTP
   - Verify successful login and dashboard access

### Expected Behavior
- ✅ Phone number validation (E.164 format)
- ✅ Password strength requirements
- ✅ OTP sent to WhatsApp
- ✅ Successful authentication
- ✅ Dashboard with user information and tokens

## Troubleshooting

### Common Issues

1. **CORS Errors**:
   - Go to AWS Cognito Console
   - Navigate to your User Pool
   - Go to "App integration" → "App clients"
   - Add your domain to "Allowed callback URLs"

2. **Authentication Fails**:
   - Verify environment variables are correct
   - Check browser console for errors
   - Ensure backend is deployed and running

3. **OTP Not Received**:
   - Check backend CloudWatch logs
   - Verify SendZen API configuration
   - Ensure phone number is in E.164 format

4. **Build Errors**:
   - Check Node.js version: `node --version` (should be 18+)
   - Clear node_modules: `rm -rf node_modules && npm install`
   - Check for TypeScript errors

### Debug Steps

1. **Check Environment Variables**:
   ```bash
   # Verify .env.local file exists and has correct values
   cat .env.local
   ```

2. **Check Browser Console**:
   - Open browser developer tools
   - Look for JavaScript errors
   - Check network requests

3. **Check Backend Status**:
   ```bash
   # Verify backend is deployed
   aws lambda list-functions --query 'Functions[?contains(FunctionName, `cognito-sendzenOTP-auth`)].FunctionName'
   ```

## Development

### Available Scripts
```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linting
npm run lint
```

### Project Structure
```
frontend/
├── src/
│   └── app/
│       ├── components/
│       │   ├── SignupForm.tsx      # User registration
│       │   ├── LoginForm.tsx       # User login
│       │   ├── OTPVerification.tsx # OTP verification
│       │   └── Dashboard.tsx       # User dashboard
│       ├── services/
│       │   └── authService.ts      # AWS Cognito integration
│       └── page.tsx                # Main page
├── public/                         # Static assets
├── package.json                    # Dependencies
└── README.md                       # Documentation
```

## Production Deployment

### Build for Production
```bash
npm run build
```

### Deploy to Vercel
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod
```

### Deploy to AWS Amplify
```bash
# Install Amplify CLI
npm install -g @aws-amplify/cli

# Initialize and deploy
amplify init
amplify publish
```

## Next Steps

After successful frontend setup:
1. Test both signup and login flows
2. Verify OTP delivery via WhatsApp
3. Check dashboard functionality
4. Consider production deployment
5. Set up monitoring and logging
