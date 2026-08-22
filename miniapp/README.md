# 小程序端

该目录是独立的 Taro 4 / React 18 工作区，避免与根目录 Web 端的 React 19 依赖互相污染。规则引擎、RNG、内容数据、存档校验直接复用 `../src`。

```bash
cd miniapp
npm install
npm run build:weapp   # 输出 dist/weapp
npm run build:tt      # 输出 dist/tt
```

- 微信开发者工具导入 `miniapp/dist/weapp`
- 抖音开发者工具导入 `miniapp/dist/tt`
- 发布前把 `project.config.json` / `project.tt.json` 中测试 App ID 替换为真实 App ID

内容包安装器依赖浏览器 File/ZIP API，因此小程序端当前固定使用内置原创内容包；核心游玩流程、存档、历史和结局均与 Web 同源。
