import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser'; // Importez DomSanitizer et SafeResourceUrl
import { CoursesService } from 'src/app/services/courses.service';


@Component({
  selector: 'app-course-attachments-page',
  templateUrl: './course-attachments-page.component.html',
  styleUrls: ['./course-attachments-page.component.scss']
})
export class CourseAttachmentsPageComponent implements OnInit {

  courseId!: number;
  attachments: any[] = []; // Déclarez la propriété attachments

  constructor(
    private route: ActivatedRoute,
    private coursesService: CoursesService, // Injectez CoursesService
    private sanitizer: DomSanitizer // Injectez DomSanitizer
  ) { }

  ngOnInit(): void {
    const idCourseFromRoute = this.route.snapshot.paramMap.get('id');
    if (idCourseFromRoute) {
      this.courseId = Number(idCourseFromRoute);
      this.loadAttachments(); // Appelez loadAttachments ici
    } else {
      console.error('Course ID is missing in route parameters for CourseAttachmentsPageComponent');
    }
  }

  loadAttachments(): void { // Copiez et adaptez loadAttachments de AttachmentComponent
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

  getPdfUrl(pdfName: string): SafeResourceUrl { // Copiez et adaptez getPdfUrl de AttachmentComponent
    const url = `http://localhost:8087/cours/attachments/download-file/${pdfName}`;
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  getImageUrl(imageName: string): string { // Copiez et adaptez getImageUrl de AttachmentComponent
    return `http://localhost:8087/cours/attachments/download-file/${imageName}`;
  }

  getVideoUrl(videoUrl: string): SafeResourceUrl { // Copiez et adaptez getVideoUrl de AttachmentComponent
    return this.sanitizer.bypassSecurityTrustResourceUrl(videoUrl);
  }

}