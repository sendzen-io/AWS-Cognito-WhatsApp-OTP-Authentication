# Backend Architecture Diagrams

This directory contains PlantUML diagrams that visualize the AWS Cognito WhatsApp OTP Authentication backend architecture and flow. These diagrams provide comprehensive visual documentation of the system's architecture, components, and authentication flows.

## Available Diagrams

### 1. **architecture-diagram.puml** - Complete Architecture Overview
- **Purpose**: Shows the complete backend architecture with all components
- **Includes**: 
  - User registration and login flows
  - All Lambda function interactions
  - SendZen API integration
  - Error handling and logging
  - Infrastructure components
  - Security measures and monitoring
- **Best for**: Understanding the complete system architecture
- **Use cases**: Architecture reviews, system design discussions, onboarding new developers
- **Key Components**:
  - AWS Cognito User Pool with custom authentication triggers
  - Lambda functions for authentication challenge handling
  - SendZen WhatsApp API integration
  - CloudWatch logging and monitoring
  - IAM roles and permissions
  - Error handling and retry mechanisms

### 2. **sequence-diagram.puml** - Authentication Flow Sequence
- **Purpose**: Shows the step-by-step authentication flow
- **Includes**:
  - Signup flow (user registration)
  - Login flow (user authentication)
  - OTP generation and verification
  - Error handling scenarios
  - Timing and order of operations
- **Best for**: Understanding the authentication process
- **Use cases**: Development planning, testing scenarios, troubleshooting
- **Key Flows**:
  - User registration with phone number and password
  - Auto-confirmation and custom attribute setting
  - OTP generation and WhatsApp delivery
  - OTP verification and account activation
  - Login flow with existing users
  - Token issuance and session management

### 3. **component-diagram.puml** - Infrastructure Components
- **Purpose**: Shows the AWS infrastructure components and their relationships
- **Includes**:
  - AWS Cognito User Pool and Client
  - Lambda functions and their purposes
  - CloudWatch logging
  - IAM permissions
  - External service integration
  - Security components
- **Best for**: Understanding the infrastructure setup
- **Use cases**: DevOps planning, infrastructure reviews, deployment planning
- **Key Components**:
  - Cognito User Pool with custom attributes
  - Lambda triggers (PreSignUp, DefineAuthChallenge, CreateAuthChallenge, VerifyAuthChallenge, PostConfirmation)
  - SendZen API integration
  - CloudWatch log groups
  - IAM roles and policies
  - Security and monitoring components

### 4. **deployment-diagram.puml** - Serverless Deployment Architecture
- **Purpose**: Shows the serverless deployment structure
- **Includes**:
  - AWS resources created by Serverless Framework
  - CloudFormation stack
  - Lambda function names
  - Log groups
  - IAM roles
  - Environment configuration
- **Best for**: Understanding the deployment structure
- **Use cases**: Deployment planning, infrastructure management, CI/CD setup
- **Key Components**:
  - Serverless Framework configuration
  - CloudFormation stack resources
  - Lambda function deployment
  - IAM role creation
  - CloudWatch log group setup
  - Environment variable configuration

## How to View These Diagrams

### 1. **GitHub/GitLab (Recommended)**
- **Automatic Rendering**: GitHub and GitLab automatically render PlantUML diagrams
- **Interactive Viewing**: Click on diagrams to view in full size
- **Version Control**: Diagrams are versioned with your code
- **Collaboration**: Easy sharing and collaboration with team members

### 2. **VS Code with Extensions**
```bash
# Install PlantUML extension
# Extension ID: jebbs.plantuml
```
- **Live Preview**: Real-time diagram preview while editing
- **Export Options**: Export to PNG, SVG, PDF formats
- **Syntax Highlighting**: PlantUML syntax highlighting
- **Error Detection**: Real-time error detection and validation

### 3. **Online PlantUML Viewer**
- **URL**: [PlantUML Online Server](http://www.plantuml.com/plantuml/uml/)
- **Usage**: Copy PlantUML source code and paste to view
- **Export**: Download diagrams in various formats
- **No Installation**: Works directly in your browser

### 4. **Local PlantUML Installation**
```bash
# Install PlantUML
npm install -g node-plantuml

# Generate PNG from PUML file
puml generate architecture-diagram.puml --png

# Generate SVG from PUML file
puml generate architecture-diagram.puml --svg
```

### 5. **Mermaid CLI (For Mermaid Diagrams)**
```bash
# Install Mermaid CLI
npm install -g @mermaid-js/mermaid-cli

# Generate diagram images
mmdc -i diagram.mmd -o diagram.png
mmdc -i diagram.mmd -o diagram.svg
```

## Auto-Generation Process

### How It Works
1. **Source Files**: PlantUML source files (`.puml`) are maintained in this directory
2. **GitHub Actions**: Automated workflow triggers on file changes
3. **Rendering**: PlantUML source files are rendered to SVG format
4. **Commit**: Rendered diagrams are automatically committed to the docs directory
5. **Documentation**: README files reference the rendered diagrams

### Workflow Details
- **Trigger**: Push to main branch or pull request
- **Environment**: GitHub Actions runner with PlantUML installed
- **Output**: SVG files with consistent naming convention
- **Validation**: Automatic validation of PlantUML syntax

## Diagram Descriptions

### Architecture Diagram Features
- **Complete Flow**: Shows both signup and login processes
- **Error Handling**: Includes error scenarios and retry logic
- **Infrastructure Notes**: Detailed configuration information
- **Component Relationships**: Shows how all components interact
- **Security Measures**: Authentication and authorization flows
- **Monitoring**: Logging and monitoring components
- **Scalability**: Auto-scaling and performance considerations

### Sequence Diagram Features
- **Step-by-Step Flow**: Clear sequence of operations
- **Decision Points**: Shows success/failure paths
- **External Interactions**: SendZen API integration
- **User Experience**: Shows user interactions
- **Timing**: Order and timing of operations
- **Error Scenarios**: Error handling and recovery paths
- **State Transitions**: Authentication state changes

### Component Diagram Features
- **AWS Services**: All AWS components used
- **External Services**: SendZen API integration
- **Client Application**: Frontend integration
- **Configuration Details**: Service-specific notes
- **Security Components**: Authentication and authorization
- **Monitoring**: Logging and monitoring setup
- **Data Flow**: How data moves through the system

### Deployment Diagram Features
- **Resource Names**: Actual AWS resource names
- **Deployment Flow**: How resources are created
- **Runtime Connections**: How components interact
- **Configuration Notes**: Service-specific settings
- **Environment Setup**: Development and production environments
- **CI/CD Pipeline**: Automated deployment process
- **Monitoring**: Deployment monitoring and alerting

## Diagram Usage Guidelines

### For Developers
- **Architecture Understanding**: Use architecture diagrams to understand system design
- **Flow Analysis**: Use sequence diagrams to understand authentication flows
- **Component Mapping**: Use component diagrams to understand infrastructure
- **Deployment Planning**: Use deployment diagrams for deployment planning

### For DevOps
- **Infrastructure Planning**: Use component and deployment diagrams for infrastructure setup
- **Monitoring Setup**: Use architecture diagrams to plan monitoring and logging
- **Security Configuration**: Use security diagrams to plan security measures
- **Environment Management**: Use deployment diagrams for environment management

### For Product Managers
- **User Experience**: Use sequence diagrams to understand user flows
- **Feature Planning**: Use architecture diagrams to plan new features
- **System Understanding**: Use component diagrams to understand system capabilities
- **Risk Assessment**: Use security diagrams to assess security risks

### For Stakeholders
- **System Overview**: Use architecture diagrams for high-level system understanding
- **Business Flow**: Use sequence diagrams to understand business processes
- **Infrastructure Investment**: Use component diagrams to understand infrastructure needs
- **Security Compliance**: Use security diagrams to understand security measures

## Customizing Diagrams

### Adding New Components
```plantuml
component [New Component] as NewComp {
    [Feature 1]
    [Feature 2]
}
```

### Adding New Connections
```plantuml
Component1 --> Component2 : Connection description
```

### Adding Notes
```plantuml
note right of Component
This is a note explaining
the component functionality
end note
```

## PlantUML Resources

- [PlantUML Documentation](https://plantuml.com/)
- [AWS Icons for PlantUML](https://github.com/awslabs/aws-icons-for-plantuml)
- [PlantUML Cheat Sheet](https://plantuml.com/guide)

## Usage Recommendations

1. **For Documentation**: Use architecture-diagram.puml in README files
2. **For Development**: Use sequence-diagram.puml to understand flows
3. **For DevOps**: Use deployment-diagram.puml for infrastructure understanding
4. **For Architecture Reviews**: Use component-diagram.puml for system design

## Updating Diagrams

When making changes to the backend:
1. Update the relevant `.puml` files
2. Regenerate diagrams using your preferred method
3. Update documentation that references these diagrams
4. Test diagrams render correctly in your documentation platform
