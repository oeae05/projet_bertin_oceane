import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule, NgForm } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
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
  private readonly destroyRef = inject(DestroyRef);

  protected readonly EType = EType;
  protected readonly erreur = signal('');
  protected readonly enCours = signal(false);

  identifiants = {
    login: '',
    motDePasse: '',
  };

  onSubmit(form: NgForm): void {
    if (form.invalid || this.enCours()) {
      return;
    }
    this.erreur.set('');
    this.enCours.set(true);
    this.auth
      .connecter(this.identifiants.login, this.identifiants.motDePasse)
      .pipe(
        finalize(() => this.enCours.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: () => this.router.navigateByUrl('/pollutions'),
        error: (e: Error) => this.erreur.set(e.message),
      });
  }
}
