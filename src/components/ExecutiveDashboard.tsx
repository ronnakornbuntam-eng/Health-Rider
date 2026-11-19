import React, { useState, useMemo } from 'react';
import { 
  Building2, 
  ShieldCheck, 
  Clock, 
  AlertTriangle, 
  TrendingUp, 
  Receipt, 
  Flame, 
  ChevronRight, 
  Search, 
  Download, 
  FileText, 
  CheckCircle2, 
  Send, 
  ExternalLink, 
  Info,
  Calendar,
  Layers,
  ArrowUpRight,
  Filter,
  FileSpreadsheet,
  Lock,
  RefreshCw,
  Bell
} from 'lucide-react';
import { 
  HospitalContract, 
  REGIONS_DATA, 
  RoleConfig 
} from '../data/contractsData';
import { ViewType } from './Sidebar';

interface ExecutiveDashboardProps {
  hospitals: HospitalContract[];
  currentRole: RoleConfig;
  lastUpdated: string;
  onRefresh: () => void;
  isRefreshing: boolean;
  onSelectHospital: (hospital: HospitalContract) => void;
  onOpenImportModal: () => void;
  onOpenExportModal: () => void;
  onOpenDispatchAlert: (hospital: HospitalContract, alertType: string) => void;
  onNavigateToView: (view: ViewType) => void;
  onOpenAddHospital?: () => void;
  onEditHospital?: (hospital: HospitalContract) => void;
  pendingReviewsCount?: number;
  onOpenPendingReviews?: () => void;
}

export const ExecutiveDashboard: React.FC<ExecutiveDashboardProps> = ({
  hospitals,
  currentRole,
  lastUpdated,
  onRefresh,
  isRefreshing,
  onSelectHospital,
  onOpenImportModal,
  onOpenExportModal,
  onOpenDispatchAlert,
  onNavigateToView,
  onOpenAddHospital,
  onEditHospital,
  pendingReviewsCount = 0,
  onOpenPendingReviews,
}) => {
  // Filters state
  const [selectedRegion, setSelectedRegion] = useState<string>('all');
  const [selectedAm, setSelectedAm] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  // Watchlist table filter & search & pagination
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [watchlistFilter, setWatchlistFilter] = useState<'all' | 'over' | 'expiring' | 'pending_doc'>('all');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 6;

  // Filtered hospitals
  const filteredHospitals = useMemo(() => {
    return hospitals.filter((h) => {
      // Role-based filtering if role has restrictions (e.g. AM ภาคเหนือ)
      if (currentRole.allowedRegions && !currentRole.allowedRegions.includes(h.region)) {
        return false;
      }
      if (selectedRegion !== 'all' && h.region !== selectedRegion) return false;
      if (selectedAm !== 'all' && h.amName !== selectedAm) return false;
      if (selectedType !== 'all' && h.hospitalType !== selectedType) return false;
      if (selectedStatus !== 'all') {
        if (selectedStatus === 'over' && h.spentPercent < 100) return false;
        if (selectedStatus === 'warning' && (h.spentPercent < 80 || h.spentPercent >= 100)) return false;
        if (selectedStatus === 'expiring' && h.daysUntilExpiry > 60) return false;
        if (selectedStatus === 'normal' && (h.spentPercent >= 80 || h.daysUntilExpiry <= 60)) return false;
      }
      return true;
    });
  }, [hospitals, currentRole, selectedRegion, selectedAm, selectedType, selectedStatus]);

  // Watchlist matrix filtered
  const watchlistItems = useMemo(() => {
    return filteredHospitals.filter((h) => {
      // tab filter
      if (watchlistFilter === 'over' && h.spentPercent < 100) return false;
      if (watchlistFilter === 'expiring' && h.daysUntilExpiry > 30) return false;
      if (watchlistFilter === 'pending_doc' && !h.legalStatus.includes('ค้าง') && !h.legalStatus.includes('รอ')) return false;

      // search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = h.name.toLowerCase().includes(q);
        const matchHcode = h.hcode.toLowerCase().includes(q);
        const matchCus = h.cusCode.toLowerCase().includes(q);
        const matchContract = h.contractNumber.toLowerCase().includes(q);
        const matchProvince = h.province.toLowerCase().includes(q);
        const matchPostal = h.address.postalCode.includes(q);
        const matchAm = h.amName.toLowerCase().includes(q);
        const matchCategory = h.contractCategory.toLowerCase().includes(q);
        if (!matchName && !matchHcode && !matchCus && !matchContract && !matchProvince && !matchPostal && !matchAm && !matchCategory) return false;
      }
      return true;
    });
  }, [filteredHospitals, watchlistFilter, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(watchlistItems.length / pageSize));
  const paginatedWatchlist = watchlistItems.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  // Unique AMs list
  const amList = useMemo(() => {
    const set = new Set<string>();
    hospitals.forEach((h) => set.add(h.amName));
    return Array.from(set);
  }, [hospitals]);

  return (
    <div className="w-full max-w-full min-w-0 space-y-6 pb-12">
      {/* 1. Header Title & Actions Row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">
              ภาพรวมระบบบริหารสัญญาโรงพยาบาล
            </h1>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
              Executive Command
            </span>
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>Realtime Sync Active</span>
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            ข้อมูลสรุปสถานะสัญญาทั่วประเทศ อัตราการใช้วงเงิน และความเสี่ยงแบบเรียลไทม์ (อัปเดต ณ {lastUpdated})
          </p>
        </div>

        {/* Action buttons (Pending Reviews, Refresh, Import Excel, Export Excel, Add Hospital) */}
        <div className="flex items-center gap-2 flex-wrap">
          {onOpenPendingReviews && (
            <button
              onClick={onOpenPendingReviews}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-md active:scale-95 transition-all shadow-xs ${
                pendingReviewsCount > 0
                  ? 'bg-amber-500 hover:bg-amber-600 text-slate-950 ring-1 ring-amber-400'
                  : 'bg-slate-800 hover:bg-slate-700 text-white'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>รอตรวจสอบจากส่วนกลาง</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-extrabold ${
                pendingReviewsCount > 0 ? 'bg-slate-950 text-white' : 'bg-slate-700 text-slate-200'
              }`}>
                {pendingReviewsCount}
              </span>
            </button>
          )}

          {onOpenAddHospital && (
            <button
              onClick={onOpenAddHospital}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-teal-700 rounded-md hover:bg-teal-800 active:scale-95 transition-all shadow-xs"
            >
              <span>+ เพิ่มโรงพยาบาลใหม่</span>
            </button>
          )}

          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 active:scale-95 transition-all shadow-2xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-slate-600 ${isRefreshing ? 'animate-spin text-teal-600' : ''}`} />
            <span>รีเฟรช</span>
          </button>

          {currentRole.canImport ? (
            <button
              onClick={onOpenImportModal}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-emerald-600 rounded-md hover:bg-emerald-700 active:scale-95 transition-all shadow-2xs"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>นำเข้าไฟล์ Excel .xlsx</span>
            </button>
          ) : (
            <div 
              title="AM แต่ละภาคไม่สามารถ Import Excel ได้ (สงวนสิทธิ์เฉพาะ Admin ส่วนกลาง)"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-400 bg-slate-100 border border-slate-200 rounded-md cursor-not-allowed select-none"
            >
              <Lock className="w-3.5 h-3.5 text-slate-400" />
              <span>นำเข้า Excel (เฉพาะ Admin)</span>
            </div>
          )}

          {currentRole.canExport ? (
            <button
              onClick={onOpenExportModal}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-300 rounded-md hover:bg-emerald-100 active:scale-95 transition-all"
            >
              <Download className="w-3.5 h-3.5 text-emerald-700" />
              <span>ส่งออกข้อมูล Excel</span>
            </button>
          ) : (
            <div 
              title="AM แต่ละภาคไม่สามารถ Export Excel ได้ (สงวนสิทธิ์เฉพาะ Admin ส่วนกลาง)"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-400 bg-slate-100 border border-slate-200 rounded-md cursor-not-allowed select-none"
            >
              <Lock className="w-3.5 h-3.5 text-slate-400" />
              <span>ส่งออก Excel (เฉพาะ Admin)</span>
            </div>
          )}
        </div>
      </div>

      {/* 2. Global Filter Bar */}
      <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-2xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
              ภูมิภาค (REGION)
            </label>
            <select
              value={selectedRegion}
              onChange={(e) => {
                setSelectedRegion(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-slate-50 hover:bg-slate-100 border border-slate-300 text-slate-800 rounded-md px-2.5 py-1.5 focus:outline-teal-600 focus:bg-white transition-colors"
            >
              <option value="all">ทั้งหมด (5 ภูมิภาค)</option>
              <option value="ภาคกลาง">ภาคกลาง (58 รพ.)</option>
              <option value="ภาคเหนือ">ภาคเหนือ (39 รพ.)</option>
              <option value="ภาคตะวันออกเฉียงเหนือ">ภาคตะวันออกเฉียงเหนือ (46 รพ.)</option>
              <option value="ภาคตะวันออก">ภาคตะวันออก (14 รพ.)</option>
              <option value="ภาคใต้">ภาคใต้ (28 รพ.)</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
              ผู้รับผิดชอบ (AM FILTER)
            </label>
            <select
              value={selectedAm}
              onChange={(e) => {
                setSelectedAm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-slate-50 hover:bg-slate-100 border border-slate-300 text-slate-800 rounded-md px-2.5 py-1.5 focus:outline-teal-600 focus:bg-white transition-colors"
            >
              <option value="all">ทุกคน (All Account Managers)</option>
              {amList.map((am) => (
                <option key={am} value={am}>
                  {am}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
              ประเภทโรงพยาบาล
            </label>
            <select
              value={selectedType}
              onChange={(e) => {
                setSelectedType(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-slate-50 hover:bg-slate-100 border border-slate-300 text-slate-800 rounded-md px-2.5 py-1.5 focus:outline-teal-600 focus:bg-white transition-colors"
            >
              <option value="all">ทุกประเภทสถานพยาบาล</option>
              <option value="รพ.ศูนย์ (A)">รพ.ศูนย์ (ระดับ A)</option>
              <option value="รพ.ทั่วไป (S/M1)">รพ.ทั่วไป (ระดับ S / M1)</option>
              <option value="รพ.ชุมชน (M2/F)">รพ.ชุมชน (ระดับ M2 / F)</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
              สถานะความเสี่ยง &amp; วงเงิน
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-slate-50 hover:bg-slate-100 border border-slate-300 text-slate-800 rounded-md px-2.5 py-1.5 focus:outline-teal-600 focus:bg-white transition-colors"
            >
              <option value="all">ทุกระดับสถานะสัญญา</option>
              <option value="over">เกิน 100% (เกินเพดานงบประมาณ)</option>
              <option value="warning">ใกล้เต็ม (80% - 99%) เฝ้าระวัง</option>
              <option value="expiring">ใกล้หมดอายุ (&lt; 60 วัน)</option>
              <option value="normal">ปกติ (&lt; 80%)</option>
            </select>
          </div>
        </div>
      </div>

      {/* 3. Seven KPI Cards Row (Exact Match to Image 3) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
        {/* 1. รพ. ในระบบ */}
        <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-2xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
            <span className="font-medium text-[11px]">รพ. ในระบบ</span>
            <Building2 className="w-3.5 h-3.5 text-blue-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 tabular-nums">185</div>
          <p className="text-[11px] text-blue-600 font-medium mt-1">
            +12 แห่ง YoY
          </p>
        </div>

        {/* 2. สัญญา ACTIVE */}
        <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-2xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
            <span className="font-medium text-[11px]">สัญญา ACTIVE</span>
            <ShieldCheck className="w-3.5 h-3.5 text-sky-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 tabular-nums">248</div>
          <p className="text-[11px] text-slate-500 font-medium mt-1">
            มูลค่า 485.6M บาท
          </p>
        </div>

        {/* 3. ใกล้หมดอายุ */}
        <div className="bg-white p-3 rounded-lg border border-rose-200/80 shadow-2xs hover:border-rose-300 transition-all">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
            <span className="font-medium text-[11px] text-rose-700">ใกล้หมดอายุ</span>
            <span className="bg-rose-50 text-rose-700 text-[10px] font-bold px-1.5 py-0.2 rounded border border-rose-200">
              &lt;60 วัน
            </span>
          </div>
          <div className="text-2xl font-bold text-rose-600 tabular-nums">
            14 <span className="text-xs font-normal text-slate-500">สัญญา</span>
          </div>
          <p className="text-[11px] text-rose-600 font-medium mt-1 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
            เร่งทำสัญญาต่ออายุ
          </p>
        </div>

        {/* 4. เกิน 100% */}
        <div className="bg-white p-3 rounded-lg border border-red-200/80 shadow-2xs hover:border-red-300 transition-all">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
            <span className="font-medium text-[11px] text-red-700">เกิน 100%</span>
            <AlertTriangle className="w-3.5 h-3.5 text-red-500" />
          </div>
          <div className="text-2xl font-bold text-red-600 tabular-nums">
            3 <span className="text-xs font-normal text-slate-500">รพ.</span>
          </div>
          <p className="text-[11px] text-red-600 font-medium mt-1">
            เกิน 1.84M บาท
          </p>
        </div>

        {/* 5. ใกล้เต็ม (80-99%) */}
        <div className="bg-white p-3 rounded-lg border border-amber-200/80 shadow-2xs hover:border-amber-300 transition-all">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
            <span className="font-medium text-[11px] text-slate-700">ใกล้เต็ม (80-99%)</span>
            <span className="bg-blue-50 text-blue-700 text-[10px] font-bold px-1.5 py-0.2 rounded border border-blue-200">
              เฝ้าระวัง
            </span>
          </div>
          <div className="text-2xl font-bold text-slate-900 tabular-nums">
            18 <span className="text-xs font-normal text-slate-500">แห่ง</span>
          </div>
          <p className="text-[11px] text-blue-600 font-medium mt-1">
            วิเคราะห์ Burn Rate
          </p>
        </div>

        {/* 6. TRANSACTION เดือนนี้ */}
        <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-2xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
            <span className="font-medium text-[11px]">TRANSACTION เดือนนี้</span>
            <Receipt className="w-3.5 h-3.5 text-slate-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 tabular-nums">14,280</div>
          <p className="text-[11px] text-teal-600 font-medium mt-1 flex items-center gap-0.5">
            <TrendingUp className="w-3 h-3" />
            +8.4% WoW
          </p>
        </div>

        {/* 7. กลุ่มเสี่ยงสูง */}
        <div className="bg-white p-3 rounded-lg border border-red-200/90 shadow-2xs hover:border-red-300 transition-all bg-gradient-to-br from-white to-red-50/30">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
            <span className="font-medium text-[11px] text-red-700">กลุ่มเสี่ยงสูง</span>
            <Flame className="w-3.5 h-3.5 text-red-500" />
          </div>
          <div className="text-2xl font-bold text-red-700 tabular-nums">
            7 <span className="text-xs font-normal text-slate-500">แห่ง</span>
          </div>
          <p className="text-[11px] text-red-700 font-medium mt-1">
            ส่งแจ้งเตือน AM ด่วน
          </p>
        </div>
      </div>

      {/* 4. Proactive Intelligent Alerts (การแจ้งเตือนปฏิบัติการเร่งด่วน) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
              <Bell className="w-3.5 h-3.5" />
            </div>
            <h2 className="text-sm font-bold text-slate-900">
              การแจ้งเตือนปฏิบัติการเร่งด่วน (Proactive Intelligent Alerts)
            </h2>
            <span className="text-xs font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
              3 คำสั่งต้องดำเนินการ
            </span>
          </div>
          <span className="text-xs text-slate-500 hidden sm:inline">
            AI Decision Support Engine • ตรวจสอบรอบ 15 นาที
          </span>
        </div>

        <div className="space-y-2.5">
          {/* Alert 1: โรงพยาบาลขลุง */}
          <div className="p-3.5 rounded-lg border border-rose-200 bg-rose-50/50 hover:bg-rose-50/80 transition-all flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center shrink-0 mt-0.5">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-slate-900 text-sm">
                    โรงพยาบาลขลุง (จ.จันทบุรี)
                  </span>
                  <span className="text-[10px] font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded uppercase">
                    CRITICAL EXPIRY &amp; BURN
                  </span>
                  <span className="text-xs font-mono text-slate-500">
                    CUS-10492 | CNT-2567-089
                  </span>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed">
                  <span className="font-semibold text-rose-700">สัญญาจะหมดอายุใน 25 วัน</span> | 
                  วงเงินคงเหลือเพียง <span className="font-semibold text-rose-700">8.2% (164,000 บาท)</span> | 
                  อัตราบริโภคกรรมชี้ว่าจะหมดเกลี้ยงภายใน <span className="font-semibold text-rose-700">18 วัน (ก่อนสิ้นสัญญา)</span>
                </p>
                <p className="text-xs text-slate-600 flex items-center gap-1.5 pt-0.5">
                  <span className="text-teal-700 font-bold">คำแนะนำระบบ:</span>
                  มอบหมาย AM กิตติศักดิ์ พ. เร่งจัดส่งบันทึกขออนุมัติขยายเพดานวงเงินและต่อสัญญาปี 2568 ล่วงหน้าทันที
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end md:self-center shrink-0">
              <button
                onClick={() => {
                  const target = hospitals.find((h) => h.cusCode === 'CUS-10492');
                  if (target) onSelectHospital(target);
                }}
                className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded hover:bg-slate-50 active:scale-95 transition-all"
              >
                ดูโปรไฟล์
              </button>
              <button
                onClick={() => {
                  const target = hospitals.find((h) => h.cusCode === 'CUS-10492');
                  if (target) onOpenDispatchAlert(target, 'CRITICAL EXPIRY & BURN');
                }}
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-white bg-rose-600 rounded hover:bg-rose-700 active:scale-95 transition-all shadow-2xs"
              >
                <Send className="w-3 h-3" />
                <span>ส่งแจ้งเตือน AM ด่วน</span>
              </button>
            </div>
          </div>

          {/* Alert 2: โรงพยาบาลน้ำยืน */}
          <div className="p-3.5 rounded-lg border border-sky-200 bg-sky-50/50 hover:bg-sky-50/80 transition-all flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-sky-100 text-sky-600 flex items-center justify-center shrink-0 mt-0.5">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-slate-900 text-sm">
                    โรงพยาบาลน้ำยืน (อุบลราชธานี)
                  </span>
                  <span className="text-[10px] font-bold text-sky-800 bg-sky-100 px-2 py-0.5 rounded">
                    Quota Warning
                  </span>
                  <span className="text-xs font-mono text-slate-500">
                    CUS-20184
                  </span>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed">
                  ใช้วงเงินไปแล้ว <span className="font-semibold text-sky-800">92.4% (คงเหลือ 76,000 บาท)</span> คำนวณตาม Velocity ปัจจุบันจะเต็มวงเงินก่อนสิ้นรอบบิลประจำเดือน 11 วัน
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end md:self-center shrink-0">
              <button
                onClick={() => {
                  const target = hospitals.find((h) => h.cusCode === 'CUS-20184');
                  if (target) onSelectHospital(target);
                }}
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-white bg-blue-700 rounded hover:bg-blue-800 active:scale-95 transition-all shadow-2xs"
              >
                <span>ตรวจสอบ Transaction</span>
              </button>
            </div>
          </div>

          {/* Alert 3: รพ. ชลบุรี */}
          <div className="p-3.5 rounded-lg border border-slate-300 bg-slate-50/80 hover:bg-slate-100 transition-all flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-slate-200 text-slate-700 flex items-center justify-center shrink-0 mt-0.5">
                <FileText className="w-4 h-4" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-slate-900 text-sm">
                    รพ. ชลบุรี (จ.ชลบุรี)
                  </span>
                  <span className="text-[10px] font-bold text-slate-700 bg-slate-200 px-2 py-0.5 rounded">
                    Legal Bottleneck
                  </span>
                  <span className="text-xs font-mono text-slate-500">
                    CUS-00812 | ตีตราสารอากรแสตมป์
                  </span>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed">
                  มีเอกสารแนบท้ายสัญญาและตีตราสารค้างดำเนินการเกิน <span className="font-semibold text-slate-900">7 วันทำการ ณ ฝ่ายนิติการ (Legal Dept)</span> ส่งผลให้เบิกจ่ายงวด 3 ล่าช้า
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end md:self-center shrink-0">
              <button
                onClick={() => onNavigateToView('legal')}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded hover:bg-slate-50 active:scale-95 transition-all"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>เร่งรัดงาน Legal</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 5. Mid Section: Regional Matrix (Left) & Burn-Rate Forecast (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column (7 cols): Regional Saturation & Risk Matrix */}
        <div className="lg:col-span-7 bg-white p-4 rounded-lg border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">
                  สถานะวงเงิน &amp; ความเสี่ยงรายภูมิภาค
                </h3>
                <p className="text-[11px] text-slate-500">
                  Regional Budget Saturation &amp; Expiry Vulnerability Matrix
                </p>
              </div>
              <span className="text-xs text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 font-medium">
                5 เขตสุขภาพ
              </span>
            </div>

            {/* Overall Distribution Bar (185 hospitals) */}
            <div className="space-y-1.5 mb-4 p-3 bg-slate-50 rounded-lg border border-slate-200/80">
              <div className="flex items-center justify-between text-xs text-slate-600">
                <span className="font-semibold text-slate-800">
                  ภาพรวมการกระจายวงเงิน รพ. 185 แห่ง
                </span>
                <span className="text-[11px] text-slate-500">
                  100% ครบทุกสัญญา
                </span>
              </div>

              {/* Progress bar stack */}
              <div className="h-2.5 w-full bg-slate-200 rounded-full overflow-hidden flex">
                <div style={{ width: '74.6%' }} className="bg-emerald-500" title="ปกติ <75% (138 รพ.)" />
                <div style={{ width: '9.7%' }} className="bg-cyan-500" title="ใกล้เต็ม 75-99% (18 รพ.)" />
                <div style={{ width: '1.6%' }} className="bg-rose-500" title="เกินวงเงิน (3 รพ.)" />
                <div style={{ width: '11.9%' }} className="bg-sky-500" title="รายเดือน (22 รพ.)" />
                <div style={{ width: '2.2%' }} className="bg-slate-400" title="รอเปิดสัญญา (4 รพ.)" />
              </div>

              {/* Legend */}
              <div className="flex items-center flex-wrap gap-x-3 gap-y-1 text-[11px] text-slate-600 pt-1">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  ปกติ &lt;75% (138)
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-cyan-500"></span>
                  ใกล้เต็ม 75-99% (18)
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                  เกินวงเงิน (3)
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-sky-500"></span>
                  รายเดือน (22)
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-slate-400"></span>
                  รอเปิดสัญญา (4)
                </span>
              </div>
            </div>

            {/* Regional Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="text-[11px] text-slate-500 uppercase border-b border-slate-200">
                  <tr>
                    <th className="py-2 font-semibold">ภูมิภาค</th>
                    <th className="py-2 text-center font-semibold">รพ.</th>
                    <th className="py-2 text-center font-semibold">สัญญา</th>
                    <th className="py-2 font-semibold pl-2">อัตราการใช้วงเงิน</th>
                    <th className="py-2 text-center font-semibold">เกินวงเงิน</th>
                    <th className="py-2 text-center font-semibold">ใกล้หมดอายุ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {REGIONS_DATA.map((reg) => (
                    <tr 
                      key={reg.region} 
                      onClick={() => setSelectedRegion(reg.region)}
                      className="hover:bg-slate-50 cursor-pointer transition-colors"
                    >
                      <td className="py-2.5 font-medium text-slate-800 flex items-center gap-1.5">
                        <span className={`w-2 h-2 rounded-full ${reg.isHighest ? 'bg-rose-500' : 'bg-teal-600'}`}></span>
                        <span>{reg.region}</span>
                      </td>
                      <td className="py-2.5 text-center text-slate-600 tabular-nums">
                        {reg.hospitalsCount}
                      </td>
                      <td className="py-2.5 text-center text-slate-600 tabular-nums">
                        {reg.contractsCount}
                      </td>
                      <td className="py-2.5 pl-2">
                        <div className="flex items-center gap-2">
                          <div className="w-28 bg-slate-100 rounded-full h-2 overflow-hidden">
                            <div 
                              className={`h-full rounded-full ${
                                reg.utilizationRate >= 90 
                                  ? 'bg-rose-500' 
                                  : reg.utilizationRate >= 80 
                                  ? 'bg-blue-600' 
                                  : 'bg-teal-500'
                              }`} 
                              style={{ width: `${reg.utilizationRate}%` }}
                            />
                          </div>
                          <span className={`font-semibold tabular-nums ${reg.isHighest ? 'text-rose-600' : 'text-slate-700'}`}>
                            {reg.utilizationRate}% {reg.isHighest && <span className="text-[10px] text-rose-600 font-bold">(สูงสุด)</span>}
                          </span>
                        </div>
                      </td>
                      <td className="py-2.5 text-center">
                        <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold ${
                          reg.overBudgetCount > 0 ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {reg.overBudgetCount}
                        </span>
                      </td>
                      <td className="py-2.5 text-center">
                        <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold ${
                          reg.expiringCount > 0 ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {reg.expiringCount}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span className="flex items-center gap-1 text-[11px]">
              <Info className="w-3.5 h-3.5 text-slate-400" />
              เกณฑ์การประเมิน: สีแดงเฉลี่ยเกิน 90% ต้องจัดสรรงบกลางสำรองทันที
            </span>
            <button 
              onClick={onOpenExportModal}
              className="text-teal-700 hover:text-teal-800 font-semibold underline text-xs"
            >
              ดาวน์โหลด Data Sheet
            </button>
          </div>
        </div>

        {/* Right Column (5 cols): AI Burn-Rate & Run-rate Forecasting */}
        <div className="lg:col-span-5 bg-white p-4 rounded-lg border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">
                  พยากรณ์การใช้วงเงิน
                </h3>
                <p className="text-[11px] text-slate-500">
                  Burn-Rate &amp; Run-rate Forecasting (AI Engine)
                </p>
              </div>
              <span className="text-teal-600">
                <TrendingUp className="w-4 h-4" />
              </span>
            </div>

            {/* 4 Forecast Cards */}
            <div className="space-y-3">
              {/* 1. รพ. ขลุง */}
              <div 
                onClick={() => {
                  const target = hospitals.find((h) => h.cusCode === 'CUS-10492');
                  if (target) onSelectHospital(target);
                }}
                className="p-2.5 rounded-lg border border-rose-200/80 bg-rose-50/30 hover:bg-rose-50/60 cursor-pointer transition-colors"
              >
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-rose-600 text-white flex items-center justify-center text-[10px] font-bold">
                      1
                    </span>
                    <span className="font-bold text-slate-900">
                      รพ. ขลุง (จันทบุรี)
                    </span>
                  </div>
                  <span className="text-[11px] font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded">
                    หมดใน 18 วัน
                  </span>
                </div>
                <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500">
                  <span>อัตราใช้: ~9,100 บาท/วัน</span>
                  <span className="font-medium text-slate-700">AM: กิตติศักดิ์ พ.</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-1.5 mt-1.5 overflow-hidden">
                  <div className="bg-rose-600 h-full rounded-full" style={{ width: '91.8%' }}></div>
                </div>
              </div>

              {/* 2. รพ. น้ำยืน */}
              <div 
                onClick={() => {
                  const target = hospitals.find((h) => h.cusCode === 'CUS-20184');
                  if (target) onSelectHospital(target);
                }}
                className="p-2.5 rounded-lg border border-sky-200/80 bg-sky-50/30 hover:bg-sky-50/60 cursor-pointer transition-colors"
              >
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-bold">
                      2
                    </span>
                    <span className="font-bold text-slate-900">
                      รพ. น้ำยืน (อุบลฯ)
                    </span>
                  </div>
                  <span className="text-[11px] font-bold text-sky-800 bg-sky-100 px-2 py-0.5 rounded">
                    หมดใน 22 วัน
                  </span>
                </div>
                <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500">
                  <span>อัตราใช้: ~3,450 บาท/วัน</span>
                  <span className="font-medium text-slate-700">AM: ปวีณา ส.</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-1.5 mt-1.5 overflow-hidden">
                  <div className="bg-sky-600 h-full rounded-full" style={{ width: '92.4%' }}></div>
                </div>
              </div>

              {/* 3. รพ. สมเด็จพระยุพราชเด่นชัย */}
              <div 
                onClick={() => {
                  const target = hospitals.find((h) => h.cusCode === 'CUS-05118');
                  if (target) onSelectHospital(target);
                }}
                className="p-2.5 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer transition-colors"
              >
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-slate-700 text-white flex items-center justify-center text-[10px] font-bold">
                      3
                    </span>
                    <span className="font-bold text-slate-900">
                      รพ. สมเด็จพระยุพราชเด่นชัย
                    </span>
                  </div>
                  <span className="text-[11px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                    หมดใน 29 วัน
                  </span>
                </div>
                <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500">
                  <span>อัตราใช้: ~1,650 บาท/วัน</span>
                  <span className="font-medium text-slate-700">AM: ชนาภร ว.</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-1.5 mt-1.5 overflow-hidden">
                  <div className="bg-blue-600 h-full rounded-full" style={{ width: '84.2%' }}></div>
                </div>
              </div>

              {/* 4. รพ. ปากช่องนานา */}
              <div 
                onClick={() => {
                  const target = hospitals.find((h) => h.cusCode === 'CUS-03229');
                  if (target) onSelectHospital(target);
                }}
                className="p-2.5 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer transition-colors"
              >
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-slate-700 text-white flex items-center justify-center text-[10px] font-bold">
                      4
                    </span>
                    <span className="font-bold text-slate-900">
                      รพ. ปากช่องนานา (โคราช)
                    </span>
                  </div>
                  <span className="text-[11px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                    หมดใน 34 วัน
                  </span>
                </div>
                <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500">
                  <span>อัตราใช้: ~4,800 บาท/วัน</span>
                  <span className="font-medium text-slate-700">AM: ศศิธร ม.</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-1.5 mt-1.5 overflow-hidden">
                  <div className="bg-blue-600 h-full rounded-full" style={{ width: '81.5%' }}></div>
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={() => onNavigateToView('forecast')}
            className="w-full mt-4 py-2 px-3 text-xs font-semibold text-teal-800 bg-teal-50 hover:bg-teal-100 rounded-md border border-teal-200 flex items-center justify-center gap-1.5 transition-colors"
          >
            <span>เปิดดูการคาดการณ์ทั้งหมด (AI Forecasting Engine)</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 6. Bottom Section: High-Priority Hospital Watchlist Matrix */}
      <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-slate-900 text-sm">
              รายการโรงพยาบาลและสัญญากลุ่มเฝ้าระวังสูงสุด
            </h3>
            <p className="text-[11px] text-slate-500">
              High-Priority Hospital Watchlist Matrix • รายการสัญญาที่ต้องดำเนินการทันที
            </p>
          </div>

          {/* Search Box & Segmented Filter Tabs */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="ค้นหา รพ., เลขสัญญา หรือ CUS..."
                className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-md w-56 focus:outline-teal-600 focus:bg-white transition-all"
              />
            </div>

            <div className="flex items-center p-0.5 bg-slate-100 rounded-md border border-slate-200 text-xs">
              <button
                onClick={() => {
                  setWatchlistFilter('all');
                  setCurrentPage(1);
                }}
                className={`px-2.5 py-1 rounded text-[11px] font-medium transition-all ${
                  watchlistFilter === 'all'
                    ? 'bg-white text-slate-900 font-bold shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                ทั้งหมด
              </button>
              <button
                onClick={() => {
                  setWatchlistFilter('over');
                  setCurrentPage(1);
                }}
                className={`px-2.5 py-1 rounded text-[11px] font-medium transition-all ${
                  watchlistFilter === 'over'
                    ? 'bg-white text-slate-900 font-bold shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                เกินวงเงิน
              </button>
              <button
                onClick={() => {
                  setWatchlistFilter('expiring');
                  setCurrentPage(1);
                }}
                className={`px-2.5 py-1 rounded text-[11px] font-medium transition-all ${
                  watchlistFilter === 'expiring'
                    ? 'bg-white text-slate-900 font-bold shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                &lt;30 วัน
              </button>
              <button
                onClick={() => {
                  setWatchlistFilter('pending_doc');
                  setCurrentPage(1);
                }}
                className={`px-2.5 py-1 rounded text-[11px] font-medium transition-all ${
                  watchlistFilter === 'pending_doc'
                    ? 'bg-white text-slate-900 font-bold shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                ค้างเอกสาร
              </button>
            </div>
          </div>
        </div>

        {/* Watchlist Table */}
        <div className="overflow-x-auto border border-slate-200 rounded-lg">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-[11px] text-slate-500 uppercase border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3 font-semibold">รพ. / เลขสัญญา</th>
                <th className="py-2.5 px-3 font-semibold">ภูมิภาค &amp; ประเภท</th>
                <th className="py-2.5 px-3 font-semibold">วงเงิน &amp; อัตราการใช้</th>
                <th className="py-2.5 px-3 font-semibold">วงเงินคงเหลือ</th>
                <th className="py-2.5 px-3 font-semibold">วันสิ้นสุดสัญญา</th>
                <th className="py-2.5 px-3 font-semibold">สถานะนิติกรรม / อากร</th>
                <th className="py-2.5 px-3 font-semibold">AM ผู้ดูแล</th>
                <th className="py-2.5 px-3 text-right font-semibold">การจัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedWatchlist.length > 0 ? (
                paginatedWatchlist.map((hosp) => (
                  <tr 
                    key={hosp.id}
                    className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                    onClick={() => onSelectHospital(hosp)}
                  >
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-semibold text-slate-900 group-hover:text-teal-700 transition-colors">
                          {hosp.name}
                        </span>
                        <span className="text-[10px] font-mono font-bold bg-slate-900 text-white px-1.5 py-0.2 rounded">
                          H:{hosp.hcode}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                        {hosp.cusCode} • {hosp.contractNumber}
                      </div>
                    </td>

                    <td className="py-3 px-3">
                      <div className="text-slate-800 font-medium">
                        {hosp.province} ({hosp.address.postalCode})
                      </div>
                      <div className="text-[11px] text-slate-500 truncate max-w-[170px]" title={hosp.contractCategory}>
                        {hosp.contractCategory}
                      </div>
                    </td>

                    <td className="py-3 px-3 min-w-[150px]">
                      {hosp.contractBillingType === 'monthly_billing' ? (
                        <div>
                          <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-100 text-indigo-800 border border-indigo-200">
                            สัญญารายเดือน
                          </span>
                          <div className="text-[10px] text-slate-500 mt-1">
                            เก็บตาม Invoice รายเดือน
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-center justify-between text-[11px] mb-1">
                            <span className="font-mono text-slate-700">
                              {hosp.spentBudget.toLocaleString()} / {hosp.totalBudget.toLocaleString()}
                            </span>
                            <span className={`font-bold ${
                              hosp.spentPercent >= 100 ? 'text-red-600' : hosp.spentPercent >= 80 ? 'text-amber-600' : 'text-emerald-600'
                            }`}>
                              {hosp.spentPercent}%
                            </span>
                          </div>
                          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                            <div 
                              className={`h-full rounded-full ${
                                hosp.spentPercent >= 100 ? 'bg-red-500' : hosp.spentPercent >= 80 ? 'bg-amber-500' : 'bg-emerald-500'
                              }`}
                              style={{ width: `${Math.min(100, hosp.spentPercent)}%` }}
                            />
                          </div>
                        </>
                      )}
                    </td>

                    <td className="py-3 px-3 font-mono font-medium">
                      {hosp.contractBillingType === 'monthly_billing' ? (
                        <span className="text-slate-500 text-xs font-sans">
                          รายเดือน (ไม่คำนวณวงเงิน)
                        </span>
                      ) : (
                        <>
                          <span className={hosp.remainingBudget < 0 ? 'text-red-600 font-bold' : 'text-slate-800'}>
                            {hosp.remainingBudget.toLocaleString()} บาท
                          </span>
                          {hosp.estimatedRunoutDays > 0 && hosp.estimatedRunoutDays < 30 && (
                            <div className="text-[10px] text-rose-600 font-sans font-bold">
                              เบิร์นหมดใน ~{hosp.estimatedRunoutDays} วัน
                            </div>
                          )}
                        </>
                      )}
                    </td>

                    <td className="py-3 px-3">
                      <div className="text-slate-800 font-medium">
                        {hosp.contractExpiryDate}
                      </div>
                      <div className={`text-[11px] font-semibold ${
                        hosp.daysUntilExpiry <= 30 ? 'text-rose-600' : 'text-slate-500'
                      }`}>
                        เหลือ {hosp.daysUntilExpiry} วัน
                      </div>
                    </td>

                    <td className="py-3 px-3">
                      <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-medium ${
                        hosp.legalStatus.includes('ค้าง') 
                          ? 'bg-rose-100 text-rose-800 font-bold' 
                          : hosp.legalStatus.includes('ปกติ') 
                          ? 'bg-emerald-100 text-emerald-800' 
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {hosp.legalStatus}
                      </span>
                      <div className="text-[10px] text-slate-500 mt-0.5">
                        {hosp.stampDutyStatus}
                      </div>
                    </td>

                    <td className="py-3 px-3">
                      <div className="font-medium text-slate-800">{hosp.amName}</div>
                      <div className="text-[10px] text-slate-500">{hosp.amPhone}</div>
                    </td>

                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {onEditHospital && (currentRole.isCentralAdmin || currentRole.allowedRegions.includes(hosp.region)) && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onEditHospital(hosp);
                            }}
                            className="px-2 py-1 text-xs font-semibold text-teal-700 bg-teal-50 border border-teal-200 rounded hover:bg-teal-100 transition-colors shadow-2xs"
                            title="แก้ไขข้อมูล รพ."
                          >
                            แก้ไข
                          </button>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectHospital(hosp);
                          }}
                          className="px-2.5 py-1 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded hover:bg-slate-100 transition-colors shadow-2xs"
                        >
                          ดูข้อมูล
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-500 text-xs">
                    ไม่พบข้อมูลโรงพยาบาลตามเงื่อนไขการค้นหา
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-500 pt-2">
          <span>
            แสดง {watchlistItems.length === 0 ? 0 : (currentPage - 1) * pageSize + 1} -{' '}
            {Math.min(currentPage * pageSize, watchlistItems.length)} จากทั้งหมด 48 รายการเฝ้าระวังพิเศษ
          </span>

          <div className="flex items-center gap-1 self-end sm:self-center">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-2.5 py-1 text-xs rounded border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              ก่อนหน้า
            </button>
            {Array.from({ length: totalPages }).map((_, idx) => (
              <button
                key={idx + 1}
                onClick={() => setCurrentPage(idx + 1)}
                className={`w-7 h-7 text-xs rounded border transition-colors ${
                  currentPage === idx + 1
                    ? 'bg-slate-900 text-white font-bold border-slate-900'
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                }`}
              >
                {idx + 1}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-2.5 py-1 text-xs rounded border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              ถัดไป
            </button>
          </div>
        </div>
      </div>

      {/* 7. Bottom Sticky Banner: AM Operations & Task Pipeline */}
      <div className="bg-white p-4 rounded-xl border border-blue-200/80 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-blue-50/40 via-white to-sky-50/30">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
            <FileSpreadsheet className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-bold text-slate-900 text-sm">
                AM Operations &amp; Task Pipeline
              </h4>
              <span className="text-[10px] font-bold text-blue-700 bg-blue-100 px-2 py-0.2 rounded">
                ทีมบริหารลูกค้า
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-0.5">
              สรุปสถานะการรายงานฝ่ายบริหารลูกค้าสัมพันธ์และงานนิติกรรมสัญญาโรงพยาบาล
            </p>
          </div>
        </div>

        {/* 4 Pipeline Stat Boxes */}
        <div className="flex items-center gap-2 sm:gap-4 flex-wrap">
          <div className="bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-2xs text-center min-w-[70px]">
            <p className="text-[10px] text-slate-500 font-medium">งานต่อสัญญา</p>
            <p className="text-base font-bold text-slate-900 tabular-nums">12</p>
          </div>

          <div className="bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-2xs text-center min-w-[70px]">
            <p className="text-[10px] text-slate-500 font-medium">ตีตราสารค้าง</p>
            <p className="text-base font-bold text-amber-600 tabular-nums">5</p>
          </div>

          <div className="bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-2xs text-center min-w-[70px]">
            <p className="text-[10px] text-slate-500 font-medium">รอรับใบ PO</p>
            <p className="text-base font-bold text-slate-900 tabular-nums">8</p>
          </div>

          <div className="bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-2xs text-center min-w-[70px]">
            <p className="text-[10px] text-slate-500 font-medium">สัญญาเสร็จสิ้น</p>
            <p className="text-base font-bold text-emerald-600 tabular-nums">42</p>
          </div>

          <button
            onClick={() => onNavigateToView('tasks')}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-sm transition-all active:scale-95 whitespace-nowrap"
          >
            <span>ไปที่ AM Task Flow</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
