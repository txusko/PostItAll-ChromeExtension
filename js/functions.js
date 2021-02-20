/**
* postitall.txusko.com
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

//Default vars
var defaults = {
  state : true,                     //true -> extension enabled, false -> extension disabled
  autoloadEnabled: true,            //true -> automatic notes load, false -> nothing
  trayIconMenu: true,               //true -> menu, false -> new note
  _HiddenNotes: false,
  postit: {
    height          : 136,          //height
    width           : 136,          //width
    minHeight       : 136,
    minWidth        : 136,
    position        : 'absolute',   //absolute or fixed
  },
  cssclases : {
      note                : 'note', //Default note style
      withTextShadowWhite : 'withTextShadowWhite', //Note with text-shadow for dark fonts (default)
      withTextShadowBlack : 'withTextShadowBlack', //Note with text-shadow for light fonts (default)
      withoutTextShadow   : 'withoutTextShadow', //Note without text-shadows
      withBoxShadow       : 'withBoxShadow', //Note with box-shadow
      withoutBoxShadow    : 'withoutBoxShadow', //Note without box-shadow
      icons : { //Icon generic clases and set
          icon            : 'PIAicon', //Set for all icons
          iconRight       : 'PIAiconright', //Set for the last top-right icon
          iconLeft        : 'PIAiconleft', //Set for all left icons (top or bottom)
          iconBottom      : 'PIAiconbottom', //Set for all bottom icons (left or right)
          topToolbar      : 'PIAIconTopToolbar', //Set for bottom toolbar (contains all botton icons)
          bottomToolbar   : 'PIAIconBottomToolbar', //Set for bottom toolbar (contains all botton icons)
          close           : 'PIAclose', //Close icon (back panels)
          config          : 'PIAconfig', //Config icon (top-right)
          hide            : 'PIAhide', //Hide icon (top-left)
          minimize        : 'PIAminimize', //Minimize icon (top-left)
          maximize        : 'PIAmaximize', //Restore/Collapse icon (top-left)
          expand          : 'PIAexpand', //Expand icon (top-left)
          blocked         : 'PIAblocked', //Non blocked icon (top-right)
          blockedOn       : 'PIAblocked2', //Blocked icon (top-right)
          delete          : 'PIAdelete', //Delete icon (top-right)
          info            : 'PIAinfoIcon', //Info icon (bottom-left)
          copy            : 'PIAnew', //Copy icon (bottom-left)
          fixed           : 'PIAfixed', //Non fixed icon (top-left)
          fixedOn         : 'PIAfixed2', //Fixed icon (top-left)
          export          : 'PIAexport', //Export icon (bottom-left)
      },
      arrows  : { //Default arrow : none
          arrow   : 'arrow_box', //Set in all arrows
          none    : '', //Without arrow
          top     : 'arrow_box_top', //Top arrow
          right   : 'arrow_box_right', //Right arrow
          bottom  : 'arrow_box_bottom', //Bottom arrow
          left    : 'arrow_box_left' //Left arrow
      }
  },
  useCssProperties : true,
  style : {
    tresd           : true,         //General style in 3d format
    backgroundcolor : '#FFFC7F',    //Background color in new postits when randomColor = false
    textcolor       : '#333333',    //Text color
    textshadow      : true,         //Shadow in the text
    fontfamily      : "'Roboto', sans-serif",    //Default font family
    fontsize        : 'medium',      //Default font size
  },
  enabledFeatures : {
    filter          : 'page',     //domain, page, all
    draggable       : true,         //Set draggable feature on or off
    resizable       : true,         //Set resizable feature on or off
    removable       : true,         //Set removable feature on or off
    changeoptions   : true,         //Set options feature on or off
    savable         : false,         //Save postit in storage
    blocked         : false,         //Postit can not be modified
    minimized       : true,         //true = minimized, false = maximixed
    expand          : false,
    addNew          : false,         //Create a new postit
    fixed           : true,         //Add "fix note" icon
    randomColor     : true,         //Random color in new postits
    autoHideToolBar : true,         //Animation efect on hover over postit shoing/hiding toolbar options
    askOnDelete     : false,         //Confirmation before note remove
    addArrow        : 'back',        //Add arrow to notes : none, front, back, all
    showInfo        : true,
    showMeta        : true,
    exportNote      : true,
    pasteHtml       : false,         //Allow paste html in contenteditor
    htmlEditor      : false,         //Html editor (trumbowyg)
    autoPosition    : true,         //Automatic reposition of the notes when user resize screen
    hidden          : true,         //Hidden note
  }
}

//Extension vars
var abm = $.extend({}, defaults);

//Functions
var functs = {};

//Restore configuration
abm._Restore = function(callback) {
  chrome.storage.sync.get(defaults, function(retVal) {
    //console.log('abm._Restore', retVal);
    //Recover vars
    abm.state = retVal.state;
    abm.autoloadEnabled = retVal.autoloadEnabled;
    abm.trayIconMenu = retVal.trayIconMenu;
    abm.postit = retVal.postit;
    abm.cssclases = retVal.cssclases;
    abm.style = retVal.style;
    abm.enabledFeatures = retVal.enabledFeatures;
    //Localize
    localizePage();
    //Callback
    if(callback != null) callback();
  });
}

abm.initState = function(message, callback) {
  //State
  $('#idState').attr("data-on-text", translate("running"));
  $('#idState').attr("data-off-text", translate("paused"));
  $('#idState').attr("data-label-text", translate("state"));
  if(abm.state) {
    $("[name='state']").bootstrapSwitch('state', true, true);
    chrome.browserAction.setIcon({path:chrome.app.getDetails().icons[19]});

  } else {
    $("[name='state']").bootstrapSwitch();
    chrome.browserAction.setIcon({path:chrome.app.getDetails().icons[20]});
    chrome.browserAction.setBadgeText({text: ""});
  }
  //Action
  $('#idState').on('switchChange.bootstrapSwitch', function(event, state) {
    //Change icon
    if(state) {
      chrome.browserAction.setIcon({path:chrome.app.getDetails().icons[19]});
    } else {
      chrome.browserAction.setIcon({path:chrome.app.getDetails().icons[20]});
      chrome.browserAction.setBadgeText({text: ""});
    }
    console.log('Save state');
    //Save
    chrome.storage.sync.set({
      state: state
    }, function() {
      abm._Restore(function() {
        if(callback != null) callback();
      });
      // chrome.tabs.query({}, function (tabs) {
      //     var myTabs = [];
      //     for (var i = 0; i < tabs.length; i++) {
      //         if (tabs[i].url.indexOf('http') === 0) {
      //             myTabs.push(tabs[i].id);
      //         }
      //     }
      //     //console.log(myTabs);
      //     for (var i = 0; i < myTabs.length; i++) {
      //         chrome.tabs.reload(myTabs[i]);
      //     }
      // });
      ////if(typeof message !== "undefined") abm.sendMessage(message);

    });
  });
}

abm.sendMessage = function(message, description, callback) {
    var chromeVersion = window.navigator.userAgent.match(/Chrom(?:e|ium)\/([0-9\.]+)/)[1];
    var fixBugVersion = "50.0.0000.00";
    if(functs.versionCompare(chromeVersion, fixBugVersion) > 0) {
        abm._OnMessage({ type: message, description: description });
    } else {
        chrome.extension.sendMessage({ type: message, description: description });
    }
    if(callback != null) callback();
}

abm._OnMessage = function(request, sender, sendResponse) {

    //console.log('chrome.runtime.onMessage.addListener request', request);
    if(!abm.state) return;

    //UserId
    var userId = "";
    functs.getUserId(function(tmpUserId) {
        userId = tmpUserId;
    });

    var description = request.description;
    if(description === undefined) {
        description = "";
    }

    var byPassCode = "loadPostit('"+description+"');";
    var dashUrl = "dashboard.html?userId="+userId;
    if((request.type == "new2" || request.type == "newdashboard") && mousePosition != null) {
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
                    execCode += " var style = " + JSON.stringify(abm.style) + ";";
                    execCode += " var cssclases = " + JSON.stringify(abm.cssclases) + ";";
                    execCode += " var postit = " + JSON.stringify(abm.postit) + "; ";
                    execCode += " initPostits(enabledFeatures, style, cssclases, postit);";
                    if(chrome.runtime.lastError !== undefined) { console.log('Error loading PIA', chrome.runtime.lastError); return; }
                    chrome.tabs.executeScript(tab.id, { code: execCode }, function() {
                        //console.log('Initialized features ob background.js');
                    });
                }
            });
        break;
        case "checkLoaded":
            chrome.tabs.getSelected(null,function(tab) {
                chrome.browserAction.setBadgeText({text: ""});
                //Reload postits
                if(chrome.runtime.lastError !== undefined) { console.log('Error checkLoaded', chrome.runtime.lastError); return; }
                if(tab && functs.checkUrl(tab.url) && tab.url.indexOf('http') === 0) {
                    if(chrome.runtime.lastError !== undefined) { console.log('Error checkLoaded', chrome.runtime.lastError); return; }
                    setTimeout(function() { chrome.tabs.executeScript(tab.id, { code: "checkLoaded();" }) }, 250);
                    backgroundPage._GetNumberOfPostits();
                }
                backgroundPage._SetEnv(tab.windowId);
            });
        break;
        case "new":
        case "new2":
        case "new_circle":
        case "new_tv":
        case "new_talkbubbleright":
        case "new_talkbubbleleft":
        case "new_parallelogram":
        case "new_arrowright":
        case "new_arrowleft":
        case "new_arrowup":
        case "new_arrowdown":
            chrome.tabs.getSelected(null,function(tab) {
                //if(functs.checkUrl(tab.url)) {
                    //if(functs.checkUrl(tab.url) && tab.url.indexOf('http') === 0) {
                    if(functs.getUniqueId(tab.url)) {
                        //Custom clases
                        if (request.type.substring(0, 4) == "new_")
                        {
                            var cssName = request.type.substring(4);
                            byPassCode = "loadPostit('"+description+"', undefined, undefined, '"+cssName+"');"
                        }
                        console.log(request.type.substring(0, 4), request.type.substring(4));
                        //Execute script
                        chrome.tabs.executeScript(tab.id, { code: byPassCode }, function() {
                            if (typeof backgroundPage !== 'undefined') { backgroundPage._GetNumberOfPostits(); }
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
        case "newdashboard":
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
                        if (typeof backgroundPage !== 'undefined') { backgroundPage._GetNumberOfPostits(); }
                    });
                }
            });
        break;
        case "hide":
            chrome.tabs.getSelected(null,function(tab) {
              if(tab.url.indexOf('http') === 0) {
                chrome.tabs.executeScript(tab.id, { code: "if (typeof hidePostits !== 'undefined') { hidePostits(); }" }, function() {
                    if (typeof backgroundPage !== 'undefined') { backgroundPage._GetNumberOfPostits(); }
                    abm._HiddenNotes = true;
                });
              }
            });
        break;
        case "viewhide":
            chrome.tabs.getSelected(null,function(tab) {
              if(tab.url.indexOf('http') === 0) {
                chrome.tabs.executeScript(tab.id, { code: "viewhidePostits();" }, function() {
                    if (typeof backgroundPage !== 'undefined') { backgroundPage._GetNumberOfPostits(); }
                });
              }
            });
        break;

        //Export all notes in page
        case "export":
            chrome.tabs.getSelected(null,function(tab) {
                chrome.tabs.executeScript(tab.id, { code: "exportPostits();" }, function() {
                    console.log('All notes exported!');
                });
            });
        break;

        //Import notes
        case "import":
            chrome.tabs.getSelected(null,function(tab) {
                chrome.tabs.executeScript(tab.id, { code: "importPostits();" }, function() {
                    console.log('All notes imported!');
                });
            });
        break;

        case "show":
            chrome.tabs.getSelected(null,function(tab) {
              if(tab.url.indexOf('http') === 0) {
                chrome.tabs.executeScript(tab.id, { code: "showPostits();" }, function() {
                  let e = chrome.runtime.lastError;
                  if(e === undefined){
                      if (typeof backgroundPage !== 'undefined') { backgroundPage._GetNumberOfPostits(); }
                      abm._HiddenNotes = true;
                  }
                });
              }
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
                    if (typeof backgroundPage !== 'undefined') { backgroundPage._GetNumberOfPostits(); }
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
            // backgroundPage._ReloadAll();
        break;

        case "refresh":
            chrome.tabs.getSelected(null,function(tab) {
                chrome.tabs.executeScript(tab.id, { code: "refreshPostits();" }, function() {
                    console.log('Refresh notes ...');
                    //backgroundPage._GetNumberOfPostits();
                });
            });
        break;
    }
    return true;
}

functs.getUserId = function(callback) {
    var userId = "";
    //UserId
    chrome.storage.sync.get('userId', function(items) {
        userId = items.userId;
        if (!userId) {
            userId = functs.guid();
            chrome.storage.sync.set({userId: userId});
        }
        callback(userId);
    });
}

//Format date
functs.dateToYMD = function(date) {
    var d = date.getDate();
    var m = date.getMonth() + 1;
    var y = date.getFullYear();
    var hh = date.getHours();
    var mm = date.getMinutes();
    var ss = date.getSeconds();
    var retVal = '' + y + '-' + (m<=9 ? '0' + m : m) + '-' + (d <= 9 ? '0' + d : d);
    retVal += ' ' + (hh<=9 ? '0' + hh : hh) + ":" + (mm<=9 ? '0' + mm : mm) + ":" + (ss<=9 ? '0' + ss : ss);
    return retVal;
}

functs.checkUrl = function(url) {
  if (url !== undefined && url.substring(0, 6) != "chrome" && url.indexOf("chrome.google.com/webstore") < 0) {
    return true;
  }
  return false;
}

functs.getUrlParameter = function getUrlParameter(sParam, sPageURL) {
    if(sPageURL.indexOf('?') > 0 && sPageURL.indexOf(sParam) > 0) {
      sPageURL = sPageURL.substring(sPageURL.indexOf('?') + 1);
      sPageURL = decodeURIComponent(sPageURL);
      var sURLVariables = sPageURL.split('&'),
          sParameterName,
          i;
          //console.log(sParam, sPageURL, sURLVariables);
      for (i = 0; i < sURLVariables.length; i++) {
          sParameterName = sURLVariables[i].split('=');
          //console.log('paramName', sParameterName, sParam);
          if (sParameterName[0] === sParam) {
              return sParameterName[1] === undefined ? true : sParameterName[1];
          }
      }
    }
    return undefined;
};

functs.guid = function() {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
  }
  return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
    s4() + '-' + s4() + s4() + s4();
}

//Return unique domain name
functs.getUniqueId = function(url) {
    if(url === undefined)
        return "";
    var domain = url.split('/')[2] || url.split('/')[0];
    domain = domain.replace('www.','');
    var dashboard = (url.split("/").length >= 4 && url.split(":/")[0] == "chrome-extension" && url.split("/")[3] == "dashboard.html");
    var localhost = (domain === "localhost");
    //console.log(domain, dashboard, localhost);
    if(dashboard || localhost || (domain.indexOf('.') > 0 && domain.indexOf(' ') <= 0 && functs.CheckIsValidDomain(domain))) {
        if(dashboard) {
            return "Dashboard";
        }
        return domain;
    }
    return "";
}

//Check for a valid domain
functs.CheckIsValidDomain = function(domain) {
    var re = new RegExp(/^((?:(?:(?:\w[\.\-\+]?)*)\w)+)((?:(?:(?:\w[\.\-\+]?){0,62})\w)+)\.(\w{2,6})$/);
    return domain.match(re);
}

functs.delay = (function(){
  var timer = 0;
  return function(callback, ms){
    clearTimeout (timer);
    timer = setTimeout(callback, ms);
  };
})();

functs.versionCompare = function (v1, v2, options) {
    var lexicographical = options && options.lexicographical,
        zeroExtend = options && options.zeroExtend,
        v1parts = v1.split('.'),
        v2parts = v2.split('.');

    function isValidPart(x) {
        return (lexicographical ? /^\d+[A-Za-z]*$/ : /^\d+$/).test(x);
    }

    if (!v1parts.every(isValidPart) || !v2parts.every(isValidPart)) {
        return NaN;
    }

    if (zeroExtend) {
        while (v1parts.length < v2parts.length) v1parts.push("0");
        while (v2parts.length < v1parts.length) v2parts.push("0");
    }

    if (!lexicographical) {
        v1parts = v1parts.map(Number);
        v2parts = v2parts.map(Number);
    }

    for (var i = 0; i < v1parts.length; ++i) {
        if (v2parts.length == i) {
            return 1;
        }

        if (v1parts[i] == v2parts[i]) {
            continue;
        }
        else if (v1parts[i] > v2parts[i]) {
            return 1;
        }
        else {
            return -1;
        }
    }

    if (v1parts.length != v2parts.length) {
        return -1;
    }

    return 0;
}

abm.setIcon = function(state, changeEnableOption) {
  if(changeEnableOption === undefined) {
    changeEnableOption = false;
  }
  if(state) {
    chrome.browserAction.setIcon({path:chrome.app.getDetails().icons[19]});
    if(changeEnableOption)
      chrome.browserAction.enable();
    //chrome.browserAction.setPopup({popup: "popup.html"});
  } else {
    chrome.browserAction.setIcon({path:chrome.app.getDetails().icons[20]});
    chrome.browserAction.setBadgeText({text: ""});
    if(changeEnableOption)
      chrome.browserAction.disable();
    //chrome.browserAction.setPopup({popup: ""});
  }
}

//Adblock plus : translate function
translate = function(messageID, args) {
  return chrome.i18n.getMessage(messageID, args);
};

//Adblock plus : localizePage function
localizePage = function() {
  //translate a page into the users language
  $("[i18n]:not(.i18n-replaced)").each(function() {
    $(this).html(translate($(this).attr("i18n")));
  });
  $("[i18n_value]:not(.i18n-replaced)").each(function() {
    $(this).val(translate($(this).attr("i18n_value")));
  });
  $("[i18n_title]:not(.i18n-replaced)").each(function() {
    $(this).attr("title", translate($(this).attr("i18n_title")));
  });
  $("[i18n_placeholder]:not(.i18n-replaced)").each(function() {
    $(this).attr("placeholder", translate($(this).attr("i18n_placeholder")));
  });
  $("[i18n_replacement_el]:not(.i18n-replaced)").each(function() {
    // Replace a dummy <a/> inside of localized text with a real element.
    // Give the real element the same text as the dummy link.
    var dummy_link = $("a", this);
    var text = dummy_link.text();
    var real_el = $("#" + $(this).attr("i18n_replacement_el"));
    real_el.text(text).val(text).replaceAll(dummy_link);
    // If localizePage is run again, don't let the [i18n] code above
    // clobber our work
    $(this).addClass("i18n-replaced");
  });
};

Array.prototype.remove = function(from, to) {
  var rest = this.slice((to || from) + 1 || this.length);
  this.length = from < 0 ? this.length + from : from;
  return this.push.apply(this, rest);
};
