import type { RewriteCommand, RewriteRun } from '../../engine/model'

type EventScreenProps = {
  run: RewriteRun
  dispatch(command: RewriteCommand): void
}

export function EventScreen({ run, dispatch }: EventScreenProps) {
  if (run.pending?.kind !== 'event-choice') return null
  return (
    <main className="event-screen">
      <p className="event-screen__eyebrow">命运抉择</p>
      <h1>{run.pending.title}</h1>
      <p className="event-screen__description">{run.pending.description}</p>
      <div className="rewrite-dialog__actions">
        {run.pending.choices.map((choice) => (
          <button
            key={choice.id}
            type="button"
            onClick={() => dispatch({ type: 'CHOOSE_EVENT', choiceId: choice.id })}
          >
            {choice.label}
          </button>
        ))}
      </div>
    </main>
  )
}
