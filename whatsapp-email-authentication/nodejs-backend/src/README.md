# Cognito Custom Auth Handler - TypeScript Lambda Functions

This directory contains the TypeScript lambda functions for AWS Cognito custom authentication with WhatsApp OTP integration.

## Structure

- `src/types.ts` - TypeScript type definitions for Cognito events and custom interfaces
- `src/utils.ts` - Shared utility functions for OTP generation, phone validation, and WhatsApp API integration
- `src/cognitoClient.ts` - Shared Cognito client instance for all lambda functions
- `src/preSignUp.ts` - Pre-signup trigger handler
- `src/defineAuthChallenge.ts` - Define auth challenge trigger handler
- `src/createAuthChallenge.ts` - Create auth challenge trigger handler (sends WhatsApp OTP)
- `src/verifyAuthChallenge.ts` - Verify auth challenge trigger handler (validates OTP)
- `src/postConfirmation.ts` - Post-confirmation trigger handler

## Key Features

- **TypeScript Support**: Full type safety with AWS Lambda and Cognito types
- **WhatsApp OTP**: Integration with SendZen API for sending OTP via WhatsApp
- **Custom Auth Flow**: Supports both signup verification and login authentication
- **Error Handling**: Comprehensive error handling with detailed logging
- **Security**: Cryptographically strong OTP generation and validation

## Environment Variables Required

- `SENDZEN_API_URL` - SendZen API endpoint
- `SENDZEN_API_KEY` - SendZen API key
- `WHATSAPP_FROM` - WhatsApp sender number
- `WHATSAPP_TEMPLATE_NAME` - WhatsApp template name (default: 'otp_1')
- `WHATSAPP_LANG_CODE` - WhatsApp language code (default: 'en_US')
- `USER_POOL_ID` - Cognito User Pool ID (set automatically by serverless)

## Deployment

The functions are configured in `serverless.yml` and will be deployed as individual Lambda functions:

- `preSignUp` - Pre-signup trigger
- `defineAuthChallenge` - Define auth challenge trigger
- `createAuthChallenge` - Create auth challenge trigger
- `verifyAuthChallenge` - Verify auth challenge trigger
- `postConfirmation` - Post-confirmation trigger

## Build Process

The serverless framework uses `serverless-esbuild` plugin to compile TypeScript to JavaScript during deployment.

## Migration from JavaScript

This TypeScript implementation replaces the original `lambda-functions.js` file with individual, type-safe Lambda functions that follow the serverless.yml configuration structure.
