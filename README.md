# surge-modules

## YouTube 去广告（iOS）

Surge 远程模块订阅地址：

```
https://raw.githubusercontent.com/yule567/surge-modules/main/YouTube.sgmodule
```

在 Surge → 模块 → 从 URL 安装并启用。需要开启 HTTPS 解密并信任 Surge CA 证书，关闭其他 YouTube 去广告模块，再重新启动 YouTube App 测试。

此仓库托管 .sgmodule 配置，但 JavaScript 来自 [Maasea/sgmodule](https://github.com/Maasea/sgmodule)，不是独立维护的脚本。YouTube iOS 片头广告不保证全部去除；如果仍有广告，请查看 Surge 最近请求中 youtubei.googleapis.com 的脚本执行记录。
