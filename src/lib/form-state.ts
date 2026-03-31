export type FormState = {
  message?: string;
  errors?: Record<string, string[]>;
};

export const EMPTY_FORM_STATE: FormState = {};
