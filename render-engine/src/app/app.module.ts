import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { WorkAreaComponent } from './components/work-area/work-area.component';
import { SharedModule } from './shared-module/shared.module';

@NgModule({
  declarations: [
    AppComponent,
    WorkAreaComponent
  ],
  imports: [
    BrowserModule,
    SharedModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
