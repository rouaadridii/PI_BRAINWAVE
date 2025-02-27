import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { StudentQuizService } from 'src/app/services/student-quiz-service.service'; 
import { jsPDF } from 'jspdf';

@Component({
  selector: 'app-generate-certif',
  templateUrl: './generate-certif.component.html',
  styleUrls: ['./generate-certif.component.scss']
})
export class GenerateCertifComponent implements OnInit {
  studentId: number | null = null;
  studentName: string = '';
  studentSurname: string = '';

  constructor(
    private route: ActivatedRoute,
    private studentQuizService: StudentQuizService
  ) {}

  ngOnInit(): void {
    this.studentId = Number(this.route.snapshot.paramMap.get('id'));
    if (this.studentId !== null) {
      this.loadStudentData();
    }
  }

  loadStudentData(): void {
    this.studentQuizService.getStudentByCin(this.studentId!).subscribe((student) => {
      this.studentName = student.name;
      this.studentSurname = student.surname;
    });
  }

  generateCertificate(): void {
    if (!this.studentName || !this.studentSurname) {
      alert('Nom ou prénom de l\'étudiant manquant!');
      return;  // Assurez-vous que le nom et le prénom sont disponibles avant de générer le certificat.
    }

    const doc = new jsPDF();
    
    // Ajouter l'image de fond
    doc.addImage('/assets/certificate-background.jpg', 'JPEG', 0, 0, 210, 297);

    // Ajouter le texte (nom et prénom de l'utilisateur)
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(24);
    doc.text(`Certificate of Completion`, 105, 50, { align: 'center' });
    
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(20);
    doc.text(`Name: ${this.studentName} ${this.studentSurname}`, 105, 100, { align: 'center' });

    // Ajouter un bouton pour télécharger le PDF
    doc.save(`${this.studentName}_${this.studentSurname}_Certificate.pdf`);
  }
}
