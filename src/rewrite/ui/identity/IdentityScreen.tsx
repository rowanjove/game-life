import { useState } from 'react'
import type { Gender } from '../../engine/model'
import { isValidCharacterName } from '../../engine/identity'
import { CelestialCrest, GenderSigil } from '../decor/CelestialDecor'

const randomNames = ['林云深', '沈星河', '苏映雪', '顾长风', '白清歌', '陆玄霄']

export { isValidCharacterName } from '../../engine/identity'

function DiceIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" width="22" height="22">
      <rect x="3" y="3" width="18" height="18" rx="4" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="8" cy="8" r="1.4" fill="currentColor" />
      <circle cx="16" cy="8" r="1.4" fill="currentColor" />
      <circle cx="12" cy="12" r="1.4" fill="currentColor" />
      <circle cx="8" cy="16" r="1.4" fill="currentColor" />
      <circle cx="16" cy="16" r="1.4" fill="currentColor" />
    </svg>
  )
}

type IdentityScreenProps = {
  onConfirm(name: string, gender: Gender): void
}

export function IdentityScreen({ onConfirm }: IdentityScreenProps) {
  const [name, setName] = useState('')
  const [gender, setGender] = useState<Gender | null>(null)
  const normalizedName = name.trim()
  const nameValid = isValidCharacterName(normalizedName)

  return (
    <main className="rewrite-identity">
      <CelestialCrest className="rewrite-identity__crest" label="命运星徽" />
      <p className="rewrite-identity__chapter">命运第一章</p>
      <h1>在石碑上刻下你的名字</h1>
      <div className="rewrite-identity__divider" aria-hidden="true"><span /></div>
      <p className="rewrite-identity__intro">名字是你与这片大陆签下的第一份契约。</p>
      <label className="rewrite-field-label" htmlFor="rewrite-name">姓名</label>
      <div className="rewrite-identity__name" data-testid="name-control">
        <input
          id="rewrite-name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="请输入一至四个汉字"
          maxLength={4}
          autoComplete="off"
          aria-describedby="rewrite-name-help"
          aria-invalid={name.length > 0 && !nameValid}
        />
        <button
          type="button"
          aria-label="随机姓名"
          onClick={() => {
            const index = Math.floor(Math.random() * randomNames.length)
            setName(randomNames[index])
          }}
        >
          <DiceIcon />
        </button>
      </div>
      <p id="rewrite-name-help" className="rewrite-field-help">
        <span>{name.length > 0 && !nameValid ? '姓名仅支持一至四个汉字' : '一至四字，将出现在你的命运长卷中'}</span>
        <span aria-hidden="true">{Array.from(name).length}/4</span>
      </p>
      <span className="rewrite-field-label">性别</span>
      <div className="rewrite-identity__gender" aria-label="性别">
        <button type="button" aria-label="男" aria-pressed={gender === 'male'} onClick={() => setGender('male')}>
          <GenderSigil gender="male" />
          <span>男</span>
        </button>
        <button type="button" aria-label="女" aria-pressed={gender === 'female'} onClick={() => setGender('female')}>
          <GenderSigil gender="female" />
          <span>女</span>
        </button>
      </div>
      <button
        className="rewrite-primary-action"
        type="button"
        disabled={!nameValid || !gender}
        onClick={() => gender && nameValid && onConfirm(normalizedName, gender)}
      >
        <span>开始命运之旅</span>
      </button>
    </main>
  )
}
