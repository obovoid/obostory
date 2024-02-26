/* 
    Copyright (c) 2024, Obovoid
    All rights reserved.

    This source code is licensed under the GPL-3.0-style license found in the
    LICENSE file in the root directory of this source tree.
*/

'use strict';

import * as language from '../../locales/language';
import { safeUnfoldCache } from './storage';

// Types are not in types.d.ts because they are only being used here.
declare type TranslatorFormatOptions = "default" | "uppercase" | "lowercase" | "capitalize"

declare interface TranslatorOptions {
    stringErrorOnMissingTranslation?: boolean;
    formatting?: TranslatorFormatOptions;
}

class Translator {
    stringErrorBoolean: boolean;
    format: TranslatorFormatOptions;
    constructor(options: TranslatorOptions) {
        this.stringErrorBoolean = options.stringErrorOnMissingTranslation ?? true;
        this.format = options.formatting || "default";
    }

    translate(translation_id: string) {
        const language_id = (safeUnfoldCache("general.language") ?? navigator.language) as string
        let default_language:string = language_id.replace(/\-/gm, '_');
        if (!language[default_language as keyof typeof language]) {
            default_language = "en_US";
        }

        const translationObject = language[default_language as keyof typeof language]
        if (translationObject && translationObject[translation_id]) {
            const translated_string = translationObject[translation_id]

            if (this.format !== "default") {
                if (translated_string instanceof Array) {
                    throw new Error(`Unable to format String[]! ${translation_id}`)
                }

                switch (this.format) {
                    case "uppercase":
                        return translated_string.toUpperCase();
                    case "lowercase":
                        return translated_string.toLowerCase();
                    case "capitalize":
                        return translated_string.charAt(0).toUpperCase() + translated_string.slice(1);
                }
            }

            return translationObject[translation_id] as string;
        } else if (this.stringErrorBoolean === true) { 
            return `translation missing {${translation_id}}`
        }
    }
}

export { Translator }