import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChatBoxComponent } from './chat-box/chat-box.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule,Routes } from '@angular/router';
import { ToastrModule} from 'ngx-toastr' 

@NgModule({
  
  imports: [
    CommonModule,
    BrowserAnimationsModule,
    ToastrModule.forRoot(),
    RouterModule.forChild([
      {path:'chat',component: ChatBoxComponent}
    ])
  ],
  declarations: [ChatBoxComponent]
})
export class ChatModule { }
