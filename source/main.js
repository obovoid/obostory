/* 
    Copyright (c) 2024, Obovoid
    All rights reserved.

    This source code is licensed under the GPL-3.0-style license found in the
    LICENSE file in the root directory of this source tree.
*/
'use strict';

const {app, BrowserWindow, ipcMain, dialog} = require('electron');
const path = require('node:path');
const storage = require('electron-store');
const Storage = new storage();

process.on('uncaughtException', error => {
	console.error('Exception:', error);
	process.exit(1);
});

function getWindowBounds() {
    const prefix_bounds = [800, 600]

    if (Storage.get('app.settings.storeWindowBounds') == false) {
        return prefix_bounds
    }

    const bounds = Storage.get('windowBounds');

    if (bounds) return bounds;

    Storage.set('windowBounds', prefix_bounds);
    return prefix_bounds;
}

function saveWindowBounds(size) {
    Storage.set('windowBounds', size);
}

function saveWindowPosition(pos) {
    Storage.set('windowPosition', pos);
}

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