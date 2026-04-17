### Overview (from `chapters/overview.md`)

This subsection lives in a file one folder down from the root document. The diagram below is referenced as `./diagram.svg` — that path is resolved relative to *this* file, not the root doc, and the preprocessor rewrites it so the served URL points inside `chapters/`.

![A diagram that lives in chapters/](./diagram.svg)

The next subsection is in turn spliced in from a file two folders deep:

@./deeper/deep-dive.md
