'use strict';

var currentModal = null;
var currentModalConfig = {};

function modalKeydownListener(ev) {
    var e = ev || window.event;

    if ((e.code && e.code === 'Escape') ||
        (e.keyCode && e.keyCode === 27)
    ) {
        closeModal();
    }
}

function modalClickListener(ev) {
    closeModal();
}

function openModal(modalCssSelector, closeByBackground, closeByButton, closeByEsc) {
    var modal = document.querySelector(modalCssSelector);

    modal.classList.add('is-active');
    document.documentElement.classList.add('is-clipped');

    currentModal = modal;
    currentModalConfig = {closeByBackground: closeByBackground, closeByButton: closeByButton, closeByEsc: closeByEsc};

    if (closeByBackground) {
        modal.querySelector('.modal-background').addEventListener('click', modalClickListener);
    }

    if (closeByButton) {
        modal.querySelector('.modal-close').addEventListener('click', modalClickListener);
    }

    if (closeByEsc) {
        document.addEventListener('keydown', modalKeydownListener);
    }
}

function closeModal() {
    document.documentElement.classList.remove('is-clipped');
    currentModal.classList.remove('is-active');

    if (currentModalConfig.closeByBackground) {
        currentModal.querySelector('.modal-background').removeEventListener('click', modalClickListener);
    }

    if (currentModalConfig.closeByButton) {
        currentModal.querySelector('.modal-close').removeEventListener('click', modalClickListener);
    }

    if (currentModalConfig.closeByEsc) {
        document.removeEventListener('keydown', modalKeydownListener);
    }
}

function isEnter(ev) {
    var e = ev || window.event;

    return (e.code && (e.code === 'Enter' || e.code === 'NumpadEnter')) || (e.keyCode && e.keyCode === 13);
}

function isEsc(ev) {
    var e = ev || window.event;

    return (e.code && e.code === 'Escape') || (e.keyCode && e.keyCode === 27);
}

var menuTags = document.querySelector('#menu-tags');
menuTags && menuTags.addEventListener('click', function (ev) {
    openModal('#tags-modal', true, true, true);
    ev.preventDefault();
});

function siteSearchListener(ev) {
    var searchInput = document.querySelector('#site-search-input');

    function deactivateSearchInput(ev) {
        var inside = searchInput === ev.target || searchInput.contains(ev.target);
        if (!inside) {
            searchInput.classList.remove('is-active');
            document.removeEventListener('click', deactivateSearchInput);
        }
    }

    if (searchInput.classList.contains('is-active')) {
        searchInput.classList.remove('is-active');
        if (!(searchInput.value.trim())) {
            ev.preventDefault();
            ev.stopPropagation();
            return;
        }

        if (searchInput.classList.contains('bing')) {
            var siteUrl = searchInput.getAttribute('data-site-url');
            siteUrl = (new URL(siteUrl)).hostname;
            searchInput.value += ' site:' + siteUrl;
        }
    } else {
        ev.preventDefault();
        ev.stopPropagation();

        if (searchInput.classList.contains('bing')) {
            var newValue = searchInput.value.split(' site:', 1);
            searchInput.value = newValue.length === 0 ? '' : newValue[0];
        }

        searchInput.classList.add('is-active');
        searchInput.focus();

        document.addEventListener('click', deactivateSearchInput);
    }
}

var siteSearch = document.querySelector('#site-search-button');
siteSearch && siteSearch.addEventListener('click', siteSearchListener);
siteSearch && siteSearch.addEventListener('keydown', function (ev) {
    isEnter(ev) && siteSearchListener();
});

var visibleInput = document.querySelectorAll('input:not([type=hidden]):not(.hidden)');
visibleInput && Array.prototype.forEach.call(visibleInput, function (inputElement) {
    inputElement.addEventListener('keydown', function (ev) {
        if (isEsc(ev) && ev.target === inputElement) {
            ev.target.value = '';
        }
    }.bind(this));
});
