# devtask-quality-power

A Kiro Power that provides quality assurance workflows for the DevTask project.

## What It Does

This Power bundles three skills and a steering document for running quality checks, architecture reviews, and test coverage reports on the DevTask codebase.

## Skills

| Skill | Description |
|-------|-------------|
| `run-quality-checks` | Run typecheck + all tests in sequence, report pass/fail |
| `architecture-review` | Audit backend code against layered architecture rules |
| `test-coverage-report` | Run tests with coverage, map results to spec requirements |

## Resources

| Resource | Description |
|----------|-------------|
| `quality-checklist.md` | Pre-submission checklist covering TS, tests, security, Kiro, Docker, Git |

## Steering

The Power includes a steering file `quality-standards.md` with `inclusion: auto` — it activates automatically when quality-related tasks are triggered, injecting the project's quality thresholds and zero-tolerance rules into Kiro's context.

## Installation

To use this Power in the DevTask project:

1. Copy the `devtask-quality-power/` directory to your Kiro powers directory:
   ```bash
   cp -r kiro-power/devtask-quality-power ~/.kiro/powers/devtask-quality-power
   ```

2. Restart Kiro or reconnect from the Powers panel.

3. Activate the Power in a session:
   ```
   kiro_powers action="activate" powerName="devtask-quality-power"
   ```

4. Use a skill:
   ```
   kiro_powers action="readSkill" skillName="run-quality-checks"
   ```

## Structure

```
devtask-quality-power/
├── plugin.json                    # Power manifest
├── README.md                      # This file
├── skills/
│   ├── run-quality-checks.md      # Full quality suite workflow
│   ├── architecture-review.md     # Compliance audit workflow
│   └── test-coverage-report.md    # Coverage report workflow
├── resources/
│   └── quality-checklist.md       # Pre-submission checklist
└── .kiro/
    └── steering/
        └── quality-standards.md   # Auto-injected quality standards
```

## Publishing

To publish this Power as a GitHub repository:

1. Create a new public GitHub repository named `devtask-quality-power`
2. Copy the contents of this directory as the repository root
3. The `plugin.json` must be at the repository root
4. Submit to the Kiro Powers registry (see https://kiro.dev/powers)
