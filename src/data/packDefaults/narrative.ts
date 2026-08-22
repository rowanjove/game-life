import type { NarrativeContent } from '../../content/packTypes'

export const BASE_NARRATIVE: NarrativeContent = {
  hero: {
    powerBands: [
      { untilYear: 13, power: 200 },
      { untilYear: 18, power: 350 },
      { untilYear: 21, power: 800 },
      { untilYear: 28, power: 1_500 },
      { untilYear: 35, power: 3_000 },
      { untilYear: Number.POSITIVE_INFINITY, power: 8_000 },
    ],
    outcomes: {
      win: {
        name: '险胜一筹',
        description: '你的气势压过时代传奇一线，机缘随之而来。',
        color: '#b9dff5',
      },
      draw: {
        name: '平分秋色',
        description: '这一战不分胜负，彼此都把对方刻进命运。',
        color: '#cfc8ef',
      },
      loss: {
        name: '败下阵来',
        description: '差距仍在，你只能把不甘化作下一次修炼。',
        color: '#f2cfe0',
      },
    },
    opportunities: [
      {
        id: 'opp-level',
        name: '灵力灌注',
        description: '时代传奇留下的余波化作澎湃灵力。',
        weight: 35,
        color: '#d9edf8',
        value: { kind: 'level', amount: 15 },
      },
      {
        id: 'opp-title',
        name: '战意铭刻',
        description: '这一战让你获得新的称号。',
        weight: 25,
        color: '#cfc8ef',
        value: { kind: 'title', id: '传奇见证者' },
      },
      {
        id: 'opp-knowledge',
        name: '神秘传承',
        description: '你从交锋中悟得一式秘技。',
        weight: 25,
        color: '#f2cfe0',
        value: { kind: 'knowledge', id: '主角交锋秘技' },
      },
      {
        id: 'opp-reputation',
        name: '大陆声望',
        description: '能与时代传奇交锋本身，就足以震动大陆。',
        weight: 10,
        color: '#d9bb78',
        value: { kind: 'reputation', amount: 6 },
      },
      {
        id: 'opp-bone',
        name: '灵骨遗泽',
        description: '交锋余波中凝结出一枚罕见灵骨。',
        weight: 10,
        color: '#fff8d9',
        value: { kind: 'bone', quality: 'rare' },
      },
    ],
    drawTitle: '命运对手',
    boneSource: '传奇机缘',
  },
  yearAdvance: {
    calendarLine: '{calendar} {year} 年',
    ageLine: '你 {age} 岁',
    growthLine: '灵力成长 +{growth}',
    heroLine: '{hero}正在{heroEvent}',
  },
  lateGame: {
    earlyContestYes: {
      name: '报名参赛',
      description: '提前踏上全陆精英大赛赛场。',
      weight: 40,
      color: '#f2cfe0',
    },
    earlyContestNo: {
      name: '暂缓参赛',
      description: '继续学业，把锋芒留到更合适的时机。',
      weight: 60,
      color: '#d9edf8',
    },
    ascensionYes: {
      name: '回应天境',
      description: '踏过天门，与天境同行。',
      weight: 45,
      color: '#fff8d9',
    },
    ascensionNo: {
      name: '守望人间',
      description: '留在灵元大陆，以凡身镇护众生。',
      weight: 55,
      color: '#b9dff5',
    },
  },
  contestOutcomes: {
    'crush-win': {
      id: 'contest-crush-win',
      name: '大胜',
      description: '绝对压制，全场为之震动。',
      color: '#fff8d9',
    },
    win: {
      id: 'contest-win',
      name: '胜利',
      description: '正常发挥，稳稳晋级。',
      color: '#b9dff5',
    },
    'narrow-win': {
      id: 'contest-narrow-win',
      name: '险胜',
      description: '关键一刻反超，惊险晋级。',
      color: '#d9edf8',
    },
    draw: {
      id: 'contest-draw',
      name: '平局',
      description: '未分胜负，但仍可推进赛程。',
      color: '#cfc8ef',
    },
    'narrow-loss': {
      id: 'contest-narrow-loss',
      name: '惜败',
      description: '差距不大，止步当前轮次。',
      color: '#f2cfe0',
    },
    'crush-loss': {
      id: 'contest-crush-loss',
      name: '惨败',
      description: '被完全碾压，黯然离场。',
      color: '#d85d6f',
    },
  },
}
