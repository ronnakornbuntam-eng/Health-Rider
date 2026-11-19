import React, { useState } from 'react';
import { 
  X, 
  Send, 
  AlertTriangle, 
  Phone, 
  Mail, 
  MessageSquare, 
  CheckCircle2,
  Clock
} from 'lucide-react';
import { HospitalContract } from '../data/contractsData';

interface DispatchAlertModalProps {
  hospital: HospitalContract | null;
  alertType?: string;
  onClose: () => void;
}

export const DispatchAlertModal: React.FC<DispatchAlertModalProps> = ({
  hospital,
  alertType = 'CRITICAL EXPIRY & BURN',
  onClose,
}) => {
  if (!hospital) return null;

  const [channel, setChannel] = useState<'all' | 'sms' | 'line' | 'email'>('all');
  const [customNote, setCustomNote] = useState<string>(
    `ด่วนที่สุด: สัญญา ${hospital.contractNumber} (${hospital.name}) วงเงินคงเหลือ ${hospital.remainingBudget.toLocaleString()} บาท (${hospital.spentPercent}%) อัตราบริโภคชี้ว่าจะหมดเกลี้ยงใน ${hospital.estimatedRunoutDays} วัน โปรดเร่งจัดทำบันทึกขอขยายเพดานวงเงินและต่อสัญญาปี 2568 ล่วงหน้าทันที`
  );
  const [isSending, setIsSending] = useState<boolean>(false);
  const [isSent, setIsSent] = useState<boolean>(false);

  const handleSend = () => {
    setIsSending(true);
    setTimeout(() => {
      setIsSending(false);
      setIsSent(true);
      setTimeout(() => {
        onClose();
      }, 1500);
    }, 700);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header - Clean White Theme */}
        <div className="p-4 bg-white border-b border-slate-200 text-slate-900 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-200">
              <AlertTriangle className="w-4 h-4 text-rose-600" />
            </div>
            <h3 className="font-bold text-sm text-slate-900">
              ส่งคำสั่งแจ้งเตือนปฏิบัติการเร่งด่วนถึง AM
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4 text-xs">
          {isSent ? (
            <div className="py-8 text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-slate-900 text-base">
                ส่งแจ้งเตือนสำเร็จแล้ว!
              </h4>
              <p className="text-slate-500">
                ระบบได้ส่งการแจ้งเตือนไปยัง AM {hospital.amName} ({hospital.amPhone}) เรียบร้อยแล้ว
              </p>
            </div>
          ) : (
            <>
              {/* Recipient card */}
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-700">ผู้รับข้อความ (AM ผู้รับผิดชอบ)</span>
                  <span className="font-mono text-teal-800 font-bold">{hospital.amName}</span>
                </div>
                <div className="flex items-center justify-between text-slate-500 text-[11px]">
                  <span>เบอร์โทรฉุกเฉิน</span>
                  <span className="font-mono">{hospital.amPhone}</span>
                </div>
                <div className="flex items-center justify-between text-slate-500 text-[11px]">
                  <span>โรงพยาบาลเป้าหมาย</span>
                  <span>{hospital.name} ({hospital.cusCode})</span>
                </div>
              </div>

              {/* Channels */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">
                  ช่องทางการส่งสัญญาณ (Dispatch Channels):
                </label>
                <div className="grid grid-cols-4 gap-2 text-[11px]">
                  <button
                    type="button"
                    onClick={() => setChannel('all')}
                    className={`py-1.5 px-2 rounded-md font-semibold border ${
                      channel === 'all' ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-700 border-slate-300'
                    }`}
                  >
                    ทุกช่องทาง
                  </button>
                  <button
                    type="button"
                    onClick={() => setChannel('line')}
                    className={`py-1.5 px-2 rounded-md font-semibold border ${
                      channel === 'line' ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white text-slate-700 border-slate-300'
                    }`}
                  >
                    LINE OA
                  </button>
                  <button
                    type="button"
                    onClick={() => setChannel('sms')}
                    className={`py-1.5 px-2 rounded-md font-semibold border ${
                      channel === 'sms' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-700 border-slate-300'
                    }`}
                  >
                    SMS ด่วน
                  </button>
                  <button
                    type="button"
                    onClick={() => setChannel('email')}
                    className={`py-1.5 px-2 rounded-md font-semibold border ${
                      channel === 'email' ? 'bg-teal-700 text-white border-teal-700' : 'bg-white text-slate-700 border-slate-300'
                    }`}
                  >
                    Email
                  </button>
                </div>
              </div>

              {/* Message text */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">
                  ข้อความคำสั่งปฏิบัติการ:
                </label>
                <textarea
                  rows={4}
                  value={customNote}
                  onChange={(e) => setCustomNote(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:outline-teal-600"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-3 py-1.5 rounded-md border border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold"
                >
                  ยกเลิก
                </button>
                <button
                  type="button"
                  disabled={isSending}
                  onClick={handleSend}
                  className="px-4 py-1.5 rounded-md bg-rose-600 hover:bg-rose-700 text-white font-semibold flex items-center gap-1.5 shadow-2xs active:scale-95 transition-all"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSending ? 'กำลังยิงสัญญาณแจ้งเตือน...' : 'ยืนยันและส่งแจ้งเตือน'}</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
