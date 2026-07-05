import {
  Component,
  EventEmitter,
  HostListener,
  Input,
  Output,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { A11yModule } from '@angular/cdk/a11y';
import { Accent, StatusChip, Tone } from '../entity-card/entity-card.component';

export interface DetailField {
  label: string;
  value: string | number | null | undefined;
  /** Render the value as a status chip of this tone. */
  tone?: Tone;
  /** Tabular-nums styling for money / figures. */
  isMoney?: boolean;
  /** Span both columns on desktop (long text). */
  wide?: boolean;
  /** Optional section heading; consecutive fields sharing it are grouped. */
  section?: string;
}

interface FieldGroup {
  title: string;
  fields: DetailField[];
}

/**
 * IMS "MUI Minimal" detail dialog. Centered card on desktop (~720px),
 * full-screen on mobile with sticky header/footer. Backdrop blur, CSS
 * fade/scale entrance, CDK focus-trap, Esc to close.
 *
 * Controlled by a boolean `open`; emits (close)/(edit)/(remove).
 *
 * @author UI overhaul
 */
@Component({
  selector: 'bill-detail-modal',
  standalone: true,
  imports: [CommonModule, A11yModule],
  templateUrl: './detail-modal.component.html',
})
export class DetailModalComponent {
  @Input() open = false;
  @Input() title = '';
  @Input() subtitle?: string;
  @Input() icon = 'bi-info-circle';
  @Input() accent: Accent = 'brand';
  @Input() status?: StatusChip;
  @Input() fields: DetailField[] = [];
  @Input() canEdit = false;
  @Input() canDelete = false;

  @Output() close = new EventEmitter<void>();
  @Output() edit = new EventEmitter<void>();
  @Output() remove = new EventEmitter<void>();

  get groups(): FieldGroup[] {
    const groups: FieldGroup[] = [];
    for (const f of this.fields || []) {
      const title = f.section || '';
      let group = groups.length ? groups[groups.length - 1] : null;
      if (!group || group.title !== title) {
        group = { title, fields: [] };
        groups.push(group);
      }
      group.fields.push(f);
    }
    return groups;
  }

  onBackdrop(): void {
    this.close.emit();
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.open) {
      this.close.emit();
    }
  }
}
