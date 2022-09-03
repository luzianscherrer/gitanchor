// ==UserScript==
// @name         GitAnchor
// @author       Luzian Scherrer
// @version      1.0
// @match        https://github.com/*commits/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=tampermonkey.net
// @grant        none
// @require      https://unpkg.com/@metamask/detect-provider/dist/detect-provider.min.js
// ==/UserScript==


window.buttonClicked = async function (hashValue) {
    console.log('action for: ' + hashValue);

    const provider = await detectEthereumProvider();
    console.log('provider:', provider);

    const chainId = await ethereum.request({ method: 'eth_chainId' });
    console.log('chainId:', chainId);
}


function inject() {
    console.log('inject');

    var selector1 = document.querySelector("li.Box-row clipboard-copy");
    if (selector1 !== undefined) {
        console.log('hash', selector1.value);

        var btn = document.createElement("div");
        btn.className = "BtnGroup"
        btn.innerHTML = '<a href="#" aria-label="GitAnchor Tooltip" data-view-component="true" class="tooltipped tooltipped-sw btn-outline btn BtnGroup-item" onclick="window.buttonClicked(\'' + selector1.value + '\'); return false;">GitAnchor</a>';

        var selector2 = document.querySelector("li.Box-row div.BtnGroup");
        if (selector2 !== undefined) {
            selector2.after(btn);
        }

    }
}

(function () {
    'use strict';

    console.log('Hello GitAnchor');
    inject();

    /*
    if(location.href.match(/.\/commits/)) {
        inject();
    }

    const observer = new MutationObserver((mutationsList) => {
        if(location.href.match(/.\/commits/)) {
            mutationsList.forEach(function(mutation) {
                console.log(mutation.type);
            });
            //console.log(mutationsList);
            inject();
        }
    });
    observer.observe(document, {childList: true, subtree: true});
*/

})();