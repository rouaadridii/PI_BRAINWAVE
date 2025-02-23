import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FrontHeaderAuthentificatedComponent } from './front-header-authentificated.component';

describe('FrontHeaderAuthentificatedComponent', () => {
  let component: FrontHeaderAuthentificatedComponent;
  let fixture: ComponentFixture<FrontHeaderAuthentificatedComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [FrontHeaderAuthentificatedComponent]
    });
    fixture = TestBed.createComponent(FrontHeaderAuthentificatedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
