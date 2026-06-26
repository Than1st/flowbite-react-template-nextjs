import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      imageUrl?: string;
      ssoToken?: string;
    };

    const imageUrl = body.imageUrl?.trim();
    const ssoToken = body.ssoToken?.trim();

    if (!imageUrl?.startsWith("http")) {
      return NextResponse.json({ error: "URL gambar tidak valid" }, { status: 400 });
    }

    if (!imageUrl.includes("api.kai.id")) {
      return NextResponse.json({ dataUri: imageUrl, direct: true });
    }

    if (!ssoToken) {
      return NextResponse.json({ error: "SSO token tidak tersedia" }, { status: 401 });
    }

    const response = await fetch(imageUrl, {
      headers: { Authorization: `Bearer ${ssoToken}` },
      cache: "no-store",
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: "Gagal mengambil gambar", status: response.status },
        { status: response.status },
      );
    }

    const contentType =
      response.headers.get("content-type")?.split(";")[0] || "image/jpeg";
    const buffer = Buffer.from(await response.arrayBuffer());
    const base64 = buffer.toString("base64");

    return NextResponse.json({
      dataUri: `data:${contentType};base64,${base64}`,
    });
  } catch {
    return NextResponse.json({ error: "Kesalahan server" }, { status: 500 });
  }
}
