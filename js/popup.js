/**
* autobookmarks.txusko.com
* chrome extension - released under MIT License
* Author: Javi Filella <txusko@gmail.com>
* http://github.com/txusko/AutoBookmarks
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

var console = console;
if(chrome.extension.getBackgroundPage() != null)
  console = chrome.extension.getBackgroundPage().console;

$(function() {
    var userId = "";
    //UserId
    chrome.storage.sync.get('userId', function(items) {
        userId = items.userId;
        if (!userId) {
            userId = functs.guid();
            chrome.storage.sync.set({userId: userId});
        }
    });
    //Options link
    $('#idSettings').click(function() {
        chrome.tabs.update({ url: chrome.extension.getURL("options.html") });
        window.close();
    });
    $('#dashboard').click(function() {
    //chrome.tabs.create({ url: "http://postitall.txusko.com/extension/?userId=" + userId });
        chrome.tabs.update({ url: "/dashboard.html" });
        window.close();
    });
    $('#notelist').click(function() {
        chrome.tabs.update({ url: chrome.extension.getURL("options.html#tabs-3") });
        window.close();
    });

    $('#add-postit-dashboard').click(function() {
        abm.sendMessage('new_dashboard');
        postitShown = true;
        window.close();
    }).removeClass('disabled');
});

var popup = [];

popup.setMenu = function() {

    $('.page-option').show();

    $('#add-postit').click(function() {
        abm.sendMessage('new');
        postitShown = true;
        window.close();
    }).removeClass('disabled');

    $('#viewhide-postit').click(function() {
        abm.sendMessage('viewhide');
        abm.autoloadEnabled = false;
    }).removeClass('disabled');

    $('#hide-postit').click(function() {
        //console.log("hide postit");
        abm.sendMessage('hide');
        postitShown = false;
        //$('#view-postit').show();
        //$('#hide-postit').hide();
        abm.autoloadEnabled = false;
    }).removeClass('disabled');
    $('#view-postit').click(function() {
        //console.log("view postit");
        abm.sendMessage('show');
        postitShown = true;
        //$('#hide-postit').show();
        //$('#view-postit').hide();
        abm.autoloadEnabled = false;
    }).removeClass('disabled');

    $('#delete-postit').click(function() {
        //console.log("delete postit");
        abm.sendMessage('delete');
        window.close();
    }).removeClass('disabled');

    $('#share-postit').click(function() {
        //console.log("share postit");
        abm.sendMessage('share', 'all');
    }).removeClass('disabled');

    //abm.setIcon(true);
}

popup.setMenuOff = function() {

    $('.page-option').hide();

    $('#add-postit').click(function(e) {
      e.preventDefault();
    }).addClass('disabled');

    /*$('#add-postit-dashboard').click(function(e) {
        e.preventDefault();
    }).addClass('disabled');*/

    $('#viewhide-postit').click(function(e) {
        e.preventDefault();
    }).addClass('disabled');

    $('#hide-postit').click(function(e) {
        e.preventDefault();
    }).addClass('disabled');

    $('#view-postit').click(function(e) {
        e.preventDefault();
    }).addClass('disabled');

    $('#delete-postit').click(function(e) {
        e.preventDefault();
    }).addClass('disabled');

    $('#share-postit').click(function(e) {
        e.preventDefault();
    }).addClass('disabled');

    //abm.setIcon(false);
}

//Fired when DOM was loaded
document.addEventListener('DOMContentLoaded', function() {

  //Get selected tab
  chrome.tabs.getSelected(null,function(tab) {

    //Restore options
    abm._Restore(function() {

        var setMenuState = function(url) {
            if(functs.checkUrl(url) && abm.state) {
                popup.setMenu();
            } else {
                popup.setMenuOff();
            }
        }

        //state
        abm.initState('reload', function() {
            setMenuState(tab.url);
            window.close();
        });
        setMenuState(tab.url);

        if(abm.trayIconMenu) {
            //Show popup
            setTimeout(function() { $('#idContanier').show('fast', function() { $(this).css('display', ''); }) }, 100);
        } else {
            window.close();
            var domain = functs.getUniqueId(tab.url);
            console.log('domain', tab.url, domain);
            if(domain && abm.state) {
                if(domain === "Dashboard")
                    abm.sendMessage('new_dashboard', '');
                else
                    abm.sendMessage('new', '');
                postitShown = true;
            } else {
                abm.sendMessage('alert', "We can't create notes in the current page due chrome restrictions.");
            }
        }

    });

  });

});
