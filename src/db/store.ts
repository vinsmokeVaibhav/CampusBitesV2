import { MenuItem, Order, Payment, ConsentLog, User, OrderStatus } from '../types/database';
import { INITIAL_MENU_ITEMS, INITIAL_ORDERS, INITIAL_PAYMENTS, INITIAL_USERS } from './seedData';

const STORAGE_KEYS = {
  MENU: 'campusbite_menu_items_v2',
  ORDERS: 'campusbite_orders_v2',
  PAYMENTS: 'campusbite_payments_v2',
  CONSENT: 'campusbite_consent_logs_v2',
  USERS: 'campusbite_users_v2',
};

// Cross-tab & intra-window sync
const broadcastChannel = typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel('campusbite_channel') : null;
const listeners = new Set<() => void>();

function notifyChange() {
  listeners.forEach((listener) => {
    try {
      listener();
    } catch (e) {
      console.error('Error invoking store listener:', e);
    }
  });

  if (broadcastChannel) {
    try {
      broadcastChannel.postMessage({ type: 'STORE_UPDATED', timestamp: Date.now() });
    } catch {
      // ignore
    }
  }
}

if (broadcastChannel) {
  broadcastChannel.onmessage = (event) => {
    if (event.data?.type === 'STORE_UPDATED') {
      listeners.forEach((listener) => {
        try {
          listener();
        } catch (e) {
          console.error(e);
        }
      });
    }
  };
}

export const CanteenStore = {
  subscribe(listener: () => void): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },

  getUsers(): User[] {
    const raw = localStorage.getItem(STORAGE_KEYS.USERS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(INITIAL_USERS));
      return INITIAL_USERS;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_USERS;
    }
  },

  getMenuItems(): MenuItem[] {
    const raw = localStorage.getItem(STORAGE_KEYS.MENU);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.MENU, JSON.stringify(INITIAL_MENU_ITEMS));
      return INITIAL_MENU_ITEMS;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_MENU_ITEMS;
    }
  },

  toggleItemStock(itemId: string, inStock?: boolean): MenuItem[] {
    const items = this.getMenuItems();
    const updated = items.map((item) => {
      if (item.id === itemId) {
        return { ...item, in_stock: inStock !== undefined ? inStock : !item.in_stock };
      }
      return item;
    });
    localStorage.setItem(STORAGE_KEYS.MENU, JSON.stringify(updated));
    notifyChange();
    return updated;
  },

  updateMenuItemPrice(itemId: string, newPrice: number): MenuItem[] {
    const items = this.getMenuItems();
    const updated = items.map((item) => {
      if (item.id === itemId) {
        return { ...item, price: newPrice };
      }
      return item;
    });
    localStorage.setItem(STORAGE_KEYS.MENU, JSON.stringify(updated));
    notifyChange();
    return updated;
  },

  getOrders(): Order[] {
    const raw = localStorage.getItem(STORAGE_KEYS.ORDERS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(INITIAL_ORDERS));
      return INITIAL_ORDERS;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_ORDERS;
    }
  },

  getOrderById(orderId: string): Order | undefined {
    const orders = this.getOrders();
    return orders.find((o) => o.order_id.toLowerCase() === orderId.toLowerCase());
  },

  createOrder(order: Order, payment: Payment): { order: Order; payment: Payment } {
    const orders = this.getOrders();
    const payments = this.getPayments();

    const updatedOrders = [order, ...orders];
    const updatedPayments = [payment, ...payments];

    // Increment popularity metrics for ordered menu items
    const menuItems = this.getMenuItems();
    const updatedMenu = menuItems.map((menuItem) => {
      const match = order.items.find((oi) => oi.menu_item_id === menuItem.id);
      if (match) {
        return {
          ...menuItem,
          ordered_today_count: menuItem.ordered_today_count + match.quantity,
        };
      }
      return menuItem;
    });

    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(updatedOrders));
    localStorage.setItem(STORAGE_KEYS.PAYMENTS, JSON.stringify(updatedPayments));
    localStorage.setItem(STORAGE_KEYS.MENU, JSON.stringify(updatedMenu));

    notifyChange();
    return { order, payment };
  },

  updateOrderStatus(orderId: string, status: OrderStatus): Order | null {
    const orders = this.getOrders();
    let updatedOrder: Order | null = null;

    const updatedList = orders.map((o) => {
      if (o.order_id === orderId) {
        updatedOrder = {
          ...o,
          status,
          updated_at: new Date().toISOString(),
        };
        return updatedOrder;
      }
      return o;
    });

    if (updatedOrder) {
      localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(updatedList));
      notifyChange();
    }
    return updatedOrder;
  },

  cancelOrder(orderId: string): { success: boolean; message: string; refundedAmount?: number } {
    const order = this.getOrderById(orderId);
    if (!order) {
      return { success: false, message: 'Order not found.' };
    }

    if (order.status !== 'TAKEN') {
      return {
        success: false,
        message: 'Order is already in kitchen preparation (Cooking/Cooked). Under the Refund Policy, cancellations are only permitted while status is "TAKEN".',
      };
    }

    // Cancel order and process 100% refund record
    this.updateOrderStatus(orderId, 'CANCELLED');

    const payments = this.getPayments();
    const updatedPayments = payments.map((p) => {
      if (p.order_id === orderId) {
        return { ...p, status: 'REFUNDED' as const };
      }
      return p;
    });
    localStorage.setItem(STORAGE_KEYS.PAYMENTS, JSON.stringify(updatedPayments));
    notifyChange();

    return {
      success: true,
      message: `Order #${orderId} cancelled successfully. 100% refund of ₹${order.total_amount.toFixed(
        2
      )} has been processed to your original payment method.`,
      refundedAmount: order.total_amount,
    };
  },

  getPayments(): Payment[] {
    const raw = localStorage.getItem(STORAGE_KEYS.PAYMENTS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.PAYMENTS, JSON.stringify(INITIAL_PAYMENTS));
      return INITIAL_PAYMENTS;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_PAYMENTS;
    }
  },

  getConsentLogs(): ConsentLog[] {
    const raw = localStorage.getItem(STORAGE_KEYS.CONSENT);
    if (!raw) return [];
    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  },

  recordConsent(userIdentifier: string, preferences = { necessary: true, analytics: false, marketing: false }): void {
    const logs = this.getConsentLogs();
    const newLog: ConsentLog = {
      id: `consent-${Date.now()}`,
      user_identifier: userIdentifier,
      cookie_preferences: preferences,
      form_consent_timestamp: new Date().toISOString(),
    };
    logs.push(newLog);
    localStorage.setItem(STORAGE_KEYS.CONSENT, JSON.stringify(logs));
  },

  getStats() {
    const orders = this.getOrders();
    const activeOrders = orders.filter((o) => o.status === 'TAKEN' || o.status === 'COOKING');
    const completedOrders = orders.filter((o) => o.status === 'COOKED' || o.status === 'PICKED_UP');
    const revenue = orders
      .filter((o) => o.status !== 'CANCELLED')
      .reduce((sum, o) => sum + o.total_amount, 0);

    return {
      totalOrdersToday: orders.length,
      activeQueueCount: activeOrders.length,
      completedCount: completedOrders.length,
      totalRevenueToday: revenue,
      avgPrepTimeMins: 9,
    };
  },

  resetToDefaults(): void {
    localStorage.setItem(STORAGE_KEYS.MENU, JSON.stringify(INITIAL_MENU_ITEMS));
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(INITIAL_ORDERS));
    localStorage.setItem(STORAGE_KEYS.PAYMENTS, JSON.stringify(INITIAL_PAYMENTS));
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(INITIAL_USERS));
    notifyChange();
  },
};
