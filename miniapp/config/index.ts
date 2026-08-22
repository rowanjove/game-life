import { defineConfig } from '@tarojs/cli'
import path from 'node:path'

export default defineConfig<'webpack5'>(() => ({
  projectName: 'game-life-miniapp',
  date: '2026-08-22',
  designWidth: 390,
  deviceRatio: { 390: 1 },
  sourceRoot: 'src',
  outputRoot: `dist/${process.env.TARO_ENV ?? 'weapp'}`,
  framework: 'react',
  compiler: 'webpack5',
  cache: { enable: true },
  mini: {
    webpackChain(chain) {
      chain.module.rule('script').include.add(path.resolve(__dirname, '../../src'))
    },
    postcss: {
      pxtransform: { enable: true, config: {} },
      cssModules: { enable: false, config: { namingPattern: 'module', generateScopedName: '[name]__[local]___[hash:base64:5]' } },
    },
  },
}))
