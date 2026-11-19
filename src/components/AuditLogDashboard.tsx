import React, { useState } from 'react';
import { 
  History, 
  Search, 
  Clock, 
  UserCheck, 
  Building2, 
  ShieldCheck, 
  Filter, 
  Calendar,
  ExternalLink
} from 'lucide-react';
import { HospitalContract, RoleConfig, AuditLogEntry } from '../data/contractsData';

interface AuditLogDashboardProps {
  hospitals: HospitalContract[];
  currentRole: RoleConfig;
  onSelectHospital: (hospital: HospitalContract) => void;
}

export const AuditLogDashboard: React.FC<AuditLogDashboardProps> = ({
  hospitals,
  currentRole,
  onSelectHospital,
}) => {
  const [filterQuery, setFilterQuery] = useState<string>('');
  const [selectedEditor, setSelectedEditor] = useState<string>('all');

  // Collect all audit logs across all accessible hospitals
  const allLogs = React.useMemo(() => {
    const list: Array<AuditLogEntry & { hospitalName: string; hospitalId: string; hcode: string; region: string }> = [];
    hospitals.forEach((h) => {
      // Role scope check
      if (!currentRole.isCentralAdmin && !currentRole.allowedRegions.includes(h.region)) {
        return;
      }

      h.auditLogs.forEach((log) => {
        list.push({
          ...log,
          hospitalName: h.name,
          hospitalId: h.id,
          hcode: h.hcode,
          region: h.region,
        });
      });
    });

    // Sort by timestamp or entry order
    return list;
  }, [hospitals, currentRole]);

  // Unique editors list
  const editors = React.useMemo(() => {
    const set = new Set<string>();
    allLogs.forEach((l) => set.add(l.editorName));
    return Array.from(set);
  }, [allLogs]);

  // Filtered logs
  const filteredLogs = React.useMemo(() => {
    return allLogs.filter((l) => {
      if (selectedEditor !== 'all' && l.editorName !== selectedEditor) return false;
      if (filterQuery.trim()) {
        const q = filterQuery.toLowerCase().trim();
        const matchHosp = l.hospitalName.toLowerCase().includes(q);
        const matchHcode = l.hcode.includes(q);
        const matchEditor = l.editorName.toLowerCase().includes(q);
        const matchSummary = l.changesSummary.toLowerCase().includes(q);
        const matchAction = l.action.toLowerCase().includes(q);
        if (!matchHosp && !matchHcode && !matchEditor && !matchSummary && !matchAction) return false;
      }
      return true;
    });
  }, [allLogs, filterQuery, selectedEditor]);

  return (
    <div className="w-full max-w-full min-w-0 space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              ศูนย์ตรวจสอบประวัติการเปลี่ยนแปลง (Audit Trail &amp; Change Log)
            </h1>
            <span className="text-[11px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
              {currentRole.isCentralAdmin ? 'บันทึกส่วนกลางทั่วประเทศ' : 'บันทึกระดับภูมิภาค'}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            บันทึกวัน เวลา และรายชื่อผู้แก้ไขข้อมูลโรงพยาบาลและสัญญาทั้งหมดเพื่อความโปร่งใสและตรวจสอบย้อนหลังได้
          </p>
        </div>

        <div className="text-xs text-slate-500 font-mono">
          พบประวัติการแก้ไขทั้งหมด {filteredLogs.length} รายการ
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
            placeholder="ค้นหาตามชื่อ รพ., รหัส H-Code, ชื่อผู้แก้ไข, หรือรายละเอียด..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-teal-600 focus:bg-white"
          />
        </div>

        <div className="sm:w-60">
          <select
            value={selectedEditor}
            onChange={(e) => setSelectedEditor(e.target.value)}
            className="w-full p-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-teal-600"
          >
            <option value="all">ผู้แก้ไขทั้งหมด (ทุกคน)</option>
            {editors.map((ed) => (
              <option key={ed} value={ed}>
                {ed}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Logs Timeline List */}
      <div className="space-y-3">
        {filteredLogs.length > 0 ? (
          filteredLogs.map((log) => {
            const parentHospital = hospitals.find((h) => h.id === log.hospitalId);

            return (
              <div
                key={log.id}
                className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs hover:border-slate-300 transition-all space-y-2"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-slate-900 text-sm">{log.hospitalName}</span>
                    <span className="text-[10px] font-mono font-bold bg-slate-900 text-white px-1.5 py-0.2 rounded">
                      H:{log.hcode}
                    </span>
                    <span className="text-xs text-slate-500">({log.region})</span>
                    <span className="text-[10px] font-bold bg-teal-50 text-teal-800 border border-teal-200 px-2 py-0.2 rounded">
                      {log.action}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-xs font-mono text-slate-500">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>{log.timestamp}</span>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/80 text-xs text-slate-700 font-medium leading-relaxed">
                  {log.changesSummary}
                </div>

                <div className="flex items-center justify-between text-xs pt-1 text-slate-500">
                  <div className="flex items-center gap-1.5">
                    <UserCheck className="w-3.5 h-3.5 text-teal-700" />
                    <span>
                      ผู้บันทึก: <strong className="text-slate-800">{log.editorName}</strong>{' '}
                      <span className="text-slate-400">({log.editorRole})</span>
                    </span>
                  </div>

                  {parentHospital && (
                    <button
                      onClick={() => onSelectHospital(parentHospital)}
                      className="text-teal-700 hover:text-teal-800 font-semibold flex items-center gap-1 text-[11px]"
                    >
                      <span>ดูแฟ้ม รพ.</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="py-12 bg-white rounded-xl border border-slate-200 text-center space-y-2">
            <History className="w-8 h-8 text-slate-400 mx-auto" />
            <h4 className="font-bold text-slate-900 text-sm">ไม่พบประวัติการแก้ไขตามเงื่อนไข</h4>
            <p className="text-xs text-slate-500">
              เมื่อมีการแก้ไขหรือเพิ่มข้อมูลโรงพยาบาล ระบบจะบันทึกประวัติการเปลี่ยนแปลงที่นี่โดยอัตโนมัติ
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
