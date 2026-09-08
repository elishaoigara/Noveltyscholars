const PAYSTACK_API_URL = "https://api.paystack.co";

type PaystackResponse<T> = {
  status: boolean;
  message: string;
  data: T;
};

export type PaystackInitializeData = {
  authorization_url: string;
  access_code: string;
  reference: string;
};

export type PaystackTransactionData = {
  id: number;
  status: string;
  reference: string;
  amount: number;
  currency: string;
  channel: string | null;
  paid_at: string | null;
  paidAt?: string | null;
  metadata?: Record<string, unknown> | string | null;
};

export class PaystackError extends Error {
  constructor(message: string, public readonly code: string, public readonly status = 502) {
    super(message);
    this.name = "PaystackError";
  }
}

export function getSecretKey(): string {
  const secretKey = process.env.PAYSTACK_SECRET_KEY?.trim();
  if (!secretKey || !/^sk_(test|live)_[a-zA-Z0-9]+$/.test(secretKey)) {
    throw new PaystackError("Payments are not configured correctly. Please contact support.", "PAYMENT_CONFIGURATION", 503);
  }
  return secretKey;
}

async function paystackRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const secretKey = getSecretKey();
  let response: Response;
  try {
    response = await fetch(`${PAYSTACK_API_URL}${path}`, {
      ...init,
      headers: {
        ...init?.headers,
        Authorization: `Bearer ${secretKey}`,
        "Content-Type": "application/json",
      },
      signal: AbortSignal.timeout(15000),
      cache: "no-store",
    });
  } catch {
    throw new PaystackError("Could not reach Paystack. Please try again shortly.", "PAYSTACK_UNAVAILABLE", 503);
  }

  let payload: PaystackResponse<T>;
  try {
    payload = await response.json();
  } catch {
    throw new PaystackError("Paystack returned an invalid response. Please try again shortly.", "PAYSTACK_RESPONSE", 502);
  }
  if (!response.ok || !payload?.status) {
    const message = typeof payload?.message === "string" ? payload.message : "";
    console.error("Paystack request rejected", {
      status: response.status,
      message: message.replaceAll(secretKey, "[redacted]").slice(0, 500),
    });
    if (response.status === 401 || response.status === 403 || /invalid.*key|secret.*key|unauthorized/i.test(message)) {
      throw new PaystackError("Payments are not configured correctly. Please contact support.", "PAYMENT_CONFIGURATION", 503);
    }
    if (/currency/i.test(message)) {
      throw new PaystackError("USD checkout is unavailable for this merchant. Please contact support to enable USD payments.", "PAYMENT_CURRENCY_UNAVAILABLE", 503);
    }
    // Never expose arbitrary provider responses or credentials to customers.
    throw new PaystackError("Paystack could not start this payment. Please contact support if this continues.", "PAYSTACK_REJECTED");
  }
  return payload.data;
}

export function toPaystackSubunit(amount: number): number {
  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error("Payment amount must be greater than zero");
  }

  return Math.round((amount + Number.EPSILON) * 100);
}

export async function initializePaystackTransaction(input: {
  email: string;
  amount: number;
  currency: string;
  reference: string;
  callbackUrl: string;
  metadata: Record<string, unknown>;
}): Promise<PaystackInitializeData> {
  return paystackRequest<PaystackInitializeData>("/transaction/initialize", {
    method: "POST",
    body: JSON.stringify({
      email: input.email,
      amount: input.amount.toString(),
      currency: input.currency,
      reference: input.reference,
      callback_url: input.callbackUrl,
      metadata: input.metadata,
    }),
  });
}

export async function verifyPaystackTransaction(
  reference: string
): Promise<PaystackTransactionData> {
  return paystackRequest<PaystackTransactionData>(
    `/transaction/verify/${encodeURIComponent(reference)}`
  );
}
