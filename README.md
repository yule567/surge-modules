# surge-modules

## 文件功能说明

| 文件 | 中文说明 |
|---|---|
| `archive/` | 历史版本归档 |
| `scripts/` | 模块脚本目录 |
| `Custom-Rules.sgmodule` | 自定义规则覆写 |
| `README.md` | 仓库使用说明 |
| `Spotify.sgmodule` | Spotify 去广告 |
| `Web-Dashboard.sgmodule` | Surge 网页控制面板 |
| `YouTube.sgmodule` | YouTube 去广告 |
| `ad-probe.js` | 通用广告嗅探脚本 |
| `ad-probe.sgmodule` | 通用广告嗅探模块 |

## YouTube 去广告（iOS）

Surge 远程模块订阅地址：

```
https://raw.githubusercontent.com/yule567/surge-modules/main/YouTube.sgmodule
```

在 Surge → 模块 → 从 URL 安装并启用。需要开启 HTTPS 解密并信任 Surge CA 证书，关闭其他 YouTube 去广告模块，再重新启动 YouTube App 测试。

此仓库托管 .sgmodule 配置，但 JavaScript 来自 [Maasea/sgmodule](https://github.com/Maasea/sgmodule)，不是独立维护的脚本。YouTube iOS 片头广告不保证全部去除；如果仍有广告，请查看 Surge 最近请求中 youtubei.googleapis.com 的脚本执行记录。

## Spotify 原创实验版（iOS）

远程订阅：

```
https://raw.githubusercontent.com/yule567/surge-modules/main/Spotify.sgmodule
```

使用本仓库自编 `scripts/spotify-local.js`，**不再调用任何第三方 JS**。须启用 Surge 脚本与 MitM，信任 CA 证书。只在已匹配的 JSON 响应中尝试过滤广告展示字段和随机播放状态提示；Protobuf、音频广告流以及服务器端 Premium 权限都不会被修改。因此本实验版**不能保证去掉音频广告或强制随机播放**，不要当作已完成的 Premium 解锁。

原上游方案备份：`archive/Spotify-upstream.sgmodule`。测试本版时关闭其他 Spotify 模块。
