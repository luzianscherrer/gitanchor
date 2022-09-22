import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AnchorComponent } from './anchor/anchor.component';

const routes: Routes = [
  { path: '', component: AnchorComponent },
  { path: ':hash', component: AnchorComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
