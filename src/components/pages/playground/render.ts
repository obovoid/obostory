
/* 
    Copyright (c) 2024, Obovoid
    All rights reserved.

    This source code is licensed under the GPL-3.0-style license found in the
    LICENSE file in the root directory of this source tree.
*/


import { onAction, sendAction, getActivePage, loadNewPage } from "../../startup"
import $ from 'jquery';

onAction('page.changed.to.container-playground', () => {
    $('.container-playground').fadeIn(150);
});

let selectedActivity: HTMLElement = null

document.querySelectorAll('[data-activityButton]').forEach((btn: HTMLLabelElement) => {
    if (btn.classList.contains('active')) {
        selectedActivity = btn
    }

    btn.addEventListener('click', () => {
        if (btn === selectedActivity) return;

        if (selectedActivity) {
            selectedActivity.classList.remove('active')
        }

        btn.classList.add('active');
        const identity = btn.dataset.identity
        if (identity === 'save') {
            setTimeout(() => {
                btn.classList.remove('active');
                selectedActivity.classList.add('active');
            }, 100);
        } else {
            selectedActivity = btn
        }

        sendAction(`activity.changed.to.${identity}`);
    });
})

onAction('keyaction.escape', () => {
    const activePage = getActivePage()
    if (activePage == 'container-playground') {
        loadNewPage('container-startup');
    }
});

document.querySelectorAll('#projectName').forEach((input: any) => {
    input.addEventListener('click', () => {
        input.select();
    });
    input.addEventListener('input', () => {
        const projectName = String(input.value);
        if (isValidFileName(projectName)) {
            removeInvalidBorder(input);
        } else {
            setInvalidBorder(input);
        }
    });
});

function isValidFileName(fileName: string) {
    return /^[0-9a-zA-Z ]+$/.test(fileName);
}

function setInvalidBorder(element: HTMLInputElement) {
    return element.style.border = '1px solid red';
}

function removeInvalidBorder(element: HTMLInputElement) {
    return element.style.border = 'none';
}