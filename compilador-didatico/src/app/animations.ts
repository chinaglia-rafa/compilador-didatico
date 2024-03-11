import {
  trigger,
  transition,
  style,
  query,
  animateChild,
  group,
  animate,
} from '@angular/animations';

export const customAnimations = trigger('routeAnimations', [
  transition('CodeEditorPage => LexicalAnalysisPage', [
    style({ position: 'relative' }),
    query(
      ':enter, :leave',
      [
        style({
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          opacity: 1.0,
          overflow: 'hidden',
        }),
      ],
      { optional: true }
    ),
    query(
      ':enter',
      [style({ overflow: 'hidden', opacity: 1.0, height: '0' })],
      {
        optional: true,
      }
    ),
    query(':leave', animateChild(), { optional: true }),
    group([
      query(':leave', [animate('300ms ease-out', style({ opacity: 0.0 }))], {
        optional: true,
      }),
      query(
        ':enter',
        [animate('300ms ease-out', style({ opacity: 1.0, height: '100%' }))],
        {
          optional: true,
        }
      ),
    ]),
  ]),
  transition('LexicalAnalysisPage => CodeEditorPage', [
    style({ position: 'relative' }),
    query(
      ':enter, :leave',
      [
        style({
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          opacity: 1.0,
          overflow: 'hidden',
        }),
      ],
      { optional: true }
    ),
    query(
      ':leave',
      [style({ overflow: 'hidden', opacity: 1.0, height: '100%' })],
      {
        optional: true,
      }
    ),
    query(':leave', animateChild(), { optional: true }),
    group([
      query(
        ':leave',
        [animate('300ms ease-out', style({ opacity: 0.0, height: '0' }))],
        {
          optional: true,
        }
      ),
      query(':enter', [animate('300ms ease-out', style({ opacity: 1.0 }))], {
        optional: true,
      }),
    ]),
  ]),
  transition('* <=> *', [
    style({ position: 'relative' }),
    query(
      ':enter, :leave',
      [
        style({
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          opacity: 1.0,
        }),
      ],
      { optional: true }
    ),
    query(':enter', [style({ overflow: 'hidden', opacity: 0.0 })], {
      optional: true,
    }),
    query(':leave', animateChild(), { optional: true }),
    group([
      query(':leave', [animate('200ms ease-out', style({ opacity: 0.0 }))], {
        optional: true,
      }),
      query(':enter', [animate('200ms ease-out', style({ opacity: 1.0 }))], {
        optional: true,
      }),
    ]),
  ]),
]);
