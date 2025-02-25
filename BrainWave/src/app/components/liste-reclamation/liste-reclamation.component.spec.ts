import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListeReclamationComponent } from './liste-reclamation.component';

describe('ListeReclamationComponent', () => {
  let component: ListeReclamationComponent;
  let fixture: ComponentFixture<ListeReclamationComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ListeReclamationComponent]
    });
    fixture = TestBed.createComponent(ListeReclamationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
