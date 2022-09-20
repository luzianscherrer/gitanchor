import { Component, OnInit, Input } from '@angular/core';
import { Web3Service } from "../services/web3.service";

@Component({
  selector: 'app-anchor',
  templateUrl: './anchor.component.html',
  styleUrls: ['./anchor.component.css']
})
export class AnchorComponent implements OnInit {
  walletButtonTitle: string;
  walletConnectionDisplay: string;
  connected = false;
  statusDisplay = 'Please enter a hash';
  @Input() hash?: string;
  isRunning = false;

  constructor(private web3: Web3Service) { 
    this.walletButtonTitle = 'Connect wallet';
    this.walletConnectionDisplay = 'Not connected';

    web3.connectionObservable.subscribe({
      next: (connected) => { 
        console.log(`Connection observer: ${connected}`);
        this.connected = connected;
        if(this.connected) {
          this.walletButtonTitle = 'Disconnect wallet';
          this.walletConnectionDisplay = `${this.truncateEthereumAddress(this.web3.account)} (Chain Id ${this.web3.network.chainId})`;
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
    if(this.hash) {
      this.isRunning = true;
      this.statusDisplay = 'Querying the blockchain...';
      console.log('Verify', this.hash);
      let that = this;
      this.web3.verifyAnchor(this.hash).subscribe(
        anchor => {
          this.isRunning = false;
          if(anchor.timestamp === 0) {
            that.statusDisplay = `The hash ${that.hash} is not anchored`;
          } else {
            that.statusDisplay = `The hash ${that.hash} has been anchored on ${new Date(anchor.timestamp*1000)}`;
          }
        },
        error => {
          this.isRunning = false;
          that.statusDisplay = `The transaction has failed`;
        }
      );  
    }
  }

  createAction() {
    if(this.hash) {
      this.isRunning = true;
      this.statusDisplay = 'Waiting for the transaction to complete...';
      console.log('Create', this.hash);
      let that = this;
      this.web3.createAnchor(this.hash).subscribe(
        result => {
          this.isRunning = false;
          that.statusDisplay = `The hash ${that.hash} has been anchored with transaction ${result}`;
        },
        error => {
          this.isRunning = false;
          that.statusDisplay = `The transaction has failed`;
        }
      );  
    }
  }

}
