/* 
    Copyright (c) 2024, Obovoid
    All rights reserved.

    This source code is licensed under the GPL-3.0-style license found in the
    LICENSE file in the root directory of this source tree.
*/

import { saveAppCache } from './components/cache/storage.js';
import { app } from './renderer.js';

async function init() {
    app(async () => {
        // if in Electron app, load the cache from storage
        const cache = await window.API.getStorageKey('app');

        // Save the cache to the cache variable in storage.js
        saveAppCache(cache);
    });
}
await init();

import './renderer.js'
import './scripts/global.js'
import './translations/language.js'
import './scripts/settings.js'
import './scripts/controls.js'