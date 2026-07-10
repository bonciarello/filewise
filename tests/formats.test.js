import { describe, it, expect } from 'vitest'
import { formats, categories, filterFormats, getFormatById } from '../src/data/formats.js'

describe('Formats Data', () => {
  it('should have at least 20 formats', () => {
    expect(formats.length).toBeGreaterThanOrEqual(20)
  })

  it('every format should have required fields', () => {
    for (const fmt of formats) {
      expect(fmt.id).toBeTruthy()
      expect(fmt.name).toBeTruthy()
      expect(fmt.extension).toBeTruthy()
      expect(fmt.category).toBeTruthy()
      expect(fmt.description).toBeTruthy()
      expect(fmt.uses).toBeTruthy()
      expect(fmt.programs).toBeTruthy()
      expect(fmt.iconColor).toBeTruthy()
      expect(fmt.mime).toBeTruthy()
      expect(typeof fmt.sampleGenerator).toBe('function')
    }
  })

  it('every extension should start with a dot', () => {
    for (const fmt of formats) {
      expect(fmt.extension.startsWith('.')).toBe(true)
    }
  })

  it('every category should be valid', () => {
    const catIds = categories.map(c => c.id)
    for (const fmt of formats) {
      expect(catIds).toContain(fmt.category)
    }
  })

  it('every sampleGenerator should return a Blob', () => {
    for (const fmt of formats) {
      const blob = fmt.sampleGenerator()
      expect(blob).toBeInstanceOf(Blob)
      expect(blob.size).toBeGreaterThan(0)
    }
  })

  it('every format id should be unique', () => {
    const ids = formats.map(f => f.id)
    const unique = new Set(ids)
    expect(unique.size).toBe(ids.length)
  })

  it('should have all 8 categories', () => {
    expect(categories.length).toBe(8)
  })
})

describe('filterFormats', () => {
  it('should return all formats with empty query and tutti category', () => {
    const result = filterFormats('', 'tutti')
    expect(result.length).toBe(formats.length)
  })

  it('should filter by name (case insensitive)', () => {
    const result = filterFormats('pdf', '')
    expect(result.length).toBeGreaterThanOrEqual(1)
    expect(result[0].id).toBe('pdf')
  })

  it('should filter by extension', () => {
    const result = filterFormats('.png', '')
    expect(result.length).toBeGreaterThanOrEqual(1)
    expect(result[0].id).toBe('png')
  })

  it('should filter by description text', () => {
    const result = filterFormats('compressione', '')
    expect(result.length).toBeGreaterThanOrEqual(1)
  })

  it('should filter by category', () => {
    const result = filterFormats('', 'immagini')
    for (const fmt of result) {
      expect(fmt.category).toBe('immagini')
    }
  })

  it('should combine query and category', () => {
    const result = filterFormats('png', 'immagini')
    expect(result.length).toBeGreaterThanOrEqual(1)
    expect(result[0].id).toBe('png')
  })

  it('should return empty array for non-matching query', () => {
    const result = filterFormats('xyzzy_non_existent', '')
    expect(result.length).toBe(0)
  })
})

describe('getFormatById', () => {
  it('should return the correct format for a valid id', () => {
    const fmt = getFormatById('pdf')
    expect(fmt).toBeTruthy()
    expect(fmt.name).toBe('PDF')
  })

  it('should return null for invalid id', () => {
    const fmt = getFormatById('nonexistent')
    expect(fmt).toBeNull()
  })
})

describe('format categories coverage', () => {
  it('should have at least one format per category', () => {
    const catIds = categories.map(c => c.id)
    for (const catId of catIds) {
      const found = formats.filter(f => f.category === catId)
      expect(found.length).toBeGreaterThanOrEqual(1)
    }
  })
})
