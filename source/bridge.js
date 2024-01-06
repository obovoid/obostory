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
    newError,
    openURL,
    showAppInfo,
    updateLanguageId
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

const isValidUrl = urlString=> {
    const urlPattern = new RegExp('^(https?:\\/\\/)?'+              // validate protocol
        '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|'+         // validate domain name
        '((\\d{1,3}\\.){3}\\d{1,3}))'+                              // validate OR ip (v4) address
        '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+                          // validate port and path
        '(\\?[;&a-z\\d%_.~+=-]*)?'+                                 // validate query string
        '(\\#[-a-z\\d_]*)?$','i');                                  // validate fragment locator
    return !!urlPattern.test(urlString);
}

function openURL(link) {
    if (typeof link !== 'string') throw new Error(`Unable to use ${link} as string value. Argument must be a valid string and a valid link!`);
    if (!isValidUrl(link)) throw new Error(`Unable to use ${link} as valid link string. Please ensure that the formatting for this link is correct.`);

    ipcRenderer.send('requestOpenUrl', link);
}

function showAppInfo() {
    ipcRenderer.send('showAppInfo');
}

// This function creates a direct application crash error.
function newError(errorString) {
    console.log("sending Error", errorString);
    ipcRenderer.send('remoteError', errorString)
}

function updateLanguageId(id) {
    console.log("updating Language Id to: ", id);
    ipcRenderer.send('updateGeneralLanguage', id);
}