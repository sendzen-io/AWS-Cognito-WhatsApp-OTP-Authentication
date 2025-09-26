# Installation Guide - React Frontend

This guide provides step-by-step instructions for installing and running the WhatsApp-Email Authentication React frontend application.

## Prerequisites

### System Requirements
- **Node.js**: Version 18.0.0 or higher
- **npm**: Version 8.0.0 or higher (comes with Node.js)
- **Modern Browser**: Chrome, Firefox, Safari, or Edge (latest versions)

### Backend Requirements
- **AWS Cognito Backend**: Deployed and configured
- **User Pool ID**: From backend deployment
- **Client IDs**: Signup and login client IDs
- **AWS Region**: Region where Cognito is deployed

### Development Tools (Optional)
- **VS Code**: Recommended code editor
- **React Developer Tools**: Browser extension
- **ESLint Extension**: For code quality

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

#### Verify Installation
```bash
node --version  # Should show v18.x.x or higher
npm --version   # Should show 8.x.x or higher
```

### Step 2: Project Setup

#### Clone Repository
```bash
git clone <repository-url>
cd whatsapp-email-authentication/react-frontend
```

#### Install Dependencies
```bash
npm install
```

### Step 3: Environment Configuration

#### Create Environment File
```bash
# Copy environment template
cp env.example .env
```

#### Configure Environment Variables
Edit the `.env` file with your AWS Cognito configuration:
```env
VITE_AWS_REGION=your_preferred_aws_region
VITE_USER_POOL_ID=your_generated_user_pool_id
VITE_SIGNUP_CLIENT_ID=your_generated_signup_client_id
VITE_LOGIN_CLIENT_ID=your_generated_login_client_id
```

**Important**: Replace the placeholder values with actual values from your backend deployment.

**Example Configuration:**
```env
VITE_AWS_REGION=us-east-1
VITE_USER_POOL_ID=us-east-1_AbCdEfGhI
VITE_SIGNUP_CLIENT_ID=1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p
VITE_LOGIN_CLIENT_ID=9z8y7x6w5v4u3t2s1r0q9p8o7n6m5l4k
```

**How to get these values:**
1. Deploy the backend first (see [backend installation guide](../nodejs-backend/INSTALLATION.md))
2. Copy the values from the backend deployment output
3. Paste them into this frontend `.env` file

### Step 4: Development Server

#### Start Development Server
```bash
npm run dev
```

The application will start on `http://localhost:5173` (or the next available port).

#### Verify Installation
1. Open your browser and navigate to the development URL
2. You should see the WhatsApp-Email Authentication interface
3. Check the browser console for any errors

### Step 5: Build and Preview

#### Build for Production
```bash
npm run build
```

#### Preview Production Build
```bash
npm run preview
```

## Configuration Details

### Environment Variables

| Variable | Description | Required | Example |
|----------|-------------|----------|---------|
| `VITE_AWS_REGION` | AWS region where Cognito is deployed | Yes | `us-east-1` |
| `VITE_USER_POOL_ID` | Cognito User Pool ID | Yes | `us-east-1_AbCdEfGhI` |
| `VITE_SIGNUP_CLIENT_ID` | Client ID for signup flow | Yes | `1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p` |
| `VITE_LOGIN_CLIENT_ID` | Client ID for login flow | Yes | `9z8y7x6w5v4u3t2s1r0q9p8o7n6m5l4k` |

### AWS Cognito Configuration

#### User Pool Settings
- **Username Attributes**: Email and phone number
- **MFA Configuration**: OFF (using custom auth)
- **Email Configuration**: Cognito default
- **Auto-verified Attributes**: Email

#### Client Configuration
- **Signup Client**: For user registration flow
- **Login Client**: For user authentication flow
- **Explicit Auth Flows**: CUSTOM_AUTH, REFRESH_TOKEN_AUTH

### Application Configuration

#### AWS Amplify Configuration
The application uses AWS Amplify for Cognito integration:
```javascript
const amplifyConfig = {
  Auth: {
    Cognito: {
      region: import.meta.env.VITE_AWS_REGION,
      userPoolId: import.meta.env.VITE_USER_POOL_ID,
      userPoolClientId: import.meta.env.VITE_LOGIN_CLIENT_ID,
    },
  },
};
```

## Testing

### Development Testing
```bash
# Run linting
npm run lint

# Check for unused dependencies
npm audit
```

### Manual Testing Checklist
- [ ] **Signup Flow**:
  - [ ] Email validation
  - [ ] Phone number validation (E.164 format)
  - [ ] Password strength requirements
  - [ ] Email confirmation step
  - [ ] WhatsApp OTP verification
  - [ ] Success state

- [ ] **Login Flow**:
  - [ ] Email validation
  - [ ] WhatsApp OTP delivery
  - [ ] OTP verification
  - [ ] Success state

- [ ] **Error Handling**:
  - [ ] Invalid email format
  - [ ] Invalid phone format
  - [ ] Network errors
  - [ ] Authentication failures
  - [ ] OTP verification failures

- [ ] **User Experience**:
  - [ ] Responsive design
  - [ ] Loading states
  - [ ] Progress indicators
  - [ ] Error recovery
  - [ ] Accessibility

### Browser Testing
Test in multiple browsers:
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

### Mobile Testing
Test on mobile devices:
- iOS Safari
- Android Chrome
- Responsive design
- Touch interactions

## Deployment

### Build Process
```bash
# Production build
npm run build

# Preview build
npm run preview
```

### Deployment Options

#### Static Hosting (Recommended)
```bash
# Build the application
npm run build

# Deploy to your preferred static hosting service
# Examples: Netlify, Vercel, AWS S3, GitHub Pages
```

#### Netlify Deployment
1. Connect your repository to Netlify
2. Set build command: `npm run build`
3. Set publish directory: `dist`
4. Add environment variables in Netlify dashboard
5. Deploy

#### Vercel Deployment
1. Install Vercel CLI: `npm i -g vercel`
2. Run: `vercel`
3. Follow the prompts
4. Add environment variables in Vercel dashboard

#### AWS S3 + CloudFront
1. Build the application: `npm run build`
2. Upload `dist` folder to S3 bucket
3. Configure CloudFront distribution
4. Set up custom domain (optional)

### Environment-Specific Builds
```bash
# Development build
NODE_ENV=development npm run build

# Production build
NODE_ENV=production npm run build
```

## Customization

### Styling Customization
Modify `src/App.css` for custom styling:
```css
/* Custom color scheme */
:root {
  --primary-color: #your-color;
  --secondary-color: #your-color;
  --success-color: #your-color;
  --error-color: #your-color;
}

/* Custom typography */
body {
  font-family: 'Your-Font', sans-serif;
}
```

### Component Customization
Extend or modify components:
```jsx
// Add new authentication methods
// Customize error messages
// Modify success displays
// Add new form fields
```

### Configuration Customization
Environment-based configuration:
```javascript
// Different AWS regions
// Multiple user pools
// Custom error messages
// Feature flags
```

## Troubleshooting

### Common Issues

#### 1. Environment Variables Not Loading
```
Error: VITE_USER_POOL_ID is not defined
```
**Solution**:
- Check `.env` file format
- Restart development server
- Verify variable names start with `VITE_`

#### 2. AWS Cognito Errors
```
Error: User pool does not exist
```
**Solution**:
- Verify User Pool ID
- Check AWS region configuration
- Ensure backend is deployed

#### 3. Build Errors
```
Error: Cannot resolve module
```
**Solution**:
- Clear node_modules: `rm -rf node_modules`
- Reinstall dependencies: `npm install`
- Check Node.js version compatibility

#### 4. Runtime Errors
```
Error: Cannot read property of undefined
```
**Solution**:
- Check browser console for details
- Verify environment variables are set
- Check network connectivity

### Debug Mode
Enable debug logging in browser console:
```javascript
localStorage.setItem('debug', 'true');
```

### Browser Developer Tools
Use browser developer tools for debugging:
- **Console**: Check for JavaScript errors
- **Network**: Monitor API calls
- **Application**: Check localStorage and sessionStorage
- **Elements**: Inspect DOM structure

## Performance Optimization

### Build Optimization
```bash
# Analyze bundle size
npm run build -- --analyze

# Check for unused dependencies
npm run build -- --report
```

### Runtime Optimization
- **Code Splitting**: Automatic with Vite
- **Tree Shaking**: Automatic with Vite
- **Minification**: Automatic in production
- **Compression**: Enable gzip/brotli on server

### Performance Monitoring
- **Lighthouse**: Run performance audits
- **Web Vitals**: Monitor Core Web Vitals
- **Bundle Analyzer**: Analyze bundle size
- **Network Monitoring**: Monitor API performance

## Security Considerations

### Environment Variables
- Never commit `.env` files
- Use build-time environment variables
- Rotate API keys regularly
- Use HTTPS for all communications

### Content Security Policy
Add CSP headers for production:
```html
<meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';">
```

### Input Validation
- Client-side validation for UX
- Server-side validation for security
- Sanitize all user inputs
- Prevent XSS attacks

## Additional Resources

### Documentation
- [React Documentation](https://react.dev/)
- [Vite Documentation](https://vitejs.dev/)
- [AWS Amplify Documentation](https://docs.amplify.aws/)
- [AWS Cognito Documentation](https://docs.aws.amazon.com/cognito/)

### Development Tools
- [React Developer Tools](https://react.dev/learn/react-developer-tools)
- [Vite Plugin React](https://github.com/vitejs/vite-plugin-react)
- [ESLint React Plugin](https://github.com/jsx-eslint/eslint-plugin-react)

### Support
- React Community
- Vite Community
- AWS Support (if you have a support plan)
- GitHub Issues

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

### Security Updates
```bash
# Check for security vulnerabilities
npm audit

# Fix security issues
npm audit fix
```

### Code Quality
```bash
# Run linting
npm run lint

# Fix linting issues
npm run lint -- --fix
```

---

**Note**: This installation guide assumes you have basic knowledge of React, Node.js, and web development. For advanced configurations, consult the respective documentation.
