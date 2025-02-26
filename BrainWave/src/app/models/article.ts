import { Ressource } from './ressource';

export interface Article {
    id?: number;
    title: string;
    date: Date | string;
    picture?: string;
    status: boolean;
    views: number;
    numberShares: number;
    categorie: 'NEWS' | 'SUCCESS_STORY' | 'BLOG';
    user?: {
        id: number;
    };
    ressources?: Ressource[];
} 