"use client";

import { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import type { HospitalStats, FeedbackRow } from "@/types/analysis";

interface Props {
  hospitalStats: HospitalStats[];
  rows?: FeedbackRow[];
}

interface ModalProps {
  hospital: string;
  rows: FeedbackRow[];
  onClose: () => void;
}

function FeedbackModal({ hospital, rows, onClose }: ModalProps) {
  const hospitalRows = (rows ?? []).filter((r) => r.hospital === hospital);

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h2 className="text-base font-semibold text-gray-900">{hospital}</h2>
            <p className="text-xs text-gray-400 mt-0.5">피드백 {hospitalRows.length}건</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="overflow-y-auto flex-1 divide-y divide-gray-50">
          {hospitalRows.length === 0 ? (
            <p className="px-6 py-8 text-sm text-gray-400 text-center">피드백이 없습니다.</p>
          ) : (
            hospitalRows.map((row) => (
              <div key={row.id} className="px-6 py-4">
                <p className="text-xs text-gray-400 mb-2">{row.date || "날짜 미상"}</p>
                {row.positiveFeedback && (
                  <div className="mb-2">
                    <span className="inline-block text-xs font-medium text-green-600 bg-green-50 border border-green-200 rounded px-1.5 py-0.5 mb-1">긍정</span>
                    <p className="text-sm text-gray-700">{row.positiveFeedback}</p>
                  </div>
                )}
                {row.negativeFeedback && (
                  <div>
                    <span className="inline-block text-xs font-medium text-red-600 bg-red-50 border border-red-200 rounded px-1.5 py-0.5 mb-1">부정</span>
                    <p className="text-sm text-gray-700">{row.negativeFeedback}</p>
                  </div>
                )}
                {!row.positiveFeedback && !row.negativeFeedback && (
                  <p className="text-sm text-gray-400">내용 없음</p>
                )}
              </div>
            ))
          )}
        </div>

        <div className="flex justify-end px-6 py-4 border-t border-gray-100">
          <button
            onClick={onClose}
            className="text-xs text-gray-600 border border-gray-200 rounded-lg px-4 py-2 hover:bg-gray-50"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}

export default function HospitalChart({ hospitalStats, rows }: Props) {
  const [selectedHospital, setSelectedHospital] = useState<string | null>(null);

  if (hospitalStats.length === 0) return null;

  const data = hospitalStats.slice(0, 15).map((s) => ({
    name: s.hospital,
    긍정: s.positiveCount,
    부정: s.negativeCount,
  }));

  return (
    <>
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-1">
          병원별 긍정 / 부정 피드백
        </h2>
        <p className="text-xs text-gray-400 mb-4">바를 클릭하면 해당 병원 피드백을 볼 수 있습니다</p>
        <ResponsiveContainer width="100%" height={Math.max(240, data.length * 40)}>
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 0, right: 30, left: 10, bottom: 0 }}
            onClick={(e) => {
              if (e?.activePayload?.[0]) {
                setSelectedHospital(e.activePayload[0].payload.name as string);
              }
            }}
            style={{ cursor: "pointer" }}
          >
            <XAxis type="number" tick={{ fontSize: 12 }} allowDecimals={false} />
            <YAxis
              type="category"
              dataKey="name"
              width={100}
              tick={{ fontSize: 12 }}
            />
            <Tooltip
              formatter={(value: number, name: string) => [`${value}건`, name]}
            />
            <Legend />
            <Bar dataKey="긍정" stackId="a" fill="#22c55e" radius={[0, 0, 0, 0]} />
            <Bar dataKey="부정" stackId="a" fill="#ef4444" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {selectedHospital && (
        <FeedbackModal
          hospital={selectedHospital}
          rows={rows ?? []}
          onClose={() => setSelectedHospital(null)}
        />
      )}
    </>
  );
}
