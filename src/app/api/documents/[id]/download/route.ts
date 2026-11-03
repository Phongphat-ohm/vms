import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { readFileFromStorage, verifySignedDownloadToken } from "@/lib/storage";
import { recordAuditLog } from "@/modules/audit/service";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: fileId } = await params;
    const searchParams = req.nextUrl.searchParams;
    const exp = searchParams.get("exp");
    const sig = searchParams.get("sig");

    const session = await getSession();

    // Check either signed token or valid authenticated session
    let isAuthorized = false;
    let userId = session?.id || "anonymous-signed-url";

    if (exp && sig) {
      isAuthorized = verifySignedDownloadToken(fileId, exp, sig);
    } else if (session && session.permissions.includes("document.read")) {
      isAuthorized = true;
    }

    if (!isAuthorized) {
      return NextResponse.json(
        { error: "ลิงก์ดาวน์โหลดหมดอายุ หรือไม่มีสิทธิ์เข้าถึงเอกสารนี้" },
        { status: 403 }
      );
    }

    const file = await prisma.file.findUnique({
      where: { id: fileId },
    });

    if (!file) {
      return NextResponse.json({ error: "ไม่พบไฟล์เอกสารในระบบ" }, { status: 404 });
    }

    // Verify village isolation if session exists
    if (session && !session.roles.includes("SYSTEM_ADMIN") && !session.allowedVillageIds.includes(file.villageId)) {
      return NextResponse.json({ error: "ไม่มีสิทธิ์เข้าถึงไฟล์ของหมู่บ้านนี้" }, { status: 403 });
    }

    const buffer = await readFileFromStorage(file.storagePath);
    if (!buffer) {
      return NextResponse.json({ error: "ไฟล์ในพื้นที่จัดเก็บสูญหายหรือไม่พบไฟล์" }, { status: 404 });
    }

    // Record PDPA audit log
    await recordAuditLog({
      villageId: file.villageId,
      userId,
      module: "document",
      action: "SENSITIVE_VIEW",
      entityType: "File",
      entityId: file.id,
      details: {
        originalName: file.originalName,
        fileSizeBytes: Number(file.fileSizeBytes),
      },
      ipAddress: req.headers.get("x-forwarded-for") || "127.0.0.1",
    });

    const encodedFilename = encodeURIComponent(file.originalName);

    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        "Content-Type": file.mimeType || "application/octet-stream",
        "Content-Length": String(buffer.length),
        "Content-Disposition": `inline; filename="${encodedFilename}"; filename*=UTF-8''${encodedFilename}`,
        "Cache-Control": "private, no-cache, no-store, must-revalidate",
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "เกิดข้อผิดพลาดในการดาวน์โหลด" }, { status: 500 });
  }
}
