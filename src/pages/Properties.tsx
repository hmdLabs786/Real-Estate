import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Filter, Search, X } from 'lucide-react';
import { getProperties } from '../services/propertyService';
import { Property, PropertyType } from '../types';
import { motion, AnimatePresence } from 'motion/react';

export default function PropertiesPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    area: '',
    type: '' as any,
    maxPrice: 0
  });

  useEffect(() => {
    setLoading(true);
    getProperties({
      area: filters.area || undefined,
      type: filters.type || undefined,
      maxPrice: filters.maxPrice || undefined
    }).then(props => {
      if (props) setProperties(props);
      setLoading(false);
    });
  }, [filters]);

  const areas = ["DHA Karachi", "Clifton", "Bahria Town Karachi", "Gulshan-e-Iqbal"];

  return (
    <div className="space-y-12 pb-24">
      <header className="space-y-4">
        <h1 className="text-6xl font-black uppercase tracking-tighter">Karachi Collections</h1>
        <p className="text-[#141414]/40 uppercase text-sm font-bold tracking-widest max-w-lg">
          Browse through the most premium and verified listings across the city's key developments.
        </p>
      </header>

      {/* Filters */}
      <div className="bg-white border border-[#141414]/10 rounded-3xl p-6 flex flex-wrap gap-6 items-center">
        <div className="flex-1 min-w-[200px]">
          <label className="block text-[10px] font-bold uppercase tracking-widest text-[#141414]/40 mb-2">Area</label>
          <select 
            className="w-full bg-[#f5f5f0] border-none rounded-xl px-4 py-2 text-sm font-medium focus:ring-2 focus:ring-[#141414]"
            value={filters.area}
            onChange={(e) => setFilters(prev => ({ ...prev, area: e.target.value }))}
          >
            <option value="">All Karachi</option>
            {areas.map(a => <option key={a} value={a}>{a}</option>)}
          </select>
        </div>

        <div className="flex-1 min-w-[200px]">
          <label className="block text-[10px] font-bold uppercase tracking-widest text-[#141414]/40 mb-2">Property Type</label>
          <select 
            className="w-full bg-[#f5f5f0] border-none rounded-xl px-4 py-2 text-sm font-medium focus:ring-2 focus:ring-[#141414]"
            value={filters.type}
            onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
          >
            <option value="">Any Type</option>
            <option value={PropertyType.HOUSE}>House</option>
            <option value={PropertyType.APARTMENT}>Apartment</option>
            <option value={PropertyType.PLOT}>Plot</option>
          </select>
        </div>

        <div className="flex-1 min-w-[200px]">
          <label className="block text-[10px] font-bold uppercase tracking-widest text-[#141414]/40 mb-2">Max Price (Crore)</label>
          <input 
            type="number"
            placeholder="e.g. 10"
            className="w-full bg-[#f5f5f0] border-none rounded-xl px-4 py-2 text-sm font-medium focus:ring-2 focus:ring-[#141414]"
            onChange={(e) => setFilters(prev => ({ ...prev, maxPrice: Number(e.target.value) * 10000000 }))}
          />
        </div>

        <button 
          onClick={() => setFilters({ area: '', type: '' as any, maxPrice: 0 })}
          className="p-3 bg-[#141414] text-white rounded-xl hover:bg-black transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="flex justify-center py-24">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12">
          <AnimatePresence>
            {properties.map((prop) => (
              <motion.div
                key={prop.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
              >
                <Link to={`/properties/${prop.id}`} className="group block h-full bg-white rounded-2xl border border-slate-200 shadow-sm hover:border-blue-300 transition-all overflow-hidden flex flex-col">
                  <div className="aspect-[4/3] overflow-hidden relative bg-slate-200">
                    <img 
                      src={prop.imageUrl} 
                      alt={prop.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-4 right-4 bg-green-500 text-white text-[9px] px-2 py-0.5 rounded-full font-bold uppercase shadow-sm">
                      Premium Match
                    </div>
                  </div>
                  <div className="p-6 flex-1 flex flex-col">
                    <div className="flex justify-between items-start mb-2">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center">
                        <MapPin className="w-3 h-3 mr-1" />
                        {prop.area}
                      </p>
                      <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 bg-slate-100 text-slate-500 rounded">
                        {prop.type}
                      </span>
                    </div>
                    <h3 className="font-bold text-base leading-tight text-slate-800 uppercase mb-3 line-clamp-1">{prop.title}</h3>
                    <div className="mt-auto pt-4 border-t border-slate-50 flex items-center justify-between">
                      <p className="text-xl font-black text-slate-900 tracking-tighter">
                        PKR {(prop.price / 10000000).toFixed(1)}M
                      </p>
                      <span className="text-[10px] text-blue-600 font-bold uppercase tracking-widest">Detail →</span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {!loading && properties.length === 0 && (
        <div className="text-center py-24 space-y-6">
          <div className="text-6xl text-[#141414]/10 font-black">NO MATCHES</div>
          <p className="text-[#141414]/40 uppercase text-sm font-bold tracking-widest">
            Try adjusting your filters or chatting with our assistant.
          </p>
        </div>
      )}
    </div>
  );
}
