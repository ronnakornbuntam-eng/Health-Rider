import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  AlertOctagon, 
  Mail, 
  KeyRound, 
  Server, 
  ExternalLink,
  ChevronRight,
  Hospital,
  HelpCircle,
  Briefcase
} from 'lucide-react';
import { ROLES_CONFIG, RoleConfig } from '../data/contractsData';

interface EnterpriseGatewayProps {
  currentRole: RoleConfig;
  onSelectRole: (role: RoleConfig) => void;
  onLoginSuccess: (email: string) => void;
}

export const EnterpriseGateway: React.FC<EnterpriseGatewayProps> = ({
  currentRole,
  onSelectRole,
  onLoginSuccess,
}) => {
  const [email, setEmail] = useState<string>('ronnakorn2558@gmail.com');
  const [password, setPassword] = useState<string>('••••••••••••••••');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [trustDevice, setTrustDevice] = useState<boolean>(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [loginSuccessToast, setLoginSuccessToast] = useState<boolean>(false);

  const handleSimulateLogin = (roleKey: 'admin' | 'am_north' | 'am_northeast' | 'am_south') => {
    const role = ROLES_CONFIG[roleKey];
    if (role) {
      onSelectRole(role);
      if (roleKey === 'admin') setEmail('ronnakorn2558@gmail.com');
      else if (roleKey === 'am_north') setEmail('am.north.central@gmail.com');
      else if (roleKey === 'am_northeast') setEmail('am.northeast@gmail.com');
      else if (roleKey === 'am_south') setEmail('am.south.east.west@gmail.com');
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    if (!email.trim()) {
      setAuthError('กรุณากรอกบัญชี Gmail สำหรับเข้าสู่ระบบ');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setLoginSuccessToast(true);
      setTimeout(() => {
        onLoginSuccess(email);
      }, 500);
    }, 400);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Brand Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-teal-800 text-white flex items-center justify-center shadow-md">
            <Hospital className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-extrabold text-slate-900 tracking-tight">
                MediCommand
              </span>
            </div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              ENTERPRISE COMMAND CENTER
            </p>
          </div>
        </div>

        {/* Security badges */}
        <div className="flex items-center gap-3 text-xs font-semibold text-slate-600 flex-wrap">
          <span className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 rounded border border-slate-200">
            <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
            <span>HIPAA COMPLIANT</span>
          </span>
          <span className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 rounded border border-slate-200">
            <Lock className="w-3.5 h-3.5 text-blue-600" />
            <span>ISO 27001</span>
          </span>
          <span className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 rounded border border-slate-200">
            <Server className="w-3.5 h-3.5 text-sky-600" />
            <span>GCP PROTECTED</span>
          </span>
          <span className="px-2.5 py-1 bg-slate-800 text-slate-200 rounded font-mono text-[11px]">
            NODE: HOU-TEX-04
          </span>
        </div>
      </div>

      {/* Cluster Security Sub-bar */}
      <div className="bg-slate-100 p-2.5 rounded-lg border border-slate-200 flex flex-wrap items-center justify-between text-xs text-slate-600 gap-2">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          <span className="font-bold text-slate-900 uppercase">PRODUCTION GATEWAY</span>
          <span className="text-slate-400">|</span>
          <span>Cluster: BKK-THA-SEC-01</span>
          <span className="text-slate-400">|</span>
          <span className="hidden sm:inline">HIPAA &amp; ISO/IEC 27701 Enforced</span>
        </div>
        <div className="flex items-center gap-3 text-slate-700">
          <span className="flex items-center gap-1 font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>TLS 1.3 / EAL4+ Verified</span>
          </span>
          <span className="text-slate-300">|</span>
          <span className="font-medium text-teal-800">Thai PDPA Compliant</span>
        </div>
      </div>

      {/* Main 2-Column Gateway Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Login Card (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-6">
          {/* Card Header */}
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-teal-700 uppercase tracking-wider mb-1">
              <span>HOSPITAL CONTRACT OPS OS</span>
              <span className="bg-teal-50 px-1.5 py-0.2 rounded border border-teal-200">v4.18-prod</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900">
              เข้าสู่ระบบศูนย์สั่งการและบริหารสัญญา
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              ระบบภายในสำหรับบุคลากรและทีมงานที่ได้รับอนุญาตเท่านั้น (Authorized Personnel Only)
            </p>
          </div>

          {/* Role Simulation Mode (Quick Preview) */}
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200/80">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="font-bold text-slate-700 flex items-center gap-1.5">
                <span>เลือกบทบาทเพื่อเข้าสู่ระบบ (SELECT ROLE &amp; ACCOUNT)</span>
              </span>
              <span className="text-[11px] text-teal-700 font-semibold">1 Admin + 3 Regional AMs</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => handleSimulateLogin('admin')}
                className={`py-2 px-3 rounded-lg font-semibold text-xs transition-all flex items-center justify-between gap-2 text-left ${
                  currentRole.id === 'admin'
                    ? 'bg-amber-50 text-amber-950 shadow-xs border-2 border-amber-500 font-bold'
                    : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="w-8 h-8 rounded-lg bg-amber-100 border border-amber-200 text-amber-700 flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-4 h-4" />
                  </span>
                  <div>
                    <div className="font-bold text-slate-900">Admin ส่วนกลาง</div>
                    <div className="text-[10px] text-slate-500 font-normal">ดูแลทุกภาค • Import/Export Excel ได้</div>
                  </div>
                </div>
                {currentRole.id === 'admin' && <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0" />}
              </button>

              <button
                type="button"
                onClick={() => handleSimulateLogin('am_north')}
                className={`py-2 px-3 rounded-lg font-semibold text-xs transition-all flex items-center justify-between gap-2 text-left ${
                  currentRole.id === 'am_north'
                    ? 'bg-teal-50 text-teal-950 shadow-xs border-2 border-teal-600 font-bold'
                    : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="w-8 h-8 rounded-lg bg-teal-50 border border-teal-200 text-teal-700 flex items-center justify-center shrink-0">
                    <Briefcase className="w-4 h-4" />
                  </span>
                  <div>
                    <div className="font-bold text-slate-900">AM ภาคเหนือ</div>
                    <div className="text-[10px] text-slate-500 font-normal">ดูแลภาคเหนือ + ภาคกลาง</div>
                  </div>
                </div>
                {currentRole.id === 'am_north' && <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />}
              </button>

              <button
                type="button"
                onClick={() => handleSimulateLogin('am_northeast')}
                className={`py-2 px-3 rounded-lg font-semibold text-xs transition-all flex items-center justify-between gap-2 text-left ${
                  currentRole.id === 'am_northeast'
                    ? 'bg-teal-50 text-teal-950 shadow-xs border-2 border-teal-600 font-bold'
                    : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="w-8 h-8 rounded-lg bg-teal-50 border border-teal-200 text-teal-700 flex items-center justify-center shrink-0">
                    <Briefcase className="w-4 h-4" />
                  </span>
                  <div>
                    <div className="font-bold text-slate-900">AM ภาคอีสาน</div>
                    <div className="text-[10px] text-slate-500 font-normal">ดูแลภาคตะวันออกเฉียงเหนือ</div>
                  </div>
                </div>
                {currentRole.id === 'am_northeast' && <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />}
              </button>

              <button
                type="button"
                onClick={() => handleSimulateLogin('am_south')}
                className={`py-2 px-3 rounded-lg font-semibold text-xs transition-all flex items-center justify-between gap-2 text-left ${
                  currentRole.id === 'am_south'
                    ? 'bg-teal-50 text-teal-950 shadow-xs border-2 border-teal-600 font-bold'
                    : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="w-8 h-8 rounded-lg bg-teal-50 border border-teal-200 text-teal-700 flex items-center justify-center shrink-0">
                    <Briefcase className="w-4 h-4" />
                  </span>
                  <div>
                    <div className="font-bold text-slate-900">AM ภาคใต้</div>
                    <div className="text-[10px] text-slate-500 font-normal">ดูแลตะวันออก + ตะวันตก + ใต้</div>
                  </div>
                </div>
                {currentRole.id === 'am_south' && <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />}
              </button>
            </div>
          </div>

          {/* Google Workspace / Gmail Sign In */}
          <div className="space-y-2">
            <button
              type="button"
              onClick={() => onLoginSuccess(email)}
              className="w-full py-3 px-4 bg-white border-2 border-teal-600 hover:bg-teal-50 text-slate-900 rounded-xl text-sm font-bold flex items-center justify-center gap-3 transition-all shadow-md group"
            >
              {/* Google G logo */}
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.64v3.02h3.88c2.27-2.09 3.665-5.17 3.665-9.1z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.02c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.12C3.26 21.36 7.33 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.28 14.3c-.24-.72-.38-1.49-.38-2.3s.14-1.58.38-2.3V6.58H1.25C.45 8.18 0 9.98 0 12s.45 3.82 1.25 5.42l4.03-3.12z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.12c.95-2.83 3.6-4.95 6.72-4.95z"
                />
              </svg>
              <span>เข้าสู่ระบบด้วย Google (Gmail) ในฐานะ {currentRole.badge}</span>
              <ChevronRight className="w-4 h-4 text-teal-600 group-hover:translate-x-1 transition-transform" />
            </button>
            <p className="text-[11px] text-center text-slate-500">
              * ต้อง Lock-in ผ่านบัญชี Gmail ก่อนเข้าถึงข้อมูลภายใน WebApp ตามระเบียบความปลอดภัย
            </p>
          </div>

          {/* Divider */}
          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-slate-200"></div>
            <span className="flex-shrink mx-3 text-[11px] text-slate-500 uppercase tracking-wider font-semibold">
              หรือเข้าสู่ระบบด้วยบัญชีเจ้าหน้าที่ (ADMIN &amp; EMERGENCY ACCESS)
            </span>
            <div className="flex-grow border-t border-slate-200"></div>
          </div>

          {/* Corporate Email Login Form */}
          <form onSubmit={handleFormSubmit} className="space-y-4">
            {authError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-start gap-2">
                <AlertOctagon className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <span>{authError}</span>
              </div>
            )}

            {loginSuccessToast && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>ยืนยันตัวตนสำเร็จ กำลังนำเข้าสู่ระบบศูนย์สั่งการ...</span>
              </div>
            )}

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-700">
                  อีเมลทางการองค์กร (CORPORATE EMAIL)
                </label>
                <span className="text-[11px] font-mono text-teal-700 bg-teal-50 px-1.5 py-0.2 rounded border border-teal-200">
                  @whitelist-domain
                </span>
              </div>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin.ops@company.com"
                  className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-teal-600 focus:bg-white text-slate-900 transition-colors"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-700">
                  รหัสผ่านความปลอดภัย (SECURITY PASSWORD)
                </label>
                <button
                  type="button"
                  onClick={() => alert('คำแนะนำ: โปรดติดต่อผู้ดูแลระบบกลางที่ it-support@company.com หรือโทร 8891 เพื่อรีเซ็ตรหัสผ่านชั่วคราว')}
                  className="text-[11px] text-teal-700 hover:text-teal-800 font-medium"
                >
                  ลืมรหัสผ่าน / ขอรีเซ็ตสิทธิ์?
                </button>
              </div>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-10 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-teal-600 focus:bg-white text-slate-900 font-mono transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={trustDevice}
                  onChange={(e) => setTrustDevice(e.target.checked)}
                  className="rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                />
                <span className="text-slate-700">
                  จดจำอุปกรณ์นี้ในระบบความปลอดภัย (Trust this device 30 days)
                </span>
              </label>
              <span className="text-[11px] text-slate-400 font-mono">
                [HW Token Ready]
              </span>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 active:scale-98 text-white rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition-all shadow-sm"
            >
              <Lock className="w-4 h-4" />
              <span>{isSubmitting ? 'กำลังตรวจสอบสิทธิ์ความปลอดภัย...' : 'เข้าสู่ระบบด้วยรหัสผ่าน (Sign In)'}</span>
            </button>
          </form>

          {/* Card Footer badges */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 flex-wrap gap-2">
            <span className="flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-slate-400" />
              256-Bit SSL Encryption
            </span>
            <span className="text-slate-300">|</span>
            <span>MFA Whitelist Sync Active</span>
            <span className="text-slate-300">|</span>
            <span className="text-teal-700 font-medium flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-600"></span>
              Zero Trust Edge v2.4
            </span>
          </div>
        </div>

        {/* Right Column: Policies & Role Matrix (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Card 1: Whitelist Policy */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-teal-700" />
                <h3 className="font-bold text-slate-900 text-xs">
                  เกณฑ์การเข้าถึงและ Whitelist Policy
                </h3>
              </div>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                Sync Live
              </span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              ระบบยืนยันตัวตนเชื่อมต่อกับฐานข้อมูล Directory ส่วนกลางของ Google Cloud IAM โดยจะอนุญาตเฉพาะโดเมนดังต่อไปนี้:
            </p>

            <div className="space-y-1.5 text-xs">
              <div className="p-2 bg-slate-50 rounded border border-slate-200 flex items-center justify-between font-mono text-[11px]">
                <span className="text-emerald-700 font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  @company.com
                </span>
                <span className="text-slate-500 font-sans text-[10px] font-medium">INTERNAL STAFF / HQS</span>
              </div>

              <div className="p-2 bg-slate-50 rounded border border-slate-200 flex items-center justify-between font-mono text-[11px]">
                <span className="text-emerald-700 font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  @hospital-network.org
                </span>
                <span className="text-slate-500 font-sans text-[10px] font-medium">AUTHORIZED AM NETWORK</span>
              </div>

              <div className="p-2 bg-slate-50 rounded border border-slate-200 flex items-center justify-between font-mono text-[11px]">
                <span className="text-emerald-700 font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  @legal-partner.co.th
                </span>
                <span className="text-slate-500 font-sans text-[10px] font-medium">LEGAL AUDIT TEAM</span>
              </div>
            </div>

            <div className="p-2.5 bg-emerald-50 rounded border border-emerald-200 text-xs text-emerald-900 leading-snug flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>
                <strong>มาตรการความปลอดภัย:</strong> ต้องเข้าสู่ระบบ (Lock-in) ผ่านบัญชี Gmail ก่อนเข้าถึงข้อมูลภายใน WebApp โดย AM แต่ละภาคไม่สามารถ Import และ Export ไฟล์ Excel ได้ แต่มีหน้าที่อัปเดตไฟล์สัญญา ใบเสนอราคา และ TOR (บังคับ PDF หรือ PNG เท่านั้น)
              </span>
            </div>
          </div>

          {/* Card 2: Role Matrix (4 Tiers) */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-xs">
                สรุปสิทธิ์การเข้าถึงตาม Role Matrix
              </h3>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                1 Admin + 3 AMs
              </span>
            </div>

            <div className="space-y-2 text-xs">
              {Object.values(ROLES_CONFIG).map((role) => (
                <div
                  key={role.id}
                  onClick={() => onSelectRole(role)}
                  className={`p-2.5 rounded-lg border transition-all cursor-pointer ${
                    currentRole.id === role.id
                      ? 'border-teal-500 bg-teal-50/50 shadow-2xs'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-slate-900 flex items-center gap-1.5">
                      {role.name}
                    </span>
                    <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                      currentRole.id === role.id ? 'bg-teal-700 text-white' : 'bg-slate-100 text-slate-700'
                    }`}>
                      {role.tagline}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    {role.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Card 3: IT Helpdesk Contact & SLA */}
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs space-y-2">
            <div className="flex items-center gap-1.5 font-bold text-slate-800">
              <HelpCircle className="w-3.5 h-3.5 text-teal-700" />
              <span>ต้องการเปิดสิทธิ์หรือเพิ่ม Email เข้า Whitelist?</span>
            </div>
            <p className="text-[11px] text-slate-600">
              ติดต่อ Enterprise IT Helpdesk (ext. <strong>8891</strong>) หรือส่งคำขออย่างเป็นทางการผ่าน{' '}
              <a href="mailto:it-support@company.com" className="text-teal-700 underline font-semibold">
                it-support@company.com
              </a>
            </p>
            <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                Google Cloud RTDB &amp; Auth Service: Online
              </span>
              <span className="font-mono text-emerald-700 font-bold">99.98% SLA</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer System Status */}
      <footer className="pt-8 border-t border-slate-200 text-xs text-slate-500 flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 text-teal-700 font-medium">
            <span className="w-2 h-2 rounded-full bg-teal-600"></span>
            MediCommand Core OS v4.18.2
          </span>
          <span>|</span>
          <span>SHA-256 Auth Gateway Active</span>
        </div>

        <div className="flex items-center gap-4 text-[11px] text-slate-600 flex-wrap">
          <a href="#whitepaper" onClick={(e) => { e.preventDefault(); alert('Security Whitepaper: End-to-End Encryption with Thai PDPA & HIPAA alignment.'); }} className="hover:underline">
            Security Whitepaper
          </a>
          <a href="#baa" onClick={(e) => { e.preventDefault(); alert('BAA (Business Associate Agreement) is active across 185 hospital partners.'); }} className="hover:underline">
            Business Associate Agreement (BAA)
          </a>
          <a href="#support" onClick={(e) => { e.preventDefault(); alert('Institutional Support: 24/7 hotline 1800-MEDICMD.'); }} className="hover:underline">
            Institutional Support
          </a>
          <a href="#status" onClick={(e) => { e.preventDefault(); alert('System Status: All 12 Regional Gateway Clusters Operational.'); }} className="hover:underline">
            System Status
          </a>
        </div>

        <p className="text-[11px] text-slate-400">
          © 2025 MediCommand Health Systems Inc. All rights reserved.
        </p>
      </footer>
    </div>
  );
};
