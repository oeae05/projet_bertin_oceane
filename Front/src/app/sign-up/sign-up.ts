import { Component, inject, signal } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Champs } from '../champs/champs';
import { EType } from '../models/e-type';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-sign-up',
  imports: [FormsModule, Champs, RouterLink],
  templateUrl: './sign-up.html',
  styleUrl: './sign-up.css',
})
export class SignUp {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly EType = EType;
  protected readonly erreurServeur = signal('');

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

  async onSubmit(form: NgForm): Promise<void> {
    if (form.invalid || this.motsDePasseDifferents) {
      return;
    }
    try {
      await this.auth.inscrire(this.user);
      await this.router.navigateByUrl('/declarations');
    } catch (e) {
      this.erreurServeur.set((e as Error).message);
    }
  }
}
