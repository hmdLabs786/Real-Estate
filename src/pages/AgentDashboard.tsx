import { useEffect, useState } from 'react';
import { LayoutDashboard, Users, Calendar, TrendingUp, Search, UserCheck, Star, AlertCircle } from 'lucide-react';
import { getAllQualifiedLeads } from '../services/leadService';
import { getAllBookings } from '../services/bookingService';
import { getPropertyById } from '../services/propertyService';
import { Lead, Booking, Property, LeadStatus } from '../types';
import { format } from 'date-fns';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { seedDatabase } from '../lib/seed';
import { auth } from '../lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';

export default function AgentDashboard() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [bookings, setBookings] = useState<(Booking & { property?: Property | null })[]>([]);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);

  const loadData = async () => {
    const [leadsData, bookingsData] = await Promise.all([
      getAllQualifiedLeads(),
      getAllBookings()
    ]);
    
    if (leadsData) setLeads(leadsData);
    
    if (bookingsData) {
      const enriched = await Promise.all(bookingsData.map(async b => {
        const prop = await getPropertyById(b.propertyId);
        return { ...b, property: prop };
      }));
      setBookings(enriched);
    }
  };

  useEffect(() => {
    onAuthStateChanged(auth, (u) => {
      if (u && u.email === 'habban.madani786@gmail.com') {
        loadData().then(() => setLoading(false));
      } else {
        setLoading(false);
      }
    });
  }, []);

  const handleSeed = async () => {
    setSeeding(true);
    try {
      await seedDatabase();
      await loadData();
    } catch (e) {
      console.error(e);
    } finally {
      setSeeding(false);
    }
  };

  const stats = [
    { label: "High Interest Leads", value: leads.length, icon: Users, color: "text-blue-600" },
    { label: "Scheduled Visits", value: bookings.length, icon: Calendar, color: "text-green-600" },
    { label: "Serious Buyers", value: leads.filter(l => l.status === LeadStatus.SERIOUS).length, icon: UserCheck, color: "text-indigo-600" },
    { label: "Conversion Rate", value: "12%", icon: TrendingUp, color: "text-orange-600" }
  ];

  const chartData = [
    { area: "DHA", value: leads.filter(l => l.location?.includes("DHA")).length },
    { area: "Clifton", value: leads.filter(l => l.location?.includes("Clifton")).length },
    { area: "Bahria", value: leads.filter(l => l.location?.includes("Bahria")).length },
    { area: "Gulshan", value: leads.filter(l => l.location?.includes("Gulshan")).length }
  ];

  if (loading) return (
    <div className="flex justify-center py-48">
      <div className="w-12 h-12 border-4 border-[#141414] border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="space-y-8 pb-24">
      <header className="h-16 border-b border-slate-200 bg-white flex items-center justify-between px-6 shrink-0 -mx-4 sm:-mx-6 lg:-mx-8 mb-8 sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
            <LayoutDashboard className="text-white w-4 h-4" />
          </div>
          <h1 className="text-xl font-bold tracking-tight">Agent<span className="text-blue-600">Command</span></h1>
          <span className="ml-4 px-2 py-0.5 bg-slate-100 text-slate-500 text-[10px] font-bold rounded uppercase tracking-wider hidden sm:inline-block">System v2.4</span>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={handleSeed} 
            disabled={seeding}
            className="px-3 py-1 bg-slate-100 text-slate-500 hover:bg-slate-200 rounded text-[10px] font-bold transition-all disabled:opacity-50 mr-4"
          >
            {seeding ? 'Seeding...' : 'Seed Data'}
          </button>
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Live Market Feed</span>
        </div>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{stat.label}</p>
            <div className="flex items-end justify-between">
              <p className="text-3xl font-black tracking-tight">{stat.value}</p>
              <stat.icon className={`w-5 h-5 ${stat.color} opacity-20`} />
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-col lg:flex-row gap-6 overflow-hidden max-h-screen">
        {/* Column 1: Qualified Leads */}
        <section className="flex-1 flex flex-col bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden min-h-[500px]">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-widest text-slate-500">Pipeline Activity</h2>
            <button className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">Full Report</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 text-[9px] uppercase font-bold tracking-widest text-slate-400">
                  <th className="px-6 py-4">Buyer Entity</th>
                  <th className="px-6 py-4">Budget</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {leads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-slate-50/50 transition-colors cursor-pointer group">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                          {lead.displayName?.[0] || 'U'}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-800">{lead.displayName || 'Unknown'}</p>
                          <p className="text-[9px] text-slate-400">{lead.location}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-xs font-bold text-slate-800">
                        {lead.budget ? `${(lead.budget / 10000000).toFixed(1)} Cr` : 'N/A'}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-widest border ${
                        lead.status === LeadStatus.SERIOUS 
                          ? 'bg-blue-50 text-blue-600 border-blue-100' 
                          : 'bg-slate-100 text-slate-500 border-slate-200'
                      }`}>
                        {lead.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                       <div className="flex items-center gap-2">
                         <div className="flex-1 h-1.5 w-12 bg-slate-100 rounded-full overflow-hidden">
                           <div className={`h-full ${lead.isSerious ? 'bg-blue-400 w-[85%]' : 'bg-slate-300 w-[40%]'}`}></div>
                         </div>
                         <span className="text-[9px] font-mono text-slate-400">{lead.isSerious ? '85%' : '40%'}</span>
                       </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Column 2: Dashboard Sidebar */}
        <aside className="w-full lg:w-[320px] bg-slate-900 text-white rounded-2xl p-6 flex flex-col shadow-xl space-y-8">
          <div className="space-y-6">
            <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400">Agent Performance</h2>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#3b82f6' : '#1e293b'} />
                    ))}
                  </Bar>
                  <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ backgroundColor: '#0f172a', border: 'none', color: '#fff', fontSize: '9px' }} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                <p className="text-[9px] text-slate-500 uppercase font-bold tracking-widest">Leads</p>
                <p className="text-xl font-bold">{leads.length}</p>
              </div>
              <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                <p className="text-[9px] text-blue-400 uppercase font-bold tracking-widest">Qualified</p>
                <p className="text-xl font-bold">{leads.filter(l => l.status === LeadStatus.SERIOUS).length}</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400">Next Inspections</h2>
            <div className="space-y-3">
              {bookings.slice(0, 3).map((booking) => (
                <div key={booking.id} className="p-3 bg-slate-800/50 rounded-xl border border-white/5 flex items-center justify-between">
                   <div className="min-w-0">
                      <p className="text-[10px] font-bold truncate">{booking.property?.title}</p>
                      <p className="text-[8px] text-slate-500 font-medium">{booking.userName} • {format(new Date(booking.date), 'MMM d')}</p>
                   </div>
                   <button className="px-2 py-1 bg-white text-slate-900 text-[8px] font-bold rounded uppercase">Call</button>
                </div>
              ))}
            </div>
          </div>

          <button className="w-full py-4 bg-blue-600 hover:bg-blue-500 rounded-xl text-xs font-bold uppercase tracking-widest transition-all shadow-lg shadow-blue-900/40">
            Export CRM Data
          </button>
        </aside>
      </div>
    </div>
  );
}
