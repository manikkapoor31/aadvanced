import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChatBoxComponent } from './chat-box/chat-box.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule } from '@angular/router';
import { ToastrService} from 'ngx-toastr' 

@NgModule({
  
  imports: [
    CommonModule,
    BrowserAnimationsModule,
    RouterModule.forChild([
      {path:'chat',component: ChatBoxComponent}
    ])
  ],
  declarations: [ChatBoxComponent]
})
export class ChatModule { }