<p align="center">
    <img src="https://i.imgur.com/R10ivg9.png" alt="带有 Pyrodactyl 徽标的横幅">
</p>

<p align="center">
 <a aria-label="Made by Pyro Inc." href="https://pyro.host"><img src="https://i.imgur.com/uvIy6cI.png"></a>
 <a aria-label="Join the Pyrodactyl community on Discord" href="https://discord.gg/UhuYKKK2uM?utm_source=githubreadme&utm_medium=readme&utm_campaign=OSSLAUNCH&utm_id=OSSLAUNCH"><img alt="" src="https://i.imgur.com/qSfKisV.png"></a>
</p>

<p align="center">
  <a href="https://github.com/pyrodactyl-oss/pyrodactyl/actions/workflows/dev-build.yaml">
    <img src="https://github.com/pyrodactyl-oss/pyrodactyl/actions/workflows/dev-build.yaml/badge.svg" alt="Docker">
  </a>
</p>

<h1 align="center">Pyrodactyl</h1>

> [!NOTE]
> All Issues and PRs should be made in the [pyrodactyl-oss repo](https://github.com/pyrodactyl-oss/pyrodactyl).

> [!WARNING]
> Pyrodactyl 正在开发中并处于预发布阶段。部分界面元素可能存在缺陷，可能会有一些已知或未知的错误。

> [!NOTE]
> 在安装前请阅读我们的文档： [https://pyrodactyl.dev](https://pyrodactyl.dev/docs/pyrodactyl)。

> [!IMPORTANT]
> 如遇 Pyrodactyl 相关问题，请优先使用 [Pyrodactyl GitHub Discussions](https://github.com/pyrohost/pyrodactyl/discussions) 或 [Pyrodactyl Discord](https://discord.gg/UhuYKKK2uM?utm_source=githubreadme&utm_medium=readme&utm_campaign=OSSLAUNCH&utm_id=OSSLAUNCH)，而非 Pterodactyl 或 Pelican 的支持渠道。

Pyrodactyl 是基于 Pterodactyl 的游戏服务器面板，聚焦性能优化、重构的无障碍界面与优秀的开发者体验。构建更快、体积更小：Pyrodactyl 旨在成为性能最优的 Pterodactyl 变体。

[![Dashboard Image](./.github/server-menu.png)](https://panel.pyro.host)

## 与原生 Pterodactyl 的差异

- **更小的 bundle 大小：** Pyrodactyl 使用 Vite 构建，并通过大量设计优化使初始下载体积比主流 Pterodactyl 分支（包括 Pelican）**小超过 170 倍**（见图）。
- **更快的构建速度：** 借助 Turbo，Pyrodactyl 的构建在毫秒级完成。无缓存的冷构建也能在 **7 秒内**完成。
- **更快的加载速度：** 相较于其他闭源 Pterodactyl 分支和 Pelican，Pyrodactyl 的页面加载平均**快超过 16 倍**。更智能的代码拆分与按需加载使面板仅下载当前页面所需的资源；更优的缓存策略让操作更“迅捷”。
- **更高的安全性：** 现代化架构意味着 **多数重大且易被利用的 CVE 在本项目中并不存在**。另外，我们在生产构建中实现了 SRI（子资源完整性）与完整性校验。
- **更好的可访问性：** Pyro 致力于让游戏更加普及且可访问。Pyrodactyl 遵循最新的 Web 无障碍规范，**完整键盘可操作（包含上下文菜单）**，并兼容屏幕阅读器。
- **更易上手：** Pyrodactyl 采用友好且直观的界面设计，使任何人都能自信地运行游戏服务器。

![Dashboard Image](https://i.imgur.com/kHHOW6P.jpeg)

## 安装 Pyrodactyl

有关快速入门的安装步骤，请参阅我们的文档： [Installation](https://pyrodactyl.dev/docs/pyrodactyl/installation)。

> [!NOTE]
> 目前仅在开发环境下支持 Windows。

## 本地开发

Pyrodactyl 提供多种简便方式以启动一个可用的、功能完备的开发环境。有关详细说明请参阅本地开发文档： [Local Development](https://pyrodactyl.dev/docs/pyrodactyl/local-development)。

## Star 历史

<a href="https://star-history.com/#pyrodactyl-oss/pyrodactyl&Date">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://api.star-history.com/svg?repos=pyrohost/pyrodactyl&type=Date&theme=dark" />
    <source media="(prefers-color-scheme: light)" srcset="https://api.star-history.com/svg?repos=pyrohost/pyrodactyl&type=Date" />
    <img alt="Star History Chart" src="https://api.star-history.com/svg?repos=pyrohost/pyrodactyl&type=Date" />
  </picture>
</a>

## 许可

Pterodactyl® Copyright © 2015 - 2022 Dane Everitt and contributors.

Pyrodactyl™ Copyright © 2023-Present Pyro Inc. and contributors.

Apache-2.0
