import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AttachementService } from 'src/app/services/attachement.service';

@Component({
  selector: 'app-add-details-course',
  templateUrl: './add-details-course.component.html',
  styleUrls: ['./add-details-course.component.scss']
})
export class AddDetailsCourseComponent implements OnInit{


  idCourse!: number;
  attachments: any[] = [];
  chapterTitle = '';
  pdf!: File;
  picture!: File;
  video!: File;

  constructor(
    private route: ActivatedRoute,
    private attachmentService: AttachementService
  ) {}

  ngOnInit(): void {
    this.idCourse = Number(this.route.snapshot.paramMap.get('id'));
    this.loadAttachments();
  }

  loadAttachments() {
    this.attachmentService.getAttachmentsByCourse(this.idCourse).subscribe(data => {
      this.attachments = data;
    });
  }

  onFileSelected(event: any, type: string) {
    if (event.target.files.length > 0) {
      if (type === 'pdf') this.pdf = event.target.files[0];
      if (type === 'picture') this.picture = event.target.files[0];
      if (type === 'video') this.video = event.target.files[0];
    }
  }

  addAttachment() {
    const formData = new FormData();
    formData.append('chapterTitle', this.chapterTitle);
    if (this.pdf) formData.append('pdf', this.pdf);
    if (this.picture) formData.append('picture', this.picture);
    if (this.video) formData.append('video', this.video);

    this.attachmentService.addAttachment(this.idCourse, formData).subscribe(() => {
      alert('Détail ajouté avec succès !');
      this.loadAttachments();
    });
  }

}
