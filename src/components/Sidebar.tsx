import React from 'react';
import { 
  Activity, 
  Search, 
  FileSpreadsheet, 
  BrainCircuit, 
  Scale, 
  History, 
  Lock, 
  Hospital, 
  Clock, 
  ChevronLeft, 
  ChevronRight, 
  X, 
  LogOut, 
  ShieldCheck,
  CheckCircle2,
  Building2,
  Bell,
  Sparkles,
  ArrowRight,
  Layers,
  Briefcase
} from 'lucide-react';
import { ROLES_CONFIG, RoleConfig } from '../data/contractsData';

export type ViewType = 'command' | 'pillars' | 'directory' | 'tasks' | 'forecast' | 'legal' | 'audit' | 'auth';

interface SidebarProps {
  currentView: ViewType;
  setCurrentView: (view: ViewType) => void;
  currentRole: RoleConfig;
  setCurrentRole: (role: RoleConfig) => void;
  pendingCount: number;
  onOpenPendingReviews: () => void;
  userEmail: string;
  onLogout: () => void;
  totalHospitalsCount: number;
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean) => void;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
  onOpenGoogleSheetsSync?: () => void;
}

interface NavItem {
  id: ViewType;
  label: string;
  sublabel: string;
  icon: React.ElementType;
  badge?: string | number;
  badgeColor?: string;
  section: 'main' | 'operations' | 'security';
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  setCurrentView,
  currentRole,
  setCurrentRole,
  pendingCount,
  onOpenPendingReviews,
  userEmail,
  onLogout,
  totalHospitalsCount,
  isMobileOpen,
  setIsMobileOpen,
  isCollapsed,
  setIsCollapsed,
  onOpenGoogleSheetsSync,
}) => {
  const navItems: NavItem[] = [
    // หมวดหลัก
    {
      id: 'command',
      label: 'ภาพรวมผู้บริหาร',
      sublabel: 'Executive Command Center',
      icon: Activity,
      section: 'main',
    },
    {
      id: 'pillars',
      label: 'สรุปตามแกนสาระ (5 แกน)',
      sublabel: 'เครือข่าย · งบ · BG · นิติกรรม · ภูมิภาค',
      icon: Layers,
      badge: '5 แกน',
      badgeColor: 'bg-teal-50 text-teal-800 border border-teal-200',
      section: 'main',
    },
    {
      id: 'directory',
      label: 'ศูนย์ค้นหา รพ. & เอกสาร',
      sublabel: `ค้นหาและสัญญา ${totalHospitalsCount.toLocaleString()} แห่ง`,
      icon: Search,
      badge: `${totalHospitalsCount.toLocaleString()} รพ.`,
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30',
      section: 'main',
    },
    // หมวดปฏิบัติการ AM
    {
      id: 'tasks',
      label: 'AM Task Pipeline',
      sublabel: 'การติดตามงานสัญญา AM แต่ละภาค',
      icon: FileSpreadsheet,
      badge: '12 งาน',
      badgeColor: 'bg-blue-500/20 text-blue-300 border border-blue-500/30',
      section: 'operations',
    },
    {
      id: 'forecast',
      label: 'พยากรณ์ AI',
      sublabel: 'วิเคราะห์วงเงิน & Burn Rate',
      icon: BrainCircuit,
      badge: 'AI',
      badgeColor: 'bg-purple-500/20 text-purple-300 border border-purple-500/30',
      section: 'operations',
    },
    {
      id: 'legal',
      label: 'นิติการ & ตีตราสาร',
      sublabel: 'e-Stamp Duty & กฎหมาย',
      icon: Scale,
      section: 'operations',
    },
    {
      id: 'audit',
      label: 'ประวัติแก้ไข (Audit)',
      sublabel: 'ตรวจสอบย้อนหลังทุกคำขอ',
      icon: History,
      section: 'operations',
    },
    // ความปลอดภัย & สิทธิ์
    {
      id: 'auth',
      label: 'Gateway & สิทธิ์ผู้ใช้งาน',
      sublabel: 'จัดการบทบาทและนโยบาย',
      icon: Lock,
      section: 'security',
    },
  ];

  const handleNavClick = (viewId: ViewType) => {
    setCurrentView(viewId);
    if (isMobileOpen) {
      setIsMobileOpen(false);
    }
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          onClick={() => setIsMobileOpen(false)}
          className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-40 lg:hidden transition-opacity"
        />
      )}

      {/* Main Sidebar Element */}
      <aside
        className={`fixed lg:static top-0 bottom-0 left-0 z-50 flex flex-col bg-white text-slate-800 border-r border-slate-200 transition-all duration-300 ease-in-out shadow-lg lg:shadow-none select-none ${
          isCollapsed ? 'w-20' : 'w-72 xl:w-76'
        } ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        {/* 1. Header / Brand Bar */}
        <div className="h-16 shrink-0 px-4 flex items-center justify-between border-b border-slate-200/90 bg-white">
          {!isCollapsed ? (
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-700 via-teal-600 to-emerald-500 flex items-center justify-center text-white shadow-sm shadow-teal-700/20 shrink-0">
                <Hospital className="w-5 h-5 text-white" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-slate-900 text-base tracking-tight truncate">
                    MediCommand
                  </span>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 bg-teal-50 text-teal-700 border border-teal-200 rounded">
                    PRO
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 truncate leading-snug">
                  Hospital Contract Operations
                </p>
              </div>
            </div>
          ) : (
            <div className="mx-auto">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-700 via-teal-600 to-emerald-500 flex items-center justify-center text-white shadow-sm">
                <Hospital className="w-5 h-5" />
              </div>
            </div>
          )}

          {/* Controls: Mobile close button or Desktop collapse toggle */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsMobileOpen(false)}
              className="lg:hidden p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
              title="ปิดเมนู"
            >
              <X className="w-5 h-5" />
            </button>

            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="hidden lg:flex p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
              title={isCollapsed ? 'ขยายแถบเมนู' : 'ย่อแถบเมนู'}
            >
              {isCollapsed ? (
                <ChevronRight className="w-4 h-4" />
              ) : (
                <ChevronLeft className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {/* 2. Active Role & Scope Summary Card (if expanded) */}
        {!isCollapsed && (
          <div className="px-3.5 py-3 border-b border-slate-200/80 bg-slate-50/70">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-bold text-slate-600 tracking-wider uppercase flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
                บทบาทที่ใช้งาน
              </span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                currentRole.isCentralAdmin 
                  ? 'bg-amber-100 text-amber-900 border border-amber-300' 
                  : 'bg-teal-100 text-teal-900 border border-teal-300'
              }`}>
                {currentRole.badge}
              </span>
            </div>

            <div className="relative">
              <select
                value={currentRole.id}
                onChange={(e) => {
                  const target = ROLES_CONFIG[e.target.value as keyof typeof ROLES_CONFIG];
                  if (target) setCurrentRole(target);
                }}
                className="w-full text-xs font-semibold bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 rounded-lg py-1.5 px-2.5 cursor-pointer focus:outline-teal-600 focus:ring-1 focus:ring-teal-500 shadow-2xs transition-colors"
              >
                {Object.values(ROLES_CONFIG).map((role) => (
                  <option key={role.id} value={role.id} className="bg-white text-slate-900">
                    {role.badge} - {role.name}
                  </option>
                ))}
              </select>
            </div>

            <p className="text-[11px] text-slate-500 mt-1.5 leading-snug truncate">
              {currentRole.isCentralAdmin 
                ? 'สิทธิ์เต็ม: อนุมัติสัญญา, จัดการวงเงิน, Import/Export' 
                : `พื้นที่รับผิดชอบ: ${currentRole.allowedRegions.join(', ')}`}
            </p>
          </div>
        )}

        {/* 3. Pending Review Quick Action Capsule (Special highlight required by user brief) */}
        <div className="px-3 pt-3">
          <button
            onClick={onOpenPendingReviews}
            className={`w-full group text-left rounded-xl transition-all duration-150 border flex items-center ${
              pendingCount > 0
                ? 'bg-amber-50/90 border-amber-300 hover:bg-amber-100/90 text-amber-950 shadow-2xs'
                : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700'
            } ${isCollapsed ? 'p-2.5 justify-center' : 'p-3 gap-3'}`}
            title="รายการรอตรวจสอบจากส่วนกลาง"
          >
            <div className="relative shrink-0">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                pendingCount > 0 ? 'bg-amber-100 text-amber-700 ring-1 ring-amber-300' : 'bg-slate-100 text-slate-500'
              }`}>
                <Clock className="w-4 h-4" />
              </div>
              {pendingCount > 0 && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-rose-500 rounded-full ring-2 ring-white" />
              )}
            </div>

            {!isCollapsed && (
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold leading-tight text-slate-900 group-hover:text-amber-950">
                    รอตรวจสอบส่วนกลาง
                  </span>
                  <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-full ${
                    pendingCount > 0 
                      ? 'bg-amber-500 text-slate-950 font-black' 
                      : 'bg-slate-100 text-slate-600'
                  }`}>
                    {pendingCount}
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 truncate mt-0.5 leading-snug">
                  {currentRole.isCentralAdmin ? 'เปรียบเทียบและอนุมัติคำขอ' : 'ติดตามสถานะการเสนอแก้ไข'}
                </p>
              </div>
            )}
          </button>
        </div>

        {/* 4. Navigation Links (Vertical Tabbar) */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden px-3 py-3 space-y-4">
          {/* Main Group */}
          <div>
            {!isCollapsed && (
              <p className="px-2 text-[10px] font-bold tracking-wider text-slate-400 uppercase mb-1.5">
                เมนูหลัก
              </p>
            )}
            <div className="space-y-1">
              {navItems.filter((i) => i.section === 'main').map((item) => {
                const isActive = currentView === item.id;
                const Icon = item.icon;

                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    className={`w-full text-left rounded-xl transition-all duration-150 flex items-center ${
                      isCollapsed ? 'justify-center p-2.5' : 'px-3 py-2.5 gap-3'
                    } ${
                      isActive
                        ? 'bg-teal-600 text-white font-semibold shadow-xs shadow-teal-700/20'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 font-medium'
                    }`}
                    title={item.label}
                  >
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-600'}`} />
                    
                    {!isCollapsed && (
                      <div className="min-w-0 flex-1 flex items-center justify-between">
                        <div className="min-w-0 pr-1">
                          <p className={`text-xs leading-normal truncate ${isActive ? 'font-bold text-white' : 'font-semibold text-slate-800'}`}>
                            {item.label}
                          </p>
                          <p className={`text-[10px] truncate leading-tight ${isActive ? 'text-teal-100' : 'text-slate-400'}`}>
                            {item.sublabel}
                          </p>
                        </div>
                        {item.badge && (
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded shrink-0 ${
                            isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600 border border-slate-200'
                          }`}>
                            {item.badge}
                          </span>
                        )}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Operations & AM Group */}
          <div>
            {!isCollapsed && (
              <p className="px-2 text-[10px] font-bold tracking-wider text-slate-400 uppercase mb-1.5">
                ปฏิบัติการ &amp; กฎหมาย
              </p>
            )}
            <div className="space-y-1">
              {navItems.filter((i) => i.section === 'operations').map((item) => {
                const isActive = currentView === item.id;
                const Icon = item.icon;

                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    className={`w-full text-left rounded-xl transition-all duration-150 flex items-center ${
                      isCollapsed ? 'justify-center p-2.5' : 'px-3 py-2.5 gap-3'
                    } ${
                      isActive
                        ? 'bg-teal-600 text-white font-semibold shadow-xs shadow-teal-700/20'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 font-medium'
                    }`}
                    title={item.label}
                  >
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-600'}`} />
                    
                    {!isCollapsed && (
                      <div className="min-w-0 flex-1 flex items-center justify-between">
                        <div className="min-w-0 pr-1">
                          <p className={`text-xs leading-normal truncate ${isActive ? 'font-bold text-white' : 'font-semibold text-slate-800'}`}>
                            {item.label}
                          </p>
                          <p className={`text-[10px] truncate leading-tight ${isActive ? 'text-teal-100' : 'text-slate-400'}`}>
                            {item.sublabel}
                          </p>
                        </div>
                        {item.badge && (
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded shrink-0 ${
                            isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600 border border-slate-200'
                          }`}>
                            {item.badge}
                          </span>
                        )}
                      </div>
                    )}
                  </button>
                );
              })}

              {/* Google Sheets Sync shortcut */}
              {onOpenGoogleSheetsSync && (
                <button
                  onClick={() => {
                    onOpenGoogleSheetsSync();
                    if (isMobileOpen) setIsMobileOpen(false);
                  }}
                  className={`w-full text-left rounded-xl transition-all duration-150 flex items-center mt-1 ${
                    isCollapsed ? 'justify-center p-2.5' : 'px-3 py-2.5 gap-3'
                  } bg-emerald-50/80 hover:bg-emerald-100 text-emerald-900 border border-emerald-200/80 font-medium`}
                  title="เชื่อมต่อ Google Sheet วางบิลเพื่อตัดวงเงินสัญญา"
                >
                  <FileSpreadsheet className="w-4 h-4 text-emerald-700 shrink-0" />
                  {!isCollapsed && (
                    <div className="min-w-0 flex-1 flex items-center justify-between">
                      <div className="min-w-0 pr-1">
                        <p className="text-xs font-bold text-emerald-950 truncate leading-tight">
                          ซิงค์ Google Sheet วางบิล
                        </p>
                        <p className="text-[10px] text-emerald-700 truncate leading-tight">
                          ตัดยอดในวงเงินสัญญา
                        </p>
                      </div>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-200 text-emerald-900 shrink-0">
                        Sheet
                      </span>
                    </div>
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Security & Access Group */}
          <div>
            {!isCollapsed && (
              <p className="px-2 text-[10px] font-bold tracking-wider text-slate-400 uppercase mb-1.5">
                ความปลอดภัย &amp; สิทธิ์
              </p>
            )}
            <div className="space-y-1">
              {navItems.filter((i) => i.section === 'security').map((item) => {
                const isActive = currentView === item.id;
                const Icon = item.icon;

                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    className={`w-full text-left rounded-xl transition-all duration-150 flex items-center ${
                      isCollapsed ? 'justify-center p-2.5' : 'px-3 py-2.5 gap-3'
                    } ${
                      isActive
                        ? 'bg-teal-600 text-white font-semibold shadow-xs shadow-teal-700/20'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 font-medium'
                    }`}
                    title={item.label}
                  >
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-600'}`} />
                    
                    {!isCollapsed && (
                      <div className="min-w-0 flex-1 flex items-center justify-between">
                        <div className="min-w-0 pr-1">
                          <p className={`text-xs leading-normal truncate ${isActive ? 'font-bold text-white' : 'font-semibold text-slate-800'}`}>
                            {item.label}
                          </p>
                          <p className={`text-[10px] truncate leading-tight ${isActive ? 'text-teal-100' : 'text-slate-400'}`}>
                            {item.sublabel}
                          </p>
                        </div>
                        {item.badge && (
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded shrink-0 ${
                            isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600 border border-slate-200'
                          }`}>
                            {item.badge}
                          </span>
                        )}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* 5. User Profile Capsule & Footer */}
        <div className="p-3 border-t border-slate-200 bg-slate-50/80 shrink-0">
          {!isCollapsed ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2.5 p-2 rounded-xl bg-white border border-slate-200/90 shadow-2xs">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-white shrink-0 ${
                  currentRole.isCentralAdmin ? 'bg-amber-600' : 'bg-teal-700'
                }`}>
                  {currentRole.isCentralAdmin ? <ShieldCheck className="w-4 h-4" /> : <Briefcase className="w-4 h-4" />}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-slate-900 truncate leading-tight">
                    {userEmail}
                  </p>
                  <p className="text-[11px] text-teal-700 font-semibold truncate leading-tight mt-0.5">
                    {currentRole.name}
                  </p>
                </div>
                <button
                  onClick={onLogout}
                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                  title="ออกจากระบบ"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>

              <div className="flex items-center justify-between px-1 text-[11px] text-slate-500 leading-snug">
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  ระบบออนไลน์ (พร้อมใช้งาน)
                </span>
                <span className="font-mono text-slate-400">v4.3</span>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold text-white shadow-2xs ${
                currentRole.isCentralAdmin ? 'bg-amber-600' : 'bg-teal-700'
              }`} title={`${userEmail} (${currentRole.name})`}>
                {currentRole.isCentralAdmin ? <ShieldCheck className="w-4 h-4" /> : <Briefcase className="w-4 h-4" />}
              </div>
              <button
                onClick={onLogout}
                className="p-2 text-slate-400 hover:text-rose-600 hover:bg-slate-100 rounded-lg transition-colors"
                title="ออกจากระบบ"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};
