/* 
    Copyright (c) 2024, Obovoid
    All rights reserved.

    This source code is licensed under the GPL-3.0-style license found in the
    LICENSE file in the root directory of this source tree.
*/
'use strict';

import { Translator } from './utils/translator';
import { onAction } from './startup';
import { Setting } from './pages/settings/render';
import { safeUnfoldCache } from './utils/storage';
import * as language from '../locales/language';

const translations = new Translator({
    stringErrorOnMissingTranslation: true,
    formatting: "default"
});

document.addEventListener('DOMContentLoaded', () => {
    onAction('ready.cache', () => {

        // Awaiting cache, otherwise translations will not be in the user selected language!
        document.querySelectorAll('[data-translate]').forEach(el => {
            if (el instanceof HTMLElement) {
                const translation_id = el.dataset.translate;
                switch (el.tagName) {
                    case 'INPUT':
                        if (el instanceof HTMLInputElement) {
                            el.value = translations.translate(translation_id) as string;
                        }
                        break;
                    default:
                        el.innerText = translations.translate(translation_id) as string;
                        break;
                }
            }
        });

        const languageSelection = new Setting('selection');
        languageSelection.setCategory('general');
        languageSelection.setTitle(translations.translate("settings.general.language.title"));
        languageSelection.setDescription(translations.translate("settings.general.language.description"))
        const langkey = Object.keys(language)
        languageSelection.setOptions(langkey);
        languageSelection.setRestartRequired(true);
        languageSelection.createAndResult((result: string) => {
            window.API.updateLanguageId(result);
        });
        languageSelection.selectionSetValue(safeUnfoldCache("general.language") as string ?? "en_US");
    })
});