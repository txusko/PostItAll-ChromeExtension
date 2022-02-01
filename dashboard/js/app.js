$(document).ready(function() {
    $('#idNew').click(function(e) {
        if($(this).hasClass('disabled')) return;
        loadPostit('', e.pageY + 20, e.pageX)
        e.preventDefault();
    });
    $('#idHide').click(function(e) {
        if($(this).hasClass('disabled')) return;
        $.PostItAll.hide();
        e.preventDefault();
    });
    $('#idShow').click(function(e) {
        if($(this).hasClass('disabled')) return;
        $.PostItAll.show();
        e.preventDefault();
    });
    $('#idDelete').click(function(e) {
        if($(this).hasClass('disabled')) return;
        if(confirm(translate('delete_domainquestion'))) {
            $.PostItAll.remove(true, true, chrome.runtime.id);
        }
        e.preventDefault();
    });

    var desc = functs.getUrlParameter('desc', window.top.location.href);
    var posX = functs.getUrlParameter('posX', window.top.location.href);
    var posY = functs.getUrlParameter('posY', window.top.location.href);
    var highlight = functs.getUrlParameter('highlightNote', window.top.location.href);
    //Restore
    abm._Restore(function() {
        abm.enabledFeatures.savable = true;
        initPostits(abm.enabledFeatures, abm.style, abm.cssclases, abm.postit);
        if(highlight)
            loadPostits(highlight)
        else
            checkLoaded();
        $('#idPage').show();
    });

    setTimeout(function() {
        if(desc !== undefined) {
            loadPostit(desc, posX, posY);
            window.history.replaceState({"html":$('html').html(),"pageTitle":document.title},"", window.top.location.origin + window.top.location.pathname);
        }
    }, 500);
});
