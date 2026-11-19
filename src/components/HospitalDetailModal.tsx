import React, { useState } from 'react';
import { 
  X, 
  Building2, 
  ShieldCheck, 
  Calendar, 
  AlertTriangle, 
  Clock, 
  Phone, 
  Mail, 
  Send, 
  FileText, 
  TrendingUp, 
  Receipt,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  MapPin,
  FileCheck,
  FileSpreadsheet,
  Download,
  Printer,
  Copy,
  Check,
  User,
  Hospital,
  History,
  Edit3,
  Lock,
  Paperclip,
  UserCheck,
  Upload,
  Landmark,
  Plus
} from 'lucide-react';
import { HospitalContract, RoleConfig } from '../data/contractsData';

interface HospitalDetailModalProps {
  hospital: HospitalContract | null;
  currentRole: RoleConfig;
  onClose: () => void;
  onOpenDispatchAlert: (hospital: HospitalContract, alertType: string) => void;
  onNavigateToForecast: () => void;
  onEditHospital: (hospital: HospitalContract) => void;
}

export const HospitalDetailModal: React.FC<HospitalDetailModalProps> = ({
  hospital,
  currentRole,
  onClose,
  onOpenDispatchAlert,
  onNavigateToForecast,
  onEditHospital,
}) => {
  if (!hospital) return null;

  const [activeTab, setActiveTab] = useState<'docs' | 'location' | 'overview' | 'burn' | 'audit' | 'files' | 'bg'>('docs');
  const [selectedDocTab, setSelectedDocTab] = useState<'qt' | 'po' | 'tor' | 'agreement'>('qt');
  const [copiedText, setCopiedText] = useState<string | null>(null);

  // Check if current user can edit this hospital
  const canEditThisHospital = currentRole.isCentralAdmin || currentRole.allowedRegions.includes(hospital.region);

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 2500);
  };

  const handlePrintDoc = (docType: string) => {
    handleCopy(`ดาวน์โหลดเอกสาร ${docType} เรียบร้อยแล้ว`, `พิมพ์ ${docType}`);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full border border-slate-200 overflow-hidden my-4 animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[92vh]">
        {/* Top Header with H-Code and Location Badges - Clean White Theme */}
        <div className="p-5 bg-white border-b border-slate-200 text-slate-900 flex items-start justify-between shrink-0">
          <div className="space-y-1.5 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xl font-bold tracking-tight text-slate-900">{hospital.name}</span>
              <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300">
                H-CODE: {hospital.hcode}
              </span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-800 font-mono border border-teal-200 font-semibold">
                {hospital.contractNumber}
              </span>
              <span className="text-xs px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-mono border border-slate-200">
                {hospital.cusCode}
              </span>
            </div>

            <p className="text-xs text-slate-600 flex items-center gap-1.5 flex-wrap">
              <span className="font-semibold text-teal-700">{hospital.contractCategory}</span>
              <span>•</span>
              <span className="text-slate-700 font-medium">{hospital.hospitalType}</span>
              <span>•</span>
              <span className="text-slate-500">{hospital.province} ({hospital.region})</span>
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {canEditThisHospital && (
              <button
                onClick={() => {
                  onClose();
                  onEditHospital(hospital);
                }}
                className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-all active:scale-95"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>แก้ไขข้อมูล รพ.</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Primary Tab Navigation */}
        <div className="flex items-center gap-1 border-b border-slate-200 px-5 bg-slate-50 text-xs font-semibold text-slate-600 overflow-x-auto shrink-0">
          <button
            onClick={() => setActiveTab('docs')}
            className={`py-3 px-3 border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'docs'
                ? 'border-teal-700 text-teal-900 font-bold bg-white'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            <FileText className="w-3.5 h-3.5 text-teal-700" />
            <span>รายละเอียดเอกสาร (QT / PO / TOR)</span>
          </button>

          <button
            onClick={() => setActiveTab('location')}
            className={`py-3 px-3 border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'location'
                ? 'border-teal-700 text-teal-900 font-bold bg-white'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            <MapPin className="w-3.5 h-3.5 text-rose-600" />
            <span>ที่อยู่, รหัสไปรษณีย์ &amp; ผู้รับผิดชอบ</span>
          </button>

          <button
            onClick={() => setActiveTab('overview')}
            className={`py-3 px-3 border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'overview'
                ? 'border-teal-700 text-teal-900 font-bold bg-white'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
            <span>วงเงินสัญญา &amp; งบประมาณ</span>
          </button>

          <button
            onClick={() => setActiveTab('burn')}
            className={`py-3 px-3 border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'burn'
                ? 'border-teal-700 text-teal-900 font-bold bg-white'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5 text-indigo-600" />
            <span>Run-rate &amp; พยากรณ์ AI</span>
          </button>

          <button
            onClick={() => setActiveTab('files')}
            className={`py-3 px-3 border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'files'
                ? 'border-teal-700 text-teal-900 font-bold bg-white'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            <Paperclip className="w-3.5 h-3.5 text-slate-600" />
            <span>เอกสารแนบ ({hospital.attachedFiles.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('audit')}
            className={`py-3 px-3 border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'audit'
                ? 'border-teal-700 text-teal-900 font-bold bg-white'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            <History className="w-3.5 h-3.5 text-amber-600" />
            <span>ประวัติการแก้ไข ({hospital.auditLogs.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('bg')}
            className={`py-3 px-3 border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'bg'
                ? 'border-amber-600 text-amber-950 font-bold bg-white'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            <Landmark className="w-3.5 h-3.5 text-amber-600" />
            <span>หนังสือค้ำประกัน (BG)</span>
            {hospital.hasBankGuarantee ? (
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-100 text-amber-900 font-bold border border-amber-300">
                มี BG
              </span>
            ) : (
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-100 text-slate-500">
                ยังไม่มี
              </span>
            )}
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-5 overflow-y-auto text-xs flex-1">
          {/* Active Alert Banner if exists */}
          {hospital.alertDescription && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl space-y-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-rose-700 font-bold">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>สถานะความเสี่ยง: {hospital.alertType || 'High Risk'}</span>
                </div>
                <button
                  onClick={() => onOpenDispatchAlert(hospital, hospital.alertType || 'CRITICAL')}
                  className="px-2.5 py-1 text-[11px] font-semibold bg-rose-600 hover:bg-rose-700 text-white rounded shadow-2xs"
                >
                  แจ้งเตือน AM ด่วน
                </button>
              </div>
              <p className="text-slate-700 leading-relaxed text-[11px]">
                {hospital.alertDescription}
              </p>
            </div>
          )}

          {/* TAB 1: ALL DOCUMENTS (QT, PO, TOR, Contract Agreement) */}
          {activeTab === 'docs' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">
                    แฟ้มเอกสารสัญญาและจัดซื้อจัดจ้าง (Official Document Dossier)
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    เลขที่สัญญาหลัก: {hospital.contractNumber} • ระยะเวลา: {hospital.contractDuration}
                  </p>
                </div>
                <span className="text-[11px] font-bold text-teal-800 bg-teal-50 px-2.5 py-0.5 rounded border border-teal-200">
                  {hospital.contractStatus}
                </span>
              </div>

              {/* Sub-tabs for documents */}
              <div className="grid grid-cols-4 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setSelectedDocTab('qt')}
                  className={`p-2.5 rounded-lg border text-left transition-all ${
                    selectedDocTab === 'qt'
                      ? 'border-emerald-600 bg-emerald-50/50 shadow-2xs'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between text-[11px] font-bold text-emerald-800 mb-1">
                    <span>1. ใบเสนอราคา (QT)</span>
                    <span className="text-[9px] bg-emerald-100 px-1 rounded">อนุมัติ</span>
                  </div>
                  <div className="font-mono text-slate-900 font-semibold truncate">
                    {hospital.documents.qt.docNumber}
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedDocTab('po')}
                  className={`p-2.5 rounded-lg border text-left transition-all ${
                    selectedDocTab === 'po'
                      ? 'border-blue-600 bg-blue-50/50 shadow-2xs'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between text-[11px] font-bold text-blue-800 mb-1">
                    <span>2. ใบสั่งจ้าง (PO)</span>
                    <span className="text-[9px] bg-blue-100 px-1 rounded">มีเลข PO</span>
                  </div>
                  <div className="font-mono text-slate-900 font-semibold truncate">
                    {hospital.documents.po.docNumber}
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedDocTab('tor')}
                  className={`p-2.5 rounded-lg border text-left transition-all ${
                    selectedDocTab === 'tor'
                      ? 'border-indigo-600 bg-indigo-50/50 shadow-2xs'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between text-[11px] font-bold text-indigo-800 mb-1">
                    <span>3. ข้อกำหนด (TOR)</span>
                    <span className="text-[9px] bg-indigo-100 px-1 rounded">SLA</span>
                  </div>
                  <div className="font-mono text-slate-900 font-semibold truncate">
                    {hospital.documents.tor.docNumber}
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedDocTab('agreement')}
                  className={`p-2.5 rounded-lg border text-left transition-all ${
                    selectedDocTab === 'agreement'
                      ? 'border-amber-600 bg-amber-50/50 shadow-2xs'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between text-[11px] font-bold text-amber-800 mb-1">
                    <span>4. สัญญาหลัก &amp; อากร</span>
                    <span className="text-[9px] bg-amber-100 px-1 rounded">อ.ส.๙</span>
                  </div>
                  <div className="font-mono text-slate-900 font-semibold truncate">
                    {hospital.contractNumber}
                  </div>
                </button>
              </div>

              {/* Document Detail Preview Sheet */}
              <div className="bg-slate-50 rounded-xl border border-slate-200 p-5 space-y-4">
                {/* 1. QT PREVIEW */}
                {selectedDocTab === 'qt' && (
                  <div className="space-y-3">
                    <div className="flex items-start justify-between border-b border-slate-200 pb-3">
                      <div>
                        <div className="text-[11px] font-mono text-emerald-700 font-bold uppercase">
                          QUOTATION / ใบเสนอราคาบริการ
                        </div>
                        <h5 className="font-bold text-slate-900 text-sm mt-0.5">
                          {hospital.documents.qt.title}
                        </h5>
                        <p className="text-slate-500 text-[11px]">
                          เสนอต่อ: {hospital.name} ({hospital.address.subdistrict} {hospital.address.district} {hospital.address.province} {hospital.address.postalCode})
                        </p>
                      </div>
                      <span className="font-bold text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded text-xs">
                        {hospital.documents.qt.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                      <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                        <span className="text-[10px] text-slate-400 block">เลขที่ใบเสนอราคา</span>
                        <strong className="font-mono text-slate-800">{hospital.documents.qt.docNumber}</strong>
                      </div>
                      <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                        <span className="text-[10px] text-slate-400 block">วันที่เสนอราคา</span>
                        <strong className="font-mono text-slate-800">{hospital.documents.qt.date}</strong>
                      </div>
                      <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                        <span className="text-[10px] text-slate-400 block">ยอดรวมทั้งสิ้น (บาท)</span>
                        <strong className="font-mono text-emerald-700 font-bold text-sm">
                          {hospital.documents.qt.amount.toLocaleString()} ฿
                        </strong>
                      </div>
                      <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                        <span className="text-[10px] text-slate-400 block">อัตราค่าบริการต่อเที่ยว</span>
                        <strong className="font-mono text-slate-800">
                          {hospital.documents.qt.unitPricePerTrip} บาท / เที่ยว
                        </strong>
                      </div>
                    </div>

                    <div className="p-3 bg-white rounded-lg border border-slate-200 text-xs space-y-1">
                      <div className="flex justify-between text-slate-600">
                        <span>จำนวนเที่ยวจัดส่งที่ครอบคลุมในสัญญา:</span>
                        <span className="font-mono font-bold text-slate-800">{hospital.documents.qt.itemsCount.toLocaleString()} เที่ยว</span>
                      </div>
                      <div className="flex justify-between text-slate-600">
                        <span>ผู้อนุมัติราคาฝ่ายสถานพยาบาล:</span>
                        <span className="font-semibold text-slate-800">{hospital.documents.qt.approvedBy}</span>
                      </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-1">
                      <button
                        onClick={() => handlePrintDoc('ใบเสนอราคา (QT)')}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 rounded text-xs font-semibold"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>พิมพ์ใบ QT ทางการ (PDF)</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* 2. PO PREVIEW */}
                {selectedDocTab === 'po' && (
                  <div className="space-y-3">
                    <div className="flex items-start justify-between border-b border-slate-200 pb-3">
                      <div>
                        <div className="text-[11px] font-mono text-blue-700 font-bold uppercase">
                          PURCHASE ORDER / ใบสั่งจ้างทางราชการ
                        </div>
                        <h5 className="font-bold text-slate-900 text-sm mt-0.5">
                          {hospital.documents.po.title}
                        </h5>
                        <p className="text-slate-500 text-[11px]">
                          ผู้ออกใบสั่งจ้าง: กลุ่มงานพัสดุและจัดซื้อจัดจ้าง {hospital.name}
                        </p>
                      </div>
                      <span className="font-bold text-blue-800 bg-blue-100 px-2.5 py-1 rounded text-xs">
                        {hospital.documents.po.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                      <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                        <span className="text-[10px] text-slate-400 block">เลขที่ใบ PO</span>
                        <strong className="font-mono text-blue-900">{hospital.documents.po.docNumber}</strong>
                      </div>
                      <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                        <span className="text-[10px] text-slate-400 block">วันที่ออกใบ PO</span>
                        <strong className="font-mono text-slate-800">{hospital.documents.po.date}</strong>
                      </div>
                      <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                        <span className="text-[10px] text-slate-400 block">วงเงินตามใบ PO</span>
                        <strong className="font-mono text-blue-700 font-bold text-sm">
                          {hospital.documents.po.amount.toLocaleString()} ฿
                        </strong>
                      </div>
                      <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                        <span className="text-[10px] text-slate-400 block">เงื่อนไขการชำระเงิน</span>
                        <strong className="text-slate-800">{hospital.documents.po.paymentTerms}</strong>
                      </div>
                    </div>

                    <div className="p-3 bg-white rounded-lg border border-slate-200 text-xs space-y-1">
                      <div className="flex justify-between text-slate-600">
                        <span>รอบการเบิกจ่ายงวดเงิน:</span>
                        <span className="font-medium text-slate-800">{hospital.documents.po.disbursementPeriod}</span>
                      </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-1">
                      <button
                        onClick={() => handlePrintDoc('ใบสั่งจ้าง (PO)')}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 rounded text-xs font-semibold"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>ดาวน์โหลดสำเนาใบ PO (PDF)</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* 3. TOR PREVIEW */}
                {selectedDocTab === 'tor' && (
                  <div className="space-y-3">
                    <div className="flex items-start justify-between border-b border-slate-200 pb-3">
                      <div>
                        <div className="text-[11px] font-mono text-indigo-700 font-bold uppercase">
                          TERMS OF REFERENCE / ข้อกำหนดขอบเขตของงาน
                        </div>
                        <h5 className="font-bold text-slate-900 text-sm mt-0.5">
                          ข้อกำหนดและมาตรฐานการให้บริการขนส่งยาและเวชภัณฑ์ถึงบ้าน
                        </h5>
                        <p className="text-slate-500 text-[11px]">
                          เลขที่เอกสาร TOR: {hospital.documents.tor.docNumber} ({hospital.documents.tor.version})
                        </p>
                      </div>
                      <span className="font-mono text-xs bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded font-bold">
                        SLA บังคับใช้
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-3 text-xs">
                      <div className="p-2.5 bg-white rounded-lg border border-slate-200 text-center">
                        <span className="text-[10px] text-slate-400 block">รัศมีพื้นที่ให้บริการ</span>
                        <strong className="font-mono text-sm text-slate-900">{hospital.documents.tor.serviceRadiusKm} กิโลเมตร</strong>
                      </div>
                      <div className="p-2.5 bg-white rounded-lg border border-slate-200 text-center">
                        <span className="text-[10px] text-slate-400 block">SLA เวลาจัดส่งถึงบ้าน</span>
                        <strong className="font-mono text-sm text-indigo-700">ภายใน {hospital.documents.tor.slaHours} ชั่วโมง</strong>
                      </div>
                      <div className="p-2.5 bg-white rounded-lg border border-slate-200 text-center">
                        <span className="text-[10px] text-slate-400 block">ค่าปรับกรณีล่าช้า</span>
                        <strong className="font-mono text-sm text-rose-600">{hospital.documents.tor.penaltyPerLateHour} บาท / ชม.</strong>
                      </div>
                    </div>

                    <div className="p-3 bg-white rounded-lg border border-slate-200 text-xs space-y-1.5">
                      <strong className="text-slate-800 block">สรุปสาระสำคัญของขอบเขตงาน (Scope of Work):</strong>
                      <p className="text-slate-600 leading-relaxed">
                        {hospital.documents.tor.scopeSummary}
                      </p>
                    </div>

                    <div className="flex justify-end gap-2 pt-1">
                      <button
                        onClick={() => handlePrintDoc('ข้อกำหนดขอบเขตของงาน (TOR)')}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 rounded text-xs font-semibold"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>พิมพ์เอกสาร TOR ฉบับสมบูรณ์</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* 4. MASTER AGREEMENT & STAMP DUTY */}
                {selectedDocTab === 'agreement' && (
                  <div className="space-y-3">
                    <div className="flex items-start justify-between border-b border-slate-200 pb-3">
                      <div>
                        <div className="text-[11px] font-mono text-amber-700 font-bold uppercase">
                          MASTER CONTRACT &amp; e-STAMP DUTY / สัญญาจ้างและอากรแสตมป์
                        </div>
                        <h5 className="font-bold text-slate-900 text-sm mt-0.5">
                          สัญญาเลขที่ {hospital.contractNumber}
                        </h5>
                        <p className="text-slate-500 text-[11px]">
                          คู่สัญญา: {hospital.name} กับ บริษัทระบบบริหารการแพทย์ MediCommand
                        </p>
                      </div>
                      <span className="font-bold text-amber-800 bg-amber-100 px-2.5 py-1 rounded text-xs">
                        {hospital.stampDutyStatus}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                      <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                        <span className="text-[10px] text-slate-400 block">วันที่เริ่มต้นสัญญา</span>
                        <strong className="font-mono text-slate-800">{hospital.contractStartDate}</strong>
                      </div>
                      <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                        <span className="text-[10px] text-slate-400 block">วันที่สิ้นสุดสัญญา</span>
                        <strong className="font-mono text-rose-600">{hospital.contractExpiryDate}</strong>
                      </div>
                      <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                        <span className="text-[10px] text-slate-400 block">เลขที่ตราสารอากรแสตมป์</span>
                        <strong className="font-mono text-slate-800 text-[11px] truncate block">
                          {hospital.documents.contractAgreement.stampDutyNumber}
                        </strong>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: PHYSICAL LOCATION, POSTAL CODE & RESPONSIBLE PERSONNEL */}
          {activeTab === 'location' && (
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-rose-600" />
                    <h4 className="font-bold text-slate-900 text-sm">
                      ข้อมูลสถานที่ตั้งทางกายภาพและรหัสไปรษณีย์
                    </h4>
                  </div>
                  <span className="font-mono font-bold text-xs bg-slate-900 text-white px-2 py-0.5 rounded">
                    H-CODE: {hospital.hcode}
                  </span>
                </div>

                <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-2 text-xs">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-semibold block">ที่อยู่เต็ม (Full Physical Address):</span>
                      <p className="font-medium text-slate-900 text-sm mt-0.5 leading-relaxed">
                        {hospital.address.fullAddress}
                      </p>
                    </div>
                    <button
                      onClick={() => handleCopy(hospital.address.fullAddress, 'address')}
                      className="px-2.5 py-1 text-[11px] rounded border border-slate-300 hover:bg-slate-50 text-slate-700 flex items-center gap-1 shrink-0 ml-2"
                    >
                      {copiedText === 'address' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedText === 'address' ? 'คัดลอกแล้ว' : 'คัดลอกที่อยู่'}</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-100 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 block">ตำบล/แขวง</span>
                      <strong className="text-slate-800">{hospital.address.subdistrict}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">อำเภอ/เขต</span>
                      <strong className="text-slate-800">{hospital.address.district}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">จังหวัด</span>
                      <strong className="text-slate-800">{hospital.address.province}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">รหัสไปรษณีย์</span>
                      <strong className="text-slate-950 font-mono text-sm bg-teal-50 px-2 py-0.5 rounded border border-teal-200 inline-block">
                        {hospital.address.postalCode}
                      </strong>
                    </div>
                  </div>
                </div>
              </div>

              {/* Responsible Personnel (ใครรับผิดชอบ) */}
              <div className="p-4 bg-white rounded-xl border border-slate-200 space-y-3">
                <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <User className="w-4 h-4 text-teal-700" />
                  <span>ผู้รับผิดชอบและทีมงานประสานงานหลัก (Responsible Personnel)</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  {/* Account Manager */}
                  <div className="p-3 bg-teal-50/60 rounded-lg border border-teal-200/80 space-y-1.5">
                    <span className="text-[10px] font-bold uppercase text-teal-800 bg-teal-100 px-1.5 py-0.2 rounded">
                      ผู้จัดการฝ่ายบริหารลูกค้า (AM ผู้รับผิดชอบสัญญา)
                    </span>
                    <h5 className="font-bold text-slate-900 text-sm">{hospital.amName}</h5>
                    <div className="flex items-center gap-2 text-slate-600">
                      <Phone className="w-3.5 h-3.5 text-teal-700" />
                      <span className="font-mono">{hospital.amPhone}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-600">
                      <Mail className="w-3.5 h-3.5 text-teal-700" />
                      <span>{hospital.amEmail}</span>
                    </div>
                  </div>

                  {/* Hospital Coordinator & Director */}
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1.5">
                    <span className="text-[10px] font-bold uppercase text-slate-600 bg-slate-200 px-1.5 py-0.2 rounded">
                      ผู้ประสานงานหลักทางโรงพยาบาล
                    </span>
                    <h5 className="font-bold text-slate-900 text-sm">{hospital.hospitalCoordinator}</h5>
                    <div className="text-slate-600">
                      ผู้อำนวยการ: <strong>{hospital.hospitalDirector}</strong>
                    </div>
                    <div className="flex items-center gap-2 text-slate-600">
                      <Phone className="w-3.5 h-3.5 text-slate-500" />
                      <span>เบอร์ติดต่อ รพ.: {hospital.hospitalPhone}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: BUDGET OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                {hospital.contractBillingType === 'monthly_billing' ? (
                  <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-xl space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-indigo-900 text-sm">รูปแบบสัญญา: สัญญารายเดือน (Monthly Billing)</span>
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-200 text-indigo-900">
                        ไม่ต้องคำนวณวงเงิน
                      </span>
                    </div>
                    <p className="text-xs text-indigo-800 leading-relaxed">
                      สัญญาประเภทนี้ไม่กำหนดเพดานวงเงินรายปี ระบบไม่นำไปคำนวณการใช้วงเงินแบบสัญญารายปี โดยค่าบริการจะถูกสรุปและเรียกเก็บตาม <strong>ใบแจ้งหนี้ (Invoice)</strong> ของแต่ละเดือนตามผลการจัดส่งจริง
                    </p>
                    <div className="grid grid-cols-2 gap-3 pt-2 text-xs">
                      <div className="bg-white p-2.5 rounded-lg border border-indigo-100">
                        <span className="text-[10px] text-slate-500 block">สถานะวงเงิน:</span>
                        <strong className="text-indigo-900 font-bold">รายเดือน</strong>
                      </div>
                      <div className="bg-white p-2.5 rounded-lg border border-indigo-100">
                        <span className="text-[10px] text-slate-500 block">เงื่อนไขการเบิกจ่าย:</span>
                        <strong className="text-indigo-900 font-bold">ตามผลงานจริงแต่ละเดือน</strong>
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-700">การใช้วงเงินตามสัญญา</span>
                      <span className={`text-base font-bold font-mono ${
                        hospital.spentPercent >= 100 ? 'text-rose-600' : hospital.spentPercent >= 80 ? 'text-amber-600' : 'text-emerald-600'
                      }`}>
                        {hospital.spentPercent}%
                      </span>
                    </div>

                    <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          hospital.spentPercent >= 100 ? 'bg-rose-600' : hospital.spentPercent >= 80 ? 'bg-amber-500' : 'bg-emerald-600'
                        }`}
                        style={{ width: `${Math.min(100, hospital.spentPercent)}%` }}
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-2 pt-2 text-center">
                      <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                        <span className="text-[10px] text-slate-500 block">วงเงินตามสัญญาหลัก</span>
                        <span className="font-bold text-slate-900 font-mono text-sm">
                          {hospital.totalBudget.toLocaleString()} ฿
                        </span>
                      </div>
                      <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                        <span className="text-[10px] text-slate-500 block">วงเงินใบสั่งจ้าง (PO)</span>
                        <span className="font-bold text-teal-800 font-mono text-sm">
                          {hospital.poAmount.toLocaleString()} ฿
                        </span>
                      </div>
                      <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                        <span className="text-[10px] text-slate-500 block">คงเหลือ</span>
                        <span className={`font-bold font-mono text-sm ${hospital.remainingBudget < 0 ? 'text-rose-600' : 'text-emerald-700'}`}>
                          {hospital.remainingBudget.toLocaleString()} ฿
                        </span>
                      </div>
                    </div>
                  </>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="text-[10px] text-slate-500 block">วันสิ้นสุดสัญญา</span>
                  <span className="font-bold text-slate-900 text-sm font-mono">{hospital.contractExpiryDate}</span>
                  <p className="text-[11px] text-rose-600 font-semibold mt-0.5">
                    เหลือเวลาอีก {hospital.daysUntilExpiry} วัน
                  </p>
                </div>

                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="text-[10px] text-slate-500 block">สถานะนิติกรรม &amp; อากร</span>
                  <span className="font-bold text-slate-900 text-sm">{hospital.legalStatus}</span>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {hospital.stampDutyStatus}
                  </p>
                </div>
              </div>

              {/* Monthly Billing History Table (การวางบิลและตัดวงเงิน) */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                    <h4 className="font-bold text-slate-900 text-sm">
                      ประวัติการวางบิล &amp; ตัดวงเงินสัญญา (Monthly Billing History)
                    </h4>
                  </div>
                  <span className="text-[11px] font-semibold text-slate-600 bg-white px-2 py-0.5 rounded border border-slate-200">
                    {hospital.monthlyBillings?.length || 0} รายการ
                  </span>
                </div>

                {hospital.monthlyBillings && hospital.monthlyBillings.length > 0 ? (
                  <div className="border border-slate-200 rounded-lg overflow-hidden bg-white">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-slate-100/80 text-slate-700 font-semibold border-b border-slate-200">
                        <tr>
                          <th className="py-2.5 px-3">รอบบิล / วันที่</th>
                          <th className="py-2.5 px-3">เลขที่ใบแจ้งหนี้</th>
                          <th className="py-2.5 px-3 text-right">เที่ยวจัดส่ง</th>
                          <th className="py-2.5 px-3 text-right">ยอดวางบิล (บาท)</th>
                          <th className="py-2.5 px-3 text-center">สถานะ</th>
                          <th className="py-2.5 px-3">แหล่งที่มา</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {hospital.monthlyBillings.map((bill) => (
                          <tr key={bill.id} className="hover:bg-slate-50/80">
                            <td className="py-2.5 px-3">
                              <div className="font-bold text-slate-900">{bill.month}</div>
                              <div className="text-[10px] text-slate-500">{bill.billingDate}</div>
                            </td>
                            <td className="py-2.5 px-3 font-mono font-medium text-slate-800">
                              {bill.invoiceNumber}
                            </td>
                            <td className="py-2.5 px-3 text-right text-slate-700 font-medium">
                              {bill.tripsCount.toLocaleString()} เที่ยว
                            </td>
                            <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-800">
                              {bill.amount.toLocaleString()} ฿
                            </td>
                            <td className="py-2.5 px-3 text-center">
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                                <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" />
                                <span>{bill.status}</span>
                              </span>
                            </td>
                            <td className="py-2.5 px-3 text-[11px] text-slate-600">
                              <div>{bill.source === 'google_sheet' ? 'Google Sheets Sync' : 'บันทึกโดยเจ้าหน้าที่'}</div>
                              {bill.deductedBy && <div className="text-[10px] text-slate-400">{bill.deductedBy}</div>}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="py-6 bg-white rounded-lg border border-dashed border-slate-200 text-center text-slate-500 text-xs">
                    ยังไม่มีข้อมูลประวัติการวางบิล สามารถซิงค์ผ่านเมนู Google Sheet เพื่อตัดยอดวงเงินได้
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: BURN RATE & AI FORECAST */}
          {activeTab === 'burn' && (
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4 text-teal-700" />
                  <span>การวิเคราะห์ความเร็วการใช้จ่าย (Velocity &amp; Run-rate)</span>
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-white rounded-lg border border-slate-200">
                    <span className="text-[10px] text-slate-500 block">Burn Rate เฉลี่ยรายวัน</span>
                    <span className="font-mono text-base font-bold text-slate-900">
                      ~{hospital.dailyBurnRate.toLocaleString()} บาท/วัน
                    </span>
                  </div>
                  <div className="p-3 bg-white rounded-lg border border-slate-200">
                    <span className="text-[10px] text-slate-500 block">ระยะเวลาก่อนเงินหมดเกลี้ยง</span>
                    <span className="font-mono text-base font-bold text-rose-600">
                      {hospital.estimatedRunoutDays} วัน
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    onClose();
                    onNavigateToForecast();
                  }}
                  className="w-full py-2 bg-teal-700 hover:bg-teal-800 text-white font-semibold rounded-lg flex items-center justify-center gap-1.5"
                >
                  <span>เปิดเครื่องมือจำลองคำขอขยายเพดานวงเงินฉุกเฉิน (AI Simulator)</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* TAB 5: ATTACHED FILES */}
          {activeTab === 'files' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">
                    รายการเอกสารแนบที่อัปโหลดเข้าสู่ระบบ ({hospital.attachedFiles.length} ไฟล์)
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    AM มีหน้าที่อัปเดตไฟล์สัญญา, ใบเสนอราคา QT, TOR เข้าสู่ระบบ (บังคับ .PDF หรือ .PNG เท่านั้น)
                  </p>
                </div>
                {canEditThisHospital && (
                  <button
                    onClick={() => {
                      onClose();
                      onEditHospital(hospital);
                    }}
                    className="px-3 py-1.5 bg-teal-700 hover:bg-teal-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition-all"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>+ อัปเดตไฟล์ (PDF / PNG)</span>
                  </button>
                )}
              </div>

              <div className="space-y-2">
                {hospital.attachedFiles.length > 0 ? (
                  hospital.attachedFiles.map((file) => (
                    <div
                      key={file.id}
                      className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between hover:bg-slate-100 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-teal-700" />
                        <div>
                          <div className="font-bold text-slate-900">{file.name}</div>
                          <div className="text-[11px] text-slate-500">
                            หมวดหมู่: <strong className="text-slate-700">{file.category}</strong> • ขนาด: {file.fileSize} • อัปโหลดเมื่อ: {file.uploadDate} โดย {file.uploadedBy}
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => alert(`ดาวน์โหลดไฟล์ ${file.name} สำเร็จ`)}
                        className="flex items-center gap-1 px-3 py-1.5 bg-white border border-slate-300 rounded text-xs font-semibold text-slate-700 hover:bg-slate-50"
                      >
                        <Download className="w-3.5 h-3.5 text-teal-700" />
                        <span>ดาวน์โหลด</span>
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="py-8 text-center text-slate-400 text-xs border border-dashed border-slate-200 rounded-lg">
                    ยังไม่มีเอกสารแนบเพิ่มเติม
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 7: AUDIT LOGS (ประวัติการแก้ไข บันทึกวันเวลาและชื่อผู้แก้ไข) */}
          {activeTab === 'audit' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">
                    ประวัติการแก้ไขและบันทึกการเปลี่ยนแปลง (Audit Trail)
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    บันทึกวัน เวลา และรายชื่อผู้แก้ไขข้อมูลโรงพยาบาลนี้อย่างละเอียด
                  </p>
                </div>
                <span className="text-[11px] font-mono text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                  Tamper-proof Log
                </span>
              </div>

              <div className="space-y-2.5">
                {hospital.auditLogs.length > 0 ? (
                  hospital.auditLogs.map((log) => (
                    <div
                      key={log.id}
                      className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5 hover:bg-slate-100/80 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-teal-600"></span>
                          <span className="font-bold text-slate-900 text-xs">{log.action}</span>
                          <span className="text-[10px] font-semibold bg-slate-200 text-slate-700 px-2 py-0.2 rounded">
                            {log.editorRole}
                          </span>
                        </div>
                        <span className="text-[11px] font-mono text-slate-500 flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-400" />
                          <span>{log.timestamp}</span>
                        </span>
                      </div>

                      <div className="text-xs text-slate-700 bg-white p-2.5 rounded-lg border border-slate-200 font-medium">
                        {log.changesSummary}
                      </div>

                      <div className="text-[11px] text-slate-500 flex items-center gap-1 pt-0.5">
                        <UserCheck className="w-3.5 h-3.5 text-teal-700" />
                        <span>ผู้บันทึก: <strong>{log.editorName}</strong></span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-8 text-center text-slate-400 text-xs border border-dashed border-slate-200 rounded-lg">
                    ยังไม่มีประวัติการแก้ไขสำหรับโรงพยาบาลนี้
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 8: BANK GUARANTEE (BG) */}
          {activeTab === 'bg' && (
            <div className="space-y-4">
              {hospital.hasBankGuarantee && hospital.bankGuarantee ? (
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-4">
                  {/* Header of BG Card */}
                  <div className="flex items-start justify-between flex-wrap gap-2 border-b border-slate-200 pb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-amber-100 border border-amber-300 text-amber-800 flex items-center justify-center shrink-0">
                        <Landmark className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-slate-900 text-sm">
                            หนังสือค้ำประกันสัญญา (Bank Guarantee - BG)
                          </h4>
                          <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                            {hospital.bankGuarantee.status}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 mt-0.5">
                          ธนาคารผู้ออกค้ำประกัน: <strong className="text-slate-800">{hospital.bankGuarantee.bankName}</strong>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {canEditThisHospital && (
                        <button
                          onClick={() => {
                            onClose();
                            onEditHospital(hospital);
                          }}
                          className="px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-2xs"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>แก้ไข / เปลี่ยนไฟล์ BG</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Detailed Grid of Bank Guarantee */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    <div className="p-3 bg-white rounded-lg border border-slate-200">
                      <span className="text-[10px] text-slate-500 block uppercase font-medium">เลขที่หนังสือค้ำประกัน</span>
                      <div className="flex items-center justify-between mt-1">
                        <strong className="font-mono text-slate-900 text-sm">{hospital.bankGuarantee.bgNumber}</strong>
                        <button
                          onClick={() => handleCopy(hospital.bankGuarantee!.bgNumber, 'bgNumber')}
                          className="text-slate-400 hover:text-slate-700"
                        >
                          {copiedText === 'bgNumber' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                        </button>
                      </div>
                    </div>

                    <div className="p-3 bg-white rounded-lg border border-slate-200">
                      <span className="text-[10px] text-slate-500 block uppercase font-medium">
                        วงเงินค้ำประกัน ({hospital.bankGuarantee.guaranteePercent}%)
                      </span>
                      <strong className="font-mono text-amber-900 text-base font-bold mt-1 block">
                        {hospital.bankGuarantee.guaranteeAmount.toLocaleString()} บาท
                      </strong>
                    </div>

                    <div className="p-3 bg-white rounded-lg border border-slate-200">
                      <span className="text-[10px] text-slate-500 block uppercase font-medium">อ้างอิงหนังสือเชิญชวน / ประกวดราคา</span>
                      <strong className="text-slate-800 text-xs mt-1 block truncate" title={hospital.bankGuarantee.invitationDocNumber}>
                        {hospital.bankGuarantee.invitationDocNumber || 'ตามประกาศประกวดราคา'}
                      </strong>
                    </div>

                    <div className="p-3 bg-white rounded-lg border border-slate-200">
                      <span className="text-[10px] text-slate-500 block uppercase font-medium">วันที่ออกหนังสือค้ำประกัน</span>
                      <strong className="font-mono text-slate-800 text-xs mt-1 block">{hospital.bankGuarantee.issueDate}</strong>
                    </div>

                    <div className="p-3 bg-white rounded-lg border border-slate-200">
                      <span className="text-[10px] text-slate-500 block uppercase font-medium">วันสิ้นสุดการค้ำประกัน</span>
                      <strong className="font-mono text-rose-600 text-xs font-bold mt-1 block">{hospital.bankGuarantee.expiryDate}</strong>
                    </div>

                    <div className="p-3 bg-white rounded-lg border border-slate-200">
                      <span className="text-[10px] text-slate-500 block uppercase font-medium">วัตถุประสงค์ / หมายเหตุ</span>
                      <span className="text-slate-700 text-xs mt-1 block truncate" title={hospital.bankGuarantee.notes}>
                        {hospital.bankGuarantee.notes || 'ค้ำประกันการปฏิบัติตามสัญญาจ้าง'}
                      </span>
                    </div>
                  </div>

                  {/* Attached BG file download / preview */}
                  <div className="p-3.5 bg-amber-50/70 rounded-xl border border-amber-200 flex items-center justify-between flex-wrap gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-amber-200 text-amber-900 flex items-center justify-center font-bold">
                        <Paperclip className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 text-xs">
                          {hospital.bankGuarantee.fileName || `หนังสือค้ำประกัน_${hospital.bankGuarantee.bgNumber}.pdf`}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          ขนาด {hospital.bankGuarantee.fileSize || '1.4 MB'} • อัปโหลดเมื่อ {hospital.bankGuarantee.uploadedAt || '01 ต.ค. 2569'}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleCopy(`ดาวน์โหลดเอกสาร ${hospital.bankGuarantee?.fileName} เรียบร้อยแล้ว`, 'downloadBg')}
                      className="px-3.5 py-1.5 bg-amber-700 hover:bg-amber-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>{copiedText === 'downloadBg' ? 'ดาวน์โหลดแล้ว' : 'ดาวน์โหลดไฟล์ BG'}</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-8 bg-slate-50 rounded-xl border border-dashed border-slate-300 text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-slate-200 text-slate-500 mx-auto flex items-center justify-center">
                    <Landmark className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-bold text-slate-900 text-sm">
                      โรงพยาบาลนี้ยังไม่มีข้อมูลหนังสือค้ำประกันสัญญา (Bank Guarantee)
                    </h4>
                    <p className="text-xs text-slate-500 max-w-md mx-auto">
                      หากสัญญาของโรงพยาบาลนี้มีหนังสือเชิญชวน หรือเงื่อนไขให้วางหลักประกันสัญญา (5% ของมูลค่าสัญญา) ท่านสามารถเพิ่มข้อมูลและแนบไฟล์ได้
                    </p>
                  </div>
                  {canEditThisHospital && (
                    <button
                      onClick={() => {
                        onClose();
                        onEditHospital(hospital);
                      }}
                      className="px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white rounded-lg text-xs font-bold inline-flex items-center gap-1.5 shadow-xs transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>+ เพิ่มข้อมูลและแนบไฟล์ BG</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <button
              onClick={() => handlePrintDoc('แฟ้มประวัติสัญญา')}
              className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded hover:bg-slate-100 flex items-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>พิมพ์แฟ้มประวัติ รพ. (PDF)</span>
            </button>

            {canEditThisHospital && (
              <button
                onClick={() => {
                  onClose();
                  onEditHospital(hospital);
                }}
                className="px-3 py-1.5 text-xs font-semibold text-teal-800 bg-teal-50 border border-teal-300 rounded hover:bg-teal-100 flex items-center gap-1.5"
              >
                <Edit3 className="w-3.5 h-3.5 text-teal-700" />
                <span>แก้ไขข้อมูล</span>
              </button>
            )}

            <button
              onClick={() => onOpenDispatchAlert(hospital, 'CRITICAL')}
              className="px-3 py-1.5 text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-300 rounded hover:bg-rose-100 flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              <span>ส่งแจ้งเตือน AM</span>
            </button>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-white bg-slate-900 rounded hover:bg-slate-800"
          >
            ปิดหน้าต่าง
          </button>
        </div>
      </div>
    </div>
  );
};
