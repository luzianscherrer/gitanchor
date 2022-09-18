import { Component, OnInit } from '@angular/core';
import { Web3Service } from "../services/web3.service";

@Component({
  selector: 'app-verify',
  templateUrl: './verify.component.html',
  styleUrls: ['./verify.component.css']
})
export class VerifyComponent implements OnInit {
  walletButtonTitle: string;

  constructor(private web3: Web3Service) { 
    this.walletButtonTitle = 'Connect wallet';

    web3.accountObservable.subscribe({
      next: (v) => { 
        console.log(`Account observer: ${v}`);
        this.walletButtonTitle = v ? `Connected to ${this.truncateEthereumAddress(v)}` : 'Connect wallet';
      }
    });    
  }

  ngOnInit(): void {
  }

  truncateEthereumAddress(address: string) {
    if (address.length <= 12) return address;
    return address.substr(0, 5) + '...' + address.substr(address.length - 4);
  };

  connectWallet() {
    this.web3.connectAccount();
  }

}
