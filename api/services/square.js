import pkg from 'square';
const { Client } = pkg;
import { randomUUID } from 'crypto';

const client = new Client({
  accessToken: process.env.SQUARE_ACCESS_TOKEN,
  environment:
    process.env.SQUARE_ENV === 'production' ? 'production' : 'sandbox',
});

/**
 * Find an existing Square Customer by email, or create a new one.
 * Returns the Square customer ID string.
 */
export async function createOrFindCustomer(playerInfo) {
  // Search first to avoid duplicates
  const { result: searchResult } = await client.customersApi.searchCustomers({
    query: {
      filter: {
        emailAddress: { exact: playerInfo.email.toLowerCase().trim() },
      },
    },
  });

  if (searchResult.customers?.length > 0) {
    return searchResult.customers[0].id;
  }

  const { result } = await client.customersApi.createCustomer({
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

  return result.customer.id;
}

/**
 * Save a card on file using the one-time nonce from the frontend.
 * Returns the saved Square card ID.
 */
export async function saveCardOnFile(nonce, customerId, playerInfo) {
  const { result } = await client.cardsApi.createCard({
    idempotencyKey: randomUUID(),
    sourceId: nonce,
    card: {
      customerId,
      cardholderName: `${playerInfo.firstName.trim()} ${playerInfo.lastName.trim()}`,
    },
  });

  return result.card.id;
}

/**
 * Charge a previously saved card.
 * Returns the Square payment ID.
 */
export async function chargeCard({ customerId, cardId, amountCents, note }) {
  const { result } = await client.paymentsApi.createPayment({
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

  return result.payment.id;
}
