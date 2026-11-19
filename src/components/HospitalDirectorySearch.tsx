import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Building2, 
  MapPin, 
  FileText, 
  User, 
  Phone, 
  ChevronRight, 
  ChevronLeft,
  ChevronsLeft,
  ChevronsRight,
  Filter, 
  Hospital, 
  Plus, 
  Edit3,
  Calendar,
  DollarSign,
  Download,
  Eye,
  CheckCircle2,
  Clock,
  AlertTriangle,
  RotateCcw,
  SlidersHorizontal,
  Table as TableIcon,
  LayoutGrid,
  FileSpreadsheet,
  Landmark,
  ShieldCheck as ShieldIcon,
  Tag
} from 'lucide-react';
import { HospitalContract, RoleConfig } from '../data/contractsData';

export type QuickContractFilter = 'all' | 'has_po' | 'has_mou' | 'annual' | 'monthly' | 'has_bg';

interface HospitalDirectorySearchProps {
  hospitals: HospitalContract[];
  currentRole: RoleConfig;
  onSelectHospital: (hospital: HospitalContract) => void;
  onAddNewHospital: () => void;
  onEditHospital: (hospital: HospitalContract) => void;
  onOpenGoogleSheetsSync?: () => void;
}

export const HospitalDirectorySearch: React.FC<HospitalDirectorySearchProps> = ({
  hospitals,
  currentRole,
  onSelectHospital,
  onAddNewHospital,
  onEditHospital,
  onOpenGoogleSheetsSync,
}) => {
  // Search and Filter states
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedRegion, setSelectedRegion] = useState<string>('all');
  const [selectedHospitalType, setSelectedHospitalType] = useState<string>('all');
  const [selectedContractType, setSelectedContractType] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedProvince, setSelectedProvince] = useState<string>('all');
  const [quickFilter, setQuickFilter] = useState<QuickContractFilter>('all');

  // Pagination states (25 / 50 / 100 as requested)
  const [pageSize, setPageSize] = useState<number>(25);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');

  // Unique lists for dropdowns
  const provinces = useMemo(() => {
    const set = new Set<string>();
    hospitals.forEach((h) => {
      if (h.province) set.add(h.province);
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b, 'th'));
  }, [hospitals]);

  // Quick filter counts based on scoped hospitals
  const scopedHospitals = useMemo(() => {
    return hospitals.filter((h) => currentRole.isCentralAdmin || currentRole.allowedRegions.includes(h.region));
  }, [hospitals, currentRole]);

  const quickFilterCounts = useMemo(() => {
    return {
      all: scopedHospitals.length,
      has_po: scopedHospitals.filter(h => h.documents.po.docNumber && h.documents.po.docNumber !== '-' && h.documents.po.docNumber !== 'ไม่มี PO').length,
      has_mou: scopedHospitals.filter(h => (h.documents.contractAgreement?.contractNumber && h.documents.contractAgreement.contractNumber !== '-') || h.contractCategory.includes('ข้อตกลง') || h.contractCategory.includes('สัญญา')).length,
      annual: scopedHospitals.filter(h => h.contractBillingType !== 'monthly_billing').length,
      monthly: scopedHospitals.filter(h => h.contractBillingType === 'monthly_billing').length,
      has_bg: scopedHospitals.filter(h => !!h.hasBankGuarantee).length,
    };
  }, [scopedHospitals]);

  // Main Filter Logic supporting:
  // - Partial string search across Hospital Name, Contract No, PO No, Province, Region, Hospital Type, Contract Category, AM Name
  // - Region filter (เหนือ, กลาง, ตะวันออก, ตะวันตก, อีสาน, ใต้)
  // - Hospital Type filter (ศูนย์, ทั่วไป, ชุมชน, อื่นๆ)
  // - Contract Type filter (รายปี, รายเดือน, อื่น ๆ)
  // - Contract Status filter (ปกติ, ใกล้หมดอายุ, หมดอายุ, รายเดือน, รอตรวจสอบ)
  // - Quick filter: มีใบสั่งจ้าง (PO), มีบันทึกข้อตกลง, สัญญารายปี, สัญญารายเดือน, มีหนังสือค้ำประกัน (BG)
  // - Role-based scoping for AM
  const filteredHospitals = useMemo(() => {
    return hospitals.filter((h) => {
      // Role scope restriction for regional AMs
      if (!currentRole.isCentralAdmin && !currentRole.allowedRegions.includes(h.region)) {
        return false;
      }

      // Quick filter criteria (PO, MOU/Agreement, Annual, Monthly, Bank Guarantee BG)
      if (quickFilter !== 'all') {
        if (quickFilter === 'has_po') {
          if (!h.documents.po.docNumber || h.documents.po.docNumber === '-' || h.documents.po.docNumber === 'ไม่มี PO') return false;
        } else if (quickFilter === 'has_mou') {
          if (!h.documents.contractAgreement?.contractNumber && !h.contractCategory.includes('ข้อตกลง') && !h.contractCategory.includes('สัญญา')) return false;
        } else if (quickFilter === 'annual') {
          if (h.contractBillingType === 'monthly_billing') return false;
        } else if (quickFilter === 'monthly') {
          if (h.contractBillingType !== 'monthly_billing') return false;
        } else if (quickFilter === 'has_bg') {
          if (!h.hasBankGuarantee) return false;
        }
      }

      // Region filter
      if (selectedRegion !== 'all') {
        if (selectedRegion === 'อีสาน' && h.region !== 'ภาคตะวันออกเฉียงเหนือ') return false;
        if (selectedRegion === 'เหนือ' && h.region !== 'ภาคเหนือ') return false;
        if (selectedRegion === 'กลาง' && h.region !== 'ภาคกลาง') return false;
        if (selectedRegion === 'ตะวันออก' && h.region !== 'ภาคตะวันออก') return false;
        if (selectedRegion === 'ตะวันตก' && h.region !== 'ภาคตะวันตก') return false;
        if (selectedRegion === 'ใต้' && h.region !== 'ภาคใต้') return false;
      }

      // Hospital Type filter
      if (selectedHospitalType !== 'all') {
        if (selectedHospitalType === 'center' && !h.hospitalType.includes('ศูนย์')) return false;
        if (selectedHospitalType === 'general' && !h.hospitalType.includes('ทั่วไป')) return false;
        if (selectedHospitalType === 'community' && !h.hospitalType.includes('ชุมชน')) return false;
      }

      // Contract Type filter (รายปี vs รายเดือน vs อื่นๆ)
      if (selectedContractType !== 'all') {
        if (selectedContractType === 'annual' && h.contractBillingType === 'monthly_billing') return false;
        if (selectedContractType === 'monthly' && h.contractBillingType !== 'monthly_billing') return false;
        if (selectedContractType === 'other' && (h.contractBillingType === 'monthly_billing' || h.contractBillingType === 'annual_budget')) {
          if (!h.contractCategory.includes('อื่น') && !h.contractCategory.includes('MOU')) return false;
        }
      }

      // Contract Status filter (ปกติ, ใกล้หมดอายุ, หมดอายุ, รายเดือน, รอตรวจสอบ)
      if (selectedStatus !== 'all') {
        if (selectedStatus === 'normal' && (h.contractStatus !== 'มีผลบังคับใช้ (Active)' || h.contractBillingType === 'monthly_billing')) return false;
        if (selectedStatus === 'expiring' && h.contractStatus !== 'ใกล้หมดอายุ') return false;
        if (selectedStatus === 'expired' && h.contractStatus !== 'สิ้นสุดสัญญา') return false;
        if (selectedStatus === 'monthly' && h.contractBillingType !== 'monthly_billing') return false;
        if (selectedStatus === 'pending' && h.contractStatus !== 'รอตรวจสอบ') return false;
      }

      // Province filter
      if (selectedProvince !== 'all' && h.province !== selectedProvince) {
        return false;
      }

      // Partial substring search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchName = h.name.toLowerCase().includes(q);
        const matchHcode = h.hcode.toLowerCase().includes(q);
        const matchContract = h.contractNumber.toLowerCase().includes(q);
        const matchPo = h.documents.po.docNumber.toLowerCase().includes(q);
        const matchProvince = h.province.toLowerCase().includes(q);
        const matchRegion = h.region.toLowerCase().includes(q);
        const matchType = h.hospitalType.toLowerCase().includes(q);
        const matchCategory = h.contractCategory.toLowerCase().includes(q);
        const matchAm = h.amName.toLowerCase().includes(q);
        const matchAddress = h.address.fullAddress.toLowerCase().includes(q);
        const matchPostal = h.address.postalCode.includes(q);
        const matchBg = h.bankGuarantee?.bgNumber?.toLowerCase().includes(q) || h.bankGuarantee?.bankName?.toLowerCase().includes(q);

        if (
          !matchName &&
          !matchHcode &&
          !matchContract &&
          !matchPo &&
          !matchProvince &&
          !matchRegion &&
          !matchType &&
          !matchCategory &&
          !matchAm &&
          !matchAddress &&
          !matchPostal &&
          !matchBg
        ) {
          return false;
        }
      }

      return true;
    });
  }, [
    hospitals,
    searchQuery,
    quickFilter,
    selectedRegion,
    selectedHospitalType,
    selectedContractType,
    selectedStatus,
    selectedProvince,
    currentRole,
  ]);

  // Reset to page 1 whenever filters change
  const handleFilterChange = (setter: (val: any) => void, val: any) => {
    setter(val);
    setCurrentPage(1);
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedRegion('all');
    setSelectedHospitalType('all');
    setSelectedContractType('all');
    setSelectedStatus('all');
    setSelectedProvince('all');
    setQuickFilter('all');
    setCurrentPage(1);
  };

  // Pagination calculations
  const totalItems = filteredHospitals.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (safeCurrentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);
  const paginatedHospitals = filteredHospitals.slice(startIndex, endIndex);

  // Status Badge Helper:
  // ปกติ | ใกล้หมดอายุ | หมดอายุ | รายเดือน | รอตรวจสอบ
  const renderStatusBadge = (hosp: HospitalContract) => {
    if (hosp.contractStatus === 'รอตรวจสอบ') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-900 border border-amber-300">
          <span className="w-2 h-2 rounded-full bg-amber-500" />
          <span>รอตรวจสอบ</span>
        </span>
      );
    }

    if (hosp.contractBillingType === 'monthly_billing') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-900 border border-blue-300">
          <span className="w-2 h-2 rounded-full bg-blue-600" />
          <span>รายเดือน</span>
        </span>
      );
    }

    if (hosp.contractStatus === 'สิ้นสุดสัญญา' || hosp.daysUntilExpiry <= 0) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-900 border border-red-300">
          <span className="w-2 h-2 rounded-full bg-red-600" />
          <span>หมดอายุ</span>
        </span>
      );
    }

    if (hosp.contractStatus === 'ใกล้หมดอายุ' || hosp.daysUntilExpiry <= 60) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-900 border border-yellow-300">
          <span className="w-2 h-2 rounded-full bg-yellow-500" />
          <span>ใกล้หมดอายุ ({hosp.daysUntilExpiry} วัน)</span>
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-900 border border-emerald-300">
        <span className="w-2 h-2 rounded-full bg-emerald-600" />
        <span>ปกติ</span>
      </span>
    );
  };

  // Region Badge helper
  const getRegionShort = (reg: string) => {
    if (reg.includes('ตะวันออกเฉียงเหนือ')) return 'อีสาน';
    if (reg.includes('เหนือ')) return 'เหนือ';
    if (reg.includes('กลาง')) return 'กลาง';
    if (reg.includes('ตะวันออก')) return 'ตะวันออก';
    if (reg.includes('ตะวันตก')) return 'ตะวันตก';
    if (reg.includes('ใต้')) return 'ใต้';
    return reg;
  };

  return (
    <div className="w-full max-w-full min-w-0 space-y-4 pb-10">
      {/* 1. Header Bar: Title, Summary, Add Hospital Action */}
      <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200/80 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <div className="w-8 h-8 rounded-lg bg-teal-800 text-white flex items-center justify-center font-bold">
              <Building2 className="w-4 h-4" />
            </div>
            <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
              ศูนย์ค้นหาโรงพยาบาลและเอกสารสัญญา
            </h1>
            <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-slate-900 text-white font-mono shadow-2xs">
              Single Source of Truth
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-semibold rounded-full bg-teal-50 text-teal-800 border border-teal-200">
              {currentRole.isCentralAdmin && <ShieldIcon className="w-3 h-3" />}
              <span>{currentRole.isCentralAdmin ? 'ส่วนกลาง (ทุกภูมิภาค)' : currentRole.name}</span>
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            หน้าหลักสำหรับค้นหา ตรวจสอบ และเข้าถึงข้อมูลโรงพยาบาลและเอกสารสัญญาทั้งหมดของบริษัท (รองรับข้อมูลมากกว่า 900 แห่ง)
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start md:self-auto">
          {/* View mode toggle */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs">
            <button
              onClick={() => setViewMode('table')}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-md font-medium transition-all ${
                viewMode === 'table' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
              title="มุมมองตาราง (Table View)"
            >
              <TableIcon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">ตาราง (Table)</span>
            </button>
            <button
              onClick={() => setViewMode('cards')}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-md font-medium transition-all ${
                viewMode === 'cards' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
              title="มุมมองการ์ด (Card View)"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">การ์ด (Cards)</span>
            </button>
          </div>

          {onOpenGoogleSheetsSync && (
            <button
              onClick={onOpenGoogleSheetsSync}
              className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-all active:scale-95 shrink-0"
              title="ซิงค์ข้อมูลวางบิลจาก Google Sheet เพื่อตัดยอดวงเงินสัญญา"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>ซิงค์ Google Sheet วางบิล</span>
            </button>
          )}

          <button
            onClick={onAddNewHospital}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-teal-700 hover:bg-teal-800 text-white rounded-lg text-xs font-semibold shadow-xs transition-all active:scale-95 shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>+ เพิ่มโรงพยาบาลใหม่</span>
          </button>
        </div>
      </div>

      {/* 2. Search & Filter Panel (Clean Back Office Style) */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs space-y-3.5">
        {/* Search Input Bar */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => handleFilterChange(setSearchQuery, e.target.value)}
            placeholder="ค้นหาโรงพยาบาล / เลขที่สัญญา / PO / จังหวัด / ภูมิภาค / ประเภท รพ. / AM ผู้รับผิดชอบ (พิมพ์บางส่วนได้ เช่น 'ขลุง')..."
            className="w-full pl-10 pr-24 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-teal-600 focus:bg-white transition-all shadow-inner"
          />
          {searchQuery && (
            <button
              onClick={() => handleFilterChange(setSearchQuery, '')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-700 font-bold px-2 py-1 bg-slate-200 hover:bg-slate-300 rounded"
            >
              ล้างคำค้น
            </button>
          )}
        </div>

        {/* Quick Filters Row (User request: มีใบสั่งจ้าง, มีบันทึกข้อตกลง, สัญญารายปี, สัญญารายเดือน, มีหนังสือค้ำประกัน) */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-0.5 text-xs">
          <span className="text-[11px] font-bold text-slate-500 whitespace-nowrap flex items-center gap-1 shrink-0">
            <Filter className="w-3.5 h-3.5 text-teal-700" />
            <span>ตัวกรองสัญญา:</span>
          </span>

          <button
            onClick={() => handleFilterChange(setQuickFilter, 'all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 shrink-0 ${
              quickFilter === 'all'
                ? 'bg-slate-900 text-white shadow-2xs'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
            }`}
          >
            <span>ทั้งหมด</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
              quickFilter === 'all' ? 'bg-slate-700 text-slate-200' : 'bg-slate-200 text-slate-600'
            }`}>
              {quickFilterCounts.all.toLocaleString()}
            </span>
          </button>

          <button
            onClick={() => handleFilterChange(setQuickFilter, 'has_po')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 shrink-0 ${
              quickFilter === 'has_po'
                ? 'bg-teal-700 text-white shadow-2xs'
                : 'bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200'
            }`}
          >
            <FileText className="w-3 h-3" />
            <span>มีใบสั่งจ้าง (PO)</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
              quickFilter === 'has_po' ? 'bg-teal-800 text-teal-100' : 'bg-teal-100 text-teal-800 font-bold'
            }`}>
              {quickFilterCounts.has_po.toLocaleString()}
            </span>
          </button>

          <button
            onClick={() => handleFilterChange(setQuickFilter, 'has_mou')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 shrink-0 ${
              quickFilter === 'has_mou'
                ? 'bg-indigo-700 text-white shadow-2xs'
                : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-800 border border-indigo-200'
            }`}
          >
            <Tag className="w-3 h-3" />
            <span>มีบันทึกข้อตกลง</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
              quickFilter === 'has_mou' ? 'bg-indigo-800 text-indigo-100' : 'bg-indigo-100 text-indigo-800 font-bold'
            }`}>
              {quickFilterCounts.has_mou.toLocaleString()}
            </span>
          </button>

          <button
            onClick={() => handleFilterChange(setQuickFilter, 'annual')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 shrink-0 ${
              quickFilter === 'annual'
                ? 'bg-emerald-700 text-white shadow-2xs'
                : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200'
            }`}
          >
            <span>สัญญารายปี</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
              quickFilter === 'annual' ? 'bg-emerald-800 text-emerald-100' : 'bg-emerald-100 text-emerald-800 font-bold'
            }`}>
              {quickFilterCounts.annual.toLocaleString()}
            </span>
          </button>

          <button
            onClick={() => handleFilterChange(setQuickFilter, 'monthly')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 shrink-0 ${
              quickFilter === 'monthly'
                ? 'bg-blue-700 text-white shadow-2xs'
                : 'bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200'
            }`}
          >
            <span>สัญญารายเดือน</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
              quickFilter === 'monthly' ? 'bg-blue-800 text-blue-100' : 'bg-blue-100 text-blue-800 font-bold'
            }`}>
              {quickFilterCounts.monthly.toLocaleString()}
            </span>
          </button>

          <button
            onClick={() => handleFilterChange(setQuickFilter, 'has_bg')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 shrink-0 ${
              quickFilter === 'has_bg'
                ? 'bg-amber-600 text-white shadow-2xs'
                : 'bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200'
            }`}
          >
            <Landmark className="w-3 h-3 text-amber-700" />
            <span>มีหนังสือค้ำประกัน (BG)</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
              quickFilter === 'has_bg' ? 'bg-amber-700 text-amber-100' : 'bg-amber-100 text-amber-900 font-bold'
            }`}>
              {quickFilterCounts.has_bg.toLocaleString()}
            </span>
          </button>
        </div>

        {/* Filters Controls Row */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 text-xs pt-1">
          {/* 1. ภูมิภาค (Region) */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
              ภูมิภาค:
            </label>
            <select
              value={selectedRegion}
              onChange={(e) => handleFilterChange(setSelectedRegion, e.target.value)}
              className="w-full p-2 bg-slate-50 border border-slate-300 rounded-md font-medium text-slate-800 focus:outline-teal-600"
            >
              <option value="all">ทุกภูมิภาค</option>
              <option value="เหนือ">ภาคเหนือ</option>
              <option value="กลาง">ภาคกลาง</option>
              <option value="อีสาน">ภาคอีสาน (ตะวันออกเฉียงเหนือ)</option>
              <option value="ตะวันออก">ภาคตะวันออก</option>
              <option value="ตะวันตก">ภาคตะวันตก</option>
              <option value="ใต้">ภาคใต้</option>
            </select>
          </div>

          {/* 2. ประเภทโรงพยาบาล (Hospital Type) */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
              ประเภท รพ.:
            </label>
            <select
              value={selectedHospitalType}
              onChange={(e) => handleFilterChange(setSelectedHospitalType, e.target.value)}
              className="w-full p-2 bg-slate-50 border border-slate-300 rounded-md font-medium text-slate-800 focus:outline-teal-600"
            >
              <option value="all">ทุกประเภท รพ.</option>
              <option value="center">โรงพยาบาลศูนย์ (ระดับ A)</option>
              <option value="general">โรงพยาบาลทั่วไป (ระดับ S/M1)</option>
              <option value="community">โรงพยาบาลชุมชน (ระดับ M2/F)</option>
            </select>
          </div>

          {/* 3. ประเภทสัญญา (Contract Billing Type) */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
              ประเภทสัญญา:
            </label>
            <select
              value={selectedContractType}
              onChange={(e) => handleFilterChange(setSelectedContractType, e.target.value)}
              className="w-full p-2 bg-slate-50 border border-slate-300 rounded-md font-medium text-slate-800 focus:outline-teal-600"
            >
              <option value="all">ทุกประเภทสัญญา</option>
              <option value="annual">สัญญารายปี (มีวงเงิน)</option>
              <option value="monthly">สัญญารายเดือน</option>
              <option value="other">อื่น ๆ / MOU</option>
            </select>
          </div>

          {/* 4. สถานะสัญญา (Contract Status) */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
              สถานะสัญญา:
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => handleFilterChange(setSelectedStatus, e.target.value)}
              className="w-full p-2 bg-slate-50 border border-slate-300 rounded-md font-medium text-slate-800 focus:outline-teal-600"
            >
              <option value="all">ทุกสถานะ</option>
              <option value="normal">ปกติ</option>
              <option value="expiring">ใกล้หมดอายุ (&lt;60 วัน)</option>
              <option value="expired">หมดอายุ</option>
              <option value="monthly">รายเดือน</option>
              <option value="pending">รอตรวจสอบ</option>
            </select>
          </div>

          {/* 5. กรองตามจังหวัด */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
              จังหวัด:
            </label>
            <select
              value={selectedProvince}
              onChange={(e) => handleFilterChange(setSelectedProvince, e.target.value)}
              className="w-full p-2 bg-slate-50 border border-slate-300 rounded-md font-medium text-slate-800 focus:outline-teal-600"
            >
              <option value="all">ทุกจังหวัด ({provinces.length} จังหวัด)</option>
              {provinces.map((prov) => (
                <option key={prov} value={prov}>
                  {prov}
                </option>
              ))}
            </select>
          </div>

          {/* 6. รีเซ็ตฟิลเตอร์ */}
          <div className="flex items-end">
            <button
              onClick={handleResetFilters}
              className="w-full p-2 bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 rounded-md font-medium text-xs flex items-center justify-center gap-1 transition-all"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
              <span>รีเซ็ตตัวกรอง</span>
            </button>
          </div>
        </div>

        {/* Filter Summary & Total Count (Back Office Specification: e.g. "พบข้อมูล 927 โรงพยาบาล") */}
        <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold text-slate-900 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200">
              พบข้อมูล <strong>{totalItems.toLocaleString()}</strong> โรงพยาบาล (จากทั้งหมด {hospitals.length.toLocaleString()} แห่ง)
            </span>
            {(searchQuery || selectedRegion !== 'all' || selectedHospitalType !== 'all' || selectedContractType !== 'all' || selectedStatus !== 'all' || selectedProvince !== 'all') && (
              <span className="text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200 text-[11px] font-medium">
                กำลังใช้ตัวกรอง
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 text-slate-500 text-[11px]">
            <span>แสดงต่อหน้า:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="bg-white border border-slate-300 rounded px-2 py-1 font-semibold text-slate-800"
            >
              <option value={25}>25 รายการ</option>
              <option value={50}>50 รายการ</option>
              <option value={100}>100 รายการ</option>
            </select>
          </div>
        </div>
      </div>

      {/* 3. Main Data Presentation: Table View (Requested as Primary Back Office View) */}
      {viewMode === 'table' ? (
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-slate-100/90 text-slate-700 font-bold border-b border-slate-200">
                  <th className="py-3 px-3.5 whitespace-nowrap">โรงพยาบาล</th>
                  <th className="py-3 px-3 whitespace-nowrap">ภูมิภาค</th>
                  <th className="py-3 px-3 whitespace-nowrap">ประเภท รพ.</th>
                  <th className="py-3 px-3 whitespace-nowrap">ประเภทสัญญา</th>
                  <th className="py-3 px-3 whitespace-nowrap">เลขที่สัญญา</th>
                  <th className="py-3 px-3 whitespace-nowrap">เริ่มสัญญา</th>
                  <th className="py-3 px-3 whitespace-nowrap">สิ้นสุดสัญญา</th>
                  <th className="py-3 px-3.5 text-right whitespace-nowrap">วงเงิน</th>
                  <th className="py-3 px-3 text-center whitespace-nowrap">สถานะ</th>
                  <th className="py-3 px-3 text-right whitespace-nowrap">การจัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedHospitals.length > 0 ? (
                  paginatedHospitals.map((hosp) => {
                    const isMonthly = hosp.contractBillingType === 'monthly_billing';

                    return (
                      <tr
                        key={hosp.id}
                        onClick={() => onSelectHospital(hosp)}
                        className="hover:bg-teal-50/40 transition-colors cursor-pointer group"
                      >
                        {/* 1. โรงพยาบาล */}
                        <td className="py-3 px-3.5">
                          <div className="font-semibold text-slate-900 group-hover:text-teal-700 transition-colors flex items-center gap-1.5">
                            <span>{hosp.name}</span>
                          </div>
                          <div className="text-[11px] text-slate-500 font-mono mt-0.5 flex items-center gap-1.5 flex-wrap">
                            <span className="bg-slate-100 text-slate-700 px-1.5 py-0.2 rounded text-[10px] font-bold">
                              H:{hosp.hcode}
                            </span>
                            <span>•</span>
                            <span>{hosp.province}</span>
                            {hosp.hasBankGuarantee && (
                              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded bg-amber-50 text-amber-900 border border-amber-200 text-[10px] font-bold" title={`หนังสือค้ำประกัน ${hosp.bankGuarantee?.bankName || ''} วงเงิน ${hosp.bankGuarantee?.guaranteeAmount?.toLocaleString() || ''} บ.`}>
                                <Landmark className="w-2.5 h-2.5 text-amber-700" />
                                <span>BG {hosp.bankGuarantee?.guaranteeAmount ? `${(hosp.bankGuarantee.guaranteeAmount / 1000).toFixed(0)}k฿` : 'มี BG'}</span>
                              </span>
                            )}
                          </div>
                        </td>

                        {/* 2. ภูมิภาค */}
                        <td className="py-3 px-3 whitespace-nowrap font-medium text-slate-700">
                          <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-800 text-[11px] font-semibold">
                            {getRegionShort(hosp.region)}
                          </span>
                        </td>

                        {/* 3. ประเภท รพ. */}
                        <td className="py-3 px-3 whitespace-nowrap text-slate-600">
                          {hosp.hospitalType.includes('ศูนย์') ? (
                            <span className="text-indigo-800 font-semibold">รพ.ศูนย์</span>
                          ) : hosp.hospitalType.includes('ทั่วไป') ? (
                            <span className="text-blue-800 font-semibold">รพ.ทั่วไป</span>
                          ) : (
                            <span className="text-slate-700 font-medium">รพ.ชุมชน</span>
                          )}
                        </td>

                        {/* 4. ประเภทสัญญา */}
                        <td className="py-3 px-3 whitespace-nowrap">
                          {isMonthly ? (
                            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-blue-50 text-blue-800 border border-blue-200">
                              รายเดือน
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                              รายปี
                            </span>
                          )}
                        </td>

                        {/* 5. เลขที่สัญญา */}
                        <td className="py-3 px-3 whitespace-nowrap font-mono text-slate-700 font-medium">
                          {hosp.contractNumber || '-'}
                        </td>

                        {/* 6. เริ่มสัญญา */}
                        <td className="py-3 px-3 whitespace-nowrap font-mono text-slate-600">
                          {hosp.contractStartDate || '-'}
                        </td>

                        {/* 7. สิ้นสุดสัญญา */}
                        <td className="py-3 px-3 whitespace-nowrap font-mono font-medium text-slate-800">
                          {hosp.contractExpiryDate || '-'}
                        </td>

                        {/* 8. วงเงิน */}
                        <td className="py-3 px-3.5 text-right whitespace-nowrap font-mono font-bold">
                          {isMonthly ? (
                            <span className="text-blue-700 text-xs font-semibold bg-blue-50 px-2 py-0.5 rounded">
                              รายเดือน
                            </span>
                          ) : (
                            <span className="text-slate-900 text-xs">
                              {hosp.totalBudget.toLocaleString()} ฿
                            </span>
                          )}
                        </td>

                        {/* 9. สถานะ */}
                        <td className="py-3 px-3 text-center whitespace-nowrap">
                          {renderStatusBadge(hosp)}
                        </td>

                        {/* 10. การจัดการ / ดูรายละเอียด */}
                        <td className="py-3 px-3 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                            <button
                              type="button"
                              onClick={() => onSelectHospital(hosp)}
                              className="px-2.5 py-1 text-xs font-semibold text-teal-800 bg-teal-50 hover:bg-teal-100 border border-teal-200 rounded-md transition-all shadow-2xs flex items-center gap-1"
                            >
                              <span>ดูข้อมูล</span>
                              <ChevronRight className="w-3.5 h-3.5" />
                            </button>

                            {(currentRole.isCentralAdmin || currentRole.allowedRegions.includes(hosp.region)) && (
                              <button
                                type="button"
                                onClick={() => onEditHospital(hosp)}
                                className="px-2 py-1 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded border border-slate-200"
                                title="แก้ไขข้อมูล"
                              >
                                <Edit3 className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={10} className="py-12 text-center text-slate-400 text-xs">
                      ไม่พบข้อมูลโรงพยาบาลตามเงื่อนไขการค้นหา
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Alternative Card View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {paginatedHospitals.map((hosp) => {
            const isMonthly = hosp.contractBillingType === 'monthly_billing';

            return (
              <div
                key={hosp.id}
                onClick={() => onSelectHospital(hosp)}
                className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-2xs hover:border-teal-500 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
              >
                <div className="space-y-2.5">
                  <div className="flex items-start justify-between gap-1.5">
                    <div>
                      <h3 className="font-bold text-slate-900 group-hover:text-teal-700 transition-colors text-sm">
                        {hosp.name}
                      </h3>
                      <div className="text-[11px] text-slate-500 font-mono flex items-center gap-1 mt-0.5">
                        <span className="font-bold text-slate-700 bg-slate-100 px-1 rounded">
                          H:{hosp.hcode}
                        </span>
                        <span>•</span>
                        <span>{hosp.province} ({getRegionShort(hosp.region)})</span>
                      </div>
                    </div>
                    {renderStatusBadge(hosp)}
                  </div>

                  <div className="p-2.5 bg-slate-50 rounded-lg text-xs space-y-1 border border-slate-100">
                    <div className="flex justify-between">
                      <span className="text-slate-500">เลขที่สัญญา:</span>
                      <span className="font-mono font-semibold text-slate-800">{hosp.contractNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">ประเภทสัญญา:</span>
                      <span className="font-bold text-slate-800">
                        {isMonthly ? 'รายเดือน' : 'รายปี (มีวงเงิน)'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">วงเงินสัญญา:</span>
                      <span className="font-mono font-bold text-teal-800">
                        {isMonthly ? 'รายเดือน (ตาม Invoice)' : `${hosp.totalBudget.toLocaleString()} ฿`}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">วันสิ้นสุดสัญญา:</span>
                      <span className="font-mono text-slate-700">{hosp.contractExpiryDate}</span>
                    </div>
                    {hosp.hasBankGuarantee && (
                      <div className="flex justify-between pt-1 border-t border-slate-200/60 text-amber-900 font-medium">
                        <span className="flex items-center gap-1 text-[11px]">
                          <Landmark className="w-3 h-3 text-amber-700" />
                          <span>หนังสือค้ำประกัน (BG):</span>
                        </span>
                        <span className="font-mono font-bold text-amber-800 text-[11px]">
                          {hosp.bankGuarantee?.guaranteeAmount?.toLocaleString()} ฿ (5%)
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-[11px] text-slate-500">
                    AM: <strong>{hosp.amName.split(' ')[0]}</strong>
                  </span>
                  <span className="font-semibold text-teal-700 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                    <span>ดูรายละเอียด</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 4. Pagination Controls Bar (Scale to 927+ Hospitals: 25 / 50 / 100 per page) */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="text-slate-600 font-medium">
          แสดงรายการที่ <strong>{totalItems > 0 ? startIndex + 1 : 0}</strong> - <strong>{endIndex}</strong> จากทั้งหมด <strong>{totalItems.toLocaleString()}</strong> แห่ง
        </div>

        {/* Page buttons */}
        <div className="flex items-center gap-1 justify-center">
          {/* First Page */}
          <button
            onClick={() => setCurrentPage(1)}
            disabled={safeCurrentPage <= 1}
            className="p-1.5 rounded border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
            title="หน้าแรก"
          >
            <ChevronsLeft className="w-4 h-4" />
          </button>

          {/* Previous Page */}
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={safeCurrentPage <= 1}
            className="p-1.5 rounded border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
            title="หน้าก่อนหน้า"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {/* Page numbers window */}
          <div className="flex items-center gap-1 px-1">
            {(() => {
              const pages: number[] = [];
              const maxButtons = 5;
              let start = Math.max(1, safeCurrentPage - 2);
              let end = Math.min(totalPages, start + maxButtons - 1);
              if (end - start < maxButtons - 1) {
                start = Math.max(1, end - maxButtons + 1);
              }

              for (let i = start; i <= end; i++) {
                pages.push(i);
              }

              return pages.map((pageNum) => (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`w-8 h-8 rounded text-xs font-semibold transition-all ${
                    safeCurrentPage === pageNum
                      ? 'bg-teal-700 text-white shadow-2xs'
                      : 'border border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {pageNum}
                </button>
              ));
            })()}
          </div>

          {/* Next Page */}
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={safeCurrentPage >= totalPages}
            className="p-1.5 rounded border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
            title="หน้าถัดไป"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          {/* Last Page */}
          <button
            onClick={() => setCurrentPage(totalPages)}
            disabled={safeCurrentPage >= totalPages}
            className="p-1.5 rounded border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
            title="หน้าสุดท้าย"
          >
            <ChevronsRight className="w-4 h-4" />
          </button>

          <span className="text-slate-400 ml-2 font-mono text-[11px]">
            หน้า {safeCurrentPage} / {totalPages}
          </span>
        </div>
      </div>
    </div>
  );
};
