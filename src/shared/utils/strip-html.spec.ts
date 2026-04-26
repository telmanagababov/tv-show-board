import { describe, expect, it } from 'vitest'

import { decodeHtmlEntities, stripHtml, stripHtmlTags } from './strip-html'

describe('stripHtmlTags', () => {
  it('removes tags but leaves text content untouched', () => {
    expect(stripHtmlTags('<p>Hello <b>world</b></p>')).toBe('Hello world')
  })

  it('handles attributes inside tags', () => {
    expect(stripHtmlTags('<a href="http://x">link</a>')).toBe('link')
  })

  it('returns the input unchanged when no tags are present', () => {
    expect(stripHtmlTags('plain text')).toBe('plain text')
  })

  it('does not decode entities', () => {
    expect(stripHtmlTags('Tom &amp; Jerry')).toBe('Tom &amp; Jerry')
  })
})

describe('decodeHtmlEntities', () => {
  it('decodes the entities the app encounters', () => {
    expect(decodeHtmlEntities('Tom &amp; Jerry &nbsp;&quot;cartoon&quot;')).toBe('Tom & Jerry  "cartoon"')
  })

  it('decodes &amp; last so escaped entities survive a single decode pass', () => {
    expect(decodeHtmlEntities('&amp;lt;')).toBe('&lt;')
  })

  it('returns the input unchanged when no entities are present', () => {
    expect(decodeHtmlEntities('plain text')).toBe('plain text')
  })
})

describe('stripHtml', () => {
  it('removes tags, decodes entities, and collapses whitespace', () => {
    expect(stripHtml('<p>Hello   <b>world</b></p>')).toBe('Hello world')
  })

  it('combines entity decoding with tag stripping', () => {
    expect(stripHtml('<p>Tom &amp; Jerry &nbsp;cartoon</p>')).toBe('Tom & Jerry cartoon')
  })

  it('trims leading and trailing whitespace', () => {
    expect(stripHtml('   <p>hi</p>   ')).toBe('hi')
  })

  it('returns an empty string for empty input', () => {
    expect(stripHtml('')).toBe('')
  })
})
