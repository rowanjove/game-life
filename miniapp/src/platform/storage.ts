import Taro from '@tarojs/taro'
import type { StorageLike } from '../../../src/rewrite/storage/repository'

export const miniStorage: StorageLike = {
  getItem(key) {
    try {
      const value = Taro.getStorageSync<string>(key)
      return typeof value === 'string' && value.length > 0 ? value : null
    } catch {
      return null
    }
  },
  setItem(key, value) {
    Taro.setStorageSync(key, value)
  },
  removeItem(key) {
    Taro.removeStorageSync(key)
  },
}
