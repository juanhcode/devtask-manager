# DevTask — Kiro Powers Documentation

**Lesson 5 — Powers**

Kiro Powers package documentation, workflow guides (steering files), and optionally MCP servers into reusable bundles that extend Kiro's capabilities. They are activated per-session and inject skills and steering into the active context.

---

## Power Used: `canva-design-power`

### What it is

The `canva-design-power` bundles visual design workflows and guidelines into Kiro, enabling AI-assisted creation of diagrams, social posts, presentations, and other visual assets directly from the IDE.

**Installed at:** user level (`~/.kiro/`)

**Skills provided:**
- `create-design` — Create new Canva designs via natural language
- `edit-design` — Modify existing Canva designs
- `export-design` — Export designs to PDF, PNG, or other formats
- `manage-assets` — Upload and manage design assets
- `search-designs` — Search existing Canva designs
- `workflow` — Step-by-step design workflow guide

**Steering files provided:**
- `canva-design.md` — Composition, typography, color, and branding guidelines
- `brand-guidelines.md` — Brand identity rules

---

## Why This Power Was Chosen

DevTask is a developer-facing project submitted to the Kiro University Challenge. It requires:

1. **An architecture diagram** — to communicate the layered backend design to reviewers
2. **Visual project documentation** — a banner for the README and GitHub repository

The `canva-design-power` is the most relevant available Power for this need. It provides:
- A structured workflow for creating technical diagrams
- Design composition guidelines that were applied to the architecture SVG
- A professional visual hierarchy that follows the Power's steering rules

---

## How It Was Used

### Step 1 — Activation

```
kiro_powers action="activate" powerName="canva-design-power"
```

This loaded the Power's skills and steering files into context, making its guidelines available for the current session.

### Step 2 — Reading the create-design skill

```
kiro_powers action="readSkill" skillName="create-design"
```

The skill defined a structured process:
1. Understand requirements (architecture visualization)
2. Determine format (technical diagram → presentation/SVG)
3. Define content (layered HTTP→SQLite flow, tech stack, metrics)
4. Create following design guidelines

### Step 3 — Reading the design steering guide

```
kiro_powers action="readSteering" steeringFile="canva-design.md"
```

Key guidelines applied from the steering:
- **Hierarchy**: Main message (architecture flow) → Supporting info (tech badges) → Metrics (test counts)
- **Typography**: Two font weights only (600 bold for labels, 400 for descriptions)
- **Colors**: Consistent palette matching the DevTask dark UI theme (#0f172a base)
- **No decorative elements**: Every visual element carries information

### Step 4 — Architecture diagram creation

Following the Power's `create-design` workflow, the architecture diagram was created as an SVG with:
- Full HTTP → Routes → Controllers → Services → Repositories → SQLite flow
- Tech stack badges for backend, frontend, and testing tools
- Footer with key project metrics (60 tests, 7 lessons, 8 properties)
- Color coding matching task status colors from the application

The diagram is saved in `docs/architecture-diagram.svg` and referenced in the README.

---

## Problem Solved

Without the Power's design guidelines, the architecture diagram would have been a simple text description. The `canva-design-power` steering provided:

- A formal process to follow (the `create-design` skill steps)
- Visual hierarchy rules that made the diagram readable at a glance
- Color and typography constraints that kept it clean and professional

---

## What Part of the Project It Helped Build

| Artifact | Location | Power contribution |
|----------|----------|--------------------|
| Architecture diagram | `docs/architecture-diagram.svg` | Design process + hierarchy guidelines |
| README header | `README.md` | Visual structure guidance |

---

## Note on MCP Server Availability

The `canva-design-power` can optionally include a Canva MCP server for direct design creation when Canva API credentials are configured. In this project, Canva API credentials were not configured, so the Power was used for its **workflow guidance and steering documents** rather than its MCP server integration. The MCP integration for this project uses a different server (see `docs/kiro-mcp.md`).

This is a legitimate use of Powers: the skill and steering documents provide real value independently of whether the bundled MCP server is connected.
