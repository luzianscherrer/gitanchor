// ==UserScript==
// @name         GitAnchor
// @version      1.0
// @description  Extend GitHub with UI components to interact with GitAnchor
// @license      MIT
// @author       Luzian Scherrer
// @namespace    https://github.com/luzianscherrer
// @match        https://github.com/*
// @icon         https://github.githubassets.com/pinned-octocat.svg
// @grant        none
// @require      https://unpkg.com/@metamask/detect-provider/dist/detect-provider.min.js
// @supportURL   https://github.com/luzianscherrer/gitanchor/issues
// ==/UserScript==

/*
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
*/

(function () {
    'use strict';

    console.log('Hello GitAnchor');

    const anchorObject = `
        <div data-view-component="true" class="BtnGroup">
            <details class="details-reset details-overlay mr-0 mb-0 " id="branch-select-menu">
                <summary class="btn css-truncate" data-hotkey="w" title="Switch branches or tags">
                    <svg text="gray" aria-hidden="true" height="16" viewBox="0 0 16 16" version="1.1" width="16"
                        data-view-component="true" class="octicon octicon-git-branch">
                        <path fill-rule="evenodd"
                            d="M11.75 2.5a.75.75 0 100 1.5.75.75 0 000-1.5zm-2.25.75a2.25 2.25 0 113 2.122V6A2.5 2.5 0 0110 8.5H6a1 1 0 00-1 1v1.128a2.251 2.251 0 11-1.5 0V5.372a2.25 2.25 0 111.5 0v1.836A2.492 2.492 0 016 7h4a1 1 0 001-1v-.628A2.25 2.25 0 019.5 3.25zM4.25 12a.75.75 0 100 1.5.75.75 0 000-1.5zM3.5 3.25a.75.75 0 111.5 0 .75.75 0 01-1.5 0z">
                        </path>
                    </svg>
                    <span class="css-truncate-target" data-menu-button="">GitAnchor</span>
                    <span class="dropdown-caret"></span>
                </summary>

                <div class="SelectMenu">
                    <div class="SelectMenu-modal">
                        <header class="SelectMenu-header">
                            <span class="SelectMenu-title">Anchor not set</span>
                        </header>

                        <footer class="SelectMenu-footer"><a href="#">Set anchor now</a>
                        </footer>

                    </div>
                </div>

            </details>
        </div>
    `;


    function htmlToElement(html) {
        var template = document.createElement('template');
        html = html.trim();
        template.innerHTML = html;
        return template.content.firstChild;
    }


    function inject() {
        console.log('inject');
        if (location.href.match(/.\/commits/)) {

            var found = document.querySelectorAll("li.Box-row clipboard-copy");
            for (var selector of found) {
                // selector.value is the hash hash
                var container = selector.closest('div.BtnGroup');

                if (!container.classList.contains("gitanchor")) {
                    container.after(htmlToElement(anchorObject));
                }

                container.classList.add("gitanchor");
            }

        }
    }


    let timer;
    const debounceInterval = 200;
    const observer = new MutationObserver((mutationsList) => {
        clearTimeout(timer);

        timer = setTimeout(() => {
            inject();
        }, debounceInterval);

    });
    observer.observe(document, { childList: true, subtree: true });

})();