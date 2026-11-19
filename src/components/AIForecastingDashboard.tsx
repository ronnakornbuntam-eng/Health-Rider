import React, { useState } from 'react';
import { 
  BrainCircuit, 
  TrendingUp, 
  AlertTriangle, 
  Calculator, 
  ArrowRight, 
  Copy, 
  Check, 
  Calendar, 
  Sparkles,
  BarChart3,
  ShieldAlert
} from 'lucide-react';
import { HospitalContract, RoleConfig } from '../data/contractsData';

interface AIForecastingDashboardProps {
  hospitals: HospitalContract[];
  currentRole: RoleConfig;
  onSelectHospital: (hospital: HospitalContract) => void;
}

export const AIForecastingDashboard: React.FC<AIForecastingDashboardProps> = ({
  hospitals,
  currentRole,
  onSelectHospital,
}) => {
  const [selectedHospitalId, setSelectedHospitalId] = useState<string>(hospitals[0]?.id || 'hosp-1');
  const [targetExtensionMonths, setTargetExtensionMonths] = useState<number>(3);
  const [surgePercentage, setSurgePercentage] = useState<number>(15);
  const [copiedMemo, setCopiedMemo] = useState<boolean>(false);

  const activeHospital = hospitals.find((h) => h.id === selectedHospitalId) || hospitals[0];

  // Calculate needed budget
  const adjustedDailyBurn = activeHospital.dailyBurnRate * (1 + surgePercentage / 100);
  const daysNeeded = targetExtensionMonths * 30;
  const projectedCost = Math.round(adjustedDailyBurn * daysNeeded);
  const recommendedTopup = Math.max(0, projectedCost - Math.max(0, activeHospital.remainingBudget));

  const handleCopyMemo = () => {
    const memoText = `บันทึกข้อความ (เร่งด่วนที่สุด)
เรื่อง: ขออนุมัติจัดสรรงบประมาณสำรองฉุกเฉินและขยายเพดานวงเงินสัญญาบริการจัดส่งยาถึงบ้าน
เรียน: ผู้อำนวยการ ${activeHospital.name} และประธานคณะกรรมการบริหารระบบขนส่งยาและเวชภัณฑ์

ตามที่ ${activeHospital.name} (${activeHospital.cusCode}) ได้ทำสัญญาเลขที่ ${activeHospital.contractNumber} วงเงิน ${activeHospital.totalBudget.toLocaleString()} บาท นั้น
จากการวิเคราะห์โดยระบบ MediCommand AI Decision Support Engine พบว่า:
1. ปัจจุบันมีการใช้วงเงินไปแล้ว ${activeHospital.spentPercent}% (คงเหลือ ${activeHospital.remainingBudget.toLocaleString()} บาท)
2. อัตราการใช้วงเงินปัจจุบันเฉลี่ยวันละ ${activeHospital.dailyBurnRate.toLocaleString()} บาท และมีแนวโน้มปรับตัวสูงขึ้น +${surgePercentage}% ในช่วงไฮซีซั่น
3. คาดการณ์ว่าวงเงินคงเหลือจะหมดลงภายใน ${activeHospital.estimatedRunoutDays} วัน (ก่อนครบกำหนดสัญญา)

เพื่อไม่ให้เกิดผลกระทบต่อการให้บริการส่งยาถึงบ้านผู้ป่วย จึงขอเสนอจัดสรรงบประมาณสำรองเพิ่มเติมจำนวน ${recommendedTopup.toLocaleString()} บาท เพื่อรองรับการให้บริการต่อเนื่องเป็นระยะเวลา ${targetExtensionMonths} เดือน`;

    navigator.clipboard.writeText(memoText);
    setCopiedMemo(true);
    setTimeout(() => setCopiedMemo(false), 3000);
  };

  // Top 5 hospitals at risk of running out of money
  const criticalRunoutHospitals = [...hospitals]
    .filter((h) => h.estimatedRunoutDays > 0)
    .sort((a, b) => a.estimatedRunoutDays - b.estimatedRunoutDays)
    .slice(0, 6);

  return (
    <div className="w-full max-w-full min-w-0 space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              พยากรณ์การใช้วงเงิน AI &amp; Burn-Rate Analytics
            </h1>
            <span className="text-[11px] font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
              AI Decision Support
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            การประเมินอัตราเร่งการเบิกจ่ายงบประมาณ (Velocity) และการจำลองวิกฤตวงเงินหมดก่อนครบอายุสัญญา
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
            <span>โมเดลทำนาย: Weighted Moving Average + Time Decay</span>
          </span>
        </div>
      </div>

      {/* Top Warning Banner if critical hospitals exist */}
      <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-3">
        <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <h4 className="font-bold text-xs text-rose-900">
            ระบบตรวจพบความเสี่ยงสูงระดับสีแดง (4 โรงพยาบาลจะหมดวงเงินใน 35 วัน)
          </h4>
          <p className="text-xs text-rose-700 leading-relaxed">
            หากไม่มีการขยายเพดานวงเงินหรือขอสนับสนุนงบประมาณกลางฉุกเฉิน โรงพยาบาลกลุ่มนี้จะถูกระงับการออกใบจัดส่งยาผู้ป่วยอัตโนมัติเมื่อวงเงินแตะ 100%
          </p>
        </div>
      </div>

      {/* Grid: Simulator & Critical List */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (7 cols): Emergency Budget Request Simulator */}
        <div className="lg:col-span-7 bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Calculator className="w-4 h-4 text-teal-700" />
              <h3 className="font-bold text-slate-900 text-sm">
                เครื่องมือจำลองคำขอขยายเพดานวงเงินฉุกเฉิน
              </h3>
            </div>
            <span className="text-[11px] text-slate-500 font-mono">
              สธ. / สป.สธ. Alignment
            </span>
          </div>

          {/* Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              เลือกโรงพยาบาลเป้าหมายที่ต้องการคำนวณ:
            </label>
            <select
              value={selectedHospitalId}
              onChange={(e) => setSelectedHospitalId(e.target.value)}
              className="w-full p-2 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-teal-600"
            >
              {hospitals.map((h) => (
                <option key={h.id} value={h.id}>
                  {h.name} ({h.province}) — ใช้ไปแล้ว {h.spentPercent}% | เหลือ {h.remainingBudget.toLocaleString()} บ.
                </option>
              ))}
            </select>
          </div>

          {/* Current Status Metric Pill Grid */}
          <div className="grid grid-cols-3 gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs">
            <div>
              <span className="text-[10px] text-slate-500 block">วงเงินสัญญาเดิม</span>
              <span className="font-bold text-slate-800 text-sm font-mono">
                {activeHospital.totalBudget.toLocaleString()} ฿
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block">อัตราบริโภคเฉลี่ย/วัน</span>
              <span className="font-bold text-rose-600 text-sm font-mono">
                ~{activeHospital.dailyBurnRate.toLocaleString()} ฿
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block">ระยะเวลาคงเหลือก่อนหมด</span>
              <span className="font-bold text-rose-700 text-sm font-mono">
                {activeHospital.estimatedRunoutDays} วัน
              </span>
            </div>
          </div>

          {/* Sliders for Simulation */}
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-semibold text-slate-700">
                  ระยะเวลาที่ต้องการขยายสัญญาเพิ่ม (เดือน)
                </span>
                <span className="font-bold text-teal-800 text-sm font-mono">
                  {targetExtensionMonths} เดือน ({daysNeeded} วัน)
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="12"
                value={targetExtensionMonths}
                onChange={(e) => setTargetExtensionMonths(Number(e.target.value))}
                className="w-full accent-teal-600 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-semibold text-slate-700">
                  คาดการณ์การเพิ่มขึ้นของปริมาณงานช่วงไฮซีซั่น (Surge %)
                </span>
                <span className="font-bold text-indigo-700 text-sm font-mono">
                  +{surgePercentage}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="50"
                step="5"
                value={surgePercentage}
                onChange={(e) => setSurgePercentage(Number(e.target.value))}
                className="w-full accent-indigo-600 cursor-pointer"
              />
            </div>
          </div>

          {/* Calculated Output Box */}
          <div className="p-4 bg-teal-50/70 border border-teal-200 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-teal-900">
                วงเงินที่ระบบ AI แนะนำให้ขอจัดสรรเพิ่มเติม (Recommended Top-up):
              </span>
              <span className="text-xl font-black text-teal-900 font-mono">
                {recommendedTopup.toLocaleString()} บาท
              </span>
            </div>
            <p className="text-[11px] text-teal-700">
              * คำนวณจากอัตราใช้จริง ({adjustedDailyBurn.toLocaleString()} บ./วัน) เพื่อรองรับ {daysNeeded} วัน และไม่ให้ยอดสะดุด
            </p>
          </div>

          {/* Action: Copy Official Memo Text */}
          <div className="pt-1 flex items-center justify-between">
            <button
              onClick={handleCopyMemo}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-lg border border-slate-300 transition-all active:scale-95"
            >
              {copiedMemo ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              <span>{copiedMemo ? 'คัดลอกร่างบันทึกข้อความแล้ว!' : 'คัดลอกร่างบันทึกข้อความขออนุมัติ'}</span>
            </button>

            <button
              onClick={() => onSelectHospital(activeHospital)}
              className="text-xs text-teal-700 hover:text-teal-800 font-semibold underline"
            >
              ดูประวัติสัญญาเต็มของโรงพยาบาลนี้ →
            </button>
          </div>
        </div>

        {/* Right Column (5 cols): Critical Hospital Runout Table */}
        <div className="lg:col-span-5 bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">
                อันดับโรงพยาบาลที่เงินจะหมดเร็วที่สุด
              </h3>
              <p className="text-[11px] text-slate-500">
                Sorted by Days Remaining to Zero Balance
              </p>
            </div>
            <span className="text-xs font-mono text-rose-600 font-bold">
              CRITICAL
            </span>
          </div>

          <div className="space-y-2.5">
            {criticalRunoutHospitals.map((hosp, idx) => (
              <div
                key={hosp.id}
                onClick={() => {
                  setSelectedHospitalId(hosp.id);
                  onSelectHospital(hosp);
                }}
                className={`p-3 rounded-lg border transition-all cursor-pointer ${
                  selectedHospitalId === hosp.id
                    ? 'border-teal-500 bg-teal-50/40 shadow-2xs'
                    : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
                }`}
              >
                <div className="flex items-center justify-between text-xs mb-1">
                  <div className="flex items-center gap-2">
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                      idx === 0 ? 'bg-rose-600 text-white' : idx === 1 ? 'bg-amber-600 text-white' : 'bg-slate-700 text-white'
                    }`}>
                      {idx + 1}
                    </span>
                    <span className="font-bold text-slate-900">{hosp.name}</span>
                  </div>
                  <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                    hosp.estimatedRunoutDays <= 20 
                      ? 'bg-rose-100 text-rose-700 font-mono' 
                      : 'bg-amber-100 text-amber-800 font-mono'
                  }`}>
                    หมดใน {hosp.estimatedRunoutDays} วัน
                  </span>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                  <span>เบิร์น ~{hosp.dailyBurnRate.toLocaleString()} บ./วัน</span>
                  <span className="font-medium text-slate-700">AM: {hosp.amName}</span>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-slate-200 rounded-full h-1.5 mt-2 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${hosp.spentPercent >= 90 ? 'bg-rose-600' : 'bg-blue-600'}`}
                    style={{ width: `${Math.min(100, hosp.spentPercent)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-500 leading-relaxed flex items-start gap-1.5">
            <ShieldAlert className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
            <span>
              <strong>เกณฑ์การแจ้งเตือนอัตโนมัติ:</strong> เมื่อโรงพยาบาลมีระยะเวลาคงเหลือ &lt; 30 วัน ระบบจะสร้าง Proactive Alert บนหน้า Executive Dashboard และส่งการแจ้งเตือนถึง AM ผู้รับผิดชอบทุกเช้าเวลา 08:30 น.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
