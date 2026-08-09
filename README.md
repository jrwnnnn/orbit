<h1 align="center">Orbit</h1>

<p align="center"><i>A simple, lightweight webOS app for HLS streaming.</i></p>

<div align="center">
   <!-- FIND PREMADE BADGES HERE: https://github.com/Ileriayo/markdown-badges -->
   <a href="https://vuejs.org"><img src="https://img.shields.io/badge/vue.js-%2335495e.svg?style=for-the-badge&logo=vuedotjs&logoColor=%234FC08D"></a>
   <a href="https://www.typescriptlang.org/"><img src="https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white"></a>
   <a href="https://tailwindcss.com/"><img src="https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white"></a>
   <a href="./LICENSE"><img src="https://img.shields.io/github/license/jrwnnnn/orbit?style=for-the-badge"></a>
   <a href="https://github.com/jrwnnnn/orbit/stargazers"><img src="https://img.shields.io/github/stars/jrwnnnn/orbit?style=for-the-badge"></a>
</div>

<br>

Orbit is a lightweight HLS media player built for LG webOS Smart TVs. It streams curated free-to-air public channels sourced from [iptv-org](https://github.com/iptv-org/iptv) directly on the hardware without needing an external set-top box or heavy media server. Orbit is completely content-agnostic and hosts zero media assets.

## Installation

Your LG webOS TV must have Developer Mode enabled and connected to your local network before installing custom applications. Follow [these instructions](https://webostv.developer.lge.com/develop/getting-started/developer-mode-app) to enable it.

### Option 1: webOS Dev Manager (Recommended)

1. Download and install the [webOS Dev Manager](https://github.com/webosbrew/webos-dev-manager).
2. Connect the webOS Dev Manager to your TV using your Developer Mode credentials.
3. Download latest version of Orbit from the [Releases](https://github.com/jrwnnnn/orbit/releases/latest) page.
4. Open the webOS Dev Manager, click Install, and select the `.ipk` file.

### Option 2: webOS CLI (Official)

1. Install the [webOS TV CLI](https://webostv.developer.lge.com/develop/tools/cli-introduction).
2. Register and connect your TV with `ares-setup-device`.
3. Install the package:
```bash
   ares-install com.jrwnnnn.orbit_<REPLACE_WITH_YOUR_VERSION>_all.ipk -d <DEVICE_NAME>
```

## Support

If you run into any issues, please [open an issue](https://github.com/jrwnnnn/orbit/issues) and include all relevant details needed to diagnose the problem.

## License

Distributed under the MIT License.
Copyright (c) 2026 Mark Jerwin(@jrwnnnn). All rights reserved.

See the [LICENSE](LICENSE) file for full details.

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

## Contributors

<a href="https://github.com/jrwnnnn/orbit/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=jrwnnnn/orbit" />
</a>

<br>
<br>

<img src="https://forthebadge.com/images/badges/built-with-love.svg">
