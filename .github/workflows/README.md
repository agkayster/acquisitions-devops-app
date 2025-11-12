# CI/CD Workflows Documentation

This directory contains GitHub Actions workflows for the Acquisitions DevOps App. The CI/CD pipeline includes code quality checks, testing, and Docker image building and publishing.

## 🔄 Workflows Overview

### 1. Lint and Format (`lint-and-format.yml`)

**Triggers:**

- Push to `main` and `staging` branches
- Pull requests to `main` and `staging` branches

**Purpose:** Ensures code quality and consistent formatting across the codebase.

**Features:**

- ✅ Node.js 20.x with npm caching
- ✅ ESLint code quality checks
- ✅ Prettier formatting validation
- ✅ Clear annotations for issues found
- ✅ Auto-fix suggestions in workflow summary
- ✅ Fails workflow if issues are detected

**Environment:**

- Node.js 20.x
- Ubuntu Latest
- NPM package caching enabled

---

### 2. Tests (`tests.yml`)

**Triggers:**

- Push to `main` and `staging` branches
- Pull requests to `main` and `staging` branches

**Purpose:** Runs comprehensive tests with coverage reporting and database integration.

**Features:**

- ✅ Node.js 20.x with npm caching
- ✅ PostgreSQL 15 test database service
- ✅ Jest test runner with coverage
- ✅ Database migration support
- ✅ Coverage report artifacts (30-day retention)
- ✅ Detailed test result summaries
- ✅ Test failure annotations
- ✅ Environment variable configuration

**Environment Variables:**

```env
NODE_ENV=test
NODE_OPTIONS=--experimental-vm-modules
DATABASE_URL=postgres://test_user:test_password@localhost:5432/test_db
ARCJET_KEY=ajkey_test_key_for_ci
JWT_SECRET=test_jwt_secret_for_ci_testing_only
```

**Services:**

- PostgreSQL 15 Alpine with health checks
- Auto-configured test database

---

### 3. Docker Build and Push (`docker-build-and-push.yml`)

**Triggers:**

- Push to `main` branch
- Manual dispatch (`workflow_dispatch`)

**Purpose:** Builds and publishes production-ready Docker images to Docker Hub.

**Features:**

- ✅ Multi-platform builds (linux/amd64, linux/arm64)
- ✅ Docker Buildx configuration
- ✅ Docker Hub authentication
- ✅ Advanced metadata extraction
- ✅ Multiple tagging strategies
- ✅ Build caching for efficiency
- ✅ Comprehensive build summaries
- ✅ Security scanning recommendations

**Tags Generated:**

- `latest` (main branch only)
- `main` (branch name)
- `main-<short-sha>` (branch + commit)
- `prod-YYYYMMDD-HHmmss` (timestamp)
- Custom suffix (manual dispatch)

**Required Secrets:**

- `DOCKER_USERNAME` - Docker Hub username
- `DOCKER_PASSWORD` - Docker Hub password or access token

---

## 🚀 Setting Up CI/CD

### 1. Repository Secrets

Configure the following secrets in your GitHub repository settings:

```bash
# Docker Hub credentials
DOCKER_USERNAME=your-dockerhub-username
DOCKER_PASSWORD=your-dockerhub-password-or-token
```

### 2. Branch Protection Rules

Recommended branch protection for `main`:

- ✅ Require status checks to pass before merging
- ✅ Require branches to be up to date before merging
- ✅ Required status checks:
  - `Code Quality Check`
  - `Run Tests`
- ✅ Restrict pushes that create files
- ✅ Require pull request reviews

### 3. Workflow Dependencies

Ensure your project has:

```json
{
  "scripts": {
    "lint": "eslint .",
    "lint:fix": "eslint . --fix",
    "format": "prettier --write .",
    "format:check": "prettier --check .",
    "test": "NODE_OPTIONS=--experimental-vm-modules jest",
    "db:migrate": "drizzle-kit migrate"
  }
}
```

## 📊 Workflow Status and Monitoring

### Viewing Workflow Results

1. **GitHub Actions Tab:** View all workflow runs
2. **Pull Request Checks:** See status checks on PRs
3. **Commit Status:** View build status on commits
4. **Step Summaries:** Detailed results with actionable insights

### Artifact Downloads

- **Coverage Reports:** 30-day retention
- **Test Output:** Available for debugging
- **Build Logs:** Comprehensive build information

### Notifications

Configure notifications in GitHub Settings:

- Email notifications for failed workflows
- Slack/Teams integration for team updates
- Mobile notifications via GitHub app

## 🔧 Local Testing

### Running Checks Locally

Before pushing code, run checks locally:

```bash
# Code quality checks
npm run lint
npm run format:check

# Fix issues automatically
npm run lint:fix
npm run format

# Run tests
npm test

# Docker build test
docker build -t test-image --target production .
```

### Environment Setup

For local development matching CI environment:

```bash
# Install dependencies exactly as CI
npm ci

# Run tests with same environment
NODE_ENV=test NODE_OPTIONS=--experimental-vm-modules npm test

# Start PostgreSQL for integration tests
docker run -d --name test-postgres \
  -e POSTGRES_USER=test_user \
  -e POSTGRES_PASSWORD=test_password \
  -e POSTGRES_DB=test_db \
  -p 5432:5432 postgres:15-alpine
```

## 🐛 Troubleshooting

### Common Issues

1. **Lint Failures**

   ```bash
   # Fix automatically
   npm run lint:fix
   npm run format
   ```

2. **Test Failures**

   ```bash
   # Check database connection
   npm run db:migrate

   # Run specific test
   npm test -- --testNamePattern="test-name"
   ```

3. **Docker Build Failures**

   ```bash
   # Test build locally
   docker build --target production .

   # Check Dockerfile syntax
   docker build --dry-run .
   ```

4. **Permission Issues**

   ```bash
   # Verify Docker Hub credentials
   docker login

   # Check repository secrets
   # Settings > Secrets and variables > Actions
   ```

### Debug Mode

Enable debug logging in workflows:

```yaml
env:
  ACTIONS_STEP_DEBUG: true
  ACTIONS_RUNNER_DEBUG: true
```

## 📈 Performance Optimization

### Build Speed Improvements

- ✅ npm package caching enabled
- ✅ Docker layer caching configured
- ✅ Parallel job execution where possible
- ✅ Efficient artifact uploads

### Resource Usage

- **Lint & Format:** ~2-3 minutes
- **Tests:** ~3-5 minutes (with PostgreSQL)
- **Docker Build:** ~5-10 minutes (multi-platform)

### Cost Optimization

- Jobs only run on relevant branches
- Caching reduces build times
- Efficient artifact retention policies
- Optional security scanning

## 🔒 Security Considerations

### Secret Management

- Use repository secrets for sensitive data
- Never log secret values
- Rotate Docker Hub tokens regularly
- Use least-privilege access tokens

### Image Security

- Multi-stage Docker builds
- Non-root user execution
- Security scanning recommendations
- Regular base image updates

### Access Control

- Branch protection rules enforced
- Required status checks
- Review requirements for main branch
- Signed commits recommended

---

## 🎯 Next Steps

Consider these enhancements:

1. **Advanced Security**
   - Trivy vulnerability scanning
   - CodeQL security analysis
   - Dependency vulnerability checks

2. **Enhanced Testing**
   - E2E testing with Playwright
   - Performance testing
   - Visual regression testing

3. **Deployment Automation**
   - Kubernetes deployment
   - Blue-green deployments
   - Rollback capabilities

4. **Monitoring Integration**
   - Slack notifications
   - Datadog integration
   - Custom metrics collection

For questions or improvements, please create an issue or pull request.
