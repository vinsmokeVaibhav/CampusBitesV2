import { CartItem } from '../types/database';

export const GST_RATE = 0.05; // 5% GST for college canteen dining

/**
 * Calculates the subtotal of all items in cart
 */
export function calculateSubtotal(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.menuItem.price * item.quantity, 0);
}

/**
 * Calculates 5% GST rounded to 2 decimal places
 */
export function calculateGST(subtotal: number, rate = GST_RATE): number {
  return Math.round(subtotal * rate * 100) / 100;
}

/**
 * Computes grand total with zero hidden charges
 */
export function calculateTotal(subtotal: number, tax: number): number {
  return Math.round((subtotal + tax) * 100) / 100;
}

/**
 * Formats price in Indian Rupees (INR)
 */
export function formatINR(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
    minimumFractionDigits: amount % 1 === 0 ? 0 : 2,
  }).format(amount);
}
