/**
* autobookmarks.txusko.com
* chrome extension - released under MIT License
* Author: Javi Filella <txusko@gmail.com>
* http://github.com/txusko/PostItAll
* Copyright (c) 2015 Javi Filella
*
* Permission is hereby granted, free of charge, to any person
* obtaining a copy of this software and associated documentation
* files (the "Software"), to deal in the Software without
* restriction, including without limitation the rights to use,
* copy, modify, merge, publish, distribute, sublicense, and/or sell
* copies of the Software, and to permit persons to whom the
* Software is furnished to do so, subject to the following
* conditions:
*
* The above copyright notice and this permission notice shall be
* included in all copies or substantial portions of the Software.
*
* THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
* EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
* OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
* NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
* HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
* WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
* FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
* OTHER DEALINGS IN THE SOFTWARE.
*
*/

var backgroundPage = {};

//Unique userId
var userId = "";

//Mouse position
var mousePosition = null;

//Event fired with each new page visit
backgroundPage._OnUpdated = function(tabid, changeinfo, tab) {

    //UserId
    chrome.storage.sync.get('userId', function(items) {
        userId = items.userId;
        if (!userId) {
            userId = functs.guid();
            chrome.storage.sync.set({userId: userId});
        }
    });

    //Check for completed requests
    if (changeinfo.status == "complete" && functs.checkUrl(tab.url)) {
    //Chech the domain / page
        var xhr = new XMLHttpRequest();
        xhr.open("GET", tab.url, true);
        xhr.onreadystatechange = function() {
            if (xhr.readyState == 4) {
                if(xhr.status == 0) {
                    console.log("wrong domain:", tab.url);
                } else if(xhr.status == 404) {
                    console.log("404 page:", tab.url);
                } else if(xhr.status == 200) {
                    //Restore storage options
                    abm._Restore(function() {
                        //console.log('backgroundPage._OnUpdated call backgroundPage._Init', changeinfo.status);
                        backgroundPage._Init(tab);
                    });
                }
            }
        }
        //Activar en producció per comprobar la URL
        xhr.send(null);
    }
}

backgroundPage._GetNumberOfPostits = function() {
  chrome.tabs.getSelected(null,function(tab) {
    if(chrome.runtime.lastError !== undefined) { console.log('Error checkLoaded', chrome.runtime.lastError); return; }
    if (tab && abm.state && functs.checkUrl(tab.url)) {
        setTimeout(function(){
            chrome.browserAction.setBadgeText({text: ""});
            chrome.tabs.executeScript(tab.id, { code: "lengthPostits();" });
        }, 500);
    }
  });
}

backgroundPage._Init = function(tab) {

    //Check state
    if(!abm.state) { console.log('Extension stopped!'); return; }

    //Jquery
    if(chrome.runtime.lastError !== undefined) { console.log('Error loading PIA', chrome.runtime.lastError); return; }
    chrome.tabs.executeScript(tab.id, { file: "js/jquery-2.1.4.min.js" }, function() {
        //UI
        if(chrome.runtime.lastError !== undefined) { console.log('Error loading PIA', chrome.runtime.lastError); return; }
        //console.log('jquery loaded!');
        chrome.tabs.insertCSS(tab.id, {file: "css/jquery-ui-1.10.0.custom.css"});
        chrome.tabs.insertCSS(tab.id, {file: "css/trumbowyg.css"});
        chrome.tabs.insertCSS(tab.id, {file: "css/trumbowyg.smallicons.css"});
        chrome.tabs.insertCSS(tab.id, {file: "css/jquery.minicolors.css"});
        chrome.tabs.insertCSS(tab.id, {file: "css/jquery.postitall.fontstyles.css"});
        chrome.tabs.insertCSS(tab.id, {file: "css/jquery.postitall.css"});

        chrome.tabs.executeScript(tab.id, { file: "js/jquery-ui-1.10.1.min.js" }, function() {
            chrome.tabs.executeScript(tab.id, { file: "js/trumbowyg.js" }, function() {
                //console.log('jquery ui loaded!');
                chrome.tabs.executeScript(tab.id, { file: "js/jquery.htmlclean.js" }, function() {
                    //CSS
                    if(chrome.runtime.lastError !== undefined) { console.log('Error loading PIA', chrome.runtime.lastError); return; }
                    //Minicolors
                    chrome.tabs.executeScript(tab.id, { file: "js/jquery.minicolors.js" }, function() {

                            //Postitall plugin
                            if(chrome.runtime.lastError !== undefined) { console.log('Error loading PIA', chrome.runtime.lastError); return; }
                            chrome.tabs.executeScript(tab.id, { file: "js/jquery.postitall.js" }, function() {
                                chrome.tabs.executeScript(tab.id, { file: "js/jquery.postitall.chromeManager.js" }, function() {
                                //Execute
                                if(chrome.runtime.lastError !== undefined) { console.log('Error loading PIA', chrome.runtime.lastError); return; }
                                chrome.tabs.executeScript(tab.id, { file: "js/loadpostits.js" }, function() {
                                    if(chrome.runtime.lastError !== undefined) { console.log('Error loading PIA', chrome.runtime.lastError); return; }
                                    functs.delay(function(){
                                        backgroundPage._SetEnv(tab.windowId)
                                        backgroundPage._LoadAll(tab.url);
                                        console.log('Extension loaded!');
                                    }, 200);
                                });
                            });
                            });

                    });
                });
            });
        });
    });
}

backgroundPage._LoadAll = function(url) {
    abm._Restore(function() {
        abm.sendMessage('init');
        if(abm.autoloadEnabled) {
            //console.log('_LoadAll abm.autoloadEnabled', abm.autoloadEnabled);
            var id = parseInt(functs.getUrlParameter('highlightNote', url), 10);

            if(id !== NaN) {
                abm.sendMessage('load', id);
            }
        } else {
            console.log('Autoload disabled!');
            backgroundPage._GetNumberOfPostits();
        }
    });
};

backgroundPage._SetEnv = function(windowId) {
    return;
    chrome.tabs.getSelected(windowId,function(tab) {
        var isUrl = functs.checkUrl(tab.url);
        //console.log('isUrl', isUrl);
        abm.setIcon(false, isUrl);
        if(abm.state && isUrl) {
            abm.setIcon(true, isUrl);
        }
    });
};

backgroundPage.captureScreenShot = function(){
  //console.log('backgroundPage.captureScreenShot');
  chrome.tabs.getSelected(null,function(tab) {
    chrome.tabs.captureVisibleTab(null, {}, function(img) {
        //console.log('Screenshot', img);
        var domain = functs.getUniqueId(tab.url);
        //console.log('captureScreenshot', domain);
        if(domain !== "") {
            //Recover data
            var varname = "screenshots";
            var varvalue = localStorage.getItem(varname);
            if(varvalue != null) {
                varvalue = JSON.parse(varvalue);
            } else {
                varvalue = [];
            }
            //Remove previos screenshot if it exists
            //console.log(varvalue);
            for(var i = 0; i < varvalue.length; i++) {
                if(varvalue[i].domain === domain) {
                    varvalue.remove(i);
                    break;
                }
            }
            //Create new screenshot page
            var page = { url: tab.url, domain: domain, img: img, notes: [] };
            varvalue.push(page);
            var testPrefs = JSON.stringify(varvalue);
            //Save all screenshots in localstorage
            localStorage.setItem(varname, testPrefs);
            //console.log('Screenshot saved', testPrefs);
            //backgroundPage._SaveScreenShotInExtProv(img);
        } else {
            console.log('wrong domain', tab.url);
        }
    });
  });
}

backgroundPage._SaveScreenShotInExtProv = function(img) {
    var url = "http://localhost/~txusko/Postitall_Share/share.php";
    var xhr = new XMLHttpRequest();
    var formData = new FormData();
    formData.append("img", img);
    xhr.onreadystatechange = function(retVal) {
      if(xhr.readyState == 4 && xhr.status == 200) {
        //console.log('retVal', xhr.response);
      }
    }
    xhr.open("POST", url, true);
    xhr.send(formData);
}

backgroundPage._ReloadAll = function() {
    //chrome.tabs.create({url: chrome.extension.getURL("options.html")});
    chrome.tabs.query({}, function (tabs) {
        var myTabs = [];
        for (var i = 0; i < tabs.length; i++) {
            //console.log('reload de tots els tabs', tabs[i].url.indexOf('http'));
            if (tabs[i].url.indexOf('http') === 0) {
                myTabs.push(tabs[i].id);
            }
        }
        //console.log(myTabs);
        for (var i = 0; i < myTabs.length; i++) {
            chrome.tabs.reload(myTabs[i]);
        }
    });
};

backgroundPage._SetContextMenu = function(cmId, title, contexts, callback) {
  //console.log('create context menu idContextMenuPIA' + cmId);
  chrome.contextMenus.create({
    'id'  : 'idContextMenuPIA' + cmId,
    'title' : title,
    'contexts' : contexts
  });
};

var contextMenuListener = false;
backgroundPage._SetContextMenuActions = function() {
    if(contextMenuListener)
        return;
    chrome.contextMenus.onClicked.addListener(function(e) {
        //Action
        var action;
        if(e.menuItemId == "idContextMenuPIA1" || e.menuItemId == "idContextMenuPIA3") {
            action = "new2";
        } else {
            action = "new_dashboard";
        }
        //Congtent
        var content = "";
        if(e.menuItemId == "idContextMenuPIA1" || e.menuItemId == "idContextMenuPIA2") {
            content = "&nbsp;";
        } else {
            if (e.selectionText) {
                content = e.selectionText.replace(/'/g,"\\'");
            }
        }
        abm.sendMessage(action, content);
    });
    contextMenuListener = true;
};

//When new tab is loaded
chrome.tabs.onUpdated.addListener(function(tabid, changeinfo, tab) {
  backgroundPage._OnUpdated(tabid, changeinfo, tab);
  backgroundPage._SetContextMenuActions();
});
//When a tab is activated
chrome.tabs.onActivated.addListener(function(activeInfo) {
    //console.log('chrome.tabs.onActivated.addListener', activeInfo);
    if(!abm.state) { console.log('Extension stopped!'); return; }
    if(!abm.autoloadEnabled) { console.log('Autoload disabled!'); return; }
    abm.sendMessage('checkLoaded', 'all');
    backgroundPage._SetContextMenuActions();
});
//When a tab is closed
chrome.tabs.onRemoved.addListener(function(tabId, removeInfo) {

});
//When the extension finished installing
chrome.runtime.onInstalled.addListener(function (object) {
    backgroundPage._ReloadAll();
    console.log('Created context menu!');
    backgroundPage._SetContextMenu(3, 'New note with selected text', ['selection']);
    backgroundPage._SetContextMenu(4, 'New note with selected text in dashboard', ['selection']);
    backgroundPage._SetContextMenu(1, 'New blank note', ['page', 'selection']);
    backgroundPage._SetContextMenu(2, 'New blank note in dashboard', ['page', 'selection']);
    backgroundPage._SetContextMenuActions();
});

//Get messages
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {

    if(!abm.state) return;

    //console.log('chrome.runtime.onMessage.addListener request', request);

    var description = request.description;
    if(description === undefined) {
        description = "";
    }

    var byPassCode = "loadPostit('"+description+"');";
    var dashUrl = "dashboard.html?userId="+userId;
    if((request.type == "new2" || request.type == "new_dashboard") && mousePosition != null) {
        byPassCode = "loadPostit('"+description+"', '"+mousePosition.posX+"', '" + mousePosition.posY + "');"
        dashUrl += "&posX="+mousePosition.posX+"&posY=" + mousePosition.posY;
    }
    if(description)
        dashUrl += "&desc="+description;

    function createPostItOnBg(tabId, info, tab){
        if (info.status == "complete") {
            setTimeout(function(){
                console.log(byPassCode);
                chrome.tabs.executeScript(tabId, { code: byPassCode }, function() {
                    console.log('New postit created on background.js 2');
                    chrome.tabs.onUpdated.removeListener(createPostItOnBg);
                    backgroundPage._GetNumberOfPostits();
                });
            },2000);
        }
    }

    switch(request.type) {
        case "init":
            chrome.tabs.getSelected(null,function(tab) {
                if(functs.checkUrl(tab.url) && tab.url.indexOf('http') === 0) {
                    abm.enabledFeatures.savable = true;
                    var execCode = "var enabledFeatures = " + JSON.stringify(abm.enabledFeatures) + "; ";
                    execCode += "var style = " + JSON.stringify(abm.style) + "; var postit = " + JSON.stringify(abm.postit) + "; ";
                    execCode += "initPostits(enabledFeatures, style, postit);";
                    if(chrome.runtime.lastError !== undefined) { console.log('Error loading PIA', chrome.runtime.lastError); return; }
                    chrome.tabs.executeScript(tab.id, { code: execCode }, function() {
                        //console.log('Initialized features ob background.js');
                    });
                }
            });
        break;
        case "checkLoaded":
            chrome.tabs.getSelected(null,function(tab) {
                //Reload postits
                if(chrome.runtime.lastError !== undefined) { console.log('Error checkLoaded', chrome.runtime.lastError); return; }
                if(tab && functs.checkUrl(tab.url) && tab.url.indexOf('http') === 0) {
                    if(chrome.runtime.lastError !== undefined) { console.log('Error checkLoaded', chrome.runtime.lastError); return; }
                    chrome.tabs.executeScript(tab.id, { code: "checkLoaded();" });
                    backgroundPage._GetNumberOfPostits();
                }
                backgroundPage._SetEnv(tab.windowId);
            });
        break;
        case "new":
        case "new2":
            chrome.tabs.getSelected(null,function(tab) {
                //if(functs.checkUrl(tab.url)) {
                    //if(functs.checkUrl(tab.url) && tab.url.indexOf('http') === 0) {
                    if(functs.getUniqueId(tab.url)) {
                        //console.log('New postit created on background.js',byPassCode);
                        chrome.tabs.executeScript(tab.id, { code: byPassCode }, function() {
                            //console.log('New postit created on background.js',byPassCode);
                            backgroundPage._GetNumberOfPostits();
                        });
                    } else {
                        //console.log('create on new page for userId', userId);
                        //chrome.tabs.update(tab.id, {url: "http://postitall.txusko.com/extension/?userId=" +userId}, function(info) {
                        chrome.tabs.update(tab.id, {url: dashUrl}, function(info) {
                            console.log(info);
                            //chrome.tabs.onUpdated.addListener(createPostItOnBg);
                        });
                    }
                //}
            });
        break;
        case "new_dashboard":
            chrome.tabs.getSelected(null,function(tab) {
                if(functs.checkUrl(tab.url)) {
                    chrome.tabs.executeScript({
                      code: "window.getSelection().toString();"
                    }, function(selection) {
                        if(!description && selection !== undefined) dashUrl = dashUrl + "&desc=" + selection;
                        chrome.tabs.update(tab.id, {url: dashUrl}, function(info) {
                            //console.log(info);
                        });
                    });
                } else {
                    if(!description) dashUrl = dashUrl + "&desc=&nbsp;";
                    chrome.tabs.update(tab.id, {url: dashUrl}, function(info) {
                        //console.log(info);
                    });
                }
            });
        break;
        case "load":
            chrome.tabs.getSelected(null,function(tab) {
                if(tab.url.indexOf('http') === 0) {
                    //console.log("loadPostits('" + request.description + "');");
                    chrome.tabs.executeScript(tab.id, { code: "loadPostits('" + request.description + "');" }, function() {
                        //console.log('All postits loaded on background.js');
                        //backgroundPage._GetNumberOfPostits();
                    });
                }
            });
        break;
        case "hide":
            chrome.tabs.getSelected(null,function(tab) {
                chrome.tabs.executeScript(tab.id, { code: "hidePostits();" }, function() {
                    //console.log('All postits hiden on background.js');
                    backgroundPage._GetNumberOfPostits();
                    abm._HiddenNotes = true;
                });
            });
        break;
        case "viewhide":
            chrome.tabs.getSelected(null,function(tab) {
                chrome.tabs.executeScript(tab.id, { code: "viewhidePostits();" }, function() {
                    backgroundPage._GetNumberOfPostits();
                });
            });
        break;
        case "show":
            chrome.tabs.getSelected(null,function(tab) {
                chrome.tabs.executeScript(tab.id, { code: "showPostits();" }, function() {
                    //console.log('All postits hiden on background.js');
                    backgroundPage._GetNumberOfPostits();
                    abm._HiddenNotes = true;
                });
            });
        break;
        case "dashboard":
            chrome.tabs.getSelected(null,function(tab) {
                //chrome.tabs.create({url: "http://postitall.txusko.com/extension/?userId=" +userId});
                //chrome.tabs.update(tab.id, {url: "http://postitall.txusko.com/extension/?userId=" +userId});
                chrome.tabs.update(tab.id, {url: "dashboard.html?userId=" +userId});
            });
        break;
        case "delete":
            chrome.tabs.getSelected(null,function(tab) {
                chrome.tabs.executeScript(tab.id, { code: "deletePostits();" }, function() {
                    //console.log('All postits deleted on background.js');
                    backgroundPage._GetNumberOfPostits();
                });
            });
        break;

        case "length":
            backgroundPage._GetNumberOfPostits();
        break;

        case "badge":
            //console.log('... ' + request.description);
            chrome.browserAction.setBadgeText({text: '' + request.description});
        break;

        case "screenshot":
            backgroundPage.captureScreenShot();
            return true;
        break;

        case "share":
            chrome.tabs.getSelected(null,function(tab) {
                /*chrome.tabs.executeScript(tab.id, { code: "sharePostits();" }, function() {
                    console.log('share');
                });*/
                chrome.tabs.captureVisibleTab(null, function(img) {
                    var xhr = new XMLHttpRequest(), formData = new FormData();
                    formData.append("img", img);
                    xhr.open("POST", "http://localhost/PostItAll/share.php", true);
                    xhr.send(formData);
                    //console.log(img);
                });
            });
        break;

        case "mouseup":
            mousePosition = request.point;
        break;

        case "alert":
            chrome.tabs.getSelected(null,function(tab) {
                if(request.description != "") {
                    //chrome.tabs.executeScript(tab.id, { code: 'alert("'+request.description+'");' }, function() {
                        //console.log('Alert on background.js', request.description);
                        alert(request.description);
                    //});
                }
            });
        break;

        case "reload":
            //Get selected tab
            /*chrome.tabs.getSelected(null,function(tab) {
                chrome.tabs.reload(tab.id);
                if(abm.state)
                    backgroundPage._GetNumberOfPostits();
            });*/
            backgroundPage._ReloadAll();
        break;
    }
    return true;
});
