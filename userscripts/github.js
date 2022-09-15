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

    let account;
    let connection;
    let provider;
    let signer;
    let network;
    let web3Modal;
    let gitAnchorContract;
    let blockchainEnabled;

    const gitAnchorContractAbi = [
        "function getAnchor(string memory anchorHash) public view returns (uint256, address)",
        "function setAnchor(string memory anchorHash) public"
    ];
    const gitAnchorSupportedNetworks = [
        { chainId: 5, chainName: 'Ethereum Goerli', chainLogo: 'gitanchor-blockchain-logo-ethereum', chainExplorer: 'https://goerli.etherscan.io', contractAddress: '0x65438AaA54141dD923C5F51E81d1aaD11daF3558' },
        { chainId: 80001, chainName: 'Polygon Mumbai', chainLogo: 'gitanchor-blockchain-logo-polygon', chainExplorer: 'https://mumbai.polygonscan.com', contractAddress: '0x65438AaA54141dD923C5F51E81d1aaD11daF3558' },
        { chainId: 338, chainName: 'Cronos testnet', chainLogo: 'gitanchor-blockchain-logo-cronos', chainExplorer: 'https://testnet.cronoscan.com/', contractAddress: '0x65438AaA54141dD923C5F51E81d1aaD11daF3558' },
        { chainId: 420, chainName: 'Optimism Goerli', chainLogo: 'gitanchor-blockchain-logo-optimism', chainExplorer: 'https://goerli-optimism.etherscan.io', contractAddress: '0x65438AaA54141dD923C5F51E81d1aaD11daF3558' }
    ];
    // { chainId: 1, chainName: 'Ethereum Mainnet', chainLogo: 'gitanchor-blockchain-logo-ethereum', chainExplorer: 'https://etherscan.io', contractAddress: '0xC3524D9C7bb54929fd7049075Bc2fa05Ba96dF95' },

    const gitAnchorWalletButtonHtml = `
        <a href="" data-view-component="true" class="btn gitanchor-wallet-button" style="margin-left: 5px;">Connect wallet</a>
    `;

    const gitAnchorBlockchainLabelHtml = `
        <div class="ml-3">

            <svg class="octicon gitanchor-blockchain-logo gitanchor-blockchain-logo-optimism" style="display: none;" height="16" viewBox="0 0 16 16" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xml:space="preserve" xmlns:serif="http://www.serif.com/" style="fill-rule:evenodd;clip-rule:evenodd;stroke-linejoin:round;stroke-miterlimit:2;">
                <g transform="matrix(0.03125,0,0,0.03125,0.1875,0.1875)">
                    <circle cx="250" cy="250" r="250" style="fill:rgb(255,4,32);"/>
                </g>
                <g transform="matrix(0.03125,0,0,0.03125,0.1875,0.1875)">
                    <path d="M177.133,316.446C162.247,316.446 150.051,312.943 140.544,305.938C131.162,298.808 126.471,288.676 126.471,275.541C126.471,272.789 126.784,269.411 127.409,265.408C129.036,256.402 131.35,245.581 134.352,232.947C142.858,198.547 164.812,181.347 200.213,181.347C209.845,181.347 218.476,182.973 226.107,186.225C233.738,189.352 239.742,194.106 244.12,200.486C248.498,206.74 250.688,214.246 250.688,223.002C250.688,225.629 250.375,228.944 249.749,232.947C247.873,244.08 245.621,254.901 242.994,265.408C238.616,282.546 231.048,295.368 220.29,303.874C209.532,312.255 195.147,316.446 177.133,316.446ZM179.76,289.426C186.766,289.426 192.707,287.362 197.586,283.234C202.59,279.106 206.155,272.789 208.281,264.283C211.158,252.524 213.348,242.266 214.849,233.51C215.349,230.883 215.599,228.194 215.599,225.441C215.599,214.058 209.657,208.366 197.774,208.366C190.768,208.366 184.764,210.43 179.76,214.558C174.882,218.687 171.379,225.004 169.253,233.51C167.001,241.891 164.749,252.149 162.498,264.283C161.997,266.784 161.747,269.411 161.747,272.163C161.747,283.672 167.752,289.426 179.76,289.426Z" style="fill:white;fill-rule:nonzero;"/>
                </g>
                <g transform="matrix(0.03125,0,0,0.03125,0.1875,0.1875)">
                    <path d="M259.303,314.57C257.927,314.57 256.863,314.132 256.113,313.256C255.487,312.255 255.3,311.13 255.55,309.879L281.444,187.914C281.694,186.538 282.382,185.412 283.508,184.536C284.634,183.661 285.822,183.223 287.073,183.223L336.985,183.223C350.87,183.223 362.003,186.1 370.384,191.854C378.891,197.609 383.144,205.927 383.144,216.81C383.144,219.937 382.769,223.19 382.018,226.567C378.891,240.953 372.574,251.586 363.067,258.466C353.685,265.346 340.8,268.786 324.413,268.786L299.082,268.786L290.451,309.879C290.2,311.255 289.512,312.38 288.387,313.256C287.261,314.132 286.072,314.57 284.822,314.57L259.303,314.57ZM325.727,242.892C330.98,242.892 335.546,241.453 339.424,238.576C343.427,235.699 346.054,231.571 347.305,226.192C347.68,224.065 347.868,222.189 347.868,220.563C347.868,216.935 346.805,214.183 344.678,212.307C342.551,210.305 338.924,209.305 333.795,209.305L311.278,209.305L304.148,242.892L325.727,242.892Z" style="fill:white;fill-rule:nonzero;"/>
                </g>
            </svg>

            <svg class="octicon gitanchor-blockchain-logo gitanchor-blockchain-logo-cronos" style="display: none;" height="16" viewBox="0 0 16 16" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xml:space="preserve" xmlns:serif="http://www.serif.com/" style="fill-rule:evenodd;clip-rule:evenodd;stroke-linejoin:round;stroke-miterlimit:2;">
                <g transform="matrix(0.110345,0,0,0.110345,1.37159,0.275862)">
                    <path d="M60.093,0L-0,34.712L-0,104.114L60.093,138.803L120.14,104.114L120.14,34.712L60.093,0ZM102.349,93.83L60.093,118.236L17.814,93.83L17.814,44.972L60.093,20.567L102.349,44.972L102.349,93.83Z" style="fill:rgb(0,45,116);fill-rule:nonzero;"/>
                    <path d="M60.093,138.803L120.14,104.114L120.14,34.712L60.093,0L60.093,20.59L102.349,44.996L102.349,93.854L60.093,118.236L60.093,138.803Z" style="fill:url(#_Linear1);fill-rule:nonzero;"/>
                    <path d="M60.047,0L0,34.689L0,104.091L60.047,138.803L60.047,118.213L17.791,93.807L17.791,44.949L60.047,20.567L60.047,0Z" style="fill:url(#_Linear2);fill-rule:nonzero;"/>
                    <path d="M88.116,85.618L60.07,101.811L32,85.618L32,53.209L60.07,36.992L88.116,53.209L76.442,59.956L60.07,50.487L43.698,59.956L43.698,78.847L60.07,88.317L76.442,78.847L88.116,85.618Z" style="fill:rgb(0,45,116);fill-rule:nonzero;"/>
                </g>
                <defs>
                    <linearGradient id="_Linear1" x1="0" y1="0" x2="1" y2="0" gradientUnits="userSpaceOnUse" gradientTransform="matrix(4.24962e-15,-69.4016,69.4016,4.24962e-15,90.1164,138.803)"><stop offset="0" style="stop-color:rgb(0,45,116);stop-opacity:1"/><stop offset="1" style="stop-color:rgb(0,45,116);stop-opacity:0"/></linearGradient>
                    <linearGradient id="_Linear2" x1="0" y1="0" x2="1" y2="0" gradientUnits="userSpaceOnUse" gradientTransform="matrix(4.24961e-15,69.4014,-69.4014,4.24961e-15,30.0233,0)"><stop offset="0" style="stop-color:rgb(0,45,116);stop-opacity:1"/><stop offset="1" style="stop-color:rgb(0,45,116);stop-opacity:0"/></linearGradient>
                </defs>
            </svg>

            <svg class="octicon gitanchor-blockchain-logo gitanchor-blockchain-logo-polygon" style="display: none;" height="16" viewBox="0 0 16 16"
                version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xml:space="preserve"
                xmlns:serif="http://www.serif.com/"
                style="fill-rule:evenodd;clip-rule:evenodd;stroke-linejoin:round;stroke-miterlimit:2;">
                <g transform="matrix(0.406753,0,0,0.406753,0.190348,1.18689)">
                    <path
                        d="M29,10.2C28.3,9.8 27.4,9.8 26.6,10.2L21,13.5L17.2,15.6L11.7,18.9C11,19.3 10.1,19.3 9.3,18.9L5,16.3C4.3,15.9 3.8,15.1 3.8,14.2L3.8,9.2C3.8,8.4 4.2,7.6 5,7.1L9.3,4.6C10,4.2 10.9,4.2 11.7,4.6L16,7.2C16.7,7.6 17.2,8.4 17.2,9.3L17.2,12.6L21,10.4L21,7C21,6.2 20.6,5.4 19.8,4.9L11.8,0.2C11.1,-0.2 10.2,-0.2 9.4,0.2L1.2,5C0.4,5.4 0,6.2 0,7L0,16.4C0,17.2 0.4,18 1.2,18.5L9.3,23.2C10,23.6 10.9,23.6 11.7,23.2L17.2,20L21,17.8L26.5,14.6C27.2,14.2 28.1,14.2 28.9,14.6L33.2,17.1C33.9,17.5 34.4,18.3 34.4,19.2L34.4,24.2C34.4,25 34,25.8 33.2,26.3L29,28.8C28.3,29.2 27.4,29.2 26.6,28.8L22.3,26.3C21.6,25.9 21.1,25.1 21.1,24.2L21.1,21L17.3,23.2L17.3,26.5C17.3,27.3 17.7,28.1 18.5,28.6L26.6,33.3C27.3,33.7 28.2,33.7 29,33.3L37.1,28.6C37.8,28.2 38.3,27.4 38.3,26.5L38.3,17C38.3,16.2 37.9,15.4 37.1,14.9L29,10.2Z"
                        style="fill:rgb(130,71,229);fill-rule:nonzero;" />
                </g>
            </svg>

            <svg class="octicon gitanchor-blockchain-logo gitanchor-blockchain-logo-ethereum" style="display: none;" height="16" viewBox="0 0 16 16"
                version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xml:space="preserve"
                xmlns:serif="http://www.serif.com/"
                style="fill-rule:evenodd;clip-rule:evenodd;stroke-linejoin:round;stroke-miterlimit:2;">
                <g transform="matrix(0.0361991,0,0,0.0362812,-1.30317,-1.23356)">
                    <path d="M256,362L256,469L387,284L256,362Z" style="fill:rgb(60,60,59);fill-rule:nonzero;" />
                </g>
                <g transform="matrix(0.0361991,0,0,0.0362812,-1.30317,-1.23356)">
                    <path d="M256,41L387,259L256,337L124,259" style="fill:rgb(52,52,52);fill-rule:nonzero;" />
                </g>
                <g transform="matrix(0.0361991,0,0,0.0362812,-1.30317,-1.23356)">
                    <path d="M256,41L256,199L124,259M124,284L256,362L256,469"
                        style="fill:rgb(140,140,140);fill-rule:nonzero;" />
                </g>
                <g transform="matrix(0.0361991,0,0,0.0362812,-1.30317,-1.23356)">
                    <path d="M256,199L256,337L387,259" style="fill:rgb(20,20,20);fill-rule:nonzero;" />
                </g>
                <g transform="matrix(0.0361991,0,0,0.0362812,-1.30317,-1.23356)">
                    <path d="M124,259L256,199L256,337" style="fill:rgb(57,57,57);fill-rule:nonzero;" />
                </g>
            </svg>

            <strong class="gitanchor-blockchain-title"></strong>
            <span class="color-fg-muted gitanchor-blockchain-subtitle"></span>
        </div>
    `;

    const gitAnchorCommitUiHtml = `
        <div data-view-component="true" class="BtnGroup gitanchor-commit-ui-content" style="display: none;">
            <details class="details-reset details-overlay mr-0 mb-0 ">
                <summary class="btn css-truncate" title="GitAnchor">

                    <svg class="octicon gitanchor-anchor-icon-status gitanchor-anchor-icon-status-available" style="display: none;" height="16" viewBox="0 0 16 16" version="1.1"
                        xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xml:space="preserve"
                        xmlns:serif="http://www.serif.com/"
                        style="fill-rule:evenodd;clip-rule:evenodd;stroke-linejoin:round;stroke-miterlimit:2;">
                        <g id="Green-Icon" serif:id="Green Icon" transform="matrix(0.03125,0,0,0.03125,0,0)">
                            <g id="Green-Circle" serif:id="Green Circle"
                                transform="matrix(1.18415,0,0,1.18415,-0.368298,-3.92075)">
                                <path
                                    d="M370.966,70.814C408.148,109.345 431,161.775 431,219.5C431,337.886 334.886,434 216.5,434C98.114,434 2,337.886 2,219.5C2,101.114 98.114,5 216.5,5C234.27,5 251.538,7.165 268.064,11.265C266.035,13.735 264.188,16.401 262.542,19.253C248.243,44.019 253.638,74.801 273.77,93.478L263.166,109.022L242.029,96.818C241.98,84.978 235.969,73.451 224.98,67.106C208.543,57.617 187.46,63.266 177.97,79.702C168.481,96.139 174.13,117.222 190.566,126.712C201.556,133.057 214.544,132.499 224.822,126.621L243.717,137.53L138.702,291.478C116.695,271.54 102.056,245.793 97.162,218.549L137.342,213.117C139.713,212.797 141.837,211.51 143.218,209.565C144.6,207.601 145.1,205.169 144.613,202.83C143.325,196.663 131.157,142.083 102.002,125.25C93.777,120.501 83.247,123.323 78.498,131.548C64.169,156.366 58.331,184.974 61.628,214.177C66.216,257.367 90.078,298.354 127.006,326.569C133.33,331.462 140.033,335.957 146.932,339.941C153.489,343.726 160.657,347.278 168.381,350.556C242.532,381.267 325.614,357.38 361.623,295.011C366.372,286.785 363.55,276.255 355.325,271.506C326.17,254.674 272.818,271.426 266.833,273.395C264.564,274.141 262.708,275.791 261.698,277.97C260.705,280.138 260.652,282.621 261.56,284.834L276.949,322.359C251.507,331.463 221.799,332.143 192.961,322.934L273.833,154.917L292.728,165.826C292.776,177.666 298.787,189.193 309.777,195.538C326.213,205.027 347.297,199.378 356.786,182.942C366.276,166.506 360.626,145.422 344.19,135.933C333.2,129.588 320.212,130.146 309.934,136.023L288.797,123.82L296.957,106.864C323.197,114.961 352.552,104.242 366.851,79.476C368.478,76.659 369.85,73.763 370.966,70.814Z"
                                    style="fill:rgb(146,232,169);" />
                            </g>
                            <g id="Green-Anchor" serif:id="Green Anchor"
                                transform="matrix(1.18415,0,0,1.18415,-0.368298,-3.92075)">
                                <path
                                    d="M268.064,11.265C307.927,21.109 343.414,42.117 370.966,70.814C369.85,73.763 368.478,76.659 366.851,79.476C352.552,104.242 323.197,114.961 296.957,106.864L288.797,123.82L309.934,136.023C320.212,130.146 333.2,129.588 344.19,135.933C360.626,145.422 366.276,166.506 356.786,182.942C347.297,199.378 326.213,205.027 309.777,195.538C298.787,189.193 292.776,177.666 292.728,165.826L273.833,154.917L192.961,322.934C221.799,332.143 251.507,331.463 276.949,322.359L261.56,284.834C260.652,282.621 260.705,280.138 261.698,277.97C262.708,275.791 264.564,274.141 266.833,273.395C272.818,271.426 326.17,254.674 355.325,271.506C363.55,276.255 366.372,286.785 361.623,295.011C325.614,357.38 242.532,381.267 168.381,350.556C160.657,347.278 153.489,343.726 146.932,339.941C140.033,335.957 133.33,331.462 127.006,326.569C90.078,298.354 66.216,257.367 61.628,214.177C58.331,184.974 64.169,156.366 78.498,131.548C83.247,123.323 93.777,120.501 102.002,125.25C131.157,142.083 143.325,196.663 144.613,202.83C145.1,205.169 144.6,207.601 143.218,209.565C141.837,211.51 139.713,212.797 137.342,213.117L97.162,218.549C102.056,245.793 116.695,271.54 138.702,291.478L243.717,137.53L224.822,126.621C214.544,132.499 201.556,133.057 190.566,126.712C174.13,117.222 168.481,96.139 177.97,79.702C187.46,63.266 208.543,57.617 224.98,67.106C235.969,73.451 241.98,84.978 242.029,96.818L263.166,109.022L273.77,93.478C253.638,74.801 248.243,44.019 262.542,19.253C264.188,16.401 266.035,13.735 268.064,11.265Z"
                                    style="fill:rgb(26,121,52);" />
                            </g>
                            <g id="Green-Circle-Top" serif:id="Green Circle Top"
                                transform="matrix(1.18415,0,0,1.18415,-0.368298,-3.92075)">
                                <path
                                    d="M323.3,34.464C331.518,39.208 334.342,49.75 329.598,57.968C324.853,66.186 314.311,69.011 306.093,64.266C297.875,59.521 295.05,48.98 299.795,40.762C304.54,32.544 315.082,29.719 323.3,34.464Z"
                                    style="fill:rgb(146,232,169);" />
                            </g>
                        </g>
                    </svg>


                    <svg class="octicon gitanchor-anchor-icon-status gitanchor-anchor-icon-status-not-available" style="display: none;" height="16" viewBox="0 0 16 16" version="1.1"
                        xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xml:space="preserve"
                        xmlns:serif="http://www.serif.com/"
                        style="fill-rule:evenodd;clip-rule:evenodd;stroke-linejoin:round;stroke-miterlimit:2;">
                        <g id="Gray-Circle" serif:id="Gray Circle"
                            transform="matrix(0.0370047,0,0,0.0370047,-0.0115093,-0.122523)">
                            <circle cx="216.5" cy="219.5" r="214.5" style="fill:rgb(198,203,208);" />
                        </g>
                    </svg>


                    <svg height="16" class="octicon gitanchor-anchor-icon-status gitanchor-anchor-icon-status-unknown" style="display: none;" viewBox="0 0 16 16" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xml:space="preserve" xmlns:serif="http://www.serif.com/" style="fill-rule:evenodd;clip-rule:evenodd;stroke-linejoin:round;stroke-miterlimit:2;">
                        <g transform="matrix(0.03125,0,0,0.03125,-0.375,0.21875)">
                            <circle cx="268" cy="249" r="167"/>
                        </g>
                        <g id="Fill-193" transform="matrix(0.345109,0,0,0.345109,0.0613266,0.0616027)">
                            <path d="M26.489,22.695C24.599,23.808 24.057,24.585 24.057,26.093L24.057,26.987L21.025,26.987L21.01,25.815C20.937,23.75 21.831,22.431 23.838,21.23C25.61,20.161 26.24,19.311 26.24,17.802C26.24,16.147 24.936,14.931 22.929,14.931C20.908,14.931 19.604,16.147 19.472,18.081L16.44,18.081C16.572,14.756 18.843,12.236 23.091,12.236C26.958,12.236 29.565,14.536 29.565,17.671C29.565,19.941 28.423,21.538 26.489,22.695M22.563,33.769C21.494,33.769 20.644,32.949 20.644,31.88C20.644,30.81 21.494,29.99 22.563,29.99C23.662,29.99 24.497,30.81 24.497,31.88C24.497,32.949 23.662,33.769 22.563,33.769M23.003,0.003C10.32,0.003 0.003,10.32 0.003,23.003C0.003,35.685 10.32,46.003 23.003,46.003C35.685,46.003 46.003,35.685 46.003,23.003C46.003,10.32 35.685,0.003 23.003,0.003" style="fill:rgb(198,203,207);"/>
                        </g>
                    </svg>

                    <svg height="16" class="octicon gitanchor-anchor-icon-status gitanchor-anchor-icon-status-pending" viewBox="0 0 16 16" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xml:space="preserve" xmlns:serif="http://www.serif.com/" style="fill-rule:evenodd;clip-rule:evenodd;stroke-linejoin:round;stroke-miterlimit:2;">
                        <g id="Progress-Spinner" serif:id="Progress Spinner" transform="matrix(0.0544181,0,0,0.0544181,-6.96498,-5.33244)">
                            <path d="M248.463,387.551C257.215,389.18 266.098,390 275,390C355.028,390 420,325.028 420,245C420,164.972 355.028,100 275,100C226.068,100 180.437,124.679 153.652,165.629L196.4,193.59C213.749,167.065 243.306,151.08 275,151.08C326.836,151.08 368.92,193.164 368.92,245C368.92,296.836 326.836,338.92 275,338.92C269.234,338.92 263.48,338.389 257.811,337.334L248.463,387.551Z" style="fill:rgb(137,146,157);"/>
                        </g>
                        <animateTransform attributeName="transform" attributeType="XML" type="rotate" dur="1s" from="0 0 0" to="360 0 0" repeatCount="indefinite" />
                    </svg>

                    <!--
                    <span class="css-truncate-target" data-menu-button=""></span>
                    -->
                    <span class="dropdown-caret"></span>
                </summary>

                <div class="anim-scale-in gitanchor-anchor-details-unknown" style="display: none; position: relative; z-index: 200;">
                    <div class="dropdown-menu dropdown-menu-s py-0 color-fg-default text-left">
                        <div class="p-3 signed-commit-header d-flex">
                            <div class="flex-1">
                                This commit could not be verified.
                            </div>
                        </div>

                        <div class="signed-commit-footer p-3 rounded-bottom-2">
                            <span class="d-block">Network: <br /><span class="color-fg-muted gitanchor-network-name"></span></span>
                            <div class="my-1">
                            </div>
                            <a href="javascript: window.location.reload();">Please try again</a>
                        </div>
                    </div>
                </div>

                <div class="anim-scale-in gitanchor-anchor-details-available" style="display: none; position: relative; z-index: 200;">
                    <div class="dropdown-menu dropdown-menu-s py-0 color-fg-default text-left">
                        <div class="p-3 signed-commit-header d-flex">
                            <div class="flex-1 anchorAvailableDetailsText">
                                This commit has been anchored.
                            </div>
                        </div>

                        <div class="signed-commit-footer p-3 rounded-bottom-2">
                            <span class="d-block">Network: <br /><span class="color-fg-muted gitanchor-network-name"></span></span>
                            <div class="my-1">
                            </div>
                            <a href="" target="_blank" class="gitanchor-network-explorer">View anchor details</a>
                        </div>
                    </div>
                </div>

                <div class="anim-scale-in gitanchor-anchor-details-not-available" style="position: relative; z-index: 200;">
                    <div class="dropdown-menu dropdown-menu-s py-0 color-fg-default text-left">
                        <div class="p-3 signed-commit-header d-flex">
                            <div class="flex-1">
                                This commit is not anchored.
                            </div>
                        </div>

                        <div class="signed-commit-footer p-3 rounded-bottom-2">
                            <span class="d-block">Network: <br /><span class="color-fg-muted gitanchor-network-name"></span></span>
                            <div class="my-3">
                            </div>
                            <button class="btn gitanchor-anchor-details-create-anchor-button">Create anchor</button>
                        </div>
                    </div>
                </div>

            </details>
        </div>
    `;

    function subscribeToConnectionEvents() {

        connection.on("accountsChanged", (accounts) => {
            connectWallet();
        });

        connection.on("chainChanged", (chainId) => {
            connectWallet();
        });

        connection.on("connect", (info) => {
        });

        connection.on("disconnect", (error) => {
            disconnectWallet();
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
        await web3Modal.clearCachedProvider();

        let walletButton = document.querySelector('.gitanchor-wallet-button');
        walletButton.textContent = 'Connect wallet';
        walletButton.classList.add("gitanchor-wallet-disconnected");
        walletButton.classList.remove("gitanchor-wallet-connected");

        let blockchainTitle = document.querySelector('.gitanchor-blockchain-title');
        blockchainTitle.textContent = '';
        let blockchainSubtitle = document.querySelector('.gitanchor-blockchain-subtitle');
        blockchainSubtitle.textContent = '';

        let blockchainLogos = document.querySelectorAll('.gitanchor-blockchain-logo');
        blockchainLogos.forEach(element => {
            element.style.display = 'none';
        });

        document.querySelectorAll(".gitanchor-commit-ui-content").forEach(element => {
            element.style.display = 'none';
        });
    }

    async function updateWalletConnectionDisplay() {

        let walletButton = document.querySelector('.gitanchor-wallet-button');
        walletButton.textContent = 'Disconnect wallet';
        walletButton.classList.add("gitanchor-wallet-connected");
        walletButton.classList.remove("gitanchor-wallet-disconnected");

        let blockchainTitle = document.querySelector('.gitanchor-blockchain-title');
        let blockchainSubtitle = document.querySelector('.gitanchor-blockchain-subtitle');
        let blockchainLogo;
        let blockchainLogos = document.querySelectorAll('.gitanchor-blockchain-logo');
        blockchainLogos.forEach(element => {
            element.style.display = 'none';
        });

        var [networkInfo] = gitAnchorSupportedNetworks.filter(supportedNetwork => {
            return supportedNetwork.chainId === network.chainId;
        });

        if(networkInfo) {
            blockchainTitle.textContent = networkInfo.chainName;
            blockchainSubtitle.textContent = truncateEthereumAddressString(account);
            blockchainLogo = document.querySelector('.'+networkInfo.chainLogo);
            blockchainLogo.style.display = 'inline';
            document.querySelectorAll(".gitanchor-network-name").forEach(element => {
                element.textContent = networkInfo.chainName;
            });
            document.querySelectorAll(".gitanchor-network-explorer").forEach(element => {
                element.href = networkInfo.chainExplorer+'/address/'+networkInfo.contractAddress;
            });
        } else {
            blockchainTitle.textContent = 'Warning';
            blockchainSubtitle.textContent = 'unsupported network';
        }

        document.querySelectorAll(".gitanchor-commit-ui-content").forEach(element => {
            element.style.display = (blockchainEnabled ? 'inline-block' : 'none');
        });

        document.querySelectorAll(".gitanchor-anchor-icon-status").forEach(element => {
            element.style.display = 'none';
        });

        document.querySelectorAll(".gitanchor-anchor-icon-status-pending").forEach(element => {
            element.style.display = (blockchainEnabled ? 'inline' : 'none');
        });

    }

    async function updateConnectionState() {
        provider = new ethers.providers.Web3Provider(connection);
        signer = provider.getSigner();
        [account] = await provider.listAccounts();
        network = await provider.getNetwork();

        var [networkInfo] = gitAnchorSupportedNetworks.filter(supportedNetwork => {
            return supportedNetwork.chainId === network.chainId;
        });

        if(networkInfo) {
            gitAnchorContract = new ethers.Contract(networkInfo.contractAddress, gitAnchorContractAbi, signer);
            blockchainEnabled = true;
        } else {
            blockchainEnabled = false;
        }

    }

    async function connectWallet() {
        connection = await web3Modal.connect();
        await updateConnectionState();

        subscribeToConnectionEvents();

        updateWalletConnectionDisplay();

        if (blockchainEnabled) {
            fetchAllAnchorsFromBlockchain();
        }

    }

    async function fetchAllAnchorsFromBlockchain() {
        let gitAnchorCommitUiElements = document.querySelectorAll(".gitanchor-commit-ui-content");
        for (const anchor of gitAnchorCommitUiElements) {
            fetchAnchorFromBlockchain(anchor);
        }
    }

    async function fetchAnchorFromBlockchain(anchor) {
        anchor.querySelectorAll(".gitanchor-anchor-icon-status").forEach(element => {
            element.style.display = 'none';
        });
        anchor.querySelector('.gitanchor-anchor-icon-status-pending').style.display = 'inline';

        anchor.querySelector('.gitanchor-anchor-details-not-available').style.display = 'none';
        anchor.querySelector('.gitanchor-anchor-details-available').style.display = 'none';
        anchor.querySelector('.gitanchor-anchor-details-unknown').style.display = 'none';

        gitAnchorContract.getAnchor(anchor.value).then(function (value, err) {

            anchor.querySelector('.gitanchor-anchor-icon-status-pending').style.display = 'none';

            if (value[0].toNumber() !== 0) {
                anchor.querySelector('.gitanchor-anchor-icon-status-available').style.display = 'inline';
                anchor.querySelector('.gitanchor-anchor-details-available').style.display = 'block';

                let displayDate = new Date(value[0].toNumber() * 1000).toLocaleString(navigator.language, {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                });
                anchor.querySelector('.anchorAvailableDetailsText').innerHTML = 'This commit has been anchored on <strong class="signed-commit-verified-label">' + displayDate + '</strong>.';

            } else {
                anchor.querySelector('.gitanchor-anchor-icon-status-not-available').style.display = 'inline';
                anchor.querySelector('.gitanchor-anchor-details-not-available').style.display = 'block';
                anchor.querySelector('.gitanchor-anchor-details-create-anchor-button').addEventListener('click', async function (e) {

                    e.preventDefault();

                    anchor.querySelectorAll(".gitanchor-anchor-icon-status").forEach(element => {
                        element.style.display = 'none';
                    });
                    anchor.querySelector('.gitanchor-anchor-icon-status-pending').style.display = 'inline';
                    gitAnchorContract.setAnchor(anchor.value).then(tx => {
                        tx.wait().then(receipt => {
                            fetchAnchorFromBlockchain(anchor);
                        });
                    }).catch(error => {
                        anchor.querySelector('.gitanchor-anchor-icon-status-pending').style.display = 'none';
                        anchor.querySelector('.gitanchor-anchor-icon-status-not-available').style.display = 'inline';
                    });

                });
            }

        }).catch(function (err) {
            anchor.querySelector('.gitanchor-anchor-details-unknown').style.display = 'block';
            anchor.querySelector('.gitanchor-anchor-icon-status-pending').style.display = 'none';
            anchor.querySelector('.gitanchor-anchor-icon-status-unknown').style.display = 'inline';
        });
    }

    function checkInjection() {
        if (location.href.match(/.\/commits/)) {

            let clipboardCopyElements = document.querySelectorAll("li.Box-row clipboard-copy");
            for (let clipboardCopyElement of clipboardCopyElements) {
                let buttonGroupElement = clipboardCopyElement.closest('div.BtnGroup');

                if (!buttonGroupElement.classList.contains("gitanchor-commit-ui")) {
                    let gitAnchorCommitUi = htmlToElement(gitAnchorCommitUiHtml);
                    gitAnchorCommitUi.value = clipboardCopyElement.value;
                    buttonGroupElement.after(gitAnchorCommitUi);
                    buttonGroupElement.classList.add("gitanchor-commit-ui");
                    gitAnchorCommitUi.querySelector('.details-reset').id = 'gitanchor-commit-menu-'+gitAnchorCommitUi.value;
                    gitAnchorCommitUi.querySelector('.gitanchor-anchor-details-create-anchor-button').setAttribute('data-toggle-for', 'gitanchor-commit-menu-'+gitAnchorCommitUi.value);
                }

            }

            let branchSelectMenuElement = document.querySelector("div.file-navigation");
            if (!branchSelectMenuElement.classList.contains("gitanchor-wallet-ui")) {
                var gitAnchorWalletButton = htmlToElement(gitAnchorWalletButtonHtml);
                gitAnchorWalletButton.classList.add("gitanchor-wallet-disconnected");
                branchSelectMenuElement.appendChild(gitAnchorWalletButton);
                branchSelectMenuElement.appendChild(htmlToElement(gitAnchorBlockchainLabelHtml));
                branchSelectMenuElement.classList.add("gitanchor-wallet-ui");
                branchSelectMenuElement.classList.add("mb-3");
                branchSelectMenuElement.classList.add("d-flex");
                branchSelectMenuElement.classList.add("flex-items-start");
                branchSelectMenuElement.classList.add("flex-items-center");

                const providerOptions = {
                };

                web3Modal = new Web3Modal.default({
                    //network: "mainnet",
                    cacheProvider: true,
                    providerOptions
                });

                if (web3Modal.cachedProvider) {
                    connectWallet();
                }

                gitAnchorWalletButton.addEventListener('click', async function (e) {

                    e.preventDefault();

                    if (gitAnchorWalletButton.classList.contains("gitanchor-wallet-disconnected")) {
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
            checkInjection();
        }, debounceInterval);
    });

    observer.observe(document, { childList: true, subtree: true });

})();