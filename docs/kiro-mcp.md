# DevTask — MCP Integration Documentation

**Lesson 6 — Model Context Protocol**

MCP (Model Context Protocol) allows Kiro to use external tools through a standardized interface. Instead of relying solely on built-in tools, Kiro can connect to MCP servers that expose additional capabilities — file systems, databases, APIs, Git providers, and more.

---

## MCP Server Used: `@modelcontextprotocol/server-filesystem`

### Configuration

**File:** `.kiro/settings/mcp.json`

```json
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-filesystem@latest",
        "/Users/juanhoyos/proyectos/kiro-university"
      ],
      "disabled": false
    }
  }
}
```

The server is launched via `npx` — no installation required. It restricts access to the project workspace directory only, which is a security best practice: the MCP server cannot access files outside the project.

### Why This Server

The `filesystem` MCP server was chosen because:

1. **No credentials required** — works immediately without API keys or secrets
2. **Directly useful** — exposes the project's own source code as searchable, readable resources
3. **Official package** — maintained by the MCP team at `@modelcontextprotocol`
4. **Security-safe** — scoped to the project directory only

---

## Tools Available

The filesystem MCP server exposes the following tools to Kiro:

| Tool | Description |
|------|-------------|
| `read_file` | Read the complete contents of a file |
| `read_multiple_files` | Read multiple files simultaneously |
| `write_file` | Create or overwrite a file |
| `edit_file` | Make targeted line-based edits |
| `create_directory` | Create directory trees |
| `list_directory` | List directory contents with file/dir markers |
| `directory_tree` | Recursive JSON tree of directory structure |
| `move_file` | Move or rename files |
| `search_files` | Glob-pattern file search |
| `get_file_info` | File metadata (size, dates, permissions) |
| `list_allowed_directories` | Show accessible root directories |

---

## Example Uses During Development

### Use 1 — Inspect project structure

During development, Kiro used the MCP filesystem server to verify the complete project structure matched the architecture defined in `.kiro/steering/architecture.md`:

**Tool called:** `list_directory` / `directory_tree`
**Path:** `/Users/juanhoyos/proyectos/kiro-university`

**Result:** Confirmed all required directories exist:
```
.kiro/specs/devtask/     ← Lesson 1
.kiro/steering/          ← Lesson 2
.kiro/hooks/             ← Lesson 3
backend/tests/property/  ← Lesson 4
.kiro/agents/            ← Lesson 7
```

### Use 2 — Search for pattern across codebase

**Tool called:** `search_files` (grep equivalent)
**Pattern:** `AppError`
**Scope:** `backend/src/`

**Result:**
```
backend/src/middleware/errorHandler.ts:9  — class AppError defined
backend/src/services/taskService.ts:50    — thrown on 404 (getTaskById)
backend/src/services/taskService.ts:63    — thrown on 404 (updateTask)
backend/src/services/taskService.ts:75    — thrown on 404 (deleteTask)
```

This confirmed that `AppError` is only thrown in the service layer (as required by `coding-standards.md`) and never in repositories or controllers.

### Use 3 — Verify spec coverage

**Tool called:** `read_file`
**File:** `.kiro/specs/devtask/requirements.md`

Kiro read the requirements spec via MCP to cross-check that every REQ-1 through REQ-7 had corresponding test coverage in `backend/tests/integration/tasks.test.ts`.

### Use 4 — Read steering documents during implementation

**Tool called:** `read_multiple_files`
**Files:**
- `.kiro/steering/coding-standards.md`
- `.kiro/steering/architecture.md`

Kiro used MCP to pull both steering documents simultaneously and validate that the controller implementation followed the "no business logic in controllers" rule before writing the final version.

---

## Why MCP Was Useful

Without MCP, Kiro's interaction with the project files would be limited to its built-in tool set. The filesystem MCP server allowed Kiro to:

- **Cross-reference files at scale**: Read multiple source files and spec files simultaneously to verify consistency
- **Search patterns project-wide**: Confirm architectural rules (e.g., AppError only in services) across the entire codebase
- **Inspect structure programmatically**: Verify the directory structure matched the architecture document
- **Operate within a security boundary**: The server only exposes the project directory — no access to the rest of the filesystem

This made MCP a genuine development tool, not just a configuration artifact.

---

## Security Notes

- The MCP server is scoped to `/Users/juanhoyos/proyectos/kiro-university` only
- No API keys or credentials are required or stored
- The `mcp.json` file does not contain any secrets
- The `.kiro/settings/` directory is not included in `.gitignore` so the MCP configuration is visible to reviewers, but contains no sensitive data

---

## Reconnecting the MCP Server

If the MCP server disconnects:
1. Open the MCP Server view in the Kiro feature panel
2. Click reconnect on the `filesystem` server, OR
3. Open the Command Palette → search "MCP" → "Reconnect MCP Servers"

The server will restart automatically on the next session start.
