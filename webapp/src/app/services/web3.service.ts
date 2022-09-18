import { Inject, Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { ethers } from "ethers";
import Web3Modal from "web3modal";

@Injectable({
  providedIn: 'root'
})
export class Web3Service {
  public accountsObservable = new Subject<string[]>();
  web3Modal: any;
  provider: any;
  signer: any;
  account: any;

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

  async connectAccount() {
    const instance = await this.web3Modal.connect();
    this.provider = new ethers.providers.Web3Provider(instance);
    this.signer = this.provider.getSigner();

    [this.account] = await this.provider.listAccounts();
    console.log(`Connected to ${this.account}`);
  }

}
