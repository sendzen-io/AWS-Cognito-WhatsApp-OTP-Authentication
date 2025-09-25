import { 
  PreSignUpTriggerEvent,
  PreSignUpTriggerHandler,
  DefineAuthChallengeTriggerEvent,
  DefineAuthChallengeTriggerHandler,
  CreateAuthChallengeTriggerEvent,
  CreateAuthChallengeTriggerHandler,
  VerifyAuthChallengeResponseTriggerEvent,
  VerifyAuthChallengeResponseTriggerHandler,
  PostConfirmationTriggerEvent,
  PostConfirmationTriggerHandler
} from 'aws-lambda';

// Use specific trigger event types instead of deprecated generic ones
export type PreSignUpEvent = PreSignUpTriggerEvent;
export type DefineAuthChallengeEvent = DefineAuthChallengeTriggerEvent;
export type CreateAuthChallengeEvent = CreateAuthChallengeTriggerEvent;
export type VerifyAuthChallengeEvent = VerifyAuthChallengeResponseTriggerEvent;
export type PostConfirmationEvent = PostConfirmationTriggerEvent;

// Handler types
export type PreSignUpHandler = PreSignUpTriggerHandler;
export type DefineAuthChallengeHandler = DefineAuthChallengeTriggerHandler;
export type CreateAuthChallengeHandler = CreateAuthChallengeTriggerHandler;
export type VerifyAuthChallengeHandler = VerifyAuthChallengeResponseTriggerHandler;
export type PostConfirmationHandler = PostConfirmationTriggerHandler;

export interface WhatsAppError {
  statuscode: number;
  response: string;
  data: string;
}

export interface WhatsAppApiResponse {
  statuscode: number;
  response: string;
  data?: any;
}

export interface UserAttributes {
  phone_number?: string;
  phoneNumber?: string;
  phone?: string;
  'custom:phone'?: string;
  'custom:phoneNumber'?: string;
  'custom:whatsapp_verified'?: string;
  'custom:auth_purpose'?: string;
  phone_number_verified?: string;
  email?: string;
  email_verified?: string;
}

export interface CognitoUser {
  Username: string;
  UserStatus: string;
  UserAttributes?: Array<{
    Name: string;
    Value: string;
  }>;
}

