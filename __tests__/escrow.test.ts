import {
  EscrowStateError,
  holdInEscrow,
  refundEscrow,
  releaseEscrow,
  settleForBookingStatus,
} from '../lib/escrow';
import { supabase } from '../lib/supabase';

jest.mock('../lib/supabase', () => ({
  supabase: {
    from: jest.fn(),
  },
}));

/**
 * The escrow module calls supabase in two distinct shapes:
 *
 *   READ:   from('bookings').select('payment_status').eq('id', id).single()
 *   WRITE:  from('bookings').update({ payment_status }).eq('id', id).select().single()
 *
 * fakeBookingsTable() wires up both, backed by a small in-memory store so
 * tests express *behaviour* (release transitions escrow→released) rather
 * than fight a mock-of-a-mock-of-a-builder. Calling code paths that hit any
 * other supabase shape will fall off the cliff loudly, which is what we want.
 */
function fakeBookingsTable(initial: Record<string, { payment_status: string | null }>) {
  const store = { ...initial };

  const fromImpl = (table: string) => {
    expect(table).toBe('bookings');

    let pendingId: string | null = null;
    let pendingUpdate: Record<string, any> | null = null;

    const selectChain: any = {
      eq: (_col: string, id: string) => {
        pendingId = id;
        return selectChain;
      },
      single: () => {
        const row = pendingId !== null ? store[pendingId] : undefined;
        return Promise.resolve({ data: row ?? null, error: row ? null : { message: 'not found' } });
      },
    };

    const updateChain: any = {
      eq: (_col: string, id: string) => {
        pendingId = id;
        return updateChain;
      },
      select: () => updateChain,
      single: () => {
        if (pendingId === null || !pendingUpdate) {
          return Promise.resolve({ data: null, error: { message: 'no pending update' } });
        }
        store[pendingId] = { ...store[pendingId], ...pendingUpdate };
        return Promise.resolve({ data: { id: pendingId, ...store[pendingId] }, error: null });
      },
    };

    return {
      select: (_cols: string) => selectChain,
      update: (patch: Record<string, any>) => {
        pendingUpdate = patch;
        return updateChain;
      },
    };
  };

  (supabase.from as jest.Mock).mockImplementation(fromImpl);
  return store;
}

describe('escrow state machine', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('holdInEscrow', () => {
    it('moves pending → escrow', async () => {
      const store = fakeBookingsTable({ b1: { payment_status: 'pending' } });
      await holdInEscrow('b1');
      expect(store.b1.payment_status).toBe('escrow');
    });

    it('is idempotent for already-escrow bookings (network retry safe)', async () => {
      const store = fakeBookingsTable({ b1: { payment_status: 'escrow' } });
      await expect(holdInEscrow('b1')).resolves.toBeDefined();
      expect(store.b1.payment_status).toBe('escrow');
    });

    it('refuses to re-hold a released booking', async () => {
      fakeBookingsTable({ b1: { payment_status: 'released' } });
      await expect(holdInEscrow('b1')).rejects.toBeInstanceOf(EscrowStateError);
    });
  });

  describe('releaseEscrow', () => {
    it('moves escrow → released', async () => {
      const store = fakeBookingsTable({ b1: { payment_status: 'escrow' } });
      await releaseEscrow('b1');
      expect(store.b1.payment_status).toBe('released');
    });

    it('refuses to release a pending payment (no funds in escrow yet)', async () => {
      fakeBookingsTable({ b1: { payment_status: 'pending' } });
      await expect(releaseEscrow('b1')).rejects.toBeInstanceOf(EscrowStateError);
    });

    it('refuses to double-release (this is the bug that would pay lender twice)', async () => {
      const store = fakeBookingsTable({ b1: { payment_status: 'escrow' } });
      await releaseEscrow('b1');
      await expect(releaseEscrow('b1')).rejects.toBeInstanceOf(EscrowStateError);
      expect(store.b1.payment_status).toBe('released');
    });

    it('refuses to release a refunded payment (this is the bug that would pay lender after refund)', async () => {
      fakeBookingsTable({ b1: { payment_status: 'refunded' } });
      await expect(releaseEscrow('b1')).rejects.toBeInstanceOf(EscrowStateError);
    });
  });

  describe('refundEscrow', () => {
    it('moves escrow → refunded', async () => {
      const store = fakeBookingsTable({ b1: { payment_status: 'escrow' } });
      await refundEscrow('b1');
      expect(store.b1.payment_status).toBe('refunded');
    });

    it('refuses to refund a released payment (renter would get money owner already has)', async () => {
      fakeBookingsTable({ b1: { payment_status: 'released' } });
      await expect(refundEscrow('b1')).rejects.toBeInstanceOf(EscrowStateError);
    });
  });

  describe('settleForBookingStatus', () => {
    it('releases on COMPLETED', async () => {
      const store = fakeBookingsTable({ b1: { payment_status: 'escrow' } });
      const outcome = await settleForBookingStatus('b1', 'COMPLETED');
      expect(outcome).toBe('released');
      expect(store.b1.payment_status).toBe('released');
    });

    it('refunds on CANCELLED', async () => {
      const store = fakeBookingsTable({ b1: { payment_status: 'escrow' } });
      const outcome = await settleForBookingStatus('b1', 'CANCELLED');
      expect(outcome).toBe('refunded');
      expect(store.b1.payment_status).toBe('refunded');
    });

    it('is a no-op for non-terminal statuses', async () => {
      const store = fakeBookingsTable({ b1: { payment_status: 'escrow' } });
      const outcome = await settleForBookingStatus('b1', 'CONFIRMED');
      expect(outcome).toBeNull();
      expect(store.b1.payment_status).toBe('escrow');
    });

    it('is a no-op when there are no escrowed funds (manual completion without payment)', async () => {
      const store = fakeBookingsTable({ b1: { payment_status: null } });
      const outcome = await settleForBookingStatus('b1', 'COMPLETED');
      expect(outcome).toBeNull();
      expect(store.b1.payment_status).toBeNull();
    });

    it('does not double-settle if booking status churns through COMPLETED twice', async () => {
      const store = fakeBookingsTable({ b1: { payment_status: 'escrow' } });
      await settleForBookingStatus('b1', 'COMPLETED');
      // Second call: already released, settler should see no escrow and no-op.
      const second = await settleForBookingStatus('b1', 'COMPLETED');
      expect(second).toBeNull();
      expect(store.b1.payment_status).toBe('released');
    });
  });

  describe('full booking lifecycle', () => {
    it('happy path: pending → escrow → released', async () => {
      const store = fakeBookingsTable({ b1: { payment_status: 'pending' } });
      await holdInEscrow('b1');
      expect(store.b1.payment_status).toBe('escrow');
      await settleForBookingStatus('b1', 'COMPLETED');
      expect(store.b1.payment_status).toBe('released');
    });

    it('cancellation path: pending → escrow → refunded', async () => {
      const store = fakeBookingsTable({ b1: { payment_status: 'pending' } });
      await holdInEscrow('b1');
      await settleForBookingStatus('b1', 'CANCELLED');
      expect(store.b1.payment_status).toBe('refunded');
    });
  });
});
