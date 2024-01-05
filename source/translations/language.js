/* 
    Copyright (c) 2024, Obovoid
    All rights reserved.

    This source code is licensed under the GPL-3.0-style license found in the
    LICENSE file in the root directory of this source tree.
*/

import { global } from '../scripts/global.js';
import { onGlobalReady } from '../components/promises/onGlobalReady.js';
import { Setting } from '../scripts/settings.js'

const language = {
    "en-US": {
        "window.title": "OboStory",
        "renderer.modal.header": "select an action",
        "hints.modal.recent.projects": "open your recent projects",
        "hints.modal.create.project": "create a new project",
        "hints.modal.settings": "change the application settings",
        "hints.close.application": "close this application",
        "settings.header": "settings",
        "settings.categories.general": "general",
        "settings.categories.timeline": "timeline",
        "settings.categories.profiles": "profiles",
        "settings.categories.fonts": "fonts",
        "settings.general.autocollapse.title": "Automatic Settings Collapsing",
        "settings.general.autocollapse.description": "Hide automatically listed sub-items in the categories instead of displaying them automatically",
        "settings.general.store.windowBounds.title": "Save the window size",
        "settings.general.store.windowBounds.description": "If activated, the app will automatically resize the window to the size of the last session on startup to keep your interface the same.",
        "settings.general.store.windowPosition.title": "Save the window position",
        "settings.general.store.windowPosition.description": "If activated, the app will automatically adjust the window position to that of the last session when you start it, even if you move the window to another screen.",
        "settings.general.language.title": "Language",
        "settings.general.language.description": "Set the language in which the app is displayed. If your language is not yet represented, you can of course help translate the app into more languages on Github. Visit at any time https://github.com/obovoid/obostory"
    }
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
    languageSelection.createAndResult(result => {
        console.log(result);
    })
})

export { language }