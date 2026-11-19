import React, { useState } from 'react';
import { 
  Scale, 
  FileCheck, 
  AlertTriangle, 
  Clock, 
  Send, 
  CheckCircle2, 
  ExternalLink,
  ShieldCheck,
  FileText,
  UserCheck
} from 'lucide-react';
import { HospitalContract, RoleConfig } from '../data/contractsData';

interface LegalStampDashboardProps {
  hospitals: HospitalContract[];
  currentRole: RoleConfig;
  onSelectHospital: (hospital: HospitalContract) => void;
}

export const LegalStampDashboard: React.FC<LegalStampDashboardProps> = ({
  hospitals,
  currentRole,
  onSelectHospital,
}) => {
  const [stampFilter, setStampFilter] = useState<'all' | 'delayed' | 'done'>('all');
  const [acceleratedIds, setAcceleratedIds] = useState<string[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleAccelerateLegal = (hospId: string, hospName: string) => {
    setAcceleratedIds((prev) => [...prev, hospId]);
    setToastMessage(`ส่งหนังสือเร่งรัดด่วนไปยังฝ่ายนิติการสำหรับ ${hospName} เรียบร้อยแล้ว (SLA Alert Triggered)`);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const legalContracts = hospitals.filter((h) => {
    if (stampFilter === 'delayed') return h.legalStatus.includes('ค้าง') || h.legalStatus.includes('รอ');
    if (stampFilter === 'done') return h.legalStatus.includes('ปกติ');
    return true;
  });

  return (
    <div className="w-full max-w-full min-w-0 space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              ติดตามงานนิติกรรมและอากรแสตมป์ (Legal &amp; e-Stamp Tracker)
            </h1>
            <span className="text-[11px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
              ฝ่ายนิติการ &amp; กฎหมาย
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            การควบคุมความถูกต้องทางนิติกรรมสัญญา การชำระอากรแสตมป์อิเล็กทรอนิกส์ (อ.ส.๙) และการปลดล็อกงวดเบิกจ่าย
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 p-1 bg-white border border-slate-300 rounded-md text-xs">
          <button
            onClick={() => setStampFilter('all')}
            className={`px-3 py-1 rounded font-medium ${
              stampFilter === 'all' ? 'bg-slate-900 text-white font-bold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            ทั้งหมด ({hospitals.length})
          </button>
          <button
            onClick={() => setStampFilter('delayed')}
            className={`px-3 py-1 rounded font-medium ${
              stampFilter === 'delayed' ? 'bg-rose-600 text-white font-bold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            ค้างเกิน SLA / รอตีตราสาร
          </button>
          <button
            onClick={() => setStampFilter('done')}
            className={`px-3 py-1 rounded font-medium ${
              stampFilter === 'done' ? 'bg-emerald-600 text-white font-bold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            สมบูรณ์แล้ว
          </button>
        </div>
      </div>

      {toastMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs rounded-lg flex items-center gap-2 shadow-sm animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top 3 KPI stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span className="font-semibold">ค้างตรวจเกิน 7 วันทำการ</span>
            <AlertTriangle className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl font-bold text-rose-600 tabular-nums">5 สัญญา</div>
          <p className="text-[11px] text-slate-500 mt-1">กระทบงวดเงินเบิกจ่าย 18.2M บาท</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span className="font-semibold">ชำระ e-Stamp กรมสรรพากรแล้ว</span>
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold text-emerald-600 tabular-nums">192 สัญญา</div>
          <p className="text-[11px] text-slate-500 mt-1">อัตราร้อยละ 77.4 ของสัญญาทั้งหมด</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span className="font-semibold">เฉลี่ยเวลาดำเนินการ (SLA)</span>
            <Clock className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-bold text-slate-900 tabular-nums">4.2 วัน</div>
          <p className="text-[11px] text-emerald-600 font-medium mt-1">เร็วกว่าเกณฑ์มาตรฐาน 2.8 วัน</p>
        </div>
      </div>

      {/* Contracts Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-slate-900 text-sm">
            ทะเบียนสัญญาและการตรวจสอบความถูกต้องทางนิติกรรม
          </h3>
          <span className="text-xs text-slate-500">
            แสดง {legalContracts.length} รายการ
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-[11px] text-slate-500 uppercase border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3 font-semibold">โรงพยาบาล / เลขที่สัญญา</th>
                <th className="py-2.5 px-3 font-semibold">สถานะนิติกรรมสัญญา</th>
                <th className="py-2.5 px-3 font-semibold">สถานะอากรแสตมป์</th>
                <th className="py-2.5 px-3 font-semibold">งวดเบิกจ่ายที่ได้รับผลกระทบ</th>
                <th className="py-2.5 px-3 font-semibold">ผู้รับผิดชอบ (AM / นิติการ)</th>
                <th className="py-2.5 px-3 text-right font-semibold">การดำเนินการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {legalContracts.map((hosp) => {
                const isDelayed = hosp.legalStatus.includes('ค้าง');
                const isAccelerated = acceleratedIds.includes(hosp.id);

                return (
                  <tr key={hosp.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-3">
                      <div className="font-bold text-slate-900">{hosp.name}</div>
                      <div className="text-[11px] text-slate-500 font-mono">
                        {hosp.cusCode} • {hosp.contractNumber}
                      </div>
                    </td>

                    <td className="py-3 px-3">
                      <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                        isDelayed 
                          ? 'bg-rose-100 text-rose-800' 
                          : hosp.legalStatus.includes('ปกติ') 
                          ? 'bg-emerald-100 text-emerald-800' 
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {hosp.legalStatus}
                      </span>
                      {isDelayed && (
                        <div className="text-[10px] text-rose-600 font-semibold mt-0.5 flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3 shrink-0" />
                          <span>ค้างดำเนินการเกิน 7 วันทำการ</span>
                        </div>
                      )}
                    </td>

                    <td className="py-3 px-3">
                      <div className="font-medium text-slate-800">{hosp.stampDutyStatus}</div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        {hosp.stampDutyStatus.includes('e-Stamp') ? 'e-Stamp รหัส: ESM-2567-9912' : 'รอรับใบเสร็จ อ.ส.๙'}
                      </div>
                    </td>

                    <td className="py-3 px-3">
                      <div className="font-medium text-slate-800">
                        {isDelayed ? 'งวดที่ 3 (เบิกจ่ายชะลอ)' : 'ตามรอบบิลปกติ'}
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono">
                        วงเงินงวด: {(hosp.totalBudget * 0.35).toLocaleString()} บาท
                      </div>
                    </td>

                    <td className="py-3 px-3">
                      <div className="font-medium text-slate-800">{hosp.amName}</div>
                      <div className="text-[10px] text-slate-500">ทีมกฎหมาย กองยุทธศาสตร์</div>
                    </td>

                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onSelectHospital(hosp)}
                          className="px-2.5 py-1 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded hover:bg-slate-50"
                        >
                          ตรวจเอกสาร
                        </button>

                        {isDelayed && (
                          <button
                            onClick={() => handleAccelerateLegal(hosp.id, hosp.name)}
                            disabled={isAccelerated}
                            className={`flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded transition-all ${
                              isAccelerated
                                ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                : 'bg-amber-600 hover:bg-amber-700 text-white shadow-2xs'
                            }`}
                          >
                            <Send className="w-3 h-3" />
                            <span>{isAccelerated ? 'เร่งรัดแล้ว' : 'เร่งรัดงาน'}</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
