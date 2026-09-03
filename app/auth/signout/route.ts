import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const supabase = await createClient();
  await supabase.auth.signOut();
  const url = new URL("/login", request.url);
  if (new URL(request.url).searchParams.get("banned") === "1") {
    url.searchParams.set("banned", "1");
  }
  return NextResponse.redirect(url);
}
