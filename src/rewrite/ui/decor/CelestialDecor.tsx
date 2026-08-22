import type { Gender } from '../../engine/model'

type DecorProps = {
  className?: string
  label: string
}

export function CelestialCrest({ className = '', label }: DecorProps) {
  return (
    <svg
      className={`celestial-linework ${className}`.trim()}
      role="img"
      aria-label={label}
      viewBox="0 0 120 60"
    >
      <g fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
        <path d="M60 8 64 23 79 27 64 31 60 46 56 31 41 27 56 23Z" strokeWidth="1.25" />
        <path d="M48 16c-12 1-23 6-34 15 12-4 22-5 32-3M72 16c12 1 23 6 34 15-12-4-22-5-32-3" strokeWidth=".9" opacity=".72" />
        <path d="M48 39c-9 1-17 5-25 12M72 39c9 1 17 5 25 12" strokeWidth=".9" opacity=".5" />
        <circle cx="60" cy="27" r="3.2" strokeWidth="1.4" />
      </g>
    </svg>
  )
}

export function WingedGem({ className = '', label }: DecorProps) {
  return (
    <svg
      className={`celestial-linework ${className}`.trim()}
      role="img"
      aria-label={label}
      viewBox="0 0 180 70"
    >
      <g fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
        <path d="M75 29C54 27 37 20 18 9c10 14 23 24 40 30-13 0-26-3-38-8 13 14 29 23 51 27M105 29c21-2 38-9 57-20-10 14-23 24-40 30 13 0 26-3 38-8-13 14-29 23-51 27" strokeWidth="1.15" opacity=".76" />
        <path d="m90 8 15 16-5 27-10 11-10-11-5-27Z" strokeWidth="1.5" />
        <path d="m90 16 8 10-3 19-5 7-5-7-3-19Z" strokeWidth=".8" opacity=".55" />
      </g>
    </svg>
  )
}

export function GenderSigil({ gender }: { gender: Gender }) {
  const female = gender === 'female'
  return (
    <svg
      className={`gender-sigil gender-sigil--line gender-sigil--${gender}`}
      role="img"
      aria-label={female ? '女性纹章' : '男性纹章'}
      viewBox="0 0 88 88"
    >
      <g fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="44" cy="44" r="25" strokeWidth=".8" opacity=".32" />
        <path d="M44 12 49 34 70 39 49 44 44 66 39 44 18 39 39 34Z" strokeWidth="1.25" />
        <path d="m44 24 12 15-12 15-12-15Z" strokeWidth="1.05" />
        {female ? (
          <>
            <path d="M32 61c7-2 10-6 12-12 2 6 5 10 12 12" strokeWidth="1" />
            <path d="M44 61v13M38 68h12" strokeWidth="1" />
          </>
        ) : (
          <>
            <path d="m54 30 10-10M56 20h8v8" strokeWidth="1" />
            <path d="M34 60 44 50l10 10" strokeWidth="1" />
          </>
        )}
      </g>
    </svg>
  )
}
