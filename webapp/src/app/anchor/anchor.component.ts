import { Component, OnInit, Input } from '@angular/core';
import { Web3Service } from "../services/web3.service";
import { Anchor } from '../anchor';
import { Blockchain } from '../blockchain';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-anchor',
  templateUrl: './anchor.component.html',
  styleUrls: ['./anchor.component.css']
})
export class AnchorComponent implements OnInit {
  walletButtonTitle: string;
  connected = false;
  statusDisplay = 'Please enter a hash to verify or create an anchor on the blockchain';
  @Input() hash?: string;
  isRunning = false;
  anchor?: Anchor;
  createTransaction?: string;
  walletAddress?: string;
  blockchain?: Blockchain;

  constructor(private route: ActivatedRoute, private web3: Web3Service) { 

    this.walletButtonTitle = 'Connect wallet';

    web3.connectionObservable.subscribe({
      next: (connected) => { 
        this.connected = connected;
        if(this.connected) {
          this.walletButtonTitle = 'Disconnect wallet';
          this.walletAddress = this.truncateEthereumAddress(this.web3.account);
          this.blockchain = this.web3.blockchain;
        } else {
          this.walletButtonTitle = 'Connect wallet';
          this.walletAddress = undefined;
          this.blockchain = undefined;
        }
      }
    });    
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.hash = params['hash'];
    });
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

  clearState() {
    this.anchor = undefined;
    this.createTransaction = undefined;
  }

  verifyAction() {
    if(this.hash) {
      this.isRunning = true;
      this.clearState();
      this.statusDisplay = 'Querying the blockchain...';
      let that = this;
      this.web3.verifyAnchor(this.hash).subscribe(
        anchor => {
          this.isRunning = false;
          if(anchor.timestamp === 0) {
            that.statusDisplay = `The hash ${that.hash} is not anchored`;
          } else {
            that.anchor = anchor;
            that.statusDisplay = `The hash ${that.hash} has been anchored`;
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
      this.clearState();
      this.anchor = undefined;
      this.statusDisplay = 'Waiting for the transaction to complete...';
      let that = this;
      this.web3.createAnchor(this.hash).subscribe(
        result => {
          this.isRunning = false;
          if(typeof result === "string") {
            that.statusDisplay = `The hash ${that.hash} has successfully been anchored`;
            that.createTransaction = result;
          } else {
            that.anchor = result;
            that.statusDisplay = `The hash ${that.hash} has already been anchored`;
          }

        },
        error => {
          this.isRunning = false;
          that.statusDisplay = `The transaction has failed`;
        }
      );  
    }
  }

}
