export interface ICreateNote {
  title: string;
  content: string;
  color?: string | undefined;
  isPinned?: boolean | undefined;
  categoryId?: number | null | undefined;
}

export interface IUpdateNote {
  title?: string | undefined;
  content?: string | undefined;
  color?: string | undefined;
  isPinned?: boolean | undefined;
  categoryId?: number | null | undefined;
}

export interface INoteFilterQuery {
  search?: string | undefined;
  categoryId?: number | undefined;
}
