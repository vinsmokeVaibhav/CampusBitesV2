import { Order } from '../types/database';

/**
 * Calculates dynamic, queue-calculated estimated preparation time range.
 * Honest & dynamic based on active kitchen load.
 */
export function calculateEstimatedPrepTime(activeOrdersCount: number, basePrepTime = 8): {
  minMins: number;
  maxMins: number;
  displayStr: string;
} {
  // Each order in front adds roughly 1.5 - 2 minutes to queue delay
  const queueDelayMin = Math.round(activeOrdersCount * 1.5);
  const queueDelayMax = Math.round(activeOrdersCount * 2.5);

  const minMins = Math.max(4, basePrepTime + queueDelayMin);
  const maxMins = minMins + 4 + Math.min(6, Math.floor(activeOrdersCount * 0.8));

  return {
    minMins,
    maxMins,
    displayStr: `Est. Prep Time: ${minMins}–${maxMins} mins based on ${activeOrdersCount} active ${
      activeOrdersCount === 1 ? 'order' : 'orders'
    }`,
  };
}

/**
 * Calculates current queue position of an order among active orders (TAKEN or COOKING)
 */
export function getQueuePosition(orderId: string, orders: Order[]): number {
  const activeOrders = orders.filter(
    (o) => o.status === 'TAKEN' || o.status === 'COOKING'
  );
  const index = activeOrders.findIndex((o) => o.order_id === orderId);
  return index === -1 ? 0 : index + 1;
}
