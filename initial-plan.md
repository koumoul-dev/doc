## doc previewer and exporter

We want to build a simple system to help previewing and rendering clean pdf docs from markdown files for professional needs of our company Koumoul.

References:
  - koumoul/docs (../docs) - that current project that manages this need for our organization
  - slidev (https://github.com/slidevjs/slidev) - the best target in term of functionality and technology, but targetted for slides while we want A4 documents
  - md-a4 (https://github.com/ntua-el21661/md-a4) - a small project that fixed the specific problem of previewing the rendering of documents in pages

We want the ease of use of slidev in single file mode, its tech stack, its markdown-centric functionalities with common extensions like mermaid and future extensibility.

We want the metadata, title page, TOC page and theme from koumoul/docs.

We want a preview that renders pages one after another to simulate end print result but with livereload.

We want a small skill that tells agents how to efficiently edit the markdown files.

The project can bundle the Koumoul theme but with a clear separation so that we can create 2 separate distributions afterward if we want to generalize the tool.

We want a clean minimal code base with well chosen dependencies.