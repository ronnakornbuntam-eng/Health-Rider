import React, { useState } from 'react';
import { 
  FileSpreadsheet, 
  Plus, 
  Calendar, 
  User, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  ArrowRight, 
  ArrowLeft,
  Filter,
  DollarSign,
  ChevronRight
} from 'lucide-react';
import { TaskItem, INITIAL_TASKS, RoleConfig } from '../data/contractsData';

interface AmTaskPipelineProps {
  currentRole: RoleConfig;
  onNavigateToHospital: (hospitalName: string) => void;
}

export const AmTaskPipeline: React.FC<AmTaskPipelineProps> = ({
  currentRole,
  onNavigateToHospital,
}) => {
  const [tasks, setTasks] = useState<TaskItem[]>(INITIAL_TASKS);
  const [selectedAm, setSelectedAm] = useState<string>('all');
  const [isAddingTask, setIsAddingTask] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // New task form state
  const [newTitle, setNewTitle] = useState('');
  const [newHospital, setNewHospital] = useState('โรงพยาบาลขลุง');
  const [newContractCode, setNewContractCode] = useState('CNT-2567-089');
  const [newColumn, setNewColumn] = useState<'renewal' | 'stamp' | 'po' | 'done'>('renewal');
  const [newPriority, setNewPriority] = useState<'high' | 'medium' | 'low'>('high');
  const [newAssignedTo, setNewAssignedTo] = useState('กิตติศักดิ์ พ.');
  const [newDueDate, setNewDueDate] = useState('2026-10-25');
  const [newTag, setNewTag] = useState('เร่งด่วนพิเศษ');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleMoveTask = (taskId: string, direction: 'next' | 'prev') => {
    const colOrder: Array<'renewal' | 'stamp' | 'po' | 'done'> = ['renewal', 'stamp', 'po', 'done'];
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== taskId) return t;
        const currentIndex = colOrder.indexOf(t.column);
        const nextIndex = direction === 'next' ? Math.min(colOrder.length - 1, currentIndex + 1) : Math.max(0, currentIndex - 1);
        const newCol = colOrder[nextIndex];
        return { ...t, column: newCol };
      })
    );
    showToast('อัปเดตขั้นตอนสถานะงานเรียบร้อยแล้ว');
  };

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newTask: TaskItem = {
      id: `tsk-${Date.now()}`,
      title: newTitle,
      hospitalName: newHospital,
      contractCode: newContractCode,
      column: newColumn,
      priority: newPriority,
      assignedTo: newAssignedTo,
      dueDate: newDueDate,
      tag: newTag,
      budgetAmount: 2000000,
    };

    setTasks([newTask, ...tasks]);
    setIsAddingTask(false);
    setNewTitle('');
    showToast(`เพิ่มงานใหม่ "${newTask.title}" เรียบร้อยแล้ว`);
  };

  // Filter tasks
  const filteredTasks = tasks.filter((t) => {
    if (selectedAm !== 'all' && !t.assignedTo.includes(selectedAm)) return false;
    return true;
  });

  const columns = [
    {
      id: 'renewal',
      title: 'งานต่อสัญญา',
      badge: '12 สัญญา',
      badgeColor: 'bg-rose-100 text-rose-700',
      description: 'สัญญาใกล้หมดอายุ & ต้องจัดทำฉบับใหม่',
    },
    {
      id: 'stamp',
      title: 'ตีตราสารค้าง',
      badge: '5 สัญญา',
      badgeColor: 'bg-amber-100 text-amber-700',
      description: 'รอนิติการตรวจสอบ / e-Stamp Duty',
    },
    {
      id: 'po',
      title: 'รอรับใบ PO',
      badge: '8 สัญญา',
      badgeColor: 'bg-blue-100 text-blue-700',
      description: 'เอกสารงวดเงิน & ใบสั่งจ้างจาก รพ.',
    },
    {
      id: 'done',
      title: 'สัญญาเสร็จสิ้น',
      badge: '42 สัญญา',
      badgeColor: 'bg-emerald-100 text-emerald-700',
      description: 'ลงนามสมบูรณ์ & เบิกจ่ายพร้อม',
    },
  ];

  return (
    <div className="w-full max-w-full min-w-0 space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              AM Operations &amp; Task Flow Pipeline
            </h1>
            <span className="text-[11px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
              ฝ่ายบริหารลูกค้าสัมพันธ์
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            ระบบติดตามกระบวนการต่อสัญญาโรงพยาบาล งานตีตราสารอากรแสตมป์ และการประสานใบสั่งจ้าง PO
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* AM Filter */}
          <div className="flex items-center gap-1.5 bg-white p-1 rounded-md border border-slate-300 text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-400 ml-1" />
            <select
              value={selectedAm}
              onChange={(e) => setSelectedAm(e.target.value)}
              className="bg-transparent text-slate-700 focus:outline-hidden py-0.5 pr-2"
            >
              <option value="all">AM ทั้งหมด (ทุกคน)</option>
              <option value="กิตติศักดิ์ พ.">กิตติศักดิ์ พ. (ภาคตะวันออก)</option>
              <option value="ปวีณา ส.">ปวีณา ส. (ภาคอีสาน)</option>
              <option value="ชนาภร ว.">ชนาภร ว. (ภาคเหนือ)</option>
              <option value="ศศิธร ม.">ศศิธร ม. (ภาคอีสาน)</option>
              <option value="วรพจน์ ท.">วรพจน์ ท. (ภาคกลาง)</option>
              <option value="สมโภช บ.">สมโภช บ. (ภาคใต้)</option>
            </select>
          </div>

          <button
            onClick={() => setIsAddingTask(true)}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-md shadow-2xs active:scale-95 transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>สร้าง Task ใหม่</span>
          </button>
        </div>
      </div>

      {toastMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs rounded-lg flex items-center gap-2 shadow-sm animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Modal: Add Task */}
      {isAddingTask && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-5 border border-slate-200">
            <h3 className="font-bold text-slate-900 text-base mb-1">
              สร้างรายการงานใหม่ (New Pipeline Task)
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              เพิ่มรายการงานเพื่อมอบหมายให้ Account Manager ดำเนินการ
            </p>

            <form onSubmit={handleCreateTask} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  ชื่องาน / รายละเอียดงาน
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="เช่น ส่งหนังสือขยายเพดานวงเงิน"
                  className="w-full p-2 border border-slate-300 rounded-md focus:outline-teal-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    โรงพยาบาล
                  </label>
                  <input
                    type="text"
                    required
                    value={newHospital}
                    onChange={(e) => setNewHospital(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-md focus:outline-teal-600"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    เลขที่สัญญา
                  </label>
                  <input
                    type="text"
                    required
                    value={newContractCode}
                    onChange={(e) => setNewContractCode(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-md focus:outline-teal-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    ขั้นตอน (Column)
                  </label>
                  <select
                    value={newColumn}
                    onChange={(e) => setNewColumn(e.target.value as any)}
                    className="w-full p-2 border border-slate-300 rounded-md focus:outline-teal-600"
                  >
                    <option value="renewal">งานต่อสัญญา</option>
                    <option value="stamp">ตีตราสารค้าง</option>
                    <option value="po">รอรับใบ PO</option>
                    <option value="done">สัญญาเสร็จสิ้น</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    ระดับความสำคัญ
                  </label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value as any)}
                    className="w-full p-2 border border-slate-300 rounded-md focus:outline-teal-600"
                  >
                    <option value="high">ด่วนที่สุด (High)</option>
                    <option value="medium">ปานกลาง (Medium)</option>
                    <option value="low">ปกติ (Low)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    AM ผู้รับผิดชอบ
                  </label>
                  <input
                    type="text"
                    value={newAssignedTo}
                    onChange={(e) => setNewAssignedTo(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-md focus:outline-teal-600"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    กำหนดเสร็จ
                  </label>
                  <input
                    type="date"
                    value={newDueDate}
                    onChange={(e) => setNewDueDate(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-md focus:outline-teal-600"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAddingTask(false)}
                  className="px-3 py-1.5 rounded-md border border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-md bg-blue-600 text-white font-semibold hover:bg-blue-700"
                >
                  บันทึกงาน
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4-Column Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-start">
        {columns.map((col) => {
          const columnTasks = filteredTasks.filter((t) => t.column === col.id);

          return (
            <div
              key={col.id}
              className="bg-slate-100/90 rounded-xl p-3 border border-slate-200/80 flex flex-col min-h-[500px]"
            >
              {/* Column Header */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5">
                  <h3 className="font-bold text-slate-900 text-xs">
                    {col.title}
                  </h3>
                  <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${col.badgeColor}`}>
                    {columnTasks.length}
                  </span>
                </div>
              </div>
              <p className="text-[10px] text-slate-500 mb-3">
                {col.description}
              </p>

              {/* Tasks List */}
              <div className="space-y-2.5 flex-1">
                {columnTasks.map((task) => (
                  <div
                    key={task.id}
                    className="bg-white p-3 rounded-lg border border-slate-200 shadow-2xs hover:border-slate-300 transition-all space-y-2"
                  >
                    <div className="flex items-start justify-between gap-1">
                      <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded uppercase ${
                        task.priority === 'high'
                          ? 'bg-rose-100 text-rose-700'
                          : task.priority === 'medium'
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-slate-100 text-slate-700'
                      }`}>
                        {task.tag}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">
                        {task.contractCode}
                      </span>
                    </div>

                    <h4 className="font-bold text-xs text-slate-900 leading-snug">
                      {task.title}
                    </h4>

                    <div className="flex items-center justify-between text-[11px] text-slate-600 pt-1">
                      <button
                        onClick={() => onNavigateToHospital(task.hospitalName)}
                        className="font-medium text-teal-700 hover:underline truncate max-w-[140px]"
                      >
                        {task.hospitalName}
                      </button>
                      <span className="font-mono text-slate-500">
                        {(task.budgetAmount / 1000000).toFixed(1)}M ฿
                      </span>
                    </div>

                    {task.notes && (
                      <p className="text-[10px] text-slate-500 bg-slate-50 p-1.5 rounded border border-slate-100 leading-tight">
                        {task.notes}
                      </p>
                    )}

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500">
                      <div className="flex items-center gap-1">
                        <User className="w-3 h-3 text-slate-400" />
                        <span>{task.assignedTo}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>{task.dueDate}</span>
                      </div>
                    </div>

                    {/* Move stage controls */}
                    <div className="pt-1 flex items-center justify-between gap-1">
                      {col.id !== 'renewal' ? (
                        <button
                          onClick={() => handleMoveTask(task.id, 'prev')}
                          className="px-2 py-0.5 rounded text-[10px] text-slate-600 hover:bg-slate-100 flex items-center gap-0.5"
                          title="ย้อนกลับขั้นตอนก่อนหน้า"
                        >
                          <ArrowLeft className="w-2.5 h-2.5" />
                          <span>ย้อน</span>
                        </button>
                      ) : <div />}

                      {col.id !== 'done' ? (
                        <button
                          onClick={() => handleMoveTask(task.id, 'next')}
                          className="px-2 py-0.5 rounded text-[10px] font-semibold text-blue-700 hover:bg-blue-50 flex items-center gap-0.5 ml-auto"
                          title="เลื่อนไปขั้นตอนถัดไป"
                        >
                          <span>ขั้นตอนถัดไป</span>
                          <ArrowRight className="w-2.5 h-2.5" />
                        </button>
                      ) : (
                        <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-0.5 ml-auto">
                          <CheckCircle2 className="w-3 h-3" />
                          เสร็จสิ้น
                        </span>
                      )}
                    </div>
                  </div>
                ))}

                {columnTasks.length === 0 && (
                  <div className="py-8 text-center text-slate-400 text-xs border border-dashed border-slate-200 rounded-lg">
                    ไม่มีรายการค้างในขั้นตอนนี้
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
