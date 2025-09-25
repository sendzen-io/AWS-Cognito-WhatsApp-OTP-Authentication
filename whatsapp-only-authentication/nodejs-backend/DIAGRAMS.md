# Backend Architecture Diagrams

This directory contains PlantUML diagrams that visualize the AWS Cognito WhatsApp OTP Authentication backend architecture and flow.

## 📊 Available Diagrams

### 1. **architecture-diagram.puml** - Complete Architecture Overview
- **Purpose**: Shows the complete backend architecture with all components
- **Includes**: 
  - User registration and login flows
  - All Lambda function interactions
  - SendZen API integration
  - Error handling and logging
  - Infrastructure components
- **Best for**: Understanding the complete system architecture

### 2. **sequence-diagram.puml** - Authentication Flow Sequence
- **Purpose**: Shows the step-by-step authentication flow
- **Includes**:
  - Signup flow (user registration)
  - Login flow (user authentication)
  - OTP generation and verification
  - Error handling scenarios
- **Best for**: Understanding the authentication process

### 3. **component-diagram.puml** - Infrastructure Components
- **Purpose**: Shows the AWS infrastructure components and their relationships
- **Includes**:
  - AWS Cognito User Pool and Client
  - Lambda functions and their purposes
  - CloudWatch logging
  - IAM permissions
  - External service integration
- **Best for**: Understanding the infrastructure setup

### 4. **deployment-diagram.puml** - Serverless Deployment Architecture
- **Purpose**: Shows the serverless deployment structure
- **Includes**:
  - AWS resources created by Serverless Framework
  - CloudFormation stack
  - Lambda function names
  - Log groups
  - IAM roles
- **Best for**: Understanding the deployment structure

## 🛠 How to View These Diagrams

### Option 1: Online PlantUML Viewer
1. Copy the content of any `.puml` file
2. Go to [PlantUML Online Server](http://www.plantuml.com/plantuml/uml/)
3. Paste the content
4. View the generated diagram

### Option 2: VS Code Extension
1. Install "PlantUML" extension in VS Code
2. Open any `.puml` file
3. Press `Alt + D` to preview the diagram

### Option 3: Local PlantUML Installation
```bash
# Install PlantUML
npm install -g node-plantuml

# Generate PNG from PUML file
puml generate architecture-diagram.puml --png
```

### Option 4: GitHub Integration
- GitHub automatically renders PlantUML diagrams in `.md` files
- Include diagrams in README files for automatic rendering

## 📋 Diagram Descriptions

### Architecture Diagram Features
- **Complete Flow**: Shows both signup and login processes
- **Error Handling**: Includes error scenarios and retry logic
- **Infrastructure Notes**: Detailed configuration information
- **Component Relationships**: Shows how all components interact

### Sequence Diagram Features
- **Step-by-Step Flow**: Clear sequence of operations
- **Decision Points**: Shows success/failure paths
- **External Interactions**: SendZen API integration
- **User Experience**: Shows user interactions

### Component Diagram Features
- **AWS Services**: All AWS components used
- **External Services**: SendZen API integration
- **Client Application**: Frontend integration
- **Configuration Details**: Service-specific notes

### Deployment Diagram Features
- **Resource Names**: Actual AWS resource names
- **Deployment Flow**: How resources are created
- **Runtime Connections**: How components interact
- **Configuration Notes**: Service-specific settings

## 🔧 Customizing Diagrams

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

## 📚 PlantUML Resources

- [PlantUML Documentation](https://plantuml.com/)
- [AWS Icons for PlantUML](https://github.com/awslabs/aws-icons-for-plantuml)
- [PlantUML Cheat Sheet](https://plantuml.com/guide)

## 🎯 Usage Recommendations

1. **For Documentation**: Use architecture-diagram.puml in README files
2. **For Development**: Use sequence-diagram.puml to understand flows
3. **For DevOps**: Use deployment-diagram.puml for infrastructure understanding
4. **For Architecture Reviews**: Use component-diagram.puml for system design

## 🔄 Updating Diagrams

When making changes to the backend:
1. Update the relevant `.puml` files
2. Regenerate diagrams using your preferred method
3. Update documentation that references these diagrams
4. Test diagrams render correctly in your documentation platform
