import { sendAction } from "./startup";

let controls_locked = false;

document.addEventListener('click', (event) => {
    const isInputFieldClicked = (event.target instanceof HTMLInputElement);

    if (isInputFieldClicked) {
        controls_locked = true;
    } else {
        controls_locked = false;
    }
});

/**
 * Event listener for keydown events
 * @param {KeyboardEvent} e - keyboard event object
 */
onkeydown = (e): sendActionSelector => {
    if (controls_locked) return null;
    const key = e.key
    return sendAction(`keyaction.${key.toLowerCase()}`);
}