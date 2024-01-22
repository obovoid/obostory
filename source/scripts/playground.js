
import { onAction, sendAction, getActivePage, loadNewPage } from "../renderer.js";
import { global } from "../scripts/global.js"

onAction((actionName) => {
    if (actionName !== "page.changed.to.container-playground") return
    
    $('.container-playground').fadeIn(150);
});

const activities = ["profiles", "timeline", "save"]
let lastSwapSelection = activities[0];

document.querySelectorAll('[data-toggle="buttons"]').forEach(toggleButton => {
    const classList = toggleButton.classList
    // ensuring that the buttons are grouped
    if (!classList.contains("btn-group")) return;
    const childs = Array.from(toggleButton.children);
    
    childs.forEach(child => {
        child.addEventListener("click", (e) => {
                const lastActiveElement = getActiveButton(childs);
                const last_identity = lastActiveElement.dataset.identity;
                const new_element = e.target;
                const new_identity = new_element.dataset.identity;

                if (new_identity == last_identity) return;
                if (new_identity == "save") return console.log("TODO: Handle save")
                const newActivity = getNextElementInArray(activities, lastSwapSelection);
                lastActiveElement.classList.remove("active");
                new_element.classList.add("active");

                sendAction(`activity.changed.to.${newActivity}`);

                lastSwapSelection = newActivity;
        });
    });
});

document.querySelectorAll('#projectName').forEach(input => {
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

function isValidFileName(fileName) {
    return /^[0-9a-zA-Z ]+$/.test(fileName);
}

function setInvalidBorder(element) {
    return element.style.border = '1px solid red';
}

function removeInvalidBorder(element) {
    return element.style.border = 'none';
}

global.listen('escape', handleEscape);

function handleEscape() {
    const activePage = getActivePage()
    if (activePage == 'container-playground') {
        loadNewPage('container-startup');
    }
}

function getActiveButton(childs) {
    let lastActiveElement = null;
    childs.forEach(child => {
        child.classList.contains("active") ? lastActiveElement = child : null;
    });
    return lastActiveElement;
}

function getNextElementInArray(array, currentElement) {
    const currentIndex = array.indexOf(currentElement);
    const nextIndex = currentIndex + 1;
    return array[nextIndex % array.length];
}