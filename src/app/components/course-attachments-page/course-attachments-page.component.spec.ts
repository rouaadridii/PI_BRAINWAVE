import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CourseAttachmentsPageComponent } from './course-attachments-page.component';

describe('CourseAttachmentsPageComponent', () => {
  let component: CourseAttachmentsPageComponent;
  let fixture: ComponentFixture<CourseAttachmentsPageComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CourseAttachmentsPageComponent]
    });
    fixture = TestBed.createComponent(CourseAttachmentsPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
