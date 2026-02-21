import api from '../../services/api';

export interface CreateExpensePayload {
  title: string;
  amount: number;
  category: string;
  description: string;
  date: string;
  user: string;
  team: string;
}

export interface UpdateExpensePayload {
  title?: string;
  amount?: number;
  category?: string;
  description?: string;
  date?: string;
}

export interface ExpenseApprovalPayload {
  status: 'approved' | 'rejected';
}

export interface ExpenseEntity {
  id: string;
  title: string;
  amount: number;
  category: string;
  categoryName?: string;
  description: string;
  date: string;
  status?: string;
  user?: string;
  createdBy?: string;
  userEmail?: string;
  team?: string;
  createdAt?: string;
}

const normalizeStatus = (status: unknown): string => {
  const value = String(status ?? 'pending').toLowerCase();

  if (value === 'approved') return 'Approved';
  if (value === 'rejected' || value === 'declined') return 'Rejected';
  return 'Pending';
};

const resolveCategory = (category: unknown): { id: string; name?: string } => {
  if (typeof category === 'string') {
    return { id: category };
  }

  const source = (category || {}) as { id?: string; _id?: string; name?: string; title?: string };
  const id = String(source.id ?? source._id ?? '');
  const name = source.name || source.title;
  return { id, name };
};

const normalizeExpense = (expense: Record<string, unknown>): ExpenseEntity => {
  const category = resolveCategory(expense.category);
  const userSource = expense.user as { id?: string; _id?: string; email?: string; username?: string; name?: string; fullName?: string } | string | undefined;
  const createdBySource = (expense.createdBy ?? expense.created_by ?? expense.requested_by) as
    | { id?: string; _id?: string; email?: string }
    | string
    | undefined;
  const teamSource = expense.team as { id?: string; _id?: string } | string | undefined;

  const resolvedUser =
    typeof userSource === 'string'
      ? userSource
      : String(userSource?.id ?? userSource?._id ?? '');

  const resolvedTeam =
    typeof teamSource === 'string'
      ? teamSource
      : String(teamSource?.id ?? teamSource?._id ?? '');

  const resolvedCreatedBy =
    typeof createdBySource === 'string'
      ? createdBySource
      : String(createdBySource?.id ?? createdBySource?._id ?? '');

  const resolvedUserEmail =
    typeof userSource === 'string'
      ? ''
      : String(
          userSource?.email ??
            (typeof createdBySource === 'string' ? '' : createdBySource?.email) ??
            expense.user_email ??
            expense.created_by_email ??
            expense.requested_by_email ??
            ''
        );

  return {
    id: String(expense.id ?? expense._id ?? ''),
    title: String(expense.title ?? ''),
    amount: Number(expense.amount ?? 0),
    category: category.id,
    categoryName: category.name,
    description: String(expense.description ?? ''),
    date: String(expense.date ?? expense.created_at ?? ''),
    status: normalizeStatus(expense.status),
    user: resolvedUser || undefined,
    createdBy: resolvedCreatedBy || undefined,
    userEmail: resolvedUserEmail || undefined,
    team: resolvedTeam || undefined,
    createdAt: String(expense.created_at ?? expense.createdAt ?? ''),
  };
};

export const expenseApi = {
  listExpenses: async (): Promise<ExpenseEntity[]> => {
    const response = await api.get<Array<Record<string, unknown>>>('/v1/expenses', {
      params: import.meta.env.DEV ? { _t: Date.now() } : undefined,
    });
    return (Array.isArray(response.data) ? response.data : []).map((expense) => normalizeExpense(expense || {}));
  },

  createExpense: async (payload: CreateExpensePayload): Promise<ExpenseEntity> => {
    const response = await api.post<Record<string, unknown>>('/v1/expenses', payload);
    return normalizeExpense(response.data || {});
  },

  updateExpense: async (id: string, payload: UpdateExpensePayload): Promise<ExpenseEntity> => {
    const response = await api.put<Record<string, unknown>>(`/v1/expenses/${id}`, payload);
    return normalizeExpense(response.data || {});
  },

  approveOrRejectExpense: async (id: string, payload: ExpenseApprovalPayload): Promise<ExpenseEntity> => {
    const response = await api.patch<Record<string, unknown>>(`/v1/expenses/${id}/approval`, payload);
    return normalizeExpense(response.data || {});
  },

  deleteExpense: async (id: string): Promise<void> => {
    await api.delete(`/v1/expenses/${id}`);
  },
};
