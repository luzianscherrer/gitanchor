import { Injectable } from '@angular/core';
import { Subject, Observable, of } from 'rxjs';
import { ethers } from "ethers";
import Web3Modal from "web3modal";
import { Anchor } from '../anchor';
import { Blockchain } from '../blockchain';

const CONTRACT_ADDRESS = '0x65438AaA54141dD923C5F51E81d1aaD11daF3558';
const BLOCKCHAINS = [
    { id: 5,      name: 'Ethereum Goerli',  explorer: 'https://goerli.etherscan.io',           coinSymbol: 'ETH',    geckoApiId: 'ethereum'},
    { id: 80001,  name: 'Polygon Mumbai',   explorer: 'https://mumbai.polygonscan.com',        coinSymbol: 'MATIC',  geckoApiId: 'matic-network'},
    { id: 338,    name: 'Cronos testnet',   explorer: 'https://testnet.cronoscan.com',         coinSymbol: 'CRO',    geckoApiId: 'crypto-com-chain'},
    { id: 420,    name: 'Optimism Goerli',  explorer: 'https://goerli-optimism.etherscan.io',  coinSymbol: 'ETH',    geckoApiId: 'ethereum'}
];
const CONTRACT_ABI = [
    "function getAnchor(string memory anchorHash) public view returns (uint256, address)",
    "function setAnchor(string memory anchorHash) public",
    "event Anchored(string indexed anchorHashIndexed, string anchorHashReadable, uint256 indexed anchorTimestamp, address indexed anchorOrigin)"
];

@Injectable({
  providedIn: 'root'
})
export class Web3Service {
  public connectionObservable = new Subject<boolean>();
  web3Modal: any;
  connection: any;
  provider: any;
  signer: any;
  account: any;
  network: any;
  contract: any;
  blockchain?: Blockchain;

  constructor() { 
    const providerOptions = { };

    this.web3Modal = new Web3Modal({
      cacheProvider: true,
      providerOptions
    });

    if(this.web3Modal.cachedProvider) {
      this.connectAccount();
   }

  }

  async updateConnectionState() {
    this.provider = new ethers.providers.Web3Provider(this.connection);
    this.signer = this.provider.getSigner();
    [this.account] = await this.provider.listAccounts();
    this.network = await this.provider.getNetwork();
    this.contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, this.signer);
    if(this.account) {
      const chain = BLOCKCHAINS.find((chain) => chain.id === Number(this.network.chainId));
      if(chain) {
        this.blockchain = chain;
      } else {
        this.blockchain = { id: 0, name: 'Unsupported network', explorer: '', coinSymbol: '', geckoApiId: ''};
      }
      this.connectionObservable.next(true);
    } else {
      this.blockchain = undefined;
      this.connectionObservable.next(false);
    }
    
  }

  async disconnectAccount() {
    this.web3Modal.clearCachedProvider();
    this.connectionObservable.next(false);
  }

  async connectAccount() {
    this.connection = await this.web3Modal.connect();

    this.connection.on("accountsChanged", (accounts: any) => {
      this.updateConnectionState();
    });

    this.connection.on("chainChanged", (chainId: any) => {
      this.updateConnectionState();
    });

    this.connection.on("connect", (info: any) => {
    });

    this.connection.on("disconnect", (error: any) => {
      this.updateConnectionState();
    });

    this.updateConnectionState();
  }

  verifyAnchor(hash: string): Observable<Anchor> {
    return new Observable(subscriber => {
      let that = this;
      this.contract.getAnchor(hash).then(function(value:any) {   
        let anchor: Anchor = { timestamp: value[0].toNumber()*1000, creator: value[1] };      

        that.contract.queryFilter(that.contract.filters.Anchored(hash), 0).then(function(values: any) {
          let event = values[0];
          anchor.explorerLink = `${that.blockchain?.explorer.replace(/\/$/, '') }/tx/${event.transactionHash}#eventlog`
          subscriber.next(anchor);
        }).catch(function(error:any) {
          subscriber.next(anchor);
        });

      }).catch(function(error:any) {
        subscriber.error(error);
      });  
    });
  }

  createAnchor(hash: string): Observable<any> {
    return new Observable(subscriber => {

      let that = this;
      this.contract.getAnchor(hash).then(function(value:any) {   
        let anchor: Anchor = { timestamp: value[0].toNumber()*1000, creator: value[1] };  
        if(anchor.timestamp !== 0) {
          subscriber.next(anchor); 
        } else {

          that.contract.setAnchor(hash).then(function(tx:any) {
            tx.wait().then(function(receipt:any) {
              subscriber.next(receipt.transactionHash);   
            })
          }).catch(function(error:any) {
            subscriber.error(error);   
          });    

        }
      }).catch(function(error:any) {
        subscriber.error(error);
      });  

    });
  }

}
