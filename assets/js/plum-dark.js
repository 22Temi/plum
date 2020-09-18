function lightMode(toSave) {
    if (toSave) {
        document.documentElement.classList.add('user-color-scheme');
        window.localStorage.setItem('userColorScheme', 'light');
    }
}

function clearLightMode(toSave) {
    if (toSave) {
        document.documentElement.classList.remove('user-color-scheme');
        window.localStorage.removeItem('userColorScheme');
    }
}

function darkMode(toSave) {
    document.documentElement.classList.add('is-dark-mode');

    var sunButton = document.querySelector('.dark-button.sun');
    sunButton.classList.add('disabled');
    sunButton.removeAttribute('tabindex');
    sunButton.setAttribute('aria-hidden', 'true');

    var moonButton = document.querySelector('.dark-button.moon');
    moonButton.classList.remove('disabled');
    moonButton.setAttribute('tabindex', '0');
    moonButton.removeAttribute('aria-hidden');

    if (toSave) {
        document.documentElement.classList.add('user-color-scheme');
        window.localStorage.setItem('userColorScheme', 'dark');
    }
}

function clearDarkMode(toSave) {
    document.documentElement.classList.remove('is-dark-mode');

    var moonButton = document.querySelector('.dark-button.moon');
    moonButton.classList.add('disabled');
    moonButton.removeAttribute('tabindex');
    moonButton.setAttribute('aria-hidden', 'true');

    var sunButton = document.querySelector('.dark-button.sun');
    sunButton.classList.remove('disabled');
    sunButton.setAttribute('tabindex', '0');
    sunButton.removeAttribute('aria-hidden');

    if (toSave) {
        document.documentElement.classList.remove('user-color-scheme');
        window.localStorage.removeItem('userColorScheme');
    }
}

function darkModeListener() {
    var mqDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    var mqLight = !mqDark;

    var inDarkMode = document.documentElement.classList.contains('is-dark-mode');
    if (inDarkMode) {
        if (mqLight) {
            document.documentElement.removeAttribute('data-theme');
        }

        clearDarkMode(true);
        lightMode(mqDark);
    } else {
        if (mqLight) {
            document.documentElement.setAttribute('data-theme', 'dark');
        }

        clearLightMode(true);
        darkMode(mqLight);
    }
}

var darkButtons = document.querySelectorAll('.dark-button');
var toUseDarkMode = darkButtons.length !== 0;

toUseDarkMode && Array.prototype.forEach.call(darkButtons, function (el) {
    el.addEventListener('click', darkModeListener);
    el.addEventListener('keydown', function (ev) {
        isEnter(ev) && darkModeListener();
    });
});

var colorMq = window.matchMedia('(prefers-color-scheme: dark)');
try {
    toUseDarkMode && colorMq.addEventListener('change', function (ev) {
        if (ev.matches) {
            var ucs = localStorage.getItem('userColorScheme');
            if (!ucs) {
                darkMode(false);
            }
        }
    });
} catch (e) {
    toUseDarkMode && colorMq.addListener(function (ev) {
        if (ev.matches) {
            var ucs = localStorage.getItem('userColorScheme');
            if (!ucs) {
                darkMode(false);
            }
        }
    });
}

colorMq = window.matchMedia('(prefers-color-scheme: light)');
try {
    toUseDarkMode && colorMq.addEventListener('change', function (ev) {
        if (ev.matches) {
            var ucs = localStorage.getItem('userColorScheme');
            if (!ucs) {
                clearDarkMode(false);
            }
        }
    });
} catch (e) {
    toUseDarkMode && colorMq.addListener(function (ev) {
        if (ev.matches) {
            var ucs = localStorage.getItem('userColorScheme');
            if (!ucs) {
                clearDarkMode(false);
            }
        }
    });
}
