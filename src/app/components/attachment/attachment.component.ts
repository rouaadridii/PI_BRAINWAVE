import { Component, Input, OnInit } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { CoursesService } from 'src/app/services/courses.service';

@Component({
  selector: 'app-attachment',
  templateUrl: './attachment.component.html',
  styleUrls: ['./attachment.component.scss']
})
export class AttachmentComponent implements OnInit {

  @Input() courseId!: number;
  attachments: any[] = [];

  constructor(
    private coursesService: CoursesService,
    private sanitizer: DomSanitizer
  ) { }

  ngOnInit(): void {
    if (!this.courseId) {
      console.error('Course ID is required for AttachmentComponent - Course ID is undefined!');
      return; // Exit early if courseId is missing
    }
    if (typeof this.courseId !== 'number') {
      console.error('Course ID is required for AttachmentComponent - Course ID is not a number:', this.courseId);
      return; // Exit early if courseId is not a number
    }
    this.loadAttachments();
  }

  loadAttachments(): void {
    this.coursesService.getAttachmentsByCourseId(this.courseId).subscribe(
      (data: any[]) => {
        this.attachments = data;
        console.log('Attachments loaded:', this.attachments);
      },
      (error) => {
        console.error('Error loading attachments:', error);
      }
    );
  }

  reloadAttachments(): void {
    this.loadAttachments();
  }

  getPdfUrl(pdfName: string): SafeResourceUrl {
    const url = `http://localhost:8087/cours/attachments/download-file/${pdfName}`;
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  getImageUrl(imageName: string): string {
    return `http://localhost:8087/cours/attachments/download-file/${imageName}`;
  }

  getVideoUrl(videoUrl: string): SafeResourceUrl {
    return this.sanitizer.bypassSecurityTrustResourceUrl(videoUrl);
  }}
