import { Component } from '@angular/core';
import { SignUp } from './sign-up/sign-up';

@Component({
  selector: 'app-root',
  imports: [SignUp],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {}
