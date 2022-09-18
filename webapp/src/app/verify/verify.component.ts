import { Component, OnInit } from '@angular/core';
import { Web3Service } from "../services/web3.service";

@Component({
  selector: 'app-verify',
  templateUrl: './verify.component.html',
  styleUrls: ['./verify.component.css']
})
export class VerifyComponent implements OnInit {
  walletButtonTitle: string;
  walletConnectionDisplay: string;
  connected = false;

  constructor(private web3: Web3Service) { 
    this.walletButtonTitle = 'Connect wallet';
    this.walletConnectionDisplay = 'Not connected';

    web3.connectionObservable.subscribe({
      next: (connected) => { 
        console.log(`Connection observer: ${connected}`);
        this.connected = connected;
        if(this.connected) {
          this.walletButtonTitle = 'Disconnect wallet';
          this.walletConnectionDisplay = `Connected to ${this.truncateEthereumAddress(this.web3.account)} (Chain Id ${this.web3.network.chainId})`;
        } else {
          this.walletButtonTitle = 'Connect wallet';
          this.walletConnectionDisplay = 'Not connected';
        }
      }
    });    
  }

  ngOnInit(): void {
  }

  truncateEthereumAddress(address: string) {
    if (address.length <= 12) return address;
    return address.substr(0, 5) + '...' + address.substr(address.length - 4);
  };
  
  walletAction() {
    if(this.connected) {
      this.web3.disconnectAccount();
    } else {
      this.web3.connectAccount();
    }
  }

  verifyAction() {
    console.log('Verify');
  }

  createAction() {
    console.log('Create');
  }

}
