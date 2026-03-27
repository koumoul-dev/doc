---
title: Example Document
version: "1.0"
date: "2025-01-15"
description: This is an example document demonstrating @koumoul/doc features.
warning: This document is a draft and subject to change.
toc: true
theme: koumoul
---

## Introduction

This is an example document for **@koumoul/doc**. It demonstrates the main features of the tool.

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

---

## Conclusion

This document serves as both a test fixture and an example of what @koumoul/doc can produce.
