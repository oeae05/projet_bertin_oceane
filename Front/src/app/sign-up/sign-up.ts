import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule, NgForm } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
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
  private readonly destroyRef = inject(DestroyRef);

  protected readonly EType = EType;
  protected readonly erreurServeur = signal('');
  protected readonly enCours = signal(false);

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
    if (form.invalid || this.motsDePasseDifferents || this.enCours()) {
      return;
    }
    this.erreurServeur.set('');
    this.enCours.set(true);
    const { confirmation, ...inscription } = this.user;
    this.auth
      .inscrire(inscription)
      .pipe(
        finalize(() => this.enCours.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: () => this.router.navigateByUrl('/declarations'),
        error: (e: Error) => this.erreurServeur.set(e.message),
      });
  }
}
