/**
 * Escrow simulation.
 *
 * Lifecycle:
 *   (no row)  → escrow      hold()      — funds captured at payment time
 *   escrow    → released    release()   — booking completed, lender paid
 *   escrow    → refunded    refund()    — booking cancelled/rejected, renter refunded
 *
 * Once a payment leaves `escrow` it is terminal. Re-entering escrow requires
 * a new booking. The transition functions are deliberately strict: passing a
 * booking that isn't in the expected source state throws — that's how we
 * catch double-releases and refund-after-payout bugs in tests and at runtime.
 *
 * This module is the single source of truth for payment-state transitions.
 * Application code (queries, screens) should never write `payment_status`
 * directly; it should call one of these functions.
 */

import { supabase } from './supabase';
import type { Booking, PaymentStatus } from './supabase';

export type EscrowOutcome = 'released' | 'refunded';

export class EscrowStateError extends Error {
  constructor(
    public readonly bookingId: string,
    public readonly currentStatus: PaymentStatus | null | undefined,
    public readonly attemptedTransition: string,
  ) {
    super(
      `Cannot ${attemptedTransition} booking ${bookingId}: payment_status is ` +
        `${currentStatus ?? '<null>'} (expected 'escrow').`,
    );
    this.name = 'EscrowStateError';
  }
}

async function getCurrentPaymentStatus(bookingId: string): Promise<PaymentStatus | null> {
  const { data, error } = await supabase
    .from('bookings')
    .select('payment_status')
    .eq('id', bookingId)
    .single();

  if (error) throw error;
  return (data?.payment_status as PaymentStatus | null) ?? null;
}

async function setPaymentStatus(
  bookingId: string,
  next: PaymentStatus,
): Promise<Booking> {
  const { data, error } = await supabase
    .from('bookings')
    .update({ payment_status: next })
    .eq('id', bookingId)
    .select()
    .single();

  if (error) throw error;
  return data as Booking;
}

/**
 * Capture funds into escrow at payment time. Idempotent: a booking already
 * in escrow stays in escrow.
 */
export async function holdInEscrow(bookingId: string): Promise<Booking> {
  const current = await getCurrentPaymentStatus(bookingId);
  if (current === 'escrow') {
    // Idempotent re-call (e.g. retry after network flake).
    return setPaymentStatus(bookingId, 'escrow');
  }
  if (current && current !== 'pending') {
    throw new EscrowStateError(bookingId, current, 'hold');
  }
  return setPaymentStatus(bookingId, 'escrow');
}

/**
 * Release escrowed funds to the lender. Only valid from `escrow`.
 */
export async function releaseEscrow(bookingId: string): Promise<Booking> {
  const current = await getCurrentPaymentStatus(bookingId);
  if (current !== 'escrow') {
    throw new EscrowStateError(bookingId, current, 'release');
  }
  return setPaymentStatus(bookingId, 'released');
}

/**
 * Refund escrowed funds to the renter. Only valid from `escrow`.
 */
export async function refundEscrow(bookingId: string): Promise<Booking> {
  const current = await getCurrentPaymentStatus(bookingId);
  if (current !== 'escrow') {
    throw new EscrowStateError(bookingId, current, 'refund');
  }
  return setPaymentStatus(bookingId, 'refunded');
}

/**
 * Settle the escrow for a booking that just changed status. Returns the
 * outcome applied, or `null` if no transition was applicable (e.g. booking
 * is still PENDING, or payment was never escrowed).
 *
 * Called by `updateBookingStatus` so the lifecycle stays in lockstep with
 * the booking status, without callers needing to know the rules.
 */
export async function settleForBookingStatus(
  bookingId: string,
  bookingStatus: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED',
): Promise<EscrowOutcome | null> {
  if (bookingStatus !== 'COMPLETED' && bookingStatus !== 'CANCELLED') {
    return null;
  }

  const current = await getCurrentPaymentStatus(bookingId);
  if (current !== 'escrow') {
    // Nothing to settle — either no payment was made or it was already
    // released/refunded. Not an error: a lender can complete a booking that
    // never had escrowed funds (manual flow).
    return null;
  }

  if (bookingStatus === 'COMPLETED') {
    await releaseEscrow(bookingId);
    return 'released';
  }
  await refundEscrow(bookingId);
  return 'refunded';
}
