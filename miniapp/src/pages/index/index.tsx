import { Button, Input, ScrollView, Text, View } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useEffect, useMemo, useState } from 'react'
import { useStore } from 'zustand'
import { getLexicon } from '../../../../src/content/lexicon'
import type { Gender, RewriteCommand, RewriteRun } from '../../../../src/rewrite/engine/model'
import { isValidCharacterName } from '../../../../src/rewrite/engine/identity'
import { reduceRewriteRun, wheelOptionsForRun } from '../../../../src/rewrite/engine/reducer'
import { createRuntimeId } from '../../../../src/rewrite/platform/runtime'
import { createRewriteRepository } from '../../../../src/rewrite/storage/repository'
import { createRewriteStore } from '../../../../src/rewrite/store/gameStore'
import { miniStorage } from '../../platform/storage'
import './index.scss'

const names = ['林云深', '沈星河', '苏映雪', '顾长风', '白清歌', '陆玄霄']

function createStore() {
  const repository = createRewriteRepository(miniStorage)
  const base = {
    now: () => new Date().toISOString(),
    nextId: createRuntimeId,
    nextSeed: () => Math.floor(Math.random() * 2_147_483_647) + 1,
  }
  return createRewriteStore(repository, {
    ...base,
    reduce: (run, command) => reduceRewriteRun(run, command, base),
  })
}

const miniStore = createStore()

function titleFor(run: RewriteRun): string {
  const lex = getLexicon()
  const titles: Record<string, string> = {
    looks: '容貌', timeline: '出生时代', 'birth-place': '出生地', race: '种族',
    'spirit-count': `${lex.spiritLabel}数量`, 'innate-power': '先天灵力', talent: '特殊天赋',
    'school-selection': '选择学院', 'special-event': '命运际遇', 'event-count': '阶段际遇',
    qualifier: '大赛资格赛', quarterfinal: '大赛淘汰赛', semifinal: '大赛半决赛', final: '大赛决赛',
    'hero-interaction': `${lex.heroName}互动`, 'soul-bone-choice': `${lex.boneLabel}抉择`,
    'early-contest-offer': '提前参赛', 'ascension-offer': '飞升抉择',
  }
  const spirit = run.flow.step.match(/^spirit-(\d+)(-category)?$/)
  if (spirit) return spirit[2] ? `第 ${spirit[1]} ${lex.spiritLabel}类别` : `第 ${spirit[1]} ${lex.spiritLabel}`
  const ring = run.flow.step.match(/^soul-ring-(\d+)$/)
  if (ring) return `第 ${ring[1]} ${lex.ringLabel}`
  const year = run.flow.step.match(/^year-(\d+)$/)
  if (year) return `第 ${year[1]}年`
  return titles[run.flow.step] ?? '命运流转'
}

function Identity({ dispatch }: { dispatch(command: RewriteCommand): void }) {
  const [name, setName] = useState('')
  const [gender, setGender] = useState<Gender | null>(null)
  const valid = isValidCharacterName(name)
  return <View className='identity'>
    <Text className='crest'>◇</Text>
    <Text className='eyebrow'>命运第一章</Text>
    <Text className='title'>在石碑上刻下你的名字</Text>
    <Text className='lead'>名字是你与这片大陆签下的第一份契约。</Text>
    <View className='nameRow'>
      <Input value={name} maxlength={4} placeholder='请输入一至四个汉字' onInput={(event) => setName(event.detail.value)} />
      <Button className='dice' onClick={() => setName(names[Math.floor(Math.random() * names.length)])}>随机</Button>
    </View>
    <View className='genderRow'>
      <Button className={gender === 'male' ? 'selected' : ''} onClick={() => setGender('male')}>男</Button>
      <Button className={gender === 'female' ? 'selected' : ''} onClick={() => setGender('female')}>女</Button>
    </View>
    <Button className='primary' disabled={!valid || !gender} onClick={() => gender && dispatch({ type: 'CONFIRM_IDENTITY', name: name.trim(), gender })}>开始命运之旅</Button>
  </View>
}

function WheelView({ run, dispatch }: { run: RewriteRun; dispatch(command: RewriteCommand): void }) {
  const options = useMemo(() => {
    try { return wheelOptionsForRun(run) } catch { return [] }
  }, [run])
  useEffect(() => {
    if (run.flow.status !== 'animating') return
    const timer = setTimeout(() => dispatch({ type: 'ANIMATION_FINISHED' }), 1500)
    return () => clearTimeout(timer)
  }, [dispatch, run.flow.status, run.pending?.id])
  const spinning = run.flow.status === 'animating'
  return <View className='wheelScreen'>
    <Text className='eyebrow'>命运转盘</Text>
    <Text className='title'>{titleFor(run)}</Text>
    <View className={`wheel ${spinning ? 'spinning' : ''}`}>
      <View className='wheelTicks' />
      {options.slice(0, 8).map((option, index) => {
        const angle = (Math.PI * 2 * index / Math.min(options.length, 8)) - Math.PI / 2
        const left = 50 + Math.cos(angle) * 35
        const top = 50 + Math.sin(angle) * 35
        return <Text key={option.id} className='orbitLabel' style={{ left: `${left}%`, top: `${top}%` }}>{option.name.slice(0, 4)}</Text>
      })}
      <Button className='wheelButton' disabled={run.flow.status !== 'ready'} onClick={() => {
        Taro.vibrateShort({ type: 'light' }).catch(() => undefined)
        dispatch({ type: 'START_WHEEL' })
      }}>{spinning ? '流转中' : '转动'}</Button>
    </View>
    <Text className='hint'>本轮共 {options.length} 种可能，结果由可复现的命运种子决定。</Text>
    {run.flow.status === 'result-pending' && run.pending?.kind === 'wheel' ? <View className='overlay'>
      <View className='resultCard'>
        <Text className='eyebrow'>命运印记</Text>
        <Text className='resultTitle'>{run.pending.title}</Text>
        <Text className='resultDescription'>{run.pending.description}</Text>
        {run.pending.effects.map((effect) => <Text key={effect} className='effect'>· {effect}</Text>)}
        <Button className='primary' onClick={() => dispatch({ type: 'CONFIRM_RESULT' })}>确认，继续命运</Button>
      </View>
    </View> : null}
  </View>
}

function ChoiceView({ run, dispatch }: { run: RewriteRun; dispatch(command: RewriteCommand): void }) {
  if (run.pending?.kind !== 'event-choice') return null
  return <View className='choiceScreen'>
    <Text className='eyebrow'>命运抉择</Text>
    <Text className='title'>{run.pending.title}</Text>
    <Text className='lead'>{run.pending.description}</Text>
    {run.pending.choices.map(choice => <Button key={choice.id} className='choice' onClick={() => dispatch({ type: 'CHOOSE_EVENT', choiceId: choice.id })}>{choice.label}</Button>)}
  </View>
}

function Chronicle({ run, dispatch, restart }: { run: RewriteRun; dispatch(command: RewriteCommand): void; restart(): void }) {
  const ending = run.flow.phase === 'ending'
  return <View className='chronicle'>
    <Text className='eyebrow'>{ending ? '人生终章' : '灵元长卷'}</Text>
    <Text className='title'>{ending ? '此生命数已定' : run.flow.step === 'creation-summary' ? '命运初定' : '旧章已合，新章将启'}</Text>
    <View className='stats'>
      <Text>姓名　{run.character.name}</Text>
      <Text>境界　{Math.round(run.character.level)}级</Text>
      <Text>种族　{run.character.raceName || '尚未显现'}</Text>
      <Text>纪年　{run.character.currentYear || '尚未显现'}</Text>
    </View>
    <Button className='primary' onClick={ending ? restart : () => dispatch({ type: 'CONTINUE' })}>{ending ? '开始新人生' : '继续命运'}</Button>
  </View>
}

export default function Index() {
  const run = useStore(miniStore, state => state.run)
  const error = useStore(miniStore, state => state.error)
  const dispatch = (command: RewriteCommand) => miniStore.getState().dispatch(command)
  let content
  if (run.flow.phase === 'creation' && run.flow.step === 'identity') content = <Identity dispatch={dispatch} />
  else if (run.flow.status === 'choice-pending') content = <ChoiceView run={run} dispatch={dispatch} />
  else if (run.flow.phase === 'ending' || run.flow.step === 'creation-summary' || run.flow.step.endsWith('summary') || run.flow.step === 'adult-cycle-end' || run.flow.step === 'ending-check') content = <Chronicle run={run} dispatch={dispatch} restart={() => miniStore.getState().restart()} />
  else content = <WheelView run={run} dispatch={dispatch} />
  return <ScrollView scrollY className='page'>
    {run.flow.step !== 'identity' ? <View className='statusBar'><Text>{run.character.name} · {Math.round(run.character.level)}级</Text><Text>{run.character.currentYear ? `灵元历 ${run.character.currentYear}年` : '命运初显'}</Text></View> : null}
    <View className='paper'>{error ? <View className='error'><Text>{error}</Text><Button onClick={() => miniStore.getState().recover()}>恢复进度</Button></View> : content}</View>
  </ScrollView>
}
