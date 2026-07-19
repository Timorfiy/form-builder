import { describe, expect, it } from 'vitest'
import { CURRENT_SCHEMA_VERSION, parseDoc, serializeDoc } from './serialize'

describe('document serialization', () => {
  it('serializes with the exported current schema version', () => {
    const serialized = serializeDoc({
      title: 'Example',
      description: '',
      submitLabel: 'Send',
      style: 'classic',
      blocks: [],
    })

    expect(JSON.parse(serialized).$formforge).toBe(CURRENT_SCHEMA_VERSION)
  })

  it('accepts legacy v1 documents without an explicit version', () => {
    expect(
      parseDoc({
        title: 'Legacy',
        blocks: [],
      }),
    ).toMatchObject({
      title: 'Legacy',
      description: '',
      submitLabel: 'Submit',
      style: 'classic',
      blocks: [],
    })
  })

  it('rejects unknown explicit schema versions', () => {
    expect(() => parseDoc({ $formforge: 2, blocks: [] })).toThrow(
      'Unsupported FormForge schema version',
    )
  })

  it('repairs block properties and clamps integer settings', () => {
    const doc = parseDoc({
      $formforge: CURRENT_SCHEMA_VERSION,
      blocks: [
        { kind: 'longText', rows: 99 },
        { kind: 'rating', max: 1 },
        { kind: 'dropdown', options: { broken: true } },
        { kind: 'phone' },
      ],
    })

    expect(doc.blocks[0]).toMatchObject({
      kind: 'longText',
      rows: 12,
      label: 'Your answer',
      required: false,
    })
    expect(doc.blocks[1]).toMatchObject({ kind: 'rating', max: 3 })
    expect(doc.blocks[2]).toMatchObject({
      kind: 'dropdown',
      options: ['Option 1', 'Option 2', 'Option 3'],
    })
    expect(doc.blocks[3]).toMatchObject({ kind: 'phone', mask: 'none' })
    expect(doc.blocks.every((block) => typeof block.id === 'string' && block.id.length > 0)).toBe(
      true,
    )
  })
})
