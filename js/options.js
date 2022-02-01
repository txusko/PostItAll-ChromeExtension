/**
* postiall.txusko.com
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

var console = console;

var optionsPage = {};

//Initialize Page
optionsPage._Init = function() {
    //Default
    $('.option').attr('disabled', 'disabled');
    $('button').click(function(e) {
        e.preventDefault();
    });
    //Restore options
    abm._Restore(function() {
        abm.enabledFeatures.savable = false;
        $.PostItAll.changeConfig('global', abm.enabledFeatures);
        $.fn.postitall.defaults.style = abm.style;
        //state
        abm.initState();
        //Setting TAB
        optionsPage.settingsTab();
        //List TAB
        optionsPage.listTab();
        //About TAB
        optionsPage.aboutTab();
        //Tooltips
        $('[data-toggle="tooltip"]').tooltip();

        //Show
        $('#tabs a[href="' + window.location.hash + '"]').click();
    });
    //Tabs
    $('#tabs a[href="' + window.location.hash + '"]').show('show');
}

optionsPage.settingsTab = function() {
    //Add new demo-postit
    $('#idAddDemoPostit').click(function(e) {
        abm._Restore(function() {
            var content = '';
            var demoContent = "<div style='text-align:center'>This is how your new notes looks like.<br>Feel free to edit or remove, this note will not be stored.</p>";
            if(e.pageY == undefined) {
                e.pageY = $('#idAddDemoPostit').offset().top + 30;
                content = demoContent;
            }
            if(e.pageX == undefined) {
                e.pageX = $('#idAddDemoPostit').offset().left + 10;
                content = demoContent;
            }
            abm.enabledFeatures.savable = false;
            $.PostItAll.changeConfig('global', abm.enabledFeatures);
            $.fn.postitall.defaults.style = abm.style;
            $.fn.postitall.defaults.cssclases = abm.cssclases;
            $.PostItAll.new({
                content: content,
                posY: e.pageY,
                posX: e.pageX,
                features: {
                    savable: false
                }
            });
        });
    });

    //Reload inline notes with new custom style
    var reloadNotes = function() {
        functs.delay(function() {
            if($('.PIApostit').length <= 0) {
                $('#idAddDemoPostit').click();
            } else {
                $('.PIApostit').each(function() {
                    var options = $(this).data('PIA-options');
                    var content = $(this).find('.PIAeditable').html();
                    var xTop = $(this).css('top');
                    var xLeft = $(this).css('left');
                    $(this).postitall('destroy');
                    $.PostItAll.new({
                        content: content,
                        posY: xTop,
                        posX: xLeft,
                        style : {
                            arrow: options.style.arrow
                        },
                        features: {
                            savable: false
                        }
                    });
                });
            }
        },200);
    }

    //Save default enabled features
    var saveFeatures = function(callback) {
        chrome.storage.sync.set({
            "enabledFeatures": abm.enabledFeatures
        }, function() {
            abm._Restore(function() {
                abm.enabledFeatures.savable = false;
                $.PostItAll.changeConfig('global', abm.enabledFeatures);
                //Delete and show again
                reloadNotes();
                if(callback != null) callback();
            });
        });
    };

    //Save default style
    var saveStyle = function(callback) {
        chrome.storage.sync.set({
            "style": abm.style
        }, function() {
            abm._Restore(function() {
                $.fn.postitall.defaults.style = abm.style;
                //Delete and show again
                reloadNotes();
                if(callback != null) callback();
            });
        });
    }

    //Save defult note dimensions
    var saveDimensions = function(callback) {
        chrome.storage.sync.set({
            "postit": abm.postit
        }, function() {
            abm._Restore(function() {
                $.fn.postitall.defaults.height = abm.postit.height;
                $.fn.postitall.defaults.minHeight = abm.postit.minHeight;
                $.fn.postitall.defaults.width = abm.postit.width;
                $.fn.postitall.defaults.minWidth = abm.postit.minWidth;
                $.fn.postitall.defaults.position = abm.postit.position;
                //Delete and show again
                reloadNotes();
                if(callback != null) callback();
            });
        });
    };

    //Autoload notes
    optionsPage.switchCheckBox("idAutoloadEnabled", "autoloadEnabled", abm.autoloadEnabled, function(state) {
        if(!state) {
            $("[name='trayIconMenu']").bootstrapSwitch('state', true, true);
            $("[name='trayIconMenu']").bootstrapSwitch('disabled', true, true);
        } else {
            $("[name='trayIconMenu']").bootstrapSwitch('disabled', false, false);
        }
        chrome.storage.sync.set({
            autoloadEnabled: state
        }, function() {
            abm._Restore();
        });
    });

    //Filter type
    if(abm.enabledFeatures.filter != "") {
        $("input[name=tipoFiltro][value=" + abm.enabledFeatures.filter + "]").attr('checked', 'checked');
    }
    $("input:radio[name=tipoFiltro]").click(function() {
        $.fn.postitall.globals.filter
        abm.enabledFeatures.filter = this.value;
        saveFeatures();
    });

    //Tray icon behaviou
    optionsPage.switchCheckBox("idTrayIconMenu", "trayIconMenu", abm.trayIconMenu, function(state) {
        chrome.storage.sync.set({
            trayIconMenu: state
        }, function() {
            abm._Restore();
        });
    });

    //Postit background-color
    $('#idBgTextColor').attr('value', abm.style.backgroundcolor).minicolors({
        change: function(hex) {
            abm.style.backgroundcolor = hex;
            saveStyle();
        }
    });
    //Postit GeneralStyle (3d)
    if(abm.style.tresd)
        $('#idGeneralStyle').attr('checked', 'checked');
    $('#idGeneralStyle').click(function () {
        if ($(this).is(':checked')) {
            abm.style.tresd = true;
        } else {
            abm.style.tresd = false;
        }
        saveStyle();
    });
    //Postit Text shadow
    if(abm.style.textshadow)
        $('#idTextShadow').attr('checked', 'checked');
    $('#idTextShadow').click(function () {
        if ($(this).is(':checked')) {
            abm.style.textshadow = true;
        } else {
            abm.style.textshadow = false;
        }
        saveStyle();
    });
    //Postit text-color
    $('#idTextColor').attr('value', abm.style.textcolor).minicolors({
        change: function(hex) {
            abm.style.textcolor = hex;
            saveStyle();
        }
    });

    //Postit: note size
    $('#idNoteSize').change(function() {
        var noteSize = $(this).val();
        $('#idOptCusW').hide();
        $('#idOptCusH').hide();
        switch(noteSize) {
            case 'smallest':
                abm.postit.width = 136;
                abm.postit.height = 136;
            break;
            case 'small':
                abm.postit.width = 160;
                abm.postit.height = 200;
            break;
            case 'small_square':
                abm.postit.width = 200;
                abm.postit.height = 200;
            break;
            case 'medium':
                abm.postit.width = 208;
                abm.postit.height = 260;
            break;
            case 'medium_square':
                abm.postit.width = 260;
                abm.postit.height = 260;
            break;
            case 'large':
                abm.postit.width = 256;
                abm.postit.height = 320;
            break;
            case 'large_square':
                abm.postit.width = 320;
                abm.postit.height = 320;
            break;
            case 'big':
                abm.postit.width = 320;
                abm.postit.height = 400;
            break;
            case 'big_square':
                abm.postit.width = 400;
                abm.postit.height = 400;
            break;
            case 'custom':
                $('#idOptCusW').show();
                $('#idNoteWidth').val(abm.postit.width);
                $('#idOptCusH').show();
                $('#idNoteHeight').val(abm.postit.height);
            break;
        }
        saveDimensions(function() {
            console.log('Saved abm.postit.width & height',abm.postit);
        });
    });
    if(abm.postit.width == 136 && abm.postit.height == 136) {
        $('#idNoteSize').val("smallest");
    } else if(abm.postit.width == 160 && abm.postit.height == 200) {
        $('#idNoteSize').val("small");
    } else if(abm.postit.width == 200 && abm.postit.height == 200) {
        $('#idNoteSize').val("small_square");
    } else if(abm.postit.width == 208 && abm.postit.height == 260) {
        $('#idNoteSize').val("medium");
    } else if(abm.postit.width == 260 && abm.postit.height == 260) {
        $('#idNoteSize').val("medium_square");
    } else if(abm.postit.width == 256 && abm.postit.height == 320) {
        $('#idNoteSize').val("large");
    } else if(abm.postit.width == 320 && abm.postit.height == 320) {
        $('#idNoteSize').val("large_square");
    } else if(abm.postit.width == 320 && abm.postit.height == 400) {
        $('#idNoteSize').val("big");
    } else if(abm.postit.width == 400 && abm.postit.height == 400) {
        $('#idNoteSize').val("big_square");
    } else {
        $('#idNoteSize').val("custom");
    }
    $('#idNoteSize').change();

    $('#idNoteWidth').change(function() {
        var newVal = parseInt($(this).val(), 10);
        if(isNaN(newVal) || newVal < abm.postit.minWidth) {
            newVal = abm.postit.minWidth;
        } else if(isNaN(newVal) || newVal > 640) {
            newVal = 640;
        }
        $(this).val(newVal);
        abm.postit.width = newVal;
        saveDimensions(function() {
            console.log('Saved abm.postit.height',abm.postit.width);
        });
    });
    $('#idNoteHeight').change(function() {
        var newVal = parseInt($(this).val(), 10);
        if(isNaN(newVal) || newVal < abm.postit.minHeight) {
            newVal = abm.postit.minHeight;
        } else if(isNaN(newVal) || newVal > 640) {
            newVal = 640;
        }
        $(this).val(newVal);
        abm.postit.height = newVal;
        saveDimensions(function() {
            console.log('Saved abm.postit.height',abm.postit.height);
        });
    });

    //Fixed position
    optionsPage.switchCheckBox("idFixedPosition", "fixedPosition", (abm.postit.position == "fixed"), function(state) {
        abm.postit.position = state ? "fixed" : "absolute";
        saveDimensions(function() {
            console.log('Saved abm.postit.position',abm.postit.position);
        });
    });


    //Postit : random color
    if(abm.enabledFeatures.randomColor) {
        $('#idOptBgCol').hide();
        $('#idOptTxCol').hide();
    }
    optionsPage.switchCheckBox("idRandomColor", "randomColor", abm.enabledFeatures.randomColor, function(state) {
        abm.enabledFeatures.randomColor = state;
        saveFeatures(function() {
            if(abm.enabledFeatures.randomColor) {
                $('#idOptBgCol').hide();
                $('#idOptTxCol').hide();
            } else {
                $('#idOptBgCol').show();
                $('#idOptTxCol').show();
            }
        });
    });

    /** FEATURES **/

    $('#idCheckAll').click(function() {
        $('.feature').bootstrapSwitch('state', this.checked, this.checked);
        if(this.checked)
            $('#idPosArrow').val('back');
        else
            $('#idPosArrow').val('none');
    });

    //Allow paste html
    optionsPage.switchCheckBox("idPasteHtml", "pasteHtml", abm.enabledFeatures.pasteHtml, function(state) {
        abm.enabledFeatures.pasteHtml = state;
        saveFeatures();
    });
    //Show info icon
    optionsPage.switchCheckBox("idShowInfo", "showInfo", abm.enabledFeatures.showInfo, function(state) {
        abm.enabledFeatures.showInfo = state;
        saveFeatures();
    });
    //Show meta-data icon
    optionsPage.switchCheckBox("idShowMeta", "showMeta", abm.enabledFeatures.showMeta, function(state) {
        abm.enabledFeatures.showMeta = state;
        saveFeatures();
    });
    //Show meta-data icon
    optionsPage.switchCheckBox("idExportNote", "exportNote", abm.enabledFeatures.exportNote, function(state) {
        abm.enabledFeatures.exportNote = state;
        saveFeatures();
    });
    //Ask on delete?
    optionsPage.switchCheckBox("idAskOnDelete", "askOnDelete", abm.enabledFeatures.askOnDelete, function(state) {
        abm.enabledFeatures.askOnDelete = state;
        saveFeatures();
    });
    //Change options
    optionsPage.switchCheckBox("idChangeOptions", "changeOptions", abm.enabledFeatures.changeoptions, function(state) {
        abm.enabledFeatures.changeoptions = state;
        saveFeatures();
    });
    //Allow block
    optionsPage.switchCheckBox("idAllowBlock", "allowBlock", abm.enabledFeatures.blocked, function(state) {
        abm.enabledFeatures.blocked = state;
        saveFeatures();
    });
    //Expand
    optionsPage.switchCheckBox("idAllowExpand", "allowExpand", abm.enabledFeatures.expand, function(state) {
        abm.enabledFeatures.expand = state;
        saveFeatures();
    });
    //Minimize
    optionsPage.switchCheckBox("idAllowMinimize", "allowMinimize", abm.enabledFeatures.minimized, function(state) {
        abm.enabledFeatures.minimized = state;
        saveFeatures();
    });
    //Allow fix
    optionsPage.switchCheckBox("idAllowFix", "allowFix", abm.enabledFeatures.fixed, function(state) {
        abm.enabledFeatures.fixed = state;
        saveFeatures();
    });
    //Autohide toolbar
    optionsPage.switchCheckBox("idHideToolbar", "hideToolbar", abm.enabledFeatures.autoHideToolBar, function(state) {
        abm.enabledFeatures.autoHideToolBar = state;
        saveFeatures();
    });
    //Add copy note
    optionsPage.switchCheckBox("idAddNew", "addNew", abm.enabledFeatures.addNew, function(state) {
        abm.enabledFeatures.addNew = state;
        saveFeatures();
    });
    //Hidden
    optionsPage.switchCheckBox("idHidden", "addHidden", abm.enabledFeatures.hidden, function(state) {
        abm.enabledFeatures.hidden = state;
        saveFeatures();
    });
    //htmlEditor
    optionsPage.switchCheckBox("idHtmlEditor", "htmlEditor", abm.enabledFeatures.htmlEditor, function(state) {
        abm.enabledFeatures.htmlEditor = state;
        saveFeatures();
    });
    //Autopositio
    optionsPage.switchCheckBox("idAutoPosition", "autoPosition", abm.enabledFeatures.autoPosition, function(state) {
        abm.enabledFeatures.autoPosition = state;
        saveFeatures();
    });
    //Resizable
    optionsPage.switchCheckBox("idResizable", "resizable", abm.enabledFeatures.resizable, function(state) {
        abm.enabledFeatures.resizable = state;
        saveFeatures();
    });
    /** END FEATURES **/

    //Add arrow
    if(abm.enabledFeatures.addArrow != 'none') {
        $('.arrowOptions').show();
    }
    optionsPage.switchCheckBox("idAddArrow", "addArrow", (abm.enabledFeatures.addArrow != 'none'), function(state) {
        if(!state) {
            $('.arrowOptions').hide();
            abm.enabledFeatures.addArrow = 'none';
        } else {
            $('.arrowOptions').show();
            abm.enabledFeatures.addArrow = $('#idPosArrow').val();
        }
        saveFeatures(function() {
            console.log('Saved abm.enabledFeatures.addArrow',abm.enabledFeatures.addArrow);
        });
    });
    $('#idPosArrow').change(function() {
        abm.enabledFeatures.addArrow = $(this).val();
        saveFeatures(function() {
            console.log('Saved abm.enabledFeatures.addArrow',abm.enabledFeatures.addArrow);
        });
    });

    //Font-family
    if(abm.style.fontfamily)
        $('#idFontFamily').val(abm.style.fontfamily);
    $('#idFontFamily').change(function() {
        abm.style.fontfamily = $(this).val();
        saveStyle(function() {
            console.log('Saved abm.style.fontfamily',abm.style.fontfamily);
        });
    });
    //Font-size
    if(abm.style.fontsize)
        $('#idFontSize').val(abm.style.fontsize);
    $('#idFontSize').change(function() {
        abm.style.fontsize = $(this).val();
        saveStyle(function() {
            console.log('Saved abm.style.fontsize',abm.style.fontsize);
        });
    });

    //Note class
    if(abm.cssclases.note)
        $('#idCustomStyle').val(abm.cssclases.note);
    $('#idCustomStyle').change(function() {
        abm.cssclases.note = $(this).val();

        chrome.storage.sync.set({
            "cssclases": abm.cssclases
        }, function() {
            abm._Restore(function() {
                $.fn.postitall.defaults.cssclases = abm.cssclases;
                //Delete and show again
                reloadNotes();
            });
        });
    });
}

optionsPage.listTab = function() {

    //Note list
    var loadNoteList = function() {
        $('#idNoteList').html("");
        chrome.storage.sync.get(null, function(retVal) {

            var loadTable = false;

            //Total
            var total = Object.keys(retVal).length;

            var orderList = function(llista) {
                llista.sort(function(a, b) {
                    if(a.domain > b.domain) {
                        return a.domain;
                    } else {
                        return b.domain;
                    }
                })
                return llista;
            };

            //Screenshots
            var screenshots = JSON.parse(localStorage.getItem("screenshots"));
            if(screenshots !== null) {
                screenshots.sort(function(a, b) {
                    return (a.domain > b.domain);
                });
            } else {
                screenshots = [];
            }

            //Group by domain
            var varname = "";
            var note = "";
            for(var i = 0; i <= total; i++) {
                if(retVal["listTypeList"] !== undefined) {
                    loadTable = retVal["listTypeList"];
                    if(loadTable) {
                        $('#idListTypeScreenShots').removeClass("active");
                        $('#idListTypeList').addClass("active");
                    } else {
                        $('#idListTypeScreenShots').addClass("active");
                        $('#idListTypeList').removeClass("active");
                    }
                }
                varname = "PostIt_" + i
                if(retVal[varname] !== undefined) {
                    note = JSON.parse(retVal[varname]);
                } else {
                    note = "";
                }
                if(note != "") {
                    var finded = false;
                    if(screenshots != null) {
                        for(var j = 0; j < screenshots.length; j++) {
                            if(screenshots[j].domain == functs.getUniqueId(note.domain + note.page)) {
                                finded = true;
                                screenshots[j].notes.push(note);
                                break;
                            }
                        }
                    } else {
                        screenshots = [];
                    }
                    if(!finded) {
                        var defaultImg = "data:image/jpeg;base64,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";
                        var notes = [];
                        notes.push(note);
                        var page = { url: note.domain+note.page, domain: functs.getUniqueId(note.domain + note.page), img: defaultImg, notes: notes };
                        screenshots.push(page);
                    }
                }
            }

            var addHighLightNote = function(index, url, params) {
                return url + (url.indexOf('?') < 0 ? '?' : '&') + "highlightNote=" + index
                    + ((params !== undefined && params !== "") ? "&" + params : "");
            }

            var deleteScreenshot = [];
            //Screenshots
            var divContent = "";
            //Table
            var divContentTable = '';
            divContentTable += '<table class="table table-striped table-bordered table-hover">';
            divContentTable += '<tr><th>Created on</th><th>Domain</th><th>Page</th><th>Content</th></tr>';

            if(screenshots != null && screenshots.length > 0) {
                var paso = 0, divBef = "", difAf = "";
                var divDashboard = "";
                var img = "";

                screenshots = screenshots.sort();

                for(var i = 0; i < screenshots.length; i++) {
                    var notesLength = screenshots[i].notes.length;
                    if(notesLength > 0) {
                        if(divContent == "") {
                            divContent += "<div class='row'>";
                            //divContent += divDashboard;
                            //paso++;
                        }
                        var notes = "<a href='#' class='link_list pull-right'><span class='badge'>View "+notesLength+" note/s</span></a>";
                        notes += "<ol style='display:none; height:100%; width:100%;padding:0px;margin:0px;'>";
                        for(var j = 0; j < notesLength; j++) {
                            var note = screenshots[i].notes[j];
                            var txtContent = note.content;
                            var tmpObj = $('<div />');
                            tmpObj.append(txtContent);
                            txtContent = tmpObj.text();
                            if(txtContent.length == 0)
                                txtContent = "Blank note";
                            if(txtContent.length > 43)
                                txtContent = txtContent.substring(0,40) + "...";
                            var d = new Date(note.created);
                            //Screenshots
                            notes += "<li><a href='"+addHighLightNote(note.id, note.domain+note.page, note.pageParams)+"' target=_blank>" + txtContent + "</a><ul><li>Page: "+note.page+"</li><li>Created on: " + d.toLocaleDateString() + " (" + d.toLocaleTimeString() + ")</li></ul></li>";
                            //Table
                            divContentTable += "<tr>";
                            divContentTable += "<td>"+d.toLocaleDateString()+" (" + d.toLocaleTimeString() + ")</td>";
                            divContentTable += "<td><a href='"+note.domain+"' target=_blank>"+screenshots[i].domain+"</a></td>";
                            divContentTable += "<td><a href='"+note.domain+note.page+"' target=_blank>"+note.page+"</td>";
                            divContentTable += "<td><a href='"+addHighLightNote(note.id, note.domain+note.page, note.pageParams)+"' target=_blank>" + txtContent + "</a></td>";
                            divContentTable += "</tr>";
                        }
                        notes += "</ol>";
                        var domainUrl = screenshots[i].url.substring(0, screenshots[i].url.indexOf("//") + 2) + screenshots[i].domain;
                        if(screenshots[i].domain == "Dashboard") {
                            //domainUrl = screenshots[i].url.substring(0, screenshots[i].url.indexOf("?"));
                            domainUrl = screenshots[i].url.substring(0, screenshots[i].url.indexOf("//") + 2) + chrome.runtime.id + "/dashboard.html";
                        }
                        if(paso % 4 == 0) {
                            divContent += "</div><div class='row'>";
                        }
                        divContent += "<div class='col-md-3'><div class='thumbnail'>";
                        var domainName = screenshots[i].domain;
                        if(domainName.length > 23) domainName = domainName.substring(0,20) + "...";
                        divContent += "<h3 class='pull-left' style='margin:0px; padding-bottom: 4px;'><a href='"+domainUrl+"' target=_blank>"+domainName+"</a></h3>"
                        divContent += "<div class='pull-right' style='margin:0px; padding-top: 6px;'>";
                        divContent += "&nbsp;<a class='screenshot' href='"+screenshots[i].img+"' data-toggle='tooltip' data-placement='bottom' title='View screenshot' data-lightbox='image"+i+"' data-title=\"<a href='"+domainUrl+"' target=_blank>"+domainUrl+" <span class='glyphicon glyphicon-new-window'></span></a>\"><span class='glyphicon glyphicon-zoom-in'></span></a>";
                        divContent += "&nbsp;<a href='"+domainUrl+"' data-toggle='tooltip' data-placement='bottom' title='Open domain in new tab' target=_blank><span class='glyphicon glyphicon-new-window'></span></a>"
                        //divContent += "&nbsp;<a href='#' data-toggle='tooltip' data-placement='bottom' title='Share screenshoot' class='link_share' data-domain='"+domainUrl+"'><span class='glyphicon glyphicon-share'></a>";
                        divContent += "&nbsp;<a href='#' data-toggle='tooltip' data-placement='bottom' title='Delete all notes in this domain' class='link_delete' data-domain='"+domainUrl+"'><span class='glyphicon glyphicon-trash'></a>";
                        divContent += "</div>";

                        divContent += "<a href='#' class='link_list2'><img src='"+screenshots[i].img+"' class='img-responsive' /></a>";

                        divContent += "<div class='caption' style='overflow:auto;'>"+notes+"<br></div>";
                        divContent += "</div></div>";
                        paso++;
                    } else {
                        if(screenshots[i].domain !== "postitall.txusko.com")
                            deleteScreenshot.push(screenshots[i].domain);
                    }
                }
                //screenshoot
                divContent += "</div>";
                //Table
                divContentTable += '</table>';

                //Add content
                if(loadTable != undefined && loadTable)
                    $('#idNoteList').html(divContentTable);
                else
                    $('#idNoteList').html(divContent);

                //Show/Hide note list
                $('.link_list').click(function(e) {
                    var tmpTxt = $(this).html();
                    if(tmpTxt.indexOf("View") >= 0) {
                        $(this).html(tmpTxt.replace('View', 'Hide'));
                        $(this).parent().css('height', '150px');
                    } else {
                        $(this).html(tmpTxt.replace('Hide', 'View'));
                        $(this).parent().css('height', 'auto');
                    }
                    $(this).parent().find('ol').toggle();
                    e.preventDefault();
                });
                $('.link_list2').click(function(e) {
                    $(this).next().find('.link_list').click();
                    e.preventDefault();
                });
                //Delete domain notes
                $('.link_delete').click(function() {
                    if(confirm(translate('delete_domainquestion'))) {
                        $.PostItAll.remove(false, true, $(this).attr('data-domain'));
                        setTimeout(function() { loadNoteList(); }, 500);
                    }
                });
                $('.screenshot').click(function() {
                    $.PostItAll.hide();
                });

                //Tooltips
                $('[data-toggle="tooltip"]').tooltip();
            }

            //Delete screenshots
            if(deleteScreenshot.length > 0) {
                var screenshots = JSON.parse(localStorage.getItem("screenshots"));
                if(screenshots != null) {
                    for(var i = 0; i < deleteScreenshot.length; i++) {
                        for(var j = 0; j < screenshots.length; j++) {
                            if(screenshots[j].domain == deleteScreenshot[i]) {
                                screenshots.remove(j);
                                break;
                            }
                        }
                    }
                    var testPrefs = JSON.stringify(screenshots);
                    localStorage.setItem("screenshots", testPrefs);
                }
            }


            if($('#idNoteList').html() == "") {
                $('#idNoteList').html("<p class='text-primary'>You don't have any annotation yet!</p>");
            }
        });
    };

    $('#idTab3').click(function(e) {
        loadNoteList();
        e.preventDefault();
    });

    $('#idListTypeScreenShots').click(function(e) {
        chrome.storage.sync.set({
            "listTypeList": false
        }, function() {
            loadNoteList();
        });
    });

    $('#idListTypeList').click(function(e) {
        chrome.storage.sync.set({
            "listTypeList": true
        }, function() {
            loadNoteList();
        });
    });

    $('#idDeleteNotes').click(function() {
        if(confirm(translate('delete_notesquestion'))) {
            $.PostItAll.clearStorage();
            setTimeout(function() { loadNoteList(); }, 500);
        }
    });

    $('#idExportNotes').click(function() {
        $.PostItAll.export("all");
    });
    $('#idImportNotes').click(function() {
        $.PostItAll.import(false, function(obj) {
            functs.delay(function() { location.href = location.pathname + "#tabs-3"; location.reload(); }, 500);
        });
    });
}

optionsPage.aboutTab = function() {
    //About : version
    $('#idVersion').text(chrome.app.getDetails().version);

    //DELETE ALL
    $('#idDeleteAll').click(optionsPage._DeleteAll); //Delete all data & configuration
}

optionsPage.switchCheckBox = function(item, varname, varvalue, callback) {
    $("#" + item).val('1');
    $("#" + item).attr("data-on-text", translate($("#" + item).attr("data-on-text")));
    $("#" + item).attr("data-off-text", translate($("#" + item).attr("data-off-text")));
    if(varvalue) {
        $("[name='"+varname+"']").bootstrapSwitch('state', true, true);
    } else {
        $("[name='"+varname+"']").bootstrapSwitch();
    }
    $("#" + item).on('switchChange.bootstrapSwitch', function(event, state) {
        callback(state);
    });
}

//Show status massage in page
optionsPage._ShowStatusMessage = function(message) {
    $('#status-msg').text(message);
    $('#status').slideDown(function() {
        setTimeout(function() {
            $('#status').slideUp('slow');
        }, 1500);
    });
}

//Save configuration
optionsPage._Save = function() {

    //Save data
    /*chrome.storage.sync.set({
        bookmarkFolderName: $('#idExtensionFolder').val() ? $('#idExtensionFolder').val() : defaults.bookmarkFolderName,
        domains: tempDom,
        options: tempOpt,
        extensions: tempExt,
        notificationsEnabled: $('input[name="notificationsEnabled"]:checked').val() !== "1" ? false : true,
        dateEnabled: $('input[name="dateEnabled"]:checked').val() !== "1" ? false : true
    }, function() {
        optionsPage._ShowStatusMessage('Options saved');
        //RESTORE DATA
        $('#idCleanHistory').click();
        abm._Restore();
    });*/

    optionsPage._ShowStatusMessage('TODO : save settings');

}

//Delete all
optionsPage._DeleteAll = function() {
    if(confirm(translate('delete_allquestion'))) {
        //Save
        chrome.storage.sync.set(defaults, function() {
            abm = defaults;
            //Reload page
            location.reload();
        });
    }
}

//Add event listener
document.addEventListener('DOMContentLoaded', optionsPage._Init);
//Get messages
chrome.extension.onMessage.addListener(function(request, sender, sendResponse) {
    switch(request.type) {
        case "reload":
            location.reload();
        break;
    }
    return true;
});
