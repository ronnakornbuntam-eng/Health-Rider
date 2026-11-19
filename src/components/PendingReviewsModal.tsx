import React, { useState } from 'react';
import {
  CheckCircle2,
  XCircle,
  RotateCcw,
  Clock,
  ShieldCheck,
  AlertCircle,
  Building2,
  FileText,
  DollarSign,
  ChevronRight,
  Filter,
  Search,
  ArrowRight,
  Calendar,
  User,
  Paperclip,
  Check,
  X,
  MessageSquare
} from 'lucide-react';
import {
  PendingChangeRequest,
  RoleConfig,
  HospitalContract,
  AuditLogEntry
} from '../data/contractsData';

interface PendingReviewsModalProps {
  pendingRequests: PendingChangeRequest[];
  currentRole: RoleConfig;
  hospitals: HospitalContract[];
  onClose: () => void;
  onApproveRequest: (requestId: string, notes?: string) => void;
  onRejectRequest: (requestId: string, reason: string) => void;
  onRequestRevision: (requestId: string, instructions: string) => void;
}

export const PendingReviewsModal: React.FC<PendingReviewsModalProps> = ({
  pendingRequests,
  currentRole,
  hospitals,
  onClose,
  onApproveRequest,
  onRejectRequest,
  onRequestRevision,
}) => {
  const isCentral = currentRole.isCentralAdmin;

  // Selected request for side-by-side comparison view
  const [selectedReqId, setSelectedReqId] = useState<string>(() => {
    return pendingRequests[0]?.id || '';
  });

  const [filterRegion, setFilterRegion] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Action form state (notes / rejection reasons)
  const [actionModal, setActionModal] = useState<{
    type: 'approve' | 'reject' | 'revise';
    requestId: string;
    hospitalName: string;
  } | null>(null);

  const [actionNote, setActionNote] = useState<string>('');

  // Filter requests based on user role and filters
  const filteredRequests = pendingRequests.filter((req) => {
    // If not central admin, AM only sees their own region's requests
    if (!isCentral && !currentRole.allowedRegions.includes(req.region)) {
      return false;
    }
    if (filterRegion !== 'all' && req.region !== filterRegion) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchName = req.hospitalName.toLowerCase().includes(q);
      const matchCode = req.hcode.includes(q);
      const matchAm = req.proposerName.toLowerCase().includes(q);
      if (!matchName && !matchCode && !matchAm) return false;
    }
    return true;
  });

  const selectedReq = pendingRequests.find((r) => r.id === selectedReqId) || filteredRequests[0];

  // Look up existing database record for comparison
  const existingHospital = selectedReq
    ? hospitals.find((h) => h.id === selectedReq.hospitalId || h.hcode === selectedReq.hcode)
    : null;

  const handleExecuteAction = () => {
    if (!actionModal) return;

    if (actionModal.type === 'approve') {
      onApproveRequest(actionModal.requestId, actionNote);
    } else if (actionModal.type === 'reject') {
      onRejectRequest(actionModal.requestId, actionNote || 'ข้อมูลไม่ตรงกับมติส่วนกลาง');
    } else if (actionModal.type === 'revise') {
      onRequestRevision(actionModal.requestId, actionNote || 'กรุณาแนบเอกสารเพิ่มเติมหรือตรวจสอบตัวเลขใหม่');
    }

    setActionModal(null);
    setActionNote('');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full border border-slate-200 overflow-hidden my-3 animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[92vh]">
        
        {/* Top Header - Clean White Theme */}
        <div className="p-4 sm:p-5 bg-white border-b border-slate-200 text-slate-900 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center border border-amber-200">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-bold text-base sm:text-lg text-slate-900">
                  รายการรอตรวจสอบจากส่วนกลาง (Pending Central Review &amp; Approval)
                </h3>
                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">
                  {pendingRequests.filter((r) => r.status === 'pending').length} รายการรอพิจารณา
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {isCentral
                  ? 'เปรียบเทียบข้อมูลเดิมใน Database หลักกับข้อมูลที่ AM ภูมิภาคเสนอแก้ไข ตรวจสอบความถูกต้องและอนุมัติ'
                  : 'ติดตามสถานะคำขอเพิ่ม/แก้ไขสัญญาที่ AM เสนอเข้าระบบเพื่อรอส่วนกลางตรวจสอบ'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Workflow Explanation Banner */}
        <div className="bg-amber-50 border-b border-amber-200 p-3 px-5 text-xs text-amber-900 flex items-center justify-between flex-wrap gap-2 shrink-0">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-amber-700 shrink-0" />
            <span>
              <strong>หลักการกำกับวงเงิน:</strong> AM ภูมิภาค = ผู้เสนอข้อมูล → เข้าสู่รายการ "รอตรวจสอบ" → ส่วนกลางเปรียบเทียบ Database → อนุมัติ / ไม่อนุมัติ / ส่งกลับแก้ไข → อนุมัติแล้วจึง Update Database หลัก
            </span>
          </div>
          {!isCentral && (
            <span className="text-[11px] font-bold bg-white text-amber-800 px-2.5 py-0.5 rounded border border-amber-300">
              โหมด AM: แสดงข้อมูลเฉพาะคำขอในความรับผิดชอบ
            </span>
          )}
        </div>

        {/* Modal Main Content (2-Column: Request List + Detail Comparison) */}
        <div className="flex-1 overflow-hidden grid grid-cols-1 md:grid-cols-12">
          
          {/* Left Column: Request List */}
          <div className="md:col-span-4 border-r border-slate-200 flex flex-col bg-slate-50/70 overflow-hidden">
            {/* Filter controls */}
            <div className="p-3 border-b border-slate-200 space-y-2 bg-white shrink-0">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="ค้นหาชื่อ รพ. หรือ AM ผู้เสนอ..."
                  className="w-full pl-8 pr-2.5 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-md focus:outline-indigo-600 focus:bg-white"
                />
              </div>

              {isCentral && (
                <select
                  value={filterRegion}
                  onChange={(e) => setFilterRegion(e.target.value)}
                  className="w-full p-1.5 text-xs bg-slate-50 border border-slate-300 rounded-md"
                >
                  <option value="all">ทุกภูมิภาค</option>
                  <option value="ภาคกลาง">ภาคกลาง</option>
                  <option value="ภาคเหนือ">ภาคเหนือ</option>
                  <option value="ภาคตะวันออกเฉียงเหนือ">ภาคตะวันออกเฉียงเหนือ</option>
                  <option value="ภาคตะวันออก">ภาคตะวันออก</option>
                  <option value="ภาคตะวันตก">ภาคตะวันตก</option>
                  <option value="ภาคใต้">ภาคใต้</option>
                </select>
              )}
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto p-2 space-y-2">
              {filteredRequests.length > 0 ? (
                filteredRequests.map((req) => {
                  const isSelected = selectedReq?.id === req.id;
                  const isMonthly = req.proposedData.contractBillingType === 'monthly_billing';

                  return (
                    <div
                      key={req.id}
                      onClick={() => setSelectedReqId(req.id)}
                      className={`p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-white border-indigo-600 shadow-md ring-1 ring-indigo-500'
                          : 'bg-white border-slate-200 hover:border-slate-300 shadow-2xs'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-1.5 mb-1.5">
                        <span className="font-bold text-slate-900 line-clamp-1">
                          {req.hospitalName}
                        </span>
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold shrink-0 ${
                          req.status === 'pending'
                            ? 'bg-amber-100 text-amber-800 border border-amber-200'
                            : req.status === 'approved'
                            ? 'bg-emerald-100 text-emerald-800'
                            : req.status === 'rejected'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-orange-100 text-orange-800'
                        }`}>
                          {req.status === 'pending'
                            ? 'รอตรวจสอบ'
                            : req.status === 'approved'
                            ? 'อนุมัติแล้ว'
                            : req.status === 'rejected'
                            ? 'ไม่อนุมัติ'
                            : 'ส่งกลับแก้ไข'}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 text-[11px] text-slate-600 mb-1">
                        <span className="px-1.5 py-0.2 bg-slate-100 text-slate-700 font-mono rounded text-[10px]">
                          {req.hcode}
                        </span>
                        <span>•</span>
                        <span className="text-slate-500">{req.region}</span>
                      </div>

                      <div className="p-1.5 bg-slate-50 rounded border border-slate-100 text-[11px] text-slate-700 space-y-0.5">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500">ประเภทสัญญา:</span>
                          <span className="font-bold text-slate-800">
                            {isMonthly ? 'สัญญารายเดือน' : 'สัญญารายปี/มีวงเงิน'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500">วงเงินที่เสนอ:</span>
                          <span className="font-bold text-indigo-700 font-mono">
                            {isMonthly ? 'รายเดือน (ตาม Invoice)' : `${req.proposedData.totalBudget.toLocaleString()} บาท`}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-[10px] text-slate-400 mt-2 pt-1 border-t border-slate-100">
                        <span>โดย: {req.proposerName}</span>
                        <span>{req.submittedAt}</span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="p-6 text-center text-xs text-slate-400">
                  ไม่พบคำขอรอตรวจสอบตามเงื่อนไข
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Comparison Table & Review Actions */}
          <div className="md:col-span-8 flex flex-col overflow-y-auto p-4 sm:p-6 space-y-5 bg-white">
            {selectedReq ? (
              <>
                {/* Proposal Metadata Header */}
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-base font-bold text-slate-900">
                        {selectedReq.hospitalName}
                      </h4>
                      <span className="px-2 py-0.5 bg-teal-100 text-teal-800 font-mono rounded text-xs font-bold">
                        H-CODE: {selectedReq.hcode}
                      </span>
                      <span className="px-2 py-0.5 bg-indigo-100 text-indigo-800 rounded text-xs font-semibold">
                        {selectedReq.region}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1 flex items-center gap-2">
                      <span>ผู้เสนอข้อมูล: <strong className="text-slate-800">{selectedReq.proposerName}</strong> ({selectedReq.proposerEmail})</span>
                      <span>•</span>
                      <span>ยื่นเมื่อ: {selectedReq.submittedAt}</span>
                    </p>
                  </div>

                  <div className="shrink-0 flex items-center gap-2">
                    <span className="text-xs text-slate-500">สถานะคำขอ:</span>
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{selectedReq.status === 'pending' ? 'รอตรวจสอบจากส่วนกลาง' : selectedReq.status}</span>
                    </span>
                  </div>
                </div>

                {/* Reason / Review Notes from AM */}
                {selectedReq.reviewNotes && (
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-900 flex items-start gap-2.5">
                    <MessageSquare className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className="block font-bold mb-0.5">เหตุผลและบันทึกข้อความจาก AM:</strong>
                      <p className="leading-relaxed text-blue-800">{selectedReq.reviewNotes}</p>
                    </div>
                  </div>
                )}

                {/* Side-by-Side Comparison Table (User Requirement Spec) */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h5 className="font-bold text-xs uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                      <Building2 className="w-4 h-4 text-indigo-700" />
                      <span>ตารางเปรียบเทียบข้อมูลเดิมจากส่วนกลาง กับ ข้อมูลที่ AM เสนอแก้ไข</span>
                    </h5>
                    <span className="text-[11px] text-slate-500">
                      ไฮไลต์สีฟ้า = ข้อมูลที่มีการเปลี่ยนแปลง
                    </span>
                  </div>

                  <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
                    <table className="w-full text-xs text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                          <th className="py-2.5 px-3 w-1/3">รายการ</th>
                          <th className="py-2.5 px-3 w-1/3 bg-slate-50 text-slate-600">
                            ข้อมูลเดิมจากส่วนกลาง (Database เดิม)
                          </th>
                          <th className="py-2.5 px-3 w-1/3 bg-indigo-50 text-indigo-900">
                            ข้อมูลที่ AM เสนอแก้ไข (Proposed)
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {/* 1. ประเภทสัญญา */}
                        {(() => {
                          const oldType = existingHospital?.contractBillingType === 'monthly_billing' 
                            ? 'สัญญารายเดือน' 
                            : 'สัญญารายปี / มีวงเงิน';
                          const newType = selectedReq.proposedData.contractBillingType === 'monthly_billing'
                            ? 'สัญญารายเดือน'
                            : 'สัญญารายปี / มีวงเงิน';
                          const isDiff = oldType !== newType;
                          return (
                            <tr className={isDiff ? 'bg-indigo-50/40' : ''}>
                              <td className="py-2.5 px-3 font-semibold text-slate-800">
                                รูปแบบสัญญา (Billing Type)
                              </td>
                              <td className="py-2.5 px-3 font-medium text-slate-600">
                                {oldType}
                              </td>
                              <td className="py-2.5 px-3 font-bold text-indigo-900">
                                {newType}
                                {isDiff && <span className="ml-1.5 text-[10px] bg-indigo-200 text-indigo-800 px-1.5 py-0.2 rounded font-normal">เปลี่ยนรูปแบบ</span>}
                              </td>
                            </tr>
                          );
                        })()}

                        {/* 2. เลขที่สัญญา */}
                        {(() => {
                          const oldVal = existingHospital?.contractNumber || selectedReq.originalData?.contractNumber || '-';
                          const newVal = selectedReq.proposedData.contractNumber;
                          const isDiff = oldVal !== newVal;
                          return (
                            <tr className={isDiff ? 'bg-indigo-50/40' : ''}>
                              <td className="py-2.5 px-3 font-semibold text-slate-800">เลขที่สัญญา</td>
                              <td className="py-2.5 px-3 font-mono text-slate-600">{oldVal}</td>
                              <td className="py-2.5 px-3 font-mono font-bold text-indigo-900">
                                {newVal}
                                {isDiff && <span className="ml-1.5 text-[10px] bg-amber-100 text-amber-800 px-1 rounded font-normal">แก้ไข</span>}
                              </td>
                            </tr>
                          );
                        })()}

                        {/* 3. วันที่เริ่มสัญญา */}
                        {(() => {
                          const oldVal = existingHospital?.contractStartDate || selectedReq.originalData?.contractStartDate || '-';
                          const newVal = selectedReq.proposedData.contractStartDate;
                          const isDiff = oldVal !== newVal;
                          return (
                            <tr className={isDiff ? 'bg-indigo-50/40' : ''}>
                              <td className="py-2.5 px-3 font-semibold text-slate-800">วันที่เริ่มสัญญา</td>
                              <td className="py-2.5 px-3 font-mono text-slate-600">{oldVal}</td>
                              <td className="py-2.5 px-3 font-mono font-bold text-indigo-900">{newVal}</td>
                            </tr>
                          );
                        })()}

                        {/* 4. วันที่สิ้นสุดสัญญา */}
                        {(() => {
                          const oldVal = existingHospital?.contractExpiryDate || selectedReq.originalData?.contractExpiryDate || '-';
                          const newVal = selectedReq.proposedData.contractExpiryDate;
                          const isDiff = oldVal !== newVal;
                          return (
                            <tr className={isDiff ? 'bg-indigo-50/40' : ''}>
                              <td className="py-2.5 px-3 font-semibold text-slate-800">วันที่สิ้นสุดสัญญา</td>
                              <td className="py-2.5 px-3 font-mono text-slate-600">{oldVal}</td>
                              <td className="py-2.5 px-3 font-mono font-bold text-indigo-900">{newVal}</td>
                            </tr>
                          );
                        })()}

                        {/* 5. ระยะเวลาสัญญา */}
                        {(() => {
                          const oldVal = existingHospital?.contractDuration || selectedReq.originalData?.contractDuration || '-';
                          const newVal = selectedReq.proposedData.contractDuration;
                          return (
                            <tr>
                              <td className="py-2.5 px-3 font-semibold text-slate-800">ระยะเวลาสัญญา</td>
                              <td className="py-2.5 px-3 text-slate-600">{oldVal}</td>
                              <td className="py-2.5 px-3 font-bold text-indigo-900">{newVal}</td>
                            </tr>
                          );
                        })()}

                        {/* 6. วงเงินสัญญา (KEY CONTROL FIELD) */}
                        {(() => {
                          const isMonthly = selectedReq.proposedData.contractBillingType === 'monthly_billing';
                          const oldBudget = existingHospital?.totalBudget ?? selectedReq.originalData?.totalBudget ?? 0;
                          const newBudget = selectedReq.proposedData.totalBudget;
                          const isDiff = !isMonthly && oldBudget !== newBudget;

                          return (
                            <tr className="bg-amber-50/60 font-semibold border-y-2 border-amber-300">
                              <td className="py-3 px-3 text-slate-900 flex items-center gap-1.5">
                                <DollarSign className="w-4 h-4 text-amber-700" />
                                <span>วงเงินสัญญา (Budget)</span>
                              </td>
                              <td className="py-3 px-3 font-mono text-slate-700">
                                {existingHospital?.contractBillingType === 'monthly_billing' 
                                  ? 'รายเดือน (ไม่ต้องกรอกวงเงิน)' 
                                  : `${oldBudget.toLocaleString()} บาท`}
                              </td>
                              <td className="py-3 px-3 font-mono font-extrabold text-indigo-950">
                                {isMonthly ? (
                                  <span className="text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded text-xs">
                                    รายเดือน (ไม่คำนวณวงเงิน / เก็บตาม Invoice)
                                  </span>
                                ) : (
                                  <span className="text-base text-teal-800">
                                    {newBudget.toLocaleString()} บาท
                                    {isDiff && (
                                      <span className="ml-2 text-xs font-normal text-rose-700 bg-rose-100 px-1.5 py-0.5 rounded">
                                        ส่วนต่าง: {(newBudget - oldBudget > 0 ? '+' : '') + (newBudget - oldBudget).toLocaleString()} ฿
                                      </span>
                                    )}
                                  </span>
                                )}
                              </td>
                            </tr>
                          );
                        })()}

                        {/* 7. เลขที่ใบสั่งจ้าง PO */}
                        {(() => {
                          const oldVal = existingHospital?.documents.po.docNumber || '-';
                          const newVal = selectedReq.proposedData.documents.po.docNumber;
                          const isDiff = oldVal !== newVal;
                          return (
                            <tr className={isDiff ? 'bg-indigo-50/40' : ''}>
                              <td className="py-2.5 px-3 font-semibold text-slate-800">เลขที่ใบสั่งจ้าง (PO / Work Order)</td>
                              <td className="py-2.5 px-3 font-mono text-slate-600">{oldVal}</td>
                              <td className="py-2.5 px-3 font-mono font-bold text-indigo-900">{newVal}</td>
                            </tr>
                          );
                        })()}

                        {/* 8. ที่อยู่โรงพยาบาล */}
                        {(() => {
                          const oldVal = existingHospital?.address.fullAddress || '-';
                          const newVal = selectedReq.proposedData.address.fullAddress;
                          const isDiff = oldVal !== newVal;
                          return (
                            <tr className={isDiff ? 'bg-indigo-50/40' : ''}>
                              <td className="py-2.5 px-3 font-semibold text-slate-800">ที่อยู่โรงพยาบาล</td>
                              <td className="py-2.5 px-3 text-slate-600">{oldVal}</td>
                              <td className="py-2.5 px-3 font-semibold text-indigo-900">{newVal}</td>
                            </tr>
                          );
                        })()}

                        {/* 9. ผู้เสนอแก้ไข */}
                        <tr>
                          <td className="py-2.5 px-3 font-semibold text-slate-800">ผู้เสนอแก้ไข</td>
                          <td className="py-2.5 px-3 text-slate-400">-</td>
                          <td className="py-2.5 px-3 font-bold text-slate-900">
                            {selectedReq.proposerName} ({selectedReq.region})
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Attached files in this proposal */}
                <div className="space-y-2">
                  <h5 className="font-bold text-xs uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                    <Paperclip className="w-4 h-4 text-slate-600" />
                    <span>เอกสารประกอบสัญญาที่แนบมา (PDF / PNG เท่านั้น)</span>
                  </h5>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {selectedReq.proposedData.attachedFiles.map((file) => (
                      <div
                        key={file.id}
                        className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2">
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-100 text-rose-800">
                            PDF
                          </span>
                          <div>
                            <div className="font-semibold text-slate-800">{file.name}</div>
                            <div className="text-[10px] text-slate-500">
                              {file.category} • {file.fileSize} • โดย {file.uploadedBy}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action Buttons for Central Admin (Approve / Reject / Send back for Revision) */}
                {isCentral && selectedReq.status === 'pending' && (
                  <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50 p-4 rounded-xl">
                    <div className="text-xs text-slate-600 flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-indigo-700" />
                      <span>สิทธิ์ส่วนกลาง: เลือกอนุมัติเพื่ออัปเดต Database หลักทันที หรือส่งกลับให้ AM</span>
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                      {/* Button: ส่งกลับให้แก้ไข */}
                      <button
                        onClick={() =>
                          setActionModal({
                            type: 'revise',
                            requestId: selectedReq.id,
                            hospitalName: selectedReq.hospitalName,
                          })
                        }
                        className="px-3.5 py-2 text-xs font-semibold text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-300 rounded-lg active:scale-95 transition-all flex items-center gap-1.5 shadow-2xs"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>ส่งกลับให้แก้ไข</span>
                      </button>

                      {/* Button: ไม่อนุมัติ */}
                      <button
                        onClick={() =>
                          setActionModal({
                            type: 'reject',
                            requestId: selectedReq.id,
                            hospitalName: selectedReq.hospitalName,
                          })
                        }
                        className="px-3.5 py-2 text-xs font-semibold text-rose-800 bg-rose-50 hover:bg-rose-100 border border-rose-300 rounded-lg active:scale-95 transition-all flex items-center gap-1.5 shadow-2xs"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>ไม่อนุมัติ (คงข้อมูลเดิม)</span>
                      </button>

                      {/* Button: อนุมัติ */}
                      <button
                        onClick={() =>
                          setActionModal({
                            type: 'approve',
                            requestId: selectedReq.id,
                            hospitalName: selectedReq.hospitalName,
                          })
                        }
                        className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:scale-95 transition-all rounded-lg shadow-sm flex items-center gap-1.5"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>อนุมัติ &amp; Update Database หลัก</span>
                      </button>
                    </div>
                  </div>
                )}

                {!isCentral && (
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-600 flex items-center justify-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-slate-500 shrink-0" />
                    <span>การอนุมัติข้อมูลสัญญาและวงเงินสงวนสิทธิ์เฉพาะทีมส่วนกลาง (Admin ส่วนกลาง) เท่านั้นเพื่อความปลอดภัยของระบบ</span>
                  </div>
                )}
              </>
            ) : (
              <div className="p-12 text-center text-slate-400 text-xs">
                กรุณาเลือกคำขอจากรายการด้านซ้ายเพื่อดูตารางเปรียบเทียบ
              </div>
            )}
          </div>
        </div>

        {/* Action Confirmation Modal (Approve / Reject / Revise) */}
        {actionModal && (
          <div className="fixed inset-0 z-60 bg-black/50 backdrop-blur-2xs flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-5 border border-slate-200 animate-in fade-in zoom-in-95 duration-150 space-y-4">
              <div className="flex items-center justify-between border-b pb-2">
                <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  {actionModal.type === 'approve' && <CheckCircle2 className="w-5 h-5 text-emerald-600" />}
                  {actionModal.type === 'reject' && <XCircle className="w-5 h-5 text-rose-600" />}
                  {actionModal.type === 'revise' && <RotateCcw className="w-5 h-5 text-amber-600" />}
                  <span>
                    {actionModal.type === 'approve' && 'ยืนยันการอนุมัติคำขอ'}
                    {actionModal.type === 'reject' && 'ยืนยันการปฏิเสธคำขอ (ไม่อนุมัติ)'}
                    {actionModal.type === 'revise' && 'ส่งกลับให้ AM ภูมิภาคแก้ไข'}
                  </span>
                </h4>
                <button onClick={() => setActionModal(null)} className="text-slate-400 hover:text-slate-600">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="text-xs text-slate-600 space-y-1">
                <p>
                  โรงพยาบาล: <strong>{actionModal.hospitalName}</strong>
                </p>
                <p>
                  {actionModal.type === 'approve' &&
                    'ระบบจะนำข้อมูลที่ AM เสนอไปอัปเดตลงใน Database หลักทันที พร้อมบันทึกประวัติ Audit Log'}
                  {actionModal.type === 'reject' &&
                    'ระบบจะคงข้อมูลเดิมใน Database หลักไว้ และบันทึกเหตุผลการไม่อนุมัติ'}
                  {actionModal.type === 'revise' &&
                    'ระบบจะส่งคำขอนี้กลับไปยัง AM ภูมิภาคเพื่อให้ปรับปรุงข้อมูลและเอกสารใหม่'}
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {actionModal.type === 'approve' ? 'บันทึกเพิ่มเติม (ไม่บังคับ):' : 'ระบุเหตุผล / คำแนะนำการแก้ไข (บังคับ):'}
                </label>
                <textarea
                  rows={3}
                  value={actionNote}
                  onChange={(e) => setActionNote(e.target.value)}
                  placeholder={
                    actionModal.type === 'approve'
                      ? 'เช่น อนุมัติการขยายวงเงินตามเอกสาร TOR ฉบับแก้ไข'
                      : actionModal.type === 'reject'
                      ? 'เช่น งบประมาณเกินกรอบนโยบาย หรือเอกสารแนบไม่ครบถ้วน'
                      : 'เช่น กรุณาแนบใบเสนอราคาฉบับลงนาม และปรับลดวงเงินให้อยู่ในกรอบ'
                  }
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-md text-xs focus:outline-indigo-600 focus:bg-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setActionModal(null)}
                  className="px-3 py-1.5 text-xs text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-md"
                >
                  ยกเลิก
                </button>
                <button
                  type="button"
                  onClick={handleExecuteAction}
                  className={`px-4 py-1.5 text-xs font-bold text-white rounded-md shadow-xs active:scale-95 transition-all ${
                    actionModal.type === 'approve'
                      ? 'bg-emerald-600 hover:bg-emerald-700'
                      : actionModal.type === 'reject'
                      ? 'bg-rose-600 hover:bg-rose-700'
                      : 'bg-amber-600 hover:bg-amber-700'
                  }`}
                >
                  ยืนยันดำเนินการ
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
