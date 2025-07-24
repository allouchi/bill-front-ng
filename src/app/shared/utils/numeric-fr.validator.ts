import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function numericFrValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;

    if (value === null || value === '') {
      return null; // laisser "required" gérer les champs vides
    }

    // Remplace la virgule par un point pour la validation numérique
    const normalized =
      typeof value === 'string' ? value.replace(',', '.') : value;

    const isValid = !isNaN(normalized) && !isNaN(parseFloat(normalized));

    return isValid ? null : { notNumeric: true };
  };
}

export function customEmailValidator(
  control: AbstractControl
): ValidationErrors | null {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;
  const value = control.value;

  if (!value || emailRegex.test(value)) {
    return null; // valide
  }

  return { invalidEmail: true }; // invalide
}
