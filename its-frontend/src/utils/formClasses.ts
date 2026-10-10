/** Bootstrap class names for a form control, adding `is-invalid` when needed. */
export function controlClass(base: 'form-control' | 'form-select', invalid: boolean): string {
  return invalid ? `${base} is-invalid` : base;
}
