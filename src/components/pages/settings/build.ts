/* 
    Copyright (c) 2024, Obovoid
    All rights reserved.

    This source code is licensed under the GPL-3.0-style license found in the
    LICENSE file in the root directory of this source tree.
*/

'use strict';
import { getGlobal, setGlobal, createGlobal, globalExists } from "../../utils/globals";
import { Translator } from "../../utils/translator";
import $ from 'jquery';
import { sendAction, onAction, loadNewPage } from "../../startup";
import { safeUnfoldCache } from "../../utils/storage"
import { render, release } from './render';

const translator = new Translator({stringErrorOnMissingTranslation: true});

createGlobal('settingsPageActive', false);

document.addEventListener('DOMContentLoaded', () => {
    onAction('page.changed.to.container-settings', (_e: any[], _event: string) => {
        
        if (!globalExists('settingsPageActive')) {
            createGlobal('settingsPageActive', true);
        } else {
            setGlobal('settingsPageActive', true);
        }
    
        const currentPage = getGlobal('activePage');
        $(`.${currentPage}`).fadeOut(150);
        $('.container-settings').css({display: 'block'});
        $(`.container-settings`).animate({left: '50%', opacity: 1});
        setGlobal('activePage', 'container-settings');
    });
    
    onAction('keyaction.escape', () => {
        if (getGlobal('settingsPageActive') === true) {
            unloadSettings();
    
            setTimeout(() => {
                document.querySelectorAll("[data-glyphiconpage]").forEach((element) => {
                    if (!(element instanceof HTMLElement)) { throw new Error('Function Parameter type invalid. Fatal selector Error.') }
    
                    const dataset = element?.dataset;
                    if (dataset) {
                        const identifier = dataset.identify;
                        const href = dataset.href;
            
                        if (identifier === "settings") {
                        loadNewPage(href);
                        }
                    }
                    });
            }, 150);
        }
    })
});

const hideCategories = () => {
    const hidden_class = "glyphicon glyphicon-chevron-down glyph-category"
    const visible_class = "glyphicon glyphicon-chevron-up glyph-category"

    document.querySelectorAll('[data-collapse]').forEach(el => {
        if (el instanceof HTMLElement) {
            const collapse_element = el.dataset.collapse

            el.childNodes.forEach(node => {
                if (node instanceof HTMLElement) {

                    if (node.dataset?.glyphtoggle) {
        
                        classListAction('remove', node, visible_class);
                        classListAction('add', node, hidden_class);
                        node.dataset.glyphtoggle = visible_class
                    }
                }
            });
    
            document.querySelectorAll(collapse_element).forEach(tocollapse => {
                if (tocollapse instanceof HTMLElement) {
                    tocollapse.style.display = "none"
                }
            });
        }
    });
}

document.querySelectorAll('[data-collapse]').forEach(el => {
    if (el instanceof HTMLElement) {
            
        const collapse_element = el.dataset.collapse
        el.addEventListener('click', () => {

            el.childNodes.forEach(node => {
                if (node instanceof HTMLElement) {
                    if (node.dataset?.glyphtoggle) {
                        const current_class = String(node.classList)
                        const new_class = node.dataset.glyphtoggle

                        classListAction('remove', node, current_class);
                        classListAction('add', node, new_class);
                        node.dataset.glyphtoggle = current_class
                    }
                }
            });

            document.querySelectorAll(collapse_element).forEach(tocollapse => {
                if (tocollapse instanceof HTMLElement) {
                    const new_visibility = tocollapse.style.display == "none" ? "block" : "none"
                    tocollapse.style.display = new_visibility
                }
            });
        });
    }
});

function classListStringValid(string: string[]) {
    let test_passed = true;
    let fail_reason: string = null;
    const startsWithNumber: RegExp = /^[0-9]/gm
    const startsWithHyphen = /^-/gm
    const startsWithHashtag = /^#/gm
    const endsWithHashtag = /#[a-zA-Z]/gm

    if (string.length <= 0) return {test_passed: false, fail_reason: "String Array has a length of 0!"}

    string.every(className => {

        if (className.length <= 0) {
        	test_passed = false;
            fail_reason = 'Classname cannot be empty!'
            return false;
        }

        if (startsWithNumber.test(className)) {
            test_passed = false;
            fail_reason = `Classname cannot start with a number! ${className}`
            return false;
        }
        if (startsWithHyphen.test(className)) {
            if (/^-[0-9]/gm.test(className)) {
                test_passed = false;
                fail_reason = `Classname cannot start with a Hyphen followed by a number! ${className}`
                return false;
            }

            if (/^-\s/gm.test(className)) {
                test_passed = false;
                fail_reason = `Classnames starting with a Hyphen must be followed by a character! ${className}`
                return false;
            }
        }

        if (className.startsWith('.')) {
            test_passed = false;
            fail_reason = `Classname cannot start with a dot! ${className}`
            return false;
        }

        if (className.startsWith(' ')) {
        	test_passed = false;
            fail_reason = `Classname cannot start with a white space character! ${className}`
            return false
        }

        if (startsWithHashtag.test(className)) {
            test_passed = false;
            fail_reason = `Classname cannot start with a hashtag! ${className}`
            return false;
        }

        if (endsWithHashtag.test(className)) {
            test_passed = false;
            fail_reason = `Classname cannot end with a hashtag! ${className}`
            return false;
        }

        if (className.includes('@')) {
            test_passed = false;
            fail_reason = `Classname cannot contain an @ character! ${className}`
            return false;
        }

        if (className.includes('*')) {
            test_passed = false;
            fail_reason = `Classname cannot contain a * character! ${className}`
            return false;
        }

        return true;
    });

    return {test_passed, fail_reason};
}

function classListAction(action: "remove" | "add", nodeElement: HTMLElement, classList: string) {
    if (nodeElement instanceof HTMLElement) {
        const list: string[] = classList.split(" ");
        const {test_passed, fail_reason} = classListStringValid(list)
        if (!test_passed) {
            throw new Error(`ClassListAction failed because of: ${fail_reason}`);
        }

        switch (action) {
            case "remove":
                list.forEach(className => {
                    nodeElement.classList.remove(className);
                });
                break;
            case "add":
                list.forEach(className => {
                    nodeElement.classList.add(className);
                });
                break;
            default: 
                throw new Error("Action Argument is not supported!");
        }
    } else {
        throw new Error('Function Parameter type invalid. Argument nodeELement should be an instance of HTMLElement, but is not.');
    }
}

function openSettings() {
    if (getGlobal('settingsPageActive') === true) return;
    render();

    if (safeUnfoldCache('settings.autoCollapseActive') === true) {
        hideCategories();
    }

    return sendAction('page.changed.to.container-settings');
}

const unloadSettings = () => {
    $('.container-settings').animate({left: "150%", opacity: 0});
    setGlobal('settingsPageActive', false)
    sendAction('close.settings');

    release();
}

function getRandomSearchbarPlaceholder() {
    document.querySelectorAll("[data-placeholderlist]").forEach((element) => {
        if (!(element instanceof HTMLInputElement)) { throw new Error('Function Parameter type invalid. Fatal selector Error.') }

        const placeholderlist_string = element.dataset.placeholderlist;
        const placeholderlist = translator.translate(placeholderlist_string);
        const placeholder =
            placeholderlist[Math.floor(Math.random() * placeholderlist.length)];
        element.placeholder = placeholder;
    });
}

export { openSettings, unloadSettings, getRandomSearchbarPlaceholder}