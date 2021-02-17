import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import {
  NbLayoutModule,
  NbChatModule,
  NbSpinnerModule,
  NbSelectModule,
  NbInputModule,
  NbCardModule,
  NbIconModule,
} from '@nebular/theme';
import { ChatbotComponent } from './chat/chat.component';

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
  exports: [
    NbLayoutModule,
    NbChatModule,
    NbSpinnerModule,
    NbSelectModule,
    NbInputModule,
    NbCardModule,
    NbIconModule,
    ChatbotComponent,
  ],
})
export class BotFormModule {}
