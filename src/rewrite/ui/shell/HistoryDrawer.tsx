import { useMemo, useState } from 'react'
import type { HistoryEntry, HistoryEntryType } from '../../engine/model'
import { CelestialCrest } from '../decor/CelestialDecor'

type HistoryDrawerProps = {
  history: readonly HistoryEntry[]
}

export function HistoryDrawer({ history }: HistoryDrawerProps) {
  const [open, setOpen] = useState(false)
  const [filter, setFilter] = useState<'all' | HistoryEntryType>('all')
  const entries = useMemo(
    () => [...history]
      .filter((entry) => filter === 'all' || entry.type === filter)
      .sort((left, right) => right.at.localeCompare(left.at)),
    [filter, history],
  )

  return (
    <aside className="rewrite-history">
      <button
        className="rewrite-history__trigger"
        type="button"
        aria-label="游玩历史"
        onClick={() => setOpen((value) => !value)}
      >
        <CelestialCrest label="历史纹章" />
        <span>游玩历史</span>
      </button>
      {open ? (
        <section className="rewrite-history__panel" role="dialog" aria-label="游玩历史">
          <CelestialCrest className="rewrite-history__crest" label="历史星徽" />
          <h2>命运长卷</h2>
          <label>
            筛选历史类型
            <select
              aria-label="筛选历史类型"
              value={filter}
              onChange={(event) => setFilter(event.target.value as 'all' | HistoryEntryType)}
            >
              <option value="all">全部</option>
              <option value="ending">结局</option>
              <option value="run-restart">重新开始</option>
              <option value="soul-ring">灵环</option>
              <option value="phase">阶段</option>
            </select>
          </label>
          {entries.length ? (
            <ol>
              {entries.map((entry) => (
                <li key={entry.id}>
                  <time dateTime={entry.at}>
                    {new Date(entry.at).toLocaleString('zh-CN')}
                  </time>
                  <p>{entry.summary}</p>
                </li>
              ))}
            </ol>
          ) : <p>还没有符合条件的记录。</p>}
          <button type="button" onClick={() => setOpen(false)}>关闭</button>
        </section>
      ) : null}
    </aside>
  )
}
