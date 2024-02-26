import { categories } from './render'

function searchSettings() {
    const selector = document.querySelector(".settings-searchbar") as HTMLInputElement;
    const searchInput = selector.value.toLowerCase();
  
    if (searchInput.trim() === "") {
      const allSettingBoxes = document.querySelectorAll(".setting-box");
      allSettingBoxes.forEach((box) => {
        box.classList.remove("hidden");
      });
      return;
    }
  
    categories.forEach((category) => {
      const categoryBoxes = document.querySelectorAll(
        `[data-settings-category="${category}"] .setting-box`
      );
  
      categoryBoxes.forEach((box) => {
        const titleElement = box.querySelector(".settings-title-text") as HTMLElement;
        const title = titleElement.innerText.toLowerCase();
        const descriptionElement = box.querySelector(".settings-descriptions-text") as HTMLElement;
        const description = descriptionElement.innerText.toLowerCase();
  
        if (title.includes(searchInput) || description.includes(searchInput)) {
          box.classList.remove("hidden");
        } else {
          box.classList.add("hidden");
        }
      });
    });
}

document.querySelector(".settings-searchbar").addEventListener("input", searchSettings);