# 轮盘人生 · Wheel of Life

[简体中文](README.md) | [English](README.en.md)

轮盘人生是一款中文随机人生游戏，在浏览器中通过命运转盘创建角色、经历事件并走向不同结局。项目使用 React、TypeScript 和 Vite，支持可重放的随机种子、自动存档及可安装内容包。

[在线试玩](https://rowanjove.github.io/wheel-of-life/) · [版本发布](https://github.com/rowanjove/wheel-of-life/releases) · [报告问题](https://github.com/rowanjove/wheel-of-life/issues)

[![CI](https://github.com/rowanjove/wheel-of-life/actions/workflows/ci.yml/badge.svg)](https://github.com/rowanjove/wheel-of-life/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

当前公开版本为 **v0.3.2**，面向桌面和移动浏览器。游戏内容与界面以中文为主；英文 README 不代表游戏已完成英文本地化。微信、抖音小程序工作区处于冻结状态，不属于本次 Web 版本的交付范围。

![轮盘人生桌面端角色创建界面](docs/images/02-identity-desktop.png)

## 玩法与功能

- 创建角色：输入姓名、选择性别，使用种子随机数重放创建过程。
- 命运转盘：生成容貌、时代、出生地、种族、命器、天赋等角色属性。
- 人生历程：经历学院阶段、事件分支、大赛和成年线，抵达不同结局。
- 存档恢复：自动保存当前人生；刷新后校验快照并恢复进度。
- 内容扩展：通过内容包替换创建规则、叙事和词汇。
- 触屏操作：转盘、按钮和对话框适配移动浏览器。

![命运转盘桌面界面](docs/images/01-web-wheel.png)

## 本地运行

需要 Node.js 18 或更高版本；具体依赖见 [package.json](package.json)。

```bash
git clone https://github.com/rowanjove/wheel-of-life.git
cd wheel-of-life
npm ci
npm run dev
```

打开终端显示的地址，通常为 `http://127.0.0.1:5173/`。Windows 用户也可在安装 Node.js 后运行根目录的 `start-game.bat`。

| 命令 | 用途 |
| --- | --- |
| `npm run test:ci` | 单次运行测试 |
| `npm run typecheck` | 检查 TypeScript 类型 |
| `npm run build` | 生成生产构建 |
| `npm run mini:install` | 安装冻结中的小程序工作区依赖 |
| `npm run build:weapp` | 实验性微信小程序构建 |
| `npm run build:tt` | 实验性抖音小程序构建 |

## 存档与内容包

当前存档保存在浏览器 localStorage，键名为 `game-life:current-run-v1`。清除站点数据会影响本地存档，存档也不会自动跨设备同步。快照带有 `packId`，与当前内容包不一致时会拒绝恢复；旧版 `douluo-*` 键支持迁移。

Web 端支持通过本地 ZIP、同源 URL 或 `/extensions/catalog.json` 安装内容包。包可覆盖 `creation`、`narrative` 和 `lexicon`；安装时检查结构、effect 白名单、体积，以及 manifest 提供的 SHA-256。前端 HMAC 用于损坏检测，不构成安全授权。

小程序工作区固定使用内置内容包，不能视为与浏览器扩展安装流程等价。详见 [小程序说明](miniapp/README.md)。

## 项目结构

- `src/content/`：内容包注册、格式与完整性校验。
- `src/data/`：默认内容数据。
- `src/rewrite/engine/`：规则引擎、状态转换与随机数。
- `src/rewrite/storage/`：存档、快照和恢复校验。
- `src/rewrite/store/`：Zustand 状态管理。
- `src/rewrite/ui/`：React 页面、转盘和对话框。
- `miniapp/`：冻结中的 Taro 适配工作区。

## 贡献与许可

提交前运行测试、类型检查和生产构建。流程见 [贡献指南](CONTRIBUTING.md)，发布验收见 [发布检查清单](docs/RELEASE_CHECKLIST.md)。

转盘组件参考 [spin-wheel](https://github.com/CrazyTim/spin-wheel)。代码采用 [MIT License](LICENSE)；内容与署名边界见 [NOTICE](NOTICE)。不要提交未经授权的小说、动漫或游戏文本及素材；个人内容包不应混入公开发布资产。安全边界见 [SECURITY.md](SECURITY.md)。
