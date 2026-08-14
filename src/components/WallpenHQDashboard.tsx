import React from 'react';
import { UserProfile, TechTicket } from '../types';
import {
  Globe2,
  Video,
  Wrench,
  CheckCircle2,
  Cpu,
  Layers,
  Sparkles,
  ArrowUpRight,
  ShieldCheck,
  Building2,
  Truck,
} from 'lucide-react';

interface WallpenHQDashboardProps {
  currentUser: UserProfile;
  tickets: TechTicket[];
  onOpenVideoCall: () => void;
  onOpenTickets: () => void;
  onOpenManuals: () => void;
}

export const WallpenHQDashboard: React.FC<WallpenHQDashboardProps> = ({
  currentUser,
  tickets,
  onOpenVideoCall,
  onOpenTickets,
  onOpenManuals,
}) => {
  return (
    <div className="flex-1 p-6 bg-slate-950 text-white overflow-y-auto space-y-6">
      {/* Top Banner for Germany HQ */}
      <div className="bg-gradient-to-r from-slate-900 via-amber-950/60 to-slate-900 border border-amber-800/60 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1.5">
            <div className="inline-flex items-center space-x-2 bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs px-3 py-1 rounded-full font-bold">
              <Building2 className="w-3.5 h-3.5 text-amber-400" />
              <span>Wallpen GmbH Germany (Headquarters Herford)</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white">
              Guten Tag, {currentUser.name}!
            </h1>
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              Global Partner & Distributor Management System. Real-time AI video conference portal for Eurotech Korea (Official Wallpen Korea General Distributor).
            </p>
          </div>

          <button
            onClick={onOpenVideoCall}
            className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs sm:text-sm px-5 py-3 rounded-xl shadow-lg flex items-center space-x-2.5 transition-all transform hover:scale-[1.02] shrink-0"
          >
            <Video className="w-5 h-5 text-emerald-100 animate-pulse" />
            <span>Connect Direct Video Call (Eurotech Korea)</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-md space-y-2">
          <span className="text-xs font-semibold text-slate-400">Distributor Status</span>
          <div className="text-xl font-bold text-emerald-400 flex items-center gap-1.5">
            <ShieldCheck className="w-5 h-5" />
            <span>Eurotech Korea (Gold)</span>
          </div>
          <p className="text-[11px] text-slate-400">Exclusive General Partner Korea</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-md space-y-2">
          <span className="text-xs font-semibold text-slate-400">Pending Korea Support Tickets</span>
          <div className="text-2xl font-bold text-amber-300 font-mono">
            {tickets.filter((t) => t.status !== 'resolved').length}
          </div>
          <p className="text-[11px] text-slate-400">Laser offset & UV Curing reviews</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-md space-y-2">
          <span className="text-xs font-semibold text-slate-400">Upcoming Printer Freight</span>
          <div className="text-2xl font-bold text-white font-mono flex items-center gap-2">
            <Truck className="w-5 h-5 text-blue-400" />
            <span>5 Units</span>
          </div>
          <p className="text-[11px] text-slate-400">Wallpen E2 Batch for Incheon Port</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-md space-y-2">
          <span className="text-xs font-semibold text-slate-400">Active Firmware</span>
          <div className="text-2xl font-bold text-blue-300 font-mono flex items-center gap-2">
            <Cpu className="w-5 h-5 text-blue-400" />
            <span>v3.4 Release</span>
          </div>
          <p className="text-[11px] text-slate-400">Extended 5mm Laser Margin</p>
        </div>
      </div>

      {/* Korea Technical Support Escalation Queue */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2">
            <Wrench className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold text-white text-base">
              Incoming Korea Technical & Field Escalations (Eurotech)
            </h3>
          </div>
          <button
            onClick={onOpenTickets}
            className="text-xs font-medium text-amber-400 hover:text-amber-300 flex items-center gap-1"
          >
            <span>Manage All Support Tickets</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="space-y-3">
          {tickets.map((t) => (
            <div
              key={t.id}
              onClick={onOpenTickets}
              className="bg-slate-950 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 p-4 rounded-xl cursor-pointer transition-all space-y-2"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="font-mono font-bold text-xs text-amber-400">
                    {t.ticketNumber}
                  </span>
                  <span className="bg-slate-800 text-slate-300 text-[10px] px-2 py-0.5 rounded font-semibold">
                    {t.model}
                  </span>
                </div>
                <span className="text-[11px] text-slate-400">{t.updatedAt}</span>
              </div>

              <h4 className="font-bold text-sm text-slate-100">{t.title}</h4>
              <p className="text-xs text-slate-400">{t.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
