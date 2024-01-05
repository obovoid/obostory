/* 
    Copyright (c) 2024, Obovoid
    All rights reserved.

    This source code is licensed under the GPL-3.0-style license found in the
    LICENSE file in the root directory of this source tree.
*/

import { saveAppCache } from './components/cache/storage.js';
import { app } from './renderer.js';

async function init() {
    const in_app = app(async () => {
        const cache = await window.API.getStorageKey('app');

        saveAppCache(cache);
    })
    if (!in_app) return console.warn('Cache initializing aborted. Not in app environment.')
}
await init();

import './renderer.js'
import './scripts/global.js'
import './translations/language.js'
import './scripts/settings.js'
import './scripts/controls.js'