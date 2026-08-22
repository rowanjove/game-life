import { getLexicon } from '../../../content/lexicon'
import type { RewriteCommand, RewriteRun } from '../../engine/model'

type CreationSummaryScreenProps = {
  run: RewriteRun
  dispatch(command: RewriteCommand): void
}

function genderName(gender: RewriteRun['character']['gender']): string {
  if (gender === 'male') return '男'
  if (gender === 'female') return '女'
  return '尚未显现'
}

export function CreationSummaryScreen({
  run,
  dispatch,
}: CreationSummaryScreenProps) {
  const { character } = run
  const lex = getLexicon()
  const spirits = character.spirits.map((spirit) => spirit.name).join('、')

  return (
    <main className="creation-summary">
      <p className="creation-summary__chapter">命运第一卷</p>
      <h1>命运初定</h1>
      <p className="creation-summary__lead">你的名字已被{lex.worldName}铭记。</p>

      <dl className="creation-summary__details">
        <div className="creation-summary__name">
          <dt>姓名</dt>
          <dd>{character.name || '尚未显现'}</dd>
        </div>
        <div><dt>性别</dt><dd>{genderName(character.gender)}</dd></div>
        <div><dt>种族</dt><dd>{character.raceName || '尚未显现'}</dd></div>
        <div><dt>容貌</dt><dd>{character.looks ? `${character.looks}分` : '尚未显现'}</dd></div>
        <div><dt>出生年份</dt><dd>{character.birthYear ? `${lex.calendarName} ${character.birthYear}年` : '尚未显现'}</dd></div>
        <div className="creation-summary__wide">
          <dt>出生地</dt>
          <dd>{character.birthPlace || '尚未显现'}</dd>
        </div>
        <div className="creation-summary__wide">
          <dt>{lex.spiritLabel}</dt>
          <dd>{spirits || '尚未显现'}</dd>
        </div>
        <div><dt>先天灵力</dt><dd>{character.innatePower ? `${character.innatePower}级` : '尚未显现'}</dd></div>
        <div><dt>特殊天赋</dt><dd>{character.talentId || '尚未显现'}</dd></div>
      </dl>

      <button
        className="rewrite-primary-action"
        type="button"
        onClick={() => dispatch({ type: 'CONTINUE' })}
      >
        {lex.enterWorldCta}
      </button>
    </main>
  )
}
