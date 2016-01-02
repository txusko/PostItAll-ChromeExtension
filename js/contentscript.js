'use strict';
//when mouse up, send message to background.js with this position
document.addEventListener('mousedown', function (mousePos) {
	if(mousePos.button == 2) {
		//console.log('mousePos', mousePos);
	    var p = {posY: mousePos.pageX, posX: mousePos.pageY};
	    var msg = {type: 'mouseup', point: p};
	    chrome.runtime.sendMessage(msg, function(response) {});
	}
}, true);