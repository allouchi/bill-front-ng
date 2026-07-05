import {
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  Output,
} from '@angular/core';
import { CommonModule } from '@angular/common';

export type Accent = 'brand' | 'success' | 'warning' | 'error' | 'info';
export type Tone = 'success' | 'warning' | 'error' | 'info' | 'brand' | 'default';

export interface MetaLine {
  icon: string;
  text?: string | null;
}
export interface StatusChip {
  label: string;
  tone: Tone;
}

/**
 * IMS "MUI Minimal" entity card — the mobile listing item.
 * Anatomy: tinted rounded icon + bold title + kebab (⋮) on top,
 * up to 3 muted meta lines, and a footer with a prominent metric +
 * a status chip. Row actions are projected into the kebab menu via
 * `<... card-actions>`; body click emits (open).
 *
 * @author UI overhaul
 */
@Component({
  selector: 'bill-entity-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './entity-card.component.html',
})
export class EntityCardComponent {
  @Input() icon = 'bi-box';
  @Input() accent: Accent = 'brand';
  @Input() title = '';
  @Input() subtitle?: string;
  @Input() meta: MetaLine[] = [];
  @Input() metricLabel?: string;
  @Input() metricValue?: string;
  @Input() status?: StatusChip;
  /** Show the kebab menu button (set false when there are no row actions). */
  @Input() hasMenu = true;

  @Output() open = new EventEmitter<void>();
  @Output() menu = new EventEmitter<void>();

  menuOpen = false;

  constructor(private readonly host: ElementRef<HTMLElement>) {}

  get visibleMeta(): MetaLine[] {
    return (this.meta || []).filter((m) => !!m && !!m.text);
  }

  onBodyClick(): void {
    this.menuOpen = false;
    this.open.emit();
  }

  toggleMenu(event: Event): void {
    event.stopPropagation();
    this.menuOpen = !this.menuOpen;
    this.menu.emit();
  }

  onMenuClick(event: Event): void {
    // Let projected buttons run their own handlers, then close the menu.
    event.stopPropagation();
    this.menuOpen = false;
  }

  @HostListener('document:click', ['$event'])
  onDocClick(event: Event): void {
    if (this.menuOpen && !this.host.nativeElement.contains(event.target as Node)) {
      this.menuOpen = false;
    }
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.menuOpen = false;
  }
}
