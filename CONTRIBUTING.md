# Contributing to AnySound Plugin

Thank you for your interest in contributing to AnySound Plugin! This document provides guidelines for contributing to this project.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Making Changes](#making-changes)
- [Coding Standards](#coding-standards)
- [Commit Messages](#commit-messages)
- [Pull Request Process](#pull-request-process)
- [Reporting Bugs](#reporting-bugs)
- [Suggesting Features](#suggesting-features)

## Code of Conduct

By participating in this project, you agree to:
- Be respectful and considerate
- Welcome newcomers and be patient with questions
- Focus on what is best for the community
- Show empathy towards other community members

## Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/AnyAudioPlugin.git
   cd AnyAudioPlugin
   ```
3. **Add upstream remote**:
   ```bash
   git remote add upstream https://github.com/moraesdev/AnyAudioPlugin.git
   ```

## Development Setup

### Prerequisites

- macOS 10.11 or later
- Node.js 14+ and npm 6+
- Hammerspoon installed (`brew install --cask hammerspoon`)
- Ulanzi Deck software installed

### Install Dependencies

```bash
npm install
```

### Build the Plugin

```bash
# Development build with watch mode
npm run dev

# Production build
npm run build
```

### Install Plugin for Testing

```bash
# Copy to Ulanzi plugins directory
cp -r . "$HOME/Library/Application Support/Ulanzi/UlanziDeck/Plugins/com.moraes.anysound.ulanziPlugin/"

# Restart Ulanzi Studio
```

## Making Changes

### Branch Naming

Use descriptive branch names:
- `feature/add-volume-control` - New features
- `fix/icon-not-updating` - Bug fixes
- `docs/update-readme` - Documentation updates
- `refactor/audio-api` - Code refactoring

### Create a Branch

```bash
git checkout -b feature/your-feature-name
```

### Make Your Changes

1. Write clean, readable code
2. Follow existing code style
3. Add comments where necessary
4. Update documentation if needed

### Test Your Changes

1. Build the plugin: `npm run build`
2. Copy to Ulanzi plugins directory
3. Restart Ulanzi Studio
4. Test all affected functionality
5. Check for console errors

## Coding Standards

### JavaScript Style

- Use **2 spaces** for indentation
- Use **single quotes** for strings
- Use **camelCase** for variables and functions
- Use **PascalCase** for classes
- Use **UPPER_SNAKE_CASE** for constants
- Add semicolons at end of statements
- Use `const` by default, `let` when needed, avoid `var`

### File Organization

```
plugin/
├── actions/
│   ├── audioapi.js      # Core API (singleton)
│   ├── inputdevice.js   # Input device action
│   └── outputdevice.js  # Output device action
```

### Example Code Style

```javascript
// Good
const AudioAPI = {
  async listInputDevices() {
    try {
      const result = await this._executeHammerspoon('...')
      return result
    } catch (error) {
      console.error('Failed to list input devices:', error)
      return []
    }
  }
}

// Bad
var AudioAPI={
  listInputDevices:function(){
    var result=this._executeHammerspoon("...")
    return result
  }
}
```

## Commit Messages

Follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

### Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, no logic change)
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

### Examples

```bash
feat(input): add volume control to input device action

- Add volume slider to Property Inspector
- Implement volume change via Hammerspoon API
- Update icon to show volume level

Closes #42
```

```bash
fix(output): prevent redundant device switches

Skip API call when selected device is already active.
This reduces unnecessary system calls and improves performance.

Fixes #38
```

## Pull Request Process

1. **Update your branch** with latest upstream:
   ```bash
   git fetch upstream
   git rebase upstream/main
   ```

2. **Push to your fork**:
   ```bash
   git push origin feature/your-feature-name
   ```

3. **Create Pull Request** on GitHub with:
   - Clear title following commit message format
   - Description of changes made
   - Screenshots/videos if UI changes
   - Reference to related issues
   - Checklist of testing done

4. **PR Template**:
   ```markdown
   ## Description
   Brief description of what this PR does.

   ## Changes Made
   - Change 1
   - Change 2

   ## Testing Done
   - [ ] Tested on macOS 13 Ventura
   - [ ] Tested with multiple audio devices
   - [ ] No console errors
   - [ ] Build succeeds

   ## Related Issues
   Closes #42, Fixes #38

   ## Screenshots
   (if applicable)
   ```

5. **Address Review Comments**:
   - Make requested changes
   - Push updates to same branch
   - Reply to comments when done

6. **Merge Approval**:
   - Requires at least 1 approval
   - All checks must pass
   - No merge conflicts

## Reporting Bugs

### Before Submitting

1. **Check existing issues** - Bug might already be reported
2. **Update to latest version** - Bug might already be fixed
3. **Reproduce the bug** - Ensure it's consistent

### Bug Report Template

```markdown
**Describe the Bug**
Clear description of what the bug is.

**To Reproduce**
Steps to reproduce:
1. Go to '...'
2. Click on '...'
3. See error

**Expected Behavior**
What you expected to happen.

**Actual Behavior**
What actually happened.

**Screenshots**
If applicable, add screenshots.

**Environment**
- macOS Version: [e.g., 13.0 Ventura]
- Ulanzi Deck Version: [e.g., 1.0.5]
- Plugin Version: [e.g., 1.0.0]
- Hammerspoon Version: [e.g., 0.9.100]

**Console Logs**
Paste relevant console output or logs.

**Additional Context**
Any other relevant information.
```

## Suggesting Features

### Before Submitting

1. **Check existing feature requests** - Might already be suggested
2. **Check roadmap** - Feature might be planned
3. **Consider scope** - Does it fit the plugin's purpose?

### Feature Request Template

```markdown
**Is your feature related to a problem?**
Clear description of the problem. Ex: I'm always frustrated when [...]

**Describe the solution you'd like**
Clear description of what you want to happen.

**Describe alternatives you've considered**
Other solutions or features you've considered.

**Use Case**
How would this feature be used? Provide examples.

**Additional Context**
Add any other context, screenshots, or mockups.
```

## Questions?

If you have questions about contributing, feel free to:
- Open an issue with the `question` label
- Contact maintainers via email
- Join our community discussions

---

Thank you for contributing to AnySound Plugin! 🎉
