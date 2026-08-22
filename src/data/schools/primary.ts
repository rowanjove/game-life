import type {
  ContentSchool as School,
  Region,
} from '../../rewrite/content/types'

type Seed = readonly [id: string, name: string, region: Region, location: string, feature: string, annualBonus: number, tags?: string[]]

const seeds: Seed[] = [
  ['primary-holy-light', '圣光初级学院', 'heaven-dou', '圣魂村', '底蕴深厚', 2, ['原著', '综合']],
  ['primary-sky-feather', '天羽初级学堂', 'heaven-dou', '帝都近郊', '皇家资源', 1.5, ['资源']],
  ['primary-dawn', '晨曦命器馆', 'heaven-dou', '边境小镇', '实战风格', 1, ['战斗', '灵兽']],
  ['primary-iron-mountain', '铁山武馆', 'heaven-dou', '内陆山区', '体魄强化', 1, ['体魄']],
  ['primary-star-radiance', '星辉初级学院', 'star-luo', '皇都', '精英教育', 1.5, ['精英']],
  ['primary-iron-armor', '铁甲学堂', 'star-luo', '军事重镇', '军事训练', 1, ['战斗', '军事']],
  ['primary-moonlight', '月华书院', 'star-luo', '湖畔小镇', '辅助特化', 1, ['辅助']],
  ['primary-border', '边关幼学院', 'star-luo', '边境', '实战与灵兽', 0.8, ['战斗', '灵环']],
  ['primary-bright-moon', '皓月学府', 'moon-string', '皓月城', '独特体系', 1.5, ['综合']],
  ['primary-flowing-cloud', '流云初级道场', 'moon-string', '山中隐村', '隐世修炼', 1.2, ['天赋']],
  ['primary-sea-fishing', '大海初级渔庄武堂', 'moon-string', '海滨', '水属性特化', 1, ['水系', '体魄']],
  ['primary-iron-edge', '铁锋武院（月弦边境）', 'moon-string', '荒漠', '意志训练', 0.8, ['坚韧']],
  ['primary-dragon-abyss', '龙渊学堂', 'far-east', '古城遗址旁', '古命器研究', 1.2, ['古命器']],
  ['primary-wilderness', '荒野武学院', 'far-east', '远东草原', '驭兽特化', 1, ['灵兽']],
  ['primary-east-mountain', '东岳初级道院', 'far-east', '东岳山脉', '道家修炼', 1.5, ['纯灵力']],
  ['primary-dawn-dojo', '黎明武馆', 'far-east', '偏远渔村', '拼劲十足', 0.5, ['事件+1']],
]

export const primarySchools: School[] = seeds.map(
  ([id, name, region, location, feature, annualBonus, tags = []]) => ({
    id, name, region, location, feature, annualBonus, tags, tier: 'primary',
  }),
)
