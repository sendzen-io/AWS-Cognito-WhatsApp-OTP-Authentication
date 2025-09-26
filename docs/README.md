# Documentation & System Diagrams

This directory contains comprehensive documentation and auto-generated system diagrams that visualize the AWS Cognito WhatsApp OTP Authentication system architecture, components, and flows.

## 📊 Available Diagrams

### WhatsApp Only Authentication

#### 1. **Architecture Diagram** (`whatsapp-only-architecture.svg`)
- **Purpose**: Complete system architecture overview
- **Shows**: 
  - User registration and login flows
  - All Lambda function interactions
  - SendZen API integration
  - Error handling and logging
  - Infrastructure components and relationships
- **Best for**: Understanding the complete system architecture
- **Use cases**: Architecture reviews, system design discussions, onboarding new developers

#### 2. **Sequence Diagram** (`whatsapp-only-sequence.svg`)
- **Purpose**: Step-by-step authentication flow visualization
- **Shows**:
  - Signup flow (user registration)
  - Login flow (user authentication)
  - OTP generation and verification
  - Error handling scenarios
  - Timing and order of operations
- **Best for**: Understanding the authentication process
- **Use cases**: Development planning, testing scenarios, troubleshooting

#### 3. **Component Diagram** (`whatsapp-only-components.svg`)
- **Purpose**: AWS infrastructure components and their relationships
- **Shows**:
  - AWS Cognito User Pool and Client
  - Lambda functions and their purposes
  - CloudWatch logging
  - IAM permissions
  - External service integration
- **Best for**: Understanding the infrastructure setup
- **Use cases**: DevOps planning, infrastructure reviews, deployment planning

#### 4. **Deployment Diagram** (`whatsapp-only-deployment.svg`)
- **Purpose**: Serverless deployment structure
- **Shows**:
  - AWS resources created by Serverless Framework
  - CloudFormation stack
  - Lambda function names
  - Log groups
  - IAM roles
- **Best for**: Understanding the deployment structure
- **Use cases**: Deployment planning, infrastructure management, CI/CD setup

### WhatsApp + Email Authentication

#### 1. **Architecture Diagram** (`whatsapp-email-architecture.svg`)
- **Purpose**: Complete dual-channel system architecture
- **Shows**:
  - Dual-client authentication flow
  - Email verification process
  - WhatsApp OTP verification
  - Client role system
  - Enhanced security measures
- **Best for**: Understanding the dual-channel authentication system
- **Use cases**: Enterprise architecture reviews, security discussions, system design

#### 2. **Sequence Diagram** (`whatsapp-email-sequence.svg`)
- **Purpose**: Dual-channel authentication flow sequence
- **Shows**:
  - Email-first verification flow
  - WhatsApp OTP verification
  - Client role determination
  - Multi-step verification process
  - Error handling and recovery
- **Best for**: Understanding the dual-channel authentication process
- **Use cases**: Development planning, testing scenarios, user experience design

#### 3. **Component Diagram** (`whatsapp-email-components.svg`)
- **Purpose**: Enhanced infrastructure components
- **Shows**:
  - Dual-client Cognito setup
  - Enhanced Lambda functions
  - Email service integration
  - Client role system
  - Security components
- **Best for**: Understanding the enhanced infrastructure
- **Use cases**: DevOps planning, security reviews, infrastructure optimization

#### 4. **Deployment Diagram** (`whatsapp-email-deployment.svg`)
- **Purpose**: Enhanced deployment structure
- **Shows**:
  - Multi-client deployment
  - Enhanced resource configuration
  - Security configurations
  - Monitoring setup
  - Environment separation
- **Best for**: Understanding the enhanced deployment
- **Use cases**: Deployment planning, environment management, security configuration

## 🖼️ How to View These Diagrams

### 1. **GitHub/GitLab (Recommended)**
- **Automatic Rendering**: GitHub and GitLab automatically render SVG diagrams
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
- **URL**: [PlantUML Online Server](https://editor.plantuml.com/)
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

## 🔄 Auto-Generation Process

### How It Works
1. **Source Files**: PlantUML source files (`.puml`) are maintained in backend directories
2. **GitHub Actions**: Automated workflow triggers on file changes
3. **Rendering**: PlantUML source files are rendered to SVG format
4. **Commit**: Rendered diagrams are automatically committed to this directory
5. **Documentation**: README files reference the rendered diagrams

### Source Files Location
- `whatsapp-only-authentication/nodejs-backend/*.puml`
- `whatsapp-email-authentication/nodejs-backend/*.puml`

### Workflow Details
- **Trigger**: Push to main branch or pull request
- **Environment**: GitHub Actions runner with PlantUML installed
- **Output**: SVG files with consistent naming convention
- **Validation**: Automatic validation of PlantUML syntax

## 📝 Contributing to Diagrams

### Updating Existing Diagrams
1. **Edit Source**: Modify the corresponding `.puml` file in the backend directory
2. **Test Locally**: Use PlantUML tools to preview changes
3. **Commit Changes**: Push changes to trigger auto-generation
4. **Verify Output**: Check that SVG files are updated correctly
5. **Update Documentation**: Update README files if needed

### Creating New Diagrams
1. **Create Source**: Add new `.puml` file in appropriate backend directory
2. **Follow Naming**: Use consistent naming convention
3. **Add to Workflow**: Update GitHub Actions workflow if needed
4. **Document**: Add diagram description to this README
5. **Reference**: Update relevant README files to reference new diagram

### Best Practices
- **Consistent Styling**: Use consistent colors, fonts, and layout
- **Clear Labels**: Use descriptive labels and annotations
- **Logical Flow**: Ensure diagrams follow logical flow and are easy to understand
- **Version Control**: Keep source files in version control
- **Documentation**: Always document what each diagram shows

## 🎯 Diagram Usage Guidelines

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

## 📚 Additional Resources

### PlantUML Resources
- [PlantUML Documentation](https://plantuml.com/)
- [AWS Icons for PlantUML](https://github.com/awslabs/aws-icons-for-plantuml)
- [PlantUML Cheat Sheet](https://plantuml.com/guide)
- [PlantUML Examples](https://real-world-plantuml.com/)

### Mermaid Resources
- [Mermaid Documentation](https://mermaid-js.github.io/mermaid/)
- [Mermaid Live Editor](https://mermaid.live/)
- [Mermaid Examples](https://mermaid-js.github.io/mermaid/#/examples)

### AWS Architecture Resources
- [AWS Architecture Icons](https://aws.amazon.com/architecture/icons/)
- [AWS Well-Architected Framework](https://aws.amazon.com/architecture/well-architected/)
- [AWS Architecture Center](https://aws.amazon.com/architecture/)

## 🔧 Troubleshooting

### Common Issues
1. **Diagrams Not Rendering**: Check PlantUML syntax and file format
2. **Missing Diagrams**: Verify source files exist and are properly named
3. **Outdated Diagrams**: Check if GitHub Actions workflow is running
4. **Syntax Errors**: Use PlantUML tools to validate syntax

### Debug Steps
1. **Check Source Files**: Verify `.puml` files exist and are valid
2. **Test Locally**: Use PlantUML tools to test rendering
3. **Check Workflow**: Verify GitHub Actions workflow is configured correctly
4. **Review Logs**: Check GitHub Actions logs for errors

## 📞 Support

For diagram-related issues:
- Check PlantUML documentation
- Review GitHub Actions workflow logs
- Test diagrams locally before committing
- Open an issue in the repository

---

**Note**: These diagrams are automatically generated and maintained. Always edit the source `.puml` files, not the rendered SVG files.
