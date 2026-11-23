# surge-modules

## YouTube 去广告（iOS）

Surge 远程模块订阅地址：

```
https://raw.githubusercontent.com/yule567/surge-modules/main/YouTube.sgmodule
```

在 Surge → 模块 → 从 URL 安装并启用。需要开启 HTTPS 解密并信任 Surge CA 证书，关闭其他 YouTube 去广告模块，再重新启动 YouTube App 测试。

此仓库托管 .sgmodule 配置，但 JavaScript 来自 [Maasea/sgmodule](https://github.com/Maasea/sgmodule)，不是独立维护的脚本。YouTube iOS 片头广告不保证全部去除；如果仍有广告，请查看 Surge 最近请求中 youtubei.googleapis.com 的脚本执行记录。

## Spotify 去广告与取消强制随机播放（iOS）

远程模块订阅：

```
https://raw.githubusercontent.com/yule567/surge-modules/main/Spotify.sgmodule
```

安装：Surge → 模块 → 从 URL 安装；确认「脚本」「HTTP 重写」和 MitM 已开启，CA 证书已信任。建议先登录 Spotify，再启用模块，关闭并重启 App。

基于 [app2smile/rules](https://github.com/app2smile/rules/blob/master/module/spotify.module) 的规则，远程脚本仍从 app2smile 加载。上游称可尝试过滤播放广告、去除随机播放限制，但仅属于部分 Premium 功能修改，能否生效受版本、账号与服务器限制；不能保证完全解锁。不要与其他 Spotify 模块同时启用。
