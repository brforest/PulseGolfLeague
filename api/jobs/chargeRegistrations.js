import cron from 'node-cron';
import pool from '../db/index.js';
import { chargeCard } from '../services/square.js';
import { sendChargeEmail } from '../services/email.js';

/**
 * Finds all registrations whose scheduled_charge_date is today or in the past
 * with charge_status = 'pending', and attempts to charge each card on file.
 *
 * On success: marks the row 'charged', records the Square payment ID.
 * On failure: marks the row 'failed', records the error message.
 * Either way, every other pending row is still attempted independently.
 */
export async function runChargeJob() {
  const startedAt = new Date().toISOString();
  console.log(`[charge-job] Started at ${startedAt}`);

  let rows;
  try {
    const result = await pool.query(
      `SELECT * FROM registrations
       WHERE charge_status = 'pending'
         AND scheduled_charge_date <= CURRENT_DATE
         AND active = TRUE
       ORDER BY registered_at ASC`
    );
    rows = result.rows;
  } catch (err) {
    console.error('[charge-job] DB query failed:', err);
    return;
  }

  if (rows.length === 0) {
    console.log('[charge-job] No pending registrations to charge — done.');
    return;
  }

  console.log(`[charge-job] Charging ${rows.length} registration(s).`);

  let succeeded = 0;
  let failed = 0;

  for (const reg of rows) {
    try {
      const paymentId = await chargeCard({
        customerId: reg.square_customer_id,
        cardId: reg.square_card_id,
        amountCents: reg.charge_amount_cents,
        note: 'Yolo Fliers Matchplay Championship — Entry Fee',
      });

      await pool.query(
        `UPDATE registrations
         SET charge_status      = 'charged',
             charged_at         = NOW(),
             square_payment_id  = $1,
             charge_error       = NULL
         WHERE id = $2`,
        [paymentId, reg.id]
      );

      succeeded++;
      console.log(`[charge-job] ✓ ${reg.email} — payment ${paymentId}`);

      const amountFormatted = `$${(reg.charge_amount_cents / 100).toFixed(2)} USD`;
      sendChargeEmail(
        { firstName: reg.first_name, lastName: reg.last_name, email: reg.email },
        { amountFormatted, paymentId }
      ).catch((err) =>
        console.error(`[charge-job] Charge email failed for ${reg.email}:`, err)
      );
    } catch (err) {
      failed++;
      const message = err?.errors?.[0]?.detail || err?.message || 'Unknown error';
      console.error(`[charge-job] ✗ ${reg.email} — ${message}`);

      await pool.query(
        `UPDATE registrations
         SET charge_status = 'failed',
             charge_error  = $1
         WHERE id = $2`,
        [message, reg.id]
      );
    }
  }

  console.log(
    `[charge-job] Complete — ${succeeded} charged, ${failed} failed out of ${rows.length} total.`
  );
}

/**
 * Schedule the charge job.
 * Runs daily at 09:00 America/Los_Angeles (16:00 UTC in summer).
 * Called once from server.js on startup.
 */
export function startChargeJob() {
  cron.schedule('0 9 * * *', runChargeJob, {
    timezone: 'America/Los_Angeles',
  });
  console.log('[charge-job] Scheduled — daily at 09:00 America/Los_Angeles');
}
