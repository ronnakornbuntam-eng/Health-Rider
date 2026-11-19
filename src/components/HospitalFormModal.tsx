import React, { useState } from 'react';
import { 
  X, 
  Building2, 
  FileText, 
  MapPin, 
  DollarSign, 
  Calendar, 
  Lock, 
  ShieldCheck, 
  Upload, 
  Trash2, 
  Check, 
  AlertCircle,
  Clock,
  Send,
  Info,
  Landmark,
  Paperclip
} from 'lucide-react';
import { 
  HospitalContract, 
  RoleConfig, 
  AuditLogEntry, 
  AttachedFileItem,
  PendingChangeRequest,
  BankGuaranteeInfo
} from '../data/contractsData';

interface HospitalFormModalProps {
  hospital: HospitalContract | null; // null means adding a new hospital
  currentRole: RoleConfig;
  onClose: () => void;
  onSaveDirect: (savedHospital: HospitalContract, auditEntry: AuditLogEntry) => void;
  onSubmitPendingReview: (changeRequest: PendingChangeRequest) => void;
}

export const HospitalFormModal: React.FC<HospitalFormModalProps> = ({
  hospital,
  currentRole,
  onClose,
  onSaveDirect,
  onSubmitPendingReview,
}) => {
  const isEditing = !!hospital;
  const isCentral = currentRole.isCentralAdmin;

  // Form Fields State matching user requirements
  const [name, setName] = useState<string>(hospital?.name || '');
  const [hcode, setHcode] = useState<string>(hospital?.hcode || '10999');
  const [hospitalType, setHospitalType] = useState<HospitalContract['hospitalType']>(
    hospital?.hospitalType || 'รพ.ชุมชน (M2/F)'
  );
  const [contractCategory, setContractCategory] = useState<string>(
    hospital?.contractCategory?.replace('Health Rider ', '') || 'สัญญาจ้างบริการจัดส่งยาถึงบ้าน (สัญญารายปี)'
  );

  // Contract Billing Type: 1. สัญญารายปี / มีวงเงิน vs 2. สัญญารายเดือน
  const [contractBillingType, setContractBillingType] = useState<'annual_budget' | 'monthly_billing'>(
    hospital?.contractBillingType || 'annual_budget'
  );

  const [contractNumber, setContractNumber] = useState<string>(hospital?.contractNumber || 'CNT-2568-001');
  const [contractStartDate, setContractStartDate] = useState<string>(hospital?.contractStartDate || '2026-10-01');
  const [contractExpiryDate, setContractExpiryDate] = useState<string>(hospital?.contractExpiryDate || '2027-09-30');
  const [contractDuration, setContractDuration] = useState<string>(hospital?.contractDuration || '12 เดือน (365 วัน)');
  
  // PO & QT
  const [poNumber, setPoNumber] = useState<string>(hospital?.documents.po.docNumber || 'PO-2568-001');
  const [qtNumber, setQtNumber] = useState<string>(hospital?.documents.qt.docNumber || 'QT-2568-001');

  // Bank Guarantee (BG / หนังสือค้ำประกันสัญญา - User requirement)
  const [hasBankGuarantee, setHasBankGuarantee] = useState<boolean>(hospital?.hasBankGuarantee || false);
  const [bgBankName, setBgBankName] = useState<string>(
    hospital?.bankGuarantee?.bankName || 'ธนาคารกรุงไทย จำกัด (มหาชน)'
  );
  const [bgNumber, setBgNumber] = useState<string>(
    hospital?.bankGuarantee?.bgNumber || (hospital ? `BG-KTB-2569-${hospital.hcode}` : 'BG-KTB-2569-001')
  );
  const [bgInvitationDocNumber, setBgInvitationDocNumber] = useState<string>(
    hospital?.bankGuarantee?.invitationDocNumber || 'สธ 0207/ว 2569'
  );
  const [bgGuaranteeAmount, setBgGuaranteeAmount] = useState<number>(() => {
    if (hospital?.bankGuarantee?.guaranteeAmount) return hospital.bankGuarantee.guaranteeAmount;
    const initialBudget = hospital?.totalBudget || 500000;
    return Math.round(initialBudget * 0.05);
  });
  const [bgGuaranteePercent, setBgGuaranteePercent] = useState<number>(
    hospital?.bankGuarantee?.guaranteePercent || 5
  );
  const [bgIssueDate, setBgIssueDate] = useState<string>(
    hospital?.bankGuarantee?.issueDate || hospital?.contractStartDate || '2026-10-01'
  );
  const [bgExpiryDate, setBgExpiryDate] = useState<string>(
    hospital?.bankGuarantee?.expiryDate || hospital?.contractExpiryDate || '2027-10-31'
  );
  const [bgStatus, setBgStatus] = useState<BankGuaranteeInfo['status']>(
    hospital?.bankGuarantee?.status || 'ค้ำประกันอยู่ (Active)'
  );
  const [bgFileName, setBgFileName] = useState<string>(
    hospital?.bankGuarantee?.fileName || ''
  );
  const [bgFileSize, setBgFileSize] = useState<string>(
    hospital?.bankGuarantee?.fileSize || '1.4 MB'
  );
  const [bgNotes, setBgNotes] = useState<string>(
    hospital?.bankGuarantee?.notes || 'หนังสือค้ำประกันสัญญา 5% ตามประกาศเชิญชวนของโรงพยาบาล'
  );

  // Address
  const [fullAddress, setFullAddress] = useState<string>(
    hospital?.address.fullAddress || '123 หมู่ 1 ตำบลในเมือง อำเภอเมือง'
  );
  const [subdistrict, setSubdistrict] = useState<string>(hospital?.address.subdistrict || 'ตำบลในเมือง');
  const [district, setDistrict] = useState<string>(hospital?.address.district || 'อำเภอเมือง');
  const [province, setProvince] = useState<string>(hospital?.province || (currentRole.allowedRegions[0] === 'ภาคเหนือ' ? 'จ.เชียงใหม่' : 'จ.กรุงเทพมหานคร'));
  const [postalCode, setPostalCode] = useState<string>(hospital?.address.postalCode || '10100');
  const [region, setRegion] = useState<HospitalContract['region']>(
    hospital?.region || (currentRole.allowedRegions[0] as HospitalContract['region']) || 'ภาคกลาง'
  );

  // Budget
  // In annual_budget: must specify budget amount
  // In monthly_billing: disabled / 0 / not required
  const [totalBudget, setTotalBudget] = useState<number>(() => {
    if (hospital?.contractBillingType === 'monthly_billing') return 0;
    return hospital?.totalBudget || 500000;
  });

  const [poAmount, setPoAmount] = useState<number>(() => {
    if (hospital?.contractBillingType === 'monthly_billing') return 0;
    return hospital?.poAmount || 500000;
  });

  // Proposal note (for AM proposing to central)
  const [proposalReason, setProposalReason] = useState<string>('');

  // Status
  const [contractStatus, setContractStatus] = useState<HospitalContract['contractStatus']>(
    hospital?.contractStatus || 'มีผลบังคับใช้ (Active)'
  );

  // Coordinator & AM
  const [hospitalPhone, setHospitalPhone] = useState<string>(hospital?.hospitalPhone || '02-123-4567');
  const [hospitalDirector, setHospitalDirector] = useState<string>(hospital?.hospitalDirector || 'นพ. ผู้อำนวยการโรงพยาบาล');
  const [hospitalCoordinator, setHospitalCoordinator] = useState<string>(hospital?.hospitalCoordinator || 'ภญ. หัวหน้ากลุ่มงานเภสัชกรรม');
  const [amName, setAmName] = useState<string>(hospital?.amName || currentRole.amName || 'ผู้ดูแลส่วนกลาง');

  // Attached files (PDF or PNG only)
  const [attachedFiles, setAttachedFiles] = useState<AttachedFileItem[]>(
    hospital?.attachedFiles || [
      {
        id: 'f-1',
        name: 'สัญญาจ้าง_แนบท้าย.pdf',
        category: 'สัญญาหลัก',
        fileSize: '2.4 MB',
        uploadDate: '2026-10-05 09:00',
        uploadedBy: currentRole.name,
      },
    ]
  );
  const [newFileName, setNewFileName] = useState<string>('');
  const [newFileCategory, setNewFileCategory] = useState<AttachedFileItem['category']>('ใบสั่งจ้าง PO');

  // Error validation
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);

  // Auto calculate contract duration when dates change
  const handleStartDateChange = (val: string) => {
    setContractStartDate(val);
    calculateDuration(val, contractExpiryDate);
  };

  const handleExpiryDateChange = (val: string) => {
    setContractExpiryDate(val);
    calculateDuration(contractStartDate, val);
  };

  const calculateDuration = (start: string, end: string) => {
    if (!start || !end) return;
    const s = new Date(start);
    const e = new Date(end);
    const diffTime = e.getTime() - s.getTime();
    if (diffTime > 0) {
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      const diffMonths = Math.round(diffDays / 30.4);
      setContractDuration(`${diffMonths} เดือน (${diffDays} วัน)`);
    }
  };

  const validateFileExtension = (filename: string): boolean => {
    const lower = filename.toLowerCase();
    return lower.endsWith('.pdf') || lower.endsWith('.png');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, category: AttachedFileItem['category']) => {
    setFileError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    if (!validateFileExtension(file.name)) {
      setFileError(`ปฏิเสธไฟล์ "${file.name}": บังคับอัปโหลดเฉพาะไฟล์นามสกุล .PDF หรือ .PNG เท่านั้น`);
      return;
    }

    const sizeStr = file.size > 1024 * 1024 
      ? `${(file.size / (1024 * 1024)).toFixed(1)} MB` 
      : `${Math.round(file.size / 1024)} KB`;

    const now = new Date();
    const thaiMonths = [
      'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
      'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'
    ];
    const uploadTimeStr = `${now.getDate()} ${thaiMonths[now.getMonth()]} ${now.getFullYear() + 543} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')} น.`;

    const newFile: AttachedFileItem = {
      id: `file-${Date.now()}`,
      name: file.name,
      category,
      fileSize: sizeStr,
      uploadDate: uploadTimeStr,
      uploadedBy: currentRole.amName || currentRole.name,
    };

    setAttachedFiles((prev) => [newFile, ...prev]);
    e.target.value = ''; // Reset input
  };

  const handleAddFile = () => {
    setFileError(null);
    if (!newFileName.trim()) return;

    let finalName = newFileName.trim();
    if (!finalName.toLowerCase().endsWith('.pdf') && !finalName.toLowerCase().endsWith('.png')) {
      if (finalName.includes('.')) {
        setFileError(`ปฏิเสธไฟล์: นามสกุลไฟล์ไม่ถูกต้อง บังคับเฉพาะ .PDF หรือ .PNG เท่านั้น`);
        return;
      }
      finalName = `${finalName}.pdf`;
    }

    const now = new Date();
    const thaiMonths = [
      'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
      'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'
    ];
    const uploadTimeStr = `${now.getDate()} ${thaiMonths[now.getMonth()]} ${now.getFullYear() + 543} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')} น.`;

    const newFile: AttachedFileItem = {
      id: `file-${Date.now()}`,
      name: finalName,
      category: newFileCategory,
      fileSize: '1.8 MB',
      uploadDate: uploadTimeStr,
      uploadedBy: currentRole.amName || currentRole.name,
    };
    setAttachedFiles([newFile, ...attachedFiles]);
    setNewFileName('');
  };

  const handleRemoveFile = (id: string) => {
    setAttachedFiles(attachedFiles.filter((f) => f.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!name.trim()) {
      setErrorMsg('กรุณากรอกชื่อโรงพยาบาล');
      return;
    }

    // Check regional boundary for AM
    if (!isCentral && !currentRole.allowedRegions.includes(region)) {
      setErrorMsg(`คุณไม่มีสิทธิ์จัดการข้อมูลในภูมิภาค ${region} (จำกัดเฉพาะ ${currentRole.allowedRegions.join(', ')})`);
      return;
    }

    // Condition for contractBillingType
    if (contractBillingType === 'annual_budget' && (!totalBudget || totalBudget <= 0)) {
      setErrorMsg('สัญญารายปี/มีวงเงิน: บังคับกรอกวงเงินตามสัญญาก่อนส่งข้อมูล');
      return;
    }

    const now = new Date();
    const thaiMonths = [
      'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
      'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'
    ];
    const timestampStr = `${now.getDate()} ${thaiMonths[now.getMonth()]} ${now.getFullYear() + 543} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')} น.`;

    const effectiveTotalBudget = contractBillingType === 'monthly_billing' ? 0 : totalBudget;
    const effectivePoAmount = contractBillingType === 'monthly_billing' ? 0 : (poAmount || totalBudget);

    // Construct the payload object
    const finalHospitalData: HospitalContract = {
      id: hospital?.id || `hosp-${Date.now()}`,
      hcode: isCentral ? hcode : hospital?.hcode || '10999',
      cusCode: hospital?.cusCode || `CUS-${hcode}`,
      contractNumber,
      name,
      hospitalType,
      contractCategory,
      contractBillingType,
      contractStartDate,
      contractExpiryDate,
      contractDuration,
      daysUntilExpiry: Math.max(1, Math.ceil((new Date(contractExpiryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))),
      contractStatus,
      province,
      region,
      address: {
        fullAddress,
        subdistrict,
        district,
        province,
        postalCode,
      },
      hospitalPhone,
      hospitalDirector,
      hospitalCoordinator,
      totalBudget: effectiveTotalBudget,
      spentBudget: hospital?.spentBudget || 0,
      remainingBudget: contractBillingType === 'monthly_billing' ? 0 : effectiveTotalBudget - (hospital?.spentBudget || 0),
      spentPercent: contractBillingType === 'monthly_billing' ? 0 : (hospital?.spentPercent || 0),
      poAmount: effectivePoAmount,
      dailyBurnRate: hospital?.dailyBurnRate || 3500,
      estimatedRunoutDays: hospital?.estimatedRunoutDays || 60,
      amName: isCentral ? amName : currentRole.amName || amName,
      amPhone: hospital?.amPhone || '081-000-0000',
      amEmail: hospital?.amEmail || 'am@company.com',
      statusRisk: hospital?.statusRisk || 'normal',
      legalStatus: hospital?.legalStatus || 'ปกติ (สมบูรณ์)',
      stampDutyStatus: hospital?.stampDutyStatus || 'ชำระ e-Stamp แล้ว',
      monthlyTransactions: hospital?.monthlyTransactions || 500,
      lastUpdated: isCentral ? 'เมื่อสักครู่' : 'รอตรวจสอบจากส่วนกลาง',
      documents: {
        qt: {
          docNumber: qtNumber,
          date: hospital?.documents.qt.date || contractStartDate,
          amount: effectivePoAmount,
          title: `ใบเสนอราคาบริการจัดส่งยาถึงบ้าน - ${name}`,
          status: 'อนุมัติแล้ว',
          approvedBy: hospitalDirector,
          itemsCount: hospital?.documents.qt.itemsCount || 20000,
          unitPricePerTrip: 50,
        },
        po: {
          docNumber: poNumber,
          date: hospital?.documents.po.date || contractStartDate,
          amount: effectivePoAmount,
          title: `ใบสั่งจ้างบริการส่งยาถึงบ้านผู้ป่วย - ${name}`,
          status: 'ออกใบสั่งซื้อแล้ว',
          disbursementPeriod: contractBillingType === 'monthly_billing' ? 'เบิกจ่ายรายเดือนตามใบแจ้งหนี้จริง (Invoice)' : (hospital?.documents.po.disbursementPeriod || 'เบิกจ่ายรายเดือน'),
          paymentTerms: hospital?.documents.po.paymentTerms || 'เครดิตเทอม 30 วัน',
        },
        tor: hospital?.documents.tor || {
          docNumber: `TOR-${contractNumber}`,
          version: 'ฉบับสมบูรณ์',
          effectiveDate: contractStartDate,
          scopeSummary: 'บริการขนส่งยาและเวชภัณฑ์ผู้ป่วยถึงบ้านในพื้นที่รับผิดชอบ',
          serviceRadiusKm: 30,
          slaHours: 4,
          penaltyPerLateHour: 50,
        },
        contractAgreement: {
          contractNumber,
          signedDate: contractStartDate,
          effectiveStartDate: contractStartDate,
          effectiveEndDate: contractExpiryDate,
          stampDutyNumber: hospital?.documents.contractAgreement.stampDutyNumber || 'ESM-2568-AUTO',
        },
      },
      attachedFiles,
      hasBankGuarantee,
      bankGuarantee: hasBankGuarantee ? {
        bgNumber: bgNumber.trim() || `BG-KTB-2569-${hcode}`,
        bankName: bgBankName,
        guaranteeAmount: bgGuaranteeAmount,
        guaranteePercent: bgGuaranteePercent,
        invitationDocNumber: bgInvitationDocNumber.trim() || undefined,
        issueDate: bgIssueDate || contractStartDate,
        expiryDate: bgExpiryDate || contractExpiryDate,
        status: bgStatus,
        fileName: bgFileName.trim() || `หนังสือค้ำประกันสัญญา_${bgBankName.split(' ')[0]}_${contractNumber}.pdf`,
        fileSize: bgFileSize || '1.4 MB',
        uploadedAt: timestampStr,
        uploadedBy: currentRole.amName || currentRole.name,
        notes: bgNotes.trim() || 'หนังสือค้ำประกันสัญญาตามประกาศเชิญชวนของหน่วยงาน'
      } : undefined,
      monthlyBillings: hospital?.monthlyBillings || [],
      auditLogs: hospital?.auditLogs || [],
    };

    if (isCentral) {
      // Direct update for Central Admin
      const auditEntry: AuditLogEntry = {
        id: `audit-${Date.now()}`,
        timestamp: timestampStr,
        editorName: currentRole.name,
        editorRole: currentRole.name,
        action: !isEditing ? 'เพิ่มโรงพยาบาลใหม่' : 'อนุมัติวงเงินโดยส่วนกลาง',
        changesSummary: !isEditing 
          ? `ส่วนกลางเพิ่มข้อมูล รพ. ${name} (${region}) วงเงิน ${contractBillingType === 'monthly_billing' ? 'รายเดือน' : effectiveTotalBudget.toLocaleString() + ' บาท'}`
          : `ส่วนกลางอนุมัติ/ปรับปรุงข้อมูล รพ. ${name} เลขที่สัญญา ${contractNumber}`,
      };
      finalHospitalData.auditLogs = [auditEntry, ...(hospital?.auditLogs || [])];
      onSaveDirect(finalHospitalData, auditEntry);
    } else {
      // REGIONAL AM WORKFLOW:
      // Data cannot update main database directly! Must go into "Pending Central Review"
      const changeRequest: PendingChangeRequest = {
        id: `req-${Date.now()}`,
        hospitalId: hospital?.id || `hosp-temp-${Date.now()}`,
        hospitalName: name,
        hcode: hospital?.hcode || hcode,
        region,
        proposerName: currentRole.amName || currentRole.name,
        proposerRole: currentRole.id,
        proposerEmail: `${currentRole.id}@gmail.com`,
        submittedAt: timestampStr,
        requestType: !isEditing ? 'new_hospital' : 'update_contract',
        status: 'pending',
        reviewNotes: proposalReason || `AM เสนอ${!isEditing ? 'เพิ่มโรงพยาบาลใหม่' : 'ปรับปรุงข้อมูลสัญญาและวงเงิน'} [รูปแบบ: ${contractBillingType === 'monthly_billing' ? 'รายเดือน' : 'รายปี ' + effectiveTotalBudget.toLocaleString() + ' บาท'}]`,
        originalData: hospital ? {
          contractNumber: hospital.contractNumber,
          contractStartDate: hospital.contractStartDate,
          contractExpiryDate: hospital.contractExpiryDate,
          contractDuration: hospital.contractDuration,
          contractCategory: hospital.contractCategory,
          contractBillingType: hospital.contractBillingType,
          totalBudget: hospital.totalBudget,
          poAmount: hospital.poAmount,
          contractStatus: hospital.contractStatus,
        } : undefined,
        proposedData: finalHospitalData,
      };

      onSubmitPendingReview(changeRequest);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full border border-slate-200 overflow-hidden my-4 animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[92vh]">
        
        {/* Header - Clean White Theme */}
        <div className="p-4 sm:p-5 bg-white border-b border-slate-200 text-slate-900 flex items-center justify-between shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-teal-50 border border-teal-200 text-teal-700 flex items-center justify-center">
                <Building2 className="w-4 h-4 text-teal-700" />
              </div>
              <h3 className="font-bold text-base sm:text-lg text-slate-900">
                {isEditing ? `เสนอแก้ไข/ปรับปรุงข้อมูลสัญญา: ${hospital.name}` : 'เพิ่มข้อมูลโรงพยาบาลและสัญญาใหม่'}
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
              <span>ผู้ดำเนินการ:</span>
              <strong className="text-teal-800 font-semibold">{currentRole.badge}</strong>
              <span className="text-slate-400">({currentRole.tagline})</span>
            </p>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Permission Guidance Banner */}
        <div className={`p-3 text-xs flex items-start gap-2 shrink-0 ${
          isCentral ? 'bg-indigo-50 border-b border-indigo-200 text-indigo-900' : 'bg-amber-50 border-b border-amber-200 text-amber-900'
        }`}>
          {isCentral ? (
            <ShieldCheck className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
          ) : (
            <Send className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          )}
          <div className="space-y-0.5">
            <strong>
              {isCentral ? 'สิทธิ์ระดับ Admin ส่วนกลาง (Central Direct Authority):' : 'ขั้นตอนการกำกับวงเงิน: AM ภูมิภาค (Proposer):'}
            </strong>
            <p className="text-[11px] leading-relaxed">
              {isCentral
                ? 'ส่วนกลางสามารถบันทึกแก้ไขและอัปเดตฐานข้อมูลหลัก (Database หลัก) ได้โดยตรงทันที'
                : 'เมื่อ AM กดบันทึก ข้อมูลจะยังไม่เปลี่ยนแปลงใน Database หลักทันที แต่จะถูกส่งเข้าสู่รายการ "รอตรวจสอบจากส่วนกลาง" เพื่อให้ทีมส่วนกลางเปรียบเทียบและอนุมัติก่อนทุกครั้ง'}
            </p>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-5 overflow-y-auto text-xs flex-1">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Section 1: ข้อมูลทั่วไปโรงพยาบาล */}
          <div className="space-y-3">
            <h4 className="font-bold text-slate-900 text-sm border-b border-slate-200 pb-1.5 flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-teal-700" />
              <span>1. ข้อมูลทั่วไปโรงพยาบาล</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block font-semibold text-slate-700 mb-1">
                  ชื่อโรงพยาบาล <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="เช่น โรงพยาบาลขลุง หรือ รพ.น้ำยืน"
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-md focus:outline-teal-600 focus:bg-white"
                />
              </div>

              {/* H-Code (Controlled by Central) */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1 flex items-center justify-between">
                  <span>รหัส H-CODE (5 หลัก)</span>
                  {!isCentral && <span className="text-[10px] text-amber-700 flex items-center gap-0.5"><Lock className="w-2.5 h-2.5" /> ส่วนกลางคุม</span>}
                </label>
                <input
                  type="text"
                  disabled={!isCentral}
                  value={hcode}
                  onChange={(e) => setHcode(e.target.value)}
                  placeholder="10492"
                  className={`w-full p-2 rounded-md font-mono ${
                    isCentral
                      ? 'bg-slate-50 border border-slate-300 focus:outline-teal-600'
                      : 'bg-slate-100 border border-slate-200 text-slate-500 cursor-not-allowed'
                  }`}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  ประเภทโรงพยาบาล
                </label>
                <select
                  value={hospitalType}
                  onChange={(e) => setHospitalType(e.target.value as any)}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-md focus:outline-teal-600"
                >
                  <option value="รพ.ศูนย์ (A)">โรงพยาบาลศูนย์ (ระดับ A)</option>
                  <option value="รพ.ทั่วไป (S/M1)">โรงพยาบาลทั่วไป (ระดับ S / M1)</option>
                  <option value="รพ.ชุมชน (M2/F)">โรงพยาบาลชุมชน (ระดับ M2 / F)</option>
                  <option value="รพ.สต. เครือข่าย">รพ.สต. / สถานีอนามัยเครือข่าย</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1 flex items-center justify-between">
                  <span>ภูมิภาคที่รับผิดชอบ</span>
                  {!isCentral && <span className="text-[10px] text-amber-700 font-normal">ล็อกตามสิทธิ์ AM</span>}
                </label>
                <select
                  disabled={!isCentral}
                  value={region}
                  onChange={(e) => setRegion(e.target.value as any)}
                  className={`w-full p-2 rounded-md ${
                    isCentral
                      ? 'bg-slate-50 border border-slate-300 focus:outline-teal-600'
                      : 'bg-slate-100 border border-slate-200 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  <option value="ภาคกลาง">ภาคกลาง</option>
                  <option value="ภาคเหนือ">ภาคเหนือ</option>
                  <option value="ภาคตะวันออกเฉียงเหนือ">ภาคตะวันออกเฉียงเหนือ</option>
                  <option value="ภาคตะวันออก">ภาคตะวันออก</option>
                  <option value="ภาคใต้">ภาคใต้</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: เงื่อนไขสำคัญสำหรับ “ประเภทสัญญา” & ระยะเวลา */}
          <div className="space-y-3">
            <h4 className="font-bold text-slate-900 text-sm border-b border-slate-200 pb-1.5 flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-teal-700" />
              <span>2. ข้อมูลสัญญา &amp; เงื่อนไขรูปแบบสัญญา (Contract &amp; Billing Type)</span>
            </h4>

            {/* Contract Type Selection Card (Annual vs Monthly) */}
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
              <div className="font-semibold text-slate-900 text-xs flex items-center justify-between">
                <span>รูปแบบสัญญา (Contract Billing Type) <span className="text-rose-500">*</span></span>
                <span className="text-[11px] text-slate-500 font-normal">
                  แยกอย่างน้อย 2 รูปแบบตามเงื่อนไขข้อบังคับ
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Option 1: สัญญารายปี / สัญญาที่มีวงเงิน */}
                <label className={`p-3 rounded-lg border-2 cursor-pointer transition-all flex flex-col justify-between ${
                  contractBillingType === 'annual_budget'
                    ? 'border-teal-600 bg-teal-50/60 shadow-xs'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}>
                  <div className="flex items-start gap-2.5">
                    <input
                      type="radio"
                      name="contractBillingType"
                      checked={contractBillingType === 'annual_budget'}
                      onChange={() => setContractBillingType('annual_budget')}
                      className="mt-0.5 text-teal-600 focus:ring-teal-500"
                    />
                    <div>
                      <div className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                        <span>1. สัญญารายปี / สัญญาที่มีวงเงิน</span>
                      </div>
                      <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                        AM ต้องระบุ <strong>วงเงินตามสัญญา</strong> ชัดเจนเพื่อใช้เป็นข้อมูลหลักในการติดตามการใช้วงเงิน (Budget Tracking)
                      </p>
                    </div>
                  </div>
                  {contractBillingType === 'annual_budget' && (
                    <span className="text-[10px] font-bold text-teal-800 bg-teal-100/80 px-2 py-0.5 rounded self-start mt-2">
                      สถานะ: สัญญามีวงเงิน
                    </span>
                  )}
                </label>

                {/* Option 2: สัญญารายเดือน */}
                <label className={`p-3 rounded-lg border-2 cursor-pointer transition-all flex flex-col justify-between ${
                  contractBillingType === 'monthly_billing'
                    ? 'border-indigo-600 bg-indigo-50/60 shadow-xs'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}>
                  <div className="flex items-start gap-2.5">
                    <input
                      type="radio"
                      name="contractBillingType"
                      checked={contractBillingType === 'monthly_billing'}
                      onChange={() => setContractBillingType('monthly_billing')}
                      className="mt-0.5 text-indigo-600 focus:ring-indigo-500"
                    />
                    <div>
                      <div className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                        <span>2. สัญญารายเดือน</span>
                      </div>
                      <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                        ไม่ต้องกรอกวงเงิน / ระบบไม่อนุญาตให้ระบุวงเงิน เรียกเก็บตาม <strong>ใบแจ้งหนี้ (Invoice)</strong> แต่ละเดือน
                      </p>
                    </div>
                  </div>
                  {contractBillingType === 'monthly_billing' && (
                    <span className="text-[10px] font-bold text-indigo-800 bg-indigo-100/80 px-2 py-0.5 rounded self-start mt-2">
                      สถานะวงเงิน: รายเดือน
                    </span>
                  )}
                </label>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  ประเภทงานสัญญา
                </label>
                <select
                  value={contractCategory}
                  onChange={(e) => setContractCategory(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-md focus:outline-teal-600"
                >
                  <option value="สัญญาจ้างบริการจัดส่งยาถึงบ้าน (สัญญารายปี)">
                    สัญญาจ้างบริการจัดส่งยาถึงบ้าน (สัญญารายปี)
                  </option>
                  <option value="สัญญาจ้างบริการจัดส่งยาถึงบ้าน (สัญญารายเดือน)">
                    สัญญาจ้างบริการจัดส่งยาถึงบ้าน (สัญญารายเดือน)
                  </option>
                  <option value="สัญญาจ้างระบบบริหารงานโลจิสติกส์การแพทย์">
                    สัญญาจ้างระบบบริหารงานโลจิสติกส์การแพทย์
                  </option>
                  <option value="ใบสั่งจ้างจัดส่งยาเฉพาะกิจ (Work Order)">
                    ใบสั่งจ้างจัดส่งยาเฉพาะกิจ (Work Order)
                  </option>
                  <option value="บันทึกข้อตกลงความร่วมมือพิเศษ (MOU)">
                    บันทึกข้อตกลงความร่วมมือพิเศษ (MOU)
                  </option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  เลขที่สัญญา (Contract No.)
                </label>
                <input
                  type="text"
                  required
                  value={contractNumber}
                  onChange={(e) => setContractNumber(e.target.value)}
                  placeholder="CNT-2567-089"
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-md font-mono focus:outline-teal-600"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  วันที่เริ่มต้นสัญญา
                </label>
                <input
                  type="date"
                  required
                  value={contractStartDate}
                  onChange={(e) => handleStartDateChange(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-md focus:outline-teal-600"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  วันที่สิ้นสุดสัญญา
                </label>
                <input
                  type="date"
                  required
                  value={contractExpiryDate}
                  onChange={(e) => handleExpiryDateChange(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-md focus:outline-teal-600"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  ระยะเวลาของสัญญา
                </label>
                <input
                  type="text"
                  value={contractDuration}
                  onChange={(e) => setContractDuration(e.target.value)}
                  placeholder="12 เดือน (365 วัน)"
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-md focus:outline-teal-600 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                สถานะของสัญญา
              </label>
              <select
                value={contractStatus}
                onChange={(e) => setContractStatus(e.target.value as any)}
                className="w-full p-2 bg-slate-50 border border-slate-300 rounded-md focus:outline-teal-600"
              >
                <option value="มีผลบังคับใช้ (Active)">มีผลบังคับใช้ (Active)</option>
                <option value="รอตรวจสอบ">รอตรวจสอบ (Pending Approval)</option>
                <option value="ร่างสัญญา">ร่างสัญญา (Draft)</option>
                <option value="ใกล้หมดอายุ">ใกล้หมดอายุ (&lt; 60 วัน)</option>
                <option value="สิ้นสุดสัญญา">สิ้นสุดสัญญา (Expired)</option>
              </select>
            </div>
          </div>

          {/* Section 3: เลขที่ PO, QT & วงเงิน */}
          <div className="space-y-3">
            <h4 className="font-bold text-slate-900 text-sm border-b border-slate-200 pb-1.5 flex items-center gap-1.5">
              <DollarSign className="w-4 h-4 text-teal-700" />
              <span>3. เอกสารสั่งจ้าง &amp; วงเงินงบประมาณ (PO, QT &amp; Budget)</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  เลขที่ใบสั่งจ้าง (PO / Work Order)
                </label>
                <input
                  type="text"
                  value={poNumber}
                  onChange={(e) => setPoNumber(e.target.value)}
                  placeholder="PO-KLUNG-67-0044"
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-md font-mono focus:outline-teal-600"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  เลขที่ใบเสนอราคา (QT Number)
                </label>
                <input
                  type="text"
                  value={qtNumber}
                  onChange={(e) => setQtNumber(e.target.value)}
                  placeholder="QT-2567-089-V2"
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-md font-mono focus:outline-teal-600"
                />
              </div>
            </div>

            {/* Budget fields with explicit logic for Monthly vs Annual */}
            {contractBillingType === 'monthly_billing' ? (
              /* MONTHLY CONTRACT: Disabled & zeroed */
              <div className="p-4 bg-indigo-50/70 border border-indigo-200 rounded-xl space-y-2">
                <div className="flex items-center gap-2 text-indigo-900 font-bold text-xs">
                  <Info className="w-4 h-4 text-indigo-600 shrink-0" />
                  <span>สัญญารายเดือน: ไม่ต้องระบุวงเงินสัญญา</span>
                </div>
                <p className="text-[11px] text-indigo-800 leading-relaxed">
                  เนื่องจากสัญญาประเภทนี้จะคำนวณและเรียกเก็บค่าบริการตาม <strong>ใบแจ้งหนี้ (Invoice)</strong> ของแต่ละเดือน ระบบจึงไม่อนุญาตให้ระบุวงเงินสัญญา และกำหนดสถานะวงเงินเป็น <strong>“รายเดือน”</strong> โดยไม่นำไปคำนวณการใช้วงเงินแบบสัญญารายปี
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <span className="block text-[11px] font-semibold text-slate-600">วงเงินสัญญา:</span>
                    <input
                      type="text"
                      disabled
                      value="ไม่ต้องกรอก / ระบบไม่อนุญาตให้กรอก"
                      className="w-full p-2 bg-white border border-indigo-200 rounded-md text-slate-500 font-medium cursor-not-allowed text-xs"
                    />
                  </div>
                  <div>
                    <span className="block text-[11px] font-semibold text-slate-600">สถานะวงเงิน:</span>
                    <div className="p-2 bg-white border border-indigo-200 rounded-md font-bold text-indigo-900 text-xs">
                      รายเดือน (Monthly Billing)
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* ANNUAL / BUDGET CONTRACT: Fill budget */
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-amber-50/50 border border-amber-200 rounded-xl">
                {/* Total Budget */}
                <div>
                  <label className="block font-semibold text-slate-900 mb-1 flex items-center justify-between">
                    <span>วงเงินตามสัญญา (บาท) <span className="text-rose-500">*</span></span>
                    {!isCentral && (
                      <span className="text-[10px] text-amber-800 font-normal bg-amber-100 px-1.5 py-0.2 rounded">
                        รอส่วนกลางอนุมัติ
                      </span>
                    )}
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={totalBudget || ''}
                    onChange={(e) => setTotalBudget(Number(e.target.value))}
                    placeholder="เช่น 500,000 หรือ 2,000,000"
                    className="w-full p-2.5 bg-white border border-slate-300 rounded-md font-mono text-sm font-bold text-teal-900 focus:outline-teal-600"
                  />
                  <p className="text-[10px] text-slate-500 mt-1">
                    {!isCentral 
                      ? '* ข้อมูลวงเงินที่ AM ระบุจะถูกส่งเข้าสู่ "รอตรวจสอบจากส่วนกลาง" ก่อน ไม่แก้ไขในฐานข้อมูลทันที'
                      : '* บันทึกวงเงินสัญญาหลักเข้าสู่ระบบ'}
                  </p>
                </div>

                {/* PO Amount */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    วงเงินใบสั่งจ้าง PO (บาท)
                  </label>
                  <input
                    type="number"
                    value={poAmount || ''}
                    onChange={(e) => setPoAmount(Number(e.target.value))}
                    placeholder="500000"
                    className="w-full p-2.5 bg-white border border-slate-300 rounded-md font-mono text-sm text-slate-800 focus:outline-teal-600"
                  />
                  <p className="text-[10px] text-slate-500 mt-1">
                    วงเงินตามใบสั่งซื้อสั่งจ้างราชการ (Work Order)
                  </p>
                </div>
              </div>
            )}

            {/* Note / Justification from AM (when proposing change) */}
            {!isCentral && (
              <div className="pt-2">
                <label className="block font-semibold text-slate-800 mb-1 flex items-center gap-1.5">
                  <Send className="w-3.5 h-3.5 text-teal-700" />
                  <span>เหตุผลความจำเป็นในการเสนอแก้ไขข้อมูล/วงเงินสัญญา (ส่งถึงส่วนกลาง):</span>
                </label>
                <textarea
                  rows={2}
                  value={proposalReason}
                  onChange={(e) => setProposalReason(e.target.value)}
                  placeholder="เช่น ขอขยายวงเงินสัญญาเนื่องจากยอดผู้ป่วยรับยาที่บ้านเพิ่มขึ้น 40% หรือ ขอปรับเป็นสัญญารายเดือนตามนโยบายใหม่ของ รพ."
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-md text-xs focus:outline-teal-600 focus:bg-white"
                />
              </div>
            )}
            {/* Section 3.5: หนังสือค้ำประกันสัญญา (Bank Guarantee - BG) ตามหนังสือเชิญชวน */}
            <div className="p-4 bg-amber-50/40 rounded-xl border border-amber-200/80 space-y-3">
              <div className="flex items-start justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                    <Landmark className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="font-bold text-slate-900 text-xs sm:text-sm">
                      หนังสือค้ำประกันสัญญา (Bank Guarantee - BG)
                    </h5>
                    <p className="text-[11px] text-slate-500">
                      กรณีสัญญา รพ. มีหนังสือเชิญชวนและกำหนดให้วางหลักประกันสัญญา (5% ของมูลค่าสัญญา)
                    </p>
                  </div>
                </div>

                <label className="inline-flex items-center gap-2 cursor-pointer bg-white px-3 py-1.5 rounded-lg border border-amber-300 shadow-2xs">
                  <input
                    type="checkbox"
                    checked={hasBankGuarantee}
                    onChange={(e) => {
                      const checked = e.target.checked;
                      setHasBankGuarantee(checked);
                      if (checked && (!bgGuaranteeAmount || bgGuaranteeAmount === 0)) {
                        setBgGuaranteeAmount(Math.round((totalBudget || 500000) * 0.05));
                      }
                    }}
                    className="rounded text-amber-600 focus:ring-amber-500"
                  />
                  <span className="text-xs font-bold text-amber-950">
                    {hasBankGuarantee ? 'มีหนังสือค้ำประกัน (BG)' : 'ยังไม่มีหนังสือค้ำประกัน'}
                  </span>
                </label>
              </div>

              {hasBankGuarantee && (
                <div className="space-y-3 pt-2 border-t border-amber-200/60 animate-in fade-in duration-150">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
                    {/* Bank Name */}
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        ธนาคารผู้ออกหนังสือค้ำประกัน
                      </label>
                      <select
                        value={bgBankName}
                        onChange={(e) => setBgBankName(e.target.value)}
                        className="w-full p-2 bg-white border border-slate-300 rounded-md focus:outline-teal-600"
                      >
                        <option value="ธนาคารกรุงไทย จำกัด (มหาชน)">ธนาคารกรุงไทย จำกัด (มหาชน) - KTB</option>
                        <option value="ธนาคารกสิกรไทย จำกัด (มหาชน)">ธนาคารกสิกรไทย จำกัด (มหาชน) - KBANK</option>
                        <option value="ธนาคารไทยพาณิชย์ จำกัด (มหาชน)">ธนาคารไทยพาณิชย์ จำกัด (มหาชน) - SCB</option>
                        <option value="ธนาคารกรุงเทพ จำกัด (มหาชน)">ธนาคารกรุงเทพ จำกัด (มหาชน) - BBL</option>
                        <option value="ธนาคารทหารไทยธนชาต จำกัด (มหาชน)">ธนาคารทหารไทยธนชาต จำกัด (มหาชน) - TTB</option>
                        <option value="ธนาคารออมสิน">ธนาคารออมสิน - GSB</option>
                        <option value="ธนาคารกรุงศรีอยุธยา จำกัด (มหาชน)">ธนาคารกรุงศรีอยุธยา จำกัด (มหาชน) - BAY</option>
                      </select>
                    </div>

                    {/* BG Number */}
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        เลขที่หนังสือค้ำประกัน (BG No.)
                      </label>
                      <input
                        type="text"
                        value={bgNumber}
                        onChange={(e) => setBgNumber(e.target.value)}
                        placeholder="เช่น BG-KTB-2569-0091"
                        className="w-full p-2 bg-white border border-slate-300 rounded-md font-mono focus:outline-teal-600"
                      />
                    </div>

                    {/* Invitation Doc No */}
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        เลขที่หนังสือเชิญชวน (รพ.)
                      </label>
                      <input
                        type="text"
                        value={bgInvitationDocNumber}
                        onChange={(e) => setBgInvitationDocNumber(e.target.value)}
                        placeholder="เช่น สธ 0207/ว 4512"
                        className="w-full p-2 bg-white border border-slate-300 rounded-md focus:outline-teal-600"
                      />
                    </div>

                    {/* Guarantee Amount */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="font-semibold text-slate-700">
                          วงเงินค้ำประกัน (บาท)
                        </label>
                        <button
                          type="button"
                          onClick={() => setBgGuaranteeAmount(Math.round((totalBudget || 500000) * (bgGuaranteePercent / 100)))}
                          className="text-[10px] text-amber-800 hover:text-amber-950 font-bold bg-amber-100 px-1.5 py-0.2 rounded"
                        >
                          คำนวณอัตโนมัติ {bgGuaranteePercent}%
                        </button>
                      </div>
                      <input
                        type="number"
                        min={0}
                        value={bgGuaranteeAmount || ''}
                        onChange={(e) => setBgGuaranteeAmount(Number(e.target.value))}
                        placeholder="เช่น 25,000 หรือ 100,000"
                        className="w-full p-2 bg-white border border-slate-300 rounded-md font-mono font-bold text-amber-900 focus:outline-teal-600"
                      />
                    </div>

                    {/* Issue Date */}
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        วันที่ออกหนังสือค้ำประกัน
                      </label>
                      <input
                        type="date"
                        value={bgIssueDate}
                        onChange={(e) => setBgIssueDate(e.target.value)}
                        className="w-full p-2 bg-white border border-slate-300 rounded-md font-mono focus:outline-teal-600"
                      />
                    </div>

                    {/* Expiry Date */}
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        วันหมดอายุหนังสือค้ำประกัน
                      </label>
                      <input
                        type="date"
                        value={bgExpiryDate}
                        onChange={(e) => setBgExpiryDate(e.target.value)}
                        className="w-full p-2 bg-white border border-slate-300 rounded-md font-mono focus:outline-teal-600"
                      />
                    </div>
                  </div>

                  {/* BG File Upload Box */}
                  <div className="p-3 bg-white rounded-lg border border-amber-300/80 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                        <Paperclip className="w-3.5 h-3.5 text-amber-700" />
                        <span>แนบไฟล์หนังสือค้ำประกันสัญญา (.PDF หรือ .PNG)</span>
                      </span>
                      <span className="text-[10px] text-amber-800 font-semibold bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                        บังคับ PDF / PNG
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <label className="px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-md text-xs font-bold cursor-pointer inline-flex items-center gap-1.5 shadow-2xs transition-colors">
                        <Upload className="w-3.5 h-3.5" />
                        <span>เลือกไฟล์หนังสือค้ำประกัน BG</span>
                        <input
                          type="file"
                          accept=".pdf,.png,application/pdf,image/png"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              setBgFileName(file.name);
                              setBgFileSize(`${(file.size / (1024 * 1024)).toFixed(1)} MB`);
                              // Also append to attachedFiles
                              const now = new Date();
                              const thaiMonths = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
                              const uploadTimeStr = `${now.getDate()} ${thaiMonths[now.getMonth()]} ${now.getFullYear() + 543} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')} น.`;
                              const newFile: AttachedFileItem = {
                                id: `file-bg-${Date.now()}`,
                                name: file.name,
                                category: 'หนังสือค้ำประกัน BG',
                                fileSize: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
                                uploadDate: uploadTimeStr,
                                uploadedBy: currentRole.amName || currentRole.name,
                              };
                              setAttachedFiles((prev) => [newFile, ...prev]);
                            }
                          }}
                          className="hidden"
                        />
                      </label>

                      {bgFileName ? (
                        <div className="flex items-center gap-2 text-xs text-emerald-800 bg-emerald-50 px-2.5 py-1.5 rounded-md border border-emerald-200 font-medium">
                          <Check className="w-4 h-4 text-emerald-600" />
                          <span>แนบแล้ว: {bgFileName} ({bgFileSize})</span>
                        </div>
                      ) : (
                        <span className="text-[11px] text-slate-500">
                          (คลิกเลือกไฟล์เอกสารฉบับสแกนหรือหนังสือค้ำประกันอิเล็กทรอนิกส์ e-Guarantee)
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Section 4: ที่อยู่โรงพยาบาล & รหัสไปรษณีย์ */}
          <div className="space-y-3">
            <h4 className="font-bold text-slate-900 text-sm border-b border-slate-200 pb-1.5 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-rose-600" />
              <span>4. ที่อยู่โรงพยาบาล &amp; รหัสไปรษณีย์ (Physical Location)</span>
            </h4>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                ที่อยู่เต็ม (เลขที่, หมู่, ถนน)
              </label>
              <textarea
                rows={2}
                required
                value={fullAddress}
                onChange={(e) => setFullAddress(e.target.value)}
                placeholder="เช่น 84 หมู่ที่ 1 ถนนเทศบาล 4 ตำบลขลุง อำเภอขลุง จังหวัดจันทบุรี 22110"
                className="w-full p-2 bg-slate-50 border border-slate-300 rounded-md focus:outline-teal-600 focus:bg-white"
              />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">ตำบล/แขวง</label>
                <input
                  type="text"
                  value={subdistrict}
                  onChange={(e) => setSubdistrict(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-md"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">อำเภอ/เขต</label>
                <input
                  type="text"
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-md"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">จังหวัด</label>
                <input
                  type="text"
                  value={province}
                  onChange={(e) => setProvince(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-md"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">รหัสไปรษณีย์</label>
                <input
                  type="text"
                  required
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                  placeholder="22110"
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-md font-mono font-bold text-teal-800"
                />
              </div>
            </div>
          </div>

          {/* Section 5: เอกสารที่เกี่ยวข้อง (แนบไฟล์ บังคับ PDF หรือ PNG เท่านั้น) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
              <h4 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                <Upload className="w-4 h-4 text-teal-700" />
                <span>5. อัปเดตไฟล์สัญญา, ใบเสนอราคา QT, TOR (บังคับ PDF หรือ PNG เท่านั้น)</span>
              </h4>
              <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200 font-mono">
                *.PDF | *.PNG ONLY
              </span>
            </div>

            {/* Error Notification for invalid file type */}
            {fileError && (
              <div className="p-2.5 bg-rose-50 border border-rose-300 rounded-lg text-xs text-rose-700 font-medium flex items-center gap-2 animate-in fade-in duration-150">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{fileError}</span>
              </div>
            )}

            {/* Quick Upload Action Buttons for 3 Mandated Documents */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
              {/* Contract Upload */}
              <label className="p-3 bg-white rounded-lg border-2 border-dashed border-teal-300 hover:border-teal-500 hover:bg-teal-50/50 cursor-pointer flex flex-col items-center justify-center text-center transition-all group">
                <FileText className="w-5 h-5 text-teal-600 mb-1 group-hover:scale-110 transition-transform" />
                <span className="font-bold text-slate-900">+ อัปเดตไฟล์สัญญา</span>
                <span className="text-[10px] text-slate-500 mt-0.5">เฉพาะ .pdf หรือ .png</span>
                <input 
                  type="file" 
                  accept=".pdf,.png,application/pdf,image/png" 
                  onChange={(e) => handleFileUpload(e, 'สัญญาหลัก')}
                  className="hidden" 
                />
              </label>

              {/* Quotation QT Upload */}
              <label className="p-3 bg-white rounded-lg border-2 border-dashed border-blue-300 hover:border-blue-500 hover:bg-blue-50/50 cursor-pointer flex flex-col items-center justify-center text-center transition-all group">
                <FileText className="w-5 h-5 text-blue-600 mb-1 group-hover:scale-110 transition-transform" />
                <span className="font-bold text-slate-900">+ อัปเดตใบเสนอราคา QT</span>
                <span className="text-[10px] text-slate-500 mt-0.5">เฉพาะ .pdf หรือ .png</span>
                <input 
                  type="file" 
                  accept=".pdf,.png,application/pdf,image/png" 
                  onChange={(e) => handleFileUpload(e, 'ใบเสนอราคา QT')}
                  className="hidden" 
                />
              </label>

              {/* TOR Upload */}
              <label className="p-3 bg-white rounded-lg border-2 border-dashed border-indigo-300 hover:border-indigo-500 hover:bg-indigo-50/50 cursor-pointer flex flex-col items-center justify-center text-center transition-all group">
                <FileText className="w-5 h-5 text-indigo-600 mb-1 group-hover:scale-110 transition-transform" />
                <span className="font-bold text-slate-900">+ อัปเดตเอกสาร TOR</span>
                <span className="text-[10px] text-slate-500 mt-0.5">เฉพาะ .pdf หรือ .png</span>
                <input 
                  type="file" 
                  accept=".pdf,.png,application/pdf,image/png" 
                  onChange={(e) => handleFileUpload(e, 'TOR ขอบเขต')}
                  className="hidden" 
                />
              </label>
            </div>

            {/* Existing Files List */}
            <div className="space-y-1.5 pt-1">
              <span className="text-[11px] font-bold text-slate-500 block">
                เอกสารที่แนบอยู่ในระบบ ({attachedFiles.length} ไฟล์):
              </span>
              {attachedFiles.map((file) => {
                const isPdf = file.name.toLowerCase().endsWith('.pdf');
                const isPng = file.name.toLowerCase().endsWith('.png');

                return (
                  <div
                    key={file.id}
                    className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold ${
                        isPdf ? 'bg-rose-100 text-rose-800 border border-rose-200' : isPng ? 'bg-purple-100 text-purple-800 border border-purple-200' : 'bg-slate-200 text-slate-800'
                      }`}>
                        {isPdf ? 'PDF' : isPng ? 'PNG' : 'DOC'}
                      </span>
                      <div>
                        <div className="font-semibold text-slate-900">{file.name}</div>
                        <div className="text-[10px] text-slate-500">
                          {file.category} • ขนาด {file.fileSize} • อัปโหลดเมื่อ {file.uploadDate} โดย {file.uploadedBy}
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveFile(file.id)}
                      className="text-slate-400 hover:text-rose-600 p-1 transition-colors"
                      title="ลบไฟล์"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Manual attachment row (PDF/PNG only) */}
            <div className="flex items-center gap-2 pt-1 border-t border-slate-100">
              <input
                type="text"
                value={newFileName}
                onChange={(e) => setNewFileName(e.target.value)}
                placeholder="พิมพ์ชื่อไฟล์ เช่น สัญญาแนบท้าย_ฉบับจริง.pdf"
                className="flex-1 p-2 bg-slate-50 border border-slate-300 rounded-md text-xs focus:outline-teal-600"
              />
              <select
                value={newFileCategory}
                onChange={(e) => setNewFileCategory(e.target.value as any)}
                className="p-2 bg-slate-50 border border-slate-300 rounded-md text-xs"
              >
                <option value="สัญญาหลัก">สัญญาหลัก</option>
                <option value="ใบเสนอราคา QT">ใบเสนอราคา QT</option>
                <option value="TOR ขอบเขต">TOR ขอบเขต</option>
                <option value="ใบสั่งจ้าง PO">ใบสั่งจ้าง PO</option>
                <option value="เอกสารแนบท้ายอื่น ๆ">เอกสารแนบท้ายอื่น ๆ</option>
              </select>
              <button
                type="button"
                onClick={handleAddFile}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-md text-xs font-semibold shrink-0 transition-colors"
              >
                + แนบไฟล์ (.pdf/.png)
              </button>
            </div>
          </div>

          {/* Submit & Cancel Buttons */}
          <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>
                {isCentral 
                  ? 'การบันทึกจะอัปเดต Database หลัก และบันทึกเข้า Audit Log โดยอัตโนมัติ' 
                  : 'ข้อมูลจะเข้าสู่รายการ "รอตรวจสอบจากส่วนกลาง" เพื่อให้ส่วนกลางเปรียบเทียบก่อนอัปเดต Database'}
              </span>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50"
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                className={`px-5 py-2 text-xs font-bold text-white rounded-lg shadow-sm flex items-center gap-1.5 transition-all active:scale-95 ${
                  isCentral
                    ? 'bg-teal-700 hover:bg-teal-800'
                    : 'bg-amber-600 hover:bg-amber-700'
                }`}
              >
                {isCentral ? <Check className="w-4 h-4" /> : <Send className="w-4 h-4" />}
                <span>
                  {isCentral ? 'บันทึกและอัปเดต Database หลัก' : 'บันทึกส่งเข้ารอตรวจสอบจากส่วนกลาง'}
                </span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
