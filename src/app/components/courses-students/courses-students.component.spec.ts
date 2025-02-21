import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CoursesStudentsComponent } from './courses-students.component';

describe('CoursesStudentsComponent', () => {
  let component: CoursesStudentsComponent;
  let fixture: ComponentFixture<CoursesStudentsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CoursesStudentsComponent]
    });
    fixture = TestBed.createComponent(CoursesStudentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
