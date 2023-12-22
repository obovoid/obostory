let currentPage = 'container-startup'

function app(cb) {
    if (window.API) return cb()
    return null
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
});

document.querySelectorAll('[data-command="settings"]').forEach(el => {
    el.addEventListener('click', openSettings);
});

function loadNewPage(page) {
    $(`.${currentPage}`).fadeOut(150);
    if (page == 'container-settings') return openSettings();

    $(`.${page}`).fadeIn(150);
    currentPage = page
}

document.querySelectorAll('[data-href]').forEach(el => {
    el.addEventListener('click', () => {
        const linkto = el.dataset.href
        const div = document.getElementsByClassName(linkto)

        if (currentPage == 'container-settings') {
            unloadSettings();
        }

        div.length > 0 ? 
            loadNewPage(linkto) : 
            console.error(new Error(`Unable to load page. Link could not be converted to a div containing the link as a class.`));
    });
});

document.querySelectorAll('[data-collapse]').forEach(el => {
    const collapse_element = el.dataset.collapse
    el.addEventListener('click', (e) => {

        el.childNodes.forEach(node => {
            if (node.dataset?.glyphtoggle) {
                const current_class = String(node.classList)
                const new_class = node.dataset.glyphtoggle

                node.classList = new_class
                node.dataset.glyphtoggle = current_class
            }
        });

        document.querySelectorAll(collapse_element).forEach(tocollapse => {
            const new_visibility = tocollapse.style.display == "none" ? 'block' : 'none'
            tocollapse.style.display = new_visibility
        });
    });
});

document.querySelectorAll('[data-translate]').forEach(el => {
    const translation_id = el.dataset.translate

    el.innerText = global.translate(translation_id) || `translation missing {${translation_id}}`
});

//** Debug Start */
function _reset() {
    $(`.container-startup`).fadeIn(150);
    $('.container-settings').animate({left: "150%", opacity: 0});
}

setTimeout(() => {
    _reset()
}, 500);

//** Debug End */