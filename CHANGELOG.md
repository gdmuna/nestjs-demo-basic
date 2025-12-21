# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
