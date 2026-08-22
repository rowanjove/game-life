import type {
  ContentSchool as School,
  Region,
} from '../../rewrite/content/types'

type Seed = readonly [
  id: string,
  name: string,
  region: Region,
  location: string,
  feature: string,
  minimumSoulPower: number,
  tags?: string[],
  requiredSpiritTags?: string[],
  requiredTalentTiers?: School['requiredTalentTiers'],
  selectionWeight?: number,
]

const seeds: Seed[] = [
  ['high-shrek', '七星学院', 'heaven-dou', '七星城', '全陆第一，七怪母校', 50, ['综合', '原著'], [], [], 0.12],
  ['high-sky', '天穹高级学院', 'heaven-dou', '帝都', '帝国官方第一高院', 40, ['雷系', '风系']],
  ['high-holy-light', '圣光高院', 'heaven-dou', '圣魂村附近', '攻击系第一', 38, ['攻击']],
  ['high-ice-snow', '冰雪高级学苑', 'heaven-dou', '极北', '冰系最高学府', 35, ['冰系']],
  ['high-star-royal', '星罗皇家高级学院', 'star-luo', '皇都', '贵族精英', 45, ['资源', '贵族']],
  ['high-metal', '金属高院', 'star-luo', '工业重镇', '灵导器与命器双修', 38, ['灵导师']],
  ['high-flame-dragon', '炎龙高院', 'star-luo', '火山城', '火系巅峰', 35, ['火系']],
  ['high-divine-wing', '神翼学院', 'star-luo', '星罗神山', '飞行速度特化', 35, ['风系', '速度']],
  ['high-bright-moon', '皓月皇家高级学府', 'moon-string', '皓月皇都', '月弦最高学府', 42, ['资源']],
  ['high-nether-shadow', '幽影学院', 'moon-string', '月弦暗区', '暗系刺杀巅峰', 36, ['暗系']],
  ['high-chaos', '混沌学院', 'moon-string', '月弦边境废墟', '神秘混元修炼', 35, ['混沌'], ['混沌', '虚空']],
  ['high-destiny', '天命高院', 'moon-string', '月弦圣地', '命运占卜流', 35, ['命运'], [], ['rare', 'divine', 'legendary']],
  ['high-ancient-dragon', '古龙高院', 'far-east', '龙脉遗址', '龙系命器顶峰', 38, ['龙系'], ['龙']],
  ['high-ancient-wild', '荒古高级武院', 'far-east', '远东深处', '古法修炼极限', 35, ['古命器']],
  ['high-stars', '星辰大院', 'far-east', '东岳山顶', '自然系星力巅峰', 40, ['自然', '雷系']],
  ['high-sword-god', '剑神道院', 'far-east', '天剑山绝顶', '剑道最高殿堂', 40, ['剑系'], ['剑']],
]

export const highSchools: School[] = seeds.map(
  ([id, name, region, location, feature, minimumSoulPower, tags = [], requiredSpiritTags, requiredTalentTiers, selectionWeight]) => ({
    id,
    name,
    region,
    location,
    feature,
    minimumSoulPower,
    tags,
    requiredSpiritTags,
    requiredTalentTiers,
    selectionWeight,
    annualBonus: minimumSoulPower >= 45 ? 5 : minimumSoulPower >= 40 ? 4 : 3.5,
    tier: 'high',
  }),
)
