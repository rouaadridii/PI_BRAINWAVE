  import { Course } from "./Course";

  export interface Review {
      idReview?: number;
      rating: number; // Note entre 1 et 5
      comment: string;
      courseId?: number;  // ID du cours associé
      sentiment?: string | null;      // Ex: 'Positif', 'Négatif', 'Neutre', 'Erreur'
    reviewSummary?: string | null;  // Le résumé du commentaire
    analysisTimestamp?: string | Date | null; // La date/heure de l'analyse
    course?: Course;
    }