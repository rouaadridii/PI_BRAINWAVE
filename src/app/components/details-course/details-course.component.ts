import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Attachment } from 'src/app/Core/Model/Attachment';
import { Course } from 'src/app/Core/Model/Course';
import { Review } from 'src/app/Core/Model/Review';
import { AttachmentService } from 'src/app/Core/services/attachement.service';
import { CoursesService } from 'src/app/Core/services/courses.service';
import { ReviewService } from 'src/app/Core/services/review.service';
import Swal from 'sweetalert2';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser'; // Importez DomSanitizer et SafeResourceUrl


@Component({
    selector: 'app-details-course',
    templateUrl: './details-course.component.html',
    styleUrls: ['./details-course.component.scss']
})
export class DetailsCourseComponent implements OnInit {
    course!: Course;
    reviews: Review[] = [];
    averageRating: number = 0;
    newReview: Review = { rating: 1, comment: '' };
    attachments: Attachment[] = [];
    courseScore: number = 0;
    allAttachmentsValidated: boolean = false;
    pdfUrl: SafeResourceUrl | null = null; // Utilisez SafeResourceUrl
    hoveredStar: number = 0;
    viewedAttachmentId: number | null = null; // Gardez une trace de l'attachement actuellement visualisé


    constructor(
        private route: ActivatedRoute,
        private courseService: CoursesService,
        private reviewService: ReviewService,
        private attachmentService: AttachmentService,
        private sanitizer: DomSanitizer // Injectez DomSanitizer
    ) { }

    ngOnInit(): void {
        const courseId = Number(this.route.snapshot.paramMap.get('id'));

        if (courseId) {
            this.loadCourseDetails(courseId);
            this.loadCourseReviews(courseId);
            this.loadAttachments(courseId);
            this.loadCourseScore(courseId);
        }
    }

    viewPDF(attachment: Attachment): void {
        const filename = attachment.source.split('\\').pop()?.split('/').pop();
        const unsafeUrl = `http://localhost:8087/cours/attachments/attachments/${filename}`;
        this.pdfUrl = this.sanitizer.bypassSecurityTrustResourceUrl(unsafeUrl); // Utilisez bypassSecurityTrustResourceUrl
        this.viewedAttachmentId = attachment.idAttachment; // Stockez l'ID de l'attachment
        console.log(this.pdfUrl);
    }

    closePDF(): void {
        this.pdfUrl = null;
        this.viewedAttachmentId = null; // Réinitialisez l'ID
    }


    validateAttachment(attachmentId: number): void {
        this.attachmentService.validateAttachment(attachmentId).subscribe({
            next: () => {
                const attachment = this.attachments.find(a => a.idAttachment === attachmentId);
                if (attachment) {
                    attachment.validated = true;
                }

                this.loadCourseScore(this.course.idCourse);
                this.checkAllAttachmentsValidated();
            },
            error: (err) => {
                console.error("Erreur lors de la validation de l'attachment :", err);
            }
        });
    }

    checkAllAttachmentsValidated(): void {
        if (this.attachments.every(attachment => attachment.validated)) {
            this.allAttachmentsValidated = true;
            setTimeout(() => {
                this.allAttachmentsValidated = false;
            }, 5000);
        }
    }

    loadCourseScore(courseId: number): void {
        this.attachmentService.getCourseScore(courseId).subscribe(score => {
            this.courseScore = score;
        });
    }

    loadCourseDetails(id: number): void {
        this.courseService.getCourseById(id).subscribe(course => {
            this.course = course;
        });
    }

    loadAttachments(id: number): void {
        this.attachmentService.getAttachmentsByCourse(id).subscribe(attachments => {
            this.attachments = attachments;
            console.log(this.attachments);
        });
    }

    loadCourseReviews(id: number): void {
        this.reviewService.getReviewsByCourse(id).subscribe(reviews => {
            this.reviews = reviews;
            this.calculateAverageRating();
        });
    }

    calculateAverageRating(): void {
        if (this.reviews.length > 0) {
            const totalRating = this.reviews.reduce((sum, review) => sum + review.rating, 0);
            this.averageRating = totalRating / this.reviews.length;
        } else {
            this.averageRating = 0;
        }
    }

    submitReviewn(): void {
        if (!this.newReview.comment.trim()) {
            Swal.fire({
                icon: 'error',
                title: 'Erreur',
                text: 'Le commentaire ne peut pas être vide !'
            });
            return;
        }

        this.reviewService.addReviewn(this.course.idCourse, this.newReview.rating, this.newReview.comment)
            .subscribe({
                next: (response) => {
                    console.log(response);
                    this.reviews.push({ rating: this.newReview.rating, comment: this.newReview.comment });
                    this.calculateAverageRating();
                    this.newReview = { rating: 1, comment: '' };

                    Swal.fire({
                        icon: 'success',
                        title: 'Avis ajouté',
                        text: 'Votre avis a été ajouté avec succès !'
                    });
                },
                error: (error) => {
                    console.error("Erreur lors de l'ajout de l'avis :", error);
                    Swal.fire({
                        icon: 'error',
                        title: 'Erreur',
                        text: "Une erreur s'est produite lors de l'ajout de l'avis. Veuillez réessayer plus tard."
                    });
                }
            });
    }

    deleteReview(reviewId?: number): void {
        if (!reviewId) return;

        if (confirm("Voulez-vous vraiment supprimer cet avis ?")) {
            this.reviewService.deleteReview(reviewId).subscribe(() => {
                this.reviews = this.reviews.filter(review => review.idReview !== reviewId);
                this.calculateAverageRating();
            });
        }
    }

    hoverStar(star: number): void {
        this.hoveredStar = star;
    }

    setRating(rating: number): void {
        this.newReview.rating = rating;
    }
}