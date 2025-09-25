const {
    CognitoIdentityProviderClient,
    AdminConfirmSignUpCommand,
    AdminGetUserCommand,
    AdminUpdateUserAttributesCommand,
    DescribeUserPoolClientCommand,
  } = require("@aws-sdk/client-cognito-identity-provider");

  const cognito = new CognitoIdentityProviderClient({
    region: process.env.AWS_REGION || "eu-west-1",
  });

  export {cognito, CognitoIdentityProviderClient, AdminConfirmSignUpCommand, AdminGetUserCommand, AdminUpdateUserAttributesCommand, DescribeUserPoolClientCommand}