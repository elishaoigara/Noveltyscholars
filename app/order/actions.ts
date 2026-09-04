"use server";

import { randomUUID } from "crypto";
import { z } from "zod";
import { calculatePrice } from "@/lib/utils";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";

const orderInputSchema = z.object({
  service_id: z.string().uuid(),
  subject: z.string().trim().min(2).max(120),
  topic: z.string().trim().min(2).max(300),
  academic_level: z.enum(["High School", "Bachelors", "Masters", "PhD"]),
  pages: z.number().int().min(1).max(50),
  deadline: z.string().date(),
  description: z.string().trim().min(10).max(10_000),
  lms_platform: z.string().trim().max(100).optional(),
  class_duration: z.string().trim().max(100).optional(),
  exam_date: z.preprocess(
    (value) => value === "" || value === null ? undefined : value,
    z.string().date().optional()
  ),
  exam_duration: z.string().trim().max(100).optional(),
});

export type CreateOrderInput = z.infer<typeof orderInputSchema>;

type CreateOrderResult = {
  success: boolean;
  orderId?: string;
  error?: string;
  field?: keyof CreateOrderInput;
};

const fieldLabels: Partial<Record<keyof CreateOrderInput, string>> = {
  service_id: "service",
  subject: "subject",
  topic: "topic",
  academic_level: "academic level",
  pages: "number of pages",
  deadline: "deadline",
  description: "instructions",
  lms_platform: "learning platform",
  class_duration: "class duration",
  exam_date: "exam date",
  exam_duration: "exam duration",
};

function isAllowedDate(dateString: string): boolean {
  const selected = new Date(`${dateString}T00:00:00Z`);
  const tomorrow = new Date();
  tomorrow.setUTCHours(0, 0, 0, 0);
  tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
  const latest = new Date(tomorrow);
  latest.setUTCDate(latest.getUTCDate() + 59);
  return selected >= tomorrow && selected <= latest;
}

export async function createOrderAction(input: CreateOrderInput): Promise<CreateOrderResult> {
  const parsed = orderInputSchema.safeParse(input);
  if (!parsed.success) {
    const field = parsed.error.issues[0]?.path[0] as keyof CreateOrderInput | undefined;
    const label = field ? fieldLabels[field] : undefined;
    return {
      success: false,
      error: label ? `Please check the ${label}.` : "Please review the order details and try again.",
      field,
    };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "You must be logged in to place an order." };
  }

  const serviceClient = createServiceClient();
  const { data: profile } = await serviceClient
    .from("profiles")
    .select("is_banned")
    .eq("id", user.id)
    .single();

  if (!profile || profile.is_banned) {
    return { success: false, error: "This account cannot place orders." };
  }

  const { data: service, error: serviceError } = await serviceClient
    .from("services")
    .select("id, base_price, service_type")
    .eq("id", parsed.data.service_id)
    .single();

  if (serviceError || !service) {
    return { success: false, error: "The selected service is unavailable." };
  }

  const isOnlineClass = service.service_type === "ONLINE_CLASS";
  const isOnlineExam = service.service_type === "ONLINE_EXAM";
  const effectiveDeadline = isOnlineExam && parsed.data.exam_date
    ? parsed.data.exam_date
    : parsed.data.deadline;

  if (!isAllowedDate(effectiveDeadline)) {
    return { success: false, error: "Choose a deadline between tomorrow and 60 days from now." };
  }

  if ((isOnlineClass || isOnlineExam) && !parsed.data.lms_platform) {
    return { success: false, error: "Select the relevant learning platform." };
  }

  if (isOnlineClass && !parsed.data.class_duration) {
    return { success: false, error: "Select the class duration." };
  }

  if (isOnlineExam && !parsed.data.exam_date) {
    return { success: false, error: "Select the exam date." };
  }

  const pages = isOnlineClass || isOnlineExam ? 1 : parsed.data.pages;
  const academicLevel = isOnlineClass || isOnlineExam
    ? "High School"
    : parsed.data.academic_level;
  const totalPrice = calculatePrice(
    service.base_price,
    pages,
    effectiveDeadline,
    academicLevel
  );

  const detailLines = [parsed.data.description];
  if (parsed.data.lms_platform) detailLines.push(`Platform: ${parsed.data.lms_platform}`);
  if (isOnlineClass && parsed.data.class_duration) {
    detailLines.push(`Class duration: ${parsed.data.class_duration}`);
  }
  if (isOnlineExam && parsed.data.exam_date) {
    detailLines.push(`Exam date: ${parsed.data.exam_date}`);
    if (parsed.data.exam_duration) detailLines.push(`Exam duration: ${parsed.data.exam_duration}`);
  }

  const orderCode = `ORD-${randomUUID().replace(/-/g, "").slice(0, 8).toUpperCase()}`;
  const { data: order, error: orderError } = await serviceClient
    .from("orders")
    .insert({
      order_code: orderCode,
      user_id: user.id,
      service_id: service.id,
      subject: parsed.data.subject,
      topic: parsed.data.topic,
      academic_level: academicLevel,
      pages,
      words: pages * 250,
      deadline: effectiveDeadline,
      description: detailLines.join("\n\n"),
      total_price: totalPrice,
      status: "PENDING_PAYMENT",
      lms_platform: parsed.data.lms_platform || null,
      login_credentials: null,
      class_duration: isOnlineClass ? parsed.data.class_duration || null : null,
      discount_code: null,
      discount_amount: 0,
      final_price: null,
    })
    .select("id")
    .single();

  if (orderError || !order) {
    console.error("Order creation failed:", orderError);
    return { success: false, error: "The order could not be created. Please try again." };
  }

  return { success: true, orderId: order.id };
}
