import { trigger, animate, transition, style, query } from '@angular/animations';

export const fadeAnimation = trigger('fadeAnimation', [
  transition('* => *', [
    style({ position: 'relative' }), // host view must use relative
    query(
      ':enter, :leave',
      [
        style({
          position: 'absolute', // child must use absolute to overlay
          top: 0,
          right: 0,
          width: '100%',
        }),
      ],
      { optional: true }
    ),

    query(':enter', [style({ opacity: 0 })], { optional: true }),

    query(':leave', [style({ opacity: 1 }), animate('0.25s', style({ opacity: 0 }))], {
      optional: true,
    }),

    query(':enter', [style({ opacity: 0 }), animate('0.25s', style({ opacity: 1 }))], {
      optional: true,
    }),
  ]),
]);
