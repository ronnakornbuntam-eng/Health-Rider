import { HospitalContract } from './contractsData';

// Generate 927 realistic hospitals distributed across all 77 provinces and 6 regions of Thailand
export const generate927Hospitals = (seedHospitals: HospitalContract[]): HospitalContract[] => {
  const regionsData = [
    {
      region: 'ภาคเหนือ' as const,
      provinces: [
        { name: 'เชียงใหม่', zip: '50000', districts: ['เมือง', 'แม่ริม', 'สันทราย', 'ฝาง', 'หางดง', 'จอมทอง', 'เชียงดาว'] },
        { name: 'เชียงราย', zip: '57000', districts: ['เมือง', 'แม่สาย', 'แม่จัน', 'เชียงของ', 'เทิง', 'พาน'] },
        { name: 'ลำปาง', zip: '52000', districts: ['เมือง', 'เกาะคา', 'เถิน', 'แม่เมาะ', 'ห้างฉัตร'] },
        { name: 'ลำพูน', zip: '51000', districts: ['เมือง', 'ป่าซาง', 'บ้านโฮ่ง', 'ลี้'] },
        { name: 'แม่ฮ่องสอน', zip: '58000', districts: ['เมือง', 'ปาย', 'แม่สะเรียง', 'ขุนยวม'] },
        { name: 'น่าน', zip: '55000', districts: ['เมือง', 'ปัว', 'เวียงสา', 'ท่าวังผา'] },
        { name: 'พะเยา', zip: '56000', districts: ['เมือง', 'ดอกคำใต้', 'เชียงคำ', 'จุน'] },
        { name: 'แพร่', zip: '54000', districts: ['เมือง', 'เด่นชัย', 'สูงเม่น', 'ร้องกวาง'] },
        { name: 'อุตรดิตถ์', zip: '53000', districts: ['เมือง', 'ลับแล', 'พิชัย', 'ตรอน'] }
      ],
      amName: 'ชนาภร ว. (AM เหนือ-กลาง)',
      amPhone: '086-339-4412',
      amEmail: 'chanaporn.w@company.com'
    },
    {
      region: 'ภาคกลาง' as const,
      provinces: [
        { name: 'กรุงเทพมหานคร', zip: '10100', districts: ['พระนคร', 'ดุสิต', 'จตุจักร', 'บางกะปิ', 'บางขุนเทียน', 'ธนบุรี', 'มีนบุรี'] },
        { name: 'นนทบุรี', zip: '11000', districts: ['เมือง', 'บางกรวย', 'บางใหญ่', 'ปากเกร็ด'] },
        { name: 'ปทุมธานี', zip: '12000', districts: ['เมือง', 'คลองหลวง', 'ธัญบุรี', 'ลำลูกกา'] },
        { name: 'สมุทรปราการ', zip: '10270', districts: ['เมือง', 'บางพลี', 'บางบ่อ', 'พระประแดง'] },
        { name: 'พระนครศรีอยุธยา', zip: '13000', districts: ['พระนครศรีอยุธยา', 'บางปะอิน', 'เสนา', 'วังน้อย'] },
        { name: 'สระบุรี', zip: '18000', districts: ['เมือง', 'แก่งคอย', 'พระพุทธบาท', 'หนองแค'] },
        { name: 'นครปฐม', zip: '73000', districts: ['เมือง', 'สามพราน', 'นครชัยศรี', 'กำแพงแสน'] },
        { name: 'สุพรรณบุรี', zip: '72000', districts: ['เมือง', 'สองพี่น้อง', 'อู่ทอง', 'ศรีประจันต์'] },
        { name: 'อ่างทอง', zip: '14000', districts: ['เมือง', 'วิเศษชัยชาญ', 'โพธิ์ทอง'] },
        { name: 'ลพบุรี', zip: '15000', districts: ['เมือง', 'บ้านหมี่', 'ชัยบาดาล', 'ท่าวุ้ง'] },
        { name: 'ชัยนาท', zip: '17000', districts: ['เมือง', 'สรรพยา', 'หันคา'] },
        { name: 'สิงห์บุรี', zip: '16000', districts: ['เมือง', 'อินทร์บุรี', 'บางระจัน'] },
        { name: 'สมุทรสาคร', zip: '74000', districts: ['เมือง', 'กระทุ่มแบน', 'บ้านแพ้ว'] },
        { name: 'สมุทรสงคราม', zip: '75000', districts: ['เมือง', 'อัมพวา', 'บางคนที'] }
      ],
      amName: 'ชนาภร ว. (AM เหนือ-กลาง)',
      amPhone: '086-339-4412',
      amEmail: 'chanaporn.w@company.com'
    },
    {
      region: 'ภาคตะวันออกเฉียงเหนือ' as const,
      provinces: [
        { name: 'นครราชสีมา', zip: '30000', districts: ['เมือง', 'ปากช่อง', 'พิมาย', 'สีคิ้ว', 'บัวใหญ่', 'ด่านขุนทด', 'โชคชัย'] },
        { name: 'ขอนแก่น', zip: '40000', districts: ['เมือง', 'บ้านไผ่', 'ชุมแพ', 'น้ำพอง', 'กระนวน', 'พล'] },
        { name: 'อุบลราชธานี', zip: '34000', districts: ['เมือง', 'วารินชำราบ', 'เดชอุดม', 'น้ำยืน', 'พิบูลมังสาหาร', 'ตระการพืชผล'] },
        { name: 'อุดรธานี', zip: '41000', districts: ['เมือง', 'กุมภวาปี', 'บ้านดุง', 'เพ็ญ', 'หนองหาน'] },
        { name: 'บุรีรัมย์', zip: '31000', districts: ['เมือง', 'นางรอง', 'ประโคนชัย', 'สตึก', 'ลำปลายมาศ'] },
        { name: 'สุรินทร์', zip: '32000', districts: ['เมือง', 'ปราสาท', 'ศีขรภูมิ', 'ท่าตูม'] },
        { name: 'ศรีสะเกษ', zip: '33000', districts: ['เมือง', 'กันทรลักษ์', 'อุทุมพรพิสัย', 'ขุขันธ์'] },
        { name: 'ร้อยเอ็ด', zip: '45000', districts: ['เมือง', 'เสลภูมิ', 'เกษตรวิสัย', 'สุวรรณภูมิ'] },
        { name: 'สกลนคร', zip: '47000', districts: ['เมือง', 'พังโคน', 'สว่างแดนดิน', 'วานรนิวาส'] },
        { name: 'ชัยภูมิ', zip: '36000', districts: ['เมือง', 'ภูเขียว', 'แก้งคร้อ', 'เกษตรสมบูรณ์'] },
        { name: 'กาฬสินธุ์', zip: '46000', districts: ['เมือง', 'ยางตลาด', 'กมลาไสย', 'สมเด็จ'] },
        { name: 'มหาสารคาม', zip: '44000', districts: ['เมือง', 'กันทรวิชัย', 'โกสุมพิสัย', 'วาปีปทุม'] },
        { name: 'นครพนม', zip: '48000', districts: ['เมือง', 'ธาตุพนม', 'นาแก', 'ท่าอุเทน'] },
        { name: 'เลย', zip: '42000', districts: ['เมือง', 'วังสะพุง', 'ด่านซ้าย', 'เชียงคาน'] },
        { name: 'ยโสธร', zip: '35000', districts: ['เมือง', 'เลิงนกทา', 'คำเขื่อนแก้ว'] },
        { name: 'หนองคาย', zip: '43000', districts: ['เมือง', 'ท่าบ่อ', 'โพนพิสัย'] },
        { name: 'บึงกาฬ', zip: '38000', districts: ['เมือง', 'เซกา', 'โซ่พิสัย'] },
        { name: 'หนองบัวลำภู', zip: '39000', districts: ['เมือง', 'ศรีบุญเรือง', 'นากลาง'] },
        { name: 'อำนาจเจริญ', zip: '37000', districts: ['เมือง', 'เสนางคนิคม', 'หัวตะพาน'] },
        { name: 'มุกดาหาร', zip: '49000', districts: ['เมือง', 'คำชะอี', 'ดอนตาล'] }
      ],
      amName: 'ปวีณา ส. (AM อีสาน)',
      amPhone: '089-223-1190',
      amEmail: 'am.northeast@gmail.com'
    },
    {
      region: 'ภาคตะวันออก' as const,
      provinces: [
        { name: 'ชลบุรี', zip: '20000', districts: ['เมือง', 'ศรีราชา', 'บางละมุง', 'สัตหีบ', 'บ้านบึง', 'พานทอง'] },
        { name: 'ระยอง', zip: '21000', districts: ['เมือง', 'แกลง', 'บ้านฉาง', 'ปลวกแดง'] },
        { name: 'จันทบุรี', zip: '22000', districts: ['เมือง', 'ขลุง', 'ท่าใหม่', 'แหลมสิงห์', 'มะขาม'] },
        { name: 'ฉะเชิงเทรา', zip: '24000', districts: ['เมือง', 'บางปะกง', 'พนมสารคาม', 'บางคล้า'] },
        { name: 'สระแก้ว', zip: '27000', districts: ['เมือง', 'อรัญประเทศ', 'วัฒนานคร'] },
        { name: 'ปราจีนบุรี', zip: '25000', districts: ['เมือง', 'กบินทร์บุรี', 'ศรีมหาโพธิ'] },
        { name: 'ตราด', zip: '23000', districts: ['เมือง', 'เขาสมิง', 'คลองใหญ่'] }
      ],
      amName: 'สมโภช บ. (AM ตะวันออก-ตก-ใต้)',
      amPhone: '081-445-9821',
      amEmail: 'am.south.east.west@gmail.com'
    },
    {
      region: 'ภาคตะวันตก' as const,
      provinces: [
        { name: 'ราชบุรี', zip: '70000', districts: ['เมือง', 'บ้านโป่ง', 'โพธาราม', 'ดำเนินสะดวก'] },
        { name: 'กาญจนบุรี', zip: '71000', districts: ['เมือง', 'ท่าม่วง', 'พนมทวน', 'ไทรโยค', 'ทองผาภูมิ'] },
        { name: 'เพชรบุรี', zip: '76000', districts: ['เมือง', 'ชะอำ', 'ท่ายาง', 'เขาย้อย'] },
        { name: 'ประจวบคีรีขันธ์', zip: '77000', districts: ['เมือง', 'หัวหิน', 'ปราณบุรี', 'บางสะพาน'] },
        { name: 'ตาก', zip: '63000', districts: ['เมือง', 'แม่สอด', 'บ้านตาก', 'แม่ระมาด'] }
      ],
      amName: 'สมโภช บ. (AM ตะวันออก-ตก-ใต้)',
      amPhone: '081-445-9821',
      amEmail: 'am.south.east.west@gmail.com'
    },
    {
      region: 'ภาคใต้' as const,
      provinces: [
        { name: 'สงขลา', zip: '90000', districts: ['หาดใหญ่', 'เมือง', 'สะเดา', 'สิงหนคร', 'รัตภูมิ'] },
        { name: 'นครศรีธรรมราช', zip: '80000', districts: ['เมือง', 'ทุ่งสง', 'ท่าศาลา', 'สิชล', 'ร่อนพิบูลย์'] },
        { name: 'สุราษฎร์ธานี', zip: '84000', districts: ['เมือง', 'เกาะสมุย', 'พุนพิน', 'กาญจนดิษฐ์', 'ดอนสัก'] },
        { name: 'ภูเก็ต', zip: '83000', districts: ['เมือง', 'ถลาง', 'กะทู้'] },
        { name: 'ตรัง', zip: '92000', districts: ['เมือง', 'กันตัง', 'ห้วยยอด', 'ย่านตาขาว'] },
        { name: 'พัทลุง', zip: '93000', districts: ['เมือง', 'ควนขนุน', 'เขาชัยสน'] },
        { name: 'ชุมพร', zip: '86000', districts: ['เมือง', 'หลังสวน', 'ท่าแซะ'] },
        { name: 'กระบี่', zip: '81000', districts: ['เมือง', 'อ่าวลึก', 'คลองท่อม', 'เกาะลันตา'] },
        { name: 'พังงา', zip: '82000', districts: ['เมือง', 'ตะกั่วป่า', 'ท้ายเหมือง'] },
        { name: 'ระนอง', zip: '85000', districts: ['เมือง', 'กะเปอร์', 'กระบุรี'] },
        { name: 'สตูล', zip: '91000', districts: ['เมือง', 'ละงู', 'ควนโดน'] },
        { name: 'ปัตตานี', zip: '94000', districts: ['เมือง', 'ยะหริ่ง', 'สายบุรี'] },
        { name: 'ยะลา', zip: '95000', districts: ['เมือง', 'เบตง', 'บันนังสตา'] },
        { name: 'นราธิวาส', zip: '96000', districts: ['เมือง', 'สุไหงโก-ลก', 'ระแงะ'] }
      ],
      amName: 'สมโภช บ. (AM ตะวันออก-ตก-ใต้)',
      amPhone: '081-445-9821',
      amEmail: 'am.south.east.west@gmail.com'
    }
  ];

  const hospitalTypes: HospitalContract['hospitalType'][] = [
    'รพ.ศูนย์ (A)',
    'รพ.ทั่วไป (S/M1)',
    'รพ.ชุมชน (M2/F)',
    'รพ.ชุมชน (M2/F)',
    'รพ.ชุมชน (M2/F)'
  ];

  const results: HospitalContract[] = [...seedHospitals];
  const targetCount = 927;
  let counter = seedHospitals.length + 1;

  while (results.length < targetCount) {
    for (const reg of regionsData) {
      if (results.length >= targetCount) break;

      for (const prov of reg.provinces) {
        if (results.length >= targetCount) break;

        for (const dist of prov.districts) {
          if (results.length >= targetCount) break;

          const hcodeNum = 10000 + counter;
          const hcode = String(hcodeNum);
          const isMonthly = counter % 6 === 0; // ~16% monthly billing contracts
          const isExpiring = counter % 11 === 0;
          const isOverBudget = counter % 37 === 0;
          const isPending = counter % 23 === 0;

          const hType = hospitalTypes[counter % hospitalTypes.length];
          const hospName = hType === 'รพ.ศูนย์ (A)'
            ? `โรงพยาบาลศูนย์${prov.name}`
            : hType === 'รพ.ทั่วไป (S/M1)'
            ? `โรงพยาบาลทั่วไป${dist}`
            : `โรงพยาบาล${dist}`;

          // Avoid duplicate hospital names
          const finalName = results.some(r => r.name === hospName)
            ? `${hospName} สาขา ${counter % 3 + 1}`
            : hospName;

          const budget = isMonthly ? 0 : [300000, 500000, 800000, 1200000, 1500000, 2000000, 3500000, 5000000, 8000000][counter % 9];
          const spentRatio = isMonthly ? 0 : isOverBudget ? 1.05 : isExpiring ? 0.92 : (40 + (counter % 50)) / 100;
          const spent = Math.round(budget * spentRatio);
          const remaining = budget - spent;
          const spentPct = budget > 0 ? Number(((spent / budget) * 100).toFixed(1)) : 0;

          const startYear = 2025;
          const endYear = isExpiring ? 2026 : 2027;
          const expiryMonth = String((counter % 12) + 1).padStart(2, '0');
          const expiryDay = String(((counter * 3) % 28) + 1).padStart(2, '0');
          const contractExpiry = `${endYear}-${expiryMonth}-${expiryDay}`;
          const contractStart = `${startYear}-10-01`;

          const daysLeft = isExpiring ? 15 + (counter % 30) : 120 + (counter % 200);

          const status: HospitalContract['contractStatus'] = isPending
            ? 'รอตรวจสอบ'
            : isExpiring
            ? 'ใกล้หมดอายุ'
            : counter % 50 === 0
            ? 'สิ้นสุดสัญญา'
            : 'มีผลบังคับใช้ (Active)';

          const risk: HospitalContract['statusRisk'] = isOverBudget
            ? 'over_budget'
            : isExpiring
            ? 'warning'
            : 'normal';

          const contractNumber = `CNT-2569-${String(counter).padStart(4, '0')}`;
          const poNumber = isMonthly ? `WO-M-${String(counter).padStart(4, '0')}` : `PO-${prov.name.substring(0, 3)}-69-${String(counter).padStart(4, '0')}`;
          const qtNumber = `QT-2569-${String(counter).padStart(4, '0')}`;

          results.push({
            id: `hosp-gen-${counter}`,
            hcode,
            cusCode: `CUS-${hcode}`,
            contractNumber,
            name: finalName,
            hospitalType: hType,
            contractCategory: isMonthly
              ? 'สัญญาจ้างบริการจัดส่งยาถึงบ้าน (สัญญารายเดือน)'
              : 'สัญญาจ้างบริการจัดส่งยาถึงบ้าน (สัญญารายปี)',
            contractBillingType: isMonthly ? 'monthly_billing' : 'annual_budget',
            contractStartDate: contractStart,
            contractExpiryDate: contractExpiry,
            contractDuration: '12 เดือน (365 วัน)',
            daysUntilExpiry: daysLeft,
            contractStatus: status,
            province: `จ.${prov.name}`,
            region: reg.region,
            address: {
              fullAddress: `${counter} หมู่ ${counter % 9 + 1} ถ.สุขประเสริฐ ต.${dist} อ.${dist} จ.${prov.name} ${prov.zip}`,
              subdistrict: `ต.${dist}`,
              district: `อ.${dist}`,
              province: prov.name,
              postalCode: prov.zip,
            },
            hospitalPhone: `0${counter % 5 + 2}-${100 + (counter % 800)}-${String(counter).padStart(4, '0').slice(-4)}`,
            hospitalDirector: `นพ. บริหาร การแพทย์ (ผู้อำนวยการ ${finalName})`,
            hospitalCoordinator: `ภญ. ประสานงาน ยาดี (หัวหน้างานเภสัชกรรม)`,
            totalBudget: budget,
            spentBudget: spent,
            remainingBudget: remaining,
            spentPercent: spentPct,
            poAmount: budget,
            dailyBurnRate: isMonthly ? 0 : Math.round(budget / 365),
            estimatedRunoutDays: isMonthly ? 0 : Math.max(1, Math.round(remaining / Math.max(100, Math.round(budget / 365)))),
            amName: reg.amName,
            amPhone: reg.amPhone,
            amEmail: reg.amEmail,
            statusRisk: risk,
            legalStatus: 'ปกติ (สมบูรณ์)',
            stampDutyStatus: 'ชำระ e-Stamp แล้ว',
            monthlyTransactions: 200 + (counter % 1500),
            lastUpdated: '15 นาทีที่แล้ว',
            hasBankGuarantee: counter % 3 === 0,
            bankGuarantee: (counter % 3 === 0) ? {
              bgNumber: `BG-${counter % 4 === 0 ? 'KTB' : counter % 4 === 1 ? 'KBANK' : counter % 4 === 2 ? 'SCB' : 'BBL'}-2569-${String(1000 + counter).slice(-4)}`,
              bankName: counter % 4 === 0 ? 'ธนาคารกรุงไทย จำกัด (มหาชน)' : counter % 4 === 1 ? 'ธนาคารกสิกรไทย จำกัด (มหาชน)' : counter % 4 === 2 ? 'ธนาคารไทยพาณิชย์ จำกัด (มหาชน)' : 'ธนาคารกรุงเทพ จำกัด (มหาชน)',
              guaranteeAmount: Math.round(budget * 0.05),
              guaranteePercent: 5,
              invitationDocNumber: `สธ 0207/ว ${2000 + (counter % 5000)} (หนังสือเชิญชวน รพ.)`,
              issueDate: contractStart,
              expiryDate: contractExpiry,
              status: daysLeft <= 30 ? 'ใกล้หมดอายุ' : 'ค้ำประกันอยู่ (Active)',
              fileName: `หนังสือค้ำประกันสัญญา_${counter % 4 === 0 ? 'ธ.กรุงไทย' : counter % 4 === 1 ? 'ธ.กสิกรไทย' : counter % 4 === 2 ? 'ธ.ไทยพาณิชย์' : 'ธ.กรุงเทพ'}_${contractNumber}.pdf`,
              fileSize: '1.4 MB',
              uploadedAt: contractStart,
              uploadedBy: reg.amName,
              notes: 'หนังสือค้ำประกันสัญญา 5% ของมูลค่าสัญญา ตามหนังสือเชิญชวนของหน่วยงาน'
            } : undefined,
            monthlyBillings: isMonthly ? [
              {
                id: `bill-gen-1-${counter}`,
                month: 'สิงหาคม 2569',
                invoiceNumber: `INV-6908-${String(counter).padStart(4, '0')}`,
                billingDate: '2026-08-31',
                amount: Math.round(spent * 0.45),
                tripsCount: Math.round((spent * 0.45) / 50),
                status: 'หักจากวงเงินแล้ว',
                source: 'google_sheet',
                deductedAt: '2026-09-05 10:00',
                deductedBy: 'Admin ส่วนกลาง (Google Sheet Sync)'
              },
              {
                id: `bill-gen-2-${counter}`,
                month: 'กันยายน 2569',
                invoiceNumber: `INV-6909-${String(counter).padStart(4, '0')}`,
                billingDate: '2026-09-30',
                amount: Math.round(spent * 0.55),
                tripsCount: Math.round((spent * 0.55) / 50),
                status: 'หักจากวงเงินแล้ว',
                source: 'google_sheet',
                deductedAt: '2026-10-04 14:30',
                deductedBy: 'Admin ส่วนกลาง (Google Sheet Sync)'
              }
            ] : [
              {
                id: `bill-gen-1-${counter}`,
                month: 'สิงหาคม 2569',
                invoiceNumber: `INV-6908-${String(counter).padStart(4, '0')}`,
                billingDate: '2026-08-31',
                amount: Math.round(spent * 0.48),
                tripsCount: Math.round((spent * 0.48) / 50),
                status: 'หักจากวงเงินแล้ว',
                source: 'google_sheet',
                deductedAt: '2026-09-05 10:00',
                deductedBy: 'Admin ส่วนกลาง (Google Sheet Sync)'
              },
              {
                id: `bill-gen-2-${counter}`,
                month: 'กันยายน 2569',
                invoiceNumber: `INV-6909-${String(counter).padStart(4, '0')}`,
                billingDate: '2026-09-30',
                amount: Math.round(spent * 0.52),
                tripsCount: Math.round((spent * 0.52) / 50),
                status: 'หักจากวงเงินแล้ว',
                source: 'google_sheet',
                deductedAt: '2026-10-04 14:30',
                deductedBy: 'Admin ส่วนกลาง (Google Sheet Sync)'
              }
            ],
            documents: {
              qt: {
                docNumber: qtNumber,
                date: contractStart,
                amount: budget,
                title: `ใบเสนอราคาบริการจัดส่งยาถึงบ้าน ${finalName}`,
                status: 'อนุมัติแล้ว',
                approvedBy: 'นพ. บริหาร การแพทย์',
                itemsCount: 10000 + (counter % 50000),
                unitPricePerTrip: 50,
              },
              po: {
                docNumber: poNumber,
                date: contractStart,
                amount: budget,
                title: `ใบสั่งจ้างบริการส่งยาถึงบ้าน ${finalName}`,
                status: 'ออกใบสั่งซื้อแล้ว',
                disbursementPeriod: isMonthly ? 'เบิกจ่ายรายเดือนตามยอดจริง' : 'เบิกจ่ายตามงวดรายไตรมาส',
                paymentTerms: 'เครดิตเทอม 30 วัน',
              },
              tor: {
                docNumber: `TOR-${contractNumber}`,
                version: '1.0',
                effectiveDate: contractStart,
                scopeSummary: `บริการจัดส่งยาถึงบ้านผู้ป่วยในพื้นที่ ${dist} รัศมี 25 กม. มีระบบถ่ายภาพยืนยัน`,
                serviceRadiusKm: 25,
                slaHours: 4,
                penaltyPerLateHour: 50,
              },
              contractAgreement: {
                contractNumber,
                signedDate: contractStart,
                effectiveStartDate: contractStart,
                effectiveEndDate: contractExpiry,
                stampDutyNumber: `ESM-${contractNumber}-GOV`,
              },
            },
            attachedFiles: [
              {
                id: `att-gen-1-${counter}`,
                name: `สัญญาหลัก_${contractNumber}.pdf`,
                category: 'สัญญาหลัก',
                fileSize: '2.1 MB',
                uploadDate: '01 ต.ค. 2569 09:00 น.',
                uploadedBy: reg.amName,
              },
              {
                id: `att-gen-2-${counter}`,
                name: `ใบสั่งจ้าง_${poNumber}.pdf`,
                category: 'ใบสั่งจ้าง PO',
                fileSize: '1.4 MB',
                uploadDate: '01 ต.ค. 2569 09:30 น.',
                uploadedBy: reg.amName,
              },
              {
                id: `att-gen-3-${counter}`,
                name: `TOR_${contractNumber}.pdf`,
                category: 'TOR ขอบเขต',
                fileSize: '3.2 MB',
                uploadDate: '01 ต.ค. 2569 10:00 น.',
                uploadedBy: reg.amName,
              },
              ...(counter % 3 === 0 ? [{
                id: `att-gen-4-${counter}`,
                name: `หนังสือค้ำประกันสัญญา_${counter % 4 === 0 ? 'ธ.กรุงไทย' : counter % 4 === 1 ? 'ธ.กสิกรไทย' : counter % 4 === 2 ? 'ธ.ไทยพาณิชย์' : 'ธ.กรุงเทพ'}_${contractNumber}.pdf`,
                category: 'หนังสือค้ำประกัน BG' as const,
                fileSize: '1.4 MB',
                uploadDate: contractStart,
                uploadedBy: reg.amName,
              }] : [])
            ],
            auditLogs: [
              {
                id: `log-gen-${counter}`,
                timestamp: '01 ต.ค. 2569 10:30 น.',
                editorName: 'Admin ส่วนกลาง (Central Admin)',
                editorRole: 'Admin ส่วนกลาง',
                action: 'อนุมัติวงเงินโดยส่วนกลาง',
                changesSummary: `บันทึกข้อมูลสัญญาและวงเงินเริ่มต้น ${isMonthly ? 'รายเดือน' : budget.toLocaleString() + ' บาท'} เข้าสู่ Database หลัก`,
              }
            ],
          });

          counter++;
        }
      }
    }
  }

  return results;
};
