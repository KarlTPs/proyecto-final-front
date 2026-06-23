export interface Review {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  user: {
    id: string;
    username: string;
  };
  book?: {
    id: string;
    title: string;
  };
}