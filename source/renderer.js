/* 
    Copyright (c) 2024, Obovoid
    All rights reserved.

    This source code is licensed under the GPL-3.0-style license found in the
    LICENSE file in the root directory of this source tree.
*/
'use strict';

import { getGlobal, createGlobal, setGlobal } from "./components/cache/globals.js";
import { openSettings, unloadSettings } from "./components/settings/ui.js";
import { ensureType } from "./components/types/main.js";

let currentPage = createGlobal('activePage', 'container-startup');

/**
 * Checks if the code is being executed inside the electron app.
 * @param {Function} fn - The function to execute if the code is being executed inside the electron app.
 */
function app(fn) {
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

const _registeredActionListeners = []

function onAction(callback) {
    _registeredActionListeners.push(callback);
}

/**
 * Sends an action to all registered action listeners.
 * @param {string} string - The action to send.
 * @returns {boolean} Returns true if the action was sent, false otherwise.
 */
function sendAction(string) {
  ensureType(string, 'string');
  _registeredActionListeners.forEach(cb => cb(string));
  return true;
}

app(() => {
    // app() ensures that the ran code only executes if its run in the electron app.
    // Otherwise this code will never execute

    // This meta tag is in browser pages invalid and needs to be added by code if you want be able to open the web page without starting the app
    const meta = document.createElement('meta');
    meta.httpEquiv = "Content-Security-Policy"
    meta.content = "default-src 'self'; script-src 'self'"
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
    el.addEventListener('click', openSettings);
});

function loadNewPage(page) {
    $(`.${currentPage}`).fadeOut(150);
    if (page == 'container-settings') return openSettings();

    $(`.${page}`).fadeIn(150);
    currentPage = setGlobal('activePage', page);
}

document.querySelectorAll('[data-href]').forEach(el => {
    el.addEventListener('click', () => {
        const linkto = el.dataset.href
        const div = document.getElementsByClassName(linkto)
        currentPage = getGlobal('activePage');

        if (currentPage == 'container-settings') {
            unloadSettings();
        }

        div.length > 0 ? 
            loadNewPage(linkto) : 
            console.error(new Error(`Unable to load page. Link could not be converted to a div containing the link as a class.`));
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

export { loadNewPage, onAction, sendAction, app }