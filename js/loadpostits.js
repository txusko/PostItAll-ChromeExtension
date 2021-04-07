//Postit vars
$.fn.postitall.defaults.features.savable = true;

function initPostits(enabledFeatures, style, cssclases, postit) {
	setTimeout(function() {
		if ($.PostItAll) {
			$.PostItAll.changeConfig('global', enabledFeatures);
			$.fn.postitall.defaults.style = style;
			$.fn.postitall.defaults.cssclases = cssclases;
			$.fn.postitall.defaults.height = postit.height;
			$.fn.postitall.defaults.width = postit.width;
			$.fn.postitall.defaults.minHeight = postit.minHeight;
			$.fn.postitall.defaults.minWidth = postit.minWidth;
			$.fn.postitall.defaults.flags.fixed = (postit.position == "fixed") ? true : false;
		}
	}, 500);
}

function checkLoaded() {
	$.PostItAll.length(function(total) {
		if(total > 0 && $('.PIApostit').length <= 0) {
			loadPostits();
		}
	});
}

//Create a postit
function loadPostit(description, posY, posX, customClass) {
	var postit;
	if(description === undefined) {
		description = "";
	}
	if(posX === undefined && posY === undefined) {
		postit = {
			position: 'relative',
			top: '20px',
			right: '20px'
		};
	} else {
		postit = {
			position: 'absolute',
			posX: posX+'px',
			posY: posY+'px',
		};
	}

	var selectedText = window.getSelection().toString();
	if(selectedText != "" && description == "") {
		description = selectedText;
	}
	if(description != "") {
		var maxWidth = $.fn.postitall.defaults.width + 50;
		if(description.length > maxWidth) {
			var coef = parseInt(description.length / maxWidth, 10) + 1;
			postit.width = $.fn.postitall.defaults.width * coef;
			postit.height = $.fn.postitall.defaults.height / coef;
		}
	}

	postit.onCreated = function() {
		lengthPostits();
		getScreenShoot();
	};
	postit.onDelete = function() {
		lengthPostits();
		getScreenShoot();
	};
	postit.onChange = function() {
		getScreenShoot();
	};

	if (customClass !== undefined)
		postit.cssclases = { note: customClass };

	$.PostItAll.new(description, postit);
	$.PostItAll.save();
}
function loadPostitPosition(description, posX, posY) {
	$.PostItAll.new(description, {
		width: 'auto',
		posX: posX,
		posY: posY,
		onCreated: function() {
			lengthPostits();
			getScreenShoot();
		},
		onDelete: function() {
			lengthPostits();
			getScreenShoot();
		},
		onChange: function() {
			getScreenShoot();
		}
    });
	$.PostItAll.save();
}
//Load postits
var loaded = (typeof loaded === 'undefined') ? false : loaded;
function loadPostits(index) {
	setTimeout(function() {
		if ($.PostItAll) {
			$.PostItAll.load(function() {
				//On load done
				lengthPostits();
			}, {
				onCreated : function() {
					//On created
					lengthPostits();
				},
				onChange : function() {
					//On change
					getScreenShoot();
				},
				onDelete : function() {
					//On delete
					lengthPostits();
					getScreenShoot();
				}
			}, index);
			loaded = true;
		}
	}, 500);
}
//hide
function hidePostits() {
  $.PostItAll.hide();
}
function showPostits() {
  if(!loaded) {
		loadPostits();
	}
	$.PostItAll.show();
}
var viewHide = (typeof viewHide === 'undefined') ? false : viewHide;
function viewhidePostits() {
	if(!loaded) {
		loadPostits();
	} else {
		if($('.PIApostit').length <= 0 || viewHide) {
			showPostits();
			viewHide = false;
		} else {
			hidePostits();
			viewHide = true;
		}
	}
}

//Export loaded notes
function exportPostits() {
	$.PostItAll.export("loaded");
}

//Import notes
function importPostits() {
	$.PostItAll.import(true, function() {
		delay(function() {
			lengthPostits();
		}, 1000);
	});
}

//Delete all
function deletePostits() {
	if(confirm('Do you want to remove all notes?\n\n*This action cannot be undone!'))
		$.PostItAll.destroy(false, true, true, getUrl(window.location.href));
}
//Refresh notes
function refreshPostits() {
	//$('.PIApostit').hide();
	//$('.PIApostit').show();
}
//Number of postits
function lengthPostits() {
	var total = 0;
	$.PostItAll.length(function(total) {
		chrome.extension.sendMessage({
		    type: 'badge',
		    description: total
		});
	});
}

function getPostits(domain, page) {
	$.PostItAll.getNotes(function(notes) {
		chrome.extension.sendMessage({
		    type: 'loadnotes',
		    notes: notes
		});
	}); //, undefined, domain, page
}

//Screenshots
var delay = (function(){
  var timer = 0;
  return function(callback, ms){
    clearTimeout (timer);
    timer = setTimeout(callback, ms);
  };
})();
function getScreenShoot() {
	delay(function(){
		chrome.runtime.sendMessage({ type: 'screenshot' });
	},1500);
}

//Return unique domain name
var getUrl = function(url) {
    var ret = url.split('/')[2] || url.split('/')[0];
    ret = ret.replace('www.','');
    if(ret === "localhost" || (ret.indexOf('.') > 0 && ret.indexOf(' ') <= 0 && CheckIsValidDomain(ret))) {
        return ret;
    }
    return "";
}

//Check for a valid domain
var CheckIsValidDomain = function(domain) {
    var re = new RegExp(/^((?:(?:(?:\w[\.\-\+]?)*)\w)+)((?:(?:(?:\w[\.\-\+]?){0,62})\w)+)\.(\w{2,6})$/);
    return domain.match(re);
}
