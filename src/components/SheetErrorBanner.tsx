"use client";

import type { SheetErrorCode } from "@/lib/sheetErrors";
import { SHEET_ERROR_MESSAGES } from "@/lib/sheetErrors";

interface Props {
  errorCode: SheetErrorCode;
  onRetry: () => void;
}

export default function SheetErrorBanner({ errorCode, onRetry }: Props) {
  const { title, description } = SHEET_ERROR_MESSAGES[errorCode];

  return (
    <div className="bg-red-50 border border-red-200 rounded-xl p-4">
      <div className="flex items-start gap-3">
        <span className="text-lg shrink-0">⚠️</span>
        <div className="flex-1">
          <p className="font-semibold text-red-700 text-sm">{title}</p>
          <p className="text-xs text-red-600 mt-0.5">{description}</p>
        </div>
      </div>
      <button
        onClick={onRetry}
        className="mt-3 text-xs text-red-600 border border-red-300 rounded px-3 py-1 hover:bg-red-100"
      >
        다시 시도
      </button>
    </div>
  );
}
