# System Architecture Diagrams

## Architecture Diagram

![Architecture Diagram](diagrams/WA_Only_Architecture.svg)

<details>
<summary>Click to expand PlantUML code</summary>

```plantuml
@startuml WhatsApp-Only Authentication System Architecture

!theme aws-orange
title WhatsApp-Only Authentication System Architecture

package "Frontend Layer" {
  [Next.js Frontend] as NextJS
  [AWS SDK v3] as AWSSDK
}

package "AWS Cognito" {
  [Cognito User Pool] as UserPool
  [Signup Client] as SignupClient
  [Login Client] as LoginClient
}

package "Lambda Functions" {
  [PreSignUp Trigger] as PreSignUp
  [DefineAuthChallenge Trigger] as DefineAuth
  [CreateAuthChallenge Trigger] as CreateAuth
  [VerifyAuthChallenge Trigger] as VerifyAuth
  [PostConfirmation Trigger] as PostConfirm
}

package "External Services" {
  [SendZen WhatsApp API] as SendZen
}

package "Storage" {
  [CloudWatch Logs] as CloudWatch
  database "DynamoDB (Optional)" as DynamoDB
}

NextJS --> AWSSDK
AWSSDK --> UserPool
UserPool --> SignupClient
UserPool --> LoginClient

UserPool --> PreSignUp
UserPool --> DefineAuth
UserPool --> CreateAuth
UserPool --> VerifyAuth
UserPool --> PostConfirm

CreateAuth --> SendZen

PreSignUp --> CloudWatch
DefineAuth --> CloudWatch
CreateAuth --> CloudWatch
VerifyAuth --> CloudWatch
PostConfirm --> CloudWatch

@enduml
```

</details>

## Authentication Flow Diagram

![Authentication Flow Diagram](diagrams/WA_Only_Authentication_Flow.svg)

<details>
<summary>Click to expand PlantUML code</summary>

```plantuml
@startuml WhatsApp-Only Authentication Flow

!theme aws-orange
title WhatsApp-Only Authentication Flow

actor User
participant "Next.js Frontend" as Frontend
participant "AWS Cognito" as Cognito
participant "Lambda Functions" as Lambda
participant "SendZen API" as SendZen

== Signup Flow ==

User -> Frontend: Enter phone, password
Frontend -> Cognito: SignUp (Signup Client)
Cognito -> Lambda: PreSignUp Trigger
Lambda --> Cognito: Auto-confirm: true
Cognito --> Frontend: UserSub, Session

Frontend -> Cognito: InitiateAuth (CUSTOM_AUTH)
Cognito -> Lambda: DefineAuthChallenge
Lambda --> Cognito: CUSTOM_CHALLENGE
Cognito -> Lambda: CreateAuthChallenge
Lambda -> SendZen: Send WhatsApp OTP
SendZen --> User: WhatsApp message with OTP
Lambda --> Cognito: OTP generated
Cognito --> Frontend: Challenge session

User -> Frontend: Enter WhatsApp OTP
Frontend -> Cognito: RespondToAuthChallenge
Cognito -> Lambda: VerifyAuthChallenge
Lambda --> Cognito: OTP verified
Cognito -> Lambda: PostConfirmation
Lambda --> Cognito: User attributes updated
Cognito --> Frontend: Authentication tokens

== Login Flow ==

User -> Frontend: Enter phone number
Frontend -> Cognito: InitiateAuth (Login Client)
Cognito -> Lambda: DefineAuthChallenge
Lambda --> Cognito: CUSTOM_CHALLENGE
Cognito -> Lambda: CreateAuthChallenge
Lambda -> SendZen: Send WhatsApp OTP
SendZen --> User: WhatsApp message with OTP
Lambda --> Cognito: OTP generated
Cognito --> Frontend: Challenge session

User -> Frontend: Enter WhatsApp OTP
Frontend -> Cognito: RespondToAuthChallenge
Cognito -> Lambda: VerifyAuthChallenge
Lambda --> Cognito: OTP verified
Cognito --> Frontend: Authentication tokens

@enduml
```

</details>

## Component Interaction Diagram

![Component Interaction Diagram](diagrams/WA_Only_Component_Interaction.svg)

<details>
<summary>Click to expand PlantUML code</summary>

```plantuml
@startuml Frontend Component Interactions

!theme aws-orange
title Frontend Component Interactions

package "Frontend Components" {
  [page.tsx] as App
  [SignupForm.tsx] as SignupForm
  [LoginForm.tsx] as LoginForm
  [OTPVerification.tsx] as OTPForm
  [Dashboard.tsx] as Dashboard
}

package "Authentication Logic" {
  [authService.ts] as AuthService
  [Error Handler] as ErrorHandler
  [Input Validation] as Validation
}

package "AWS Services" {
  [AWS Cognito] as Cognito
  [Lambda Functions] as Lambda
  [SendZen API] as SendZen
}

App --> SignupForm
App --> LoginForm
App --> OTPForm
App --> Dashboard

SignupForm --> AuthService
LoginForm --> AuthService
OTPForm --> AuthService

AuthService --> Validation
AuthService --> ErrorHandler
AuthService --> Cognito

Cognito --> Lambda
Lambda --> SendZen

ErrorHandler --> Dashboard
Validation --> Dashboard

@enduml
```

</details>

## User Experience Flow Diagram

![User Experience Flow Diagram](diagrams/WA_Only_UX_Flow.svg)

<details>
<summary>Click to expand PlantUML code</summary>

```plantuml
@startuml
!theme aws-orange
title User Experience Flow

' Main Flow
[*] --> SignupPage

SignupPage --> WhatsAppOTP : Valid signup
SignupPage --> SignupPage : Invalid input
SignupPage --> LoginPage : Switch to login

LoginPage --> SignupPage : Switch to signup
LoginPage --> WhatsAppOTP : Valid phone
LoginPage --> LoginPage : Invalid phone

WhatsAppOTP --> Success : Valid OTP
WhatsAppOTP --> WhatsAppOTP : Invalid OTP
WhatsAppOTP --> SignupPage : Back

Success --> [*] : Continue

' --- Nested States ---
state SignupPage {
    [*] --> PhoneInput
    PhoneInput --> PasswordInput : Valid phone
    PasswordInput --> Submit : Valid password
    Submit --> [*] : Submit
}

state LoginPage {
    [*] --> PhoneInput
    PhoneInput --> Submit : Valid phone
    Submit --> [*] : Submit
}

state WhatsAppOTP {
    [*] --> OTPInput
    OTPInput --> Submit : Valid OTP
    Submit --> [*] : Submit
}

state Success {
    [*] --> UserInfo
    UserInfo --> Continue : Continue
    UserInfo --> Logout : Logout
    Continue --> [*]
    Logout --> [*]
}

@enduml
```

</details>

## Lambda Function Architecture

![Lambda Function Architecture](diagrams/WA_Only_Lambda_Architecture.svg)

<details>
<summary>Click to expand PlantUML code</summary>

```plantuml
@startuml Lambda Function Architecture

!theme aws-orange
title Lambda Function Architecture

package "Lambda Functions" {
  package "PreSignUp" {
    [Validate phone number] as PS1
    [Set auto-confirm true] as PS2
    [Set custom attributes] as PS3
  }
  
  package "DefineAuthChallenge" {
    [Determine client role] as DAC1
    [Check user status] as DAC2
    [Set challenge type] as DAC3
    [Handle retry logic] as DAC4
  }
  
  package "CreateAuthChallenge" {
    [Generate secure OTP] as CAC1
    [Send WhatsApp message] as CAC2
    [Store OTP securely] as CAC3
    [Handle errors] as CAC4
  }
  
  package "VerifyAuthChallenge" {
    [Validate OTP format] as VAC1
    [Check OTP expiry] as VAC2
    [Compare OTP values] as VAC3
    [Update user status] as VAC4
  }
  
  package "PostConfirmation" {
    [Update custom attributes] as PC1
    [Set verification flags] as PC2
    [Complete setup] as PC3
  }
}

package "External Dependencies" {
  [AWS Cognito Client] as CognitoClient
  [SendZen WhatsApp API] as SendZenAPI
  [Utility Functions] as Utils
}

PS1 --> PS2
PS2 --> PS3

DAC1 --> DAC2
DAC2 --> DAC3
DAC3 --> DAC4

CAC1 --> CAC2
CAC2 --> CAC3
CAC3 --> CAC4

VAC1 --> VAC2
VAC2 --> VAC3
VAC3 --> VAC4

PC1 --> PC2
PC2 --> PC3

DAC1 --> CognitoClient
CAC2 --> SendZenAPI
VAC3 --> Utils
PC1 --> CognitoClient

@enduml
```

</details>

## Data Flow Diagram

![Data Flow Diagram](diagrams/WA_Only_Data_Flow.svg)

<details>
<summary>Click to expand PlantUML code</summary>

```plantuml
@startuml Data Flow

!theme aws-orange
title Data Flow

package "User Input" {
  [Phone Number] as Phone
  [Password] as Password
  [OTP Code] as OTP
}

package "Frontend Processing" {
  [Input Validation] as Validation
  [Data Formatting] as Formatting
  [State Management] as StateMgmt
}

package "AWS Cognito" {
  [User Pool] as UserPool
  [User Attributes] as UserAttributes
  [Authentication Sessions] as Sessions
  [JWT Tokens] as Tokens
}

package "Lambda Processing" {
  [OTP Generation] as OTPGeneration
  [WhatsApp Sending] as WhatsAppSend
  [OTP Verification] as Verification
  [Status Updates] as StatusUpdate
}

package "External Services" {
  [SendZen API] as SendZen
}

package "Storage" {
  [CloudWatch Logs] as CloudWatch
  [User Data] as UserData
}

Phone --> Validation
Password --> Validation
OTP --> Validation

Validation --> Formatting
Formatting --> StateMgmt
StateMgmt --> UserPool

UserPool --> UserAttributes
UserPool --> Sessions
UserPool --> Tokens

UserAttributes --> OTPGeneration
OTPGeneration --> WhatsAppSend
WhatsAppSend --> SendZen

Sessions --> Verification
Verification --> StatusUpdate
StatusUpdate --> UserData

OTPGeneration --> CloudWatch
WhatsAppSend --> CloudWatch
Verification --> CloudWatch
StatusUpdate --> CloudWatch

@enduml
```

</details>
