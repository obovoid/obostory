/* 
    Copyright (c) 2024, Obovoid
    All rights reserved.

    This source code is licensed under the GPL-3.0-style license found in the
    LICENSE file in the root directory of this source tree.
*/
'use strict';
import $ from 'jquery';
import { ensureType } from './utils/ensureType';
import {getGlobal, createGlobal, setGlobal } from './utils/globals';
import { openSettings, unloadSettings } from './pages/settings/build';

let currentPage = createGlobal('activePage', 'container-startup')

function app(fn: DefaultCallback) {
    /**
    * Checks if the user agent includes Electron.
    */
    const in_app = window.navigator.userAgent.includes('Electron');

    /**
    * If the code is being executed inside the electron app, execute the function.
    */
    if (in_app) {
        fn();
    }
}

const _registeredActionListeners: ActionEvent[] = [];

function onAction(selector: string, callback: any): void {
    ensureType(selector, 'string');
    console.log(`registered new Event target at ${selector}`);
    _registeredActionListeners.push({returnPointer: callback, selector});
}

/**
 * Sends an action to all registered action listeners.
 * @param {string} string - The action to send.
 * @returns {boolean} Returns its function identifier if executed successfully.
 */
function sendAction(string: string, additionalData: any[] = []): sendActionSelector {
    ensureType(string, 'string');
    ensureType(additionalData, 'array');
    
    let sentEvents: number = 0
    _registeredActionListeners.forEach(data => {
        if (data.selector === string) {
            const cb = data.returnPointer;
            sentEvents++
            cb(additionalData, string);
        }
    });
    console.log(`executed ${sentEvents} ${sentEvents > 1 || sentEvents === 0 ? 'Events' : 'Event'} with the target name of ${string}`)
    return 0xb8667009
}

app(() => {
    // app() ensures that the ran code only executes if its run in the electron app.
    // Otherwise this code will never execute

    // This meta tag is in browser pages invalid and needs to be added by code if you want be able to open the web page without starting the app
    const meta = document.createElement('meta');
    meta.httpEquiv = "Content-Security-Policy"
    // Attention: Unsafe-eval active. Some modules create eval code and I am not familiar how to stop those from doing that.
    // This is a Typescript thing. If you know how to stop those modules from creating eval code, let me know!
    meta.content = "default-src 'self'; script-src 'self' 'unsafe-eval'; img-src 'self'"
    document.getElementsByTagName('head')[0].appendChild(meta)
    
    // adding quit options.
    document.querySelectorAll('[data-command="quit"]').forEach(el => {
        el.addEventListener('click', window.API.quit);
    });

    setTimeout(() => {
        $('.container-settings').animate({left: "150%", opacity: 0});
        $('.container-settings').css({display: "none"})
        $(`.${currentPage}`).fadeIn(150);
    }, 150)
});


document.querySelectorAll('[data-command="settings"]').forEach(el => {
    el.addEventListener('click', () => { openSettings() });
});

document.querySelectorAll('[data-command="create"]').forEach(el => {
    el.addEventListener('click', () => {
        return loadNewPage('container-playground');
    });
});

function loadNewPage(page: string) {
    $(`.${currentPage}`).fadeOut(150);
    if (page == 'container-settings') return openSettings();

    $(`.${page}`).fadeIn(150);
    $(`.${page}`).animate({ opacity: 1}, 150);
    currentPage = setGlobal('activePage', page);
    sendAction(`page.changed.to.${page}`);
    return true;
}

function getActivePage() {
    return getGlobal('activePage');
}

document.querySelectorAll('[data-href]').forEach(el => {
    el.addEventListener('click', () => {
        if (el instanceof HTMLElement) {
            const linkto = el.dataset.href
            const div = document.getElementsByClassName(linkto)
            currentPage = getGlobal('activePage');
    
            if (currentPage as string == 'container-settings') {
                unloadSettings();
            }
    
            div.length > 0 ? 
                loadNewPage(linkto) : 
                console.error(new Error(`Unable to load page. Link could not be converted to a div containing the link as a class.`));
        }
    });
});

document.querySelectorAll('[data-modalGithub').forEach(el => {
    el.addEventListener('click', () => {
        app(() => {
            // It is more likely that people clicking the icon are trying to report a issue
            // So we redirect them directly to githubs issues page.
            window.API.openURL('https://github.com/obovoid/obostory/issues')
        })
    })
});

document.querySelectorAll('[data-modalInfo').forEach(el => {
    el.addEventListener('click', () => {
        app(() => {
            window.API.showAppInfo();
        })
    })
});

document.addEventListener('DOMContentLoaded', () => {
    loadNewPage(currentPage as string)
});

export { loadNewPage, onAction, sendAction, app, getActivePage}