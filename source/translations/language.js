/* 
    Copyright (c) 2024, Obovoid
    All rights reserved.

    This source code is licensed under the GPL-3.0-style license found in the
    LICENSE file in the root directory of this source tree.
*/

import { global } from '../scripts/global.js';
import { onGlobalReady } from '../components/promises/onGlobalReady.js';
import { Setting } from '../scripts/settings.js'
import { app } from '../renderer.js';
import { safeUnfoldCache } from '../components/cache/storage.js';

// language imports
import { en_US } from './en_US.js'
import { de_DE } from './de_DE.js';

const language = {
    en_US,
    de_DE
}

onGlobalReady(() => {
    document.querySelectorAll('[data-translate]').forEach(el => {
        const translation_id = el.dataset.translate
        el.innerText = global.translate(translation_id) || `translation missing {${translation_id}}`
    });

    const languageSelection = new Setting('selection');
    languageSelection.setCategory('general');
    languageSelection.setTitle(global.translate("settings.general.language.title"));
    languageSelection.setDescription(global.translate("settings.general.language.description"))
    const langkey = Object.keys(language)
    languageSelection.setOptions(langkey);
    languageSelection.setRestartRequired(true);
    languageSelection.createAndResult(result => {
        app(() => {
            window.API.updateLanguageId(result);
        });
    });
    languageSelection.selectionSetValue(safeUnfoldCache("general.language") || "en_US");
})

export { language }