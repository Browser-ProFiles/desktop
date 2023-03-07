/* eslint global-require: off, no-console: off, promise/always-return: off */

/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `npm run build` or `npm run build:main`, this file is compiled to
 * `./src/main.js` using webpack. This gives us some performance wins.
 */
import path from 'path';
import { app, BrowserWindow, Notification, shell, ipcMain } from 'electron';
import { autoUpdater } from 'electron-updater';
import log from 'electron-log';
import dotenv from 'dotenv';
import MenuBuilder from './menu';
import { resolveHtmlPath } from './util';
import { launchBrowser } from './actions/launchBrowser';
import { downloadBrowser } from './actions/downloadBrowser';
import { getLocalRevisions } from './actions/localRevisions';
import { isAxiosError } from 'axios';
import type { AxiosError } from 'axios';
import os from 'os';
import slugify from 'slugify';
import {throttle} from "./helpers/throttle";

class AppUpdater {
  constructor() {
    log.transports.file.level = 'info';
    autoUpdater.logger = log;
    autoUpdater.checkForUpdatesAndNotify();
  }
}

dotenv.config();

log.transports.file.level = 'info';

let mainWindow: BrowserWindow | null = null;

ipcMain.on('open-profile', async (event, name) => {
  const browserProfileDir = `${os.homedir()}/.browserprofiles/profiles/${slugify(String(name ?? ''))}`;

  shell.showItemInFolder(browserProfileDir);
});

ipcMain.on('launch-browser', async (event, content) => {
  try {
    const config = JSON.parse(content.options || {});
    const form = content.form || {};
    await launchBrowser(content.name, config, form, content.browserHash, content.userHash);
    event.reply('browser-launch-finish', {
      success: true,
      name: content.name ?? '',
    });
    // @ts-ignore
  } catch (e: AxiosError | Error) {
    event.reply('browser-launch-finish', {
      success: false,
      message: isAxiosError(e) ? e.response?.data?.message : e.message,
    });
    log.log(JSON.stringify(e))
    console.log('ERR', e)
  }
});

ipcMain.on('download-browser', async (event, content) => {
  try {
    const sendProgress = throttle((current: number, fullSize: number) => {
      event.reply('download-browser-progress', {
        current,
        fullSize,
      });
    }, 500);

    await downloadBrowser(content.userHash, content.browserHash, (current: number, fullSize: number) => {
      // @ts-ignore
      sendProgress(current, fullSize);
    });

    event.reply('download-browser-finish', {
      success: true,
    });
    await mainWindow?.reload();
    new Notification({
      title: content.lang === 'en' ? 'Browser downloading' : 'Загрузка браузера',
      body: content.lang === 'en' ?
        'Chromium Browser successfully installed on your computer' :
        'Браузер Chromium успешно установлен на вашем компьютере',
    }).show()
    // @ts-ignore
  } catch (e: AxiosError | Error) {
    event.reply('download-browser-finish', {
      success: false,
      message: isAxiosError(e) ? e.response?.data?.message : e.message,
    });
    log.log(JSON.stringify(e))
    console.log('ERR', e)
  }
});

ipcMain.on('get-local-revisions', async (event, content) => {
  try {
    const versions = getLocalRevisions(content.userHash ?? '');
    event.reply('local-revisions-finish', {
      success: true,
      versions,
    });
    // @ts-ignore
  } catch (e: AxiosError | Error) {
    event.reply('local-revisions-finish', {
      success: false,
      message: isAxiosError(e) ? e.response?.data?.message : e.message,
    });
    log.log(JSON.stringify(e));
    console.log('ERR', e);
  }
});

if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support');
  sourceMapSupport.install();
}

const isDebug =
  process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true';

if (isDebug) {
  require('electron-debug')();
}

/*const installExtensions = async () => {
  const installer = require('electron-devtools-installer');
  const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
  const extensions = ['REACT_DEVELOPER_TOOLS'];

  return installer
    .default(
      extensions.map((name) => installer[name]),
      forceDownload
    )
    .catch(console.log);
};*/

const createWindow = async () => {
  // await installExtensions();

  const RESOURCES_PATH = app.isPackaged
    ? path.join(process.resourcesPath, 'assets')
    : path.join(__dirname, '../../assets');

  const getAssetPath = (...paths: string[]): string => {
    return path.join(RESOURCES_PATH, ...paths);
  };

  mainWindow = new BrowserWindow({
    show: false,
    width: 1200,
    height: 800,
    minWidth: 450,
    minHeight: 300,
    icon: getAssetPath('icon.png'),
    webPreferences: {
      webSecurity: false,
      preload: app.isPackaged
        ? path.join(__dirname, 'preload.js')
        : path.join(__dirname, '../../.erb/dll/preload.js'),
    },
  });
  // @ts-ignore
  mainWindow.process = { browser: true, env: {
      REACT_APP_API_BASE_URL: process.env.REACT_APP_API_BASE_URL,
  } };

  mainWindow.loadURL(resolveHtmlPath('index.html'));

  mainWindow.on('ready-to-show', () => {
    if (!mainWindow) {
      throw new Error('"mainWindow" is not defined');
    }
    if (process.env.START_MINIMIZED) {
      mainWindow.minimize();
    } else {
      mainWindow.show();
    }
  });

  // mainWindow.webContents.openDevTools();

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  const menuBuilder = new MenuBuilder(mainWindow);
  menuBuilder.buildMenu();

  // Open urls in the user's browser
  mainWindow.webContents.setWindowOpenHandler((edata) => {
    shell.openExternal(edata.url);
    return { action: 'deny' };
  });

  // Remove this if your app does not use auto updates
  // eslint-disable-next-line
  new AppUpdater();
};

/**
 * Add event listeners...
 */

app.on('window-all-closed', () => {
  // Respect the OSX convention of having the application in memory even
  // after all windows have been closed
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app
  .whenReady()
  .then(() => {
    createWindow();
    app.on('activate', () => {
      // On macOS it's common to re-create a window in the app when the
      // dock icon is clicked and there are no other windows open.
      if (mainWindow === null) createWindow();
    });
  })
  .catch(console.log);
