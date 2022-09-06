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
// @require      https://cdn.ethers.io/lib/ethers-5.2.umd.min.js
// @require      https://raw.githubusercontent.com/luzianscherrer/gitanchor/main/userscripts/lib/web3modal%401.9.8.js
// @supportURL   https://github.com/luzianscherrer/gitanchor/issues
// ==/UserScript==

// web3modal is copied and included in my repository with full path to index.js.map because of https://bugzilla.mozilla.org/show_bug.cgi?id=1437937

/* globals ethers web3Modal Web3Modal */

(function () {
    'use strict';


    console.log('Hello GitAnchor');

    let accounts = [];
    let connection;
    let provider;
    let signer;
    let blockchainAccounts;
    let network;
    let web3Modal;
    let anchorContract;

    const anchorContractAddress = '0xC3524D9C7bb54929fd7049075Bc2fa05Ba96dF95';

    const anchorContractAbi = [
        "function getAnchor(string memory anchorHash) public view returns (uint256, address)"
    ];


    const walletButtonHtml = `
       <a href="" data-view-component="true" class="btn walletButton" style="margin-left: 5px;">Connect wallet</a>
    `;

    const blockchainLabelHtml = `
        <div class="ml-3">


            <svg class="octicon blockchainLogo blockchainLogoPolygon" style="display: none;" height="16" viewBox="0 0 16 16" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xml:space="preserve" xmlns:serif="http://www.serif.com/" style="fill-rule:evenodd;clip-rule:evenodd;stroke-linejoin:round;stroke-miterlimit:2;">
                <g transform="matrix(0.406753,0,0,0.406753,0.190348,1.18689)">
                    <path d="M29,10.2C28.3,9.8 27.4,9.8 26.6,10.2L21,13.5L17.2,15.6L11.7,18.9C11,19.3 10.1,19.3 9.3,18.9L5,16.3C4.3,15.9 3.8,15.1 3.8,14.2L3.8,9.2C3.8,8.4 4.2,7.6 5,7.1L9.3,4.6C10,4.2 10.9,4.2 11.7,4.6L16,7.2C16.7,7.6 17.2,8.4 17.2,9.3L17.2,12.6L21,10.4L21,7C21,6.2 20.6,5.4 19.8,4.9L11.8,0.2C11.1,-0.2 10.2,-0.2 9.4,0.2L1.2,5C0.4,5.4 0,6.2 0,7L0,16.4C0,17.2 0.4,18 1.2,18.5L9.3,23.2C10,23.6 10.9,23.6 11.7,23.2L17.2,20L21,17.8L26.5,14.6C27.2,14.2 28.1,14.2 28.9,14.6L33.2,17.1C33.9,17.5 34.4,18.3 34.4,19.2L34.4,24.2C34.4,25 34,25.8 33.2,26.3L29,28.8C28.3,29.2 27.4,29.2 26.6,28.8L22.3,26.3C21.6,25.9 21.1,25.1 21.1,24.2L21.1,21L17.3,23.2L17.3,26.5C17.3,27.3 17.7,28.1 18.5,28.6L26.6,33.3C27.3,33.7 28.2,33.7 29,33.3L37.1,28.6C37.8,28.2 38.3,27.4 38.3,26.5L38.3,17C38.3,16.2 37.9,15.4 37.1,14.9L29,10.2Z" style="fill:rgb(130,71,229);fill-rule:nonzero;"/>
                </g>
            </svg>


            <svg class="octicon blockchainLogo blockchainLogoEthereum" style="display: none;" height="16" viewBox="0 0 16 16" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xml:space="preserve" xmlns:serif="http://www.serif.com/" style="fill-rule:evenodd;clip-rule:evenodd;stroke-linejoin:round;stroke-miterlimit:2;">
                <g transform="matrix(0.0361991,0,0,0.0362812,-1.30317,-1.23356)">
                    <path d="M256,362L256,469L387,284L256,362Z" style="fill:rgb(60,60,59);fill-rule:nonzero;"/>
                </g>
                <g transform="matrix(0.0361991,0,0,0.0362812,-1.30317,-1.23356)">
                    <path d="M256,41L387,259L256,337L124,259" style="fill:rgb(52,52,52);fill-rule:nonzero;"/>
                </g>
                <g transform="matrix(0.0361991,0,0,0.0362812,-1.30317,-1.23356)">
                    <path d="M256,41L256,199L124,259M124,284L256,362L256,469" style="fill:rgb(140,140,140);fill-rule:nonzero;"/>
                </g>
                <g transform="matrix(0.0361991,0,0,0.0362812,-1.30317,-1.23356)">
                    <path d="M256,199L256,337L387,259" style="fill:rgb(20,20,20);fill-rule:nonzero;"/>
                </g>
                <g transform="matrix(0.0361991,0,0,0.0362812,-1.30317,-1.23356)">
                    <path d="M124,259L256,199L256,337" style="fill:rgb(57,57,57);fill-rule:nonzero;"/>
                </g>
            </svg>

            <strong class="blockchainTitle"></strong>
            <span class="color-fg-muted blockchainSubtitle"></span>
        </div>
    `;


    const anchorObjectHtml = `
        <div data-view-component="true" class="BtnGroup anchorOject">
            <details class="details-reset details-overlay mr-0 mb-0 " >
                <summary class="btn css-truncate" title="GitAnchor">


                    <svg class="octicon anchorAvailable" style="display: none;" height="16" viewBox="0 0 16 16" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xml:space="preserve" xmlns:serif="http://www.serif.com/" style="fill-rule:evenodd;clip-rule:evenodd;stroke-linejoin:round;stroke-miterlimit:2;">
                        <g id="Green-Icon" serif:id="Green Icon" transform="matrix(0.03125,0,0,0.03125,0,0)">
                            <g id="Green-Circle" serif:id="Green Circle" transform="matrix(1.18415,0,0,1.18415,-0.368298,-3.92075)">
                                <path d="M370.966,70.814C408.148,109.345 431,161.775 431,219.5C431,337.886 334.886,434 216.5,434C98.114,434 2,337.886 2,219.5C2,101.114 98.114,5 216.5,5C234.27,5 251.538,7.165 268.064,11.265C266.035,13.735 264.188,16.401 262.542,19.253C248.243,44.019 253.638,74.801 273.77,93.478L263.166,109.022L242.029,96.818C241.98,84.978 235.969,73.451 224.98,67.106C208.543,57.617 187.46,63.266 177.97,79.702C168.481,96.139 174.13,117.222 190.566,126.712C201.556,133.057 214.544,132.499 224.822,126.621L243.717,137.53L138.702,291.478C116.695,271.54 102.056,245.793 97.162,218.549L137.342,213.117C139.713,212.797 141.837,211.51 143.218,209.565C144.6,207.601 145.1,205.169 144.613,202.83C143.325,196.663 131.157,142.083 102.002,125.25C93.777,120.501 83.247,123.323 78.498,131.548C64.169,156.366 58.331,184.974 61.628,214.177C66.216,257.367 90.078,298.354 127.006,326.569C133.33,331.462 140.033,335.957 146.932,339.941C153.489,343.726 160.657,347.278 168.381,350.556C242.532,381.267 325.614,357.38 361.623,295.011C366.372,286.785 363.55,276.255 355.325,271.506C326.17,254.674 272.818,271.426 266.833,273.395C264.564,274.141 262.708,275.791 261.698,277.97C260.705,280.138 260.652,282.621 261.56,284.834L276.949,322.359C251.507,331.463 221.799,332.143 192.961,322.934L273.833,154.917L292.728,165.826C292.776,177.666 298.787,189.193 309.777,195.538C326.213,205.027 347.297,199.378 356.786,182.942C366.276,166.506 360.626,145.422 344.19,135.933C333.2,129.588 320.212,130.146 309.934,136.023L288.797,123.82L296.957,106.864C323.197,114.961 352.552,104.242 366.851,79.476C368.478,76.659 369.85,73.763 370.966,70.814Z" style="fill:rgb(146,232,169);"/>
                            </g>
                            <g id="Green-Anchor" serif:id="Green Anchor" transform="matrix(1.18415,0,0,1.18415,-0.368298,-3.92075)">
                                <path d="M268.064,11.265C307.927,21.109 343.414,42.117 370.966,70.814C369.85,73.763 368.478,76.659 366.851,79.476C352.552,104.242 323.197,114.961 296.957,106.864L288.797,123.82L309.934,136.023C320.212,130.146 333.2,129.588 344.19,135.933C360.626,145.422 366.276,166.506 356.786,182.942C347.297,199.378 326.213,205.027 309.777,195.538C298.787,189.193 292.776,177.666 292.728,165.826L273.833,154.917L192.961,322.934C221.799,332.143 251.507,331.463 276.949,322.359L261.56,284.834C260.652,282.621 260.705,280.138 261.698,277.97C262.708,275.791 264.564,274.141 266.833,273.395C272.818,271.426 326.17,254.674 355.325,271.506C363.55,276.255 366.372,286.785 361.623,295.011C325.614,357.38 242.532,381.267 168.381,350.556C160.657,347.278 153.489,343.726 146.932,339.941C140.033,335.957 133.33,331.462 127.006,326.569C90.078,298.354 66.216,257.367 61.628,214.177C58.331,184.974 64.169,156.366 78.498,131.548C83.247,123.323 93.777,120.501 102.002,125.25C131.157,142.083 143.325,196.663 144.613,202.83C145.1,205.169 144.6,207.601 143.218,209.565C141.837,211.51 139.713,212.797 137.342,213.117L97.162,218.549C102.056,245.793 116.695,271.54 138.702,291.478L243.717,137.53L224.822,126.621C214.544,132.499 201.556,133.057 190.566,126.712C174.13,117.222 168.481,96.139 177.97,79.702C187.46,63.266 208.543,57.617 224.98,67.106C235.969,73.451 241.98,84.978 242.029,96.818L263.166,109.022L273.77,93.478C253.638,74.801 248.243,44.019 262.542,19.253C264.188,16.401 266.035,13.735 268.064,11.265Z" style="fill:rgb(26,121,52);"/>
                            </g>
                            <g id="Green-Circle-Top" serif:id="Green Circle Top" transform="matrix(1.18415,0,0,1.18415,-0.368298,-3.92075)">
                                <path d="M323.3,34.464C331.518,39.208 334.342,49.75 329.598,57.968C324.853,66.186 314.311,69.011 306.093,64.266C297.875,59.521 295.05,48.98 299.795,40.762C304.54,32.544 315.082,29.719 323.3,34.464Z" style="fill:rgb(146,232,169);"/>
                            </g>
                        </g>
                    </svg>


                    <svg class="octicon anchorNotAvailable" height="16" viewBox="0 0 16 16" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xml:space="preserve" xmlns:serif="http://www.serif.com/" style="fill-rule:evenodd;clip-rule:evenodd;stroke-linejoin:round;stroke-miterlimit:2;">
                        <g id="Gray-Circle" serif:id="Gray Circle" transform="matrix(0.0370047,0,0,0.0370047,-0.0115093,-0.122523)">
                            <circle cx="216.5" cy="219.5" r="214.5" style="fill:rgb(198,203,208);"/>
                        </g>
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

    function subscribeToConnectionEvents() {
        console.log('subscribeToConnectionEvents on', provider);

        connection.on("accountsChanged", (accounts) => {
            console.log('accountsChanged');
            console.log(accounts);
        });

        connection.on("chainChanged", async (chainId) => {
            console.log('chainChanged');
            console.log(chainId);
            await updateConnectionState();
            await updateWalletConnectionDisplay();
        });

        connection.on("connect", (info) => {
            console.log('connect');
            console.log(info);
        });

        connection.on("disconnect", (error) => {
            console.log('disconnect');
            console.log(error);
        });
    }

    function htmlToElement(html) {
        var template = document.createElement('template');
        html = html.trim();
        template.innerHTML = html;
        return template.content.firstChild;
    }

    function truncateEthereumAddressString(addressString) {
        if (addressString.length <= 12) return addressString;
        return addressString.substr(0, 5) + '...' + addressString.substr(addressString.length - 4);
    };

    async function disconnectWallet() {
        console.log('disconnect');
        await web3Modal.clearCachedProvider();

        let walletButton = document.querySelector('.walletButton');
        walletButton.textContent = 'Connect wallet';
        walletButton.classList.add("walletDisconnected");
        walletButton.classList.remove("walletConnected");

        let blockchainTitle = document.querySelector('.blockchainTitle');
        blockchainTitle.textContent = '';
        let blockchainSubtitle = document.querySelector('.blockchainSubtitle');
        blockchainSubtitle.textContent = '';

        let blockchainLogos = document.querySelectorAll('.blockchainLogo');
        blockchainLogos.forEach(element => {
            element.style.display = 'none';
        });

    }

    async function updateWalletConnectionDisplay() {

        console.log('accounts:', blockchainAccounts);
        console.log('network:', network);

        let walletButton = document.querySelector('.walletButton');
        walletButton.textContent = 'Disconnect wallet';
        walletButton.classList.add("walletConnected");
        walletButton.classList.remove("walletDisconnected");

        let blockchainTitle = document.querySelector('.blockchainTitle');
        let blockchainSubtitle = document.querySelector('.blockchainSubtitle');
        let blockchainLogos = document.querySelectorAll('.blockchainLogo');
        blockchainLogos.forEach(element => {
            element.style.display = 'none';
        });

        let blockchainLogo;
        switch (network.chainId) {
            case 5:
                blockchainTitle.textContent = 'Ethereum Görli';
                blockchainSubtitle.textContent = truncateEthereumAddressString(blockchainAccounts[0]);
                blockchainLogo = document.querySelector('.blockchainLogoEthereum');
                blockchainLogo.style.display = 'inline';
                break;
            case 80001:
                blockchainTitle.textContent = 'Polygon Mumbai';
                blockchainSubtitle.textContent = truncateEthereumAddressString(blockchainAccounts[0]);
                blockchainLogo = document.querySelector('.blockchainLogoPolygon');
                blockchainLogo.style.display = 'inline';
                break;
            default:
                blockchainTitle.textContent = 'Warning';
                blockchainSubtitle.textContent = 'unsupported network';
                break;
        }

    }

    async function updateConnectionState() {
        provider = new ethers.providers.Web3Provider(connection);
        signer = provider.getSigner();
        blockchainAccounts = await provider.listAccounts();
        network = await provider.getNetwork();
        anchorContract = new ethers.Contract(anchorContractAddress, anchorContractAbi, signer);
    }

    async function connectWallet() {
        connection = await web3Modal.connect();
        await updateConnectionState();

        subscribeToConnectionEvents();

        updateWalletConnectionDisplay();

        fetchAnchorsFromBlockchain();

    }

    async function fetchAnchorsFromBlockchain() {
        console.log('fetch anchors');
        let anchors = document.querySelectorAll(".anchorOject");
        console.log('fetch anchors for', anchors);
        for (const anchor of anchors) {
            //console.log('fetching anchor for', anchor);
            anchorContract.getAnchor(anchor.value).then(function (value, err) {
                if (value[0].toNumber() !== 0) {
                    console.log('found anchor for :', anchor);
                    anchor.querySelector('.anchorNotAvailable').style.display = 'none';
                    anchor.querySelector('.anchorAvailable').style.display = 'inline';
                }
            });
        }

    }

    function inject() {
        if (location.href.match(/.\/commits/)) {

            var found = document.querySelectorAll("li.Box-row clipboard-copy");
            for (var selector of found) {
                var container = selector.closest('div.BtnGroup');

                if (!container.classList.contains("gitanchor")) {
                    let anchorOject = htmlToElement(anchorObjectHtml);
                    anchorOject.value = selector.value;
                    container.after(anchorOject);
                    console.log('debug adding anchor button for hash', anchorOject.value);
                    container.classList.add("gitanchor");
                }

            }

            var branchSelectMenu = document.querySelector("div.file-navigation");
            if (!branchSelectMenu.classList.contains("gitanchor")) {
                var walletButton = htmlToElement(walletButtonHtml);
                walletButton.classList.add("walletDisconnected");
                branchSelectMenu.appendChild(walletButton);
                branchSelectMenu.appendChild(htmlToElement(blockchainLabelHtml));
                branchSelectMenu.classList.add("gitanchor");

                branchSelectMenu.classList.add("mb-3");
                branchSelectMenu.classList.add("d-flex");
                branchSelectMenu.classList.add("flex-items-start");
                branchSelectMenu.classList.add("flex-items-center");

                const providerOptions = {
                };

                web3Modal = new Web3Modal.default({
                    network: "goerli",
                    cacheProvider: true,
                    providerOptions
                });

                if (web3Modal.cachedProvider) {
                    console.log('cached provider', web3Modal.cachedProvider);
                    connectWallet();
                }

                accounts = walletButton.addEventListener('click', async function (e) {
                    console.log('click');

                    e.preventDefault();

                    if (walletButton.classList.contains("walletDisconnected")) {
                        await connectWallet();
                    } else {
                        await disconnectWallet();
                    }

                });

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