import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddCourseAdminComponent } from './add-course-admin.component';

describe('AddCourseAdminComponent', () => {
  let component: AddCourseAdminComponent;
  let fixture: ComponentFixture<AddCourseAdminComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AddCourseAdminComponent]
    });
    fixture = TestBed.createComponent(AddCourseAdminComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
