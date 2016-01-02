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
    height          : 200,          //height
    width           : 160,          //width
    position        : 'absolute',   //absolute or fixed
  },
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
    pasteHtml       : false,         //Allow paste html in contenteditor
    htmlEditor      : false,         //Html editor (trumbowyg)
    autoPosition    : true,         //Automatic reposition of the notes when user resize screen
    hidden          : false,         //Hidden note
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
    chrome.browserAction.setIcon({path:chrome.app.getDetails().icons[256]});
  } else {
    $("[name='state']").bootstrapSwitch();
    chrome.browserAction.setIcon({path:chrome.app.getDetails().icons["256_off"]});
  }
  //Action
  $('#idState').on('switchChange.bootstrapSwitch', function(event, state) {
    //Change icon
    if(state) {
      chrome.browserAction.setIcon({path:chrome.app.getDetails().icons[256]});
    } else {
      chrome.browserAction.setIcon({path:chrome.app.getDetails().icons["256_off"]});
    }
    console.log('Save state');
    //Save
    chrome.storage.sync.set({
      state: state
    }, function() {
      abm._Restore(function() {
        if(callback != null) callback();
      });
      chrome.tabs.query({}, function (tabs) {
          var myTabs = [];
          for (var i = 0; i < tabs.length; i++) {
              if (tabs[i].url.indexOf('http') === 0) {
                  myTabs.push(tabs[i].id);
              }
          }
          //console.log(myTabs);
          for (var i = 0; i < myTabs.length; i++) {
              chrome.tabs.reload(myTabs[i]);
          }
      });
      ////if(typeof message !== "undefined") abm.sendMessage(message);

    });
  });
}

abm.sendMessage = function(message, description, callback) {
  chrome.extension.sendMessage({
    type: message,
    description: description
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

abm.setIcon = function(state, changeEnableOption) {
  if(changeEnableOption === undefined) {
    changeEnableOption = false;
  }
  if(state) {
    chrome.browserAction.setIcon({path:chrome.app.getDetails().icons["256"]});
    if(changeEnableOption)
      chrome.browserAction.enable();
    //chrome.browserAction.setPopup({popup: "popup.html"});
  } else {
    chrome.browserAction.setIcon({path:chrome.app.getDetails().icons["256_off"]});
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
