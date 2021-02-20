'use strict';
//when mouse up, send message to background.js with this position
document.addEventListener('mousedown', function (mousePos) {
  if(mousePos.button == 2) {
    var p = {posY: mousePos.pageX, posX: mousePos.pageY};
    var msg = {type: 'mouseup', point: p};
    chrome.runtime.sendMessage(msg, function(response) {
      var lastError = chrome.runtime.lastError;
      if (lastError) {
        // 'Could not establish connection. Receiving end does not exist.'
        // console.log(lastError.message);
        return;
      }
    });
	}
}, true);
