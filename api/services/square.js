import { SquareClient, SquareEnvironment } from 'square';
import { randomUUID } from 'crypto';

const client = new SquareClient({
  token: process.env.SQUARE_ACCESS_TOKEN,
  environment:
    process.env.SQUARE_ENV === 'production'
      ? SquareEnvironment.Production
      : SquareEnvironment.Sandbox,
});

/**
 * Find an existing Square Customer by email, or create a new one.
 * Returns the Square customer ID string.
 */
/**
 * Normalise a phone number to E.164 format (+1XXXXXXXXXX for US/CA).
 * Strips all non-digit characters, then prepends +1 if 10 digits remain.
 * If 11 digits and starts with 1, prepends +.
 * Falls back to the original trimmed string so Square can surface its own error.
 */
function normalizePhone(raw) {
  const digits = raw.replace(/\D/g, '');
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits.startsWith('1')) return `+${digits}`;
  // Already has country code or non-US — return as-is with + prefix if missing
  return digits.length > 0 ? `+${digits}` : raw.trim();
}

export async function createOrFindCustomer(playerInfo) {
  // Search first to avoid duplicates
  const searchResponse = await client.customers.search({
    query: {
      filter: {
        emailAddress: { exact: playerInfo.email.toLowerCase().trim() },
      },
    },
  });

  if (searchResponse.customers?.length > 0) {
    return searchResponse.customers[0].id;
  }

  const createResponse = await client.customers.create({
    idempotencyKey: randomUUID(),
    emailAddress: playerInfo.email.toLowerCase().trim(),
    givenName: playerInfo.firstName.trim(),
    familyName: playerInfo.lastName.trim(),
    phoneNumber: normalizePhone(playerInfo.phone),
    address: {
      addressLine1: playerInfo.address.trim(),
      locality: playerInfo.city.trim(),
      administrativeDistrictLevel1: playerInfo.state.trim(),
      postalCode: playerInfo.zip.trim(),
    },
    note: [
      `PGL Registration`,
      playerInfo.playingStatus,
      playerInfo.ghinNumber ? `GHIN: ${playerInfo.ghinNumber}` : null,
      playerInfo.homeCourse,
    ]
      .filter(Boolean)
      .join(' · '),
  });

  return createResponse.customer.id;
}

/**
 * Save a card on file using the one-time nonce from the frontend.
 * Returns the saved Square card ID.
 */
export async function saveCardOnFile(nonce, customerId, playerInfo) {
  const response = await client.cards.create({
    idempotencyKey: randomUUID(),
    sourceId: nonce,
    card: {
      customerId,
      cardholderName: `${playerInfo.firstName.trim()} ${playerInfo.lastName.trim()}`,
    },
  });

  return response.card.id;
}

/**
 * Charge a previously saved card.
 * Returns the Square payment ID.
 *
 * locationId is passed explicitly (from SQUARE_LOCATION_ID) rather than left
 * for Square to infer. Without it, Square falls back to the account's default
 * location — if that location isn't enabled for card-not-present/online
 * processing, every card-on-file charge can come back GENERIC_DECLINE
 * regardless of the card itself.
 */
export async function chargeCard({ customerId, cardId, amountCents, note }) {
  const response = await client.payments.create({
    idempotencyKey: randomUUID(),
    sourceId: cardId,
    customerId,
    amountMoney: {
      amount: BigInt(amountCents),
      currency: 'USD',
    },
    ...(process.env.SQUARE_LOCATION_ID && { locationId: process.env.SQUARE_LOCATION_ID }),
    autocomplete: true,
    note,
  });

  return response.payment.id;
}

// Human-readable guidance for Square's card decline codes, keyed by the
// `code` field on the API error (not the `detail` text, which is less stable).
// See https://developer.squareup.com/docs/payments-api/error-codes
const DECLINE_HINTS = {
  GENERIC_DECLINE:
    "The card issuer declined the charge without a specific reason. This is common for stored-card charges — the bank's fraud/risk system may be blocking it, the account may be closed, or there may be insufficient funds. Ask the player to contact their bank to authorize the charge, or have them add a different card via the Update Payment page.",
  CVV_FAILURE: 'The saved CVV no longer matches the card. Ask the player to re-add their card via the Update Payment page.',
  ADDRESS_VERIFICATION_FAILURE: "The billing address on file no longer matches the card. Ask the player to re-add their card via the Update Payment page.",
  CARD_EXPIRED: 'This card has expired. Ask the player to add a new card via the Update Payment page.',
  CARD_NOT_SUPPORTED: 'This card type is not supported for this charge.',
  INSUFFICIENT_FUNDS: 'The card was declined for insufficient funds.',
  INVALID_ACCOUNT: 'The card account is invalid or closed. Ask the player to add a new card via the Update Payment page.',
  INVALID_EXPIRATION: 'The card expiration on file is invalid. Ask the player to add a new card via the Update Payment page.',
  TRANSACTION_LIMIT: "This charge exceeds a limit set by the card issuer.",
};

/**
 * Extracts a human-friendly message + optional remediation hint from a Square
 * SDK error thrown by chargeCard(). Falls back gracefully for non-Square errors.
 */
export function describeSquareError(err) {
  const squareError = err?.errors?.[0];
  const code = squareError?.code;
  const message = squareError?.detail || err?.message || 'Unknown error';
  const hint = code ? DECLINE_HINTS[code] : undefined;
  return { message, code, hint };
}

