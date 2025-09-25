# Documentation

This directory contains auto-generated documentation and diagrams from PlantUML source files.

## 📊 Diagrams

### WhatsApp Only Authentication

- **Architecture Diagram**: `whatsapp-only-architecture.svg` - Complete system architecture
- **Sequence Diagram**: `whatsapp-only-sequence.svg` - Authentication flow sequence
- **Component Diagram**: `whatsapp-only-components.svg` - Infrastructure components
- **Deployment Diagram**: `whatsapp-only-deployment.svg` - Serverless deployment structure

### WhatsApp + Email Authentication

- **Architecture Diagram**: `whatsapp-email-architecture.svg` - Complete system architecture
- **Sequence Diagram**: `whatsapp-email-sequence.svg` - Authentication flow sequence
- **Component Diagram**: `whatsapp-email-components.svg` - Infrastructure components
- **Deployment Diagram**: `whatsapp-email-deployment.svg` - Serverless deployment structure

## 🔄 Auto-Generation

These diagrams are automatically generated from PlantUML source files (`.puml`) using GitHub Actions whenever the source files are updated.

### Source Files Location
- `whatsapp-only-authentication/nodejs-backend/*.puml`
- `whatsapp-email-authentication/nodejs-backend/*.puml`

### How It Works
1. Contributors edit PlantUML source files (`.puml`)
2. GitHub Actions automatically renders them to SVG format
3. Rendered diagrams are committed back to this directory
4. README files reference the rendered diagrams

## 📝 Contributing

To update diagrams:
1. Edit the corresponding `.puml` file in the backend directory
2. Commit your changes
3. GitHub Actions will automatically render and update the SVG files
4. The updated diagrams will appear in README files automatically
