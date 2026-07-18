import { useBuilder } from '../store'
import { BLOCK_REGISTRY, PALETTE_GROUPS } from '../blocks/registry'
import type { BlockKind } from '../types'
import { Icon } from './Icon'

export const DND_MIME = 'application/x-formforge'

export function Palette() {
  const { state, dispatch } = useBuilder()

  const addAt = (kind: BlockKind) => {
    const { blocks } = state.doc
    const selectedIndex = state.selectedId
      ? blocks.findIndex((b) => b.id === state.selectedId)
      : -1
    dispatch({
      type: 'add-block',
      kind,
      index: selectedIndex >= 0 ? selectedIndex + 1 : blocks.length,
    })
  }

  return (
    <aside className="palette" aria-label="Block palette">
      <div className="panel-head">
        <span className="panel-title">Blocks</span>
        <span className="panel-hint">drag or click</span>
      </div>

      <div className="palette-scroll">
        {PALETTE_GROUPS.map((group) => (
          <section key={group} className="palette-group">
            <h3 className="palette-group-label">{group}</h3>
            <div className="palette-grid">
              {BLOCK_REGISTRY.filter((m) => m.group === group).map((meta, i) => (
                <button
                  key={meta.kind}
                  className="palette-item"
                  style={{ animationDelay: `${i * 28}ms` }}
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.setData(
                      DND_MIME,
                      JSON.stringify({ source: 'palette', kind: meta.kind }),
                    )
                    e.dataTransfer.effectAllowed = 'copy'
                  }}
                  onClick={() => addAt(meta.kind)}
                  title={`Add ${meta.label}`}
                >
                  <span className="palette-item-icon">
                    <Icon name={meta.icon} size={17} />
                  </span>
                  <span className="palette-item-text">
                    <span className="palette-item-label">{meta.label}</span>
                    <span className="palette-item-hint">{meta.hint}</span>
                  </span>
                  <span className="palette-item-plus">
                    <Icon name="plus" size={13} />
                  </span>
                </button>
              ))}
            </div>
          </section>
        ))}
      </div>

      <div className="palette-foot">
        <span className="palette-count">
          {state.doc.blocks.length} {state.doc.blocks.length === 1 ? 'block' : 'blocks'}
        </span>
      </div>
    </aside>
  )
}
