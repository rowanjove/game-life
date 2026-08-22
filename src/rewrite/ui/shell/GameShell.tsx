import type { ReactNode } from 'react'
import type { HistoryEntry, RewriteCharacter } from '../../engine/model'
import { HistoryDrawer } from './HistoryDrawer'
import { PackPanel } from './PackPanel'
import { StatusHeader } from './StatusHeader'

type GameShellProps = {
  character: RewriteCharacter
  history: readonly HistoryEntry[]
  onRefresh(): void
  showStatus?: boolean
  onPackChanged?(): void
  children: ReactNode
}

export function GameShell({
  character,
  history,
  onRefresh,
  showStatus = true,
  onPackChanged,
  children,
}: GameShellProps) {
  return (
    <div className={`rewrite-game${showStatus ? '' : ' rewrite-game--creating'}`}>
      {showStatus ? <StatusHeader character={character} onRefresh={onRefresh} /> : null}
      <HistoryDrawer history={history} />
      <div className="rewrite-stage">
        <PackPanel onPackChanged={onPackChanged} />
        {children}
      </div>
    </div>
  )
}
