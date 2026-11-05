# SNOW ATLAS 全球雪场图鉴

独立项目，与 Urban Renewal 城市更新平台无关。

- GitHub：https://github.com/cescsm93/snow-atlas
- 在线地址：独立 Vercel 部署验证后更新。
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
