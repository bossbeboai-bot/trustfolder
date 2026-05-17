import { NextResponse } from 'next/server';
import { requireAdminApi } from '@/lib/admin-auth';
import {
  artifactToBody,
  buildAllPreviewZip,
  buildPreviewArtifact,
  getPackagePreview,
  type PackagePreviewId,
} from '@/lib/admin-package-previews';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(
  _req: Request,
  { params }: { params: { pack: string } },
) {
  const auth = requireAdminApi();
  if (!auth.ok) return NextResponse.json(auth.body, { status: auth.status });

  if (params.pack === 'all') {
    const body = await buildAllPreviewZip();
    return new NextResponse(toArrayBuffer(body), {
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': 'attachment; filename="trustfolder-all-package-previews.zip"',
        'Cache-Control': 'no-store',
      },
    });
  }

  const catalogItem = getPackagePreview(params.pack);
  if (!catalogItem) {
    return NextResponse.json({ error: 'unknown_package_preview' }, { status: 404 });
  }

  const artifact = await buildPreviewArtifact(catalogItem.id as PackagePreviewId);
  const body = await artifactToBody(artifact);
  return new NextResponse(toArrayBuffer(body), {
    headers: {
      'Content-Type': artifact.contentType,
      'Content-Disposition': `${artifact.disposition}; filename="${artifact.filename}"`,
      'Cache-Control': 'no-store',
    },
  });
}

function toArrayBuffer(buffer: Buffer): ArrayBuffer {
  return buffer.buffer.slice(
    buffer.byteOffset,
    buffer.byteOffset + buffer.byteLength,
  ) as ArrayBuffer;
}
