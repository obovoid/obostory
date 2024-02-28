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
import { generateRandomFirstName } from './pages/playground/namegenerator';

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

        function parseAndGenerate(str: string): string {
            let result = str;
            let match;
        
            while ((match = result.match(/\{(.+?)\}/)) !== null) {
                const innerStr = match[1];
                const parsedData: ParsedData = {
                    name: null,
                    args: null
                };
        
                try {
                    const { name, args } = JSON.parse(`{${innerStr}}`);
                    parsedData.name = name;
                    parsedData.args = args;
                } catch (error) {
                    console.error('Error parsing JSON:', error);
                    return result; // Return original string in case of parsing error
                }
        
                const replacementString = generateStringFromData(parsedData);
                result = result.replace(match[0], replacementString);
            }
        
            return result;
        }

        document.querySelectorAll('[data-ftranslate]').forEach(el => {
            if (el instanceof HTMLElement) {
                const translation_parsed = el.dataset.ftranslate;
                switch (el.tagName) {
                    case 'INPUT':
                        if (el instanceof HTMLInputElement) {
                            el.value = parseAndGenerate(translation_parsed);
                        }
                        break;
                    default:
                        el.innerText = parseAndGenerate(translation_parsed);
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

function generateStringFromData(data: ParsedData): string {
    const actionName = data.name
    const args = data.args // unused for now
    let ret = ""
    switch (actionName) {
        case "translator":
            ret = translations.translate(args[0])
            break;
        case "generateRandomFirstName":
            ret = `${generateRandomFirstName()}'s`
            break;
        default:
            throw new Error(`Unknown action ${actionName} to translate function string!`);
    }

    return ret
}