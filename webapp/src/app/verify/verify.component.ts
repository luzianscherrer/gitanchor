import { Component, OnInit } from '@angular/core';
import { Web3Service } from "../services/web3.service";

@Component({
  selector: 'app-verify',
  templateUrl: './verify.component.html',
  styleUrls: ['./verify.component.css']
})
export class VerifyComponent implements OnInit {

  constructor(private web3: Web3Service) { }

  ngOnInit(): void {
  }

  Connect() {
    this.web3.connectAccount();
  }

}
