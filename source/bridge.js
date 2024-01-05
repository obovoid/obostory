/* 
    Copyright (c) 2024, Obovoid
    All rights reserved.

    This source code is licensed under the GPL-3.0-style license found in the
    LICENSE file in the root directory of this source tree.
*/

const { ipcRenderer, contextBridge } = require('electron/renderer');

// Enabled access in the renderer.js file to window.API
contextBridge.exposeInMainWorld('API', {
    quit: userQuit,
    getStorageKey,
    setStorageKey,
    newError
})

function userQuit() {
    // ipcRenderer.send, is basicly a trigger of an event without expecting to get a value back
    // ipcRenderer.invoke is used for sending and receiving values back. ( .invoke('name', arg).then((res) => {}) )
    ipcRenderer.send('quit');
}

async function getStorageKey(key) {
    if (typeof key !== 'string') throw new Error(`Unable to use ${key} as string key. Argument must be of type string!`);
    const ret_key = await ipcRenderer.invoke('getStorageKey', key);
    return ret_key;
}

function setStorageKey(key, value) {
    if (typeof key !== 'string') throw new Error(`Unable to use ${key} as string key. Argument must be of type string!`);
    ipcRenderer.send('setStorageKey', key, value);
}

// This function creates a direct application crash error.
function newError(errorString) {
    console.log("sending Error", errorString);
    ipcRenderer.send('remoteError', errorString)
}