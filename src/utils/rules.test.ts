import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateSubtotal, calculateGST, calculateTotal, formatINR } from './pricing';
import { calculateEstimatedPrepTime, getQueuePosition } from './queue';
import { validateStudentRoll, validateContact, validateUPI } from './validation';
import { CartItem, MenuItem, Order } from '../types/database';

test('pricing: calculates correct subtotal, 5% GST, and grand total', () => {
  const itemA: MenuItem = {
    id: 'm1',
    name: 'Masala Dosa',
    description: 'Crispy rice crepe',
    price: 60,
    category: 'Breakfast',
    is_veg: true,
    prep_time_mins: 8,
    image_url: '',
    image_alt: 'Crispy golden dosa',
    in_stock: true,
    ordered_today_count: 50,
  };

  const itemB: MenuItem = {
    id: 'm2',
    name: 'Filter Coffee',
    description: 'Hot brewed filter coffee',
    price: 25,
    category: 'Beverages',
    is_veg: true,
    prep_time_mins: 3,
    image_url: '',
    image_alt: 'Traditional filter coffee in stainless steel dabara',
    in_stock: true,
    ordered_today_count: 90,
  };

  const cart: CartItem[] = [
    { menuItem: itemA, quantity: 2 }, // 120
    { menuItem: itemB, quantity: 1 }, // 25
  ];

  const subtotal = calculateSubtotal(cart);
  assert.equal(subtotal, 145);

  const gst = calculateGST(subtotal);
  assert.equal(gst, 7.25);

  const total = calculateTotal(subtotal, gst);
  assert.equal(total, 152.25);

  const formatted = formatINR(150);
  assert.match(formatted, /₹|INR/);
});

test('queue: calculates dynamic queue wait times accurately', () => {
  const prep = calculateEstimatedPrepTime(4, 8);
  assert.equal(prep.minMins, 14); // 8 + 6
  assert.equal(prep.maxMins, 21); // 14 + 4 + 3
  assert.match(prep.displayStr, /Est\. Prep Time: 14–21 mins based on 4 active orders/);

  const zeroPrep = calculateEstimatedPrepTime(0, 6);
  assert.equal(zeroPrep.minMins, 6);
  assert.match(zeroPrep.displayStr, /based on 0 active orders/);
});

test('queue: calculates accurate queue position', () => {
  const orders: Order[] = [
    { order_id: 'CB-101', status: 'TAKEN' } as Order,
    { order_id: 'CB-102', status: 'COOKING' } as Order,
    { order_id: 'CB-103', status: 'COOKED' } as Order,
    { order_id: 'CB-104', status: 'TAKEN' } as Order,
  ];

  assert.equal(getQueuePosition('CB-101', orders), 1);
  assert.equal(getQueuePosition('CB-102', orders), 2);
  assert.equal(getQueuePosition('CB-104', orders), 3); // CB-103 is COOKED so skipped from active prep queue
  assert.equal(getQueuePosition('CB-999', orders), 0);
});

test('validation: verifies student roll numbers and phone numbers', () => {
  assert.equal(validateStudentRoll('2024CS0842').isValid, true);
  assert.equal(validateStudentRoll('BT-21-MECH').isValid, true);
  assert.equal(validateStudentRoll('').isValid, false);
  assert.equal(validateStudentRoll('A@#$').isValid, false);

  assert.equal(validateContact('9876543210').isValid, true);
  assert.equal(validateContact('student@college.edu').isValid, true);
  assert.equal(validateContact('12345').isValid, false);
  assert.equal(validateContact('').isValid, false);

  assert.equal(validateUPI('student@okhdfcbank'), true);
  assert.equal(validateUPI('rohit.sharma@paytm'), true);
  assert.equal(validateUPI('invalid-upi'), false);
});
