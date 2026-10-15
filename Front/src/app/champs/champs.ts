import { Component, Input, model } from '@angular/core';
import { ControlContainer, FormsModule, NgForm } from '@angular/forms';
import { EType } from '../models/e-type';

@Component({
  selector: 'app-champs',
  imports: [FormsModule],
  templateUrl: './champs.html',
  styleUrl: './champs.css',
  viewProviders: [{ provide: ControlContainer, useExisting: NgForm }],
})
export class Champs {
  @Input() type: EType = EType.TEXT;
  @Input({ required: true }) name!: string;
  @Input() label = '';

  value = model<string>('');

  protected readonly EType = EType;
}
