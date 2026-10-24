import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../services/auth.service';

// Mise en page des pages réservées aux personnes connectées
@Component({
  selector: 'app-espace',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './espace.html',
  styleUrl: './espace.css',
})
export class Espace {
  private readonly router = inject(Router);
  protected readonly auth = inject(AuthService);

  async deconnecter(): Promise<void> {
    this.auth.deconnecter();
    await this.router.navigateByUrl('/connexion');
  }
}
