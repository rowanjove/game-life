import { applyLevelChange } from './progression'
import type { RewriteRun } from './model'

export function resolveDeferredFlags(run: RewriteRun): RewriteRun {
  let character = run.character
  let flags = [...character.flags]

  if (flags.includes('spirit-evolution-check')) {
    character = applyLevelChange(character, 8)
    character = {
      ...character,
      growthMultiplier: character.growthMultiplier + 0.1,
      titles: [...new Set([...character.titles, '命器蜕变'])],
    }
    flags = flags.filter((flag) => flag !== 'spirit-evolution-check')
  }

  if (flags.includes('ascension-preparation')) {
    flags = [
      ...new Set([
        ...flags.filter((flag) => flag !== 'ascension-preparation'),
        'ascension-choice',
      ]),
    ]
  }

  return {
    ...run,
    character: {
      ...character,
      flags,
    },
  }
}