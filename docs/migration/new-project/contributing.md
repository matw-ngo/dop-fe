# Contributing to DOP-FE

## Getting Started

### Development Setup
- **Prerequisites**: Node.js 18.17+ or 20+, npm 9+, Git 2.30+
- **Installation**: 
  ```bash
  git clone <repository-url>
  cd dop-fe
  npm install
  cp .env.example .env.local
  ```
- **Development Server**: 
  ```bash
  npm run dev  # Starts on http://localhost:3000
  ```

### Code Style
- **Formatting**: Biome 2.2.0 with 2-space indentation
- **Linting**: Biome with React and Next.js recommended rules
- **Import Organization**: Automatic organization enabled
- **File Naming**: kebab-case for files, PascalCase for components

### Testing Requirements
- **Unit Tests**: Vitest 3.2.4 with Storybook integration
- **E2E Tests**: Playwright 1.55.1 for browser automation
- **Coverage**: Aim for 80%+ coverage on new features
- **Test Commands**: 
  ```bash
  npm run test        # Run unit tests
  npm run test:e2e    # Run E2E tests
  npm run test:storybook # Run Storybook tests
  ```

### Documentation
- **Component Documentation**: Storybook stories for all UI components
- **API Documentation**: Auto-generated from OpenAPI schema
- **Code Comments**: JSDoc for complex functions
- **README Updates**: Update relevant documentation for new features

## Development Workflow

### Branch Strategy
- **Main Branch**: `main` - Production-ready code only
- **Development Branch**: `develop` - Integration branch for features
- **Feature Branches**: `feature/feature-name` - Isolated feature development
- **Hotfix Branches**: `hotfix/issue-description` - Critical fixes
- **Release Branches**: `release/version-number` - Release preparation

### Branch Naming Conventions
```bash
# Feature branches
feature/user-authentication
feature/flow-management
feature/ekyc-integration

# Bugfix branches
bugfix/login-validation-error
bugfix/form-submission-issue

# Hotfix branches
hotfix/security-vulnerability
hotfix/critical-bug-fix

# Release branches
release/v1.2.0
release/v1.2.1
```

### Commit Guidelines
- **Format**: Conventional Commits specification
- **Types**: feat, fix, docs, style, refactor, test, chore
- **Scope**: Component or module affected
- **Description**: Brief, imperative mood description

#### Commit Message Format
```
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

#### Commit Examples
```bash
feat(auth): add JWT token refresh mechanism
fix(form): resolve validation error on email field
docs(api): update authentication endpoints documentation
style(ui): fix button alignment in header
refactor(store): optimize state management performance
test(components): add unit tests for form components
chore(deps): update React to version 19.1.0
```

### Git Hooks Setup
- **Pre-commit**: Biome formatting and linting via lint-staged
- **Pre-push**: Optional test running (configured as needed)
- **Commit-msg**: Commit message validation (optional)
- **Installation**: Automatically set up with `npm run prepare`

#### Pre-commit Configuration
```json
// package.json
"lint-staged": {
  "*.{js,jsx,ts,tsx}": "npx @biomejs/biome format --write"
}
```

## Code Review Process

### Pull Request Template
```markdown
## Description
Brief description of changes and purpose

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests added/updated
- [ ] E2E tests added/updated
- [ ] Manual testing completed
- [ ] Storybook stories added/updated

## Checklist
- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] Tests passing locally
- [ ] No console errors/warnings
- [ ] Accessibility considered
- [ ] Performance impact assessed
```

### Review Checklist
- **Code Quality**: 
  - Follows Biome formatting standards
  - No linting errors or warnings
  - Proper TypeScript usage
  - Consistent naming conventions
  
- **Functionality**: 
  - Feature works as expected
  - Edge cases handled
  - Error states managed
  - Loading states implemented
  
- **Testing**: 
  - Adequate test coverage
  - Tests for critical paths
  - Mock data properly structured
  - E2E scenarios covered
  
- **Performance**: 
  - No unnecessary re-renders
  - Efficient state management
  - Optimized API calls
  - Bundle size impact considered
  
- **Security**: 
  - Input validation implemented
  - No sensitive data exposure
  - Proper authentication checks
  - XSS prevention measures

### Approval Process
- **Required Reviewers**: At least one team member
- **Approval Requirements**: 
  - Code quality approval
  - Functional testing approval
  - Documentation approval (if applicable)
- **Merge Requirements**: 
  - All checks passing
  - Required approvals received
  - No merge conflicts
  - Up-to-date with target branch

## Code Quality

### Linting and Formatting
- **Tool**: Biome 2.2.0
- **Configuration**: [`biome.json`](biome.json:1)
- **Rules**: 
  - Recommended rules enabled
  - React and Next.js specific rules
  - Suspicious rules with exceptions
- **Automatic Fixes**: 
  ```bash
  npm run format    # Auto-format code
  npm run lint      # Check for issues
  npm run lint:fix  # Auto-fix linting issues
  ```

#### Biome Configuration Highlights
```json
{
  "formatter": {
    "enabled": true,
    "indentStyle": "space",
    "indentWidth": 2
  },
  "linter": {
    "enabled": true,
    "rules": {
      "recommended": true,
      "suspicious": {
        "noUnknownAtRules": "off"
      }
    },
    "domains": {
      "next": "recommended",
      "react": "recommended"
    }
  },
  "assist": {
    "actions": {
      "source": {
        "organizeImports": "on"
      }
    }
  }
}
```

### Testing Standards
- **Unit Testing**: Vitest with React Testing Library
- **Component Testing**: Storybook with Vitest integration
- **E2E Testing**: Playwright for user flows
- **Coverage Requirements**: 
  - New features: 80%+ coverage
  - Critical paths: 90%+ coverage
  - Existing code: Maintain or improve coverage

#### Test Structure
```typescript
// Unit test example
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { MyComponent } from './MyComponent';

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(<MyComponent />);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });
  
  it('handles user interaction', async () => {
    const user = userEvent.setup();
    render(<MyComponent />);
    
    await user.click(screen.getByRole('button'));
    expect(screen.getByText('Clicked')).toBeInTheDocument();
  });
});
```

#### Storybook Testing
```typescript
// Storybook test example
import { composeStories } from '@storybook/react';
import * as stories from './MyComponent.stories';

const { Default, Interactive } = composeStories(stories);

describe('MyComponent Stories', () => {
  test('renders default story', async () => {
    const { container } = render(<Default />);
    expect(container).toBeInTheDocument();
  });
  
  test('handles interaction in interactive story', async () => {
    const { getByRole } = render(<Interactive />);
    const button = getByRole('button');
    
    await userEvent.click(button);
    expect(getByRole('button')).toHaveAttribute('aria-pressed', 'true');
  });
});
```

### Type Safety
- **TypeScript**: Strict mode enabled
- **Type Generation**: Auto-generated from OpenAPI schema
- **Custom Types**: Proper interfaces for all data structures
- **Generic Types**: Appropriate use of generics for reusable code

#### Type Safety Best Practices
```typescript
// Good practices
interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
}

// Generic utility type
type ApiResponse<T> = {
  data: T;
  status: number;
  message: string;
};

// Proper function typing
const fetchUser = async (id: string): Promise<ApiResponse<User>> => {
  // Implementation
};

// Avoid 'any' type
const processData = (data: unknown): ProcessedData => {
  // Type guard or validation
  if (isValidData(data)) {
    return transformData(data);
  }
  throw new Error('Invalid data format');
};
```

## Documentation

### Code Documentation
- **JSDoc Standards**: 
  ```javascript
  /**
   * Brief description of the function
   * @param {string} param1 - Description of parameter
   * @param {Object} param2 - Description of parameter
   * @returns {string} Description of return value
   * @example
   * const result = functionName('value', { option: true });
   */
  ```

- **Component Documentation**: 
  ```typescript
  interface ComponentProps {
    /** Primary content of the component */
    children: React.ReactNode;
    /** Variant style of the component */
    variant?: 'primary' | 'secondary';
    /** Callback when component is clicked */
    onClick?: () => void;
  }
  ```

### API Documentation
- **OpenAPI Specification**: [`src/lib/api/schema.yaml`](src/lib/api/schema.yaml:1)
- **Type Generation**: `npm run gen:api`
- **Documentation Updates**: Update schema before regenerating types

### README Updates
- **Installation**: Clear setup instructions
- **Usage**: Examples of common use cases
- **Configuration**: Environment variables and options
- **Contributing**: Link to this contributing guide

## Changelog

### Version Format
- **Semantic Versioning**: MAJOR.MINOR.PATCH
- **MAJOR**: Breaking changes
- **MINOR**: New features (backward compatible)
- **PATCH**: Bug fixes (backward compatible)

### Change Categories
- **Added**: New features
- **Changed**: Existing feature modifications
- **Deprecated**: Features marked for removal
- **Removed**: Features removed
- **Fixed**: Bug fixes
- **Security**: Security-related changes

### Release Notes Format
```markdown
# [1.2.0] - 2024-01-15

## Added
- User authentication system
- Flow management interface
- eKYC integration

## Changed
- Updated React to version 19.1.0
- Improved form validation

## Fixed
- Login redirect issue
- Form submission error handling

## Security
- Enhanced input validation
- Updated dependencies for security patches
```

## Development Tools

### IDE Setup
- **VS Code Extensions**: 
  - Biome (linting and formatting)
  - TypeScript Importer
  - Tailwind CSS IntelliSense
  - ES7+ React/Redux/React-Native snippets
  - Auto Rename Tag

- **VS Code Settings**: 
  ```json
  {
    "editor.formatOnSave": true,
    "editor.defaultFormatter": "biomejs.biome",
    "typescript.preferences.importModuleSpecifier": "relative",
    "emmet.includeLanguages": {
      "typescript": "html",
      "typescriptreact": "html"
    }
  }
  ```

### Debug Configuration
- **Development Server**: 
  ```json
  {
    "name": "Next.js: debug server-side",
    "type": "node-terminal",
    "request": "launch",
    "command": "npm run dev"
  }
  ```

- **Client-side**: 
  ```json
  {
    "name": "Next.js: debug client-side",
    "type": "chrome",
    "request": "launch",
    "url": "http://localhost:3000"
  }
  ```

### Performance Tools
- **Bundle Analysis**: 
  ```bash
  npm run build
  npx next-bundle-analyzer
  ```

- **React DevTools**: Component profiling and state inspection
- **Network Tab**: API request monitoring and optimization

## Troubleshooting

### Common Issues
- **Biome Formatting**: 
  ```bash
  # Check for issues
  npm run lint
  
  # Auto-fix issues
  npm run format
  
  # Reset Biome cache if needed
  rm -rf node_modules/.cache/biome
  ```

- **Test Failures**: 
  ```bash
  # Clear test cache
  rm -rf node_modules/.cache/vitest
  
  # Run tests in debug mode
  npm run test -- --debug
  ```

- **Build Issues**: 
  ```bash
  # Clear Next.js cache
  rm -rf .next
  
  # Clear node modules and reinstall
  rm -rf node_modules package-lock.json
  npm install
  ```

### Getting Help
- **Documentation**: Check existing docs in `/docs` directory
- **Issues**: Search existing GitHub issues
- **Discussions**: Use GitHub Discussions for questions
- **Team Contact**: Reach out to project maintainers

## Community Guidelines

### Code of Conduct
- **Respect**: Treat all contributors with respect
- **Inclusivity**: Welcome contributors from all backgrounds
- **Constructive Feedback**: Provide helpful, constructive feedback
- **Collaboration**: Work together to solve problems

### Communication Channels
- **GitHub Issues**: Bug reports and feature requests
- **GitHub Discussions**: General questions and ideas
- **Pull Requests**: Code contributions and reviews
- **Team Meetings**: Regular sync meetings (if applicable)

## Recognition

### Contributor Recognition
- **Contributors List**: Maintained in README.md
- **Release Notes**: Acknowledge significant contributions
- **Team Recognition**: Internal recognition for outstanding contributions

### First Contributions
- **Good First Issues**: Labeled for new contributors
- **Documentation**: Improving docs is a great way to start
- **Bug Fixes**: Fixing reported issues helps learn the codebase
- **Small Features**: Incremental improvements are welcome

Thank you for contributing to DOP-FE! Your contributions help make this project better for everyone.