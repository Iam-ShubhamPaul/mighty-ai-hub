import { aj } from "@/config/Arcjet";
import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function POST(req) {
  const user = await currentUser();

  // Safely read JSON body
  let body = {};
  try {
    body = await req.json();
  } catch (err) {
    body = {};
  }

  const token = body?.token ?? null;

  // CASE 1: Token provided
  if (token) {
    const decision = await aj.protect(req, {
      userId: user?.primaryEmailAddress?.emailAddress,
      requested: token,
    });

    if (decision.isDenied()) {
      return NextResponse.json({
        error: "Too many requests",
        remainingToken: decision.reason.remaining,
      });
    }

    return NextResponse.json({
      allowed: true,
      remainingToken: decision.reason.remaining,
    });
  }

  // CASE 2: No token (request body empty)
  const decision = await aj.protect(req, {
    userId: user?.primaryEmailAddress?.emailAddress,
    requested: 0,
  });

  return NextResponse.json({
    remainingToken: decision.reason.remaining,
  });
}
