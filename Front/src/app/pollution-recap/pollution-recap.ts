import { DatePipe, DecimalPipe } from '@angular/common';
import { Component, Input, output, signal } from '@angular/core';
import { Carte } from '../carte/carte';
import { Pollution } from '../models/pollution';

@Component({
  selector: 'app-pollution-recap',
  imports: [DatePipe, DecimalPipe, Carte],
  templateUrl: './pollution-recap.html',
  styleUrl: './pollution-recap.css',
})
export class PollutionRecap {
  private _pollution!: Pollution;

  @Input({ required: true })
  set pollution(valeur: Pollution) {
    this._pollution = valeur;
    // nouvelle déclaration affichée : on retente le chargement de la photo
    this.photoEnErreur.set(false);
  }
  get pollution(): Pollution {
    return this._pollution;
  }

  @Input() message = 'Déclaration enregistrée, merci pour ton signalement !';

  readonly nouvelle = output<void>();

  protected readonly photoEnErreur = signal(false);
}
