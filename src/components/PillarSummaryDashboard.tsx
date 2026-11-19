import React, { useMemo, useState } from 'react';
import {
  Building2,
  Wallet,
  FileCheck2,
  Scale,
  PackageCheck,
  Download,
  ChevronRight,
  Landmark,
  FileSpreadsheet,
  ArrowUpRight,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Filter
} from 'lucide-react';
import {
  HospitalContract,
  PendingChangeRequest,
  RoleConfig
} from '../data/contractsData';
import { ViewType } from './Sidebar';

interface PillarSummaryDashboardProps {
  hospitals: HospitalContract[];
  pendingRequests: PendingChangeRequest[];
  currentRole: RoleConfig;
  onSelectHospital: (hospital: HospitalContract) => void;
  onNavigateToView: (view: ViewType) => void;
  onOpenGoogleSheetsSync: () => void;
  onOpenPendingReviews: () => void;
}

type PillarFocus = 'all' | 'network' | 'budget' | 'procurement' | 'legal' | 'operations';

const ALL_REGIONS: Array<HospitalContract['region']> = [
  'ภาคกลาง',
  'ภาคเหนือ',
  'ภาคตะวันออกเฉียงเหนือ',
  'ภาคตะวันออก',
  'ภาคตะวันตก',
  'ภาคใต้',
];

const REGION_SHORT_LABEL: Record<string, string> = {
  'ภาคกลาง': 'ภาคกลาง',
  'ภาคเหนือ': 'ภาคเหนือ',
  'ภาคตะวันออกเฉียงเหนือ': 'ภาคอีสาน',
  'ภาคตะวันออก': 'ภาคตะวันออก',
  'ภาคตะวันตก': 'ภาคตะวันตก',
  'ภาคใต้': 'ภาคใต้',
};

const formatTHB = (val: number) => `${Math.round(val).toLocaleString('th-TH')} ฿`;
const formatMillionTHB = (val: number) =>
  val >= 1_000_000
    ? `${(val / 1_000_000).toFixed(2)} ล้านบาท`
    : `${Math.round(val).toLocaleString('th-TH')} บาท`;

export const PillarSummaryDashboard: React.FC<PillarSummaryDashboardProps> = ({
  hospitals,
  pendingRequests,
  currentRole,
  onSelectHospital,
  onNavigateToView,
  onOpenGoogleSheetsSync,
  onOpenPendingReviews,
}) => {
  const [selectedRegion, setSelectedRegion] = useState<string>('all');
  const [billingScope, setBillingScope] = useState<'all' | 'annual' | 'monthly'>('all');
  const [activePillar, setActivePillar] = useState<PillarFocus>('all');

  // Filter hospitals according to role scope + selected region + billing scope
  const scopedHospitals = useMemo(() => {
    return hospitals.filter((h) => {
      if (!currentRole.isCentralAdmin && !currentRole.allowedRegions.includes(h.region)) {
        return false;
      }
      if (selectedRegion !== 'all' && h.region !== selectedRegion) {
        return false;
      }
      if (billingScope === 'annual' && h.contractBillingType === 'monthly_billing') {
        return false;
      }
      if (billingScope === 'monthly' && h.contractBillingType !== 'monthly_billing') {
        return false;
      }
      return true;
    });
  }, [hospitals, currentRole, selectedRegion, billingScope]);

  // Compute all 5 substantive pillars in one pass
  const metrics = useMemo(() => {
    const total = scopedHospitals.length;

    // 1. Network & Contract Portfolio
    let annualCount = 0;
    let monthlyCount = 0;
    let mouCount = 0;
    let centerCount = 0;
    let generalCount = 0;
    let communityCount = 0;

    let statusActive = 0;
    let statusExpiring = 0;
    let statusExpired = 0;
    let statusPending = 0;
    let statusDraft = 0;

    // 2. Budget & Monthly Billing
    let totalBudget = 0;
    let spentBudget = 0;
    let remainingBudget = 0;
    let dailyBurnSum = 0;
    let annualBudgetHospCount = 0;
    let budgetSafe = 0;
    let budgetWarning = 0;
    let budgetCritical = 0;

    let billingRecordsCount = 0;
    let billingTotalAmount = 0;
    let billingTotalTrips = 0;
    let billingGoogleSheetCount = 0;
    let billingManualCount = 0;

    // 3. Procurement Docs & Bank Guarantee (BG)
    let hasPoCount = 0;
    let hasQtCount = 0;
    let hasTorCount = 0;
    let hasContractDocCount = 0;
    let hasBgCount = 0;
    let bgTotalGuaranteeAmount = 0;
    let bgActiveCount = 0;
    let bgExpiringCount = 0;
    let bgReleasedCount = 0;
    const bankDistribution = new Map<string, { count: number; amount: number }>();

    // 4. Legal, e-Stamp & Governance
    let legalNormal = 0;
    let legalPending = 0;
    let stampPaid = 0;
    let stampWaiting = 0;
    let stampDelayed = 0;
    let totalAuditLogs = 0;

    // 5. Delivery Volume & Regional Operations
    let totalMonthlyTransactions = 0;

    // Regional breakdown map
    const regionMap = new Map<
      string,
      {
        region: string;
        count: number;
        annualCount: number;
        monthlyCount: number;
        totalBudget: number;
        spentBudget: number;
        remainingBudget: number;
        bgCount: number;
        bgAmount: number;
        monthlyTx: number;
        expiringCount: number;
      }
    >();

    ALL_REGIONS.forEach((reg) => {
      if (currentRole.isCentralAdmin || currentRole.allowedRegions.includes(reg)) {
        regionMap.set(reg, {
          region: reg,
          count: 0,
          annualCount: 0,
          monthlyCount: 0,
          totalBudget: 0,
          spentBudget: 0,
          remainingBudget: 0,
          bgCount: 0,
          bgAmount: 0,
          monthlyTx: 0,
          expiringCount: 0,
        });
      }
    });

    scopedHospitals.forEach((h) => {
      const isMonthly = h.contractBillingType === 'monthly_billing';
      if (isMonthly) monthlyCount++;
      else annualCount++;

      if (h.contractCategory.includes('MOU') || h.contractCategory.includes('ข้อตกลง')) {
        mouCount++;
      }

      if (h.hospitalType.includes('ศูนย์')) centerCount++;
      else if (h.hospitalType.includes('ทั่วไป')) generalCount++;
      else communityCount++;

      if (h.contractStatus === 'มีผลบังคับใช้ (Active)') statusActive++;
      else if (h.contractStatus === 'ใกล้หมดอายุ' || h.daysUntilExpiry <= 60) statusExpiring++;
      else if (h.contractStatus === 'สิ้นสุดสัญญา' || h.daysUntilExpiry <= 0) statusExpired++;
      else if (h.contractStatus === 'รอตรวจสอบ') statusPending++;
      else statusDraft++;

      if (!isMonthly) {
        annualBudgetHospCount++;
        totalBudget += h.totalBudget || 0;
        spentBudget += h.spentBudget || 0;
        remainingBudget += h.remainingBudget || 0;
        dailyBurnSum += h.dailyBurnRate || 0;

        if (h.spentPercent >= 90) budgetCritical++;
        else if (h.spentPercent >= 75) budgetWarning++;
        else budgetSafe++;
      }

      if (h.monthlyBillings && h.monthlyBillings.length > 0) {
        h.monthlyBillings.forEach((b) => {
          if (b.status !== 'ยกเลิก') {
            billingRecordsCount++;
            billingTotalAmount += b.amount || 0;
            billingTotalTrips += b.tripsCount || 0;
            if (b.source === 'google_sheet') billingGoogleSheetCount++;
            else billingManualCount++;
          }
        });
      }

      if (h.documents?.po?.docNumber && h.documents.po.docNumber !== '-') hasPoCount++;
      if (h.documents?.qt?.docNumber && h.documents.qt.docNumber !== '-') hasQtCount++;
      if (h.documents?.tor?.docNumber && h.documents.tor.docNumber !== '-') hasTorCount++;
      if (h.documents?.contractAgreement?.contractNumber && h.documents.contractAgreement.contractNumber !== '-') {
        hasContractDocCount++;
      }

      if (h.hasBankGuarantee) {
        hasBgCount++;
        const bgAmt = h.bankGuarantee?.guaranteeAmount || 0;
        bgTotalGuaranteeAmount += bgAmt;
        const bgStat = h.bankGuarantee?.status || 'ค้ำประกันอยู่ (Active)';
        if (bgStat.includes('คืน')) bgReleasedCount++;
        else if (bgStat.includes('ใกล้หมดอายุ') || bgStat.includes('หมดอายุ')) bgExpiringCount++;
        else bgActiveCount++;

        const bankName = h.bankGuarantee?.bankName || 'ไม่ระบุธนาคาร';
        const existingBank = bankDistribution.get(bankName) || { count: 0, amount: 0 };
        existingBank.count += 1;
        existingBank.amount += bgAmt;
        bankDistribution.set(bankName, existingBank);
      }

      if (h.legalStatus.includes('ปกติ')) legalNormal++;
      else legalPending++;

      if (h.stampDutyStatus === 'ชำระ e-Stamp แล้ว') stampPaid++;
      else if (h.stampDutyStatus === 'รอชำระอากร') stampWaiting++;
      else stampDelayed++;

      totalAuditLogs += h.auditLogs?.length || 0;
      totalMonthlyTransactions += h.monthlyTransactions || 0;

      const regStat = regionMap.get(h.region);
      if (regStat) {
        regStat.count += 1;
        if (isMonthly) regStat.monthlyCount += 1;
        else {
          regStat.annualCount += 1;
          regStat.totalBudget += h.totalBudget || 0;
          regStat.spentBudget += h.spentBudget || 0;
          regStat.remainingBudget += h.remainingBudget || 0;
        }
        if (h.hasBankGuarantee) {
          regStat.bgCount += 1;
          regStat.bgAmount += h.bankGuarantee?.guaranteeAmount || 0;
        }
        regStat.monthlyTx += h.monthlyTransactions || 0;
        if (h.daysUntilExpiry <= 60 || h.contractStatus === 'ใกล้หมดอายุ') {
          regStat.expiringCount += 1;
        }
      }
    });

    const utilizationPct = totalBudget > 0 ? Math.round((spentBudget / totalBudget) * 1000) / 10 : 0;

    // Top 6 hospitals with highest budget pressure (annual contracts)
    const topBudgetPressure = [...scopedHospitals]
      .filter((h) => h.contractBillingType !== 'monthly_billing' && h.totalBudget > 0)
      .sort((a, b) => b.spentPercent - a.spentPercent)
      .slice(0, 6);

    // Top 6 hospitals with BG (prioritizing expiring or highest guarantee amount)
    const topBgHospitals = [...scopedHospitals]
      .filter((h) => h.hasBankGuarantee && h.bankGuarantee)
      .sort((a, b) => (b.bankGuarantee?.guaranteeAmount || 0) - (a.bankGuarantee?.guaranteeAmount || 0))
      .slice(0, 6);

    // Hospitals with pending legal / e-stamp
    const pendingLegalHospitals = [...scopedHospitals]
      .filter((h) => !h.legalStatus.includes('ปกติ') || h.stampDutyStatus !== 'ชำระ e-Stamp แล้ว')
      .slice(0, 6);

    // Pending change requests scoped to user role & region
    const scopedPending = pendingRequests.filter((req) => {
      if (!currentRole.isCentralAdmin && !currentRole.allowedRegions.includes(req.region)) {
        return false;
      }
      if (selectedRegion !== 'all' && req.region !== selectedRegion) {
        return false;
      }
      return true;
    });

    const pendingOpenCount = scopedPending.filter((r) => r.status === 'pending').length;
    const pendingApprovedCount = scopedPending.filter((r) => r.status === 'approved').length;
    const pendingRevisionCount = scopedPending.filter(
      (r) => r.status === 'revision_requested' || r.status === 'rejected'
    ).length;

    return {
      total,
      annualCount,
      monthlyCount,
      mouCount,
      centerCount,
      generalCount,
      communityCount,
      statusActive,
      statusExpiring,
      statusExpired,
      statusPending,
      statusDraft,
      totalBudget,
      spentBudget,
      remainingBudget,
      utilizationPct,
      dailyBurnSum,
      annualBudgetHospCount,
      budgetSafe,
      budgetWarning,
      budgetCritical,
      billingRecordsCount,
      billingTotalAmount,
      billingTotalTrips,
      billingGoogleSheetCount,
      billingManualCount,
      hasPoCount,
      hasQtCount,
      hasTorCount,
      hasContractDocCount,
      hasBgCount,
      bgTotalGuaranteeAmount,
      bgActiveCount,
      bgExpiringCount,
      bgReleasedCount,
      bankDistribution: Array.from(bankDistribution.entries())
        .map(([bankName, info]) => ({ bankName, ...info }))
        .sort((a, b) => b.amount - a.amount),
      legalNormal,
      legalPending,
      stampPaid,
      stampWaiting,
      stampDelayed,
      totalAuditLogs,
      totalMonthlyTransactions,
      regionRows: Array.from(regionMap.values()).filter((r) => r.count > 0),
      topBudgetPressure,
      topBgHospitals,
      pendingLegalHospitals,
      pendingOpenCount,
      pendingApprovedCount,
      pendingRevisionCount,
    };
  }, [scopedHospitals, pendingRequests, currentRole, selectedRegion]);

  // Export Thematic Pillar Summary CSV (UTF-8 BOM for Thai Excel)
  const handleExportPillarSummary = () => {
    let csv = '\uFEFF';
    csv += 'รายงานสรุปตามแกนสาระสำคัญ (MediCommand Thematic Summary)\n';
    csv += `ขอบเขตภูมิภาค,${selectedRegion === 'all' ? 'ทุกภูมิภาคตามสิทธิ์' : selectedRegion}\n`;
    csv += `ขอบเขตสัญญา,${billingScope === 'all' ? 'ทั้งหมด' : billingScope === 'annual' ? 'รายปี' : 'รายเดือน'}\n\n`;

    csv += 'แกนสาระที่ 1: โครงสร้างเครือข่ายและสัญญา\n';
    csv += `จำนวนโรงพยาบาลรวม,${metrics.total}\n`;
    csv += `สัญญารายปี (มีวงเงิน),${metrics.annualCount}\n`;
    csv += `สัญญารายเดือน (Monthly Billing),${metrics.monthlyCount}\n`;
    csv += `รพ.ศูนย์ (A),${metrics.centerCount}\n`;
    csv += `รพ.ทั่วไป (S/M1),${metrics.generalCount}\n`;
    csv += `รพ.ชุมชน (M2/F),${metrics.communityCount}\n\n`;

    csv += 'แกนสาระที่ 2: งบประมาณและการวางบิล\n';
    csv += `วงเงินสัญญารวม (บาท),${metrics.totalBudget}\n`;
    csv += `เบิกจ่ายสะสม (บาท),${metrics.spentBudget}\n`;
    csv += `วงเงินคงเหลือสุทธิ (บาท),${metrics.remainingBudget}\n`;
    csv += `อัตราการใช้วงเงิน (%),${metrics.utilizationPct}\n`;
    csv += `ยอดวางบิลที่ตัดวงเงินแล้ว (บาท),${metrics.billingTotalAmount}\n\n`;

    csv += 'แกนสาระที่ 3: เอกสารจัดจ้างและหนังสือค้ำประกัน (BG)\n';
    csv += `รพ.ที่มีใบสั่งจ้าง PO,${metrics.hasPoCount}\n`;
    csv += `รพ.ที่มีหนังสือค้ำประกัน BG,${metrics.hasBgCount}\n`;
    csv += `มูลค่าค้ำประกัน BG รวม (บาท),${metrics.bgTotalGuaranteeAmount}\n\n`;

    csv += 'แกนสาระที่ 4 & 5: นิติกรรม ปริมาณการจัดส่งยา และสรุปรายภูมิภาค\n';
    csv += 'ภูมิภาค,จำนวน รพ.,รายปี,รายเดือน,วงเงินรวม,ใช้ไปแล้ว,คงเหลือ,จำนวน BG,มูลค่า BG,ใกล้หมดอายุ,เที่ยวจัดส่ง/เดือน\n';
    metrics.regionRows.forEach((r) => {
      csv += `"${r.region}",${r.count},${r.annualCount},${r.monthlyCount},${r.totalBudget},${r.spentBudget},${r.remainingBudget},${r.bgCount},${r.bgAmount},${r.expiringCount},${r.monthlyTx}\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.setAttribute('download', `Pillar_Summary_Dashboard_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const showPillar = (key: Exclude<PillarFocus, 'all'>) => activePillar === 'all' || activePillar === key;

  const pct = (part: number, whole: number) => (whole > 0 ? Math.round((part / whole) * 1000) / 10 : 0);

  return (
    <div className="w-full max-w-full min-w-0 space-y-6 pb-12">
      {/* 1. Page Header & Scope Controls */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-1 min-w-0">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span className="font-semibold text-teal-700">Executive Thematic Summary</span>
            <span aria-hidden="true">·</span>
            <span>{currentRole.isCentralAdmin ? 'ขอบเขตข้อมูลทั่วประเทศ' : currentRole.name}</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono tabular-nums">{metrics.total.toLocaleString()} โรงพยาบาลในมุมมองนี้</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            แดชบอร์ดสรุปภาพรวมแยกตาม 5 แกนสาระสำคัญ
          </h1>
          <p className="text-xs text-slate-500 max-w-2xl leading-relaxed">
            วิเคราะห์สถานะการดำเนินงานจากฐานข้อมูลกลางครอบคลุมโครงสร้างสัญญา งบประมาณและการวางบิล เอกสารจัดจ้างและหนังสือค้ำประกัน (BG) นิติกรรมธรรมาภิบาล และปริมาณจัดส่งรายภูมิภาค
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            onClick={onOpenGoogleSheetsSync}
            className="px-3.5 py-2 rounded-lg border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-700" />
            <span>ซิงค์วางบิล Google Sheet</span>
          </button>

          <button
            onClick={handleExportPillarSummary}
            className="px-3.5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>ส่งออกรายงานสรุป (CSV)</span>
          </button>
        </div>
      </div>

      {/* 2. Global Scope Filter + 5-Pillar Focus Segmented Selector */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3.5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Interactive Pillar Selector */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
            {[
              { id: 'all', label: 'ทุกแกนสาระ (5 แกน)' },
              { id: 'network', label: '1. เครือข่าย & สัญญา' },
              { id: 'budget', label: '2. งบประมาณ & วางบิล' },
              { id: 'procurement', label: '3. เอกสาร & BG' },
              { id: 'legal', label: '4. นิติกรรม & อนุมัติ' },
              { id: 'operations', label: '5. ปริมาณจัดส่ง & ภูมิภาค' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActivePillar(tab.id as PillarFocus)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                  activePillar === tab.id
                    ? 'bg-teal-700 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Scope Dropdowns */}
          <div className="flex items-center gap-2 shrink-0">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 font-medium text-slate-800 focus:outline-teal-600"
            >
              <option value="all">ทุกภูมิภาค ({currentRole.allowedRegions.length} ภาค)</option>
              {ALL_REGIONS.filter((r) => currentRole.isCentralAdmin || currentRole.allowedRegions.includes(r)).map(
                (reg) => (
                  <option key={reg} value={reg}>
                    {reg}
                  </option>
                )
              )}
            </select>

            <select
              value={billingScope}
              onChange={(e) => setBillingScope(e.target.value as 'all' | 'annual' | 'monthly')}
              className="text-xs bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 font-medium text-slate-800 focus:outline-teal-600"
            >
              <option value="all">สัญญาทุกประเภท</option>
              <option value="annual">เฉพาะสัญญารายปี (มีวงเงิน)</option>
              <option value="monthly">เฉพาะสัญญารายเดือน</option>
            </select>
          </div>
        </div>

        {/* 5-Pillar At-a-Glance Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-2 border-t border-slate-100">
          <button
            onClick={() => setActivePillar('network')}
            className="text-left p-3 rounded-lg border border-slate-200 bg-slate-50/70 hover:bg-white hover:border-teal-500 transition-colors"
          >
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
              <span>แกนที่ 1 · เครือข่าย</span>
              <Building2 className="w-4 h-4 text-teal-700" />
            </div>
            <div className="text-lg font-bold text-slate-900 font-mono tabular-nums">
              {metrics.total.toLocaleString()} แห่ง
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5 tabular-nums">
              รายปี {metrics.annualCount} · รายเดือน {metrics.monthlyCount}
            </div>
          </button>

          <button
            onClick={() => setActivePillar('budget')}
            className="text-left p-3 rounded-lg border border-slate-200 bg-slate-50/70 hover:bg-white hover:border-teal-500 transition-colors"
          >
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
              <span>แกนที่ 2 · งบประมาณ</span>
              <Wallet className="w-4 h-4 text-emerald-700" />
            </div>
            <div className="text-lg font-bold text-slate-900 font-mono tabular-nums">
              {metrics.utilizationPct}% ใช้ไปแล้ว
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5 truncate tabular-nums">
              วงเงินรวม {formatMillionTHB(metrics.totalBudget)}
            </div>
          </button>

          <button
            onClick={() => setActivePillar('procurement')}
            className="text-left p-3 rounded-lg border border-slate-200 bg-slate-50/70 hover:bg-white hover:border-teal-500 transition-colors"
          >
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
              <span>แกนที่ 3 · เอกสาร &amp; BG</span>
              <Landmark className="w-4 h-4 text-amber-700" />
            </div>
            <div className="text-lg font-bold text-slate-900 font-mono tabular-nums">
              {metrics.hasBgCount.toLocaleString()} สัญญา BG
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5 truncate tabular-nums">
              ค้ำประกันรวม {formatMillionTHB(metrics.bgTotalGuaranteeAmount)}
            </div>
          </button>

          <button
            onClick={() => setActivePillar('legal')}
            className="text-left p-3 rounded-lg border border-slate-200 bg-slate-50/70 hover:bg-white hover:border-teal-500 transition-colors"
          >
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
              <span>แกนที่ 4 · นิติกรรม</span>
              <Scale className="w-4 h-4 text-indigo-700" />
            </div>
            <div className="text-lg font-bold text-slate-900 font-mono tabular-nums">
              {pct(metrics.stampPaid, metrics.total)}% ตราสารครบ
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5 tabular-nums">
              รออนุมัติส่วนกลาง {metrics.pendingOpenCount} คำขอ
            </div>
          </button>

          <button
            onClick={() => setActivePillar('operations')}
            className="text-left p-3 rounded-lg border border-slate-200 bg-slate-50/70 hover:bg-white hover:border-teal-500 transition-colors"
          >
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
              <span>แกนที่ 5 · ปริมาณจัดส่ง</span>
              <PackageCheck className="w-4 h-4 text-blue-700" />
            </div>
            <div className="text-lg font-bold text-slate-900 font-mono tabular-nums">
              {metrics.totalMonthlyTransactions.toLocaleString()} เที่ยว/เดือน
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5 tabular-nums">
              เฉลี่ย {metrics.total > 0 ? Math.round(metrics.totalMonthlyTransactions / metrics.total).toLocaleString() : 0} เที่ยว/รพ.
            </div>
          </button>
        </div>
      </div>

      {/* =====================================================================
          PILLAR 1: โครงสร้างเครือข่ายโรงพยาบาลและสัญญา (Network & Portfolio)
          ===================================================================== */}
      {showPillar('network') && (
        <section className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
            <div>
              <div className="text-xs font-semibold text-teal-700">01. แกนสาระโครงสร้างเครือข่ายและสัญญา</div>
              <h2 className="text-lg font-bold text-slate-900 mt-0.5">
                สัดส่วนโรงพยาบาล ประเภทสัญญา และสถานะความพร้อมทั่วภูมิภาค
              </h2>
            </div>
            <button
              onClick={() => onNavigateToView('directory')}
              className="text-xs font-semibold text-teal-700 hover:text-teal-900 flex items-center gap-1 self-start sm:self-auto"
            >
              <span>เปิดศูนย์ค้นหาโรงพยาบาลทั้งหมด</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Column 1: ประเภทสัญญา & ระดับโรงพยาบาล */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-slate-800">จำแนกตามรูปแบบสัญญา</h3>
              <div className="space-y-3 text-xs">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-slate-700 font-medium">สัญญารายปี (กำหนดวงเงิน)</span>
                    <span className="font-mono font-bold text-slate-900 tabular-nums">
                      {metrics.annualCount.toLocaleString()} ({pct(metrics.annualCount, metrics.total)}%)
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-teal-600 rounded-full"
                      style={{ width: `${pct(metrics.annualCount, metrics.total)}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-slate-700 font-medium">สัญญารายเดือน (ตามใบแจ้งหนี้จริง)</span>
                    <span className="font-mono font-bold text-slate-900 tabular-nums">
                      {metrics.monthlyCount.toLocaleString()} ({pct(metrics.monthlyCount, metrics.total)}%)
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-600 rounded-full"
                      style={{ width: `${pct(metrics.monthlyCount, metrics.total)}%` }}
                    />
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100">
                  <h4 className="text-xs font-bold text-slate-800 mb-2.5">จำแนกตามระดับโรงพยาบาล</h4>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                      <div className="text-[11px] text-slate-500">รพ.ศูนย์ (A)</div>
                      <div className="text-sm font-bold text-slate-900 font-mono tabular-nums mt-0.5">
                        {metrics.centerCount}
                      </div>
                    </div>
                    <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                      <div className="text-[11px] text-slate-500">รพ.ทั่วไป (S/M1)</div>
                      <div className="text-sm font-bold text-slate-900 font-mono tabular-nums mt-0.5">
                        {metrics.generalCount}
                      </div>
                    </div>
                    <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                      <div className="text-[11px] text-slate-500">รพ.ชุมชน (M2/F)</div>
                      <div className="text-sm font-bold text-slate-900 font-mono tabular-nums mt-0.5">
                        {metrics.communityCount}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Column 2: สถานะอายุสัญญา */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-800">สถานะความพร้อมและอายุสัญญา</h3>
              <div className="divide-y divide-slate-100 border border-slate-200 rounded-lg text-xs">
                <div className="flex items-center justify-between px-3.5 py-2.5">
                  <span className="text-slate-700 font-medium">มีผลบังคับใช้ปกติ (Active)</span>
                  <span className="font-mono font-bold text-emerald-700 tabular-nums">
                    {metrics.statusActive.toLocaleString()} แห่ง
                  </span>
                </div>
                <div className="flex items-center justify-between px-3.5 py-2.5">
                  <span className="text-slate-700 font-medium">ใกล้หมดอายุ (&le; 60 วัน)</span>
                  <span className="font-mono font-bold text-amber-700 tabular-nums">
                    {metrics.statusExpiring.toLocaleString()} แห่ง
                  </span>
                </div>
                <div className="flex items-center justify-between px-3.5 py-2.5">
                  <span className="text-slate-700 font-medium">สิ้นสุดสัญญาแล้ว</span>
                  <span className="font-mono font-bold text-rose-700 tabular-nums">
                    {metrics.statusExpired.toLocaleString()} แห่ง
                  </span>
                </div>
                <div className="flex items-center justify-between px-3.5 py-2.5">
                  <span className="text-slate-700 font-medium">รอตรวจสอบ / ร่างสัญญา</span>
                  <span className="font-mono font-bold text-slate-700 tabular-nums">
                    {(metrics.statusPending + metrics.statusDraft).toLocaleString()} แห่ง
                  </span>
                </div>
              </div>
            </div>

            {/* Column 3: กระจายตัวตามภูมิภาค */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-800">การกระจายตัวตาม 6 ภูมิภาค</h3>
              <div className="space-y-2.5 text-xs">
                {metrics.regionRows.map((reg) => {
                  const share = pct(reg.count, metrics.total);
                  return (
                    <div key={reg.region} className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-700 font-medium">
                          {REGION_SHORT_LABEL[reg.region] || reg.region}
                        </span>
                        <span className="font-mono text-slate-700 tabular-nums">
                          <strong className="text-slate-900">{reg.count}</strong> แห่ง ({share}%)
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-slate-800 rounded-full" style={{ width: `${share}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* =====================================================================
          PILLAR 2: การบริหารงบประมาณและการวางบิลรายเดือน (Budget & Monthly Billing)
          ===================================================================== */}
      {showPillar('budget') && (
        <section className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
            <div>
              <div className="text-xs font-semibold text-emerald-700">
                02. แกนสาระการบริหารงบประมาณและการวางบิลรายเดือน
              </div>
              <h2 className="text-lg font-bold text-slate-900 mt-0.5">
                สถานะวงเงินสัญญา อัตราการใช้จ่าย และยอดตัดบิลจาก Google Sheet
              </h2>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={onOpenGoogleSheetsSync}
                className="text-xs font-semibold text-emerald-700 hover:text-emerald-900 flex items-center gap-1"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>นำเข้าข้อมูลวางบิลตัดงบ</span>
              </button>
              <button
                onClick={() => onNavigateToView('forecast')}
                className="text-xs font-semibold text-teal-700 hover:text-teal-900 flex items-center gap-1"
              >
                <span>ไปหน้าพยากรณ์ AI</span>
                <ArrowUpRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Budget KPI Summary Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-lg border border-slate-200 bg-slate-50/70">
              <div className="text-xs text-slate-500">วงเงินตามสัญญารายปีรวม</div>
              <div className="text-xl font-bold text-slate-900 font-mono tabular-nums mt-1">
                {formatMillionTHB(metrics.totalBudget)}
              </div>
              <div className="text-[11px] text-slate-500 mt-1 tabular-nums">
                ครอบคลุม {metrics.annualBudgetHospCount.toLocaleString()} สัญญาที่มีวงเงิน
              </div>
            </div>

            <div className="p-4 rounded-lg border border-slate-200 bg-slate-50/70">
              <div className="text-xs text-slate-500">เบิกจ่ายสะสมแล้ว (Spent)</div>
              <div className="text-xl font-bold text-teal-800 font-mono tabular-nums mt-1">
                {formatMillionTHB(metrics.spentBudget)}
              </div>
              <div className="text-[11px] text-slate-500 mt-1 tabular-nums">
                คิดเป็น {metrics.utilizationPct}% ของวงเงินรวมทั้งหมด
              </div>
            </div>

            <div className="p-4 rounded-lg border border-slate-200 bg-slate-50/70">
              <div className="text-xs text-slate-500">วงเงินคงเหลือสุทธิ (Remaining)</div>
              <div className="text-xl font-bold text-emerald-700 font-mono tabular-nums mt-1">
                {formatMillionTHB(metrics.remainingBudget)}
              </div>
              <div className="text-[11px] text-slate-500 mt-1 tabular-nums">
                อัตราการใช้จ่ายเฉลี่ย {formatTHB(metrics.dailyBurnSum)} / วัน
              </div>
            </div>

            <div className="p-4 rounded-lg border border-slate-200 bg-slate-50/70">
              <div className="text-xs text-slate-500">ยอดวางบิลที่ตัดวงเงินแล้ว</div>
              <div className="text-xl font-bold text-slate-900 font-mono tabular-nums mt-1">
                {formatMillionTHB(metrics.billingTotalAmount)}
              </div>
              <div className="text-[11px] text-slate-500 mt-1 tabular-nums">
                {metrics.billingRecordsCount.toLocaleString()} บิล ({metrics.billingTotalTrips.toLocaleString()} เที่ยว) · Sheet {metrics.billingGoogleSheetCount}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Budget Health Tiers */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-800">ระดับสุขภาพวงเงิน (เฉพาะสัญญารายปี)</h3>
              <div className="space-y-3 text-xs p-4 rounded-lg border border-slate-200">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-slate-700">ปกติ / ปลอดภัย (&lt; 75%)</span>
                    <span className="font-mono font-bold text-emerald-700 tabular-nums">
                      {metrics.budgetSafe} แห่ง
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-600 rounded-full"
                      style={{ width: `${pct(metrics.budgetSafe, metrics.annualBudgetHospCount)}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-slate-700">เฝ้าระวังใกล้เต็ม (75% – 89%)</span>
                    <span className="font-mono font-bold text-amber-700 tabular-nums">
                      {metrics.budgetWarning} แห่ง
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-500 rounded-full"
                      style={{ width: `${pct(metrics.budgetWarning, metrics.annualBudgetHospCount)}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-slate-700">วิกฤต / เตรียมขยายวงเงิน (&ge; 90%)</span>
                    <span className="font-mono font-bold text-rose-700 tabular-nums">
                      {metrics.budgetCritical} แห่ง
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-rose-600 rounded-full"
                      style={{ width: `${pct(metrics.budgetCritical, metrics.annualBudgetHospCount)}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Top 6 Highest Utilization Hospitals */}
            <div className="lg:col-span-2 space-y-3">
              <h3 className="text-xs font-bold text-slate-800">
                โรงพยาบาลที่มีอัตราการใช้วงเงินสูงสุด (Top 6 Budget Utilization)
              </h3>
              <div className="border border-slate-200 rounded-lg overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                    <tr>
                      <th className="py-2.5 px-3">โรงพยาบาล</th>
                      <th className="py-2.5 px-3">ภูมิภาค</th>
                      <th className="py-2.5 px-3 text-right">วงเงินสัญญา</th>
                      <th className="py-2.5 px-3 text-right">คงเหลือ</th>
                      <th className="py-2.5 px-3 text-right">ใช้ไปแล้ว</th>
                      <th className="py-2.5 px-3 text-right">ตรวจสอบ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {metrics.topBudgetPressure.map((h) => (
                      <tr
                        key={h.id}
                        onClick={() => onSelectHospital(h)}
                        className="hover:bg-slate-50 cursor-pointer transition-colors"
                      >
                        <td className="py-2.5 px-3 font-semibold text-slate-900">
                          {h.name}
                          <span className="text-[11px] font-normal text-slate-500 ml-1.5 font-mono">
                            {h.contractNumber}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-slate-600">
                          {REGION_SHORT_LABEL[h.region] || h.region}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono tabular-nums text-slate-700">
                          {h.totalBudget.toLocaleString()} ฿
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono tabular-nums font-semibold text-slate-900">
                          {h.remainingBudget.toLocaleString()} ฿
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono tabular-nums font-bold">
                          <span
                            className={
                              h.spentPercent >= 90
                                ? 'text-rose-700'
                                : h.spentPercent >= 75
                                ? 'text-amber-700'
                                : 'text-emerald-700'
                            }
                          >
                            {h.spentPercent}%
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          <span className="text-teal-700 font-semibold inline-flex items-center gap-0.5">
                            ดูข้อมูล <ChevronRight className="w-3.5 h-3.5" />
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* =====================================================================
          PILLAR 3: เอกสารจัดจ้างและหนังสือค้ำประกันสัญญา (Procurement & BG)
          ===================================================================== */}
      {showPillar('procurement') && (
        <section className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
            <div>
              <div className="text-xs font-semibold text-amber-700">
                03. แกนสาระเอกสารจัดจ้างและหนังสือค้ำประกันสัญญา (BG)
              </div>
              <h2 className="text-lg font-bold text-slate-900 mt-0.5">
                ความครบถ้วนของเอกสาร QT / PO / TOR และพอร์ตหนังสือค้ำประกันธนาคาร
              </h2>
            </div>
            <button
              onClick={() => onNavigateToView('directory')}
              className="text-xs font-semibold text-teal-700 hover:text-teal-900 flex items-center gap-1 self-start sm:self-auto"
            >
              <span>กรองเฉพาะ รพ. ที่มี BG ในศูนย์ค้นหา</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>

          {/* 4 Document Coverage Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
            <div className="p-4 rounded-lg border border-slate-200 bg-slate-50/70">
              <div className="text-xs text-slate-500 flex items-center justify-between">
                <span>ใบสั่งจ้าง (PO / Work Order)</span>
                <FileCheck2 className="w-4 h-4 text-teal-700" />
              </div>
              <div className="text-lg font-bold text-slate-900 font-mono tabular-nums mt-1">
                {metrics.hasPoCount.toLocaleString()} / {metrics.total.toLocaleString()}
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5 tabular-nums">
                ความครบถ้วน {pct(metrics.hasPoCount, metrics.total)}%
              </div>
            </div>

            <div className="p-4 rounded-lg border border-slate-200 bg-slate-50/70">
              <div className="text-xs text-slate-500 flex items-center justify-between">
                <span>ใบเสนอราคา (QT)</span>
                <FileCheck2 className="w-4 h-4 text-blue-700" />
              </div>
              <div className="text-lg font-bold text-slate-900 font-mono tabular-nums mt-1">
                {metrics.hasQtCount.toLocaleString()} / {metrics.total.toLocaleString()}
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5 tabular-nums">
                ความครบถ้วน {pct(metrics.hasQtCount, metrics.total)}%
              </div>
            </div>

            <div className="p-4 rounded-lg border border-slate-200 bg-slate-50/70">
              <div className="text-xs text-slate-500 flex items-center justify-between">
                <span>ข้อกำหนดขอบเขต (TOR)</span>
                <Layers className="w-4 h-4 text-indigo-700" />
              </div>
              <div className="text-lg font-bold text-slate-900 font-mono tabular-nums mt-1">
                {metrics.hasTorCount.toLocaleString()} / {metrics.total.toLocaleString()}
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5 tabular-nums">
                ความครบถ้วน {pct(metrics.hasTorCount, metrics.total)}%
              </div>
            </div>

            <div className="p-4 rounded-lg border border-amber-200 bg-amber-50/50">
              <div className="text-xs text-amber-900 font-medium flex items-center justify-between">
                <span>หนังสือค้ำประกัน (BG)</span>
                <Landmark className="w-4 h-4 text-amber-700" />
              </div>
              <div className="text-lg font-bold text-amber-950 font-mono tabular-nums mt-1">
                {metrics.hasBgCount.toLocaleString()} สัญญา
              </div>
              <div className="text-[11px] text-amber-800 mt-0.5 tabular-nums">
                มูลค่าค้ำประกันรวม {formatMillionTHB(metrics.bgTotalGuaranteeAmount)}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Bank Guarantee Breakdown by Issuing Bank */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-800">สัดส่วนหนังสือค้ำประกันแยกตามธนาคาร</h3>
                <span className="text-[11px] text-slate-500 font-mono tabular-nums">
                  Active {metrics.bgActiveCount} · ใกล้หมดอายุ {metrics.bgExpiringCount}
                </span>
              </div>

              <div className="border border-slate-200 rounded-lg divide-y divide-slate-100 text-xs">
                {metrics.bankDistribution.length > 0 ? (
                  metrics.bankDistribution.map((bank) => (
                    <div key={bank.bankName} className="p-3 flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <div className="font-semibold text-slate-800 truncate">{bank.bankName}</div>
                        <div className="text-[11px] text-slate-500 tabular-nums">
                          {bank.count.toLocaleString()} ฉบับ ({pct(bank.count, metrics.hasBgCount)}%)
                        </div>
                      </div>
                      <div className="text-right font-mono font-bold text-amber-900 tabular-nums shrink-0">
                        {formatTHB(bank.amount)}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-6 text-center text-slate-400">
                    ไม่พบสัญญาที่มีหนังสือค้ำประกันในตัวกรองปัจจุบัน
                  </div>
                )}
              </div>
            </div>

            {/* Top Bank Guarantee Contracts */}
            <div className="lg:col-span-2 space-y-3">
              <h3 className="text-xs font-bold text-slate-800">
                รายการหนังสือค้ำประกันสัญญาที่มีมูลค่าสูงสุด (Top 6 BG Portfolio)
              </h3>
              <div className="border border-slate-200 rounded-lg overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                    <tr>
                      <th className="py-2.5 px-3">โรงพยาบาล</th>
                      <th className="py-2.5 px-3">เลขที่ BG</th>
                      <th className="py-2.5 px-3">ธนาคารผู้ออก</th>
                      <th className="py-2.5 px-3 text-right">วงเงินค้ำประกัน</th>
                      <th className="py-2.5 px-3">วันสิ้นสุด BG</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {metrics.topBgHospitals.length > 0 ? (
                      metrics.topBgHospitals.map((h) => (
                        <tr
                          key={h.id}
                          onClick={() => onSelectHospital(h)}
                          className="hover:bg-slate-50 cursor-pointer transition-colors"
                        >
                          <td className="py-2.5 px-3 font-semibold text-slate-900">{h.name}</td>
                          <td className="py-2.5 px-3 font-mono text-slate-700">
                            {h.bankGuarantee?.bgNumber}
                          </td>
                          <td className="py-2.5 px-3 text-slate-600 truncate max-w-[180px]">
                            {h.bankGuarantee?.bankName}
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono font-bold text-amber-900 tabular-nums">
                            {h.bankGuarantee?.guaranteeAmount.toLocaleString()} ฿
                          </td>
                          <td className="py-2.5 px-3 font-mono text-slate-600">
                            {h.bankGuarantee?.expiryDate}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="py-6 text-center text-slate-400">
                          ไม่มีข้อมูลหนังสือค้ำประกันในกลุ่มที่เลือก
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* =====================================================================
          PILLAR 4: นิติกรรม อากรแสตมป์ และธรรมาภิบาลข้อมูล (Legal & Governance)
          ===================================================================== */}
      {showPillar('legal') && (
        <section className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
            <div>
              <div className="text-xs font-semibold text-indigo-700">
                04. แกนสาระนิติกรรม อากรแสตมป์ และธรรมาภิบาลข้อมูล
              </div>
              <h2 className="text-lg font-bold text-slate-900 mt-0.5">
                สถานะความสมบูรณ์ทางกฎหมาย e-Stamp Duty คิวอนุมัติส่วนกลาง และประวัติแก้ไข
              </h2>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => onNavigateToView('legal')}
                className="text-xs font-semibold text-indigo-700 hover:text-indigo-900 flex items-center gap-1"
              >
                <span>หน้านิติการ &amp; ตีตราสาร</span>
                <ArrowUpRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => onNavigateToView('audit')}
                className="text-xs font-semibold text-teal-700 hover:text-teal-900 flex items-center gap-1"
              >
                <span>ประวัติแก้ไขรวม</span>
                <ArrowUpRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Legal & e-Stamp Compliance */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-800">สถานะอากรแสตมป์ (e-Stamp Duty) &amp; นิติกรรม</h3>
              <div className="p-4 rounded-lg border border-slate-200 space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-slate-700">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    ชำระ e-Stamp แล้ว
                  </span>
                  <span className="font-mono font-bold text-emerald-700 tabular-nums">
                    {metrics.stampPaid.toLocaleString()} ({pct(metrics.stampPaid, metrics.total)}%)
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-slate-700">
                    <Clock className="w-4 h-4 text-amber-600" />
                    รอชำระอากร
                  </span>
                  <span className="font-mono font-bold text-amber-700 tabular-nums">
                    {metrics.stampWaiting.toLocaleString()} แห่ง
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-slate-700">
                    <AlertTriangle className="w-4 h-4 text-rose-600" />
                    ค้างดำเนินการตีตราสาร
                  </span>
                  <span className="font-mono font-bold text-rose-700 tabular-nums">
                    {metrics.stampDelayed.toLocaleString()} แห่ง
                  </span>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-slate-600">นิติกรรมปกติสมบูรณ์</span>
                  <span className="font-mono font-bold text-slate-900 tabular-nums">
                    {metrics.legalNormal.toLocaleString()} / {metrics.total.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Governance Queue & Audit Trail */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-800">ธรรมาภิบาลข้อมูลและคิวอนุมัติส่วนกลาง</h3>
              <div className="p-4 rounded-lg border border-slate-200 space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-700">คำขอที่ AM เสนอรอส่วนกลางอนุมัติ</span>
                  <span className="font-mono font-bold text-amber-700 tabular-nums">
                    {metrics.pendingOpenCount} รายการ
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-700">คำขอที่อนุมัติเข้าฐานข้อมูลแล้ว</span>
                  <span className="font-mono font-bold text-emerald-700 tabular-nums">
                    {metrics.pendingApprovedCount} รายการ
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-700">ส่งกลับแก้ไข / ไม่อนุมัติ</span>
                  <span className="font-mono font-bold text-slate-700 tabular-nums">
                    {metrics.pendingRevisionCount} รายการ
                  </span>
                </div>
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-slate-700">ประวัติการเปลี่ยนแปลงสะสม (Audit Logs)</span>
                  <span className="font-mono font-bold text-slate-900 tabular-nums">
                    {metrics.totalAuditLogs.toLocaleString()} รายการ
                  </span>
                </div>
                <button
                  onClick={onOpenPendingReviews}
                  className="w-full mt-2 py-2 px-3 rounded-lg border border-slate-300 bg-slate-50 hover:bg-slate-100 text-slate-800 font-semibold text-xs transition-colors"
                >
                  เปิดหน้าต่างตรวจสอบคำขออนุมัติ ({metrics.pendingOpenCount})
                </button>
              </div>
            </div>

            {/* Actionable Legal Watchlist */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-800">รายการติดตามเร่งรัดนิติกรรม / อากร</h3>
              <div className="border border-slate-200 rounded-lg divide-y divide-slate-100 text-xs">
                {metrics.pendingLegalHospitals.length > 0 ? (
                  metrics.pendingLegalHospitals.map((h) => (
                    <div
                      key={h.id}
                      onClick={() => onSelectHospital(h)}
                      className="p-3 hover:bg-slate-50 cursor-pointer flex items-center justify-between gap-2"
                    >
                      <div className="min-w-0">
                        <div className="font-semibold text-slate-900 truncate">{h.name}</div>
                        <div className="text-[11px] text-slate-500 truncate">
                          {h.legalStatus} · {h.stampDutyStatus}
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
                    </div>
                  ))
                ) : (
                  <div className="p-6 text-center text-emerald-700 font-medium">
                    ทุกรายการในขอบเขตนี้ดำเนินการนิติกรรมและอากรแสตมป์ครบถ้วนแล้ว
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* =====================================================================
          PILLAR 5: ปริมาณการจัดส่งยาและเปรียบเทียบรายภูมิภาค (Delivery & Regional Matrix)
          ===================================================================== */}
      {showPillar('operations') && (
        <section className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
            <div>
              <div className="text-xs font-semibold text-blue-700">
                05. แกนสาระปริมาณการจัดส่งยาและเปรียบเทียบรายภูมิภาค
              </div>
              <h2 className="text-lg font-bold text-slate-900 mt-0.5">
                ปริมาณจัดส่งยาต่อเดือน สัญญาใกล้หมดอายุ และตารางสรุปครบทุกมิติแยกตามภูมิภาค
              </h2>
            </div>
            <button
              onClick={() => onNavigateToView('tasks')}
              className="text-xs font-semibold text-blue-700 hover:text-blue-900 flex items-center gap-1 self-start sm:self-auto"
            >
              <span>ดู AM Task Pipeline</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg border border-slate-200 bg-slate-50/70">
              <div className="text-xs text-slate-500">ปริมาณจัดส่งยาถึงบ้านรายเดือนรวม</div>
              <div className="text-xl font-bold text-blue-800 font-mono tabular-nums mt-1">
                {metrics.totalMonthlyTransactions.toLocaleString()} เที่ยว/เดือน
              </div>
              <div className="text-[11px] text-slate-500 mt-1 tabular-nums">
                ครอบคลุม {metrics.total.toLocaleString()} โรงพยาบาลในระบบ
              </div>
            </div>

            <div className="p-4 rounded-lg border border-slate-200 bg-slate-50/70">
              <div className="text-xs text-slate-500">ปริมาณจัดส่งเฉลี่ยต่อโรงพยาบาล</div>
              <div className="text-xl font-bold text-slate-900 font-mono tabular-nums mt-1">
                {metrics.total > 0 ? Math.round(metrics.totalMonthlyTransactions / metrics.total).toLocaleString() : 0} เที่ยว/เดือน
              </div>
              <div className="text-[11px] text-slate-500 mt-1">
                คำนวณจากยอดจัดส่งรายเดือนและเครือข่ายในขอบเขตปัจจุบัน
              </div>
            </div>

            <div className="p-4 rounded-lg border border-slate-200 bg-slate-50/70">
              <div className="text-xs text-slate-500">สัญญาใกล้หมดอายุและสิ้นสุด (≤ 60 วัน)</div>
              <div className="text-xl font-bold text-amber-800 font-mono tabular-nums mt-1">
                {(metrics.statusExpiring + metrics.statusExpired).toLocaleString()} แห่ง
              </div>
              <div className="text-[11px] text-slate-500 mt-1 tabular-nums">
                คิดเป็น {pct(metrics.statusExpiring + metrics.statusExpired, metrics.total)}% ของพอร์ตสัญญาทั้งหมด
              </div>
            </div>
          </div>

          {/* Comprehensive Regional Matrix Table */}
          <div className="border border-slate-200 rounded-lg overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold">
                <tr>
                  <th className="py-3 px-3.5 whitespace-nowrap">ภูมิภาค</th>
                  <th className="py-3 px-3 text-right whitespace-nowrap">จำนวน รพ.</th>
                  <th className="py-3 px-3 text-right whitespace-nowrap">รายปี / รายเดือน</th>
                  <th className="py-3 px-3 text-right whitespace-nowrap">วงเงินสัญญารวม</th>
                  <th className="py-3 px-3 text-right whitespace-nowrap">ใช้ไปแล้ว (%)</th>
                  <th className="py-3 px-3 text-right whitespace-nowrap">มี BG (มูลค่า)</th>
                  <th className="py-3 px-3 text-right whitespace-nowrap">ใกล้หมดอายุ</th>
                  <th className="py-3 px-3.5 text-right whitespace-nowrap">จัดส่ง/เดือน</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {metrics.regionRows.map((reg) => {
                  const regUtil = reg.totalBudget > 0 ? Math.round((reg.spentBudget / reg.totalBudget) * 1000) / 10 : 0;
                  return (
                    <tr key={reg.region} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-3.5 font-bold text-slate-900 whitespace-nowrap">
                        {reg.region}
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-bold text-slate-900 tabular-nums">
                        {reg.count.toLocaleString()}
                      </td>
                      <td className="py-3 px-3 text-right font-mono text-slate-600 tabular-nums whitespace-nowrap">
                        {reg.annualCount} / {reg.monthlyCount}
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-semibold text-slate-800 tabular-nums whitespace-nowrap">
                        {formatMillionTHB(reg.totalBudget)}
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-bold tabular-nums">
                        <span
                          className={
                            regUtil >= 88 ? 'text-rose-700' : regUtil >= 75 ? 'text-amber-700' : 'text-emerald-700'
                          }
                        >
                          {regUtil}%
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right font-mono text-amber-900 tabular-nums whitespace-nowrap">
                        {reg.bgCount} ({formatMillionTHB(reg.bgAmount)})
                      </td>
                      <td className="py-3 px-3 text-right font-mono text-amber-700 font-semibold tabular-nums">
                        {reg.expiringCount.toLocaleString()} แห่ง
                      </td>
                      <td className="py-3 px-3.5 text-right font-mono font-semibold text-blue-800 tabular-nums">
                        {reg.monthlyTx.toLocaleString()} เที่ยว
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
};
