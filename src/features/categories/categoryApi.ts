import api from '../../services/api';

export interface Category {
  id: string;
  name: string;
  description: string;
  color: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateCategoryPayload {
  name: string;
  description: string;
  color: string;
}

export interface UpdateCategoryPayload {
  name: string;
  description: string;
  color: string;
}

export const categoryApi = {
  // Get all categories
  getCategories: async (): Promise<Category[]> => {
    const response = await api.get('/v1/categories/list');
    // Check if response is directly an array or wrapped in an object
    const data = Array.isArray(response.data) ? response.data : (response.data.categories || response.data);
    // Normalize categories to ensure we have an `id` (fallback to `_id`)
    const normalized = (data || []).map((c: Category & { _id?: string }) => ({ 
      ...(c || {}), 
      id: c.id || c._id || '' 
    }));
    return normalized;
  },

  // Create a new category
  createCategory: async (payload: CreateCategoryPayload): Promise<Category> => {
    const response = await api.post<Category>('/v1/categories', payload);
    const created = { ...(response.data || {}), id: response.data.id || (response.data as Category & { _id?: string })._id || '' };
    return created;
  },

  // Update a category
  updateCategory: async (id: string, payload: UpdateCategoryPayload): Promise<Category> => {
    const response = await api.put<Category>(`/v1/categories/${id}`, payload);
    const updated = { ...(response.data || {}), id: response.data.id || (response.data as Category & { _id?: string })._id || '' };
    return updated;
  },

  // Delete a category
  deleteCategory: async (id: string): Promise<void> => {
    await api.delete(`/v1/categories/${id}`);
  },
};

export default categoryApi;
