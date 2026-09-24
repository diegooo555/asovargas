// app/api/whatsapp/webhook/route.ts
import { NextRequest, NextResponse } from "next/server";

// Verificación: Meta llama con GET al guardar la URL
export async function GET(req: NextRequest) {
    const params = req.nextUrl.searchParams;
    const mode = params.get("hub.mode");
    const token = params.get("hub.verify_token");
    const challenge = params.get("hub.challenge");

    if (mode === "subscribe" && token === process.env.WA_VERIFY_TOKEN) {
        return new NextResponse(challenge, { status: 200 });
    }
    return new NextResponse("Forbidden", { status: 403 });
}

// Eventos: mensajes entrantes y estados de envío
export async function POST(req: NextRequest) {
    const body = await req.json();
    console.log(JSON.stringify(body, null, 2));
    // Aquí procesas: body.entry[0].changes[0].value.statuses o .messages
    return NextResponse.json({ ok: true }); // responde 200 rápido siempre
}