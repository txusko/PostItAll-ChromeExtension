'use strict';
//when mouse up, send message to background.js with this position
if(typeof chrome.runtime !== 'undefined') {
  document.addEventListener('mousedown', function (mousePos) {
  	if(mousePos.button == 2) {
	    var p = {posY: mousePos.pageX, posX: mousePos.pageY};
	    var msg = {type: 'mouseup', point: p};
	    chrome.runtime.sendMessage(msg, function(response) {
        var lastError = chrome.runtime.lastError;
        if (lastError) {
          console.log(lastError.message);
          // 'Could not establish connection. Receiving end does not exist.'
          return;
        }
      });

      // var enabledFeatures = JSON.stringify(abm.enabledFeatures);
      // var style = JSON.stringify(abm.style);
      // var cssclases = JSON.stringify(abm.cssclases);
      // var postit = JSON.stringify(abm.postit);
      debugger;
      // initPostits(enabledFeatures, style, cssclases, postit);
      // loadPostits();
  	}
  }, true);
}

// this is for sites which change location using History API
//like youtube and React Router based sites
var prevSearch = window.location.search;
var prevPathname = window.location.pathname;

window.setInterval(function() {
    if (prevSearch != window.location.search || prevPathname != window.location.pathname) {
      console.log('Extension loaded when location using History API changes!');
      $('.PIApostit').remove();
      loadPostits();
    }
    prevSearch = window.location.search;
    prevPathname = window.location.pathname;
}, 500);
