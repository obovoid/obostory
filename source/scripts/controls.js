onkeydown = (e) => {
    switch (e.key) {
        case 'Escape':
            global.call('escape');
            break
    }
}
