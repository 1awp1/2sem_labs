export const categories = [
  "концерт",
  "лекция",
  "выставка",
  "семинар",
  "мастер-класс",
  "другое",
] as const;

export type EventCategory = (typeof categories)[number];
export const categoriesList: string[] = [...categories] as string[];

export interface Event {
  id: number;
  title: string;
  description?: string | null;
  date: string;
  createdBy: number;
  category: EventCategory;
  creator?: {
    id: number;
    name: string;
    email: string;
  };
}

export interface EventFormValues {
  title: string;
  description?: string;
  date: string;
  category: EventCategory;
}
