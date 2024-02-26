'use strict';

// Dependencies:
import './dependencies/popper.min.js'
import './dependencies/bootstrap.min.css'
import './dependencies/bootstrap.bundle.min.js'

// Styles:
import './styles/root.css'
import './styles/main.css'
import './styles/settings.css'
import './styles/playground.css'

// Components:

// Saving settings before loading components to ensure the settings are immediately loaded when needed.
import { saveUserSettings } from './components/utils/storage';
import { app } from './components/startup'
import { Translator } from './components/utils/translator'

async function init() {
    app(async () => {
        const settings = await window.API.getStorageKey('app');

        saveUserSettings(settings);

        const translator = new Translator({stringErrorOnMissingTranslation: true, formatting: 'default'});
        window.API.onWindowEvent('translateContextId', (id: string) => {
            const translation = translator.translate(id);
            return translation;
        });
    })
}
init();


import './components/startup'
import './components/translation'
import './components/controls'
import './components/pages/settings/index'
import './components/app'
import './components/pages/playground/index'