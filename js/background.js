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

//Mouse position
var mousePosition = null;

//Event fired with each new page visit
backgroundPage._OnUpdated = function(tabid, changeinfo, tab) {
    //Check for completed requests
    if (changeinfo.status == "complete" && functs.checkUrl(tab.url)) {
      //Chech the domain / page
        // var xhr = new XMLHttpRequest();
        // xhr.open("GET", tab.url, true);
        // xhr.onreadystatechange = function() {
        //     if (xhr.readyState == 4) {
        //         if(xhr.status == 0) {
        //             console.log("wrong domain:", tab.url);
        //         } else if(xhr.status == 404) {
        //             console.log("404 page:", tab.url);
        //         } else if(xhr.status == 200) {
                    //Restore storage options
                    abm._Restore(function() {
                        console.log("restore:", tab.url);
                        backgroundPage._SetEnv(tab.windowId)
                        backgroundPage._LoadAll(tab.url);
                    });
        //         }
        //     }
        // }
        // //Check url (on production)
        // xhr.send(null);
    }
};

backgroundPage._GetNumberOfPostits = function() {
  functs.delay(function(){
    chrome.tabs.getSelected(null,function(tab) {
        chrome.browserAction.setBadgeText({text: ""});
        if(chrome.runtime.lastError !== undefined) { console.log('Error checkLoaded', chrome.runtime.lastError); return; }
        if (tab && abm.state && functs.checkUrl(tab.url)) {
            setTimeout(function(){
                chrome.tabs.executeScript(tab.id, { code: "lengthPostits();" });
            }, 500);
        }
    });
  }, 500);
};

backgroundPage._LoadAll = function(url) {
    abm._Restore(function() {
        abm.sendMessage('init');
        if(abm.autoloadEnabled) {
            var id = parseInt(functs.getUrlParameter('highlightNote', url), 10);
            if(!isNaN(id)) {
                abm.sendMessage('load', id);
            } else {
                abm.sendMessage('show', '');
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
        abm.setIcon(false, isUrl);
        if(abm.state && isUrl) {
            abm.setIcon(true, isUrl);
        }
    });
};

backgroundPage.captureScreenShot = function(){
  chrome.tabs.getSelected(null,function(tab) {
    chrome.tabs.captureVisibleTab(null, {}, function(img) {
        var domain = functs.getUniqueId(tab.url);
        if(domain !== "") {
            //Recover data
            var varname = "screenshots";
            var varvalue = localStorage.getItem(varname);
            if(varvalue != null) {
                varvalue = JSON.parse(varvalue);
            } else {
                varvalue = [];
            }
            //Remove previos screenshot if it exists
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
        } else {
            console.log('captureScreenShot wrong domain', tab.url);
        }
    });
  });
};

backgroundPage._SetContextMenu = function(cmId, title, contexts, callback) {
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
            action = "newdashboard";
        }
        //Congtent
        var content = "";
        if(e.menuItemId == "idContextMenuPIA1" || e.menuItemId == "idContextMenuPIA2") {
            content = "&nbsp;";
        } else {
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
  if(!abm.state) { console.log('Extension stopped!'); return; }
  if(!abm.autoloadEnabled) { console.log('Autoload disabled!'); return; }
  abm.sendMessage('checkLoaded', 'all');
  backgroundPage._SetContextMenuActions();
});

//When the extension finished installing
chrome.runtime.onInstalled.addListener(function (object) {
  console.log('Created PodtItAll context menu!');
  backgroundPage._SetContextMenu(3, 'New note with selected text', ['selection']);
  backgroundPage._SetContextMenu(4, 'New note with selected text in dashboard', ['selection']);
  backgroundPage._SetContextMenu(1, 'New blank note', ['page', 'selection']);
  backgroundPage._SetContextMenu(2, 'New blank note in dashboard', ['page', 'selection']);
  backgroundPage._SetContextMenuActions();
});

//Get messages
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  abm._OnMessage(request, sender, sendResponse);
});
