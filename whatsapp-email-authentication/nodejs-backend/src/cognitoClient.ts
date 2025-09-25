import { CognitoIdentityProviderClient } from '@aws-sdk/client-cognito-identity-provider';

// Single shared Cognito client instance
export const cognitoClient = new CognitoIdentityProviderClient({
  region: process.env.AWS_REGION || 'eu-west-1',
});

console.log(
  'Cognito client initialized with region:',
  process.env.AWS_REGION || 'eu-west-1'
);
