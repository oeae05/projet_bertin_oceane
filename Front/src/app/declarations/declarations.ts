import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { MesDeclarations } from '../mes-declarations/mes-declarations';
import { Declaration, Pollution } from '../models/pollution';
import { PollutionForm } from '../pollution-form/pollution-form';
import { PollutionRecap } from '../pollution-recap/pollution-recap';
import { AuthService } from '../services/auth.service';
import { PollutionService } from '../services/pollution.service';

@Component({
  selector: 'app-declarations',
  imports: [PollutionForm, PollutionRecap, MesDeclarations],
  templateUrl: './declarations.html',
  styleUrl: './declarations.css',
})
export class Declarations {
  private readonly router = inject(Router);
  protected readonly auth = inject(AuthService);
  protected readonly pollutions = inject(PollutionService);

  // Déclaration affichée dans le récapitulatif (null = formulaire visible)
  protected readonly selection = signal<Declaration | null>(null);
  protected readonly message = signal('');

  onDeclaration(pollution: Pollution): void {
    this.selection.set(this.pollutions.declarer(pollution));
    this.message.set('Déclaration enregistrée, merci pour ton signalement !');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  voir(declaration: Declaration): void {
    this.selection.set(declaration);
    const le = new Date(declaration.dateCreation).toLocaleDateString('fr-FR');
    this.message.set(`Déclarée le ${le}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  supprimer(declaration: Declaration): void {
    if (!confirm(`Supprimer la déclaration « ${declaration.titre} » ?`)) {
      return;
    }
    this.pollutions.supprimer(declaration.id);
    if (this.selection()?.id === declaration.id) {
      this.selection.set(null);
    }
  }

  nouvelleDeclaration(): void {
    this.selection.set(null);
  }

  async deconnecter(): Promise<void> {
    this.auth.deconnecter();
    await this.router.navigateByUrl('/connexion');
  }
}
