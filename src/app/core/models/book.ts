export interface Book {
  id: string;
  title: string;
  author: string;
  synopsis: string | null;
  genre: string | null;
  coverImage: string | null;
  publicationDate: string | null;
  createdAt: string;
  averageRating?: number | null;
  reviewsCount?: number;
  reviews?: any[];
}