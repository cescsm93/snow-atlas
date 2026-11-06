# SNOW ATLAS 全球雪场图鉴

独立项目，与 Urban Renewal 城市更新平台无关。

- GitHub：https://github.com/cescsm93/snow-atlas
- 在线浏览：[https://snow-atlas.vercel.app/](https://snow-atlas.vercel.app/)
- 85座雪场，包含20座中国雪场；真实 DEM 和可追溯雪道、设施、收藏、足迹、对比、坡度分析及滑雪示意动画。
- 地形和线路模型不是官方完整名录或实时雪面；坡度为历史 DEM 沿线窗口估算。
- 商户记录可能包含雪场周边店铺，未收录/查询失败明确标注。来源见每条记录及 data/。

## 运行与验证

Node.js 24。`npm start` 启动本地静态预览；`npm test` 运行数据、来源、数学和后端测试。
前端使用同源 `/api/snow-copilot` 与 `/api/snow-terrain`。Vercel 使用项目根目录、Other 框架、无构建命令。
Copilot只读取本项目服务端环境变量 `DEEPSEEK_API_KEY`、`COPILOT_AI_ENABLED`。密钥不放进Git，不经浏览器，不调用城市更新项目。

## 来源

© OpenStreetMap contributors (ODbL)。OpenSkiData / OpenSkiMap.org, Skimap.org, Who’s On First, © Mapterhorn。
真实地形来自 Mapzen / Terrain Tiles，具体归属和采样尺度见 models/ 中 sources 与 gridSpacingMetres。
照片和票价仅按逐场来源展示；访问可用性与运营网站身份核实是不同事项。

## 独立部署配置状态

本项目使用自己的 Vercel 项目 `snow-atlas`，前端与 API 均为同源。首次独立部署已完成。
DeepSeek 原项目 Secret 不可回读，需在本项目 Settings → Environment Variables 中填入 `DEEPSEEK_API_KEY`（Production）；同时设置 `COPILOT_AI_ENABLED=true` 后重新部署。
若要推送后自动部署，需要在 Vercel 项目的 Git 设置中连接本仓库。目前源码推送和独立部署均已完成，Git 自动部署连接待配置。

### 演示问答保护
在 Vercel Production 中设置 Secret 类型的 DEEPSEEK_API_KEY 和 COPILOT_DEMO_CODE，然后重新部署。访问码仅私下交给演示参与者；前端只在当前页面内存保存，不写入网址或本地存储。没有访问码的请求在调用 DeepSeek 前拒绝。现有内存限流仅为单实例辅助保护，不能替代访问码或服务商额度控制。

### GitHub Pages 在线体验

https://cescsm93.github.io/snow-atlas/

GitHub Pages 版本为静态体验：地图、雪场资料、85 座本地 DEM 模型和有来源的缆车线路可用；2026-11-06 采集结果为 66 座有线路、18 座服务暂不可用、1 座模型范围内无映射线路；票价参考汇率直接读取 Frankfurter。DeepSeek 问答需要服务端密钥，不在 Pages 开放。缆车数据来自各模型范围内的 OpenStreetMap aerialway way，保留原始 way 链接；没有记录时显示缺失。
