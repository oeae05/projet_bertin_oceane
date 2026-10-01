import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NgForm } from '@angular/forms';

import { Champs } from './champs';

describe('Champs', () => {
  let component: Champs;
  let fixture: ComponentFixture<Champs>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Champs],
      providers: [NgForm],
    })
    .compileComponents();

    fixture = TestBed.createComponent(Champs);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('name', 'login');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
