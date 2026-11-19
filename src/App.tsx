/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Sidebar, ViewType } from './components/Sidebar';
import { Header } from './components/Header';
import { ExecutiveDashboard } from './components/ExecutiveDashboard';
import { HospitalDirectorySearch } from './components/HospitalDirectorySearch';
import { EnterpriseGateway } from './components/EnterpriseGateway';
import { AmTaskPipeline } from './components/AmTaskPipeline';
import { AIForecastingDashboard } from './components/AIForecastingDashboard';
import { LegalStampDashboard } from './components/LegalStampDashboard';
import { HospitalDetailModal } from './components/HospitalDetailModal';
import { HospitalFormModal } from './components/HospitalFormModal';
import { PendingReviewsModal } from './components/PendingReviewsModal';
import { AuditLogDashboard } from './components/AuditLogDashboard';
import { DispatchAlertModal } from './components/DispatchAlertModal';
import { ExcelModal } from './components/ExcelModal';
import { GoogleSheetsBillingModal } from './components/GoogleSheetsBillingModal';
import { PillarSummaryDashboard } from './components/PillarSummaryDashboard';
import { 
  INITIAL_HOSPITALS, 
  ROLES_CONFIG, 
  RoleConfig, 
  HospitalContract,
  AuditLogEntry,
  PendingChangeRequest,
  INITIAL_PENDING_REQUESTS
} from './data/contractsData';
import { generate927Hospitals } from './data/hospitalsGenerator';

const STORAGE_KEY = 'healthrider_hospitals_data_v4';
const PENDING_KEY = 'healthrider_pending_requests_v4';
const AUTH_KEY = 'healthrider_auth_active_v3';
const AUTH_EMAIL_KEY = 'healthrider_auth_email_v3';
const AUTH_ROLE_KEY = 'healthrider_auth_role_v3';

export default function App() {
  // Login Gate: Must lock in via Gmail before accessing WebApp data
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      return localStorage.getItem(AUTH_KEY) === 'true';
    } catch {
      return false;
    }
  });

  const [loggedInEmail, setLoggedInEmail] = useState<string>(() => {
    try {
      return localStorage.getItem(AUTH_EMAIL_KEY) || 'ronnakorn2558@gmail.com';
    } catch {
      return 'ronnakorn2558@gmail.com';
    }
  });

  const [currentRole, setCurrentRole] = useState<RoleConfig>(() => {
    try {
      const savedRoleId = localStorage.getItem(AUTH_ROLE_KEY);
      if (savedRoleId && ROLES_CONFIG[savedRoleId as keyof typeof ROLES_CONFIG]) {
        return ROLES_CONFIG[savedRoleId as keyof typeof ROLES_CONFIG];
      }
    } catch {
      // default
    }
    return ROLES_CONFIG.admin;
  });

  const [currentView, setCurrentView] = useState<ViewType>('command');
  
  // Initialize hospitals (927 hospitals) from localStorage or generator
  const [hospitals, setHospitals] = useState<HospitalContract[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length >= 800) {
          return parsed.map((h: HospitalContract) => ({
            ...h,
            contractCategory: typeof h.contractCategory === 'string'
              ? h.contractCategory.replace(/Health Rider\s*/gi, '')
              : h.contractCategory,
          }));
        }
      }
    } catch (e) {
      console.warn('Could not read hospitals from localStorage', e);
    }
    return generate927Hospitals(INITIAL_HOSPITALS);
  });

  // Initialize pending change requests
  const [pendingRequests, setPendingRequests] = useState<PendingChangeRequest[]>(() => {
    try {
      const saved = localStorage.getItem(PENDING_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((req: PendingChangeRequest) => ({
            ...req,
            reviewNotes: typeof req.reviewNotes === 'string'
              ? req.reviewNotes.replace(/Health Rider\s*/gi, '')
              : req.reviewNotes,
            proposedData: req.proposedData
              ? {
                  ...req.proposedData,
                  contractCategory: typeof req.proposedData.contractCategory === 'string'
                    ? req.proposedData.contractCategory.replace(/Health Rider\s*/gi, '')
                    : req.proposedData.contractCategory,
                }
              : req.proposedData,
          }));
        }
      }
    } catch (e) {
      console.warn('Could not read pending requests from localStorage', e);
    }
    return INITIAL_PENDING_REQUESTS;
  });

  const [selectedHospital, setSelectedHospital] = useState<HospitalContract | null>(null);
  const [editingHospital, setEditingHospital] = useState<HospitalContract | null>(null);
  const [isAddingHospital, setIsAddingHospital] = useState<boolean>(false);
  const [isPendingReviewsOpen, setIsPendingReviewsOpen] = useState<boolean>(false);
  const [isGoogleSheetsSyncOpen, setIsGoogleSheetsSyncOpen] = useState<boolean>(false);
  const [dispatchAlertState, setDispatchAlertState] = useState<{ hospital: HospitalContract; alertType: string } | null>(null);
  const [excelModalMode, setExcelModalMode] = useState<'import' | 'export' | null>(null);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [lastUpdated, setLastUpdated] = useState<string>('05 ต.ค. 2569 15:00 น.');
  const [notificationBanner, setNotificationBanner] = useState<string | null>(null);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);

  // Sync hospitals to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(hospitals));
    } catch (e) {
      console.warn('Could not save hospitals to localStorage', e);
    }
  }, [hospitals]);

  // Sync pending requests to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(PENDING_KEY, JSON.stringify(pendingRequests));
    } catch (e) {
      console.warn('Could not save pending requests to localStorage', e);
    }
  }, [pendingRequests]);

  // Sync role to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(AUTH_ROLE_KEY, currentRole.id);
    } catch (e) {
      console.warn(e);
    }
  }, [currentRole]);

  const triggerToast = (msg: string) => {
    setNotificationBanner(msg);
    setTimeout(() => setNotificationBanner(null), 4500);
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      const now = new Date();
      const thaiMonths = [
        'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
        'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'
      ];
      const thaiYear = now.getFullYear() + 543;
      const formatted = `${now.getDate()} ${thaiMonths[now.getMonth()]} ${thaiYear} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')} น.`;
      setLastUpdated(formatted);
      setIsRefreshing(false);
      triggerToast(`รีเฟรชข้อมูลสำเร็จ ซิงค์สถานะโรงพยาบาล ${hospitals.length} แห่ง และคำขอรอตรวจสอบ ${pendingRequests.filter((r) => r.status === 'pending').length} รายการ (${formatted})`);
    }, 600);
  };

  const handleNavigateToHospital = (hospitalName: string) => {
    const found = hospitals.find((h) => h.name.includes(hospitalName) || hospitalName.includes(h.name));
    if (found) {
      setSelectedHospital(found);
    } else {
      triggerToast(`เปิดโปรไฟล์โรงพยาบาล ${hospitalName}`);
    }
  };

  const handleImportHospitals = (newHospitals: HospitalContract[]) => {
    if (!currentRole.canImport) {
      triggerToast('AM แต่ละภาคไม่สามารถ Import ไฟล์ Excel ได้ (สงวนสิทธิ์เฉพาะ Admin ส่วนกลาง)');
      return;
    }
    setHospitals((prev) => [...newHospitals, ...prev]);
    triggerToast('นำเข้าข้อมูลสัญญาสำเร็จและบันทึกสู่ระบบแล้ว');
  };

  const handleLoginSuccess = (email: string) => {
    setIsAuthenticated(true);
    setLoggedInEmail(email);
    try {
      localStorage.setItem(AUTH_KEY, 'true');
      localStorage.setItem(AUTH_EMAIL_KEY, email);
      localStorage.setItem(AUTH_ROLE_KEY, currentRole.id);
    } catch (e) {
      console.warn(e);
    }
    triggerToast(`ยินดีต้อนรับ ${email} เข้าสู่ระบบ MediCommand Contract Operations`);
    setCurrentView('command');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    try {
      localStorage.removeItem(AUTH_KEY);
    } catch (e) {
      console.warn(e);
    }
    triggerToast('ออกจากระบบเรียบร้อยแล้ว กรุณาเข้าสู่ระบบด้วย Gmail เพื่อใช้งาน');
  };

  const handleOpenAddHospital = () => {
    setEditingHospital(null);
    setIsAddingHospital(true);
  };

  const handleOpenEditHospital = (hospital: HospitalContract) => {
    // Check regional permission
    if (!currentRole.isCentralAdmin && !currentRole.allowedRegions.includes(hospital.region)) {
      triggerToast(`คุณไม่มีสิทธิ์แก้ไขโรงพยาบาลใน ${hospital.region} (จำกัดเฉพาะ ${currentRole.allowedRegions.join(', ')})`);
      return;
    }
    setEditingHospital(hospital);
    setIsAddingHospital(false);
  };

  // 1. Direct Save: ONLY for Central Admin
  const handleDirectSave = (savedHospital: HospitalContract, auditEntry: AuditLogEntry) => {
    setHospitals((prev) => {
      const existingIdx = prev.findIndex((h) => h.id === savedHospital.id);
      if (existingIdx >= 0) {
        const copy = [...prev];
        copy[existingIdx] = savedHospital;
        return copy;
      } else {
        return [savedHospital, ...prev];
      }
    });

    setEditingHospital(null);
    setIsAddingHospital(false);

    if (selectedHospital && selectedHospital.id === savedHospital.id) {
      setSelectedHospital(savedHospital);
    }

    triggerToast(`[ส่วนกลาง] บันทึกและอนุมัติข้อมูล ${savedHospital.name} (H-CODE: ${savedHospital.hcode}) เข้าฐานข้อมูลหลักเรียบร้อยแล้ว`);
  };

  // 2. Submit for Review: For Regional AMs
  // "เมื่อ AM กดบันทึก ระบบจะนำข้อมูลเข้าสู่ รายการ “รอตรวจสอบจากส่วนกลาง” เพื่อให้ทีมส่วนกลางตรวจสอบและเปรียบเทียบกับข้อมูลที่มีอยู่ใน Database เดิมก่อน"
  const handleSubmitPendingReview = (changeRequest: PendingChangeRequest) => {
    setPendingRequests((prev) => [changeRequest, ...prev]);

    setEditingHospital(null);
    setIsAddingHospital(false);

    triggerToast(`[AM ภูมิภาค] ส่งข้อมูล ${changeRequest.hospitalName} เข้าสู่รายการ "รอตรวจสอบจากส่วนกลาง" เรียบร้อยแล้ว (ฐานข้อมูลหลักจะยังไม่เปลี่ยนแปลงจนกว่าส่วนกลางจะอนุมัติ)`);
  };

  // 3. Central Admin Decision Actions:
  // - อนุมัติ → นำข้อมูลที่ AM เสนอมาอัปเดตใน Database หลัก
  const handleApproveRequest = (requestId: string, notes?: string) => {
    const req = pendingRequests.find((r) => r.id === requestId);
    if (!req) return;

    const now = new Date();
    const thaiMonths = [
      'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
      'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'
    ];
    const timestampStr = `${now.getDate()} ${thaiMonths[now.getMonth()]} ${now.getFullYear() + 543} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')} น.`;

    // Audit log for this approval
    const auditEntry: AuditLogEntry = {
      id: `audit-${Date.now()}`,
      timestamp: timestampStr,
      editorName: `${currentRole.name} (${loggedInEmail})`,
      editorRole: currentRole.name,
      action: 'ส่วนกลางอนุมัติคำขอ',
      changesSummary: `ส่วนกลางอนุมัติคำขอแก้ไขจาก ${req.proposerName}: เลขที่สัญญา ${req.proposedData.contractNumber} วงเงิน ${req.proposedData.contractBillingType === 'monthly_billing' ? 'รายเดือน' : req.proposedData.totalBudget.toLocaleString() + ' บาท'}${notes ? ' (หมายเหตุ: ' + notes + ')' : ''}`,
    };

    const finalHospitalToSave: HospitalContract = {
      ...req.proposedData,
      lastUpdated: 'อนุมัติโดยส่วนกลาง',
      auditLogs: [auditEntry, ...(req.proposedData.auditLogs || [])],
    };

    // Update main database
    setHospitals((prev) => {
      const idx = prev.findIndex((h) => h.id === req.hospitalId || h.hcode === req.hcode);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = finalHospitalToSave;
        return copy;
      } else {
        return [finalHospitalToSave, ...prev];
      }
    });

    // Update request status to approved
    setPendingRequests((prev) =>
      prev.map((r) =>
        r.id === requestId
          ? {
              ...r,
              status: 'approved' as const,
              reviewedBy: currentRole.name,
              reviewedAt: timestampStr,
              reviewNotes: notes || r.reviewNotes,
            }
          : r
      )
    );

    triggerToast(`อนุมัติข้อมูล ${req.hospitalName} สำเร็จ และอัปเดตลงใน Database หลักเรียบร้อยแล้ว`);
  };

  // - ไม่อนุมัติ → คงข้อมูลเดิมไว้
  const handleRejectRequest = (requestId: string, reason: string) => {
    const req = pendingRequests.find((r) => r.id === requestId);
    if (!req) return;

    const now = new Date();
    const thaiMonths = [
      'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
      'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'
    ];
    const timestampStr = `${now.getDate()} ${thaiMonths[now.getMonth()]} ${now.getFullYear() + 543} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')} น.`;

    setPendingRequests((prev) =>
      prev.map((r) =>
        r.id === requestId
          ? {
              ...r,
              status: 'rejected' as const,
              reviewedBy: currentRole.name,
              reviewedAt: timestampStr,
              reviewNotes: `[ไม่อนุมัติ] ${reason}`,
            }
          : r
      )
    );

    triggerToast(`ไม่อนุมัติคำขอ ${req.hospitalName} (คงข้อมูลเดิมใน Database หลักไว้ตามนโยบาย)`);
  };

  // - ส่งกลับให้แก้ไข → ให้ AM แก้ไขข้อมูลและส่งเข้ามาตรวจสอบใหม่
  const handleRequestRevision = (requestId: string, instructions: string) => {
    const req = pendingRequests.find((r) => r.id === requestId);
    if (!req) return;

    const now = new Date();
    const thaiMonths = [
      'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
      'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'
    ];
    const timestampStr = `${now.getDate()} ${thaiMonths[now.getMonth()]} ${now.getFullYear() + 543} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')} น.`;

    setPendingRequests((prev) =>
      prev.map((r) =>
        r.id === requestId
          ? {
              ...r,
              status: 'revision_requested' as const,
              reviewedBy: currentRole.name,
              reviewedAt: timestampStr,
              reviewNotes: `[ส่งกลับให้แก้ไข] ${instructions}`,
            }
          : r
      )
    );

    triggerToast(`ส่งคำขอ ${req.hospitalName} กลับไปยัง ${req.proposerName} เพื่อปรับปรุงข้อมูลและยื่นใหม่`);
  };

  const activePendingCount = pendingRequests.filter((r) => {
    if (r.status !== 'pending') return false;
    if (!currentRole.isCentralAdmin) {
      return currentRole.allowedRegions.includes(r.region);
    }
    return true;
  }).length;

  const handleOpenImportModal = () => {
    if (!currentRole.canImport) {
      triggerToast('AM แต่ละภาคไม่สามารถ Import ไฟล์ Excel ได้ (เฉพาะ Admin ส่วนกลางเท่านั้น)');
      return;
    }
    setExcelModalMode('import');
  };

  const handleOpenExportModal = () => {
    if (!currentRole.canExport) {
      triggerToast('AM แต่ละภาคไม่สามารถ Export ไฟล์ Excel ได้ (เฉพาะ Admin ส่วนกลางเท่านั้น)');
      return;
    }
    setExcelModalMode('export');
  };

  // BEFORE LOGIN: Guard Screen (Require Gmail Login) - Clean White Aesthetic
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 via-teal-50/20 to-slate-100 text-slate-900 flex flex-col justify-center items-center p-3 sm:p-6 relative overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-teal-400/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-emerald-400/10 rounded-full blur-3xl pointer-events-none"></div>

        {notificationBanner && (
          <div className="fixed top-6 right-6 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-lg shadow-xl text-xs font-medium flex items-center gap-2 border border-slate-700 animate-in slide-in-from-top-2 duration-200">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>{notificationBanner}</span>
          </div>
        )}

        <div className="max-w-4xl w-full bg-white text-slate-900 rounded-2xl shadow-xl overflow-hidden p-5 sm:p-8 border border-slate-200 z-10">
          <EnterpriseGateway
            currentRole={currentRole}
            onSelectRole={setCurrentRole}
            onLoginSuccess={handleLoginSuccess}
          />
        </div>

        <p className="text-xs text-slate-500 mt-4 text-center z-10">
          MediCommand Enterprise OS | Hospital Contract Operations Platform (Secured with Google OAuth / Gmail)
        </p>
      </div>
    );
  }

  // AFTER LOGIN: Full Dashboard Experience with Clean White Left Sidebar Tabbar
  return (
    <div className="h-screen w-screen flex bg-slate-50 overflow-hidden text-slate-900">
      {/* Left Sidebar Tabbar Navigation */}
      <Sidebar
        currentView={currentView}
        setCurrentView={setCurrentView}
        currentRole={currentRole}
        setCurrentRole={setCurrentRole}
        pendingCount={activePendingCount}
        onOpenPendingReviews={() => setIsPendingReviewsOpen(true)}
        userEmail={loggedInEmail}
        onLogout={handleLogout}
        totalHospitalsCount={hospitals.length}
        isMobileOpen={isMobileSidebarOpen}
        setIsMobileOpen={setIsMobileSidebarOpen}
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
        onOpenGoogleSheetsSync={() => setIsGoogleSheetsSyncOpen(true)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden bg-slate-50">
        {/* Top Header Bar */}
        <Header
          currentView={currentView}
          setCurrentView={setCurrentView}
          currentRole={currentRole}
          setCurrentRole={setCurrentRole}
          onRefresh={handleRefresh}
          isRefreshing={isRefreshing}
          lastUpdatedTime={lastUpdated}
          hospitals={hospitals}
          onSelectHospital={setSelectedHospital}
          userEmail={loggedInEmail}
          onLogout={handleLogout}
          onToggleMobileSidebar={() => setIsMobileSidebarOpen(true)}
          pendingCount={activePendingCount}
          onOpenPendingReviews={() => setIsPendingReviewsOpen(true)}
        />

        {/* Global Toast Notification */}
        {notificationBanner && (
          <div className="fixed top-20 right-6 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-lg shadow-xl text-xs font-medium flex items-center gap-2 border border-slate-700 animate-in slide-in-from-top-2 duration-200">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>{notificationBanner}</span>
          </div>
        )}

        {/* Scrollable Viewport Container - Ensures Perfect Fit & No Overflow */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-3 sm:p-5 lg:p-6 min-w-0">
          <div className="max-w-7xl mx-auto w-full min-w-0 space-y-5">
            {currentView === 'command' && (
              <ExecutiveDashboard
                hospitals={hospitals}
                currentRole={currentRole}
                lastUpdated={lastUpdated}
                onRefresh={handleRefresh}
                isRefreshing={isRefreshing}
                onSelectHospital={setSelectedHospital}
                onOpenImportModal={handleOpenImportModal}
                onOpenExportModal={handleOpenExportModal}
                onOpenDispatchAlert={(hosp, alertType) => setDispatchAlertState({ hospital: hosp, alertType })}
                onNavigateToView={setCurrentView}
                onOpenAddHospital={handleOpenAddHospital}
                onEditHospital={handleOpenEditHospital}
                pendingReviewsCount={activePendingCount}
                onOpenPendingReviews={() => setIsPendingReviewsOpen(true)}
              />
            )}

            {currentView === 'pillars' && (
              <PillarSummaryDashboard
                hospitals={hospitals}
                pendingRequests={pendingRequests}
                currentRole={currentRole}
                onSelectHospital={setSelectedHospital}
                onNavigateToView={setCurrentView}
                onOpenGoogleSheetsSync={() => setIsGoogleSheetsSyncOpen(true)}
                onOpenPendingReviews={() => setIsPendingReviewsOpen(true)}
              />
            )}

            {currentView === 'directory' && (
              <HospitalDirectorySearch
                hospitals={hospitals}
                currentRole={currentRole}
                onSelectHospital={setSelectedHospital}
                onAddNewHospital={handleOpenAddHospital}
                onEditHospital={handleOpenEditHospital}
                onOpenGoogleSheetsSync={() => setIsGoogleSheetsSyncOpen(true)}
              />
            )}

            {currentView === 'tasks' && (
              <AmTaskPipeline
                currentRole={currentRole}
                onNavigateToHospital={handleNavigateToHospital}
              />
            )}

            {currentView === 'forecast' && (
              <AIForecastingDashboard
                hospitals={hospitals}
                currentRole={currentRole}
                onSelectHospital={setSelectedHospital}
              />
            )}

            {currentView === 'legal' && (
              <LegalStampDashboard
                hospitals={hospitals}
                currentRole={currentRole}
                onSelectHospital={setSelectedHospital}
              />
            )}

            {currentView === 'audit' && (
              <AuditLogDashboard
                hospitals={hospitals}
                currentRole={currentRole}
                onSelectHospital={setSelectedHospital}
              />
            )}

            {currentView === 'auth' && (
              <EnterpriseGateway
                currentRole={currentRole}
                onSelectRole={setCurrentRole}
                onLoginSuccess={handleLoginSuccess}
              />
            )}
          </div>
        </main>
      </div>

      {/* Hospital Detail Modal (Shows H-Code, Category, QT, PO, TOR, Address & Postal Code) */}
      {selectedHospital && (
        <HospitalDetailModal
          hospital={selectedHospital}
          currentRole={currentRole}
          onClose={() => setSelectedHospital(null)}
          onOpenDispatchAlert={(hosp, alertType) => {
            setSelectedHospital(null);
            setDispatchAlertState({ hospital: hosp, alertType });
          }}
          onNavigateToForecast={() => {
            setSelectedHospital(null);
            setCurrentView('forecast');
          }}
          onEditHospital={handleOpenEditHospital}
        />
      )}

      {/* Add / Edit Hospital Modal (With 2-step workflow: Propose to Pending Review or Direct Save) */}
      {(isAddingHospital || editingHospital) && (
        <HospitalFormModal
          hospital={editingHospital}
          currentRole={currentRole}
          onClose={() => {
            setEditingHospital(null);
            setIsAddingHospital(false);
          }}
          onSaveDirect={handleDirectSave}
          onSubmitPendingReview={handleSubmitPendingReview}
        />
      )}

      {/* Pending Reviews Modal (Side-by-side Comparison & Central Approval) */}
      {isPendingReviewsOpen && (
        <PendingReviewsModal
          pendingRequests={pendingRequests}
          currentRole={currentRole}
          hospitals={hospitals}
          onClose={() => setIsPendingReviewsOpen(false)}
          onApproveRequest={handleApproveRequest}
          onRejectRequest={handleRejectRequest}
          onRequestRevision={handleRequestRevision}
        />
      )}

      {/* Dispatch Alert Modal */}
      {dispatchAlertState && (
        <DispatchAlertModal
          hospital={dispatchAlertState.hospital}
          alertType={dispatchAlertState.alertType}
          onClose={() => setDispatchAlertState(null)}
        />
      )}

      {/* Excel Import / Export Modal */}
      {excelModalMode && (
        <ExcelModal
          mode={excelModalMode}
          hospitals={hospitals}
          onClose={() => setExcelModalMode(null)}
          onImportHospitals={handleImportHospitals}
        />
      )}

      {/* Google Sheets Monthly Billing Sync Modal */}
      {isGoogleSheetsSyncOpen && (
        <GoogleSheetsBillingModal
          hospitals={hospitals}
          currentRole={currentRole}
          onClose={() => setIsGoogleSheetsSyncOpen(false)}
          onApplyDeductions={(updatedHospitals, summary) => {
            setHospitals(updatedHospitals);
            triggerToast(`ตัดยอดวางบิลสำเร็จ ${summary.count} โรงพยาบาล รวมยอดเงิน ${summary.totalAmount.toLocaleString()} บาท เรียบร้อยแล้ว`);
          }}
        />
      )}
    </div>
  );
}
