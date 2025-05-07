export interface Product {
  id: string;
  name: string;
  type: string; // Consider using an enum like 'cement' | 'concrete' | 'other'
  description: string;
  image: string | null;
  isActive: boolean;
  createdAt?: string; // Optional if not always present on creation/update forms
  features?: string[];
  advantages?: string[];
  applications?: string[];
  technicalSpecs?: string[];
}
