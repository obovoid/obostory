/* 
    Copyright (c) 2023, Obovoid
    All rights reserved.

    This source code is licensed under the GPL-3.0-style license found in the
    LICENSE file in the root directory of this source tree.
*/

const {app, BrowserWindow} = require('electron');
const path = require('node:path');
const {crashReporter} = require('electron');

// doesn't seem to work atm
// Crash Reporter to report crashes to a txt file (instead of a server)
crashReporter.start({
    productName: 'OboStory',
    companyName: 'Obovoid',
    submitURL: path.join(__dirname, 'crashes.txt'),
    uploadToServer: false
})

const WINDOW = () => {
    // window default settings. Overwritten by user, if changed any time.
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, 'bridge.js')
        }
    });

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