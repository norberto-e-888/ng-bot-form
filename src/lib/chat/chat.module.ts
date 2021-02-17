import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import {
  NbCardModule,
  NbChatModule,
  NbIconModule,
  NbInputModule,
  NbLayoutModule,
  NbSelectModule,
  NbSpinnerModule,
} from '@nebular/theme';
import { ChatbotComponent } from './chat.component';

@NgModule({
  declarations: [ChatbotComponent],
  imports: [
    NbLayoutModule,
    NbChatModule,
    NbSpinnerModule,
    NbSelectModule,
    NbInputModule,
    NbCardModule,
    NbIconModule,
    BrowserModule,
    FormsModule,
  ],
  exports: [ChatbotComponent],
})
export class ChatModule {}
