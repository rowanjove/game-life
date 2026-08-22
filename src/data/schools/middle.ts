import type {
  ContentSchool as School,
  Region,
} from '../../rewrite/content/types'

type Seed = readonly [id: string, name: string, region: Region, location: string, feature: string, annualBonus: number, tags?: string[]]

const seeds: Seed[] = [
  ['middle-sky-eagle', '天鹰中级学院', 'heaven-dou', '帝都', '综合发展', 2.5, ['综合']],
  ['middle-holy-sword', '圣剑中级道场', 'heaven-dou', '命器圣地', '攻击特化', 2, ['剑系', '攻击']],
  ['middle-ice-moon', '冰月学苑', 'heaven-dou', '北方', '冰系特化', 2, ['冰系']],
  ['middle-iron-wall', '铁壁中级学堂', 'heaven-dou', '军事要塞', '防御特化', 2, ['防御']],
  ['middle-golden-eagle', '金鹰中级学院', 'star-luo', '皇都', '贵族精英', 2.5, ['资源', '贵族']],
  ['middle-blazing', '烈焰中级武堂', 'star-luo', '火山地区', '火系特化', 2, ['火系']],
  ['middle-sky', '天穹学苑', 'star-luo', '高山之巅', '风系速度', 2, ['风系', '雷系', '速度']],
  ['middle-tide', '潮涌海院', 'star-luo', '海岸', '水系体能', 2, ['水系', '体魄']],
  ['middle-bright-moon', '皓月中级皇家学院', 'moon-string', '皓月城', '皇家学府', 3, ['资源']],
  ['middle-black-tortoise', '玄武道院', 'moon-string', '大陆中部', '防御辅助', 2.5, ['防御', '辅助']],
  ['middle-shadow-dance', '影舞中级道场', 'moon-string', '月弦暗区', '暗系特化', 2, ['暗系']],
  ['middle-morning-light', '晨光中级书院', 'moon-string', '文化重镇', '魂导命器双修', 2, ['灵导师']],
  ['middle-dragon-abyss', '龙渊中级大院', 'far-east', '古城', '古命器深造', 2.5, ['古命器']],
  ['middle-heaven-sword', '天剑道院', 'far-east', '剑山', '剑系专属', 3, ['剑系']],
  ['middle-star-sea', '星海中级学堂', 'far-east', '星海港口', '航海灵力双修', 2, ['水系', '航海']],
  ['middle-wasteland', '荒原武院（升级）', 'far-east', '远东草原', '荒野实战', 2, ['战斗', '灵兽']],
]

export const middleSchools: School[] = seeds.map(
  ([id, name, region, location, feature, annualBonus, tags = []]) => ({
    id, name, region, location, feature, annualBonus, tags, tier: 'middle',
  }),
)
