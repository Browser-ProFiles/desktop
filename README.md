<h2 align="center">Desktop Application of Anti Detect browser</h2>
<p align="center">
    <img width="150px" src="https://upload.wikimedia.org/wikipedia/commons/thumb/9/91/Electron_Software_Framework_Logo.svg/1200px-Electron_Software_Framework_Logo.svg.png" />
    <img width="150px" src="https://www.svgrepo.com/show/354228/puppeteer.svg" />
</p>

<p align="center">
    Written on Electron with React, running Chromium with Puppeteer
</p>

<p align="center">
    This project uses some external libraries with changed files, such as
    <ul>
        <li>Puppeteer Extra plugin stealth (evasions)</li>
        <li>Puppeteer Page Proxy</li>
        <li>Fingerprint Injector</li>
    </ul>
</p>

<p align="center">
    <img align="center" style="margin-right: 15px" width="50px" src="https://upload.wikimedia.org/wikipedia/commons/thumb/9/91/Electron_Software_Framework_Logo.svg/1200px-Electron_Software_Framework_Logo.svg.png" alt="" />
    <img align="center" style="margin-right: 15px" width="50px" src="https://upload.wikimedia.org/wikipedia/commons/thumb/a/a7/React-icon.svg/2300px-React-icon.svg.png" alt="" />
    <img align="center" style="margin-right: 15px" height="50px" src="https://www.svgrepo.com/show/354228/puppeteer.svg" alt="" />
</p>

<p align="center"><b>Start the project</b>

<ol>
    <li>Clone this repo</li>
    <li>Rename .env.example to .env and change values</li>
    <li>Run:</li>
</ol>
</p>

<p align="center">
    Path to profile launch file:

    desktop/src/main/actions/launchBrowser.ts
</p>

    cd desktop
    npm i
    npm start

<p align="center"><b>Build for x86 arch</b></p>

    npm run build
    npm run package:mwlx64

<p align="center"><b>Build for arm arch</b></p>

    npm run build
    npm run package:mwlarm
