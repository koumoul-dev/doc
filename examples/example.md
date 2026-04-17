---
title: Example Document
version: "1.0"
date: "2025-01-15"
description: This is an example document demonstrating @koumoul/doc features.
warning: This document is a draft and subject to change.
toc: true
tocLevels: 2
theme: koumoul
---

## Introduction

This is an example document for **@koumoul/doc**. It demonstrates the main features of the tool.

Jump to [Features](#features), [Custom Containers](#custom-containers) or the [Conclusion](#conclusion). Internal links use the heading's slug as anchor (e.g. `[Conclusion](#conclusion)`).

## Features

### Markdown Support

Standard markdown is fully supported:

- **Bold text** and *italic text*
- [Links](https://example.com)
- Inline `code` blocks

### Code Blocks

```javascript
function hello() {
  console.log('Hello from @koumoul/doc!')
}
```

```typescript
interface User {
  name: string
  email: string
}
```

### Tables

| Feature | Status |
|---------|--------|
| Markdown rendering | Done |
| A4 preview | Done |
| PDF export | Done |

### Custom Containers

:::info
This is an informational block with important details.
:::

:::tip
Here's a helpful tip for using the tool.
:::

:::warning
Be careful with this particular setting.
:::

:::danger
This action cannot be undone!
:::

### Images

![Logo de la société Koumoul](./logo.png)

### Diagrams

```mermaid
graph TD
    A[Markdown File] --> B[gray-matter]
    B --> C[Frontmatter]
    B --> D[Markdown Body]
    D --> E[markdown-it Pipeline]
    E --> F[HTML]
    F --> G[Vue App]
    G --> H[A4 Preview]
    G --> I[PDF Export]
```

```mermaid
xychart-beta
    title "Monthly Sales"
    x-axis [Jan, Feb, Mar, Apr, May, Jun]
    y-axis "Revenue (k€)" 0 --> 120
    bar [52, 68, 80, 95, 78, 110]
    line [50, 65, 75, 90, 82, 105]
```

## Included sub-documents

This section demonstrates the `@<path>` include directive. The subsection below (and its nested deep-dive) are spliced in from files under `./chapters/`. Each file's images are resolved relative to that file's own directory, so sub-docs remain self-contained and can be edited in isolation.

@./chapters/overview.md

---

## Conclusion

This document serves as both a test fixture and an example of what @koumoul/doc can produce. There is a page break just before it.
