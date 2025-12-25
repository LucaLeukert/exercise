# Agent Instructions

This project uses **bd** (beads) for issue tracking. Run `bd onboard` to get started.

## Quick Reference

```bash
bd ready              # Find available work
bd show <id>          # View issue details
bd update <id> --status in_progress  # Claim work
bd close <id>         # Complete work
bd sync               # Sync with git
```

## Landing the Plane (Session Completion)

**When ending a work session**, you MUST complete ALL steps below. Work is NOT complete until `git push` succeeds.

**MANDATORY WORKFLOW:**

1. **File issues for remaining work** - Create issues for anything that needs follow-up
2. **Run quality gates** (if code changed) - Tests, linters, builds
3. **Update issue status** - Close finished work, update in-progress items
4. **PUSH TO REMOTE** - This is MANDATORY:
   ```bash
   git pull --rebase
   bd sync
   git push
   git status  # MUST show "up to date with origin"
   ```
5. **Clean up** - Clear stashes, prune remote branches
6. **Verify** - All changes committed AND pushed
7. **Hand off** - Provide context for next session

**CRITICAL RULES:**

- Work is NOT complete until `git push` succeeds
- NEVER stop before pushing - that leaves work stranded locally
- NEVER say "ready to push when you are" - YOU must push
- If push fails, resolve and retry until it succeeds

<!-- bv-agent-instructions-v1 -->

---

## Beads Workflow Integration

This project uses [beads_viewer](https://github.com/Dicklesworthstone/beads_viewer) for issue tracking. Issues are stored in `.beads/` and tracked in git.

### Essential Commands

```bash
# View issues (launches TUI - avoid in automated sessions)
bv

# CLI commands for agents (use these instead)
bd ready              # Show issues ready to work (no blockers)
bd list --status=open # All open issues
bd show <id>          # Full issue details with dependencies
bd create --title="..." --type=task --priority=2
bd update <id> --status=in_progress
bd close <id> --reason="Completed"
bd close <id1> <id2>  # Close multiple issues at once
bd sync               # Commit and push changes
```

### Workflow Pattern

1. **Start**: Run `bd ready` to find actionable work
2. **Claim**: Use `bd update <id> --status=in_progress`
3. **Work**: Implement the task
4. **Complete**: Use `bd close <id>`
5. **Sync**: Always run `bd sync` at session end

### Key Concepts

- **Dependencies**: Issues can block other issues. `bd ready` shows only unblocked work.
- **Priority**: P0=critical, P1=high, P2=medium, P3=low, P4=backlog (use numbers, not words)
- **Types**: task, bug, feature, epic, question, docs
- **Blocking**: `bd dep add <issue> <depends-on>` to add dependencies

### Session Protocol

**Before ending any session, run this checklist:**

```bash
git status              # Check what changed
git add <files>         # Stage code changes
bd sync                 # Commit beads changes
git commit -m "..."     # Commit code
bd sync                 # Commit any new beads changes
git push                # Push to remote
```

### Best Practices

- Check `bd ready` at session start to find available work
- Update status as you work (in_progress → closed)
- Create new issues with `bd create` when you discover tasks
- Use descriptive titles and set appropriate priority/type
- Always `bd sync` before ending session

<!-- end-bv-agent-instructions -->

---

## Technology Stack

### Core Technologies

- **React Native** (0.81.5) with **Expo** (^54.0.0) - Mobile app framework
- **Convex** (^1.31.0) - Backend-as-a-Service for database, queries, and mutations
- **Clerk** (@clerk/clerk-expo ^2.19.9) - Authentication and user management
- **TypeScript** (^5.9.2) - Type-safe development
- **Zustand** (^4.5.1) - State management
- **TanStack Query** (@tanstack/react-query ^5.90.12) - Data fetching and caching
- **neverthrow** (^8.2.0) - Functional error handling with Result types

### UI Library

This project uses a **custom UI component library** built on top of `@rn-primitives` with a comprehensive theme system.

#### Available Components

All components are exported from `@/ui` and support theming:

- **Alert** - Alert dialogs and notifications
- **Avatar** - User profile images
- **Badge** - Status badges and labels
- **Button** - Primary action buttons with variants
- **Card** - Container cards with header, content, footer
- **Checkbox** - Checkbox inputs
- **Dialog** - Modal dialogs with header, content, footer
- **Input** - Text input fields
- **Progress** - Progress indicators
- **Select** - Dropdown select components
- **Separator** - Visual dividers
- **Skeleton** - Loading placeholders (Skeleton, SkeletonText, SkeletonAvatar)
- **Switch** - Toggle switches
- **Tabs** - Tab navigation (Tabs, TabsList, TabsTrigger, TabsContent)
- **Text** - Themed text components

#### Theme System

The UI library includes a comprehensive theme system with:

- Light and dark themes
- Custom theme support
- Typography system (font sizes, weights, variants)
- Color system (primary, secondary, background, text, etc.)
- Spacing system
- Shadow system
- Border radius system

**Theme Hooks:**

- `useTheme()` - Access current theme and theme utilities
- `useThemeColor()` - Get theme colors
- `useThemeSpacing()` - Get theme spacing values
- `useThemeShadow()` - Get theme shadows

**Example:**

```tsx
import { Button, Card, Text, useTheme } from "@/ui";

function MyComponent() {
  const { theme, isDark } = useTheme();

  return (
    <Card>
      <Text style={{ color: theme.colors.primary }}>Hello World</Text>
      <Button variant="primary" size="md">
        Click Me
      </Button>
    </Card>
  );
}
```

---

## Error Handling with neverthrow

**CRITICAL**: This project **ALWAYS** uses `neverthrow` for error handling. Never use try/catch or throw errors directly. Always wrap async operations in Result types.

### Core Principle

All async operations that can fail must return a `Result<T, E>` type from neverthrow:

- ✅ `Result<T, E>` - Success contains `T`, error contains `E`
- ❌ Never use `try/catch` for error handling
- ❌ Never throw errors directly

### Utility Functions

The project provides utilities in `@/utils/result.ts`:

#### `wrapConvexMutation<T, E>`

Wraps Convex mutation calls into Result types.

```tsx
import { wrapConvexMutation } from "@/utils/result";
import { api } from "@/utils/convex";
import { useMutation } from "convex/react";

function MyComponent() {
  const createRoutine = useMutation(api.routines.create);

  const handleCreate = async () => {
    const result = await wrapConvexMutation(
      createRoutine,
      { name: "My Routine", exercises: [] },
      (error) => ({
        type: "mutation_error" as const,
        message: "Failed to create routine",
        originalError: error,
      }),
    );

    result.match(
      (routineId) => {
        // Success - handle success case
        console.log("Created routine:", routineId);
        router.push(`/routine/${routineId}`);
      },
      (error) => {
        // Error - handle error case
        console.error("Failed to create routine:", error);
        alert(error.message);
      },
    );
  };
}
```

#### `wrapConvexQuery<T, E>`

Wraps Convex query calls into Result types.

```tsx
import { wrapConvexQuery } from "@/utils/result";
import { api } from "@/utils/convex";
import { useQuery } from "convex/react";

function MyComponent() {
  const getRoutine = useQuery(api.routines.getById);

  const loadRoutine = async (id: string) => {
    const result = await wrapConvexQuery(getRoutine, { id }, (error) => ({
      type: "query_error" as const,
      message: "Failed to load routine",
      originalError: error,
    }));

    result.match(
      (routine) => {
        // Success
        setRoutine(routine);
      },
      (error) => {
        // Error
        console.error("Query failed:", error);
      },
    );
  };
}
```

#### `fromThrowable<T, E>`

Wraps any async function that may throw into a Result.

```tsx
import { fromThrowable } from "@/utils/result";

async function fetchUserData() {
  const response = await fetch("/api/user");
  if (!response.ok) throw new Error("Failed to fetch");
  return response.json();
}

const result = await fromThrowable(
  () => fetchUserData(),
  (error) => ({
    type: "fetch_error" as const,
    message: "Network request failed",
    originalError: error,
  }),
);

result.match(
  (data) => console.log("Success:", data),
  (error) => console.error("Error:", error),
);
```

#### `executeResult<T, E>`

Execute a Result with success/error callbacks.

```tsx
import { executeResult } from "@/utils/result";

executeResult(
  result,
  (value) => {
    // Success callback
    console.log("Success:", value);
  },
  (error) => {
    // Error callback
    console.error("Error:", error);
  },
);
```

#### `unwrapOr<T, E>`

Get value from Result or return default on error.

```tsx
import { unwrapOr } from "@/utils/result";

const routine = unwrapOr(result, null);
// Returns the value if success, or null if error
```

#### `unwrapOrThrow<T, E>`

Get value from Result or throw on error (use sparingly).

```tsx
import { unwrapOrThrow } from "@/utils/result";

try {
  const routine = unwrapOrThrow(result);
  // Only use this when you absolutely need to throw
} catch (error) {
  // Handle thrown error
}
```

### Complete Example: Creating a Routine

```tsx
import { useState } from "react";
import { Button, Card, Input, Text, useTheme } from "@/ui";
import { api } from "@/utils/convex";
import { wrapConvexMutation } from "@/utils/result";
import { useMutation } from "convex/react";
import { router } from "expo-router";

export default function CreateRoutinePage() {
  const { theme } = useTheme();
  const [name, setName] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const createRoutine = useMutation(api.routines.create);

  const handleCreate = async () => {
    if (!name.trim()) {
      alert("Please enter a routine name");
      return;
    }

    setIsCreating(true);

    const result = await wrapConvexMutation(
      createRoutine,
      {
        name: name.trim(),
        description: undefined,
        exercises: [],
      },
      (error) => ({
        type: "mutation_error" as const,
        message: "Failed to create routine",
        originalError: error,
      }),
    );

    result.match(
      (routineId) => {
        // Success
        alert("Routine created successfully!");
        router.back();
      },
      (error) => {
        // Error
        console.error("Failed to create routine:", error);
        alert(`Error: ${error.message}`);
        setIsCreating(false);
      },
    );
  };

  return (
    <Card>
      <Input value={name} onChangeText={setName} placeholder="Routine name" />
      <Button onPress={handleCreate} disabled={isCreating} variant="primary">
        {isCreating ? "Creating..." : "Create Routine"}
      </Button>
    </Card>
  );
}
```

### Best Practices

1. **Always use Result types** - Never use try/catch for async operations
2. **Use `.match()`** - Always handle both success and error cases
3. **Custom error types** - Define specific error types for better error handling
4. **Error mapping** - Use error mappers to normalize errors into your error types
5. **Never throw** - Only use `unwrapOrThrow` in exceptional cases where you need to throw

### Error Type Pattern

Define custom error types for better type safety:

```tsx
type AppError =
  | { type: "mutation_error"; message: string; originalError: unknown }
  | { type: "query_error"; message: string; originalError: unknown }
  | { type: "validation_error"; message: string; field: string }
  | { type: "network_error"; message: string; statusCode?: number };

const result = await wrapConvexMutation(
  mutation,
  args,
  (error): AppError => ({
    type: "mutation_error",
    message: "Operation failed",
    originalError: error,
  }),
);
```
