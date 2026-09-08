import { test } from 'node:test';
import assert from 'node:assert/strict';
import { getSecretKey, initializePaystackTransaction, toPaystackSubunit } from '../lib/paystack.ts';
const input = { email: 'test@example.com', amount: 2000, currency: 'USD', reference: 'NS-test', callbackUrl: 'https://example.com/payment/callback', metadata: {} };
test('payment initialization failure and success paths', async () => {
  const oldKey = process.env.PAYSTACK_SECRET_KEY;
  const oldFetch = globalThis.fetch;
  try {
    delete process.env.PAYSTACK_SECRET_KEY;
    assert.throws(getSecretKey, { code: 'PAYMENT_CONFIGURATION' });
    process.env.PAYSTACK_SECRET_KEY = 'pk_test_example';
    assert.throws(getSecretKey, { code: 'PAYMENT_CONFIGURATION' });
    process.env.PAYSTACK_SECRET_KEY = '  sk_test_example  ';
    assert.equal(getSecretKey(), 'sk_test_example');
    assert.equal(toPaystackSubunit(20), 2000);
    for (const [status, message, code] of [[401, 'Invalid key', 'PAYMENT_CONFIGURATION'], [400, 'Currency not supported by merchant', 'PAYMENT_CURRENCY_UNAVAILABLE'], [400, 'Other error', 'PAYSTACK_REJECTED']]) {
      globalThis.fetch = async () => Response.json({ status: false, message }, { status });
      await assert.rejects(initializePaystackTransaction(input), { code });
    }
    globalThis.fetch = async () => new Response('gateway error', { status: 502 });
    await assert.rejects(initializePaystackTransaction(input), { code: 'PAYSTACK_RESPONSE' });
    globalThis.fetch = async () => { throw new Error('timeout'); };
    await assert.rejects(initializePaystackTransaction(input), { code: 'PAYSTACK_UNAVAILABLE' });
    globalThis.fetch = async (_url, init) => {
      assert.equal(init.headers.Authorization, 'Bearer sk_test_example');
      assert.equal(JSON.parse(init.body).amount, '2000');
      assert.equal(JSON.parse(init.body).currency, 'USD');
      return Response.json({ status: true, data: { reference: input.reference, authorization_url: 'https://checkout.paystack.com/test', access_code: 'test' } });
    };
    assert.equal((await initializePaystackTransaction(input)).reference, input.reference);
  } finally {
    globalThis.fetch = oldFetch;
    if (oldKey === undefined) delete process.env.PAYSTACK_SECRET_KEY;
    else process.env.PAYSTACK_SECRET_KEY = oldKey;
  }
});
