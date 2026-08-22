import type { RewriteCommand, RewriteRun } from '../../engine/model'

type JourneyTransitionScreenProps = {
  run: RewriteRun
  dispatch(command: RewriteCommand): void
}

function transitionCopy(run: RewriteRun): { title: string; description: string } {
  if (run.flow.step === 'stage-summary') {
    const latestSchool = run.character.schoolRecords.at(-1)
    return {
      title: '阶段小结',
      description: latestSchool
        ? `${latestSchool.schoolName}的修行告一段落，灵元历 ${run.character.currentYear} 年的足迹已写入长卷。`
        : '一段修行已经写入命运长卷，新的道路正在前方展开。',
    }
  }
  if (run.flow.step === 'adult-cycle-end') {
    return {
      title: '五年小结',
      description: '这一阶段的修炼已经落定，命运事件即将纷至沓来。',
    }
  }
  if (run.flow.step === 'ending-check') {
    return {
      title: '命运回望',
      description: '你走过的岁月正在汇聚，人生终章即将显现。',
    }
  }
  return {
    title: '命运流转',
    description: '旧章已合，新章将启。',
  }
}

export function JourneyTransitionScreen({
  run,
  dispatch,
}: JourneyTransitionScreenProps) {
  const copy = transitionCopy(run)
  return (
    <main className="journey-transition">
      <p>灵元长卷</p>
      <h1>{copy.title}</h1>
      <p>{copy.description}</p>
      <button
        className="rewrite-primary-action"
        type="button"
        onClick={() => dispatch({ type: 'CONTINUE' })}
      >
        继续命运
      </button>
    </main>
  )
}
