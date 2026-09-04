import { createServiceClient } from "@/lib/supabase/service";

export async function logPaymentEvent(input: {
  reference?: string | null;
  eventType: string;
  source: "initialize" | "callback" | "webhook" | "admin";
  status: "INFO" | "SUCCESS" | "FAILED";
  error?: string | null;
}) {
  try {
    await createServiceClient().from("payment_events").insert({
      reference: input.reference || null,
      event_type: input.eventType,
      source: input.source,
      status: input.status,
      error_message: input.error?.slice(0, 500) || null,
    });
  } catch (error) {
    console.error("Payment event logging failed:", error);
  }
}
