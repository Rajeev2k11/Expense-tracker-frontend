import api from '../../services/api';

export interface Category {
  id: string;
  name: string;
  description?: string;
}

export interface CategoriesResponse {
  categories: Category[];
}

export const categoryApi = {
  // Get all categories
  getCategories: async (): Promise<Category[]> => {
    const response = await api.get<CategoriesResponse>('/v1/categories/list');
    return response.data.categories;
  },
};

export default categoryApi;
