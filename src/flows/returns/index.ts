import { defineFlow } from '../../kit/registry';
import { returnsFlowTokens } from './tokens';
import { lazyScreen } from '../../kit/lazyScreen';

const ReturnDetailsScreen = lazyScreen(() => import('./ReturnDetailsScreen'), 'ReturnDetailsScreen');
const ReturnSubmitScreen = lazyScreen(() => import('./ReturnSubmitScreen'), 'ReturnSubmitScreen');
const ReturnSummaryScreen = lazyScreen(() => import('./ReturnSummaryScreen'), 'ReturnSummaryScreen');
const ReturnableListScreen = lazyScreen(() => import('./ReturnableListScreen'), 'ReturnableListScreen');
const ReturnsHistoryScreen = lazyScreen(() => import('./ReturnsHistoryScreen'), 'ReturnsHistoryScreen');

/** bappzaar origin/master features/afs/returns — value mapping in MAPPING.md */
export const returnsFlow = defineFlow({
  id: 'returns',
  title: 'Returns',
  group: 'Post-order',
  description: 'Returns history (Account → Returns), recent purchases, the AFS v3 return submission, the return details page and the request summary.',
  initial: 'history',
  parent: 'account/account', // Back target when opened directly (no history)
  tokens: returnsFlowTokens,
  screens: [
    {
      id: 'history',
      title: 'Returns history',
      component: ReturnsHistoryScreen,
      path: ['returns-history'],
      notes: 'Live Account → Returns screen. Tap the search icon to expand the field (250 ms out-cubic) and type to filter. The year pill opens the picker and status chips toggle a filter. Tap a card to open its details. "New return request" → recent purchases. ?empty=1 shows the empty view.',
      source: 'features/afs/returns/legacy/screens/AFSReturnsHistoryListScreen',
    },
    {
      id: 'returnable',
      title: 'Your recent purchases',
      component: ReturnableListScreen,
      path: ['returnable-items'],
      notes: 'Blur back header, status strip, "Return" button → submission (the card itself opens the PDP).',
      source: 'features/afs/returns/legacy/screens/AFSReturnsReturnableListScreen',
    },
    {
      id: 'submit',
      title: 'Return an item',
      component: ReturnSubmitScreen,
      defaultParams: { orderId: 'o3', productId: 'p5' },
      notes: 'Sections come one at a time: reason → photos → resolution → refund method → pickup. Picking a reason dims the other cards to 0.2 + blur and springs open the sub-reason list (damping 14, stiffness 180, mass 0.8); a reason with no sub-reasons submits right away. Finished sections collapse into edit cards. Editing a section with unsaved changes asks to discard them first. Photos: Camera adds a demo shot, Gallery opens the file picker. "Estimated refund" opens the breakdown. Back asks "Discard this return?". ?error=1 shows the error view.',
      source: 'features/afs/returns/screens/AFSReturnsReturnSubmissionScreen',
    },
    {
      id: 'summary',
      title: 'Return request summary',
      component: ReturnSummaryScreen,
      defaultParams: { productId: 'p5' },
      source: 'features/afs/returns/screens/AFSReturnsRequestSummaryScreen',
    },
    {
      id: 'details',
      title: 'Return details',
      component: ReturnDetailsScreen,
      defaultParams: { productId: 'p5' },
      notes: 'Opened from the history, the screen shows a "Return details" back header. After a submission (success=1) the processing Lottie plays, then the success header, which moves up after 1.8 s (500 ms out-cubic) while the cards slide in; scrolling scales it to 0.8. Tap the tracker for the timeline. "Cancel return" → confirm → cancelled state. An NPS score opens the feedback sheet. Refund summary, Return Policy, request summary and order summary rows.',
      source: 'features/afs/returns/screens/AFSReturnsDetailsScreen',
    },
  ],
});
