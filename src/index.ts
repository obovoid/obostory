/* 
    Copyright (c) 2024, Obovoid
    All rights reserved.

    This source code is licensed under the GPL-3.0-style license found in the
    LICENSE file in the root directory of this source tree.
*/
"use strict";
import { app, BrowserWindow, ipcMain, dialog, shell, globalShortcut } from 'electron';
// This allows TypeScript to pick up the magic constants that's auto-generated by Forge's Webpack
// plugin that tells the Electron app where to look for the Webpack-bundled app code (depending on
// whether you're running in development or production).
declare const MAIN_WINDOW_WEBPACK_ENTRY: string;
declare const MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY: string;

import path from 'node:path';
import storage from 'electron-store'
const processStorage = new storage();
const storagePath:string = getUserSelectedPath() || app.getPath("userData");
console.log(`Starting App in storage: ${storagePath}`);

const Storage = new storage({cwd: storagePath as string});

import fs from 'fs';
import crypto from 'crypto';

process.on("uncaughtException", (error: Error) => {
  console.error(error);
  process.exit(1);
})

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit();
}

/**
 * Returns the window bounds based on the user's preferences.
 *
 * @returns {number[]} The window bounds as an array of width and height.
 */
function getWindowBounds(): number[] {
  const prefix_bounds = [800, 600];

  if (processStorage.get("app.settings.storeWindowBounds") === false) {
    return prefix_bounds;
  }

  const bounds: number[] = processStorage.get("windowBounds") as number[];

  if (bounds) {
    return bounds;
  }

  processStorage.set("windowBounds", prefix_bounds);
  return prefix_bounds;
}

/**
 * Saves the current window bounds to the system storage.
 *
 * @param {number[]} size - The window size as an array of width and height.
 */
function saveWindowBounds(size: number[]): void {
  if (!Array.isArray(size) || size.length !== 2) {
    throw new Error(
      `Expected an array for the size argument, got ${typeof size} instead`
    );
  }
  return processStorage.set("windowBounds", size);
}

/**
 * Saves the current window position to the system storage.
 *
 * @param {number[]} pos - The window position as an array of x and y in pixels.
 */
function saveWindowPosition(pos: number[]): void {
  if (!Array.isArray(pos) || pos.length !== 2) {
    throw new Error(
      `Expected an array for the pos argument, got ${typeof pos} instead`
    );
  }
  return processStorage.set("windowPosition", pos);
}

/**
 * Returns the window position based on the user's preferences.
 *
 * @returns {number[]} The window position as an array of x and y in pixels.
 */
function getWindowPosition(): number[] | null {
  const position = processStorage.get("windowPosition");
  console.log(position)

  if (Storage.get("app.settings.storeWindowPosition") == false) {
    return null;
  }

  if (position) return position as number[];
  return null;
}

let global_window:BrowserWindow;

const [boundsWidth, boundsHeight] = getWindowBounds();
const WINDOW = async (): Promise<void> => {
  const mainWindow = new BrowserWindow({
    height: boundsHeight,
    width: boundsWidth,
    webPreferences: {
      preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
      nodeIntegration: false,
      contextIsolation: true
    },
    icon: path.join(__dirname, "branding", "icon2.png"),
  });

  // template for the menu
  // const menu = Menu.buildFromTemplate([
  //     {
  //         label: app.name,
  //         submenu: [
  //             {
  //                 click: () => win.webContents.send('receiver', 'quit'),
  //                 label: 'Quit'
  //             }
  //         ]
  //     }
  // ]);
  // Menu.setApplicationMenu(menu);

  const window_position = getWindowPosition();
  if (window_position) {
    // Only set if a position was set.
    mainWindow.setPosition(window_position[0], window_position[1]);
  }

  mainWindow.on('resize', () => saveWindowBounds(mainWindow.getSize()));
  mainWindow.on('moved', () => saveWindowPosition(mainWindow.getPosition()));

  mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);

  const userSelectedPath = getUserSelectedPath();
  if (!userSelectedPath) {
    // Await to not register reload shortcut.
    await showPathSelectionQuestionDialog();
  }

  // shortcuts

  globalShortcut.register('f5', () => {
    console.log("reloading environment...");
    mainWindow.reload();
  })

  mainWindow.webContents.openDevTools();
  global_window = mainWindow;
};

function getUserSelectedPath(): string {
  return processStorage.get("storagePath") as string;
}

interface MessageBoxOptions {
  type: "question" | "none" | "info" | "error" | "warning";
  title: string;
  message: string;
  buttons?: string[];
}

async function showPathSelectionQuestionDialog(): Promise<boolean> {
  const messageBoxOptions: MessageBoxOptions = {
    type: "question",
    title: "Storage Path Selection",
    message: `You have not selected a storage path yet. Do you want to select one, or do you want to use the default storage path at\n${app.getPath("userData")}?`,
    buttons: ["Change Storage Path", "Use Default Storage Path"]
  }

  const { response } = await dialog.showMessageBox(messageBoxOptions);
  if (response == 1) return false;

  const userSelectedPath = await dialog.showOpenDialog({
    properties: ['openDirectory'],
    defaultPath: storagePath
  });
  if (!userSelectedPath.canceled) {
    processStorage.set("storagePath", userSelectedPath.filePaths[0]);
    return true;
  } else {
    processStorage.set("storagePath", app.getPath("userData"));
    return false;
  }
}

app.on('ready', WINDOW);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Support for MAC-OS
app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    WINDOW();
  }
});

ipcMain.on("quit", () => {
  console.log("process has been stopped by the user");
  app.quit();
});

ipcMain.handle("getStorageKey", (_event, key: string) => {
  console.log(`Retrieving storage entry from system for "${key}"`);
  return Storage.get(key);
});

ipcMain.on("setStorageKey", (_event, key: string, value: string | object, storagePoint: StoragePoint) => {
  console.log('updating key', key, value, storagePoint);
  if (storagePoint === "general") {
    Storage.set(key, value);
  } else if (storagePoint === "process") {
    processStorage.set(key, value);
    Storage.set(key, value);
  }
  console.log(`Storage key "${key}" has been set to ${value}`);
});

ipcMain.on("updateLanguageId", (_event, languageId: string) => {
  Storage.set("app.general.language", languageId);
});

let application_crashed = false;
ipcMain.on("remoteError", (_event, errorMessage) => {
  // App process does not run in sync with the frontend part and therefore we need to ensure that the application can only crash once.
  if (application_crashed) return;
  application_crashed = true;

  console.log("new Exception: ", errorMessage);
  const messageBoxOptions: MessageBoxOptions = {
    type: "error",
    title: "Unhandled Error Exception",
    message: errorMessage,
  };
  dialog.showMessageBoxSync(messageBoxOptions);

  app.exit(1);
});

/**
 * Opens a given URL in the default web browser.
 * @param {string} url - The URL to open.
 * @returns {boolean} Returns `true` if the URL was opened successfully
 */
function openURL(url: string): boolean {
  shell.openExternal(url);
  return true;
}

ipcMain.on("requestOpenUrl", async (_event, url: string) => {
  const messageBoxOptions: MessageBoxOptions = {
    type: "question",
    title: "Open this link in your browser?",
    message: `You are about to open the shown link below in your browser.\nDo you wish to continue?\n\n"${url}"`,
    buttons: ["Open in Browser", "Dismiss"],
  };

  const { response } = await dialog.showMessageBox(messageBoxOptions);
  if (response == 1) return false;

  return openURL(url);
});

declare global {
  interface String {
    format(...args: string[]): string;
  }
}

String.prototype.format = function (...args: string[]): string {
  return this.replace(/{(\d+)}/g, function (match: string, number: number) {
    return typeof args[number] != "undefined" ? args[number] : match;
  });
};

ipcMain.on("requestRestart", async (_event, options = {}): Promise<void> => {
  const opts = options;
  // Wait to finish all tasks before restarting the app.
  await new Promise((resolve) => {
    setTimeout(() => {
      resolve(null);
    }, 100);
  });

  const title =
    (await contextIdToMessage("ipc.requestRestart.title")) || "invalid";
  const message =
    (await contextIdToMessage("ipc.requestRestart.message")) || "invalid";
  const only_once =
    (await contextIdToMessage("ipc.requestRestart.onlyOnce")) || "invalid";
  const agree =
    (await contextIdToMessage("ipc.requestRestart.agree")) || "invalid";
  const disagree =
    (await contextIdToMessage("ipc.requestRestart.disagree")) || "invalid";
  const messageBoxOptions: MessageBoxOptions = {
    type: "question",
    title: title,
    message: String(message).format(opts.once ? only_once : ""),
    buttons: [agree, disagree],
  };

  const { response } = await dialog.showMessageBox(messageBoxOptions);
  if (response == 1) return;

  // note to future: relaunching creates an Address Error, except if this function gets called in the packaged executable!
  return app.relaunch({ args: process.argv.slice(1).concat(['--relaunch'])}), app.exit(1);
});

ipcMain.on("requestSaveProject", async (_event, project: string, content: string) => {
  writeProjectToDisk(project, content);
  return true;
});

ipcMain.handle("requestLoadProject", async (_event, project: string = null) => {
  if (project) {
    const project_data = readProjectFromDisk(project);
    if (!project_data) throw new Error(`Project "${project}" does not exist`);
    return project_data;
  }

  const userSelectedFile = await dialog.showOpenDialog({
    properties: ["openFile"],
    defaultPath: path.join(storagePath, "projects"),
    filters: [{ name: "OSP", extensions: ["osp"] }],
  });

  if (userSelectedFile.canceled) return null;
  console.log(`Loading project from "${userSelectedFile.filePaths[0]}"`);
});

function writeProjectToDisk(project: string, content: string): void {
  const dir_exists = fs.existsSync(path.join(storagePath, "projects"));
  if (!dir_exists) {
    fs.mkdirSync(path.join(storagePath, "projects"));
  }

  const buffer = stringToBuffer(content);
  fs.writeFileSync(
    path.join(storagePath, "projects", `${project}.osp`),
    buffer
  );
}

function readProjectFromDisk(project: string): string {
  const buffer = fs.readFileSync(
    path.join(storagePath, "projects", `${project}.osp`),
    { encoding: "utf8" }
  );
  return bufferToString(buffer);
}

// writeProjectToDisk('test', 'project.set.title@sometitle project.create.profile@profile_name profile_name.set.birthdate@1990-01-01');
// console.log(readProjectFromDisk('test'));

function stringToBuffer(string: string) {
  return Buffer.from(string).toString("base64");
}

function bufferToString(buffer: string): string {
  // The written Buffer gets read as a string, which is why we set buffer to the type of string and convert it back to a buffer.
  const decodedBuffer = Buffer.from(buffer, "base64");
  return decodedBuffer.toString();
}

ipcMain.on("showAppInfo", () => {
  const messageBoxOptions: MessageBoxOptions = {
    type: "info",
    title: "App Informations Obostory",
    message: `Programmed by Obovoid\nVersion: WIP 0.1.6 \nNode: ${process.versions.node}\nElectron: ${process.versions.electron}\nChromium: ${process.versions.chrome}`,
  };
  dialog.showMessageBoxSync(messageBoxOptions);
  return true;
});

// generate a unique id with the length of 16 characters including all utf-8 characters.
function generateUniqueId(): string {
  return crypto.randomBytes(16).toString("hex");
}

/**
 * Sends a message to the Bridge process and returns a response.
 * @param {string} actionMessage - The message to send to the Bridge process.
 * @param {any} [customParameter] - Optional parameter to send to the Bridge process.
 * @returns {Promise<any>} A promise that resolves with the response from the Bridge process.
 */
async function sendMessageToBridge(actionMessage: string, customParameter: GeneralType = null) {
  return new Promise((resolve, reject) => {
    const id = generateUniqueId();
    let resolved = false;

    ipcMain.once(id, (_event, data) => {
      resolve(data);
      resolved = true;
    });

    console.log('message to bridge: ', actionMessage, customParameter, id);
    global_window.webContents.send(
      "receiver",
      actionMessage,
      customParameter,
      id
    );

    setTimeout(() => {
      if (!resolved) {
        ipcMain.removeHandler(id);
        reject(new Error("message to bridge Timeout"));
      }
    }, 8000);
  });
}

async function contextIdToMessage(contextId: string): Promise<string> {
  const string_result = await sendMessageToBridge(
    "translateContextId",
    contextId
  ) as string;
  return string_result;
}