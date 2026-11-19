import React, { useState } from 'react';
import { 
  X, 
  FileSpreadsheet, 
  Download, 
  UploadCloud, 
  CheckCircle2, 
  FileCheck,
  AlertCircle
} from 'lucide-react';
import { HospitalContract, REGIONS_DATA } from '../data/contractsData';

interface ExcelModalProps {
  mode: 'import' | 'export';
  hospitals: HospitalContract[];
  onClose: () => void;
  onImportHospitals: (newHospitals: HospitalContract[]) => void;
}

export const ExcelModal: React.FC<ExcelModalProps> = ({
  mode,
  hospitals,
  onClose,
  onImportHospitals,
}) => {
  const [activeTab, setActiveTab] = useState<'import' | 'export'>(mode);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [importSuccess, setImportSuccess] = useState<boolean>(false);

  // Export functions
  const handleExportCSV = (dataType: 'hospitals' | 'regions' | 'watchlist') => {
    let csvContent = '\uFEFF'; // UTF-8 BOM for Excel Thai language support

    if (dataType === 'regions') {
      csvContent += 'ภูมิภาค,จำนวนรพ,จำนวนสัญญา,อัตราการใช้วงเงิน(%),เกินวงเงิน,ใกล้หมดอายุ\n';
      REGIONS_DATA.forEach((r) => {
        csvContent += `"${r.region}",${r.hospitalsCount},${r.contractsCount},${r.utilizationRate},${r.overBudgetCount},${r.expiringCount}\n`;
      });
    } else {
      csvContent += 'รหัส CUS,เลขที่สัญญา,ชื่อโรงพยาบาล,จังหวัด,ภูมิภาค,ประเภทสถานพยาบาล,วงเงินรวม,ใช้ไปแล้ว,คงเหลือ,อัตราการใช้(%),BurnRateต่อวัน,วันหมดอายุ,AMผู้รับผิดชอบ,สถานะนิติกรรม\n';
      const list = dataType === 'watchlist' 
        ? hospitals.filter((h) => h.spentPercent >= 80 || h.daysUntilExpiry <= 60)
        : hospitals;

      list.forEach((h) => {
        csvContent += `"${h.cusCode}","${h.contractNumber}","${h.name}","${h.province}","${h.region}","${h.hospitalType}",${h.totalBudget},${h.spentBudget},${h.remainingBudget},${h.spentPercent},${h.dailyBurnRate},"${h.contractExpiryDate}","${h.amName}","${h.legalStatus}"\n`;
      });
    }

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `HospitalContracts_${dataType}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSimulatedImport = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setImportSuccess(true);
      setTimeout(() => {
        onClose();
      }, 1400);
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header - Clean White Theme */}
        <div className="p-4 bg-white border-b border-slate-200 text-slate-900 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-200">
              <FileSpreadsheet className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-sm text-slate-900">
              จัดการข้อมูลสเปรดชีต Excel (.xlsx / .csv)
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="flex border-b border-slate-200 bg-slate-50 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('import')}
            className={`flex-1 py-3 text-center border-b-2 transition-all ${
              activeTab === 'import' ? 'border-emerald-600 text-emerald-800 bg-white font-bold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            นำเข้าไฟล์ Excel .xlsx
          </button>
          <button
            onClick={() => setActiveTab('export')}
            className={`flex-1 py-3 text-center border-b-2 transition-all ${
              activeTab === 'export' ? 'border-emerald-600 text-emerald-800 bg-white font-bold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            ส่งออกข้อมูล Excel / CSV
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 text-xs">
          {activeTab === 'import' ? (
            <div className="space-y-4">
              {importSuccess ? (
                <div className="py-6 text-center space-y-2">
                  <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                  <h4 className="font-bold text-slate-900 text-sm">
                    นำเข้าข้อมูลสำเร็จ!
                  </h4>
                  <p className="text-slate-500 text-xs">
                    ข้อมูลสัญญาโรงพยาบาลถูกตรวจสอบและอัปเดตเข้าสู่ฐานข้อมูลส่วนกลางแล้ว
                  </p>
                </div>
              ) : (
                <>
                  <div 
                    onClick={handleSimulatedImport}
                    className="border-2 border-dashed border-emerald-300 hover:border-emerald-500 bg-emerald-50/40 hover:bg-emerald-50/70 p-6 rounded-xl text-center cursor-pointer transition-colors space-y-2"
                  >
                    <UploadCloud className="w-8 h-8 text-emerald-600 mx-auto" />
                    <div>
                      <span className="font-bold text-slate-800 block">
                        ลากไฟล์ Excel (.xlsx, .csv) มาวางที่นี่
                      </span>
                      <span className="text-[11px] text-slate-500">
                        หรือคลิกเพื่อเลือกไฟล์จากคอมพิวเตอร์ของคุณ
                      </span>
                    </div>
                    <span className="inline-block text-[10px] text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded font-mono font-medium">
                      รองรับไฟล์เทมเพลตมาตรฐานระบบบริหารสัญญา v2
                    </span>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1 text-[11px] text-slate-600">
                    <div className="font-bold text-slate-800 flex items-center gap-1">
                      <FileCheck className="w-3.5 h-3.5 text-emerald-600" />
                      <span>โครงสร้างคอลัมน์ที่รองรับ:</span>
                    </div>
                    <p className="font-mono text-[10px] text-slate-500">
                      CUS_CODE | CONTRACT_NO | HOSPITAL_NAME | REGION | TOTAL_BUDGET | EXPIRY_DATE
                    </p>
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-3 py-1.5 rounded-md border border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold"
                    >
                      ยกเลิก
                    </button>
                    <button
                      type="button"
                      disabled={isProcessing}
                      onClick={handleSimulatedImport}
                      className="px-4 py-1.5 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
                    >
                      {isProcessing ? 'กำลังประมวลผลไฟล์...' : 'ประมวลผลและนำเข้า'}
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-slate-600">
                เลือกประเภทชุดข้อมูลที่ต้องการดาวน์โหลดในรูปแบบไฟล์ CSV พร้อมรองรับภาษาไทยใน Microsoft Excel:
              </p>

              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => handleExportCSV('hospitals')}
                  className="w-full p-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-left flex items-center justify-between group transition-colors"
                >
                  <div>
                    <span className="font-bold text-slate-900 block">
                      1. ทะเบียนโรงพยาบาลและสัญญาทั้งหมด (185 แห่ง)
                    </span>
                    <span className="text-[11px] text-slate-500">
                      ข้อมูลวงเงินรวม อัตราบริโภค Burn Rate และวันหมดอายุทุกสัญญา
                    </span>
                  </div>
                  <Download className="w-4 h-4 text-emerald-600 group-hover:translate-y-0.5 transition-transform" />
                </button>

                <button
                  type="button"
                  onClick={() => handleExportCSV('watchlist')}
                  className="w-full p-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-left flex items-center justify-between group transition-colors"
                >
                  <div>
                    <span className="font-bold text-rose-700 block">
                      2. สัญญากลุ่มเฝ้าระวังสูงสุด (High-Priority Watchlist)
                    </span>
                    <span className="text-[11px] text-slate-500">
                      เฉพาะโรงพยาบาลที่ใช้วงเงินเกิน 80% หรือจะหมดอายุใน 60 วัน
                    </span>
                  </div>
                  <Download className="w-4 h-4 text-rose-600 group-hover:translate-y-0.5 transition-transform" />
                </button>

                <button
                  type="button"
                  onClick={() => handleExportCSV('regions')}
                  className="w-full p-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-left flex items-center justify-between group transition-colors"
                >
                  <div>
                    <span className="font-bold text-slate-900 block">
                      3. สรุปสถานะวงเงินราย 5 ภูมิภาค (Regional Matrix)
                    </span>
                    <span className="text-[11px] text-slate-500">
                      สรุปความเสี่ยงและอัตราการจัดสรรงบประมาณสำรอง
                    </span>
                  </div>
                  <Download className="w-4 h-4 text-teal-600 group-hover:translate-y-0.5 transition-transform" />
                </button>
              </div>

              <div className="flex justify-end pt-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-1.5 rounded-md bg-slate-900 text-white font-semibold hover:bg-slate-800"
                >
                  เสร็จสิ้น
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
