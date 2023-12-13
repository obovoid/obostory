/* 
    Copyright (c) 2023, Obovoid
    All rights reserved.

    This source code is licensed under the GPL-3.0-style license found in the
    LICENSE file in the root directory of this source tree.
*/

const { ipcRenderer, contextBridge } = require('electron/renderer')

// Enabled access in the renderer.js file to window.API
contextBridge.exposeInMainWorld('API', {
    quit: userQuit
})

function userQuit() {
    // ipcRenderer.send, is basicly a trigger of an event without expecting to get a value back
    // ipcRenderer.invoke is used for sending and receiving values back. ( .invoke('name', arg).then((res) => {}) )
    ipcRenderer.send('quit');
}
