/*
 * Copyright (C) 2015 OpenSeadragon contributors
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 * - Redistributions of source code must retain the above copyright notice,
 *   this list of conditions and the following disclaimer.
 *
 * - Redistributions in binary form must reproduce the above copyright notice,
 *   this list of conditions and the following disclaimer in the documentation
 *   and/or other materials provided with the distribution.
 *
 * - Neither the name of OpenSeadragon nor the names of its contributors
 *   may be used to endorse or promote products derived from this software
 *   without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
 * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
 * ARE DISCLAIMED.  IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE
 * LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
 * CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
 * SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
 * INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
 * CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
 * ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
 * POSSIBILITY OF SUCH DAMAGE.
 */
/*
 * Customized OpenSeadragonizer for sequentially numbered images with hentaigana
 * 
 * Copyright (C) 2016, 2SC1815J
 * https://twitter.com/2SC1815J
 * Released under the New BSD license.
 * https://github.com/2SC1815J/openseadragonizer_mod_hentaigana
 */
(function () {
    var loaderElt = document.getElementById("loader");
    var popupElt = document.getElementById("popup");
    var urlElt = document.getElementById("url");
    var pagesElt = document.getElementById("pages");
    var popup2Elt = document.getElementById("popup2");
    var imgurlElt = document.getElementById("img_url");
    
    urlElt.onkeyup = function (event) {
        if (event && event.keyCode === 13) {
            location.href = '?img=' + urlElt.value + '&pages=' + pagesElt.value;
        }
    };

    pagesElt.onkeyup = function (event) {
        if (event && event.keyCode === 13 && urlElt.value !== "") {
            location.href = '?img=' + urlElt.value + '&pages=' + pagesElt.value;
        }
    };

    document.getElementById("show-button").onclick = function () {
        location.href = '?img=' + urlElt.value + '&pages=' + pagesElt.value;
    };

    document.getElementById("ok-button").onclick = function () {
        popup2Elt.style.display = "none";
    };

    window.OpenSeadragonizer = {
        open: function (url) {
            popupElt.style.display = "none";

            if (!url) {
                var imgUrlParameter = OpenSeadragon.getUrlParameter("img");
                if (!imgUrlParameter) {
                    popupElt.style.display = "block";
                    return;
                }
                url = OpenSeadragon.getUrlParameter("encoded") ?
                    decodeURIComponent(imgUrlParameter) : imgUrlParameter;
            }

            var xmlJsonSrcMode = (url.search(/\.(xml|json|dzi)$/) !== -1);
            var options = {
                src: url,
                container: document.getElementById("loader"),
                crossOrigin: 'Anonymous',
                xmlJsonSrcMode: xmlJsonSrcMode
            };
            loadImage(options, onImageLoaded, function (event) {
                loaderElt.removeChild(event.image);
                // We retry without CORS
                delete options.crossOrigin;
                loadImage(options, onImageLoaded, onError);
            });
            document.title = "OpenSeadragon " + url;
        }
    };

    function loadImage(options, successCallback, errorCallback) {
        if (options.xmlJsonSrcMode) {
            var obj = {};
            obj.src = options.src;
            successCallback({
                image: obj,
                options: options
            });
        } else {
            var image = new Image();
            options.container.appendChild(image);
            image.onload = function () {
                successCallback({
                    image: image,
                    options: options
                });
            };
            image.onerror = function () {
                errorCallback({
                    image: image,
                    options: options
                });
            };
            if (options.crossOrigin) {
                image.crossOrigin = options.crossOrigin;
            }
            image.src = options.src;
        }
    }

    function onImageLoaded(event) {
        var image = event.image;
        var xmlJsonSrcMode = event.options.xmlJsonSrcMode || false;
        var docTitle = "OpenSeadragon " + image.src;
        if (!xmlJsonSrcMode) {
            docTitle += " (" + image.naturalWidth + "x" + image.naturalHeight + ")";
        }
        document.title = docTitle;
        var tileSources = [];
        if (xmlJsonSrcMode) {
            tileSources = [ image.src ];
        } else {
            tileSources = [{
                type: 'image',
                url: image.src,
                crossOriginPolicy: event.options.crossOrigin
            }];
        }
        var lastPage = 1;
        var a = document.createElement('a');
        a.href = image.src;
        var imagePath = a.pathname;
        if (imagePath.indexOf("/") !== 0) {
            imagePath = "/" + imagePath;
        }
        var elems = /(\S+?)(\d+)\.(\S+)/.exec(imagePath); //fix if needed
        if (elems && elems.length === 4) {
            lastPage = parseInt(OpenSeadragon.getUrlParameter("pages"), 10);
            if (isNaN(lastPage)) {
                lastPage = 1;
            }
            var digits = elems[2];
            var startPage = Number(digits);
            var pad = Array(digits.length + 1).join("0");
            var i, srcUrl;
            for (i = startPage + 1; i <= lastPage; i++) {
                srcUrl = a.protocol + "//" + a.host + elems[1] + (pad + String(i)).slice(-digits.length) + "." + elems[3];
                if (xmlJsonSrcMode) {
                    tileSources.push( srcUrl );
                } else {
                    tileSources.push({
                        type: 'image',
                        url: srcUrl,
                        crossOriginPolicy: event.options.crossOrigin
                    });
                }
            }
            for (i = 1; i < startPage; i++) {
                srcUrl = a.protocol + "//" + a.host + elems[1] + (pad + String(i)).slice(-digits.length) + "." + elems[3];
                if (xmlJsonSrcMode) {
                    tileSources.push( srcUrl );
                } else {
                    tileSources.push({
                        type: 'image',
                        url: srcUrl,
                        crossOriginPolicy: event.options.crossOrigin
                    });
                }
            }
        }
        var hasHistoryReplaceState = function() {
            return history.replaceState && history.state !== undefined; //IE < 10 are not supported
            //also OpenSeadragonSelection is not working properly in IE < 10 by another reason
        };
        var sequenceMode = tileSources.length > 1;
        if (sequenceMode) {
            OpenSeadragon.setString("Tooltips.FullPage", OpenSeadragon.getString("Tooltips.FullPage") + " (f)");
            OpenSeadragon.setString("Tooltips.NextPage", OpenSeadragon.getString("Tooltips.NextPage") + " (n)");
            OpenSeadragon.setString("Tooltips.PreviousPage", OpenSeadragon.getString("Tooltips.PreviousPage") + " (p)");
        }
        var viewer = new OpenSeadragon({
            id: "openseadragon",
            prefixUrl: "openseadragon/images/",
            sequenceMode: sequenceMode,
            navPrevNextWrap: true,
            tileSources: tileSources,
            maxZoomPixelRatio: 2
        });
        if ("selection" in viewer) {
            // https://developer.mozilla.org/en-US/docs/Web/HTML/CORS_enabled_image
            if (a.protocol == location.protocol && a.host == location.host && a.port == location.port) {
                var selection = viewer.selection({
                    returnPixelCoordinates: false,
                    //restrictToImage: true, //will have trouble at the bottom of portrait images
                    onSelection: function(rect) {
                        var rect_ = viewer.viewport.viewportToViewerElementRectangle(rect);
                        var canvasClip = document.createElement("canvas");
                        var canvasClipCtx = canvasClip.getContext("2d");
                        canvasClip.width = rect_.width;
                        canvasClip.height = rect_.height;
                        canvasClipCtx.drawImage( viewer.drawer.canvas, rect_.x, rect_.y, rect_.width, rect_.height, 0, 0, rect_.width, rect_.height);
                        
                        // taken from https://en.wikipedia.org/wiki/Otsu's_method
                        function otsu(histogram, pixelsNumber) {
                            var sum = 0, sumB = 0, wB = 0, wF = 0, mB, mF, max = 0, between, threshold = 0;
                            for (var i = 0; i < 256; ++i) {
                                wB += histogram[i];
                                if (wB == 0) {
                                    continue;
                                }
                                wF = pixelsNumber - wB;
                                if (wF == 0) {
                                    break;
                                }
                                sumB += i * histogram[i];
                                mB = sumB / wB;
                                mF = (sum - sumB) / wF;
                                between = wB * wF * Math.pow(mB - mF, 2);
                                if (between > max) {
                                    max = between;
                                    threshold = i;
                                }
                            }
                            return threshold;
                        }
                        var imData = canvasClipCtx.getImageData(0, 0, canvasClip.width, canvasClip.height)
                        var histogram = Array(256), red, green, blue, gray;
                        for (i = 0; i < 256; ++i) {
                            histogram[i] = 0;
                        }
                        for (i = 0; i < imData.data.length; i += 4) {
                            red = imData.data[i];
                            blue = imData.data[i + 1];
                            green = imData.data[i + 2];
                            // https://en.wikipedia.org/wiki/Grayscale
                            gray = red * .2126 + green * .7152 + blue * .0722;
                            histogram[Math.round(gray)] += 1;
                        }
                        var threshold = otsu(histogram, imData.data.length / 4);
                        console.log("threshold = %s", threshold);
                        for (i = 0; i < imData.data.length; i += 4) {
                            imData.data[i] = imData.data[i + 1] = imData.data[i + 2] = imData.data[i] >= threshold ? 255 : 0;
                            imData.data[i + 3] = 255; // opacity 255 = 100%
                        }
                        canvasClipCtx.putImageData(imData, 0, 0);
                        
                        var type = 'image/png';
                        var dataurl = canvasClip.toDataURL(type);
                        var bin = atob(dataurl.split(',')[1]);
                        var buffer = new Uint8Array(bin.length);
                        for (var i = 0; i < bin.length; i++) {
                            buffer[i] = bin.charCodeAt(i);
                        }
                        var blob = new Blob([buffer.buffer], {type: type});
                        var fd = new FormData();
                        fd.append('upload', blob, "test.jpg");
                        $("#input_dialog").html('<div><img src="'+ dataurl + '"><img src="loading.gif"></div>');
                        $.ajax({
                            type: 'POST',
                            url: 'https://hentaigana.herokuapp.com/json',
                            data: fd,
                            processData: false,
                            contentType: false
                        }).done(function(data) {
                            var dialogObj = $("#input_dialog");
                            dialogObj.html('');
                            if (data) {
                                if ("message" in data) {
                                    dialogObj.text(data.message);
                                } else if ("predictions" in data) {
                                    var contents = '<table id="hentaigana_result" style="width: 95%; text-align: center"><tr><th>認識候補</th><th>字母</th><th>音価</th><th>確率</th></tr>';
                                    var len = data.predictions.length;
                                    for (i = 0; i < len; i++) {
                                        contents += '<tr><td>第' + String(i+1) + '候補</td><td>' + 
                                            data.predictions[i].jibo + '</td><td>' + 
                                            data.predictions[i].onka + '</td><td style="text-align: right">' + 
                                            data.predictions[i].prob + '</td></tr>';
                                    }
                                    contents += '</table>';
                                    contents += '<p style="font-size: smaller;">Provided by <a href="https://hentaigana.herokuapp.com/" target="_blank">https://hentaigana.herokuapp.com/</a></p>';
                                    dialogObj.append(contents);
                                }
                            }
                        });
                        $("#input_dialog").keypress(function(event) { event.stopPropagation(); });
                        $("#input_dialog").dialog({
                            modal: true,
                            title: "変体仮名の画像認識",
                            close: function() {
                                viewer.removeOverlay("runtime-overlay-selection");
                            }
                        });
                    }
                });
            }
        }
        var tiledrawnHandler = false;
        viewer.addHandler("tile-drawn", function readyHandler(event) {
            viewer.removeHandler("tile-drawn", readyHandler); // not work in IE < 9
            if (tiledrawnHandler) { return; } else { tiledrawnHandler = true; }
            if (loaderElt && loaderElt.parentNode) {
                loaderElt.parentNode.removeChild(loaderElt);
            }
            if (xmlJsonSrcMode) {
                document.title += " (" + event.tiledImage.source.width + "x" + event.tiledImage.source.height + ")";
            }
        });
        if (sequenceMode) {
            var initialSrc = viewer.tileSources[0].url || viewer.tileSources[0];
            var origLoc = location.protocol + "//" + location.host + location.pathname;
            var origSearch = "?img=" + initialSrc;
            if (sequenceMode && lastPage > 1) {
                origSearch += "&pages=" + String(lastPage);
            }
            imgurlElt.textContent = origLoc + origSearch + location.hash;
            viewer.addHandler("page", function(data) {
                var currentSrc = viewer.tileSources[data.page].url || viewer.tileSources[data.page];
                var newUrl = origLoc + origSearch.replace(initialSrc, currentSrc);
                imgurlElt.textContent = newUrl;
                if (hasHistoryReplaceState()) {
                    history.replaceState(null, null, newUrl);
                }
            });
            OpenSeadragon.addEvent(
                document,
                'keypress',
                OpenSeadragon.delegate(this, function onKeyPress(e) {
                    var key = e.keyCode ? e.keyCode : e.charCode;
                    switch (String.fromCharCode(key)) {
                    case 'n':
                    case '>':
                    case '.':
                        if (viewer.nextButton) {
                            viewer.nextButton.onRelease();
                        }
                        return false;
                    case 'p':
                    case '<':
                    case ',':
                        if (viewer.previousButton) {
                            viewer.previousButton.onRelease();
                        }
                        return false;
                    case 'f':
                        if (viewer.fullPageButton) {
                            viewer.fullPageButton.onRelease();
                        }
                        return false;
                    case 'u':
                        if (popup2Elt.style.display === "block") {
                            popup2Elt.style.display = "none";
                        } else {
                            popup2Elt.style.display = "block";
                            document.getElementById("ok-button").focus();
                        }
                        return false;
                    }
                }),
                false
            );
        }
    }
    
    function onError(event) {
        popupElt.style.display = "block";
        loaderElt.removeChild(event.image);
        document.getElementById("error").textContent =
                "Can not retrieve requested image.";
    }

})();
