/* 
    Copyright (c) 2024, Obovoid
    All rights reserved.

    This source code is licensed under the GPL-3.0-style license found in the
    LICENSE file in the root directory of this source tree.
*/
'use strict';

const {app, BrowserWindow, ipcMain, dialog, shell, globalShortcut} = require('electron');
const path = require('node:path');
const storage = require('electron-store');
const Storage = new storage();

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

    const bounds = Storage.get('windowBounds');

    if (bounds) {
        return bounds;
    }

    Storage.set('windowBounds', prefix_bounds);
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
    return Storage.set('windowBounds', size);
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
    return Storage.set('windowPosition', pos);
}

/**
 * Returns the window position based on the user's preferences.
 * 
 * @returns {number[]} The window position as an array of x and y in pixels.
 */
function getWindowPosition() {
    const position = Storage.get('windowPosition');

    if (Storage.get('app.settings.storeWindowPosition') == false) {
        return null;
    }

    if (position) return position;
    return null;
}

const WINDOW = () => {
    // window default settings. Overwritten by user, if changed any time.

    const [boundsWidth, boundsHeight] = getWindowBounds();
    const win = new BrowserWindow({
        width: boundsWidth,
        height: boundsHeight,
        webPreferences: {
            preload: path.join(__dirname, 'bridge.js'),
            nodeIntegration: false,
            contextIsolation: true
        }
    });

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

    // register shortcuts;

    globalShortcut.register('f5', function() {
        console.log('reloading environment...');
        win.reload();
    })
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

ipcMain.on('showAppInfo', () => {
    const messageBoxOptions = {
        type: "info",
        title: "App Informations Obostory",
        message: `Programmed by Obovoid\nVersion: WIP 0.1.1\nNode: ${process.versions.node}\nElectron: ${process.versions.electron}\nChromium: ${process.versions.chrome}`
    }
    dialog.showMessageBoxSync(messageBoxOptions);
    return true;
})