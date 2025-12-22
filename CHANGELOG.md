# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.4.2] - 2025-12-23

### ⚡ CI/CD Improvements

#### PAT Token Support for Cross-Workflow Triggering

- **auto-tag-release.yaml enhancement**: Added support for Personal Access Token (PAT) to enable triggering cd-prod.yaml workflow
    - Added comprehensive documentation comment explaining GitHub Actions security limitation
    - Configured to use `PAT_TOKEN` from repository secrets (falls back to `GITHUB_TOKEN` if not configured)
    - Updated checkout step to use PAT token
    - Updated Git credentials configuration to use PAT token
    - **Context**: GitHub Actions default `GITHUB_TOKEN` cannot trigger other workflows when pushing tags/code (prevents infinite recursion)

### 📚 Documentation

#### PAT Configuration Guide

- **New documentation file**: Created `docs/github-pat-setup.md` with detailed PAT setup instructions
    - Step-by-step guide for creating Fine-grained Personal Access Token
    - Repository secrets configuration instructions
    - Security best practices and token management guidelines
    - Troubleshooting and FAQ section

- **README.md enhancement**: Added PAT configuration section in CI/CD workflow documentation
    - Added warning about GitHub Actions security limitation
    - Quick setup guide (3-minute configuration)
    - Impact explanation for unconfigured PAT scenarios
    - Link to detailed setup documentation

### 🔧 Technical Details

#### File Changes

```
3 files changed, 52 insertions(+), 2 deletions(-)
```

#### Modified Files

- `.github/workflows/auto-tag-release.yaml` (+19 lines)
- `README.md` (+33 lines)
- `package.json` (version bump: 0.4.1 → 0.4.2)

---

## [0.4.1] - 2025-12-23

### ⚡ CI/CD Improvements

#### Production Deployment Workflow Enhancement

- **cd-prod.yaml enhancement**: Added manual trigger capability with custom tag input
    - Added `workflow_dispatch` trigger allowing manual deployment
    - Added `tag` input parameter (e.g., v0.4.0) for specifying deployment target
    - Updated checkout step to support both automatic (tag push) and manual (workflow_dispatch) triggers
    - Enhanced tag extraction logic to handle both trigger types
    - **Use case**: Manual deployment when PAT is not configured or for emergency deployments

#### CI Workflow Database Testing Support

- **ci-prod.yaml enhancement**: Added PostgreSQL service container for testing
    - Configured PostgreSQL 18.1-alpine service container
    - Set up health checks for container readiness
    - Configured test database credentials via environment variables
    - Port mapping: 5432:5432 for localhost access
    - **Purpose**: Enable running tests that require database connections in CI environment

### 🔧 Technical Details

#### File Changes

```
3 files changed, 32 insertions(+), 2 deletions(-)
```

#### Modified Files

- `.github/workflows/cd-prod.yaml` (+14 lines)
- `.github/workflows/ci-prod.yaml` (+18 lines)
- `package.json` (version bump: 0.4.0 → 0.4.1)

---

## [0.4.0] - 2025-12-23

### 🔒 Security

#### Command Injection Vulnerability Fixes

- **version-utils.cjs command injection protection**: Replaced `execSync` with `execFileSync` to prevent shell injection
    - Added `validateVersionPrefixFormat()` function to strictly validate version prefix format (only allows `X.Y`)
    - Added `execGit()` function for safe git command execution
    - Fixed `getExistingTags()` unsafe shell command concatenation issue

#### Workflow Script Injection Protection

- **User input escaping**: Added escape handling for all user-controllable inputs in workflows
    - PR titles, branch names, commit messages are passed via environment variables instead of direct interpolation
    - Removed newlines and escaped backticks to prevent Markdown format corruption
    - Affected files: `auto-tag-release.yaml`, `pr-check-dev.yaml`, `pr-check-prod.yaml`, `ci-release.yaml`, `release-snapshot.yaml`

#### Variable Reference Standardization

- **Unified git command variable references**: All `git rev-list` commands in `auto-tag-release.yaml` now use quoted `TAG_NAME` variable (`"${TAG_NAME}"`)

### ⚡ CI/CD Improvements

#### Workflow Architecture Refactoring

- **Parallel job execution**: Refactored all workflows into independent parallel jobs for improved efficiency
    - `pr-check-dev.yaml`: Split into `lint-and-format` + `test`
    - `pr-check-prod.yaml`: Split into `lint-and-format` + `test` + `check-version` (conditional)
    - `ci-feature.yaml`: Split into `lint-and-format` + `test`
    - `ci-release.yaml`: Split into `lint-and-format` + `test` + `check-version`
    - `ci-cd-dev.yaml`: Split into `lint-and-format` + `test` + `build-and-publish`

#### Production CI/CD Separation

- **ci-cd-prod.yaml split**:
    - `ci-prod.yaml`: CI workflow (triggered on main branch push, lint + test only)
    - `cd-prod.yaml`: CD workflow (triggered on v\* tag, handles Docker build and publish)

#### Docker Image Tag Strategy Simplification

- **Tag count optimization**: Reduced from 5+ tags to 3 tags
    - Development: `dev-latest`, `dev-YYYYMMDD-hash`, version number
    - Production: `prod-latest`, `prod-YYYYMMDD-hash`, version number
- **Removed redundant tags**: Deleted `image-tag-version` output and related generation logic

#### Version Management Scripts

- **scripts/validate-version.cjs**: PR version validation script
    - Checks if package.json version matches release branch
    - Generates bilingual (CN/EN) validation result comments
    - Supports `BRANCH_NAME` environment variable parameter (prevents command injection)

- **scripts/validate-release-version.cjs**: Release branch version validation
    - Extracts release branch version prefix (e.g., `release-0.4` → `0.4`)
    - Validates package.json version follows `X.Y` format

- **scripts/generate-snapshot-info.cjs**: Snapshot version info generation
    - Replaces original bash script with JavaScript implementation
    - Outputs: version, sha7, timestamp, snapshot_tag, docker_image_snapshot_tag

- **scripts/create-release-tag.cjs**: Automatic release tag creation
    - Validates version number validity
    - Calculates next patch version
    - Creates tag (doesn't push, left to workflow)
    - Supports `RELEASE_BRANCH`/`BRANCH_NAME` environment variables

- **scripts/version-utils.cjs**: Version management utility library
    - `extractVersionPrefix()`: Extract and validate version prefix
    - `getExistingTags()`: Safely retrieve existing tag list
    - `calculateNextPatch()`: Calculate next patch number
    - `validatePackageVersion()`: Validate package.json version

#### PR Comment Optimization

- **Auto-cleanup old comments**: `pr-check-prod.yaml` automatically deletes old version check comments
    - Identified via HTML comment marker `<!-- version-check-comment -->`
    - Only deletes comments from `github-actions[bot]` to avoid accidental deletion

#### Other Improvements

- **Explicit Node.js version**: Added `setup-node` step to `release-snapshot.yaml` to ensure Node.js 22
- **Fixed syntax errors**: Removed redundant echo statements in `release-snapshot.yaml`
- **Workflow trigger optimization**: `auto-tag-release.yaml` removed command-line arguments, uses environment variables directly

### 📚 Documentation

#### Commitlint Cleanup

- **Removed Commitlint references**: Removed references to deleted tool from documentation
    - Updated `README.md`: Removed 5 Commitlint mentions
    - Updated `.github/copilot-instructions.md`: Removed Commitlint from tech stack
    - Note: Commit message conventions still recommended but no longer enforced via Git hooks

#### Project Description Enhancements

- **Updated core features**: Highlighted CI/CD workflows, version management capabilities

### 🗑️ Removed

#### Toolchain Simplification

- **Deleted Commitlint configuration**:
    - Deleted `commitlint.config.js`
    - Deleted `.husky/commit-msg` Git hook
    - Removed `@commitlint/cli` and `@commitlint/config-conventional` dependencies from `package.json`

### 📦 Dependencies

- Removed `@commitlint/cli` (v20.2.0)
- Removed `@commitlint/config-conventional` (v20.2.0)

### 🔧 Technical Details

#### File Change Statistics

```
21 files changed, 2358 insertions(+), 449 deletions(-)
```

#### Added Files

- `scripts/validate-version.cjs` (114 lines)
- `scripts/validate-release-version.cjs` (127 lines)
- `scripts/generate-snapshot-info.cjs` (85 lines)
- `scripts/create-release-tag.cjs` (88 lines)
- `scripts/version-utils.cjs` (185 lines)
- `.github/workflows/ci-prod.yaml` (148 lines)
- `.github/workflows/cd-prod.yaml` (105 lines)

#### Renamed Files

- `.github/workflows/ci-cd-prod.yaml` → `.github/workflows/cd-prod.yaml`

#### Deleted Files

- `commitlint.config.js`
- `.husky/commit-msg`

#### Modified Files (Major Changes)

- `.github/workflows/auto-tag-release.yaml` (+/-177 lines)
- `.github/workflows/pr-check-prod.yaml` (+/-193 lines)
- `.github/workflows/ci-release.yaml` (+/-128 lines)
- `.github/copilot-instructions.md` (+383 lines)
- `README.md` (+551 lines)

---

## [0.3.1] - 2025-12-21

### Changed

- Release version 0.3.1

## [0.3.0] - 2025-12-20

### Added

#### GitHub Actions Workflows

- **Auto Tag Release** (`auto-tag-release.yaml`): Automatically creates version tags when merging release branches to main
- **Release Snapshot** (`release-snapshot.yaml`): Publishes snapshot versions with timestamps for testing
- **CI Feature Branches** (`ci-feature.yaml`): Runs CI checks on feature branches
- **CI Release Branches** (`ci-release.yaml`): Validates release branches before merging

#### Code Quality & Standards

- **Commitlint**: Enforces commit message conventions
    - Added `@commitlint/cli` (v20.2.0)
    - Added `@commitlint/config-conventional` (v20.2.0)
    - Added `commitlint.config.js` with custom rules supporting: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `chore`, `revert`, `ci`, `build`, `release`
- **Commitizen**: Interactive commit message helper
    - Added `commitizen` (v4.3.1)
    - Added `cz-conventional-changelog` (v3.3.0)
    - Added `pnpm commit` command for guided commits
- **Husky Git Hook**: commit-msg hook validates commit messages before committing

### Changed

#### Workflow Files Renamed (`.yml` → `.yaml`)

- `ci-cd(dev).yml` → `ci-cd-dev.yaml` with improved formatting
- `ci-cd(prod).yml` → `ci-cd-prod.yaml` with improved formatting
- `PR-check(dev).yml` → `pr-check-dev.yaml`
- `PR-check(prod).yml` → `pr-check-prod.yaml`

#### Dependencies Updated

- **Prisma**: `7.1.0` → `7.2.0`
    - `@prisma/adapter-pg`: `7.1.0` → `7.2.0`
    - `@prisma/client`: `7.1.0` → `7.2.0`
    - `prisma`: `7.1.0` → `7.2.0`
- **ESLint & TypeScript**:
    - `@eslint/js`: `9.39.1` → `9.39.2`
    - `eslint`: `9.39.1` → `9.39.2`
- **Type Definitions**:
    - `@types/node`: `25.0.0` → `25.0.3`

#### Environment Variables

- **Database URL renamed**: `DATABASE_URL` → `DB_URL` across:
    - `.env.example`
    - `Dockerfile` (ARG parameter)
    - `prisma.config.ts`
    - `src/common/prisma.service.ts`

#### Editor Configuration

- **VS Code settings** (`.vscode/settings.json`):
    - Added YAML formatting config (2-space indentation)
    - Added JSON formatting config (2-space indentation)
    - Removed extra blank lines for cleaner formatting
    - Improved code organization

### Removed

- **Obsolete workflow**: Deleted `ci-cd.yml` (replaced by separate dev/prod workflows)

## [0.2.0] - 2025-12

### Added

- Initial CI/CD workflows for dev and prod environments
    - `ci-cd(dev).yml`: Development deployment workflow
    - `ci-cd(prod).yml`: Production deployment workflow
    - `PR-check(dev).yml`: Pull request validation for dev
    - `PR-check(prod).yml`: Pull request validation for prod
- Dockerfile for containerized deployment
- VS Code editor configuration
