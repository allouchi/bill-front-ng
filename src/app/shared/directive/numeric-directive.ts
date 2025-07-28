import { Directive, HostListener, ElementRef, Renderer2 } from '@angular/core';

@Directive({
  selector: '[numberFormat]',
})
export class NumberFormatDirective {
  private readonly regex: RegExp = new RegExp(/^-?\d*[.,]?\d{0,2}$/g); // Optionnel : 2 décimales

  constructor(
    private readonly el: ElementRef,
    private readonly renderer: Renderer2
  ) {}

  @HostListener('input', ['$event'])
  onInputChange(event: any) {
    let value = this.el.nativeElement.value;

    // Enlever tout sauf chiffres et point/virgule
    value = value.replace(/[^0-9.,]/g, '');

    // Remplacer les virgules par des points
    value = value.replace(/,/g, '.');

    // Ne garder qu’un seul point
    const parts = value.split('.');
    if (parts.length > 2) {
      value = parts[0] + '.' + parts.slice(1).join('');
    }

    this.renderer.setProperty(this.el.nativeElement, 'value', value);
  }

  @HostListener('blur')
  onBlur() {
    let value = this.el.nativeElement.value;

    if (value) {
      const num = parseFloat(value);
      if (!isNaN(num)) {
        const formatted = num.toLocaleString('en-US', {
          maximumFractionDigits: 2,
        });
        this.renderer.setProperty(this.el.nativeElement, 'value', formatted);
      }
    }
  }

  @HostListener('focus')
  onFocus() {
    let value = this.el.nativeElement.value;
    value = value.replace(/,/g, ''); // Enlever la mise en forme pour édition
    this.renderer.setProperty(this.el.nativeElement, 'value', value);
  }
}
