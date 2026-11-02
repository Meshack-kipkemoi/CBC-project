// @/lib/api.ts

import { NextResponse } from "next/server";

export type ApiResponse<T = null> = {
  message: string;
  data: T;
  success: boolean;
};

type CreateResponseProps<T> = {
  status: number;
  message: string;
  data?: T;
  success?: boolean;
};

export function createResponse<T>({
  status,
  message,
  data,
  success,
}: CreateResponseProps<T>): NextResponse<ApiResponse<T | null>> {
  // Success is either explicitly passed OR inferred from status
  const isSuccess = success ?? (status >= 200 && status < 300);

  return NextResponse.json(
    { message, data: data ?? null, success: isSuccess },
    { status },
  );
}
