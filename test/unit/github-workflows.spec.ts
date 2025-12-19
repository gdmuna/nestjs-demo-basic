import { readFileSync } from 'fs';
import { join } from 'path';
import * as yaml from 'js-yaml';

describe('GitHub Actions Workflows Validation', () => {
    describe('ci-cd-dev.yml', () => {
        let workflowContent: string;
        let workflow: any;
        const workflowPath = join(process.cwd(), '.github/workflows/ci-cd-dev.yml');

        beforeAll(() => {
            workflowContent = readFileSync(workflowPath, 'utf8');
            workflow = yaml.load(workflowContent);
        });

        describe('File Structure', () => {
            it('should be valid YAML', () => {
                expect(() => yaml.load(workflowContent)).not.toThrow();
            });

            it('should have a name', () => {
                expect(workflow.name).toBe('CI/CD - Development');
            });

            it('should have on triggers defined', () => {
                expect(workflow.on).toBeDefined();
                expect(typeof workflow.on).toBe('object');
            });

            it('should have jobs defined', () => {
                expect(workflow.jobs).toBeDefined();
                expect(typeof workflow.jobs).toBe('object');
            });
        });

        describe('Workflow Triggers', () => {
            it('should trigger on push to dev branch', () => {
                expect(workflow.on.push).toBeDefined();
                expect(workflow.on.push.branches).toContain('dev');
            });

            it('should trigger on pull requests to dev branch', () => {
                expect(workflow.on.pull_request).toBeDefined();
                expect(workflow.on.pull_request.branches).toContain('dev');
            });

            it('should have correct PR trigger types', () => {
                const expectedTypes = ['opened', 'synchronize', 'reopened'];
                expect(workflow.on.pull_request.types).toEqual(expectedTypes);
            });

            it('should not trigger on other branches', () => {
                expect(workflow.on.push.branches).toHaveLength(1);
                expect(workflow.on.push.branches).not.toContain('main');
                expect(workflow.on.push.branches).not.toContain('master');
            });
        });

        describe('lint-and-test Job', () => {
            let lintAndTestJob: any;

            beforeAll(() => {
                lintAndTestJob = workflow.jobs['lint-and-test'];
            });

            it('should exist', () => {
                expect(lintAndTestJob).toBeDefined();
            });

            it('should have correct name', () => {
                expect(lintAndTestJob.name).toBe('Lint and test');
            });

            it('should run on ubuntu-latest', () => {
                expect(lintAndTestJob['runs-on']).toBe('ubuntu-latest');
            });

            it('should use development environment', () => {
                expect(lintAndTestJob.environment).toBe('development');
            });

            it('should output version', () => {
                expect(lintAndTestJob.outputs).toBeDefined();
                expect(lintAndTestJob.outputs.version).toBe('${{ steps.version.outputs.version }}');
            });

            it('should have steps defined', () => {
                expect(lintAndTestJob.steps).toBeDefined();
                expect(Array.isArray(lintAndTestJob.steps)).toBe(true);
                expect(lintAndTestJob.steps.length).toBeGreaterThan(0);
            });

            describe('Steps', () => {
                let steps: any[];

                beforeAll(() => {
                    steps = lintAndTestJob.steps;
                });

                it('should checkout code', () => {
                    const checkoutStep = steps.find((s) => s.name === 'Checkout');
                    expect(checkoutStep).toBeDefined();
                    expect(checkoutStep.uses).toBe('actions/checkout@v6');
                });

                it('should install pnpm', () => {
                    const pnpmStep = steps.find((s) => s.name === 'Install pnpm');
                    expect(pnpmStep).toBeDefined();
                    expect(pnpmStep.uses).toBe('pnpm/action-setup@v4');
                    expect(pnpmStep.with.version).toBe(10);
                });

                it('should setup Node.js', () => {
                    const nodeStep = steps.find((s) => s.name === 'Use Node.js');
                    expect(nodeStep).toBeDefined();
                    expect(nodeStep.uses).toBe('actions/setup-node@v6');
                    expect(nodeStep.with['node-version']).toBe(22);
                });

                it('should install dependencies', () => {
                    const installStep = steps.find((s) => s.name === 'Install dependencies');
                    expect(installStep).toBeDefined();
                    expect(installStep.run).toContain('pnpm install');
                });

                it('should extract version from package.json', () => {
                    const versionStep = steps.find(
                        (s) => s.name === 'Extract version from package.json',
                    );
                    expect(versionStep).toBeDefined();
                    expect(versionStep.id).toBe('version');
                    expect(versionStep.run).toContain('package.json');
                    expect(versionStep.run).toContain('GITHUB_OUTPUT');
                });

                it('should generate Prisma client with DATABASE_URL', () => {
                    const prismaStep = steps.find((s) => s.name === 'Generate Prisma Client');
                    expect(prismaStep).toBeDefined();
                    expect(prismaStep.env).toBeDefined();
                    expect(prismaStep.env.DATABASE_URL).toBe('${{ secrets.DATABASE_URL }}');
                    expect(prismaStep.run).toContain('pnpm prisma generate');
                });

                it('should format and lint code', () => {
                    const lintStep = steps.find((s) => s.name === 'Format & Lint code');
                    expect(lintStep).toBeDefined();
                    expect(lintStep.run).toContain('pnpm prettier --check');
                    expect(lintStep.run).toContain('pnpm eslint');
                });

                it('should run tests with coverage', () => {
                    const testStep = steps.find((s) => s.name === 'Run tests with coverage');
                    expect(testStep).toBeDefined();
                    expect(testStep.env).toBeDefined();
                    expect(testStep.env.DATABASE_URL).toBe('${{ secrets.DATABASE_URL }}');
                    expect(testStep.run).toContain('pnpm test --ci --coverage');
                });

                it('should upload coverage artifact', () => {
                    const uploadStep = steps.find((s) => s.name === 'Upload coverage artifact');
                    expect(uploadStep).toBeDefined();
                    expect(uploadStep.uses).toBe('actions/upload-artifact@v4');
                    expect(uploadStep.with.name).toBe('coverage-report-dev');
                    expect(uploadStep.with.path).toBe('coverage/');
                });

                it('should have steps in correct order', () => {
                    const stepNames = steps.map((s) => s.name);
                    const expectedOrder = [
                        'Checkout',
                        'Install pnpm',
                        'Use Node.js',
                        'Install dependencies',
                        'Extract version from package.json',
                        'Generate Prisma Client',
                        'Format & Lint code',
                        'Run tests with coverage',
                        'Upload coverage artifact',
                    ];
                    expect(stepNames).toEqual(expectedOrder);
                });
            });
        });

        describe('build-and-publish Job', () => {
            let buildJob: any;

            beforeAll(() => {
                buildJob = workflow.jobs['build-and-publish'];
            });

            it('should exist', () => {
                expect(buildJob).toBeDefined();
            });

            it('should have correct name', () => {
                expect(buildJob.name).toBe('Build and publish Docker image');
            });

            it('should depend on lint-and-test job', () => {
                expect(buildJob.needs).toBe('lint-and-test');
            });

            it('should only run on push events', () => {
                expect(buildJob.if).toBe("github.event_name == 'push'");
            });

            it('should run on ubuntu-latest', () => {
                expect(buildJob['runs-on']).toBe('ubuntu-latest');
            });

            it('should use development environment', () => {
                expect(buildJob.environment).toBe('development');
            });

            it('should have Docker environment variables', () => {
                expect(buildJob.env).toBeDefined();
                expect(buildJob.env.DOCKER_USERNAME).toBe(
                    '${{ vars.DOCKER_USERNAME || github.repository_owner }}',
                );
                expect(buildJob.env.DOCKER_REPO_NAME).toBe(
                    '${{ vars.DOCKER_REPO_NAME || github.event.repository.name }}',
                );
            });

            describe('Steps', () => {
                let steps: any[];

                beforeAll(() => {
                    steps = buildJob.steps;
                });

                it('should checkout code', () => {
                    const checkoutStep = steps.find((s) => s.name === 'Checkout');
                    expect(checkoutStep).toBeDefined();
                    expect(checkoutStep.uses).toBe('actions/checkout@v6');
                });

                it('should setup Docker buildx', () => {
                    const buildxStep = steps.find((s) => s.name === 'Set up Docker buildx');
                    expect(buildxStep).toBeDefined();
                    expect(buildxStep.uses).toBe('docker/setup-buildx-action@v3');
                });

                it('should login to Docker Hub', () => {
                    const loginStep = steps.find((s) => s.name === 'Login to Docker Hub');
                    expect(loginStep).toBeDefined();
                    expect(loginStep.uses).toBe('docker/login-action@v3');
                    expect(loginStep.with.username).toBe('${{ env.DOCKER_USERNAME }}');
                    expect(loginStep.with.password).toBe('${{ secrets.DOCKER_PASSWORD }}');
                });

                it('should build and push Docker image with correct tags', () => {
                    const buildStep = steps.find(
                        (s) => s.name === 'Build and push Docker image',
                    );
                    expect(buildStep).toBeDefined();
                    expect(buildStep.uses).toBe('docker/build-push-action@v5');
                    expect(buildStep.with.context).toBe('.');
                    expect(buildStep.with.push).toBe(true);

                    const tags = buildStep.with.tags.trim().split('\n');
                    expect(tags).toContain('${{ env.DOCKER_USERNAME }}/${{ env.DOCKER_REPO_NAME }}:dev');
                    expect(tags).toContain(
                        '${{ env.DOCKER_USERNAME }}/${{ env.DOCKER_REPO_NAME }}:dev-${{ github.sha }}',
                    );
                    expect(tags).toContain(
                        '${{ env.DOCKER_USERNAME }}/${{ env.DOCKER_REPO_NAME }}:dev-${{ needs.lint-and-test.outputs.version }}',
                    );
                });

                it('should pass build arguments', () => {
                    const buildStep = steps.find(
                        (s) => s.name === 'Build and push Docker image',
                    );
                    const buildArgs = buildStep.with['build-args'].trim().split('\n');
                    expect(buildArgs).toContain('GIT_COMMIT=${{ github.sha }}');
                    expect(buildArgs).toContain(
                        'APP_VERSION=${{ needs.lint-and-test.outputs.version }}',
                    );
                    expect(buildArgs).toContain('ENVIRONMENT=development');
                });
            });
        });

        describe('generate-summary Job', () => {
            let summaryJob: any;

            beforeAll(() => {
                summaryJob = workflow.jobs['generate-summary'];
            });

            it('should exist', () => {
                expect(summaryJob).toBeDefined();
            });

            it('should have correct name', () => {
                expect(summaryJob.name).toBe('Generate summary');
            });

            it('should depend on both previous jobs', () => {
                expect(summaryJob.needs).toBeDefined();
                expect(Array.isArray(summaryJob.needs)).toBe(true);
                expect(summaryJob.needs).toContain('lint-and-test');
                expect(summaryJob.needs).toContain('build-and-publish');
            });

            it('should always run', () => {
                expect(summaryJob.if).toBe('always()');
            });

            it('should run on ubuntu-latest', () => {
                expect(summaryJob['runs-on']).toBe('ubuntu-latest');
            });

            it('should use development environment', () => {
                expect(summaryJob.environment).toBe('development');
            });

            it('should have Docker environment variables', () => {
                expect(summaryJob.env).toBeDefined();
                expect(summaryJob.env.DOCKER_USERNAME).toBe(
                    '${{ vars.DOCKER_USERNAME || github.repository_owner }}',
                );
                expect(summaryJob.env.DOCKER_REPO_NAME).toBe(
                    '${{ vars.DOCKER_REPO_NAME || github.event.repository.name }}',
                );
            });

            it('should have generate summary step', () => {
                const summaryStep = summaryJob.steps.find((s: any) => s.name === 'Generate summary');
                expect(summaryStep).toBeDefined();
                expect(summaryStep.run).toBeDefined();
                expect(summaryStep.run).toContain('GITHUB_STEP_SUMMARY');
            });

            it('should generate timestamps in UTC and Asia/Shanghai', () => {
                const summaryStep = summaryJob.steps.find((s: any) => s.name === 'Generate summary');
                expect(summaryStep.run).toContain('TIMESTAMP_UTC');
                expect(summaryStep.run).toContain('TIMESTAMP_CN');
                expect(summaryStep.run).toContain("TZ='Asia/Shanghai'");
            });

            it('should handle job statuses', () => {
                const summaryStep = summaryJob.steps.find((s: any) => s.name === 'Generate summary');
                expect(summaryStep.run).toContain('needs.lint-and-test.result');
                expect(summaryStep.run).toContain('needs.build-and-publish.result');
                expect(summaryStep.run).toContain('LINT_TEST_STATUS');
                expect(summaryStep.run).toContain('BUILD_PUBLISH_STATUS');
            });

            it('should map status to icons', () => {
                const summaryStep = summaryJob.steps.find((s: any) => s.name === 'Generate summary');
                expect(summaryStep.run).toContain('success) LINT_ICON="✅"');
                expect(summaryStep.run).toContain('failure) LINT_ICON="❌"');
                expect(summaryStep.run).toContain('cancelled) LINT_ICON="🚫"');
                expect(summaryStep.run).toContain('skipped) LINT_ICON="⏭️"');
            });

            it('should differentiate between push and pull_request events', () => {
                const summaryStep = summaryJob.steps.find((s: any) => s.name === 'Generate summary');
                expect(summaryStep.run).toContain('github.event_name');
                expect(summaryStep.run).toContain('pull_request');
                expect(summaryStep.run).toContain('CI - Development Summary');
                expect(summaryStep.run).toContain('CI/CD - Development Summary');
            });

            it('should include Docker image information', () => {
                const summaryStep = summaryJob.steps.find((s: any) => s.name === 'Generate summary');
                expect(summaryStep.run).toContain('Docker 镜像');
                expect(summaryStep.run).toContain('hub.docker.com');
                expect(summaryStep.run).toContain(':dev');
            });
        });

        describe('Workflow Consistency', () => {
            it('should have exactly 3 jobs', () => {
                const jobKeys = Object.keys(workflow.jobs);
                expect(jobKeys).toHaveLength(3);
                expect(jobKeys).toContain('lint-and-test');
                expect(jobKeys).toContain('build-and-publish');
                expect(jobKeys).toContain('generate-summary');
            });

            it('should use consistent action versions', () => {
                const allSteps: any[] = [];
                Object.values(workflow.jobs).forEach((job: any) => {
                    if (job.steps) {
                        allSteps.push(...job.steps);
                    }
                });

                const checkoutSteps = allSteps.filter((s) => s.uses?.startsWith('actions/checkout@'));
                checkoutSteps.forEach((step) => {
                    expect(step.uses).toBe('actions/checkout@v6');
                });
            });

            it('should use development environment in all jobs', () => {
                Object.values(workflow.jobs).forEach((job: any) => {
                    expect(job.environment).toBe('development');
                });
            });
        });

        describe('Security Best Practices', () => {
            it('should use secrets for sensitive data', () => {
                expect(workflowContent).toContain('${{ secrets.DATABASE_URL }}');
                expect(workflowContent).toContain('${{ secrets.DOCKER_PASSWORD }}');
            });

            it('should not contain hardcoded credentials', () => {
                const sensitivePatterns = [
                    /password\s*[:=]\s*['"][^'"]+['"]/i,
                    /token\s*[:=]\s*['"][^'"]+['"]/i,
                    /api[_-]?key\s*[:=]\s*['"][^'"]+['"]/i,
                ];

                sensitivePatterns.forEach((pattern) => {
                    const matches = workflowContent.match(pattern);
                    const hasSecretReference = matches?.[0]?.includes('secrets.');
                    if (matches && !hasSecretReference) {
                        expect(matches).toBeNull();
                    }
                });
            });

            it('should use vars for configuration', () => {
                expect(workflowContent).toContain('${{ vars.DOCKER_USERNAME');
                expect(workflowContent).toContain('${{ vars.DOCKER_REPO_NAME');
            });
        });
    });

    describe('ci-cd-prod.yml', () => {
        let workflowContent: string;
        let workflow: any;
        const workflowPath = join(process.cwd(), '.github/workflows/ci-cd-prod.yml');

        beforeAll(() => {
            workflowContent = readFileSync(workflowPath, 'utf8');
            workflow = yaml.load(workflowContent);
        });

        describe('File Structure', () => {
            it('should be valid YAML', () => {
                expect(() => yaml.load(workflowContent)).not.toThrow();
            });

            it('should have a name', () => {
                expect(workflow.name).toBe('CI/CD - Production');
            });

            it('should have on triggers defined', () => {
                expect(workflow.on).toBeDefined();
                expect(typeof workflow.on).toBe('object');
            });

            it('should have jobs defined', () => {
                expect(workflow.jobs).toBeDefined();
                expect(typeof workflow.jobs).toBe('object');
            });
        });

        describe('Workflow Triggers', () => {
            it('should trigger on push to main branch', () => {
                expect(workflow.on.push).toBeDefined();
                expect(workflow.on.push.branches).toContain('main');
            });

            it('should trigger on pull requests to main branch', () => {
                expect(workflow.on.pull_request).toBeDefined();
                expect(workflow.on.pull_request.branches).toContain('main');
            });

            it('should have correct PR trigger types', () => {
                const expectedTypes = ['opened', 'synchronize', 'reopened'];
                expect(workflow.on.pull_request.types).toEqual(expectedTypes);
            });

            it('should not trigger on dev branch', () => {
                expect(workflow.on.push.branches).toHaveLength(1);
                expect(workflow.on.push.branches).not.toContain('dev');
            });
        });

        describe('lint-and-test Job', () => {
            let lintAndTestJob: any;

            beforeAll(() => {
                lintAndTestJob = workflow.jobs['lint-and-test'];
            });

            it('should exist', () => {
                expect(lintAndTestJob).toBeDefined();
            });

            it('should use production environment', () => {
                expect(lintAndTestJob.environment).toBe('production');
            });

            it('should have Docker environment variables at job level', () => {
                expect(lintAndTestJob.env).toBeDefined();
                expect(lintAndTestJob.env.DOCKER_USERNAME).toBe(
                    '${{ vars.DOCKER_USERNAME || github.repository_owner }}',
                );
                expect(lintAndTestJob.env.DOCKER_REPO_NAME).toBe(
                    '${{ vars.DOCKER_REPO_NAME || github.event.repository.name }}',
                );
            });

            it('should have all required steps', () => {
                const stepNames = lintAndTestJob.steps.map((s: any) => s.name);
                expect(stepNames).toContain('Checkout');
                expect(stepNames).toContain('Install pnpm');
                expect(stepNames).toContain('Use Node.js');
                expect(stepNames).toContain('Install dependencies');
                expect(stepNames).toContain('Extract version from package.json');
                expect(stepNames).toContain('Generate Prisma Client');
                expect(stepNames).toContain('Format & Lint code');
                expect(stepNames).toContain('Run tests with coverage');
                expect(stepNames).toContain('Upload coverage artifact');
            });

            it('should upload coverage with prod identifier', () => {
                const uploadStep = lintAndTestJob.steps.find(
                    (s: any) => s.name === 'Upload coverage artifact',
                );
                expect(uploadStep.with.name).toBe('coverage-report-prod');
            });
        });

        describe('build-and-publish Job', () => {
            let buildJob: any;

            beforeAll(() => {
                buildJob = workflow.jobs['build-and-publish'];
            });

            it('should exist', () => {
                expect(buildJob).toBeDefined();
            });

            it('should use production environment', () => {
                expect(buildJob.environment).toBe('production');
            });

            it('should NOT have conditional execution (runs on all events)', () => {
                expect(buildJob.if).toBeUndefined();
            });

            it('should build and push with production tags', () => {
                const buildStep = buildJob.steps.find(
                    (s: any) => s.name === 'Build and push Docker image',
                );
                const tags = buildStep.with.tags.trim().split('\n');
                expect(tags).toContain(
                    '${{ env.DOCKER_USERNAME }}/${{ env.DOCKER_REPO_NAME }}:latest',
                );
                expect(tags).toContain(
                    '${{ env.DOCKER_USERNAME }}/${{ env.DOCKER_REPO_NAME }}:prod-${{ github.sha }}',
                );
                expect(tags).toContain(
                    '${{ env.DOCKER_USERNAME }}/${{ env.DOCKER_REPO_NAME }}:${{ needs.lint-and-test.outputs.version }}',
                );
            });

            it('should pass production build arguments', () => {
                const buildStep = buildJob.steps.find(
                    (s: any) => s.name === 'Build and push Docker image',
                );
                const buildArgs = buildStep.with['build-args'].trim().split('\n');
                expect(buildArgs).toContain('ENVIRONMENT=production');
            });
        });

        describe('generate-summary Job', () => {
            let summaryJob: any;

            beforeAll(() => {
                summaryJob = workflow.jobs['generate-summary'];
            });

            it('should exist', () => {
                expect(summaryJob).toBeDefined();
            });

            it('should use production environment', () => {
                expect(summaryJob.environment).toBe('production');
            });

            it('should generate production summary titles', () => {
                const summaryStep = summaryJob.steps.find((s: any) => s.name === 'Generate summary');
                expect(summaryStep.run).toContain('CI - Production Summary');
                expect(summaryStep.run).toContain('CI/CD - Production Summary');
            });

            it('should include production Docker tags in summary', () => {
                const summaryStep = summaryJob.steps.find((s: any) => s.name === 'Generate summary');
                expect(summaryStep.run).toContain(':prod');
                expect(summaryStep.run).toContain(':prod-');
            });

            it('should NOT include branch links in PR event info', () => {
                const summaryStep = summaryJob.steps.find((s: any) => s.name === 'Generate summary');
                const prEventInfo = summaryStep.run.match(
                    /if \[ "\$\{\{ github\.event_name \}\}" == "pull_request" \];[\s\S]*?else/,
                )?.[0];
                expect(prEventInfo).toBeDefined();
                // In prod workflow, PR event info doesn't have markdown links for source/target branches
                expect(prEventInfo).not.toContain('[${{ github.head_ref }}]');
            });
        });

        describe('Workflow Consistency', () => {
            it('should have exactly 3 jobs', () => {
                const jobKeys = Object.keys(workflow.jobs);
                expect(jobKeys).toHaveLength(3);
                expect(jobKeys).toContain('lint-and-test');
                expect(jobKeys).toContain('build-and-publish');
                expect(jobKeys).toContain('generate-summary');
            });

            it('should use production environment in all jobs', () => {
                Object.values(workflow.jobs).forEach((job: any) => {
                    expect(job.environment).toBe('production');
                });
            });

            it('should use same Node.js and pnpm versions as dev workflow', () => {
                const nodeStep = workflow.jobs['lint-and-test'].steps.find(
                    (s: any) => s.name === 'Use Node.js',
                );
                expect(nodeStep.with['node-version']).toBe(22);

                const pnpmStep = workflow.jobs['lint-and-test'].steps.find(
                    (s: any) => s.name === 'Install pnpm',
                );
                expect(pnpmStep.with.version).toBe(10);
            });
        });

        describe('Security Best Practices', () => {
            it('should use secrets for sensitive data', () => {
                expect(workflowContent).toContain('${{ secrets.DATABASE_URL }}');
                expect(workflowContent).toContain('${{ secrets.DOCKER_PASSWORD }}');
            });

            it('should not contain hardcoded credentials', () => {
                const sensitivePatterns = [
                    /password\s*[:=]\s*['"][^'"]+['"]/i,
                    /token\s*[:=]\s*['"][^'"]+['"]/i,
                    /api[_-]?key\s*[:=]\s*['"][^'"]+['"]/i,
                ];

                sensitivePatterns.forEach((pattern) => {
                    const matches = workflowContent.match(pattern);
                    const hasSecretReference = matches?.[0]?.includes('secrets.');
                    if (matches && !hasSecretReference) {
                        expect(matches).toBeNull();
                    }
                });
            });

            it('should use vars for configuration', () => {
                expect(workflowContent).toContain('${{ vars.DOCKER_USERNAME');
                expect(workflowContent).toContain('${{ vars.DOCKER_REPO_NAME');
            });
        });
    });

    describe('Cross-Workflow Comparisons', () => {
        let devWorkflow: any;
        let prodWorkflow: any;

        beforeAll(() => {
            const devPath = join(process.cwd(), '.github/workflows/ci-cd-dev.yml');
            const prodPath = join(process.cwd(), '.github/workflows/ci-cd-prod.yml');
            devWorkflow = yaml.load(readFileSync(devPath, 'utf8'));
            prodWorkflow = yaml.load(readFileSync(prodPath, 'utf8'));
        });

        it('should have different workflow names', () => {
            expect(devWorkflow.name).not.toBe(prodWorkflow.name);
            expect(devWorkflow.name).toContain('Development');
            expect(prodWorkflow.name).toContain('Production');
        });

        it('should trigger on different branches', () => {
            expect(devWorkflow.on.push.branches).toEqual(['dev']);
            expect(prodWorkflow.on.push.branches).toEqual(['main']);
        });

        it('should use different environments', () => {
            expect(devWorkflow.jobs['lint-and-test'].environment).toBe('development');
            expect(prodWorkflow.jobs['lint-and-test'].environment).toBe('production');
        });

        it('should use different Docker tags', () => {
            const devBuildStep = devWorkflow.jobs['build-and-publish'].steps.find(
                (s: any) => s.name === 'Build and push Docker image',
            );
            const prodBuildStep = prodWorkflow.jobs['build-and-publish'].steps.find(
                (s: any) => s.name === 'Build and push Docker image',
            );

            expect(devBuildStep.with.tags).toContain(':dev');
            expect(prodBuildStep.with.tags).toContain(':latest');
            expect(prodBuildStep.with.tags).toContain(':prod-');
        });

        it('should have different coverage artifact names', () => {
            const devUploadStep = devWorkflow.jobs['lint-and-test'].steps.find(
                (s: any) => s.name === 'Upload coverage artifact',
            );
            const prodUploadStep = prodWorkflow.jobs['lint-and-test'].steps.find(
                (s: any) => s.name === 'Upload coverage artifact',
            );

            expect(devUploadStep.with.name).toBe('coverage-report-dev');
            expect(prodUploadStep.with.name).toBe('coverage-report-prod');
        });

        it('dev workflow should conditionally publish, prod should always publish', () => {
            expect(devWorkflow.jobs['build-and-publish'].if).toBe("github.event_name == 'push'");
            expect(prodWorkflow.jobs['build-and-publish'].if).toBeUndefined();
        });

        it('should use same tool versions', () => {
            const devNodeVersion =
                devWorkflow.jobs['lint-and-test'].steps.find((s: any) => s.name === 'Use Node.js')
                    .with['node-version'];
            const prodNodeVersion =
                prodWorkflow.jobs['lint-and-test'].steps.find((s: any) => s.name === 'Use Node.js')
                    .with['node-version'];
            expect(devNodeVersion).toBe(prodNodeVersion);

            const devPnpmVersion =
                devWorkflow.jobs['lint-and-test'].steps.find((s: any) => s.name === 'Install pnpm')
                    .with.version;
            const prodPnpmVersion =
                prodWorkflow.jobs['lint-and-test'].steps.find((s: any) => s.name === 'Install pnpm')
                    .with.version;
            expect(devPnpmVersion).toBe(prodPnpmVersion);
        });

        it('should have same job structure', () => {
            const devJobs = Object.keys(devWorkflow.jobs).sort();
            const prodJobs = Object.keys(prodWorkflow.jobs).sort();
            expect(devJobs).toEqual(prodJobs);
        });

        it('should use consistent action versions', () => {
            const getActionVersions = (wf: any) => {
                const versions: { [key: string]: string[] } = {};
                Object.values(wf.jobs).forEach((job: any) => {
                    job.steps?.forEach((step: any) => {
                        if (step.uses) {
                            const [action] = step.uses.split('@');
                            if (!versions[action]) versions[action] = [];
                            versions[action].push(step.uses);
                        }
                    });
                });
                return versions;
            };

            const devVersions = getActionVersions(devWorkflow);
            const prodVersions = getActionVersions(prodWorkflow);

            Object.keys(devVersions).forEach((action) => {
                if (prodVersions[action]) {
                    const devUnique = [...new Set(devVersions[action])];
                    const prodUnique = [...new Set(prodVersions[action])];
                    expect(devUnique).toEqual(prodUnique);
                }
            });
        });

        it('should have same step order in lint-and-test job', () => {
            const devStepNames = devWorkflow.jobs['lint-and-test'].steps.map((s: any) => s.name);
            const prodStepNames = prodWorkflow.jobs['lint-and-test'].steps.map((s: any) => s.name);
            expect(devStepNames).toEqual(prodStepNames);
        });

        it('should both reference DATABASE_URL secret', () => {
            const devContent = readFileSync(
                join(process.cwd(), '.github/workflows/ci-cd-dev.yml'),
                'utf8',
            );
            const prodContent = readFileSync(
                join(process.cwd(), '.github/workflows/ci-cd-prod.yml'),
                'utf8',
            );

            expect(devContent).toContain('${{ secrets.DATABASE_URL }}');
            expect(prodContent).toContain('${{ secrets.DATABASE_URL }}');
        });
    });

    describe('Edge Cases and Error Handling', () => {
        it('should handle missing optional environment variables with defaults', () => {
            const devWorkflow = yaml.load(
                readFileSync(join(process.cwd(), '.github/workflows/ci-cd-dev.yml'), 'utf8'),
            );

            expect(devWorkflow.jobs['build-and-publish'].env.DOCKER_USERNAME).toContain('||');
            expect(devWorkflow.jobs['build-and-publish'].env.DOCKER_USERNAME).toContain(
                'github.repository_owner',
            );
        });

        it('should have always() condition for summary job to run on failures', () => {
            const devWorkflow = yaml.load(
                readFileSync(join(process.cwd(), '.github/workflows/ci-cd-dev.yml'), 'utf8'),
            );
            const prodWorkflow = yaml.load(
                readFileSync(join(process.cwd(), '.github/workflows/ci-cd-prod.yml'), 'utf8'),
            );

            expect(devWorkflow.jobs['generate-summary'].if).toBe('always()');
            expect(prodWorkflow.jobs['generate-summary'].if).toBe('always()');
        });

        it('should handle all possible job result states in summary', () => {
            const devWorkflow = yaml.load(
                readFileSync(join(process.cwd(), '.github/workflows/ci-cd-dev.yml'), 'utf8'),
            );
            const summaryStep = devWorkflow.jobs['generate-summary'].steps.find(
                (s: any) => s.name === 'Generate summary',
            );

            const statuses = ['success', 'failure', 'cancelled', 'skipped'];
            statuses.forEach((status) => {
                expect(summaryStep.run).toContain(`${status})`);
            });
        });
    });

    describe('Best Practices and Conventions', () => {
        it('workflows should use descriptive job names', () => {
            const devWorkflow = yaml.load(
                readFileSync(join(process.cwd(), '.github/workflows/ci-cd-dev.yml'), 'utf8'),
            );
            Object.values(devWorkflow.jobs).forEach((job: any) => {
                expect(job.name).toBeDefined();
                expect(job.name.length).toBeGreaterThan(5);
            });
        });

        it('workflows should use descriptive step names', () => {
            const devWorkflow = yaml.load(
                readFileSync(join(process.cwd(), '.github/workflows/ci-cd-dev.yml'), 'utf8'),
            );
            Object.values(devWorkflow.jobs).forEach((job: any) => {
                job.steps?.forEach((step: any) => {
                    expect(step.name).toBeDefined();
                    expect(step.name.length).toBeGreaterThan(3);
                });
            });
        });

        it('should use latest stable action versions', () => {
            const devWorkflow = yaml.load(
                readFileSync(join(process.cwd(), '.github/workflows/ci-cd-dev.yml'), 'utf8'),
            );

            const allActions: string[] = [];
            Object.values(devWorkflow.jobs).forEach((job: any) => {
                job.steps?.forEach((step: any) => {
                    if (step.uses) {
                        allActions.push(step.uses);
                    }
                });
            });

            allActions.forEach((action) => {
                // Ensure actions use specific versions, not 'latest' or branch names
                expect(action).toMatch(/@v\d+/);
            });
        });

        it('should not use deprecated GitHub Actions syntax', () => {
            const devContent = readFileSync(
                join(process.cwd(), '.github/workflows/ci-cd-dev.yml'),
                'utf8',
            );
            const prodContent = readFileSync(
                join(process.cwd(), '.github/workflows/ci-cd-prod.yml'),
                'utf8',
            );

            // Check for deprecated set-output command
            expect(devContent).not.toContain('::set-output');
            expect(prodContent).not.toContain('::set-output');
        });

        it('should use GITHUB_OUTPUT instead of deprecated set-output', () => {
            const devWorkflow = yaml.load(
                readFileSync(join(process.cwd(), '.github/workflows/ci-cd-dev.yml'), 'utf8'),
            );
            const versionStep = devWorkflow.jobs['lint-and-test'].steps.find(
                (s: any) => s.name === 'Extract version from package.json',
            );

            expect(versionStep.run).toContain('GITHUB_OUTPUT');
            expect(versionStep.run).not.toContain('::set-output');
        });
    });
});