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

document.querySelectorAll('[data-translate]').forEach(el => {
    const translation_id = el.dataset.translate
    let default_language = navigator.language
    if (!language[default_language]) {
        default_language = 'en-US'
    }

    el.innerText = language[default_language][translation_id] || `translation missing {${translation_id}}`
})