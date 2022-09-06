# GitAnchor

## Introduction

With GitAnchor every Git (and GitHub) commit can be made permanent and proofable by anchoring it in the blockchain. Using smart contract technology anchors are immutable and therefore proof that a repository at any given commit state has existed at the time when the anchor was set.

A GitAnchor consist of the commit hash as well as the timestamp when the anchor was set and the wallet address of the person who was setting the anchor.

A Git commit hash is a SHA1 hash that among other data itself consists of several different hashes. Those contain the parent hash, which is a pointer to the parent of the current commit and the tree hash, which is a hash of the whole directory tree including all its files. 

GitAnchor therefore provides an easy and convenient way to proof existence of any kind of files in combination with all the versioning features that regular Git is offering. Its convenience is achieved by a set of seamlessly integrated tools.

## ETHOnline Hackathon

This is my contribution to the [ETHOnline Hackathon](https://online.ethglobal.com) taking place from September 2nd to 28th, 2022. 

**The documentation is always evolving during the event...**

## Plan of Action

### MVP for the Hackaton

- Define project name and project identity (logo, etc.)
- Ethereum blockchain anchoring
- Seamless GitHub UI integration using [Tampermonkey](https://www.tampermonkey.net)

### Possible Features

- Polygon blockchain support
- Optimism blockchain support
- Web app to set and verify anchors
- Commandline tool to set and verify anchors
- Integrate with [The Graph](https://thegraph.com/) to be able to link the emitted events on [Etherscan](https://etherscan.io)
- [Git Hooks](https://git-scm.com/book/en/v2/Customizing-Git-Git-Hooks) integration for the commandline tool
- [GitHub Actions](https://github.com/features/actions) integration

## Eat Your Own Dogfood

The first version of the contract is deployed on the Ethereum Görli Testnet at [0xC3524D9C7bb54929fd7049075Bc2fa05Ba96dF95](https://goerli.etherscan.io/address/0xC3524D9C7bb54929fd7049075Bc2fa05Ba96dF95). The commits of this repository will be periodically anchored during development.
