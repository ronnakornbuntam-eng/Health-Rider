import React, { useState, useMemo } from 'react';
import { 
  X, 
  FileSpreadsheet, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowRight, 
  RefreshCw, 
  Download, 
  Upload, 
  Building2, 
  Check, 
  Info,
  DollarSign,
  Calendar,
  Layers,
  Sparkles,
  Link,
  ChevronDown
} from 'lucide-react';
import { HospitalContract, MonthlyBillingRecord, AuditLogEntry, RoleConfig } from '../data/contractsData';

export interface BillingSheetRow {
  rowIndex: number;
  month: string;
  billingDate: string;
  hcode: string;
  hospitalName: string;
  invoiceNumber: string;
  amount: number;
  tripsCount: number;
  matchedHospital?: HospitalContract;
  matchStatus: 'matched' | 'not_found' | 'already_deducted' | 'exceeds_budget';
  alreadyDeducted?: boolean;
  selected: boolean;
  notes?: string;
}

interface GoogleSheetsBillingModalProps {
  hospitals: HospitalContract[];
  currentRole: RoleConfig;
  onClose: () => void;
  onApplyDeductions: (
    updatedHospitals: HospitalContract[], 
    summary: { count: number; totalAmount: number; hospitalNames: string[] }
  ) => void;
}

// Sample Google Sheet Billing Template
const SAMPLE_SHEET_DATA: Array<{
  month: string;
  date: string;
  hcode: string;
  hospitalName: string;
  inv: string;
  amount: number;
  trips: number;
  notes: string;
}> = [
  {
    month: 'ตุลาคม 2569',
    date: '2026-10-05',
    hcode: '10492',
    hospitalName: 'โรงพยาบาลขลุง',
    inv: 'INV-6910-0042',
    amount: 145000,
    trips: 2900,
    notes: 'รอบวางบิลครึ่งเดือนแรก ต.ค. 69 ส่งยา 2,900 เที่ยว'
  },
  {
    month: 'ตุลาคม 2569',
    date: '2026-10-05',
    hcode: '20184',
    hospitalName: 'โรงพยาบาลชลบุรี',
    inv: 'INV-6910-0043',
    amount: 280000,
    trips: 5600,
    notes: 'รอบวางบิลบริการจัดส่งยาถึงบ้านผู้ป่วยนอก NCDs'
  },
  {
    month: 'ตุลาคม 2569',
    date: '2026-10-05',
    hcode: '10738',
    hospitalName: 'โรงพยาบาลเชียงใหม่',
    inv: 'INV-6910-0044',
    amount: 195000,
    trips: 3900,
    notes: 'วางบิลส่งยาเคมีบำบัดและยาโรคเรื้อรังถึงบ้าน'
  },
  {
    month: 'ตุลาคม 2569',
    date: '2026-10-05',
    hcode: '10991',
    hospitalName: 'โรงพยาบาลขอนแก่น',
    inv: 'INV-6910-0045',
    amount: 220000,
    trips: 4400,
    notes: 'วางบิลประจำงวด ต.ค. 69 เครือข่ายสุขภาพภาคอีสาน'
  },
  {
    month: 'ตุลาคม 2569',
    date: '2026-10-05',
    hcode: '10685',
    hospitalName: 'โรงพยาบาลหาดใหญ่',
    inv: 'INV-6910-0046',
    amount: 165000,
    trips: 3300,
    notes: 'รอบวางบิลส่งยาประจำเดือนตุลาคม 2569'
  },
  {
    month: 'ตุลาคม 2569',
    date: '2026-10-05',
    hcode: '10115',
    hospitalName: 'โรงพยาบาลพระนครศรีอยุธยา',
    inv: 'INV-6910-0047',
    amount: 135000,
    trips: 2700,
    notes: 'บริการส่งยาผู้ป่วยตามสิทธิ์ สปสช. กทม.-อยุธยา'
  }
];

export const GoogleSheetsBillingModal: React.FC<GoogleSheetsBillingModalProps> = ({
  hospitals,
  currentRole,
  onClose,
  onApplyDeductions,
}) => {
  const [sheetUrl, setSheetUrl] = useState<string>(
    'https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit#gid=0'
  );
  const [sheetTabName, setSheetTabName] = useState<string>('รอบวางบิล-ตุลาคม-2569');
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [isDeducting, setIsDeducting] = useState<boolean>(false);
  const [rawRows, setRawRows] = useState<typeof SAMPLE_SHEET_DATA>(SAMPLE_SHEET_DATA);
  const [selectedRowIndices, setSelectedRowIndices] = useState<Set<number>>(
    new Set(SAMPLE_SHEET_DATA.map((_, i) => i))
  );
  const [activeStep, setActiveStep] = useState<'preview' | 'confirm' | 'success'>('preview');
  const [deductionSummary, setDeductionSummary] = useState<{
    count: number;
    totalAmount: number;
    hospitalNames: string[];
  } | null>(null);

  // Map parsed rows to hospitals in database
  const mappedRows: BillingSheetRow[] = useMemo(() => {
    return rawRows.map((row, index) => {
      // Find matching hospital by hcode first, then by name substring
      const matched = hospitals.find(
        (h) => h.hcode === row.hcode || h.name.toLowerCase().includes(row.hospitalName.toLowerCase())
      );

      let matchStatus: BillingSheetRow['matchStatus'] = 'matched';
      let alreadyDeducted = false;

      if (!matched) {
        matchStatus = 'not_found';
      } else {
        // Check if invoice already deducted in this hospital's monthlyBillings
        if (matched.monthlyBillings?.some((b) => b.invoiceNumber === row.inv)) {
          matchStatus = 'already_deducted';
          alreadyDeducted = true;
        } else if (matched.contractBillingType !== 'monthly_billing' && row.amount > matched.remainingBudget) {
          matchStatus = 'exceeds_budget';
        }
      }

      return {
        rowIndex: index,
        month: row.month,
        billingDate: row.date,
        hcode: row.hcode,
        hospitalName: row.hospitalName,
        invoiceNumber: row.inv,
        amount: row.amount,
        tripsCount: row.trips,
        matchedHospital: matched,
        matchStatus,
        alreadyDeducted,
        selected: selectedRowIndices.has(index) && matchStatus !== 'already_deducted',
        notes: row.notes,
      };
    });
  }, [rawRows, hospitals, selectedRowIndices]);

  const toggleSelectRow = (idx: number) => {
    const next = new Set(selectedRowIndices);
    if (next.has(idx)) {
      next.delete(idx);
    } else {
      next.add(idx);
    }
    setSelectedRowIndices(next);
  };

  const toggleSelectAll = () => {
    if (selectedRowIndices.size === mappedRows.filter(r => r.matchStatus !== 'already_deducted').length) {
      setSelectedRowIndices(new Set());
    } else {
      const allValid = new Set<number>();
      mappedRows.forEach((r, i) => {
        if (r.matchStatus !== 'already_deducted') allValid.add(i);
      });
      setSelectedRowIndices(allValid);
    }
  };

  const selectedRows = mappedRows.filter((r) => r.selected && r.matchedHospital);
  const totalDeductionAmount = selectedRows.reduce((sum, r) => sum + r.amount, 0);

  // Handle Load Sample Data
  const handleLoadSample = () => {
    setIsConnecting(true);
    setTimeout(() => {
      setRawRows(SAMPLE_SHEET_DATA);
      setSelectedRowIndices(new Set(SAMPLE_SHEET_DATA.map((_, i) => i)));
      setIsConnecting(false);
    }, 400);
  };

  // Simulate Google Sheet Re-sync
  const handleSyncFromSheet = () => {
    setIsConnecting(true);
    setTimeout(() => {
      setIsConnecting(false);
    }, 700);
  };

  // Execute Deduction
  const handleExecuteDeduction = () => {
    if (selectedRows.length === 0) return;

    setIsDeducting(true);

    setTimeout(() => {
      // Build a map of hospital updates
      const updatedHospitalsMap = new Map<string, HospitalContract>();
      const affectedNames: string[] = [];

      selectedRows.forEach((row) => {
        const hosp = row.matchedHospital;
        if (!hosp) return;

        // Get the current version (in case modified in this batch)
        const currentHosp = updatedHospitalsMap.get(hosp.id) || { ...hosp };
        affectedNames.push(currentHosp.name);

        const newSpent = currentHosp.spentBudget + row.amount;
        const newRemaining = Math.max(0, currentHosp.totalBudget - newSpent);
        const newSpentPercent = currentHosp.totalBudget > 0 
          ? Math.min(100, Math.round((newSpent / currentHosp.totalBudget) * 1000) / 10)
          : 0;

        const newBillingRecord: MonthlyBillingRecord = {
          id: `bill-${Date.now()}-${row.rowIndex}`,
          month: row.month,
          invoiceNumber: row.invoiceNumber,
          billingDate: row.billingDate,
          amount: row.amount,
          tripsCount: row.tripsCount,
          status: 'หักจากวงเงินแล้ว',
          source: 'google_sheet',
          deductedAt: new Date().toLocaleString('th-TH'),
          deductedBy: `${currentRole.badge} (${currentRole.name})`,
          sheetRowIndex: row.rowIndex + 1,
          notes: row.notes,
        };

        const newAuditLog: AuditLogEntry = {
          id: `audit-bill-${Date.now()}-${row.rowIndex}`,
          timestamp: new Date().toLocaleString('th-TH'),
          editorName: currentRole.name,
          editorRole: currentRole.badge,
          action: 'ตัดยอดวางบิลรายเดือน',
          changesSummary: `ตัดยอดวางบิลประจำเดือน ${row.month} จาก Google Sheet เลขที่ ${row.invoiceNumber} จำนวน ${row.amount.toLocaleString()} บาท (วงเงินคงเหลือ ${newRemaining.toLocaleString()} บาท)`,
          details: {
            billingDeduction: {
              oldVal: hosp.remainingBudget,
              newVal: newRemaining,
            },
          },
        };

        const updatedHosp: HospitalContract = {
          ...currentHosp,
          spentBudget: newSpent,
          remainingBudget: newRemaining,
          spentPercent: newSpentPercent,
          monthlyBillings: [newBillingRecord, ...(currentHosp.monthlyBillings || [])],
          auditLogs: [newAuditLog, ...(currentHosp.auditLogs || [])],
          statusRisk: newSpentPercent >= 90 ? 'critical' : newSpentPercent >= 75 ? 'warning' : currentHosp.statusRisk,
          lastUpdated: 'เพิ่งอัปเดตเมื่อสักครู่',
        };

        updatedHospitalsMap.set(hosp.id, updatedHosp);
      });

      // Merge into full hospitals array
      const nextHospitals = hospitals.map((h) => updatedHospitalsMap.get(h.id) || h);

      const summary = {
        count: selectedRows.length,
        totalAmount: totalDeductionAmount,
        hospitalNames: Array.from(new Set(affectedNames)),
      };

      setDeductionSummary(summary);
      setIsDeducting(false);
      setActiveStep('success');

      // Trigger callback
      onApplyDeductions(nextHospitals, summary);
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full border border-slate-200 overflow-hidden my-4 animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[92vh]">
        {/* Top Header - Clean White Theme */}
        <div className="p-5 bg-white border-b border-slate-200 text-slate-900 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center shrink-0">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900 tracking-tight">
                  เชื่อมต่อ Google Sheet นำ Data วางบิลมาตัดในวงเงินสัญญา
                </h2>
                <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                  Google Sheets Sync
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                ซิงค์ข้อมูลการวางบิลรายเดือน และตัดยอดเงินจากวงเงินสัญญาโรงพยาบาลโดยอัตโนมัติพร้อมบันทึก Audit Log
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Step Indicator */}
        <div className="bg-slate-50 border-b border-slate-200 px-6 py-2.5 flex items-center justify-between text-xs font-medium text-slate-600 shrink-0">
          <div className="flex items-center gap-4">
            <span className={`flex items-center gap-1.5 ${activeStep === 'preview' ? 'text-teal-700 font-bold' : ''}`}>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                activeStep === 'preview' ? 'bg-teal-600 text-white' : 'bg-slate-200 text-slate-700'
              }`}>1</span>
              <span>เลือกและตรวจสอบรายการวางบิล ({mappedRows.length} แถว)</span>
            </span>
            <span className="text-slate-300">→</span>
            <span className={`flex items-center gap-1.5 ${activeStep === 'confirm' ? 'text-teal-700 font-bold' : ''}`}>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                activeStep === 'confirm' ? 'bg-teal-600 text-white' : 'bg-slate-200 text-slate-700'
              }`}>2</span>
              <span>ยืนยันการตัดวงเงินสัญญา</span>
            </span>
            <span className="text-slate-300">→</span>
            <span className={`flex items-center gap-1.5 ${activeStep === 'success' ? 'text-emerald-700 font-bold' : ''}`}>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                activeStep === 'success' ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-700'
              }`}>3</span>
              <span>ตัดยอดสำเร็จและบันทึกประวัติ</span>
            </span>
          </div>

          <button
            onClick={handleLoadSample}
            disabled={isConnecting}
            className="text-xs text-teal-700 hover:text-teal-900 font-medium flex items-center gap-1 bg-teal-50 hover:bg-teal-100 px-2.5 py-1 rounded-md border border-teal-200 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-teal-600" />
            <span>โหลดชุดข้อมูลตัวอย่างรอบบิล</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5 bg-white">
          {activeStep === 'preview' && (
            <>
              {/* Google Sheet Connection Box */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Link className="w-4 h-4 text-emerald-600" />
                    <span className="text-xs font-bold text-slate-800">
                      ลิงก์ Google Sheet เอกสารวางบิล (Google Sheets URL / Sheet ID)
                    </span>
                  </div>
                  <span className="inline-flex items-center gap-1.5 text-[11px] text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-md font-semibold border border-emerald-200">
                    <span className="w-2 h-2 rounded-full bg-emerald-600" />
                    <span>เชื่อมต่อแล้ว (Connected)</span>
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="md:col-span-2">
                    <input
                      type="text"
                      value={sheetUrl}
                      onChange={(e) => setSheetUrl(e.target.value)}
                      placeholder="วางลิงก์ https://docs.google.com/spreadsheets/d/..."
                      className="w-full text-xs font-mono bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={sheetTabName}
                      onChange={(e) => setSheetTabName(e.target.value)}
                      placeholder="ชื่อแผ่นงาน (Tab)"
                      className="w-full text-xs bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                    <button
                      onClick={handleSyncFromSheet}
                      disabled={isConnecting}
                      className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shrink-0 transition-colors shadow-xs"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isConnecting ? 'animate-spin' : ''}`} />
                      <span>ซิงค์ชีต</span>
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                  <span className="flex items-center gap-1.5">
                    <Info className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>รองรับคอลัมน์: รอบบิล, วันที่, รหัส รพ. (H-Code), ชื่อ รพ., เลขที่ใบแจ้งหนี้ (INV), ยอดวางบิล, เที่ยวจัดส่ง</span>
                  </span>
                  <span className="font-mono text-slate-600">อัปเดตล่าสุด: เมื่อสักครู่</span>
                </div>
              </div>

              {/* Data Table */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-slate-900">
                      รายการวางบิลที่ตรวจพบจาก Google Sheet
                    </h3>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-semibold border border-slate-200">
                      พบ {mappedRows.length} รายการ
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-xs">
                    <button
                      onClick={toggleSelectAll}
                      className="text-teal-700 hover:text-teal-800 font-semibold underline underline-offset-2"
                    >
                      {selectedRowIndices.size === mappedRows.filter(r => r.matchStatus !== 'already_deducted').length 
                        ? 'ยกเลิกการเลือกทั้งหมด' 
                        : 'เลือกทั้งหมดที่ตัดยอดได้'}
                    </button>
                  </div>
                </div>

                <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs bg-white">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold">
                        <tr>
                          <th className="py-3 px-3 text-center w-10">
                            <input
                              type="checkbox"
                              checked={selectedRowIndices.size > 0 && selectedRowIndices.size === mappedRows.filter(r => r.matchStatus !== 'already_deducted').length}
                              onChange={toggleSelectAll}
                              className="rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                            />
                          </th>
                          <th className="py-3 px-3">รอบบิล / วันที่</th>
                          <th className="py-3 px-3">รหัส / โรงพยาบาล</th>
                          <th className="py-3 px-3">เลขที่ใบแจ้งหนี้</th>
                          <th className="py-3 px-3 text-right">จำนวนเที่ยว</th>
                          <th className="py-3 px-3 text-right">ยอดวางบิล (บาท)</th>
                          <th className="py-3 px-3 text-right">วงเงินคงเหลือก่อนตัด</th>
                          <th className="py-3 px-3 text-right">คงเหลือหลังตัด</th>
                          <th className="py-3 px-3 text-center">สถานะการตัดยอด</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-sans">
                        {mappedRows.map((row) => {
                          const hosp = row.matchedHospital;
                          const currentRem = hosp?.remainingBudget || 0;
                          const estAfter = Math.max(0, currentRem - row.amount);
                          const isMonthly = hosp?.contractBillingType === 'monthly_billing';

                          return (
                            <tr 
                              key={row.rowIndex}
                              className={`transition-colors ${
                                row.selected 
                                  ? 'bg-teal-50/40 hover:bg-teal-50/70' 
                                  : 'hover:bg-slate-50/80'
                              } ${row.alreadyDeducted ? 'opacity-60 bg-slate-50' : ''}`}
                            >
                              <td className="py-3 px-3 text-center">
                                <input
                                  type="checkbox"
                                  disabled={row.alreadyDeducted || row.matchStatus === 'not_found'}
                                  checked={row.selected}
                                  onChange={() => toggleSelectRow(row.rowIndex)}
                                  className="rounded border-slate-300 text-teal-600 focus:ring-teal-500 cursor-pointer disabled:cursor-not-allowed"
                                />
                              </td>
                              <td className="py-3 px-3 whitespace-nowrap">
                                <div className="font-semibold text-slate-800">{row.month}</div>
                                <div className="text-[11px] text-slate-500">{row.billingDate}</div>
                              </td>
                              <td className="py-3 px-3">
                                <div className="font-bold text-slate-900 flex items-center gap-1.5">
                                  <span>{row.hospitalName}</span>
                                  {hosp && (
                                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 font-mono">
                                      {hosp.hcode}
                                    </span>
                                  )}
                                </div>
                                <div className="text-[11px] text-slate-500">
                                  {hosp ? `${hosp.province} (${hosp.region})` : 'ไม่พบข้อมูลในระบบ'}
                                </div>
                              </td>
                              <td className="py-3 px-3 font-mono text-slate-700 whitespace-nowrap">
                                {row.invoiceNumber}
                              </td>
                              <td className="py-3 px-3 text-right font-medium text-slate-700">
                                {row.tripsCount.toLocaleString()} เที่ยว
                              </td>
                              <td className="py-3 px-3 text-right font-bold text-emerald-800 whitespace-nowrap">
                                {row.amount.toLocaleString()} ฿
                              </td>
                              <td className="py-3 px-3 text-right font-medium text-slate-600 whitespace-nowrap">
                                {isMonthly ? (
                                  <span className="text-blue-600 font-semibold">รายเดือน (ตามจริง)</span>
                                ) : (
                                  `${currentRem.toLocaleString()} ฿`
                                )}
                              </td>
                              <td className="py-3 px-3 text-right font-bold whitespace-nowrap">
                                {isMonthly ? (
                                  <span className="text-blue-600 font-semibold">รายเดือน</span>
                                ) : (
                                  <span className={estAfter < 100000 ? 'text-amber-600' : 'text-slate-800'}>
                                    {estAfter.toLocaleString()} ฿
                                  </span>
                                )}
                              </td>
                              <td className="py-3 px-3 text-center whitespace-nowrap">
                                {row.alreadyDeducted ? (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                                    <Check className="w-3 h-3 text-slate-500" />
                                    <span>เคยตัดยอดแล้ว</span>
                                  </span>
                                ) : row.matchStatus === 'not_found' ? (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-rose-100 text-rose-700 border border-rose-200">
                                    <AlertTriangle className="w-3 h-3" />
                                    <span>ไม่พบ รพ.</span>
                                  </span>
                                ) : row.matchStatus === 'exceeds_budget' ? (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-100 text-amber-800 border border-amber-200">
                                    <AlertTriangle className="w-3 h-3" />
                                    <span>งบไม่พอตัด</span>
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                    <span>พร้อมตัดยอด</span>
                                  </span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Bottom Summary Bar */}
              <div className="p-4 bg-teal-50 border border-teal-200 rounded-xl flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-teal-600 text-white flex items-center justify-center font-bold text-sm">
                    {selectedRows.length}
                  </div>
                  <div>
                    <div className="text-xs text-teal-800 font-semibold">
                      เลือกแล้ว {selectedRows.length} รายการ (จากทั้งหมด {mappedRows.length} รายการ)
                    </div>
                    <div className="text-xs text-slate-600 mt-0.5">
                      พร้อมตัดยอดเข้าสู่วงเงินสัญญาโรงพยาบาล
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <span className="text-[11px] text-slate-600 block">ยอดรวมที่จะตัดวงเงิน</span>
                    <span className="text-lg font-bold text-teal-900 font-mono">
                      {totalDeductionAmount.toLocaleString()} บาท
                    </span>
                  </div>

                  <button
                    onClick={() => setActiveStep('confirm')}
                    disabled={selectedRows.length === 0}
                    className="px-5 py-2.5 bg-teal-700 hover:bg-teal-800 disabled:bg-slate-300 disabled:text-slate-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs transition-all active:scale-95"
                  >
                    <span>ตรวจสอบและตัดยอด ({selectedRows.length})</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </>
          )}

          {activeStep === 'confirm' && (
            <div className="max-w-2xl mx-auto py-6 space-y-6">
              <div className="text-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-teal-100 text-teal-800 mx-auto flex items-center justify-center border border-teal-200">
                  <DollarSign className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">
                  ยืนยันการประมวลผลตัดยอดวางบิลเข้าสู่วงเงินสัญญา
                </h3>
                <p className="text-xs text-slate-600 max-w-md mx-auto">
                  ระบบจะดำเนินการปรับลดวงเงินคงเหลือของโรงพยาบาลตามยอดวางบิลใน Google Sheet และบันทึกประวัติการวางบิลรวมถึง Audit Log ย้อนหลัง
                </p>
              </div>

              <div className="bg-slate-50 rounded-xl p-5 border border-slate-200 space-y-3">
                <div className="flex justify-between text-xs py-1 border-b border-slate-200">
                  <span className="text-slate-600">จำนวนโรงพยาบาลที่ตัดยอด:</span>
                  <span className="font-bold text-slate-900">{selectedRows.length} แห่ง</span>
                </div>
                <div className="flex justify-between text-xs py-1 border-b border-slate-200">
                  <span className="text-slate-600">ยอดเงินรวมทั้งหมด:</span>
                  <span className="font-bold text-emerald-700 text-sm font-mono">
                    {totalDeductionAmount.toLocaleString()} บาท
                  </span>
                </div>
                <div className="flex justify-between text-xs py-1 border-b border-slate-200">
                  <span className="text-slate-600">ผู้ดำเนินการ:</span>
                  <span className="font-medium text-slate-900">{currentRole.name} ({currentRole.badge})</span>
                </div>
                <div className="flex justify-between text-xs py-1">
                  <span className="text-slate-600">แหล่งที่มา:</span>
                  <span className="font-mono text-slate-700">Google Sheet: {sheetTabName}</span>
                </div>
              </div>

              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => setActiveStep('preview')}
                  className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-semibold transition-colors"
                >
                  ย้อนกลับแก้ไข
                </button>
                <button
                  onClick={handleExecuteDeduction}
                  disabled={isDeducting}
                  className="px-6 py-2.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold flex items-center gap-2 shadow-xs transition-all active:scale-95"
                >
                  {isDeducting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>กำลังประมวลผลตัดยอด...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>ยืนยันตัดยอด {totalDeductionAmount.toLocaleString()} บาท</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {activeStep === 'success' && deductionSummary && (
            <div className="max-w-xl mx-auto py-8 text-center space-y-5 animate-in fade-in zoom-in-95 duration-200">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 mx-auto flex items-center justify-center border-2 border-emerald-300 shadow-sm">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div className="space-y-1.5">
                <h3 className="text-lg font-bold text-slate-900">
                  ตัดยอดวางบิลเข้าสู่วงเงินสัญญาสำเร็จเรียบร้อย!
                </h3>
                <p className="text-xs text-slate-600">
                  ระบบได้ปรับปรุงยอดวงเงินคงเหลือและบันทึกประวัติการวางบิลของโรงพยาบาลแล้ว
                </p>
              </div>

              <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 text-left space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-emerald-800 font-medium">โรงพยาบาลที่ตัดยอด:</span>
                  <span className="font-bold text-emerald-950">{deductionSummary.count} แห่ง</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-emerald-800 font-medium">ยอดเงินที่ตัดรวม:</span>
                  <span className="font-bold text-emerald-950 font-mono">
                    {deductionSummary.totalAmount.toLocaleString()} บาท
                  </span>
                </div>
                <div className="pt-2 border-t border-emerald-200 text-[11px] text-emerald-700">
                  รายชื่อโรงพยาบาล: {deductionSummary.hospitalNames.join(', ')}
                </div>
              </div>

              <button
                onClick={onClose}
                className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
              >
                ปิดหน้าต่างและกลับสู่ระบบ
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
