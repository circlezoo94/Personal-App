"use client";

import { useState } from "react";
import { loadHospitalMapping, saveHospitalMapping } from "@/lib/hospitalMapping";

interface Props {
  hospitals: string[];
  onClose: () => void;
  onSave: (mapping: Record<string, string>) => void;
}

export default function HospitalMappingModal({ hospitals, onClose, onSave }: Props) {
  const [mapping, setMapping] = useState<Record<string, string>>(() => loadHospitalMapping());

  function handleSave() {
    const filtered = Object.fromEntries(
      Object.entries(mapping).filter(([, v]) => v.trim() !== "")
    );
    saveHospitalMapping(filtered);
    onSave(filtered);
    onClose();
  }

  function handleReset() {
    setMapping({});
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-900">병원명 통합 관리</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <p className="px-6 py-3 text-xs text-gray-500 bg-gray-50 border-b border-gray-100">
          같은 병원이 다른 이름으로 입력된 경우, 표시할 이름으로 통합할 수 있습니다.
        </p>

        <div className="overflow-y-auto flex-1">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-gray-50">
              <tr className="border-b border-gray-100">
                <th className="text-left py-2 px-6 text-xs text-gray-500 font-medium uppercase w-1/2">원본 병원명</th>
                <th className="text-left py-2 px-6 text-xs text-gray-500 font-medium uppercase w-1/2">표시할 병원명</th>
              </tr>
            </thead>
            <tbody>
              {hospitals.map((h) => (
                <tr key={h} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="py-2.5 px-6 text-gray-700 text-xs font-medium">{h}</td>
                  <td className="py-2 px-6">
                    <input
                      type="text"
                      value={mapping[h] ?? ""}
                      onChange={(e) =>
                        setMapping((prev) => ({ ...prev, [h]: e.target.value }))
                      }
                      placeholder={h}
                      className="w-full text-xs border border-gray-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-purple-400"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100">
          <button
            onClick={handleReset}
            className="text-xs text-gray-600 border border-gray-200 rounded-lg px-4 py-2 hover:bg-gray-50"
          >
            초기화
          </button>
          <button
            onClick={handleSave}
            className="text-xs text-white bg-purple-600 rounded-lg px-4 py-2 hover:bg-purple-700"
          >
            저장
          </button>
        </div>
      </div>
    </div>
  );
}
