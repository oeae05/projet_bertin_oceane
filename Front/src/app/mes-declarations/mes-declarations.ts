import { DatePipe } from '@angular/common';
import { Component, Input, output } from '@angular/core';
import { Declaration } from '../models/pollution';

@Component({
  selector: 'app-mes-declarations',
  imports: [DatePipe],
  templateUrl: './mes-declarations.html',
  styleUrl: './mes-declarations.css',
})
export class MesDeclarations {
  @Input({ required: true }) declarations: Declaration[] = [];
  @Input() selection: string | null = null;

  readonly voir = output<Declaration>();
  readonly supprimer = output<Declaration>();
}
