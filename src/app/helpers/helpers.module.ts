import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OnlynumberDirective } from './onlynumber.directive';
import { AlphabeticOnlyDirective } from './alphabetsonly.directive';



@NgModule({
  declarations: [
    OnlynumberDirective,
    AlphabeticOnlyDirective // ✅ declare here
  ],
  imports: [
    CommonModule
  ],
  exports: [
    OnlynumberDirective,
    AlphabeticOnlyDirective // ✅ export here so other modules can use it
  ]
})
export class HelpersModule { }
