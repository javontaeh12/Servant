import { getSquareClient, SQUARE_LOCATION_ID } from "./square";

interface InvoiceParams {
  clientName: string;
  clientEmail: string;
  eventType: string;
  eventDate: string;
  finalTotal: number;     // Total in dollars
  depositAmount: number;  // Deposit in dollars
}

export async function createInvoiceForBooking(params: InvoiceParams) {
  const client = await getSquareClient();
  const locationId = SQUARE_LOCATION_ID;

  // 1. Search for existing customer by email, or create new one
  let customerId: string;

  const searchResult = await client.customers.search({
    query: {
      filter: {
        emailAddress: { exact: params.clientEmail },
      },
    },
  });

  if (searchResult.customers && searchResult.customers.length > 0) {
    customerId = searchResult.customers[0].id!;
  } else {
    const nameParts = params.clientName.split(" ");
    const createResult = await client.customers.create({
      givenName: nameParts[0] || params.clientName,
      familyName: nameParts.slice(1).join(" ") || undefined,
      emailAddress: params.clientEmail,
    });
    customerId = createResult.customer!.id!;
  }

  // 2. Create an Order (OPEN state) with one line item for the catering total
  const totalCents = BigInt(Math.round(params.finalTotal * 100));

  const orderResult = await client.orders.create({
    order: {
      locationId,
      customerId,
      lineItems: [
        {
          name: `Catering - ${params.eventType}`,
          quantity: "1",
          basePriceMoney: {
            amount: totalCents,
            currency: "USD",
          },
        },
      ],
      state: "OPEN",
    },
  });

  const orderId = orderResult.order!.id!;

  // 3. Calculate deposit in cents
  const depositCents = BigInt(Math.round(params.depositAmount * 100));

  // Deposit due date: 3 days from now
  const now = new Date();
  const depositDue = new Date(now);
  depositDue.setDate(now.getDate() + 3);

  // Balance due date: 3 days before event
  const eventDateObj = new Date(params.eventDate + "T00:00:00");
  const balanceDue = new Date(eventDateObj);
  balanceDue.setDate(eventDateObj.getDate() - 3);

  // Square requires deposit due BEFORE balance due.
  // For close events, the balance date can land before the deposit date.
  // Fix: push balance to at least 1 day after deposit.
  if (balanceDue.getTime() <= depositDue.getTime()) {
    balanceDue.setTime(depositDue.getTime());
    balanceDue.setDate(balanceDue.getDate() + 1);
  }

  const depositDueStr = depositDue.toISOString().split("T")[0];
  const balanceDueStr = balanceDue.toISOString().split("T")[0];

  // If deposit would be on or after the event, skip the split and use a single balance payment
  const useDepositSplit = depositDue < eventDateObj;

  // 4. Create Invoice with payment request(s)
  const invoiceResult = await client.invoices.create({
    invoice: {
      orderId,
      locationId,
      primaryRecipient: {
        customerId,
      },
      paymentRequests: useDepositSplit
        ? [
            {
              requestType: "DEPOSIT",
              fixedAmountRequestedMoney: {
                amount: depositCents,
                currency: "USD",
              },
              dueDate: depositDueStr,
              tippingEnabled: false,
            },
            {
              requestType: "BALANCE",
              dueDate: balanceDueStr,
              tippingEnabled: false,
            },
          ]
        : [
            {
              requestType: "BALANCE",
              dueDate: eventDateObj.toISOString().split("T")[0],
              tippingEnabled: false,
            },
          ],
      deliveryMethod: "EMAIL",
      title: `Catering Invoice - ${params.eventType}`,
      description: `Event: ${params.eventType}\nDate: ${params.eventDate}\nClient: ${params.clientName}`,
      acceptedPaymentMethods: {
        card: true,
        bankAccount: true,
        squareGiftCard: false,
        buyNowPayLater: false,
      },
    },
    idempotencyKey: `invoice-${orderId}-${Date.now()}`,
  });

  const invoiceId = invoiceResult.invoice!.id!;
  const invoiceVersion = invoiceResult.invoice!.version!;

  // 5. Publish the invoice (triggers Square to email the client)
  const publishResult = await client.invoices.publish({
    invoiceId,
    version: invoiceVersion,
  });

  const publicUrl = publishResult.invoice?.publicUrl || "";

  return {
    invoiceId,
    invoiceUrl: publicUrl,
  };
}
