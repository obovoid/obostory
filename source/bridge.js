/* 
    Copyright (c) 2024, Obovoid
    All rights reserved.

    This source code is licensed under the GPL-3.0-style license found in the
    LICENSE file in the root directory of this source tree.
*/

const { ipcRenderer, contextBridge } = require('electron/renderer');

// Enabled access in all client files to window.API
// best to be used with app(() => {}) instead of directly calling window.API.
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

/**
 * Retrieves a value from the storage based on the given key.
 * @param {string} key - The key used to retrieve the value from the storage.
 * @returns {Promise<string>} The value associated with the given key.
 */
async function getStorageKey(key) {
    if (typeof key !== 'string') {
        throw new Error(`Unable to use ${key} as string key. Argument must be of type string!`);
    }
    const ret_key = await ipcRenderer.invoke('getStorageKey', key);
    return ret_key;
}

/**
 * Sets a value in the storage based on the given key.
 * @param {string} key - The key used to store the value in the storage.
 * @param {string} value - The value to be stored in the storage.
 */
function setStorageKey(key, value) {
    if (typeof key !== 'string') {
        throw new Error(`Unable to use ${key} as string key. Argument must be of type string!`);
    }
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

/**
 * Opens a link in the default web browser.
 * @param {string} link - The URL of the link to open.
 * @throws {TypeError} If the link argument is not a string, or if the link is not a valid URL.
 */
function openURL(link) {
  if (typeof link !== 'string') {
    throw new TypeError(`Expected a string for the link argument, got ${typeof link} instead`);
  }
  if (!isValidUrl(link)) {
    throw new Error(`Invalid URL: ${link}`);
  }

  ipcRenderer.send('requestOpenUrl', link);
}

/**
 * Opens the application's about window.
 */
function showAppInfo() {
    ipcRenderer.send('showAppInfo');
}

/**
 * Creates a direct application crash error.
 * @param {string} errorString - The error message to be sent to the main process.
 */
function newError(errorString) {
    console.log("sending Error", errorString);
    ipcRenderer.send('remoteError', errorString)
}

/**
 * Updates the language id in the application.
 * @param {string} id - The language id to update to.
 */
function updateLanguageId(id) {
    console.log("updating Language Id to: ", id);
    ipcRenderer.send('updateGeneralLanguage', id);
}