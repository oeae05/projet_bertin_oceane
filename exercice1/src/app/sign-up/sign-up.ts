import { Component } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { Champs } from '../champs/champs';
import { EType } from '../EType';

@Component({
  selector: 'app-sign-up',
  imports: [FormsModule, Champs],
  templateUrl: './sign-up.html',
  styleUrl: './sign-up.css',
})
export class SignUp {
  protected readonly EType = EType;

  user = {
    login: '',
    motDePasse: '',
    confirmation: '',
    nom: '',
    prenom: '',
    email: '',
  };

  get motsDePasseDifferents(): boolean {
    return this.user.confirmation !== '' && this.user.motDePasse !== this.user.confirmation;
  }

  onSubmit(form: NgForm): void {
    if (form.invalid || this.motsDePasseDifferents) {
      return;
    }
    console.log('Inscription :', this.user);
  }
}
