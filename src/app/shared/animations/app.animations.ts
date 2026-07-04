import {
  animate,
  animateChild,
  group,
  query,
  stagger,
  style,
  transition,
  trigger,
} from '@angular/animations';

/** Cross-fade + subtle lift between routed views. */
export const routeFade = trigger('routeFade', [
  transition('* <=> *', [
    query(':enter', [style({ opacity: 0, transform: 'translateY(12px)' })], { optional: true }),
    query(
      ':leave',
      [
        style({ opacity: 1 }),
        animate('160ms cubic-bezier(.4,0,1,1)', style({ opacity: 0, transform: 'translateY(-8px)' })),
      ],
      { optional: true },
    ),
    query(
      ':enter',
      [
        animate(
          '340ms 60ms cubic-bezier(.16,1,.3,1)',
          style({ opacity: 1, transform: 'none' }),
        ),
        animateChild(),
      ],
      { optional: true },
    ),
  ]),
]);

/** Staggered entrance for list/table rows and card grids. */
export const listStagger = trigger('listStagger', [
  transition(':enter, * => *', [
    query(
      ':enter',
      [
        style({ opacity: 0, transform: 'translateY(14px)' }),
        stagger(55, [
          animate('420ms cubic-bezier(.16,1,.3,1)', style({ opacity: 1, transform: 'none' })),
        ]),
      ],
      { optional: true },
    ),
  ]),
]);

/** Single-element fade-up entrance. */
export const fadeUp = trigger('fadeUp', [
  transition(':enter', [
    style({ opacity: 0, transform: 'translateY(16px)' }),
    animate('420ms cubic-bezier(.16,1,.3,1)', style({ opacity: 1, transform: 'none' })),
  ]),
]);

/** Grouped grid entrance with inner stagger. */
export const gridStagger = trigger('gridStagger', [
  transition(':enter', [
    group([
      query(
        '@fadeUp',
        [style({ opacity: 0 }), stagger(70, [animateChild()])],
        { optional: true },
      ),
    ]),
  ]),
]);
