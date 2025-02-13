import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CoursesService } from 'src/app/services/courses.service';

@Component({
  selector: 'app-teacher-courses',
  templateUrl: './teacher-courses.component.html',
  styleUrls: ['./teacher-courses.component.scss']
})
export class TeacherCoursesComponent implements OnInit {
  courseForm!: FormGroup;
  categories: string[] = [];
  selectedFile!: File;

  constructor(
    private fb: FormBuilder,
    private courseService: CoursesService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadCategories();
  }

  initForm() {
    this.courseForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', [Validators.required, Validators.minLength(10)]],
      date: ['', Validators.required],
      level: ['', Validators.required],
      status: [false],
      price: [0, [Validators.required, Validators.min(0)]],
      liked: [false],
      categorie: ['', Validators.required],
      picture: ['']
    });
  }

  loadCategories() {
    this.courseService.getCategories().subscribe(data => {
      this.categories = data;
    });
  }

  onFileSelected(event: any) {
    if (event.target.files.length > 0) {
      this.selectedFile = event.target.files[0];
    }
  }

  onSubmit() {
    if (this.courseForm.invalid) {
      alert('Veuillez remplir tous les champs obligatoires.');
      return;
    }

    const formData = new FormData();
    formData.append('title', this.courseForm.get('title')?.value);
    formData.append('description', this.courseForm.get('description')?.value);
    formData.append('date', this.courseForm.get('date')?.value);
    formData.append('level', this.courseForm.get('level')?.value);
    formData.append('status', this.courseForm.get('status')?.value);
    formData.append('price', this.courseForm.get('price')?.value);
    formData.append('liked', this.courseForm.get('liked')?.value);
    formData.append('categorie', this.courseForm.get('categorie')?.value);

    if (this.selectedFile) {
      formData.append('image', this.selectedFile);
    }

    this.courseService.createCourse(formData).subscribe(
      (response) => {
        console.log('Cours ajouté:', response);
        alert('Cours ajouté avec succès.');
        this.router.navigate(['/courses-list']);
      },
      (error) => {
        console.error('Erreur:', error);
        alert('Une erreur est survenue.');
      }
    );
  }
}
