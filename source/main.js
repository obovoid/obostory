/* 
    Copyright (c) 2024, Obovoid
    All rights reserved.

    This source code is licensed under the GPL-3.0-style license found in the
    LICENSE file in the root directory of this source tree.
*/
'use strict';

// eslint-disable-next-line no-unused-vars
const {app, BrowserWindow, ipcMain, dialog, shell, globalShortcut, Menu} = require('electron');
const path = require('node:path');
const storage = require('electron-store');
const processStorage = new storage();
const storagePath = getUserSelectedPath() || app.getPath('userData');
console.log(`Starting App in Storage: ${storagePath}`);

const Storage = new storage({cwd: storagePath});

const fs = require('fs');
const crypto = require('crypto');

process.on('uncaughtException', error => {
	console.error('Exception:', error);
	process.exit(1);
});

/**
 * Returns the window bounds based on the user's preferences.
 * 
 * @returns {number[]} The window bounds as an array of width and height.
 */
function getWindowBounds() {
    const prefix_bounds = [800, 600];

    if (Storage.get('app.settings.storeWindowBounds') === false) {
        return prefix_bounds;
    }

    const bounds = processStorage.get('windowBounds');

    if (bounds) {
        return bounds;
    }

    processStorage.set('windowBounds', prefix_bounds);
    return prefix_bounds;
}

/**
 * Saves the current window bounds to the system storage.
 *
 * @param {number[]} size - The window size as an array of width and height.
 */
function saveWindowBounds(size) {
    if (!Array.isArray(size) || size.length !== 2) {
        throw new Error(`Expected an array for the size argument, got ${typeof size} instead`);
    }
    return processStorage.set('windowBounds', size);
}

/**
 * Saves the current window position to the system storage.
 *
 * @param {number[]} pos - The window position as an array of x and y in pixels.
 */
function saveWindowPosition(pos) {
    if (!Array.isArray(pos) || pos.length !== 2) {
        throw new Error(`Expected an array for the pos argument, got ${typeof pos} instead`);
    }
    return processStorage.set('windowPosition', pos);
}

/**
 * Returns the window position based on the user's preferences.
 * 
 * @returns {number[]} The window position as an array of x and y in pixels.
 */
function getWindowPosition() {
    const position = processStorage.get('windowPosition');

    if (Storage.get('app.settings.storeWindowPosition') == false) {
        return null;
    }

    if (position) return position;
    return null;
}

let global_window;
const WINDOW = async () => {
    // window default settings. Overwritten by user, if changed any time.

    const [boundsWidth, boundsHeight] = getWindowBounds();
    const win = new BrowserWindow({
        width: boundsWidth,
        height: boundsHeight,
        webPreferences: {
            preload: path.join(__dirname, 'bridge.js'),
            nodeIntegration: false,
            contextIsolation: true
        },
        icon: path.join(__dirname, 'branding', 'icon2.png')
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

    const window_position = getWindowPosition()
    if (window_position) {
        // Only set if a position was set. Otherwise we would need to calculate the center of the screen to have a prefix position.
        // Yeah I'm lazy.
        const [x, y] = window_position
        win.setPosition(x, y, true);
    }

    win.on('resized', () => saveWindowBounds(win.getSize()));
    win.on('moved', () => saveWindowPosition(win.getPosition()));

    // load app
    win.loadFile(path.join(__dirname, 'app.html'));


    const userSelectedPath = getUserSelectedPath();
    if (!userSelectedPath) {
        // Await to not register reload shortcut.
        await showPathSelectionQuestionDialog();
    }


    // register shortcuts;

    globalShortcut.register('f5', function() {
        console.log('reloading environment...');
        win.reload();
    })
    global_window = win;
}

function getUserSelectedPath() {
    return processStorage.get("storagePath");
}

async function showPathSelectionQuestionDialog() { 
    const messageBoxOptions = {
        type: "question",
        title: "Storage Path Selection",
        message: `You have not selected a storage path yet. Do you want to select one, or do you want to use the default storage path at\n${storagePath}?`,
        buttons: ['change storage path', 'use default storage path']
    }

    const { response } = await dialog.showMessageBox(messageBoxOptions);
    if (response == 1) return;

    const userSelectedPath = await dialog.showOpenDialog({
        properties: ['openDirectory'],
        defaultPath: storagePath
    });
    if (!userSelectedPath.canceled) {
        processStorage.set("storagePath", userSelectedPath.filePaths[0]);
        return true
    } else {
        processStorage.set("storagePath", storagePath);
        return false
    }
}

// Create Window on app startup
app.whenReady().then(() => {
    WINDOW();

    // Support for MAC-OS
    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) WINDOW();
    })
})

// close app if all windows are closed
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
})

// .on is used for handling events without expectation to send a value back
// .handle is used to send values back with return
ipcMain.on('quit', () => {
    console.log('process has been stopped by the user')
    app.quit();
})

ipcMain.handle('getStorageKey', (_event, key) => {
    console.log(`Retrieving storage entry from system for "${key}"`);
    return Storage.get(key);
});

ipcMain.on('setStorageKey', (_event, key, value) => {
    Storage.set(key, value);
    console.log(`Storage key "${key}" has been set to ${value}`);
})

ipcMain.on('updateGeneralLanguage', (_event, languageId) => {
    Storage.set('app.general.language', languageId);
})

let application_crashed = false
ipcMain.on('remoteError', (_event, errorMessage) => {
    // App process does not run in sync with the frontend part and therefore we need to ensure that the application can only crash once.
    if (application_crashed) return
    application_crashed = true
    
    console.log('new Exception: ', errorMessage)
    const messageBoxOptions = {
        type: "error",
        title: "Unhandled Error Exception",
        message: errorMessage
    }
    dialog.showMessageBoxSync(messageBoxOptions);

    app.exit(1);
});

/**
 * Opens a given URL in the default web browser.
 * @param {string} url - The URL to open.
 * @returns {boolean} Returns `true` if the URL was opened successfully
 */
function openURL(url) {
  shell.openExternal(url);
  return true;
}

ipcMain.on('requestOpenUrl', async (_event, url) => {
    const messageBoxOptions = {
        type: "question",
        title: "Open this link in your browser?",
        message: `You are about to open the shown link below in your browser.\nDo you wish to continue?\n\n"${url}"`,
        buttons: ['Open in Browser', 'Dismiss']
    }

    const { response } = await dialog.showMessageBox(messageBoxOptions);
    if (response == 1) return;

    return openURL(url);
});

String.prototype.format = function() {
    let args = arguments;
    return this.replace(/{(\d+)}/g, function(match, number) {
        return typeof args[number] != 'undefined' ? args[number] : match;
    });
}

ipcMain.on('requestRestart', async (_event, options = {}) => {
    const opts = options;
    // Wait to finish all tasks before restarting the app.
    await new Promise((resolve) => {
        setTimeout(() => {
            resolve();    
        }, 100)
    });

    const title = await contextIdToMessage("ipc.requestRestart.title") || "invalid";
    const message = await contextIdToMessage("ipc.requestRestart.message") || "invalid";
    const only_once = await contextIdToMessage("ipc.requestRestart.onlyOnce") || "invalid";
    const agree = await contextIdToMessage("ipc.requestRestart.agree") || "invalid";
    const disagree = await contextIdToMessage("ipc.requestRestart.disagree") || "invalid";
    const messageBoxOptions = {
        type: "question",
        title: title,
        message: String(message).format(opts.once ? only_once : ""),
        buttons: [agree, disagree]
    }

    const { response } = await dialog.showMessageBox(messageBoxOptions);
    if (response == 1) return;

    return app.relaunch(), app.exit(1);
});

ipcMain.on('requestSaveProject', async (_event, project, content) => {
    writeProjectToDisk(project, content);
    return true;
});

ipcMain.handle('requestLoadProject', async (_event, project = null) => {
    if (project) {
        const project_data = readProjectFromDisk(project);
        if (!project_data) throw new Error(`Project "${project}" does not exist`);
        return project_data;
    }

    const userSelectedFile = await dialog.showOpenDialog({
        properties: ['openFile'],
        defaultPath: path.join(storagePath, 'projects'),
        filters: [
            { name: 'OSP', extensions: ['osp'] }
        ]
    });

    if (userSelectedFile.canceled) return null;
    console.log(`Loading project from "${userSelectedFile.filePaths[0]}"`);
});

function writeProjectToDisk(project, content) {
    const dir_exists = fs.existsSync(path.join(storagePath, 'projects'));
    if (!dir_exists) {
        fs.mkdirSync(path.join(storagePath, 'projects'));
    }

    const buffer = stringToBuffer(content);
    fs.writeFileSync(path.join(storagePath, 'projects', `${project}.osp`), buffer, (err) => {
        if (err) throw err;
    });
}

function readProjectFromDisk(project) {
    let buffer = fs.readFileSync(path.join(storagePath, 'projects', `${project}.osp`), { encoding: 'utf8' });
    return bufferToString(buffer);
}

// writeProjectToDisk('test', 'project.set.title@sometitle project.create.profile@profile_name profile_name.set.birthdate@1990-01-01');
// console.log(readProjectFromDisk('test'));

function stringToBuffer(string) {
    return new Buffer.from(string).toString('base64');
}

function bufferToString(buffer) {
    const decodedBuffer = new Buffer.from(buffer, 'base64');
    return decodedBuffer.toString();
}

ipcMain.on('showAppInfo', () => {
    const messageBoxOptions = {
        type: "info",
        title: "App Informations Obostory",
        message: `Programmed by Obovoid\nVersion: WIP 0.1.1\nNode: ${process.versions.node}\nElectron: ${process.versions.electron}\nChromium: ${process.versions.chrome}`
    }
    dialog.showMessageBoxSync(messageBoxOptions);
    return true;
});

// generate a unique id with the length of 16 characters including all utf-8 characters.
function generateUniqueId() {
    return crypto.randomBytes(16).toString('hex');
}

/**
 * Sends a message to the Bridge process and returns a response.
 * @param {string} actionMessage - The message to send to the Bridge process.
 * @param {any} [customParameter] - Optional parameter to send to the Bridge process.
 * @returns {Promise<any>} A promise that resolves with the response from the Bridge process.
 */
async function sendMessageToBridge(actionMessage, customParameter = null) {
  return new Promise((resolve, reject) => {
    const id = generateUniqueId();
    let resolved = false;

    ipcMain.once(id, (_event, data) => {
      resolve(data);
      resolved = true;
    });

    global_window.webContents.send('receiver', actionMessage, customParameter, id);

    setTimeout(() => {
      if (!resolved) {
        ipcMain.removeHandler(id);
        reject(new Error('Timeout'));
      }
    }, 8000);
  });
}

async function contextIdToMessage(contextId) {
    const string_result = await sendMessageToBridge('translateContextId', contextId);
    return string_result;
}