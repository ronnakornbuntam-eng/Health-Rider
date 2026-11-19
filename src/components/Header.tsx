import React, { useState, useRef, useEffect } from 'react';
import { 
  ShieldCheck, 
  RefreshCw,
  Search,
  ChevronRight,
  Menu,
  Clock,
  Building2,
  ExternalLink,
  Activity,
  Layers,
  FileSpreadsheet,
  BrainCircuit,
  Scale,
  History,
  Lock,
  X
} from 'lucide-react';
import { ROLES_CONFIG, RoleConfig, HospitalContract } from '../data/contractsData';
import { ViewType } from './Sidebar';

interface HeaderProps {
  currentView: ViewType;
  setCurrentView: (view: ViewType) => void;
  currentRole: RoleConfig;
  setCurrentRole: (role: RoleConfig) => void;
  onRefresh: () => void;
  isRefreshing: boolean;
  lastUpdatedTime: string;
  hospitals: HospitalContract[];
  onSelectHospital: (hospital: HospitalContract) => void;
  userEmail?: string;
  onLogout?: () => void;
  onToggleMobileSidebar: () => void;
  pendingCount?: number;
  onOpenPendingReviews?: () => void;
}

const VIEW_TITLES: Record<ViewType, { title: string; subtitle: string; icon: React.ElementType }> = {
  command: {
    title: 'ภาพรวมผู้บริหาร (Command Center)',
    subtitle: 'ศูนย์สั่งการติดตามงบประมาณ, วงเงินสัญญา, และตัวชี้วัดสำคัญระดับประเทศ',
    icon: Activity,
  },
  pillars: {
    title: 'แดชบอร์ดสรุปตามแกนสาระ (5 แกนสำคัญ)',
    subtitle: 'สรุปภาพรวมเชิงลึกแยกตามเครือข่ายสัญญา งบประมาณ เอกสาร/BG นิติกรรม และปริมาณจัดส่งรายภูมิภาค',
    icon: Layers,
  },
  directory: {
    title: 'ศูนย์ค้นหาโรงพยาบาลและเอกสารสัญญา',
    subtitle: 'ระบบค้นหาฐานข้อมูลโรงพยาบาลกว่า 900+ แห่ง พร้อมดูสัญญา, PO, QT และ TOR',
    icon: Building2,
  },
  tasks: {
    title: 'AM Task Flow & Pipeline',
    subtitle: 'การบริหารจัดการติดตามงานสัญญาของ Account Manager ประจำแต่ละภูมิภาค',
    icon: FileSpreadsheet,
  },
  forecast: {
    title: 'ระบบพยากรณ์การใช้วงเงิน AI',
    subtitle: 'วิเคราะห์อัตราการใช้งบประมาณ (Burn Rate) และเตือนล่วงหน้า 30-90 วัน',
    icon: BrainCircuit,
  },
  legal: {
    title: 'นิติการสัญญา & ตีตราสารอากร',
    subtitle: 'ติดตาม e-Stamp Duty, หนังสือมอบอำนาจ, และการปิดรอบสัญญาอย่างถูกต้อง',
    icon: Scale,
  },
  audit: {
    title: 'ประวัติการแก้ไขและอนุมัติสัญญา (Audit Trail)',
    subtitle: 'บันทึกประวัติย้อนหลังทุกการเพิ่ม, เสนอแก้ไขวงเงิน, และการอนุมัติโดยส่วนกลาง',
    icon: History,
  },
  auth: {
    title: 'Gateway & สิทธิ์การเข้าถึงข้อมูล',
    subtitle: 'การกำหนดบทบาทผู้ใช้งาน (RBAC) ระหว่างผู้ดูแลส่วนกลางและ AM แต่ละภูมิภาค',
    icon: Lock,
  },
};

export const Header: React.FC<HeaderProps> = ({
  currentView,
  setCurrentView,
  currentRole,
  setCurrentRole,
  onRefresh,
  isRefreshing,
  lastUpdatedTime,
  hospitals,
  onSelectHospital,
  userEmail,
  onLogout,
  onToggleMobileSidebar,
  pendingCount = 0,
  onOpenPendingReviews,
}) => {
  const [headerSearch, setHeaderSearch] = useState<string>('');
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Close search dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const searchSuggestions = React.useMemo(() => {
    if (!headerSearch.trim()) return [];
    const q = headerSearch.toLowerCase().trim();
    return hospitals.filter((h) => {
      return (
        h.name.toLowerCase().includes(q) ||
        h.hcode.includes(q) ||
        h.province.toLowerCase().includes(q) ||
        h.address.postalCode.includes(q) ||
        h.contractNumber.toLowerCase().includes(q) ||
        h.amName.toLowerCase().includes(q) ||
        h.documents.po.docNumber.toLowerCase().includes(q)
      );
    }).slice(0, 6);
  }, [headerSearch, hospitals]);

  const currentViewInfo = VIEW_TITLES[currentView] || VIEW_TITLES.command;
  const ViewIcon = currentViewInfo.icon;

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200/90 shadow-2xs">
      <div className="px-3 sm:px-6 h-16 flex items-center justify-between gap-3 sm:gap-4">
        {/* Left: Mobile Toggle & Page Title */}
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
          <button
            onClick={onToggleMobileSidebar}
            className="lg:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors shrink-0"
            title="เปิดเมนูนำทาง"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-teal-50 border border-teal-200/80 text-teal-700 flex items-center justify-center shrink-0">
                <ViewIcon className="w-4 h-4" />
              </span>
              <h1 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight truncate leading-normal">
                {currentViewInfo.title}
              </h1>
            </div>
            <p className="text-[11px] text-slate-500 truncate hidden md:block leading-snug mt-0.5">
              {currentViewInfo.subtitle}
            </p>
          </div>
        </div>

        {/* Center: Global Instant Search for 927 Hospitals */}
        <div ref={searchContainerRef} className="relative flex-1 max-w-xs lg:max-w-md hidden sm:block">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={headerSearch}
              onChange={(e) => {
                setHeaderSearch(e.target.value);
                setIsDropdownOpen(true);
              }}
              onFocus={() => setIsDropdownOpen(true)}
              placeholder="ค้นหาด่วน H-Code, รพ., จังหวัด, เลขสัญญา, PO..."
              className="w-full pl-9 pr-8 py-1.5 text-xs bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-teal-600 focus:ring-1 focus:ring-teal-500 transition-all placeholder:text-slate-400"
            />
            {headerSearch && (
              <button
                onClick={() => setHeaderSearch('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded"
                aria-label="ล้างคำค้นหา"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Quick suggestions dropdown */}
          {isDropdownOpen && searchSuggestions.length > 0 && (
            <div className="absolute left-0 right-0 mt-1.5 bg-white rounded-xl border border-slate-200 shadow-xl overflow-hidden z-50 text-xs animate-in fade-in zoom-in-95 duration-100">
              <div className="p-2 bg-slate-50 border-b border-slate-100 text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center justify-between">
                <span>ผลการค้นหาโรงพยาบาล &amp; H-Code</span>
                <span className="text-teal-700 font-semibold">{searchSuggestions.length} รายการ</span>
              </div>
              <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto">
                {searchSuggestions.map((hosp) => (
                  <div
                    key={hosp.id}
                    onClick={() => {
                      onSelectHospital(hosp);
                      setIsDropdownOpen(false);
                      setHeaderSearch('');
                    }}
                    className="p-2.5 hover:bg-teal-50/70 cursor-pointer flex items-center justify-between group transition-colors"
                  >
                    <div className="space-y-0.5 min-w-0 pr-2">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <strong className="text-slate-900 group-hover:text-teal-700 font-semibold truncate leading-snug">
                          {hosp.name}
                        </strong>
                        <span className="font-mono text-[10px] bg-slate-900 text-white px-1.5 py-0.2 rounded font-bold shrink-0">
                          H:{hosp.hcode}
                        </span>
                        <span className="text-[10px] text-teal-800 bg-teal-50 border border-teal-200 px-1.5 py-0.2 rounded shrink-0">
                          {hosp.contractBillingType === 'monthly_billing' ? 'รายเดือน' : `${(hosp.totalBudget / 1000).toLocaleString()}k ฿`}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-1.5 truncate">
                        <span className="text-slate-700 font-medium">{hosp.province}</span>
                        <span>•</span>
                        <span className="font-mono text-slate-600">PO: {hosp.documents.po.docNumber}</span>
                        <span>•</span>
                        <span>AM: {hosp.amName}</span>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-teal-700 group-hover:translate-x-0.5 transition-transform shrink-0" />
                  </div>
                ))}
              </div>
              <div className="p-2 bg-slate-50 border-t border-slate-100 text-center">
                <button
                  onClick={() => {
                    setCurrentView('directory');
                    setIsDropdownOpen(false);
                  }}
                  className="text-teal-700 hover:text-teal-800 font-semibold text-[11px] flex items-center justify-center gap-1 mx-auto"
                >
                  <span>เปิดดูผลการค้นหาทั้งหมดในศูนย์ค้นหา รพ. ({hospitals.length} แห่ง)</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Action Icons: Pending Button, Refresh, User Pill */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          {/* Quick Pending Reviews Button */}
          {onOpenPendingReviews && (
            <button
              onClick={onOpenPendingReviews}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
                pendingCount > 0
                  ? 'bg-amber-50 hover:bg-amber-100 text-amber-900 border-amber-300 shadow-2xs animate-in'
                  : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
              }`}
              title="รายการรอตรวจสอบจากส่วนกลาง"
            >
              <Clock className={`w-3.5 h-3.5 ${pendingCount > 0 ? 'text-amber-600' : 'text-slate-400'}`} />
              <span className="hidden xl:inline">รอตรวจสอบ</span>
              <span className={`text-[10px] font-black px-1.5 py-0.2 rounded-full ${
                pendingCount > 0 ? 'bg-amber-500 text-slate-950 font-black' : 'bg-slate-200 text-slate-700'
              }`}>
                {pendingCount}
              </span>
            </button>
          )}

          {/* Refresh Action */}
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            title={`อัปเดตล่าสุด: ${lastUpdatedTime}`}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 active:scale-95 transition-all shadow-2xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-slate-500 ${isRefreshing ? 'animate-spin text-teal-600' : ''}`} />
            <span className="hidden md:inline">รีเฟรช</span>
          </button>

          {/* Role Indicator Capsule */}
          <div className="hidden lg:flex items-center gap-1.5 pl-2 border-l border-slate-200">
            <span className="text-[11px] text-slate-500 font-medium">สิทธิ์:</span>
            <span className={`text-xs font-bold px-2 py-0.5 rounded-md border ${
              currentRole.isCentralAdmin 
                ? 'bg-amber-50 text-amber-800 border-amber-200' 
                : 'bg-teal-50 text-teal-800 border-teal-200'
            }`}>
              {currentRole.badge}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
