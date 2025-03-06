import { Course } from "./Course";

export interface Review {
    idReview?: number;
    rating: number; // Note entre 1 et 5
    comment: string;
    courseId?: number;  // ID du cours associé
  }