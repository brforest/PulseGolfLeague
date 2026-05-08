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
    phoneNumber: playerInfo.phone.trim(),
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
    autocomplete: true,
    note,
  });

  return response.payment.id;
}
