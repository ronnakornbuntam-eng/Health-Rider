export interface DocumentQT {
  docNumber: string;
  date: string;
  amount: number;
  title: string;
  status: 'อนุมัติแล้ว' | 'รออนุมัติ' | 'ปรับปรุง';
  approvedBy: string;
  itemsCount: number;
  unitPricePerTrip: number;
}

export interface DocumentPO {
  docNumber: string;
  date: string;
  amount: number;
  title: string;
  status: 'ออกใบสั่งซื้อแล้ว' | 'รออนุมัติงบ' | 'เบิกจ่ายตามงวด' | 'รอลงนาม';
  disbursementPeriod: string;
  paymentTerms: string;
}

export interface DocumentTOR {
  docNumber: string;
  version: string;
  effectiveDate: string;
  scopeSummary: string;
  serviceRadiusKm: number;
  slaHours: number;
  penaltyPerLateHour: number;
}

export interface ContractAgreementDoc {
  contractNumber: string;
  signedDate: string;
  effectiveStartDate: string;
  effectiveEndDate: string;
  stampDutyNumber: string;
}

export interface BankGuaranteeInfo {
  bgNumber: string; // เลขที่หนังสือค้ำประกัน เช่น BG-KTB-2569-00918
  bankName: string; // ธนาคารผู้ออก เช่น ธนาคารกรุงไทย, ธนาคารกสิกรไทย, ธนาคารไทยพาณิชย์
  guaranteeAmount: number; // วงเงินค้ำประกัน (บาท) เช่น 5% ของมูลค่าสัญญา
  guaranteePercent: number; // ร้อยละ 5%
  invitationDocNumber?: string; // เลขที่หนังสือเชิญชวน รพ./e-GP เช่น สธ 0207/ว 4512
  issueDate: string; // วันที่ออกหนังสือค้ำประกัน
  expiryDate: string; // วันที่สิ้นสุดการค้ำประกัน
  status: 'ค้ำประกันอยู่ (Active)' | 'ใกล้หมดอายุ' | 'คืนหนังสือค้ำประกันแล้ว (Released)' | 'หมดอายุ';
  fileName?: string; // ชื่อไฟล์แนบ เช่น หนังสือค้ำประกัน_ธนาคารกรุงไทย_CNT2567-089.pdf
  fileSize?: string;
  fileUrl?: string;
  uploadedAt?: string;
  uploadedBy?: string;
  notes?: string;
}

export interface MonthlyBillingRecord {
  id: string;
  month: string; // e.g. "ตุลาคม 2569" or "2026-10"
  invoiceNumber: string; // เลขที่ใบแจ้งหนี้ / ใบวางบิล เช่น "INV-2569-10-0042"
  billingDate: string; // วันที่วางบิล เช่น "2026-10-05"
  amount: number; // ยอดวางบิล (บาท)
  tripsCount: number; // จำนวนเที่ยวส่งยา
  status: 'หักจากวงเงินแล้ว' | 'รอตัดวงเงิน' | 'ยกเลิก';
  source: 'google_sheet' | 'manual';
  deductedAt?: string;
  deductedBy?: string;
  sheetRowIndex?: number;
  notes?: string;
}

export interface AttachedFileItem {
  id: string;
  name: string;
  category: 'สัญญาหลัก' | 'ใบสั่งจ้าง PO' | 'ใบเสนอราคา QT' | 'TOR ขอบเขต' | 'หนังสือค้ำประกัน BG' | 'เอกสารแนบท้ายอื่น ๆ';
  fileSize: string;
  uploadDate: string;
  uploadedBy: string;
  fileUrl?: string;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  editorName: string;
  editorRole: string;
  action: 
    | 'เพิ่มโรงพยาบาลใหม่' 
    | 'แก้ไขข้อมูลสัญญา' 
    | 'อัปเดตใบสั่งจ้าง PO' 
    | 'ปรับปรุงที่อยู่' 
    | 'อนุมัติวงเงินโดยส่วนกลาง'
    | 'เสนอแก้ไขสัญญา (รอส่วนกลาง)'
    | 'ส่วนกลางอนุมัติคำขอ'
    | 'ส่วนกลางไม่อนุมัติคำขอ'
    | 'ส่งกลับให้ AM แก้ไข'
    | 'ตัดยอดวางบิลรายเดือน'
    | 'อัปเดตหนังสือค้ำประกัน BG';
  changesSummary: string;
  details?: Record<string, { oldVal: any; newVal: any }>;
}

export interface PendingChangeRequest {
  id: string;
  hospitalId: string;
  hospitalName: string;
  hcode: string;
  region: 'ภาคกลาง' | 'ภาคเหนือ' | 'ภาคตะวันออกเฉียงเหนือ' | 'ภาคตะวันออก' | 'ภาคตะวันตก' | 'ภาคใต้';
  proposerName: string;
  proposerRole: string;
  proposerEmail: string;
  submittedAt: string;
  requestType: 'new_hospital' | 'update_contract';
  status: 'pending' | 'approved' | 'rejected' | 'revision_requested';
  reviewNotes?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  originalData?: Partial<HospitalContract>;
  proposedData: HospitalContract;
}

export interface HospitalContract {
  id: string;
  hcode: string; // 5-digit official hospital code (รหัสสถานพยาบาล ควบคุมโดยส่วนกลาง)
  cusCode: string;
  contractNumber: string; // เลขที่สัญญา
  name: string; // ชื่อโรงพยาบาล
  hospitalType: 'รพ.ศูนย์ (A)' | 'รพ.ทั่วไป (S/M1)' | 'รพ.ชุมชน (M2/F)' | 'รพ.สต. เครือข่าย';
  contractCategory: string; // ประเภทสัญญา เช่น สัญญาจ้าง / ใบสั่งจ้าง / อื่น ๆ
  contractBillingType?: 'annual_budget' | 'monthly_billing'; // สัญญารายปี/มีวงเงิน vs สัญญารายเดือน
  hasPendingChanges?: boolean; // ป้ายสถานะว่ามีคำขอรอตรวจสอบจากส่วนกลาง
  pendingChangeId?: string;
  
  // Contract Dates & Duration (วันที่เริ่มต้น, สิ้นสุด, ระยะเวลา)
  contractStartDate: string; // วันที่เริ่มต้นสัญญา
  contractExpiryDate: string; // วันที่สิ้นสุดสัญญา
  contractDuration: string; // ระยะเวลาของสัญญา
  daysUntilExpiry: number; // days until contract ends
  contractStatus: 'มีผลบังคับใช้ (Active)' | 'รอตรวจสอบ' | 'ร่างสัญญา' | 'ใกล้หมดอายุ' | 'สิ้นสุดสัญญา';

  // Physical Location & Contact (ที่อยู่, รหัสไปรษณีย์, จังหวัด)
  province: string;
  region: 'ภาคกลาง' | 'ภาคเหนือ' | 'ภาคตะวันออกเฉียงเหนือ' | 'ภาคตะวันออก' | 'ภาคตะวันตก' | 'ภาคใต้';
  address: {
    fullAddress: string;
    subdistrict: string; // ตำบล/แขวง
    district: string; // อำเภอ/เขต
    province: string; // จังหวัด
    postalCode: string; // รหัสไปรษณีย์
  };
  hospitalPhone: string;
  hospitalDirector: string; // ผู้อำนวยการ รพ.
  hospitalCoordinator: string; // ผู้ประสานงานหลัก

  // Budget & Numbers (วงเงินตามสัญญา / วงเงินใบสั่งจ้าง)
  totalBudget: number; // วงเงินตามสัญญา (ควบคุมโดยส่วนกลาง)
  spentBudget: number; // in THB
  remainingBudget: number; // in THB
  spentPercent: number; // e.g. 91.8
  poAmount: number; // วงเงินใบสั่งจ้าง
  dailyBurnRate: number; // THB/day
  estimatedRunoutDays: number;

  // Responsible AM Team
  amName: string; // Account Manager ผู้รับผิดชอบ
  amPhone: string;
  amEmail: string;

  // Status & Alerts
  statusRisk: 'critical' | 'warning' | 'normal' | 'over_budget';
  legalStatus: 'ปกติ (สมบูรณ์)' | 'ตีตราสารค้าง (>7 วัน)' | 'รอเอกสารแนบท้าย' | 'รอนิติการตรวจสอบ' | 'ร่างสัญญาปี 68';
  stampDutyStatus: 'ชำระ e-Stamp แล้ว' | 'รอชำระอากร' | 'ค้างดำเนินการ';
  monthlyTransactions: number;
  lastUpdated: string;
  alertType?: 'CRITICAL EXPIRY & BURN' | 'Quota Warning' | 'Legal Bottleneck';
  alertDescription?: string;
  systemRecommendation?: string;

  // Official Documents (QT, PO, TOR, Contract)
  documents: {
    qt: DocumentQT;
    po: DocumentPO;
    tor: DocumentTOR;
    contractAgreement: ContractAgreementDoc;
  };

  // Attached files
  attachedFiles: AttachedFileItem[];

  // Bank Guarantee (หนังสือค้ำประกันสัญญา - BG)
  hasBankGuarantee?: boolean;
  bankGuarantee?: BankGuaranteeInfo;

  // Monthly Billings (บันทึกการวางบิลและตัดวงเงินรายเดือน)
  monthlyBillings?: MonthlyBillingRecord[];

  // Change History & Audit Logs
  auditLogs: AuditLogEntry[];
}

export interface RegionSummary {
  region: string;
  hospitalsCount: number;
  contractsCount: number;
  utilizationRate: number; // %
  overBudgetCount: number;
  expiringCount: number;
  isHighest?: boolean;
}

export interface TaskItem {
  id: string;
  title: string;
  hospitalName: string;
  contractCode: string;
  column: 'renewal' | 'stamp' | 'po' | 'done';
  priority: 'high' | 'medium' | 'low';
  assignedTo: string;
  dueDate: string;
  tag: string;
  budgetAmount: number;
  notes?: string;
}

export const REGIONS_DATA: RegionSummary[] = [
  {
    region: 'ภาคตะวันออก',
    hospitalsCount: 14,
    contractsCount: 16,
    utilizationRate: 91.4,
    overBudgetCount: 0,
    expiringCount: 0,
    isHighest: true,
  },
  {
    region: 'ภาคกลาง',
    hospitalsCount: 58,
    contractsCount: 82,
    utilizationRate: 88.5,
    overBudgetCount: 1,
    expiringCount: 4,
  },
  {
    region: 'ภาคเหนือ',
    hospitalsCount: 39,
    contractsCount: 52,
    utilizationRate: 84.0,
    overBudgetCount: 1,
    expiringCount: 3,
  },
  {
    region: 'ภาคตะวันออกเฉียงเหนือ',
    hospitalsCount: 46,
    contractsCount: 61,
    utilizationRate: 79.2,
    overBudgetCount: 1,
    expiringCount: 5,
  },
  {
    region: 'ภาคใต้',
    hospitalsCount: 28,
    contractsCount: 37,
    utilizationRate: 72.1,
    overBudgetCount: 0,
    expiringCount: 2,
  },
];

export const INITIAL_HOSPITALS: HospitalContract[] = [
  {
    id: 'hosp-1',
    hcode: '10492',
    cusCode: 'CUS-10492',
    contractNumber: 'CNT-2567-089',
    name: 'โรงพยาบาลขลุง',
    hospitalType: 'รพ.ชุมชน (M2/F)',
    contractCategory: 'สัญญาจ้างบริการจัดส่งยาถึงบ้าน (สัญญารายปี)',
    contractStartDate: '2025-11-01',
    contractExpiryDate: '2026-10-30',
    contractDuration: '12 เดือน (365 วัน)',
    daysUntilExpiry: 25,
    contractStatus: 'ใกล้หมดอายุ',
    province: 'จ.จันทบุรี',
    region: 'ภาคตะวันออก',
    address: {
      fullAddress: '84 หมู่ที่ 1 ถนนเทศบาล 4 ตำบลขลุง อำเภอขลุง จังหวัดจันทบุรี 22110',
      subdistrict: 'ตำบลขลุง',
      district: 'อำเภอขลุง',
      province: 'จันทบุรี',
      postalCode: '22110',
    },
    hospitalPhone: '039-441-345',
    hospitalDirector: 'นพ. ชัยรัตน์ พงษ์ศิริ (ผู้อำนวยการ)',
    hospitalCoordinator: 'ภญ. พรรณนิภา จันทร์ดี (หัวหน้ากลุ่มงานเภสัชกรรม)',
    totalBudget: 2000000,
    spentBudget: 1836000,
    remainingBudget: 164000,
    spentPercent: 91.8,
    poAmount: 2000000,
    dailyBurnRate: 9100,
    estimatedRunoutDays: 18,
    amName: 'กิตติศักดิ์ พ.',
    amPhone: '081-445-9821',
    amEmail: 'kittisak.p@company.com',
    statusRisk: 'critical',
    legalStatus: 'ร่างสัญญาปี 68',
    stampDutyStatus: 'รอชำระอากร',
    monthlyTransactions: 1240,
    lastUpdated: '10 นาทีที่แล้ว',
    alertType: 'CRITICAL EXPIRY & BURN',
    alertDescription: 'สัญญาจะหมดอายุใน 25 วัน | วงเงินคงเหลือเพียง 8.2% (164,000 บาท) | อัตราบริโภคกรรมชี้ว่าจะหมดเกลี้ยงภายใน 18 วัน (ก่อนสิ้นสัญญา)',
    systemRecommendation: 'มอบหมาย AM กิตติศักดิ์ พ. เร่งจัดส่งบันทึกขออนุมัติขยายเพดานวงเงินและต่อสัญญาปี 2568 ล่วงหน้าทันที',
    documents: {
      qt: {
        docNumber: 'QT-2567-089-V2',
        date: '2025-10-15',
        amount: 2000000,
        title: 'ใบเสนอราคาบริการโลจิสติกส์ส่งยาถึงบ้าน ประจำปีงบประมาณ 2567',
        status: 'อนุมัติแล้ว',
        approvedBy: 'นพ. ชัยรัตน์ พงษ์ศิริ',
        itemsCount: 40000,
        unitPricePerTrip: 50,
      },
      po: {
        docNumber: 'PO-KLUNG-67-0044',
        date: '2025-10-28',
        amount: 2000000,
        title: 'ใบสั่งจ้างบริการส่งยาถึงบ้านผู้ป่วยเรื้อรัง NCDs เครือข่าย อ.ขลุง',
        status: 'ออกใบสั่งซื้อแล้ว',
        disbursementPeriod: 'เบิกจ่ายรายเดือนตามยอดส่งจริง (e-Billing)',
        paymentTerms: 'เครดิตเทอม 30 วัน',
      },
      tor: {
        docNumber: 'TOR-KLUNG-HR-2567',
        version: 'ฉบับปรับปรุงครั้งที่ 2',
        effectiveDate: '2025-11-01',
        scopeSummary: 'จัดส่งยาเคมีบำบัด ยาโรคเรื้อรัง ในรัศมี 25 กิโลเมตรจาก รพ. ควบคุมอุณหภูมิ 2-8°C และ 15-25°C',
        serviceRadiusKm: 25,
        slaHours: 4,
        penaltyPerLateHour: 50,
      },
      contractAgreement: {
        contractNumber: 'CNT-2567-089',
        signedDate: '2025-11-01',
        effectiveStartDate: '2025-11-01',
        effectiveEndDate: '2026-10-30',
        stampDutyNumber: 'ESM-2567-089-KLG (ตราสารข้อ 4)',
      },
    },
    attachedFiles: [
      {
        id: 'att-1',
        name: 'สัญญาจ้างฉบับลงนาม_CNT-2567-089.pdf',
        category: 'สัญญาหลัก',
        fileSize: '4.2 MB',
        uploadDate: '2025-11-01 10:15',
        uploadedBy: 'Admin ส่วนกลาง',
      },
      {
        id: 'att-2',
        name: 'ใบสั่งจ้างราชการ_PO-KLUNG-67-0044.pdf',
        category: 'ใบสั่งจ้าง PO',
        fileSize: '1.8 MB',
        uploadDate: '2025-10-28 14:20',
        uploadedBy: 'กิตติศักดิ์ พ. (AM ภาคตะวันออก)',
      },
      {
        id: 'att-3',
        name: 'TOR_ข้อกำหนดการจัดส่งยาขลุง_v2.pdf',
        category: 'TOR ขอบเขต',
        fileSize: '2.5 MB',
        uploadDate: '2025-10-20 09:30',
        uploadedBy: 'กิตติศักดิ์ พ. (AM ภาคตะวันออก)',
      },
      {
        id: 'att-4',
        name: 'หนังสือค้ำประกันสัญญา_ธ.กรุงไทย_BG-KTB-2567-00441.pdf',
        category: 'หนังสือค้ำประกัน BG',
        fileSize: '1.2 MB',
        uploadDate: '2025-10-26 11:00',
        uploadedBy: 'กิตติศักดิ์ พ. (AM ภาคตะวันออก)',
      },
    ],
    hasBankGuarantee: true,
    bankGuarantee: {
      bgNumber: 'BG-KTB-2567-00441',
      bankName: 'ธนาคารกรุงไทย จำกัด (มหาชน)',
      guaranteeAmount: 100000,
      guaranteePercent: 5,
      invitationDocNumber: 'สธ 0207/ว 4512 (ประกาศประกวดราคา e-Bidding)',
      issueDate: '2025-10-25',
      expiryDate: '2026-11-30',
      status: 'ค้ำประกันอยู่ (Active)',
      fileName: 'หนังสือค้ำประกันสัญญา_ธ.กรุงไทย_BG-KTB-2567-00441.pdf',
      fileSize: '1.2 MB',
      uploadedAt: '2025-10-26 11:00',
      uploadedBy: 'กิตติศักดิ์ พ. (AM ภาคตะวันออก)',
      notes: 'ค้ำประกันการปฏิบัติตามสัญญา 5% ของวงเงินสัญญา 2,000,000 บาท คืนเมื่อสิ้นสุดภาระผูกพัน',
    },
    monthlyBillings: [
      {
        id: 'bill-1',
        month: 'พฤษภาคม 2569',
        invoiceNumber: 'INV-6905-0112',
        billingDate: '2026-05-31',
        amount: 152000,
        tripsCount: 3040,
        status: 'หักจากวงเงินแล้ว',
        source: 'google_sheet',
        deductedAt: '2026-06-05 09:30',
        deductedBy: 'Admin ส่วนกลาง (Google Sheet Sync)'
      },
      {
        id: 'bill-2',
        month: 'มิถุนายน 2569',
        invoiceNumber: 'INV-6906-0158',
        billingDate: '2026-06-30',
        amount: 168000,
        tripsCount: 3360,
        status: 'หักจากวงเงินแล้ว',
        source: 'google_sheet',
        deductedAt: '2026-07-04 10:15',
        deductedBy: 'Admin ส่วนกลาง (Google Sheet Sync)'
      },
      {
        id: 'bill-3',
        month: 'กรกฎาคม 2569',
        invoiceNumber: 'INV-6907-0204',
        billingDate: '2026-07-31',
        amount: 175000,
        tripsCount: 3500,
        status: 'หักจากวงเงินแล้ว',
        source: 'google_sheet',
        deductedAt: '2026-08-03 14:00',
        deductedBy: 'Admin ส่วนกลาง (Google Sheet Sync)'
      },
      {
        id: 'bill-4',
        month: 'สิงหาคม 2569',
        invoiceNumber: 'INV-6908-0249',
        billingDate: '2026-08-31',
        amount: 182000,
        tripsCount: 3640,
        status: 'หักจากวงเงินแล้ว',
        source: 'google_sheet',
        deductedAt: '2026-09-04 11:20',
        deductedBy: 'Admin ส่วนกลาง (Google Sheet Sync)'
      },
      {
        id: 'bill-5',
        month: 'กันยายน 2569',
        invoiceNumber: 'INV-6909-0291',
        billingDate: '2026-09-30',
        amount: 189000,
        tripsCount: 3780,
        status: 'หักจากวงเงินแล้ว',
        source: 'google_sheet',
        deductedAt: '2026-10-04 15:45',
        deductedBy: 'Admin ส่วนกลาง (Google Sheet Sync)'
      }
    ],
    auditLogs: [
      {
        id: 'log-1',
        timestamp: '2026-10-05 10:15 น.',
        editorName: 'กิตติศักดิ์ พ.',
        editorRole: 'AM ภาคตะวันออก',
        action: 'แก้ไขข้อมูลสัญญา',
        changesSummary: 'อัปเดตบันทึกการส่งมอบงานงวดที่ 11 และปรับสถานะเฝ้าระวังวงเงินคงเหลือ 8.2%',
      },
      {
        id: 'log-2',
        timestamp: '2026-08-15 14:30 น.',
        editorName: 'Admin ส่วนกลาง (admin.ops)',
        editorRole: 'Admin ส่วนกลาง',
        action: 'อนุมัติวงเงินโดยส่วนกลาง',
        changesSummary: 'อนุมัติวงเงินเพดานงบประมาณสัญญาหลัก 2,000,000 บาท',
      },
    ],
  },
  {
    id: 'hosp-2',
    hcode: '20184',
    cusCode: 'CUS-20184',
    contractNumber: 'CNT-2567-142',
    name: 'โรงพยาบาลน้ำยืน',
    hospitalType: 'รพ.ชุมชน (M2/F)',
    contractCategory: 'สัญญาจ้างบริการจัดส่งยาถึงบ้าน (สัญญารายปี)',
    contractStartDate: '2025-11-20',
    contractExpiryDate: '2026-11-20',
    contractDuration: '12 เดือน (365 วัน)',
    daysUntilExpiry: 46,
    contractStatus: 'มีผลบังคับใช้ (Active)',
    province: 'จ.อุบลราชธานี',
    region: 'ภาคตะวันออกเฉียงเหนือ',
    address: {
      fullAddress: '159 หมู่ 2 ถนนวารินชำราบ-เดชอุดม ตำบลโซง อำเภอน้ำยืน จังหวัดอุบลราชธานี 34260',
      subdistrict: 'ตำบลโซง',
      district: 'อำเภอน้ำยืน',
      province: 'อุบลราชธานี',
      postalCode: '34260',
    },
    hospitalPhone: '045-371-088',
    hospitalDirector: 'นพ. วรุตม์ เกียรติอนันต์ (ผู้อำนวยการ)',
    hospitalCoordinator: 'ภก. ธนกร พลอยแก้ว (หัวหน้าห้องจ่ายยาผู้ป่วยนอก)',
    totalBudget: 1000000,
    spentBudget: 924000,
    remainingBudget: 76000,
    spentPercent: 92.4,
    poAmount: 1000000,
    dailyBurnRate: 3450,
    estimatedRunoutDays: 22,
    amName: 'ปวีณา ส.',
    amPhone: '089-762-1134',
    amEmail: 'paweena.s@hospital-network.org',
    statusRisk: 'warning',
    legalStatus: 'ปกติ (สมบูรณ์)',
    stampDutyStatus: 'ชำระ e-Stamp แล้ว',
    monthlyTransactions: 620,
    lastUpdated: '25 นาทีที่แล้ว',
    alertType: 'Quota Warning',
    alertDescription: 'ใช้วงเงินไปแล้ว 92.4% (คงเหลือ 76,000 บาท) คำนวณตาม Velocity ปัจจุบันจะเต็มวงเงินก่อนสิ้นรอบบิลประจำเดือน 11 วัน',
    systemRecommendation: 'จัดทำหนังสือขอเพิ่มวงเงินสัญญาระหว่างปี และประสานงานฝ่ายจัดซื้อโรงพยาบาลเตรียมออก PO เสริม',
    documents: {
      qt: {
        docNumber: 'QT-2567-142-NYN',
        date: '2025-11-05',
        amount: 1000000,
        title: 'ใบเสนอราคาจัดส่งยาถึงบ้านโครงการผู้ป่วยรับยาใกล้บ้าน',
        status: 'อนุมัติแล้ว',
        approvedBy: 'นพ. วรุตม์ เกียรติอนันต์',
        itemsCount: 20000,
        unitPricePerTrip: 50,
      },
      po: {
        docNumber: 'PO-NYN-67-0118',
        date: '2025-11-15',
        amount: 1000000,
        title: 'ใบสั่งจ้างระบบจัดส่งยา รพ.น้ำยืน ประจำปี 2567',
        status: 'ออกใบสั่งซื้อแล้ว',
        disbursementPeriod: 'แบ่งจ่าย 4 งวดตามผลการส่งมอบงาน',
        paymentTerms: 'เครดิตเทอม 30 วัน',
      },
      tor: {
        docNumber: 'TOR-NYN-HR-2567',
        version: 'ฉบับหลัก 1.0',
        effectiveDate: '2025-11-20',
        scopeSummary: 'บริการจัดส่งยาถึงบ้านในเขตพื้นที่ชายแดนและห่างไกล รัศมี 35 กิโลเมตร มีระบบ OTP ยืนยันตัวตนผู้ป่วย',
        serviceRadiusKm: 35,
        slaHours: 6,
        penaltyPerLateHour: 40,
      },
      contractAgreement: {
        contractNumber: 'CNT-2567-142',
        signedDate: '2025-11-20',
        effectiveStartDate: '2025-11-20',
        effectiveEndDate: '2026-11-20',
        stampDutyNumber: 'ESM-2567-142-UBON-901',
      },
    },
    attachedFiles: [
      {
        id: 'att-ny-1',
        name: 'สัญญาจ้างส่งยา_CNT-2567-142.pdf',
        category: 'สัญญาหลัก',
        fileSize: '3.1 MB',
        uploadDate: '2025-11-20 11:00',
        uploadedBy: 'Admin ส่วนกลาง',
      },
      {
        id: 'att-ny-2',
        name: 'ใบPO_รพ.น้ำยืน_67-0118.pdf',
        category: 'ใบสั่งจ้าง PO',
        fileSize: '1.2 MB',
        uploadDate: '2025-11-15 15:00',
        uploadedBy: 'ปวีณา ส. (AM ภาคอีสาน)',
      },
    ],
    auditLogs: [
      {
        id: 'log-ny-1',
        timestamp: '2026-10-04 16:40 น.',
        editorName: 'ปวีณา ส.',
        editorRole: 'AM ภาคตะวันออกเฉียงเหนือ',
        action: 'แก้ไขข้อมูลสัญญา',
        changesSummary: 'อัปเดตแจ้งเตือนวงเงินใกล้เต็ม 92.4% และส่งร่างขอ PO เสริม 500,000 บาท',
      },
    ],
  },
  {
    id: 'hosp-3',
    hcode: '10738',
    cusCode: 'CUS-00812',
    contractNumber: 'CNT-2567-015',
    name: 'รพ. ชลบุรี',
    hospitalType: 'รพ.ศูนย์ (A)',
    contractCategory: 'สัญญาจ้างระบบบริหารงานโลจิสติกส์และส่งยาการแพทย์ครบวงจร',
    contractStartDate: '2025-12-15',
    contractExpiryDate: '2026-12-15',
    contractDuration: '12 เดือน (365 วัน)',
    daysUntilExpiry: 71,
    contractStatus: 'มีผลบังคับใช้ (Active)',
    province: 'จ.ชลบุรี',
    region: 'ภาคตะวันออก',
    address: {
      fullAddress: '69 หมู่ 2 ถนนสุขุมวิท ตำบลบ้านสวน อำเภอเมืองชลบุรี จังหวัดชลบุรี 20000',
      subdistrict: 'ตำบลบ้านสวน',
      district: 'อำเภอเมืองชลบุรี',
      province: 'ชลบุรี',
      postalCode: '20000',
    },
    hospitalPhone: '038-931-000',
    hospitalDirector: 'นพ. ชัยณรงค์ บัณฑิตกุล (ผู้อำนวยการ)',
    hospitalCoordinator: 'ภญ. นภาพร สินธุเจริญ (ผช.ผอ. ด้านพัฒนาระบบยาและเวชภัณฑ์)',
    totalBudget: 8500000,
    spentBudget: 7420000,
    remainingBudget: 1080000,
    spentPercent: 87.3,
    poAmount: 8500000,
    dailyBurnRate: 14200,
    estimatedRunoutDays: 76,
    amName: 'กิตติศักดิ์ พ.',
    amPhone: '081-445-9821',
    amEmail: 'kittisak.p@company.com',
    statusRisk: 'warning',
    legalStatus: 'ตีตราสารค้าง (>7 วัน)',
    stampDutyStatus: 'ค้างดำเนินการ',
    monthlyTransactions: 3150,
    lastUpdated: '1 ชั่วโมงที่แล้ว',
    alertType: 'Legal Bottleneck',
    alertDescription: 'มีเอกสารแนบท้ายสัญญาและตีตราสารค้างดำเนินการเกิน 7 วันทำการ ณ ฝ่ายนิติการ (Legal Dept) ส่งผลให้เบิกจ่ายงวด 3 ล่าช้า',
    systemRecommendation: 'ประสานงานฝ่ายนิติการเพื่อเร่งรัดการลงนามผู้มีอำนาจและชำระอากรแสตมป์อิเล็กทรอนิกส์ (อ.ส.๙) ทันที',
    documents: {
      qt: {
        docNumber: 'QT-2567-015-CBR-CENTRAL',
        date: '2025-11-10',
        amount: 8500000,
        title: 'ใบเสนอราคาบริการขนส่งยาเวชภัณฑ์และเชื่อมต่อ API ระบบ HIS รพ.ชลบุรี',
        status: 'อนุมัติแล้ว',
        approvedBy: 'นพ. ชัยณรงค์ บัณฑิตกุล',
        itemsCount: 170000,
        unitPricePerTrip: 50,
      },
      po: {
        docNumber: 'PO-CBR-MED-67-088',
        date: '2025-12-01',
        amount: 8500000,
        title: 'ใบสั่งจ้างผู้ให้บริการจัดส่งยาและตรวจเลือดก่อนพบแพทย์ รพ.ชลบุรี',
        status: 'เบิกจ่ายตามงวด',
        disbursementPeriod: 'งวดที่ 1-2 ผ่านแล้ว, งวดที่ 3 ชะลอเนื่องจากตีตราสารค้าง',
        paymentTerms: 'เครดิตเทอม 30 วัน',
      },
      tor: {
        docNumber: 'TOR-CHONBURI-LOGISTICS-2567',
        version: 'ฉบับสมบูรณ์ (e-GP)',
        effectiveDate: '2025-12-15',
        scopeSummary: 'ขนส่งยาครอบคลุม อ.เมือง, อ.ศรีราชา, อ.บ้านบึง พร้อมห้องควบคุมอุณหภูมิตามมาตรฐาน GSDP',
        serviceRadiusKm: 40,
        slaHours: 3,
        penaltyPerLateHour: 100,
      },
      contractAgreement: {
        contractNumber: 'CNT-2567-015',
        signedDate: '2025-12-15',
        effectiveStartDate: '2025-12-15',
        effectiveEndDate: '2026-12-15',
        stampDutyNumber: 'รอชำระ อ.ส.๙ (ค้าง ณ นิติการ)',
      },
    },
    attachedFiles: [],
    auditLogs: [],
  },
  {
    id: 'hosp-4',
    hcode: '11422',
    cusCode: 'CUS-05118',
    contractNumber: 'CNT-2567-063',
    name: 'รพ. สมเด็จพระยุพราชเด่นชัย',
    hospitalType: 'รพ.ชุมชน (M2/F)',
    contractCategory: 'สัญญาจ้างบริการจัดส่งยาถึงบ้าน (สัญญารายปี)',
    contractStartDate: '2025-11-15',
    contractExpiryDate: '2026-11-15',
    contractDuration: '12 เดือน (365 วัน)',
    daysUntilExpiry: 41,
    contractStatus: 'มีผลบังคับใช้ (Active)',
    province: 'จ.แพร่',
    region: 'ภาคเหนือ',
    address: {
      fullAddress: '235 หมู่ 10 ถนนยันตรกิจโกศล ตำบลเด่นชัย อำเภอเด่นชัย จังหวัดแพร่ 54110',
      subdistrict: 'ตำบลเด่นชัย',
      district: 'อำเภอเด่นชัย',
      province: 'แพร่',
      postalCode: '54110',
    },
    hospitalPhone: '054-613-111',
    hospitalDirector: 'นพ. สิทธิชัย วงศ์สุวรรณ (ผู้อำนวยการ)',
    hospitalCoordinator: 'ภญ. พัชรี แสนสุข (หัวหน้างานเภสัชกรรม)',
    totalBudget: 1500000,
    spentBudget: 1263000,
    remainingBudget: 237000,
    spentPercent: 84.2,
    poAmount: 1500000,
    dailyBurnRate: 1650,
    estimatedRunoutDays: 29,
    amName: 'ชนาภร ว.',
    amPhone: '086-339-4412',
    amEmail: 'chanaporn.w@company.com',
    statusRisk: 'warning',
    legalStatus: 'ปกติ (สมบูรณ์)',
    stampDutyStatus: 'ชำระ e-Stamp แล้ว',
    monthlyTransactions: 780,
    lastUpdated: '40 นาทีที่แล้ว',
    documents: {
      qt: {
        docNumber: 'QT-2567-063-DC',
        date: '2025-11-01',
        amount: 1500000,
        title: 'ใบเสนอราคาบริการจัดส่งยาถึงบ้าน เครือข่าย รพ.สมเด็จพระยุพราชเด่นชัย',
        status: 'อนุมัติแล้ว',
        approvedBy: 'นพ. สิทธิชัย วงศ์สุวรรณ',
        itemsCount: 30000,
        unitPricePerTrip: 50,
      },
      po: {
        docNumber: 'PO-DCH-67-0091',
        date: '2025-11-15',
        amount: 1500000,
        title: 'ใบสั่งจ้างขนส่งเวชภัณฑ์ทางไปรษณีย์และพนักงานจัดส่งพื้นที่สูง',
        status: 'ออกใบสั่งซื้อแล้ว',
        disbursementPeriod: 'เบิกจ่ายรายเดือน',
        paymentTerms: 'เครดิตเทอม 30 วัน',
      },
      tor: {
        docNumber: 'TOR-DCH-YUP-2567',
        version: 'ฉบับมาตรฐาน สปสช.',
        effectiveDate: '2025-11-15',
        scopeSummary: 'ส่งมอบยาถึงบ้านผู้ป่วยติดเตียงและผู้สูงอายุในหุบเขา',
        serviceRadiusKm: 30,
        slaHours: 5,
        penaltyPerLateHour: 50,
      },
      contractAgreement: {
        contractNumber: 'CNT-2567-063',
        signedDate: '2025-11-15',
        effectiveStartDate: '2025-11-15',
        effectiveEndDate: '2026-11-15',
        stampDutyNumber: 'ESM-2567-063-PHRAE',
      },
    },
    attachedFiles: [],
    auditLogs: [],
  },
  {
    id: 'hosp-5',
    hcode: '10915',
    cusCode: 'CUS-03229',
    contractNumber: 'CNT-2567-109',
    name: 'รพ. ปากช่องนานา',
    hospitalType: 'รพ.ทั่วไป (S/M1)',
    contractCategory: 'สัญญาจ้างบริการจัดส่งยาถึงบ้านและจุดบริการใกล้บ้าน (สัญญารายปี)',
    contractStartDate: '2025-11-28',
    contractExpiryDate: '2026-11-28',
    contractDuration: '12 เดือน (365 วัน)',
    daysUntilExpiry: 54,
    contractStatus: 'มีผลบังคับใช้ (Active)',
    province: 'จ.นครราชสีมา',
    region: 'ภาคตะวันออกเฉียงเหนือ',
    address: {
      fullAddress: '112 ถนนมิตรภาพ ตำบลปากช่อง อำเภอปากช่อง จังหวัดนครราชสีมา 30130',
      subdistrict: 'ตำบลปากช่อง',
      district: 'อำเภอปากช่อง',
      province: 'นครราชสีมา',
      postalCode: '30130',
    },
    hospitalPhone: '044-311-855',
    hospitalDirector: 'นพ. ณรงค์ศักดิ์ บำรุงจิตต์ (ผู้อำนวยการ)',
    hospitalCoordinator: 'ภก. วิทวัส มิ่งขวัญ (หัวหน้ากลุ่มงานเภสัชกรรม)',
    totalBudget: 3200000,
    spentBudget: 2608000,
    remainingBudget: 592000,
    spentPercent: 81.5,
    poAmount: 3200000,
    dailyBurnRate: 4800,
    estimatedRunoutDays: 34,
    amName: 'ศศิธร ม.',
    amPhone: '084-129-9943',
    amEmail: 'sasithorn.m@company.com',
    statusRisk: 'warning',
    legalStatus: 'ปกติ (สมบูรณ์)',
    stampDutyStatus: 'ชำระ e-Stamp แล้ว',
    monthlyTransactions: 1650,
    lastUpdated: '2 ชั่วโมงที่แล้ว',
    documents: {
      qt: {
        docNumber: 'QT-2567-109-PKC',
        date: '2025-11-20',
        amount: 3200000,
        title: 'ใบเสนอราคาจัดส่งยาถึงบ้านโครงการโซนเขาใหญ่-ปากช่อง',
        status: 'อนุมัติแล้ว',
        approvedBy: 'นพ. ณรงค์ศักดิ์ บำรุงจิตต์',
        itemsCount: 64000,
        unitPricePerTrip: 50,
      },
      po: {
        docNumber: 'PO-PKC-67-0245',
        date: '2025-11-28',
        amount: 3200000,
        title: 'ใบสั่งจ้างบริการส่งยาถึงบ้านผู้ป่วย รพ.ปากช่องนานา',
        status: 'ออกใบสั่งซื้อแล้ว',
        disbursementPeriod: 'เบิกจ่ายรายเดือน',
        paymentTerms: 'เครดิตเทอม 30 วัน',
      },
      tor: {
        docNumber: 'TOR-PKC-2567-V1',
        version: 'ฉบับสมบูรณ์',
        effectiveDate: '2025-11-28',
        scopeSummary: 'จัดส่งยาครอบคลุมพื้นที่ อ.ปากช่อง และเขตอุทยานแห่งชาติเขาใหญ่',
        serviceRadiusKm: 45,
        slaHours: 4,
        penaltyPerLateHour: 50,
      },
      contractAgreement: {
        contractNumber: 'CNT-2567-109',
        signedDate: '2025-11-28',
        effectiveStartDate: '2025-11-28',
        effectiveEndDate: '2026-11-28',
        stampDutyNumber: 'ESM-2567-109-KORAT-PKC',
      },
    },
    attachedFiles: [],
    auditLogs: [],
  },
  {
    id: 'hosp-6',
    hcode: '10668',
    cusCode: 'CUS-01004',
    contractNumber: 'CNT-2567-004',
    name: 'รพ. มหาราชนครราชสีมา',
    hospitalType: 'รพ.ศูนย์ (A)',
    contractCategory: 'สัญญาจ้างบริการขนส่งยาและระบบโลจิสติกส์การแพทย์ศูนย์ความเป็นเลิศ',
    contractStartDate: '2025-10-25',
    contractExpiryDate: '2026-10-25',
    contractDuration: '12 เดือน (365 วัน)',
    daysUntilExpiry: 20,
    contractStatus: 'มีผลบังคับใช้ (Active)',
    province: 'จ.นครราชสีมา',
    region: 'ภาคตะวันออกเฉียงเหนือ',
    address: {
      fullAddress: '49 ถนนช้างเผือก ตำบลในเมือง อำเภอเมืองนครราชสีมา จังหวัดนครราชสีมา 30000',
      subdistrict: 'ตำบลในเมือง',
      district: 'อำเภอเมืองนครราชสีมา',
      province: 'นครราชสีมา',
      postalCode: '30000',
    },
    hospitalPhone: '044-235-000',
    hospitalDirector: 'นพ. ประวีณ ตัณฑประภา (ผู้อำนวยการ)',
    hospitalCoordinator: 'ภญ. รัตนาภรณ์ ธนากุล (หน.ฝ่ายบริหารจัดการระบบยา)',
    totalBudget: 9000000,
    spentBudget: 9640000,
    remainingBudget: -640000,
    spentPercent: 107.1,
    poAmount: 9000000,
    dailyBurnRate: 18500,
    estimatedRunoutDays: 0,
    amName: 'ศศิธร ม.',
    amPhone: '084-129-9943',
    amEmail: 'sasithorn.m@company.com',
    statusRisk: 'over_budget',
    legalStatus: 'รอนิติการตรวจสอบ',
    stampDutyStatus: 'ค้างดำเนินการ',
    monthlyTransactions: 4200,
    lastUpdated: '15 นาทีที่แล้ว',
    documents: {
      qt: {
        docNumber: 'QT-2567-004-MAHARAJ',
        date: '2025-10-18',
        amount: 9000000,
        title: 'ใบเสนอราคาบริการระบบขนส่งยาและเวชภัณฑ์ผู้ป่วยนอก รพ.มหาราชนครราชสีมา',
        status: 'อนุมัติแล้ว',
        approvedBy: 'นพ. ประวีณ ตัณฑประภา',
        itemsCount: 180000,
        unitPricePerTrip: 50,
      },
      po: {
        docNumber: 'PO-MHR-67-0012',
        date: '2025-10-25',
        amount: 9000000,
        title: 'ใบสั่งจ้างบริการส่งยา รพ.ศูนย์มหาราชนครราชสีมา',
        status: 'เบิกจ่ายตามงวด',
        disbursementPeriod: 'เบิกจ่ายเกินเพดานงบประมาณ รอใบ PO เสริมฉุกเฉิน',
        paymentTerms: 'เครดิตเทอม 30 วัน',
      },
      tor: {
        docNumber: 'TOR-MHR-EXP-2567',
        version: 'ฉบับสมบูรณ์ (e-GP)',
        effectiveDate: '2025-10-25',
        scopeSummary: 'จัดส่งยาในเขตเมืองนครราชสีมาและอำเภอเครือข่าย 8 อำเภอ',
        serviceRadiusKm: 50,
        slaHours: 3,
        penaltyPerLateHour: 100,
      },
      contractAgreement: {
        contractNumber: 'CNT-2567-004',
        signedDate: '2025-10-25',
        effectiveStartDate: '2025-10-25',
        effectiveEndDate: '2026-10-25',
        stampDutyNumber: 'ESM-2567-004-MHR-KORAT',
      },
    },
    attachedFiles: [],
    auditLogs: [],
  },
  {
    id: 'hosp-7',
    hcode: '10744',
    cusCode: 'CUS-08912',
    contractNumber: 'CNT-2567-058',
    name: 'รพ. นครพิงค์',
    hospitalType: 'รพ.ศูนย์ (A)',
    contractCategory: 'สัญญาจ้างบริการจัดส่งยาถึงบ้าน (สัญญารายปี)',
    contractStartDate: '2025-11-05',
    contractExpiryDate: '2026-11-05',
    contractDuration: '12 เดือน (365 วัน)',
    daysUntilExpiry: 31,
    contractStatus: 'มีผลบังคับใช้ (Active)',
    province: 'จ.เชียงใหม่',
    region: 'ภาคเหนือ',
    address: {
      fullAddress: '199 หมู่ 10 ถนนโชตนา ตำบลดอนแก้ว อำเภอแม่ริม จังหวัดเชียงใหม่ 50180',
      subdistrict: 'ตำบลดอนแก้ว',
      district: 'อำเภอแม่ริม',
      province: 'เชียงใหม่',
      postalCode: '50180',
    },
    hospitalPhone: '053-999-200',
    hospitalDirector: 'นพ. วรเชษฐ เต๋ชะรัก (ผู้อำนวยการ)',
    hospitalCoordinator: 'ภญ. อรอุมา ศรีวิชัย (หัวหน้ากลุ่มงานเภสัชกรรม)',
    totalBudget: 7500000,
    spentBudget: 8100000,
    remainingBudget: -600000,
    spentPercent: 108.0,
    poAmount: 7500000,
    dailyBurnRate: 15200,
    estimatedRunoutDays: 0,
    amName: 'ชนาภร ว.',
    amPhone: '086-339-4412',
    amEmail: 'chanaporn.w@company.com',
    statusRisk: 'over_budget',
    legalStatus: 'ร่างสัญญาปี 68',
    stampDutyStatus: 'รอชำระอากร',
    monthlyTransactions: 2890,
    lastUpdated: '1 ชั่วโมงที่แล้ว',
    documents: {
      qt: {
        docNumber: 'QT-2567-058-NKP',
        date: '2025-10-20',
        amount: 7500000,
        title: 'ใบเสนอราคาบริการระบบส่งยาถึงบ้าน เชียงใหม่-แม่ริม',
        status: 'อนุมัติแล้ว',
        approvedBy: 'นพ. วรเชษฐ เต๋ชะรัก',
        itemsCount: 150000,
        unitPricePerTrip: 50,
      },
      po: {
        docNumber: 'PO-NKP-67-0301',
        date: '2025-11-05',
        amount: 7500000,
        title: 'ใบสั่งจ้างบริการส่งยาถึงบ้าน รพ.นครพิงค์',
        status: 'เบิกจ่ายตามงวด',
        disbursementPeriod: 'เบิกจ่ายงวดเกินเพดาน รอส่วนขยาย',
        paymentTerms: 'เครดิตเทอม 30 วัน',
      },
      tor: {
        docNumber: 'TOR-NKP-HR-2567',
        version: 'ฉบับสมบูรณ์',
        effectiveDate: '2025-11-05',
        scopeSummary: 'จัดส่งยาครอบคลุม อ.แม่ริม, อ.สันทราย, อ.เมืองเชียงใหม่ และหางดง',
        serviceRadiusKm: 35,
        slaHours: 4,
        penaltyPerLateHour: 60,
      },
      contractAgreement: {
        contractNumber: 'CNT-2567-058',
        signedDate: '2025-11-05',
        effectiveStartDate: '2025-11-05',
        effectiveEndDate: '2026-11-05',
        stampDutyNumber: 'ESM-2567-058-NKP-CNX',
      },
    },
    attachedFiles: [],
    auditLogs: [],
  },
  {
    id: 'hosp-8',
    hcode: '10708',
    cusCode: 'CUS-04218',
    contractNumber: 'CNT-2567-033',
    name: 'รพ. สระบุรี',
    hospitalType: 'รพ.ศูนย์ (A)',
    contractCategory: 'สัญญาจ้างบริการจัดส่งยาถึงบ้าน (สัญญารายปี)',
    contractStartDate: '2025-11-12',
    contractExpiryDate: '2026-11-12',
    contractDuration: '12 เดือน (365 วัน)',
    daysUntilExpiry: 38,
    contractStatus: 'มีผลบังคับใช้ (Active)',
    province: 'จ.สระบุรี',
    region: 'ภาคกลาง',
    address: {
      fullAddress: '18 ถนนเทศบาล 4 ตำบลปากเพรียว อำเภอเมืองสระบุรี จังหวัดสระบุรี 18000',
      subdistrict: 'ตำบลปากเพรียว',
      district: 'อำเภอเมืองสระบุรี',
      province: 'สระบุรี',
      postalCode: '18000',
    },
    hospitalPhone: '036-343-500',
    hospitalDirector: 'นพ. อนันต์ กมลเนตร (ผู้อำนวยการ)',
    hospitalCoordinator: 'ภก. ประสิทธิ์ รัตนกิตติ (หัวหน้ากลุ่มงานเภสัชกรรม)',
    totalBudget: 6000000,
    spentBudget: 6600000,
    remainingBudget: -600000,
    spentPercent: 110.0,
    poAmount: 6000000,
    dailyBurnRate: 11800,
    estimatedRunoutDays: 0,
    amName: 'วรพจน์ ท.',
    amPhone: '085-778-9012',
    amEmail: 'worapot.t@company.com',
    statusRisk: 'over_budget',
    legalStatus: 'รอเอกสารแนบท้าย',
    stampDutyStatus: 'รอชำระอากร',
    monthlyTransactions: 2100,
    lastUpdated: '3 ชั่วโมงที่แล้ว',
    documents: {
      qt: {
        docNumber: 'QT-2567-033-SRB',
        date: '2025-10-30',
        amount: 6000000,
        title: 'ใบเสนอราคาจัดส่งยาถึงบ้าน รพ.สระบุรี',
        status: 'อนุมัติแล้ว',
        approvedBy: 'นพ. อนันต์ กมลเนตร',
        itemsCount: 120000,
        unitPricePerTrip: 50,
      },
      po: {
        docNumber: 'PO-SRB-67-0199',
        date: '2025-11-12',
        amount: 6000000,
        title: 'ใบสั่งจ้างบริการส่งยาถึงบ้านผู้ป่วยเรื้อรัง รพ.สระบุรี',
        status: 'เบิกจ่ายตามงวด',
        disbursementPeriod: 'เบิกจ่ายตามผลงาน',
        paymentTerms: 'เครดิตเทอม 30 วัน',
      },
      tor: {
        docNumber: 'TOR-SRB-HR-2567',
        version: 'ฉบับสมบูรณ์',
        effectiveDate: '2025-11-12',
        scopeSummary: 'ขนส่งยาในรัศมี 30 กม. และมีตู้ควบคุมความเย็นสำหรับยาฉีดเบาหวาน',
        serviceRadiusKm: 30,
        slaHours: 4,
        penaltyPerLateHour: 50,
      },
      contractAgreement: {
        contractNumber: 'CNT-2567-033',
        signedDate: '2025-11-12',
        effectiveStartDate: '2025-11-12',
        effectiveEndDate: '2026-11-12',
        stampDutyNumber: 'ESM-2567-033-SRB-CENTRAL',
      },
    },
    attachedFiles: [],
    auditLogs: [],
  },
];

export const INITIAL_TASKS: TaskItem[] = [
  {
    id: 'tsk-1',
    title: 'จัดส่งบันทึกขอขยายเพดานวงเงินและต่อสัญญาปี 2568',
    hospitalName: 'โรงพยาบาลขลุง',
    contractCode: 'CNT-2567-089',
    column: 'renewal',
    priority: 'high',
    assignedTo: 'กิตติศักดิ์ พ.',
    dueDate: '2026-10-12',
    tag: 'ด่วนที่สุด (<25 วัน)',
    budgetAmount: 2000000,
    notes: 'วงเงินเหลือ 8.2% เบิร์นเฉลี่ยวันละ 9,100 บาท จะหมดใน 18 วัน',
  },
  {
    id: 'tsk-2',
    title: 'จัดทำร่างสัญญาต่ออายุประจำปี 2568 เครือข่ายสุขภาพที่ 2',
    hospitalName: 'รพ. นครพิงค์',
    contractCode: 'CNT-2567-058',
    column: 'renewal',
    priority: 'high',
    assignedTo: 'ชนาภร ว.',
    dueDate: '2026-10-15',
    tag: 'งบเกิน 100%',
    budgetAmount: 7500000,
    notes: 'เกินเพดาน 600,000 บาท รอลงนามฉบับแก้ไข',
  },
  {
    id: 'tsk-3',
    title: 'ร่างสัญญาต่ออายุและปรับเพดานวงเงิน',
    hospitalName: 'รพ. พุทธชินราช',
    contractCode: 'CNT-2567-210',
    column: 'renewal',
    priority: 'medium',
    assignedTo: 'ชนาภร ว.',
    dueDate: '2026-10-18',
    tag: 'หมดอายุใน 28 วัน',
    budgetAmount: 8000000,
  },
  {
    id: 'tsk-4',
    title: 'เร่งรัดตีตราสารอากรแสตมป์อิเล็กทรอนิกส์ (อ.ส.๙) งวด 3',
    hospitalName: 'รพ. ชลบุรี',
    contractCode: 'CNT-2567-015',
    column: 'stamp',
    priority: 'high',
    assignedTo: 'กิตติศักดิ์ พ. / Legal Dept',
    dueDate: '2026-10-10',
    tag: 'ค้าง >7 วันทำการ',
    budgetAmount: 8500000,
    notes: 'ส่งผลให้การเบิกจ่ายงวดที่ 3 ล่าช้า นิติการนัดตรวจเอกสารบ่ายนี้',
  },
  {
    id: 'tsk-5',
    title: 'ตรวจสอบเอกสารมอบอำนาจและตีตราสารสัญญาแนบท้าย',
    hospitalName: 'รพ. พระนครศรีอยุธยา',
    contractCode: 'CNT-2567-201',
    column: 'stamp',
    priority: 'medium',
    assignedTo: 'วรพจน์ ท. / ฝ่ายนิติการ',
    dueDate: '2026-10-14',
    tag: 'รอตีตราสาร',
    budgetAmount: 4200000,
  },
  {
    id: 'tsk-6',
    title: 'รอรับใบสั่งจ้าง (PO) วงเงินส่วนต่อขยาย 500,000 บาท',
    hospitalName: 'โรงพยาบาลน้ำยืน',
    contractCode: 'CNT-2567-142',
    column: 'po',
    priority: 'high',
    assignedTo: 'ปวีณา ส.',
    dueDate: '2026-10-11',
    tag: 'งบใกล้เต็ม 92.4%',
    budgetAmount: 1000000,
    notes: 'ฝ่ายการเงิน รพ. เสนอ ผอ. เซ็นรับทราบแล้ว รอเลข PO ทางราชการ',
  },
  {
    id: 'tsk-7',
    title: 'ติดตามใบ PO งวดเงินไตรมาส 4 ประจำปีงบประมาณ',
    hospitalName: 'รพ. สระบุรี',
    contractCode: 'CNT-2567-033',
    column: 'po',
    priority: 'high',
    assignedTo: 'วรพจน์ ท.',
    dueDate: '2026-10-13',
    tag: 'จัดซื้อรอดำเนินการ',
    budgetAmount: 6000000,
  },
  {
    id: 'tsk-8',
    title: 'ตรวจรับงานและออกใบเสร็จรับเงินงวดสุดท้าย',
    hospitalName: 'รพ. ตรัง',
    contractCode: 'CNT-2567-084',
    column: 'done',
    priority: 'low',
    assignedTo: 'สมโภช บ.',
    dueDate: '2026-10-02',
    tag: 'เสร็จสมบูรณ์',
    budgetAmount: 4500000,
    notes: 'ปิดรอบส่งมอบเรียบร้อย ตราสารอากรครบถ้วน',
  },
];

export interface RoleConfig {
  id: 'admin' | 'am_north' | 'am_northeast' | 'am_south';
  name: string;
  badge: string;
  tagline: string;
  description: string;
  tier: string;
  isCentralAdmin: boolean;
  allowedRegions: Array<'ภาคกลาง' | 'ภาคเหนือ' | 'ภาคตะวันออกเฉียงเหนือ' | 'ภาคตะวันออก' | 'ภาคตะวันตก' | 'ภาคใต้'>;
  amName?: string;
  canEditRestrictedFields: boolean; // เช่น วงเงินเพดานหลัก, H-Code
  canExport: boolean; // เฉพาะ Admin ส่วนกลางเท่านั้นที่ Export Excel ได้
  canImport: boolean; // เฉพาะ Admin ส่วนกลางเท่านั้นที่ Import Excel ได้
  canApproveBudget: boolean;
}

export const ROLES_CONFIG: Record<'admin' | 'am_north' | 'am_northeast' | 'am_south', RoleConfig> = {
  admin: {
    id: 'admin',
    name: 'Admin ส่วนกลาง (Central Admin)',
    badge: 'Admin ส่วนกลาง',
    tagline: 'CENTRAL GOVERNANCE',
    description: 'บัญชีหลักส่วนกลาง เข้าถึงและควบคุมโรงพยาบาลได้ทุกภาคทั่วประเทศ มีสิทธิ์แก้ไขทุกฟิลด์ รวมทั้งนำเข้า/ส่งออก Excel (Import/Export)',
    tier: 'TIER 1 (CENTRAL ADMIN)',
    isCentralAdmin: true,
    allowedRegions: ['ภาคเหนือ', 'ภาคกลาง', 'ภาคตะวันออกเฉียงเหนือ', 'ภาคตะวันออก', 'ภาคตะวันตก', 'ภาคใต้'],
    canEditRestrictedFields: true,
    canExport: true,
    canImport: true,
    canApproveBudget: true,
  },
  am_north: {
    id: 'am_north',
    name: 'AM ภาคเหนือ (ดูแลภาคเหนือ + ภาคกลาง)',
    badge: 'AM เหนือ & กลาง',
    tagline: 'NORTH & CENTRAL REGION',
    description: 'รับผิดชอบโรงพยาบาลในเขตภาคเหนือและภาคกลาง มีหน้าที่อัปเดตไฟล์สัญญา ใบเสนอราคา TOR (เฉพาะ PDF/PNG) ไม่สามารถ Import/Export Excel ได้',
    tier: 'TIER 2 (REGIONAL AM)',
    isCentralAdmin: false,
    allowedRegions: ['ภาคเหนือ', 'ภาคกลาง'],
    amName: 'ชนาภร ว. (AM เหนือ-กลาง)',
    canEditRestrictedFields: false,
    canExport: false,
    canImport: false,
    canApproveBudget: false,
  },
  am_northeast: {
    id: 'am_northeast',
    name: 'AM ภาคอีสาน (ดูแลตะวันออกเฉียงเหนือ)',
    badge: 'AM ภาคอีสาน',
    tagline: 'NORTHEAST REGION',
    description: 'รับผิดชอบโรงพยาบาลในเขตภาคตะวันออกเฉียงเหนือ มีหน้าที่อัปเดตไฟล์สัญญา ใบเสนอราคา TOR (เฉพาะ PDF/PNG) ไม่สามารถ Import/Export Excel ได้',
    tier: 'TIER 2 (REGIONAL AM)',
    isCentralAdmin: false,
    allowedRegions: ['ภาคตะวันออกเฉียงเหนือ'],
    amName: 'ปวีณา ส. (AM อีสาน)',
    canEditRestrictedFields: false,
    canExport: false,
    canImport: false,
    canApproveBudget: false,
  },
  am_south: {
    id: 'am_south',
    name: 'AM ภาคใต้ (ดูแลตะวันออก ตะวันตก ใต้)',
    badge: 'AM ตะวันออก-ตก-ใต้',
    tagline: 'EAST, WEST & SOUTH',
    description: 'รับผิดชอบโรงพยาบาลในเขตภาคตะวันออก ภาคตะวันตก และภาคใต้ มีหน้าที่อัปเดตไฟล์สัญญา ใบเสนอราคา TOR (เฉพาะ PDF/PNG) ไม่สามารถ Import/Export Excel ได้',
    tier: 'TIER 2 (REGIONAL AM)',
    isCentralAdmin: false,
    allowedRegions: ['ภาคตะวันออก', 'ภาคตะวันตก', 'ภาคใต้'],
    amName: 'สมโภช บ. (AM ตะวันออก-ตก-ใต้)',
    canEditRestrictedFields: false,
    canExport: false,
    canImport: false,
    canApproveBudget: false,
  },
};

export const INITIAL_PENDING_REQUESTS: PendingChangeRequest[] = [
  {
    id: 'req-001',
    hospitalId: 'hosp-1',
    hospitalName: 'โรงพยาบาลขลุง',
    hcode: '10492',
    region: 'ภาคตะวันออก',
    proposerName: 'สมโภช บ. (AM ตะวันออก-ตก-ใต้)',
    proposerRole: 'am_south',
    proposerEmail: 'am.south.east.west@gmail.com',
    submittedAt: '05 ต.ค. 2569 09:30 น.',
    requestType: 'update_contract',
    status: 'pending',
    reviewNotes: 'ขอเสนอขยายเพดานวงเงินสัญญาหลักจาก 2,000,000 บาท เป็น 2,500,000 บาท เนื่องจากยอดผู้ป่วยรับยาที่บ้านสูงกว่าเป้าหมาย 40% และแนบใบเสนอราคา QT ฉบับปรับปรุงใหม่แล้ว',
    originalData: {
      contractNumber: 'CNT-2567-089',
      contractStartDate: '2025-11-01',
      contractExpiryDate: '2026-10-30',
      contractDuration: '12 เดือน (365 วัน)',
      contractCategory: 'สัญญาจ้างบริการจัดส่งยาถึงบ้าน (สัญญารายปี)',
      contractBillingType: 'annual_budget',
      totalBudget: 2000000,
      poAmount: 2000000,
      contractStatus: 'ใกล้หมดอายุ',
    },
    proposedData: {
      id: 'hosp-1',
      hcode: '10492',
      cusCode: 'CUS-10492',
      contractNumber: 'CNT-2567-089/V2',
      name: 'โรงพยาบาลขลุง',
      hospitalType: 'รพ.ชุมชน (M2/F)',
      contractCategory: 'สัญญาจ้างบริการจัดส่งยาถึงบ้าน (สัญญารายปี)',
      contractBillingType: 'annual_budget',
      contractStartDate: '2025-11-01',
      contractExpiryDate: '2026-10-30',
      contractDuration: '12 เดือน (365 วัน)',
      daysUntilExpiry: 25,
      contractStatus: 'ใกล้หมดอายุ',
      province: 'จ.จันทบุรี',
      region: 'ภาคตะวันออก',
      address: {
        fullAddress: '84 หมู่ที่ 1 ถนนเทศบาล 4 ตำบลขลุง อำเภอขลุง จังหวัดจันทบุรี 22110',
        subdistrict: 'ตำบลขลุง',
        district: 'อำเภอขลุง',
        province: 'จันทบุรี',
        postalCode: '22110',
      },
      hospitalPhone: '039-441-345',
      hospitalDirector: 'นพ. ชัยรัตน์ พงษ์ศิริ (ผู้อำนวยการ)',
      hospitalCoordinator: 'ภญ. พรรณนิภา จันทร์ดี (หัวหน้ากลุ่มงานเภสัชกรรม)',
      totalBudget: 2500000,
      spentBudget: 1836000,
      remainingBudget: 664000,
      spentPercent: 73.44,
      poAmount: 2500000,
      dailyBurnRate: 9100,
      estimatedRunoutDays: 73,
      amName: 'สมโภช บ. (AM ตะวันออก-ตก-ใต้)',
      amPhone: '081-445-9821',
      amEmail: 'am.south.east.west@gmail.com',
      statusRisk: 'normal',
      legalStatus: 'ร่างสัญญาปี 68',
      stampDutyStatus: 'รอชำระอากร',
      monthlyTransactions: 1240,
      lastUpdated: 'รอส่วนกลางอนุมัติ',
      documents: {
        qt: {
          docNumber: 'QT-2567-089-V2',
          date: '2026-10-02',
          amount: 2500000,
          title: 'ใบเสนอราคาปรับปรุงวงเงินจัดส่งยาถึงบ้าน - รพ.ขลุง',
          status: 'รออนุมัติ',
          approvedBy: 'นพ. ชัยรัตน์ พงษ์ศิริ',
          itemsCount: 50000,
          unitPricePerTrip: 50,
        },
        po: {
          docNumber: 'PO-KLUNG-67-0044',
          date: '2025-11-01',
          amount: 2500000,
          title: 'ใบสั่งจ้างบริการส่งยาถึงบ้านผู้ป่วย รพ.ขลุง',
          status: 'รออนุมัติงบ',
          disbursementPeriod: 'แบ่งจ่าย 12 งวด (รายเดือน)',
          paymentTerms: 'เครดิตเทอม 30 วัน',
        },
        tor: {
          docNumber: 'TOR-KLUNG-2567-V1',
          version: 'ฉบับปรับปรุง 2.0',
          effectiveDate: '2025-11-01',
          scopeSummary: 'บริการจัดส่งยาถึงบ้านผู้ป่วยสิทธิบัตรทอง/ข้าราชการ ครอบคลุม 4 ตำบล รัศมี 25 กม.',
          serviceRadiusKm: 25,
          slaHours: 4,
          penaltyPerLateHour: 50,
        },
        contractAgreement: {
          contractNumber: 'CNT-2567-089',
          signedDate: '2025-10-28',
          effectiveStartDate: '2025-11-01',
          effectiveEndDate: '2026-10-30',
          stampDutyNumber: 'ESM-2567-089-CHAN-001',
        },
      },
      attachedFiles: [
        {
          id: 'att-klung-new',
          name: 'ใบเสนอราคาQT_ขอเพิ่มวงเงิน_2.5M.pdf',
          category: 'ใบเสนอราคา QT',
          fileSize: '1.8 MB',
          uploadDate: '05 ต.ค. 2569 09:28 น.',
          uploadedBy: 'สมโภช บ. (AM ตะวันออก-ตก-ใต้)',
        }
      ],
      auditLogs: [],
    }
  },
  {
    id: 'req-002',
    hospitalId: 'hosp-2',
    hospitalName: 'โรงพยาบาลน้ำยืน',
    hcode: '20184',
    region: 'ภาคตะวันออกเฉียงเหนือ',
    proposerName: 'ปวีณา ส. (AM อีสาน)',
    proposerRole: 'am_northeast',
    proposerEmail: 'am.northeast@gmail.com',
    submittedAt: '05 ต.ค. 2569 10:15 น.',
    requestType: 'update_contract',
    status: 'pending',
    reviewNotes: 'ขอขยายวงเงินสัญญาและใบสั่งจ้าง PO เป็น 1,500,000 บาท เนื่องจากเข้าสู่ช่วงฤดูฝน อัตราจัดส่งยาเพิ่มขึ้นเท่าตัว พร้อมแนบเอกสาร TOR ฉบับปรับปรุง (PDF)',
    originalData: {
      contractNumber: 'CNT-2567-142',
      contractStartDate: '2025-11-20',
      contractExpiryDate: '2026-11-20',
      contractDuration: '12 เดือน (365 วัน)',
      contractCategory: 'สัญญาจ้างบริการจัดส่งยาถึงบ้าน (สัญญารายปี)',
      contractBillingType: 'annual_budget',
      totalBudget: 1000000,
      poAmount: 1000000,
      contractStatus: 'มีผลบังคับใช้ (Active)',
    },
    proposedData: {
      id: 'hosp-2',
      hcode: '20184',
      cusCode: 'CUS-20184',
      contractNumber: 'CNT-2567-142/REV',
      name: 'โรงพยาบาลน้ำยืน',
      hospitalType: 'รพ.ชุมชน (M2/F)',
      contractCategory: 'สัญญาจ้างบริการจัดส่งยาถึงบ้าน (สัญญารายปี)',
      contractBillingType: 'annual_budget',
      contractStartDate: '2025-11-20',
      contractExpiryDate: '2026-11-20',
      contractDuration: '12 เดือน (365 วัน)',
      daysUntilExpiry: 46,
      contractStatus: 'มีผลบังคับใช้ (Active)',
      province: 'จ.อุบลราชธานี',
      region: 'ภาคตะวันออกเฉียงเหนือ',
      address: {
        fullAddress: '254 หมู่ 4 ตำบลสีวิเชียร อำเภอน้ำยืน จังหวัดอุบลราชธานี 34260',
        subdistrict: 'ตำบลสีวิเชียร',
        district: 'อำเภอน้ำยืน',
        province: 'อุบลราชธานี',
        postalCode: '34260',
      },
      hospitalPhone: '045-371-089',
      hospitalDirector: 'นพ. วรุตม์ เกียรติอนันต์',
      hospitalCoordinator: 'ภก. ธีระศักดิ์ สุขเกษม',
      totalBudget: 1500000,
      spentBudget: 924000,
      remainingBudget: 576000,
      spentPercent: 61.6,
      poAmount: 1500000,
      dailyBurnRate: 3450,
      estimatedRunoutDays: 167,
      amName: 'ปวีณา ส. (AM อีสาน)',
      amPhone: '089-223-1190',
      amEmail: 'am.northeast@gmail.com',
      statusRisk: 'normal',
      legalStatus: 'ปกติ (สมบูรณ์)',
      stampDutyStatus: 'ชำระ e-Stamp แล้ว',
      monthlyTransactions: 690,
      lastUpdated: 'รอส่วนกลางอนุมัติ',
      documents: {
        qt: {
          docNumber: 'QT-2567-142-NYN-V2',
          date: '2026-10-03',
          amount: 1500000,
          title: 'ใบเสนอราคาจัดส่งยาถึงบ้านโครงการผู้ป่วยรับยาใกล้บ้าน (งบขยาย)',
          status: 'รออนุมัติ',
          approvedBy: 'นพ. วรุตม์ เกียรติอนันต์',
          itemsCount: 30000,
          unitPricePerTrip: 50,
        },
        po: {
          docNumber: 'PO-NYN-67-0118-REV',
          date: '2026-10-03',
          amount: 1500000,
          title: 'ใบสั่งจ้างระบบจัดส่งยา รพ.น้ำยืน ส่วนเพิ่ม',
          status: 'รออนุมัติงบ',
          disbursementPeriod: 'แบ่งจ่ายตามผลการส่งมอบงาน',
          paymentTerms: 'เครดิตเทอม 30 วัน',
        },
        tor: {
          docNumber: 'TOR-NYN-HR-2567-V2',
          version: 'ฉบับเพิ่มเติม 2.0',
          effectiveDate: '2026-10-03',
          scopeSummary: 'บริการจัดส่งยาถึงบ้านในเขตพื้นที่ชายแดนและห่างไกล รัศมี 35 กิโลเมตร มีระบบ OTP ยืนยันตัวตนผู้ป่วย',
          serviceRadiusKm: 35,
          slaHours: 6,
          penaltyPerLateHour: 40,
        },
        contractAgreement: {
          contractNumber: 'CNT-2567-142',
          signedDate: '2025-11-20',
          effectiveStartDate: '2025-11-20',
          effectiveEndDate: '2026-11-20',
          stampDutyNumber: 'ESM-2567-142-UBON-901',
        },
      },
      attachedFiles: [
        {
          id: 'att-ny-new',
          name: 'TOR_ฉบับปรับปรุงวงเงิน_1.5M.pdf',
          category: 'TOR ขอบเขต',
          fileSize: '2.4 MB',
          uploadDate: '05 ต.ค. 2569 10:10 น.',
          uploadedBy: 'ปวีณา ส. (AM อีสาน)',
        }
      ],
      auditLogs: [],
    }
  }
];
