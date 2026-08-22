# 首版 / 后续 Release 检查清单

面向 GitHub 开源发布。每勾一项再打 tag。

## 0. 版权与仓库卫生（必须）

- [ ] `git status` 无 `node_modules/`、`dist/`、`.env`
- [ ] **无** `extensions/**/pack.json`、`**/*.zip` 含第三方 IP
- [ ] `public/extensions/catalog.json` 不含未授权扩展
- [ ] `NOTICE` / `LICENSE` / `SECURITY.md` 已提交
- [ ] README 开源范围与「勿提交同人 IP 包」表述正确

## 1. 质量门禁（必须）

本地：

```bash
npm ci
npm test -- --run
npm run typecheck
npm run build
```

- [ ] 上述四条全部通过
- [ ] GitHub Actions `CI` 在 `main` 上为绿色

## 2. 版本与变更说明

- [ ] `package.json` 的 `version` 已 bump（如 `0.3.0`）
- [ ] 若有用户可见变更，更新 README 或简短 CHANGELOG 段落
- [ ] 提交信息清楚（中英文均可，一句说明意图）

## 3. 打 tag 与 GitHub Release

```bash
git checkout main
git pull
git tag -a v0.3.0 -m "v0.3.0: open-source ready"
git push origin main --tags
```

在 GitHub → Releases → **Draft a new release**：

- [ ] Tag: `v0.3.0`
- [ ] Title: `v0.3.0`
- [ ] 正文建议包含：
  - 这是什么（浏览器轮盘人生 / 内容包）
  - MIT 范围 + 勿上传版权包
  - 启动方式：`npm install && npm run dev` 或 `start-game.bat`
  - 已知限制：纯前端、HMAC 非信任根

## 4. 仓库设置（建议）

- [ ] Description / Topics：`game` `react` `vite` `typescript` `life-sim`
- [ ] 默认分支 `main` + 要求 PR 过 CI（Settings → Branches）
- [ ] 开启 Issues（若接受反馈）
- [ ] Security → 启用 private vulnerability reporting

## 5. 冒烟（发布后 5 分钟）

- [ ] 克隆到干净目录：`npm ci && npm run dev` 能打开
- [ ] 走一遍：起名 → 转盘 → 能进学院或至少不白屏
- [ ] 刷新后能恢复当前人生（同 pack）
- [ ] 「内容扩展」在无 zip 时表现正常（不崩溃）

## 6. 不要做

- 不要把个人 `pack.json` / 斗罗 zip 打进 Release Assets
- 不要在 README 承诺「HMAC = 安全可信第三方包」
- 不要 force-push 已发布的 tag

---

维护者备注：版权敏感内容包仅保留在维护者本地工作区，不进入公开仓库或 Release Assets。
