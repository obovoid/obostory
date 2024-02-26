/* 
    Copyright (c) 2024, Obovoid
    All rights reserved.

    This source code is licensed under the GPL-3.0-style license found in the
    LICENSE file in the root directory of this source tree.
*/
'use strict';

import { ipcRenderer, contextBridge } from 'electron'; 

contextBridge.exposeInMainWorld('API', {
    quit: userQuit,
    getStorageKey,
    setStorageKey,
    newError,
    openURL,
    showAppInfo,
    updateLanguageId,
    requestRestart,
    onWindowEvent
})

function userQuit() {
    ipcRenderer.send('quit');
}

/**
 * Retrieves a value from the storage based on the given key.
 * @param {string} key - The key used to retrieve the value from the storage.
 * @returns {Promise<string>} The value associated with the given key.
*/
async function getStorageKey(key: string): Promise<string> {
    const result = await ipcRenderer.invoke('getStorageKey', key);
    return result;
}


/**
 * Sets a value in the storage based on the given key.
 * @param {string} key - The key used to store the value in the storage.
 * @param {string} value - The value to be stored in the storage.
*/
function setStorageKey(key: string, value: string, storagePoint: StoragePoint = "general") {
    if (!key.startsWith('app.')) {
        key = 'app.' + key;
    }

    ipcRenderer.send('setStorageKey', key, value, storagePoint);
}

function newError(errorString: string) {
    console.log("sending Error", errorString);
    ipcRenderer.send('remoteError', errorString);
}

function isValidUrl(urlString: string): boolean {
    const urlPattern = new RegExp('^(https?:\\/\\/)?' + // validate protocol
        '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // validate domain name
        '((\\d{1,3}\\.){3}\\d{1,3}))' + // validate OR ip (v4) address
        '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // validate port and path
        '(\\?[;&a-z\\d%_.~+=-]*)?' + // validate query string
        '(\\#[-a-z\\d_]*)?$', 'i'); // validate fragment locator
    return !!urlPattern.test(urlString);
}

/**
 * Opens a link in the default web browser.
 * @param {string} url - The URL of the link to open.
 * @throws {TypeError} If the link argument is not a string, or if the link is not a valid URL.
 */
function openURL(url: string) {
    if (!isValidUrl(url)) {
        throw new Error(`Invalid URL: ${url}`);
    }

    ipcRenderer.send('requestOpenUrl', url);
}

/**
 * Opens the application's about window.
*/
function showAppInfo() {
    ipcRenderer.send('showAppInfo');
}

/**
 * Updates the language id in the application.
 * @param {string} languageId - The language id to update to.
*/
function updateLanguageId(languageId: string) {
    console.log('Updating Language Id to: ' + languageId);
    ipcRenderer.send('updateLanguageId', languageId);
    requestRestart();
}

function requestRestart(options?: RequestOptions) {
    ipcRenderer.send('requestRestart', options);
}

const windowEvents: GlobalObject = {}

function onWindowEvent(eventName: string, callback: DefaultCallback) {
    if (!windowEvents[eventName]) {
        windowEvents[eventName] = [];
    }
    windowEvents[eventName].push(callback);
}

ipcRenderer.on('receiver', async (_event, actionMessage, customParameter, id) => {
    let result;
    switch (actionMessage) {
        case 'translateContextId':
            callWindowEvent('translateContextId', customParameter, (res: string) => {
                result = res;
            });
            break
    }
    ipcRenderer.send(id, result);
});

function callWindowEvent(eventName: string, param: Function, callback: Function) {
    const callbacks = windowEvents[eventName];
    if (callbacks) {
        const cp_cb = callbacks.slice();
        cp_cb.forEach((callback: Function) => {
            param = callback(param);
        });
    }

    if (callback) {
        callback(param);
    }
}