import {
  NextRequest,
  NextResponse,
} from "next/server";

import type {
  UploadApiResponse,
} from "cloudinary";

import {
  hasPermission,
} from "@/lib/business";

import {
  cloudinary,
} from "@/lib/cloudinary";

import {
  requireAdminApi,
} from "@/lib/admin-api-auth";

export const runtime =
  "nodejs";

export const dynamic =
  "force-dynamic";

// Stay below Vercel's 4.5 MB total request limit, including multipart overhead.
const MAX_FILE_SIZE =
  4 * 1024 * 1024;

const ALLOWED_TYPES =
  new Set([
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/avif",
  ]);

export async function POST(
  request:
    NextRequest,
) {
  try {
    const admin =
      await requireAdminApi();

    if (
      !admin ||
      !hasPermission(
        admin.role,
        "products",
      )
    ) {
      return NextResponse.json(
        {
          error:
            "Unauthorized.",
        },
        {
          status: 401,
        },
      );
    }

    const formData =
      await request.formData();

    const file =
      formData.get(
        "file",
      );

    if (
      !(file instanceof File)
    ) {
      return NextResponse.json(
        {
          error:
            "Image file is required.",
        },
        {
          status: 400,
        },
      );
    }

    if (
      !ALLOWED_TYPES.has(
        file.type,
      )
    ) {
      return NextResponse.json(
        {
          error:
            "Only JPG, PNG, WEBP and AVIF images are allowed.",
        },
        {
          status: 400,
        },
      );
    }

    if (
      file.size >
      MAX_FILE_SIZE
    ) {
      return NextResponse.json(
        {
          error:
            "Image must be 4MB or smaller. Please optimize the image before uploading.",
        },
        {
          status: 400,
        },
      );
    }

    if (
      !process.env.CLOUDINARY_CLOUD_NAME ||
      !process.env.CLOUDINARY_API_KEY ||
      !process.env.CLOUDINARY_API_SECRET
    ) {
      console.error("Product upload: Cloudinary configuration is incomplete.");
      return NextResponse.json(
        { error: "Image storage is not configured. Check Cloudinary environment variables in Vercel." },
        { status: 503 },
      );
    }

    const bytes =
      await file.arrayBuffer();

    const buffer =
      Buffer.from(
        bytes,
      );

    const uploaded =
      await new Promise<UploadApiResponse>(
        (
          resolve,
          reject,
        ) => {
          const stream =
            cloudinary.uploader.upload_stream(
              {
                folder:
                  "kingdropp/products",

                resource_type:
                  "image",

                overwrite:
                  false,

                unique_filename:
                  true,

                use_filename:
                  false,

                transformation: [
                  {
                    quality:
                      "auto",

                    fetch_format:
                      "auto",
                  },
                ],
              },

              (
                error,
                result,
              ) => {
                if (
                  error ||
                  !result
                ) {
                  reject(
                    error ??
                      new Error(
                        "Upload failed.",
                      ),
                  );

                  return;
                }

                resolve(
                  result,
                );
              },
            );

          stream.end(
            buffer,
          );
        },
      );

    return NextResponse.json(
      {
        image: {
          url:
            uploaded.secure_url,

          publicId:
            uploaded.public_id,

          width:
            uploaded.width,

          height:
            uploaded.height,

          format:
            uploaded.format,

          bytes:
            uploaded.bytes,
        },
      },
      {
        status: 201,
      },
    );
  } catch (error) {
    console.error(
      "Product image upload error:",
      error,
    );

    return NextResponse.json(
      {
        error:
          "Unable to upload product image.",
      },
      {
        status: 500,
      },
    );
  }
}