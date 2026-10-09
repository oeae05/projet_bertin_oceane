import { Component, inject, signal } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Champs } from '../champs/champs';
import { EType } from '../models/e-type';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-connexion',
  imports: [FormsModule, Champs, RouterLink],
  templateUrl: './connexion.html',
  // même mise en page que l'inscription
  styleUrl: '../sign-up/sign-up.css',
})
export class Connexion {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly EType = EType;
  protected readonly erreur = signal('');

  identifiants = {
    login: '',
    motDePasse: '',
  };

  async onSubmit(form: NgForm): Promise<void> {
    if (form.invalid) {
      return;
    }
    try {
      await this.auth.connecter(this.identifiants.login, this.identifiants.motDePasse);
      await this.router.navigateByUrl('/declarations');
    } catch (e) {
      this.erreur.set((e as Error).message);
    }
  }
}
