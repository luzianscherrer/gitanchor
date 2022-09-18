import { Inject, Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { ethers } from "ethers";
import Web3Modal from "web3modal";

@Injectable({
  providedIn: 'root'
})
export class Web3Service {
  public accountObservable = new Subject<string>();
  web3Modal: any;
  connection: any;
  provider: any;
  signer: any;
  account: any;
  network: any;

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
    this.accountObservable.next(this.account);
    if(this.account) {
      console.log(`Connected to ${this.account} (${this.network.name})`);
    } else {
      console.log(`Not connected`);
    }
    
  }

  async connectAccount() {

    if(this.connection) return;

    this.connection = await this.web3Modal.connect();

    this.connection.on("accountsChanged", (accounts: any) => {
      console.log('accountsChanged', accounts);
      this.updateConnectionState();
    });

    this.connection.on("chainChanged", (chainId: any) => {
      console.log('chainChanged', chainId);
      this.updateConnectionState();
    });

    this.connection.on("connect", (info: any) => {
      console.log('connect', info);
    });

    this.connection.on("disconnect", (error: any) => {
      console.log('disconnect', error);
      this.updateConnectionState();
    });

    this.updateConnectionState();
  }

}
