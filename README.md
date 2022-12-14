# GitAnchor

## Introduction

With GitAnchor every Git (and GitHub) commit can be made permanent and provable by anchoring it in the blockchain. The smart contract based anchors are immutable and therefore proof that a repository at any given commit state has existed at the time when the anchor was set.

A GitAnchor consist of the commit hash as well as the timestamp when the anchor was set and the wallet address (EOA) of the person who was setting the anchor.

A Git commit hash is a SHA1 hash that among other data itself consists of several different hashes. Those contain the parent hash, which is a pointer to the parent of the current commit, and the tree hash, which is a hash of the whole directory tree including all its files. 

GitAnchor therefore provides an easy and convenient way to proof the existence of any kind of files in combination with all the versioning features that regular Git is offering. Its convenience is achieved by a set of seamlessly integrated tools, consisting of a GitHub browser plugin, a command line interface and the GitAnchor webapp.

## ETHOnline Hackathon

This is my contribution to the [ETHOnline Hackathon](https://online.ethglobal.com) taking place from September 2nd to 28th, 2022. For more information visit the [GitAnchor ETHOnline Project Page](https://ethglobal.com/showcase/gitanchor-kag9g).

## Components

### GitHub Browser Plugin

![Screenshot of the Github Plug-In](/assets/screenshots/github-plugin.png?raw=true "Github plug-in connected to Ethereum Goerli")

### Command Line Interface (CLI)

```
Usage: gitanchor [options] [command]

CLI to create or verify blockchain anchors

Options:
  -V, --version            output the version number
  -d, --debug              output extra debugging in case of errors
  -h, --help               display help for command

Commands:
  verify [options] [hash]  verify anchor for hash
  create [options] [hash]  create anchor for hash
  newwallet                create a new wallet
  help [command]           display help for command
```

#### Git Hooks Integration

The CLI can easily be integrated with [Git Hooks](https://git-scm.com/book/en/v2/Customizing-Git-Git-Hooks). Example `.git/hooks/post-commit`:

```
#!/bin/sh
gitanchor create --latest
```

### Web Application

A [live demo](https://luzianscherrer.github.io/gitanchor) is deployed on GitHub Pages.

![Screenshot of the GitAnchor webapp](/assets/screenshots/webapp.png?raw=true "GitAnchor webapp")

## Supported Blockchains

| Blockchain | Purpose | Type | Contract Address |
|-|-|-|-|
| Ethereum Goerli | Testing | Layer 1 | [0x65438AaA54141dD923C5F51E81d1aaD11daF3558](https://goerli.etherscan.io/address/0x65438AaA54141dD923C5F51E81d1aaD11daF3558#code)
| Cronos Testnet | Testing | Layer 1 | [0x65438AaA54141dD923C5F51E81d1aaD11daF3558](https://testnet.cronoscan.com/address/0x65438AaA54141dD923C5F51E81d1aaD11daF3558#code)
| Polygon Mumbai | Testing | Layer 2 | [0x65438AaA54141dD923C5F51E81d1aaD11daF3558](https://mumbai.polygonscan.com/address/0x65438AaA54141dD923C5F51E81d1aaD11daF3558#code)
| Optimism Goerli | Testing | Layer 2 | [0x65438AaA54141dD923C5F51E81d1aaD11daF3558](https://goerli-optimism.etherscan.io/address/0x65438AaA54141dD923C5F51E81d1aaD11daF3558#code)

## Plan of Action

### MVP for the Hackaton

- [x] Define project name and project identity (logo, etc.)
- [x] Ethereum blockchain anchoring
- [x] Seamless GitHub UI integration using [Tampermonkey](https://www.tampermonkey.net)

### Possible Features

- [x] Polygon blockchain support
- [x] Optimism blockchain support
- [x] Cronos blockchain support
- [x] Web app to set and verify anchors
- [x] Commandline tool to set and verify anchors
- [ ] ~~Integrate with [The Graph](https://thegraph.com/) to be able to link the emitted events on [Etherscan](https://etherscan.io)~~ Not needed, can be accomplished with regular logs and indexes
- [x] [Git Hooks](https://git-scm.com/book/en/v2/Customizing-Git-Git-Hooks) integration for the commandline tool
- [ ] ~~[GitHub Actions](https://github.com/features/actions) integration~~ Not needed, can be accomplished with Git Hooks

## Eat Your Own Dogfood

The first version of the contract was deployed on Ethereum Goerli at [0xC3524D9C7bb54929fd7049075Bc2fa05Ba96dF95](https://goerli.etherscan.io/address/0xC3524D9C7bb54929fd7049075Bc2fa05Ba96dF95). The current versions of the contracts are listed above. The commits of this repository are be periodically anchored during development.
