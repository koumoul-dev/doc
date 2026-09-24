import type { DocOrientation } from './types.ts'

/** Margins in mm — matches the `.a4-page` padding, bottom includes the footer room */
const MARGINS_MM = { horizontal: 15, top: 15, bottom: 20.5 }

const PAGE_SIZES_MM: Record<DocOrientation, { width: number, height: number }> = {
  portrait: { width: 210, height: 297 },
  landscape: { width: 297, height: 210 }
}

/** Coerce a frontmatter value to a known orientation */
export function normalizeOrientation (value: unknown): DocOrientation {
  return value === 'landscape' ? 'landscape' : 'portrait'
}

/** Page and usable content dimensions for an orientation, in mm */
export function pageDimensionsMm (orientation: DocOrientation = 'portrait') {
  const { width, height } = PAGE_SIZES_MM[orientation]
  return {
    width,
    height,
    contentWidth: width - 2 * MARGINS_MM.horizontal,
    contentHeight: height - MARGINS_MM.top - MARGINS_MM.bottom
  }
}
