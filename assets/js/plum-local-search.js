var fuseOptions = {
    threshold: 0,
    ignoreLocation: true,
    minMatchCharLength: 2,
    keys: [
        {
            name: 'title',
            weight: 10,
        },
        {
            name: 'tags',
            weight: 9,
        },
        {
            name: 'authors',
            weight: 8,
        },
        {
            name: 'custom_excerpt',
            weight: 7,
        },
        'plaintext'
    ]
};

function enableSearch() {
    var searchControl = document.querySelector('#search-modal .control.search');
    var searchInput = document.querySelector('#search-modal .control.search input.search');

    searchControl.classList.remove('loading');
    searchControl.classList.add('loaded');
    searchInput.removeAttribute('disabled');
    searchInput.setAttribute('placeholder', '');
    searchInput.focus();
}

function errorOfSearch(errorMsg) {
    var searchControl = document.querySelector('#search-modal .control.search');
    var searchInput = document.querySelector('#search-modal .control.search input.search');
    var tips = document.querySelector('#search-modal .tips.error');

    searchControl.classList.remove('loading');
    searchControl.classList.add('loaded');
    searchInput.setAttribute('placeholder', '');
    tips.innerText = errorMsg ? errorMsg : tips.getAttribute('data-error-tips');
    tips.classList.add('is-active');
}

var searchEngine = null;

function cacheSearchData(searchData) {
    window.sessionStorage.setItem('searchData', JSON.stringify(searchData));
}

function cachedSearchData() {
    var searchData = window.sessionStorage.getItem('searchData');
    if (!searchData) {
        return false;
    }

    searchEngine = new Fuse(JSON.parse(searchData), fuseOptions);
    enableSearch();

    return true;
}

function fetchSearchData() {
    if ((typeof searchContentAPIKey === 'undefined') || (!searchContentAPIKey)) {
        var searchControl = document.querySelector('#search-modal .control.search');
        errorOfSearch(searchControl.getAttribute('data-no-api-key-tips'));
        return;
    }

    var adminURL = ((typeof ghostAdminURL === 'undefined') || (!ghostAdminURL)) ? '' : ghostAdminURL;
    var fields = '&fields=url,title,custom_excerpt,plaintext';
    var ghostAPI = adminURL + '/ghost/api/v2/content/posts/?key=' + searchContentAPIKey + '&limit=all&formats=plaintext&include=authors,tags' + fields;

    var searchDataRequest = new XMLHttpRequest;

    searchDataRequest.open("GET", ghostAPI, true);

    searchDataRequest.onload = function (pe) {
        if (searchDataRequest.status < 200 || searchDataRequest.status >= 400) {
            var errTips = "Can't load search data, HTTP response status code: " + searchDataRequest.status + '\n';
            var errData = JSON.parse(searchDataRequest.response).errors;
            for (var i = 0; i < errData.length; i++) {
                errTips += '  Error type: ' + errData[i].errorType + ', Message: ' + errData[i].message + '\n';
            }

            errorOfSearch(errData.length > 0 ? errData[0].message : '');
            console.error(errTips);
            return;
        }

        var searchData = JSON.parse(searchDataRequest.response).posts;
        if (!searchData.length) {
            errorOfSearch('');
            console.error('No search data.');
            return;
        }

        searchData.forEach(function (post) {
            var authors = [];
            post.authors.forEach(function (author) {
                authors.push(author.name);
            });
            delete post.authors;
            post.authors = authors;

            if (!post.tags) {
                return
            }
            var tags = [];
            post.tags.forEach(function (tag) {
                tags.push(tag.name);
            });
            delete post.tags;
            post.tags = tags;
        });

        searchEngine = new Fuse(searchData, fuseOptions);

        enableSearch();

        cacheSearchData(searchData);

        if (pe.loaded >= 3 * 1024 * 1024) {
            console.warn('The index data of posts is larger than 3MB, size: ', pe.loaded, 'bytes.');
        }
    };

    searchDataRequest.onerror = function (pe) {
        console.error("There was an error when loading search data,", pe.loaded, "bytes transferred.");
    };

    searchDataRequest.send();
}

function loadSearchData() {
    (!cachedSearchData()) && fetchSearchData();
}

function localSearchListener() {
    openModal('#search-modal', false, true, false);

    if (searchEngine) {
        document.querySelector('#search-modal .control.search input.search').focus();
    } else {
        loadSearchData();
    }
}

var localSearch = document.querySelector('#local-search');
localSearch && localSearch.addEventListener('click', localSearchListener);
localSearch && localSearch.addEventListener('keydown', function (ev) {
    isEnter(ev) && localSearchListener();
});

function buildSearchResultHtmlElements(results) {
    var resultWrap = document.querySelector('#search-modal .results');

    if (!results.length) {
        resultWrap.innerText = resultWrap.getAttribute('data-no-result-tips');
        return;
    }

    var shadowRoot = document.createElement('ul');
    results.forEach(function (obj) {
        var li = document.createElement('li');
        li.classList.add('item');

        var link = document.createElement('a');
        link.href = obj.url;
        link.classList.add('title');
        link.innerText = obj.title;

        li.appendChild(link);
        shadowRoot.appendChild(li);
    });

    resultWrap.innerText = '';
    var oldRoot = document.querySelector('#search-modal .results > ul');
    if (oldRoot) {
        resultWrap.replaceChild(shadowRoot, oldRoot);
    } else {
        resultWrap.appendChild(shadowRoot);
    }
}

var lastSearchTimeOutID = null;
document.querySelector('#search-modal .control.search .input.search').addEventListener('input', function (ev) {
    clearTimeout(lastSearchTimeOutID);
    lastSearchTimeOutID = setTimeout(function () {
        var results = [];

        var terms = ev.target.value ? ev.target.value.split(/\s+/) : [];
        if (!terms.length) {
            buildSearchResultHtmlElements(results);
            return;
        }

        var termNum = terms[terms.length - 1] === '' ? terms.length - 1 : terms.length;
        if (!termNum) {
            buildSearchResultHtmlElements(results);
            return;
        }

        var countObj = {};
        terms.forEach(function (term) {
            if (!term.length) {
                return;
            }

            searchEngine.search(term).forEach(function (obj) {
                if (countObj[obj.item.title]) {
                    countObj[obj.item.title] += 1;
                } else {
                    countObj[obj.item.title] = 1;
                }

                if (countObj[obj.item.title] >= termNum) {
                    results.push(obj.item);
                }
            });
        });

        buildSearchResultHtmlElements(results);
    }.bind(this), 100);
});
