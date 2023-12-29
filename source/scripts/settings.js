/* 
    Copyright (c) 2023, Obovoid
    All rights reserved.

    This source code is licensed under the GPL-3.0-style license found in the
    LICENSE file in the root directory of this source tree.
*/

import { global } from './global.js'
import { onGlobalReady } from '../components/promises/onGlobalReady.js';
import { unloadSettings } from '../components/settings/ui.js';
import { loadNewPage } from '../renderer.js';

const types = ['switch', 'selection']
const categories = ["general", "timeline", "profiles", "fonts"]

/**
 * @param {switch | selection} setting_type
 */
class Setting {
    constructor(setting_type) {
        if (!types.includes(setting_type)) {
            throw new Error(`Your type does not match any of the possible types. Please choose any of the following: ${JSON.stringify(types)}`);
        }

        this.type = setting_type       
        this.category = "general"
        this.title = "[title is missing]"
        this.description = "[description is missing]"
        this.isChecked = null
        this.options = null
    }
    /**
     * @param {string} categoryName
     */
    setCategory(categoryName) {
        if (!categories.includes(categoryName)) {
            throw new Error(`Your category name does not match any of the possible categories. Please choose any of the following: ${JSON.stringify(categories)}`);
        }
        this.category = categoryName
    }
    /**
     * @param {string} optionTitle
     */
    setTitle(optionTitle) {
        if (typeof optionTitle != 'string') throw new Error(`Your title must be of type string and can't be ${typeof optionTitle}`);
        if (optionTitle.length < 4) throw new Error('Your title does not match the required length. Your title needs to be 4 characters or longer.');

        this.title = optionTitle
    }
    /**
     * @param {string} optionDescription
     */
    setDescription(optionDescription) {
        if (typeof optionDescription != 'string') throw new Error(`Your description must be of type string and can't be ${typeof optionTitle}`);
        if (optionDescription.length < 11) throw new Error('Your description does not match the required length. Your description needs to be 11 characters or longer.');

        this.description = optionDescription
    }
    /**
     * @param {true | false} boolean
     */
    setSwitchIsChecked(boolean) {
        this.isChecked = Boolean(boolean);
    }
    /**
     * @param {string[]} array
     */
    setOptions(array) {
        if (this.type == 'switch') throw new Error(`Unable to set options on the selected setting type "${this.type}"`);
        if (!array instanceof Array) {
            throw new Error(`Your argument does not match the type of array! ${typeof array}`);
        }
        array.forEach((string, index) => {
            if (string.length > 17) throw new Error(`Your option at index ${index} is too long. Max Character limit is 18. Your length: ${string.length}`)
        })
        this.options = array;
    }
    render(cb) {

        if (typeof cb !== 'function') throw new Error(`Expected a callback function to listen for changes.`)

        const list = document.querySelector(`[data-settings-category="${this.category}"]`);
        switch(this.type) {
            case 'switch':
                {
                    const container = document.createElement('div');
                    container.className = 'setting-box'

                    const title = document.createElement('p');
                    title.className = 'settings-title-text'
                    title.innerText = this.title

                    const breakline = document.createElement('div');
                    breakline.className = 'breakline'

                    const description = document.createElement('p');
                    description.className = 'settings-descriptions-text'
                    description.innerText = this.description

                    const interaction = document.createElement('label');
                    interaction.className = 'switch settings-set'

                    const interaction_input = document.createElement('input');
                    interaction_input.type = 'checkbox'
                    interaction_input.defaultChecked = false || this.isChecked
                    interaction_input.addEventListener('change', (event) => {
                        cb(event.currentTarget.checked);
                    })
                    
                    const interaction_slider = document.createElement('span');
                    interaction_slider.className = 'slider'

                    interaction.appendChild(interaction_input);
                    interaction.appendChild(interaction_slider);

                    container.appendChild(title);
                    container.appendChild(breakline);
                    container.appendChild(description);
                    container.appendChild(interaction);

                    list.appendChild(container);
                }
                break
            case 'selection':
                {
                    const container = document.createElement('div');
                    container.className = 'setting-box'

                    const title = document.createElement('p');
                    title.className = 'settings-title-text'
                    title.innerText = this.title

                    const breakline = document.createElement('div');
                    breakline.className = 'breakline'

                    const description = document.createElement('p');
                    description.className = 'settings-descriptions-text'
                    description.innerText = this.description

                    const interaction = document.createElement('select');
                    interaction.className = 'settings-set top'
                    interaction.id = 'select'
                    interaction.addEventListener('change', (event) => {
                        cb(event.currentTarget.value)
                    })

                    this.options.forEach(option => {
                        const interaction_option = document.createElement('option');
                        interaction_option.innerText = option
                        interaction.appendChild(interaction_option);
                    });

                    container.appendChild(title);
                    container.appendChild(breakline);
                    container.appendChild(description);
                    container.appendChild(interaction);

                    list.appendChild(container);
                }
                break
        }
    }
}

onGlobalReady(() => {
    global.listen('escape', handleEscape);

    const autoCollapseSettingsCategories = new Setting('switch');
    autoCollapseSettingsCategories.setCategory('general');
    autoCollapseSettingsCategories.setTitle(global.translate('settings.categories.autocollapse.title'))
    autoCollapseSettingsCategories.setDescription(global.translate('settings.categories.autocollapse.description'))
    autoCollapseSettingsCategories.setSwitchIsChecked(false);
    autoCollapseSettingsCategories.render((value) => {
        console.log(value);
    });
});

function handleEscape() {
    if (global.areSettingsActive()) {
        unloadSettings();

        setTimeout(() => {
            document.querySelectorAll('[data-glyphiconpage]').forEach(element => {
                const dataset = element?.dataset
                if (dataset) {
                    const identifier = dataset.identify
                    const href = dataset.href
    
                    if (identifier === 'settings') {
                        loadNewPage(href);
                    }
                }
            });
        }, 150);
    }
}


export { Setting }