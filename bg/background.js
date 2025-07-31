'use strict';

// START: utils.js
const utils = {
    noop: function() {},
    parseURL: function(url) {
        const a = document.createElement('a');
        a.href = url;
        return {
            source: url,
            href: a.href.replace(/(^https?\:\/\/)(www\.)/, '$1'),
            protocol: a.protocol.replace(':', ''),
            host: a.hostname.replace(/^www\./, ''),
            port: a.port,
            query: a.search,
            params: (() => {
                const ret = {};
                const seg = a.search.replace(/^\?/, '').split('&');
                for (let i = 0; i < seg.length; i++) {
                    if (!seg[i]) { continue; }
                    const s = seg[i].split('=');
                    ret[s[0]] = s[1];
                }
                return ret;
            })(),
            file: (a.pathname.match(/\/([^\/?#]+)$/i) || [, ''])[1],
            hash: a.hash.replace('#', ''),
            path: a.pathname.replace(/^([^\/])/, '/$1'),
            relative: (a.href.match(/tps?:\/\/[^\/]+(.+)/) || [, ''])[1],
            segments: a.pathname.replace(/^\//, '').split('/')
        };
    },
    removeDublicates: function(arr, equalFn) {
        equalFn = equalFn || function(a, b) {
            return a === b;
        };
        return arr.reduce(function(res, item) {
            const exists = res.some(function(r) {
                return equalFn(item, r);
            });
            if (!exists) {
                res.push(item);
            }
            return res;
        }, []);
    },
    getLocale: function() {
        const locale = chrome.i18n.getMessage('@@ui_locale').split('_')[0];
        return locale !== 'ru' ? 'en' : 'ru';
    }
};

const prodIDs = ['chaoejepfhlcelgpicelfccoiojpiofn', 'hpnnhabkliinlljmhjalfmccfcdokena'];
const DEBUG = prodIDs.indexOf(chrome.runtime.id) === -1;
const log = function() {
    if (DEBUG) {
        console.log.apply(console, arguments);
    }
};

const logj = function() {
    if (DEBUG) {
        const args = [].map.call(arguments, function(a) {
            return typeof a === 'object' ? JSON.stringify(a, false, 2) : a;
        });
        console.log.apply(console, args);
    }
};
// END: utils.js

// START: storage.js
const storage = {
    load: function(callback) {
        const keys = Object.keys(defaults);
        this.loadKeys(keys, function storageGet(res) {
            const data = {};
            keys.forEach(function(key) {
                data[key] = res[key] !== undefined ? res[key] : defaults[key];
            });
            callback(data.hosts, data);
        });
    },
    loadKeys: function(keys, callback) {
        chrome.storage.local.get(keys, callback);
    },
    save: function(keyValues, callback) {
        chrome.storage.local.set(keyValues, callback || utils.noop);
    },
    saveGroups: function(groups, callback) {
        chrome.storage.local.set({hosts: groups}, callback || utils.noop);
    }
};

const defaults = {
    hosts: {},
    excludeHosts: ['facebook.com', 'gmail.com', 'vk.com'],
    groupHost: true,
    groupSerp: true,
    groupRare: true,
    showContextMenuItem: true
};
// END: storage.js

// START: onmessage.js
chrome.runtime.onMessage.addListener(function(data, sender, sendResponse) {
    data = data || {};

    if (!data.key) {
        return;
    }

    if (data.msg === 'need-data') {
        storage.load(function(hosts) {
            sendResponse(hosts[data.key]);
        });
        return true;
    }

    if (data.msg === 'remove-url' && data.url) {
        storage.load(function(hosts) {
            const tabs = hosts[data.key];
            let removed = false;
            if (tabs) {
                for (let i = tabs.length; i--;) {
                    if (tabs[i].url === data.url) {
                        tabs.splice(i, 1);
                        removed = true;
                    }
                }
            }

            if (removed) {
                if (hosts[data.key].length === 0) {
                    delete hosts[data.key];
                }
                storage.saveGroups(hosts);
            }
        });
    }

    if (data.msg === 'open-url' && data.url) {
        chrome.tabs.query({
            url: data.url
        }, function(tabs) {
            if (tabs.length) {
                chrome.tabs.update(tabs[0].id, {
                    active: true
                });
                if (data.isLast) {
                    chrome.tabs.remove(sender.tab.id);
                }
            } else {
                if (data.isLast) {
                    chrome.tabs.update(sender.tab.id, {
                        url: data.url
                    });
                } else {
                    const details = {
                        url: data.url,
                        index: sender.tab.index + 1,
                        active: data.activate === undefined ? true : data.activate
                    };
                    if (data.isLast === false) {
                        details.openerTabId = sender.tab.id;
                    }
                    chrome.tabs.create(details);
                }
            }
        });
    }

    if (data.msg === 'open-all-new-win') {
        storage.load(function(hosts) {
            const tabs = hosts[data.key];
            if (!tabs) {
                return;
            }
            chrome.windows.create({}, function(win) {
                const firstTab = win.tabs && win.tabs[0];
                if (firstTab) {
                    chrome.tabs.update(firstTab.id, {url: tabs.shift().url});
                }
                tabs.forEach(function(tab) {
                    chrome.tabs.create({windowId: win.id, url: tab.url});
                });
            });
        });
    }

    if (data.msg === 'close-me') {
        chrome.tabs.remove(sender.tab.id);
    }
});
// END: onmessage.js

// START: onupdate.js
const showWhatsNewOnVersions = ['1.3'];

function tryShowWhatsNew(details) {
    const newVersion = chrome.runtime.getManifest().version;
    const oldVersion = details.previousVersion;
    const show = showWhatsNewOnVersions.some(function(ver) {
        return ver > oldVersion && ver <= newVersion;
    });
    if (show) {
        const path = 'whatsnew/whatsnew.' + utils.getLocale() + '.html';
        chrome.tabs.create({url: chrome.runtime.getURL(path)});
    }
}

chrome.runtime.onInstalled.addListener(function (details) {
    if (details.reason === 'update') {
        restoreOpenedPages();
        tryShowWhatsNew(details);
    }
});
// END: onupdate.js

// START: serp.js
const serpTabs = {};

function checkSerp(tab) {
    const url = tab.url;
    let matches;
    let parsed;
    matches = url.match(/^https?:\/\/(www\.)?google(\.[a-z]{2,3}){1,2}\/.+[&#]q=([^&]+)/);
    if (matches) {
        parsed = utils.parseURL(url);
        return getKey(parsed.host, matches[3]);
    }
    matches = url.match(/^https?:\/\/yandex(\.[a-z]{2,3}){1,2}\/yandsearch/);
    if (matches) {
        parsed = utils.parseURL(url);
        if (parsed.params.text) {
            return getKey(parsed.host, parsed.params.text);
        }
    }
    matches = url.indexOf(chrome.runtime.getURL('group.html')) === 0;
    if (matches) {
        parsed = utils.parseURL(url);
        if (parsed.params.text) {
            const host = parsed.query.match(/^\?([^&]+)/);
            if (host) {
                return getKey(host[1], parsed.params.text);
            }
        }
    }
}

function getKey(host, text) {
    return host + '&text=' + text;
}

function isSerpRedirect(url) {
    if (/^http:\/\/yandex\.ru\/clck\/jsredir/.test(url)) {
        return true;
    }
    if (/^https?:\/\/(www\.)?google(\.[a-z]{2,3}){1,2}\/url\?/.test(url)) {
        return true;
    }
}

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
    if (changeInfo.status !== 'complete') {
        return;
    }
    tabId = tab.id;
    if (serpTabs[tabId]) {
        const parsed = utils.parseURL(tab.url);
        if (parsed.host !== serpTabs[tabId].host) {
            delete serpTabs[tabId];
        }
    } else if (tab.openerTabId && !isSerpRedirect(tab.url)) {
        chrome.tabs.get(tab.openerTabId, function(openerTab) {
            if (openerTab) {
                const serpKey = checkSerp(openerTab);
                if (serpKey) {
                    serpTabs[tabId] = {
                        serpKey: serpKey,
                        host: utils.parseURL(tab.url).host
                    };
                }
            }
        });
    }
});

chrome.tabs.onRemoved.addListener(function(tabId, removeInfo) {
    if (serpTabs[tabId]) {
        delete serpTabs[tabId];
    }
});
// END: serp.js

// START: rarely.js
const rarelyTabs = {};
const RARELY_DURATION_MS = 3 * 60 * 60 * 1000;

function getRarelyTabs() {
    const res = {};
    const now = Date.now();
    Object.keys(rarelyTabs).forEach(function(tabId) {
        if (now - rarelyTabs[tabId].activityTs > RARELY_DURATION_MS) {
            res[tabId] = true;
        }
    });
    return res;
}

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
    if (changeInfo.status !== 'complete') {
        return;
    }
    updateTs(tab.id);
});

chrome.tabs.onActivated.addListener(function(activeInfo) {
    updateTs(activeInfo.tabId);
});

chrome.tabs.onRemoved.addListener(function(tabId) {
    if (rarelyTabs[tabId]) {
        delete rarelyTabs[tabId];
    }
});

function updateTs(tabId) {
    rarelyTabs[tabId] = rarelyTabs[tabId] || {};
    rarelyTabs[tabId].activityTs = Date.now();
}
// END: rarely.js

// START: opened-pages.js
const openedPagesPrefix = chrome.runtime.getURL('/');
let openedPagesTimeout;

function restoreOpenedPages() {
    storage.loadKeys('openedPages', function(res) {
        const pages = res.openedPages || [];
        if (!pages.length) {
            return;
        }
        chrome.windows.getAll({populate: false}, function(windows) {
            windows.forEach(function(win) {
                const tabs = pages.filter(function(page) {
                    return page.windowId === win.id;
                });
                tabs.forEach(function(tab) {
                    chrome.tabs.create({
                        url: tab.url,
                        windowId: tab.windowId,
                        index: tab.index
                    });
                });
            });
        });
    });
}

function saveOpenedPages() {
    clearTimeout(openedPagesTimeout);
    openedPagesTimeout = setTimeout(function() {
        const pages = [];
        chrome.windows.getAll({populate: true}, function(windows) {
            windows.forEach(function(win) {
                win.tabs.forEach(function(tab) {
                    const isOptions = tab.url === chrome.runtime.getURL('/options/options.html');
                    if (tab.url.indexOf(openedPagesPrefix) === 0 && !isOptions) {
                        pages.push({
                            url: tab.url,
                            windowId: tab.windowId,
                            index: tab.index
                        });
                    }
                });
            });
            storage.save({openedPages: pages});
        });
    }, 3000);
}

chrome.tabs.onCreated.addListener(saveOpenedPages);
chrome.tabs.onRemoved.addListener(saveOpenedPages);
saveOpenedPages();
// END: opened-pages.js

// START: background.js
function makeGroups() {
    getOpenedTabs(function(openedTabs) {
        const visibleGroups = getVisibleGroups(openedTabs);
        storage.load(function(savedGroups, settings) {
            openedTabs = removeExcludes(openedTabs, settings.excludeHosts);
            const hostTabs = settings.groupHost ? getHostTabs(openedTabs) : {};
            const newSerpTabs = settings.groupSerp ? serpTabs : {};
            let newRarelyTabs = settings.groupRare ? getRarelyTabs() : {};
            if (Object.keys(newRarelyTabs).length >= openedTabs.length) {
                newRarelyTabs = {};
            }
            const newGroups = getNewGroups(openedTabs, hostTabs, newSerpTabs, newRarelyTabs);
            mergeSavedAndNewGroups(savedGroups, newGroups, visibleGroups);
            saveGroups(newGroups, savedGroups, function() {
                const createdGroups = doUpdate(newGroups, visibleGroups);
                changeActiveTab(newGroups, visibleGroups, createdGroups);
                closeTabs(newGroups, createdGroups);
            });
        });
    });
}

function getNewGroups(openedTabs, hostTabs, serpTabs, rarelyTabs) {
    const groups = {};
    let key;

    openedTabs.forEach(function(tab) {
        let hostStatus = 'passed';
        let serpStatus = 'passed';
        let rarelyStatus = 'passed';

        if (hostTabs[tab.id]) {
            key = tab.host;
            hostStatus = addTabToGroup(tab, groups, key);
        }

        if (serpTabs[tab.id]) {
            key = serpTabs[tab.id].serpKey;
            serpStatus = addTabToGroup(tab, groups, key);
        }

        if (rarelyTabs[tab.id]) {
            key = 'rarely';
            rarelyStatus = addTabToGroup(tab, groups, key);
        }

        const added = hostStatus === 'added' || serpStatus === 'added' || rarelyStatus === 'added';
        const passed = hostStatus === 'passed' && serpStatus === 'passed' && rarelyStatus === 'passed';

        if (added || passed) {
            return;
        } else {
            chrome.tabs.remove(tab.id);
        }
    });

    return groups;
}

function addTabToGroup(tab, groups, key) {
    if (groups[key]) {
        const exists = groups[key].some(function(t) {
            return t.url === tab.url;
        });
        if (!exists) {
            groups[key].push(tab);
            return 'added';
        } else {
            return 'dublicate';
        }
    } else {
        groups[key] = [tab];
        return 'added';
    }
}

function mergeSavedAndNewGroups(savedGroups, newGroups, visibleGroups) {
    Object.keys(newGroups).forEach(function(key) {
        if (visibleGroups[key]) {
            if (savedGroups[key]) {
                savedGroups[key].forEach(function(sTab) {
                    const exists = newGroups[key].some(function(gTab) {
                        return gTab.url === sTab.url;
                    });
                    if (!exists) {
                        newGroups[key].push(sTab);
                    }
                });
            }
        } else if (newGroups[key].length === 1) {
            delete newGroups[key];
        }
    });
}

function getOpenedTabs(callback) {
    chrome.tabs.query({
        windowId: chrome.windows.WINDOW_ID_CURRENT,
        pinned: false
    }, function(tabs) {
        callback(tabs.map(function(tab) {
            const parsed = utils.parseURL(tab.url);
            tab.url = parsed.href;
            tab.host = parsed.host;
            return tab;
        }));
    });
}

function getVisibleGroups(openedTabs) {
    const prefix = chrome.runtime.getURL('/group.html');
    const visibleGroupTabs = [];
    for (let i = openedTabs.length; i--;) {
        const tab = openedTabs[i];
        if (tab.url.indexOf(prefix) === 0) {
            visibleGroupTabs.unshift(tab);
            openedTabs.splice(i, 1);
        }
    }
    const visibleGroups = {};
    visibleGroupTabs.forEach(function(tab) {
        const key = tab.url.split('?')[1];
        visibleGroups[key] = tab;
    });
    return visibleGroups;
}

function removeExcludes(openedTabs, excludeHosts) {
    return openedTabs.filter(function(tab) {
        return excludeHosts.indexOf(tab.host) === -1;
    });
}

function getHostTabs(openedTabs) {
    return openedTabs.reduce(function(res, tab) {
        res[tab.id] = tab;
        return res;
    }, {});
}

function saveGroups(groups, savedGroups, callback) {
    Object.keys(groups).forEach(function(key) {
        savedGroups[key] = groups[key].map(function(tab) {
            const res = {
                url: tab.url,
                title: tab.title
            };
            if (tab.favIconUrl) {
                res.favIconUrl = tab.favIconUrl;
            }
            return res;
        });
    });
    storage.saveGroups(savedGroups, callback);
}

function doUpdate(groups, visibleGroups) {
    const update = {};
    const create = {};
    const usedIds = [];
    Object.keys(groups).forEach(function(key) {
        if (visibleGroups[key]) {
            update[key] = groups[key];
        } else {
            const unusedTab = groups[key].filter(function(t) {
                return usedIds.indexOf(t.id) === -1;
            })[0] || {};
            if (unusedTab.id) {
                usedIds.push(unusedTab.id);
                create[key] = unusedTab;
            } else {
                create[key] = {};
            }
        }
    });

    if (Object.keys(create).length) {
        Object.keys(create).forEach(function(key) {
            createGroupedTab(key, create[key].id);
        });
    }

    if (Object.keys(update).length) {
        updateAllGroupedTabs(update);
    }

    return create;
}

function createGroupedTab(key, tabId) {
    const url = chrome.runtime.getURL('group.html') + '?' + key;
    if (tabId) {
        chrome.tabs.update(tabId, {url: url});
    } else {
        chrome.tabs.create({url: url});
    }
}

function updateAllGroupedTabs(groups) {
    const sendGroups = {};
    Object.keys(groups).forEach(function(key) {
        sendGroups[key] = groups[key].map(function(tab) {
            return {
                id: tab.id || null,
                url: tab.url,
                title: tab.title,
                favIconUrl: tab.favIconUrl
            };
        });
    });
    chrome.runtime.sendMessage({
        msg: 'take-data',
        data: sendGroups
    });
}

function changeActiveTab(newGroups, visibleGroups, createdGroups) {
    let activeKey;

    Object.keys(newGroups).every(function(key) {
        const hasActive = newGroups[key].some(function(tab) {
            return tab.active;
        });
        if (hasActive) {
            activeKey = key;
            return false;
        }
        return true;
    });

    if (activeKey) {
        const newActiveTab = visibleGroups[activeKey] || createdGroups[activeKey];
        if (newActiveTab) {
            chrome.tabs.update(newActiveTab.id, {active: true});
        }
    }
}

function closeTabs(newGroups, createdGroups) {
    let ids = [];

    Object.keys(newGroups).forEach(function(key) {
        ids = ids.concat(newGroups[key].map(function(tab) {
            return tab.id;
        }).filter(Boolean));
    });

    const excludeIds = Object.keys(createdGroups).map(function(key) {
        return createdGroups[key].id;
    });
    ids = ids.filter(function(id) {
        return excludeIds.indexOf(id) === -1;
    });

    ids = utils.removeDublicates(ids);

    if (ids.length) {
        chrome.tabs.remove(ids);
    }
}

function restoreGroups() {
    getOpenedTabs(function(openedTabs) {
        const visibleGroups = getVisibleGroups(openedTabs);
        storage.load(function(savedGroups, settings) {
            doUpdate(savedGroups, visibleGroups);
        });
    });
}
// END: background.js

// START: button.js
chrome.action.onClicked.addListener(makeGroups);

const RED_TABS_COUNT = 20;
let buttonTimeout;

function updateIcon() {
    clearTimeout(buttonTimeout);
    buttonTimeout = setTimeout(function() {
        chrome.tabs.query({windowId: chrome.windows.WINDOW_ID_CURRENT}, function(tabs) {
            const img19 = tabs.length >= RED_TABS_COUNT ? 'img/kpager-19-red.png' : 'img/kpager-19.png';
            const img38 = tabs.length >= RED_TABS_COUNT ? 'img/kpager-38-red.png' : 'img/kpager-38.png';
            chrome.action.setIcon({path: {
                '19': img19,
                '38': img38
            }});
        });
    }, 300);
}

chrome.tabs.onCreated.addListener(updateIcon);
chrome.tabs.onRemoved.addListener(updateIcon);
updateIcon();
// END: button.js

// START: context-menu.js
const contextMenu = {
    init: function() {
        storage.load(function(savedGroups, settings) {
            if (settings.showContextMenuItem) {
                contextMenu.showItem();
            } else {
                contextMenu.hideItem();
            }
        });
    },
    showItem: function() {
        chrome.contextMenus.removeAll(function() {
            chrome.contextMenus.create({
                id: 'make-groups',
                type: 'normal',
                title: chrome.i18n.getMessage('contextMenu_makeGroups'),
                contexts: ['all']
            });
        });
    },
    hideItem: function() {
        chrome.contextMenus.removeAll();
    }
};

chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === 'make-groups') {
        makeGroups();
    }
});

contextMenu.init();
// END: context-menu.js

// START: debug.js
const debug = {
    get storage() {
        storage.load(function(hosts, data) {
            logj(data);
        });
    },
    get clear_storage() {
        storage.saveGroups({});
    },
    get whatsnew() {
        chrome.tabs.create({url: chrome.runtime.getURL('whatsnew/whatsnew.ru.html')});
    }
};
// END: debug.js