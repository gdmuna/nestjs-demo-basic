# GitHub Actions Workflows Test Suite

## Overview

This test suite provides comprehensive validation for the GitHub Actions CI/CD workflow configurations in this repository. It ensures that workflow files are syntactically correct, properly configured, secure, and consistent across environments.

## Files Under Test

- `.github/workflows/ci-cd-dev.yml` - Development environment CI/CD pipeline
- `.github/workflows/ci-cd-prod.yml` - Production environment CI/CD pipeline

## Test Suite Statistics

- **Total Test Cases**: 100
- **Lines of Code**: 910
- **Test Suites**: 14
- **Dependencies Added**: 2 (`js-yaml`, `@types/js-yaml`)

## Test Coverage

### 1. ci-cd-dev.yml Validation (50 tests)

#### File Structure (4 tests)
- YAML syntax validation
- Workflow name verification
- Trigger configuration presence
- Jobs definition structure

#### Workflow Triggers (4 tests)
- Push events on `dev` branch
- Pull request events on `dev` branch
- PR trigger types (opened, synchronize, reopened)
- Branch exclusion verification

#### lint-and-test Job (19 tests)
- Job name and configuration
- Ubuntu runner verification
- Development environment usage
- Version output configuration
- **9 Step Validations**:
  1. Code checkout (actions/checkout@v6)
  2. pnpm installation (v10)
  3. Node.js setup (v22)
  4. Dependencies installation
  5. Version extraction from package.json
  6. Prisma client generation
  7. Code formatting and linting
  8. Test execution with coverage
  9. Coverage artifact upload
- Step ordering verification

#### build-and-publish Job (11 tests)
- Job dependencies (needs lint-and-test)
- Conditional execution (push events only)
- Docker environment configuration
- Docker Steps validation
- Image build and push with correct tags
- Build arguments validation

#### generate-summary Job (12 tests)
- Multi-job dependencies
- Always-run condition (even on failures)
- Environment variables
- Summary generation script
- Timestamp handling (UTC + Asia/Shanghai)
- Job status mapping (success, failure, cancelled, skipped)
- Event type differentiation (push vs PR)
- Docker image information display

### 2. ci-cd-prod.yml Validation (24 tests)

Similar structure to dev workflow with production-specific checks:
- Triggers on `main` branch instead of `dev`
- Uses `production` environment
- No conditional execution on build job (always publishes)
- Different Docker tags
- Production-specific summary titles
- Coverage artifact named `coverage-report-prod`

### 3. Cross-Workflow Comparisons (13 tests)

#### Environment Differences
- Workflow names (Development vs Production)
- Branch triggers (dev vs main)
- Environment settings
- Docker tags

#### Consistency Checks
- Same job structure
- Identical tool versions (Node.js, pnpm)
- Same action versions
- Same step ordering in lint-and-test job
- Consistent secret references

### 4. Security & Best Practices (13 tests)

#### Security Validations
- No hardcoded credentials in workflow files
- Proper use of GitHub secrets
- Configuration via vars
- Fallback values for optional variables

#### Best Practices
- Descriptive job names
- Descriptive step names
- Specific action versions (not `latest`)
- No deprecated syntax
- Error handling in summary job

## Running the Tests

### Install Dependencies

```bash
pnpm install
```

### Run All Tests

```bash
pnpm test
```

### Run Only Workflow Tests

```bash
pnpm test github-workflows
```

### Run in Watch Mode

```bash
pnpm test:watch github-workflows
```

## Dependencies

### js-yaml
- **Version**: ^4.1.0
- **Purpose**: Parse and validate YAML files

### @types/js-yaml
- **Version**: ^4.0.9
- **Purpose**: TypeScript type definitions

## Benefits

1. **Prevent Configuration Errors**: Catch typos before deployment
2. **Enforce Standards**: Ensure best practices
3. **Maintain Consistency**: Verify alignment across environments
4. **Documentation**: Tests as living documentation
5. **Refactoring Safety**: Catch regressions
6. **Security Assurance**: Automated security checks

## License

Same as parent project (MIT)