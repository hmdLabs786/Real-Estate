import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, MapPin, Home as HomeIcon, TrendingUp, ShieldCheck, Zap } from 'lucide-react';
import { getProperties } from '../services/propertyService';
import { Property } from '../types';
import { motion } from 'motion/react';

export default function HomePage() {
  const [featuredProperties, setFeaturedProperties] = useState<Property[]>([]);

  useEffect(() => {
    getProperties({ limit: 3 }).then(props => {
      if (props) setFeaturedProperties(props.slice(0, 3));
    });
  }, []);

  return (
    <div className="space-y-24 pb-24">
      {/* Hero Section */}
      <section className="relative h-[80vh] min-h-[600px] flex items-center justify-center overflow-hidden rounded-3xl shadow-xl border border-slate-200">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1582407947304-fd86f028f716?auto=format&fit=crop&q=80&w=2000" 
            alt="Karachi Skyline"
            className="w-full h-full object-cover brightness-[0.4]"
          />
        </div>
        
        <div className="relative z-10 text-center text-white px-4 max-w-4xl space-y-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl md:text-8xl font-black uppercase leading-[0.9] tracking-tighter">
              The Future of <br />
              <span className="text-blue-400">Karachi Living</span>
            </h1>
          </motion.div>
          
          <p className="text-sm md:text-base text-white/70 max-w-2xl mx-auto font-medium tracking-widest uppercase">
            Curated premium listings in DHA, Clifton, Bahria Town & Gulshan.
          </p>

          <div className="flex flex-col md:flex-row items-center justify-center gap-4">
            <Link 
              to="/properties" 
              className="px-8 py-4 bg-blue-600 text-white rounded-xl font-bold uppercase tracking-widest hover:bg-blue-700 transition-colors w-full md:w-auto shadow-lg"
            >
              Explore Listings
            </Link>
            <p className="text-white/60 text-xs font-bold uppercase tracking-[0.2em] px-4">Powered by AI Matching</p>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-6xl mx-auto px-4">
        {[
          { icon: ShieldCheck, title: "Verified Listings", desc: "Rigorous documentation verification for absolute peace of mind." },
          { icon: Zap, title: "AI-Powered Matching", desc: "Smart filtering based on real-time budget and area analytics." },
          { icon: TrendingUp, title: "Market Insights", desc: "Enterprise-grade data on property trends across Karachi's phases." }
        ].map((feat, i) => (
          <div key={i} className="space-y-4 p-8 bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
              <feat.icon className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold uppercase tracking-tight text-slate-900">{feat.title}</h3>
            <p className="text-xs text-slate-500 font-medium leading-relaxed">{feat.desc}</p>
          </div>
        ))}
      </section>

      {/* Featured Properties Container */}
      <section className="space-y-12">
        <div className="flex justify-between items-end">
          <div>
            <h2 className="text-4xl font-black uppercase tracking-tighter">New Arrivals</h2>
            <p className="text-[#141414]/40 uppercase text-xs font-bold tracking-widest mt-2">Latest listings in prime Karachi areas</p>
          </div>
          <Link to="/properties" className="text-sm font-bold uppercase tracking-widest border-b-2 border-[#141414] pb-1 hover:opacity-60 transition-opacity">
            View All
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {featuredProperties.map((prop) => (
            <Link key={prop.id} to={`/properties/${prop.id}`} className="group block space-y-4">
              <div className="aspect-[4/5] overflow-hidden rounded-3xl relative">
                <img 
                  src={prop.imageUrl} 
                  alt={prop.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-sm">
                  {prop.type}
                </div>
              </div>
              <div className="space-y-1 px-2">
                <p className="text-xs font-bold text-[#141414]/40 uppercase tracking-widest flex items-center">
                  <MapPin className="w-3 h-3 mr-1" />
                  {prop.area}
                </p>
                <h3 className="font-bold text-lg leading-tight uppercase group-hover:underline decoration-offset-2">{prop.title}</h3>
                <p className="text-xl font-black text-[#141414]">
                  PKR {(prop.price / 10000000).toFixed(1)} Crore
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* CTA Box */}
      <section className="bg-slate-900 text-white rounded-[2.5rem] p-12 md:p-24 relative overflow-hidden shadow-2xl">
        <div className="relative z-10 max-w-xl space-y-8">
          <h2 className="text-4xl md:text-5xl font-black uppercase leading-none tracking-tighter">
            Serious About <br />
            Buying Real <br />
            <span className="text-blue-500">Estate in Karachi?</span>
          </h2>
          <p className="text-slate-400 text-lg font-medium">
            Don't waste time scrolling. Talk to Ayesha, our enterprise AI, to get pre-qualified for the best deals.
          </p>
          <button className="flex items-center space-x-4 bg-blue-600 px-8 py-4 rounded-xl hover:bg-blue-500 transition-all font-bold uppercase tracking-widest shadow-lg">
            <span>Start Chat Qualification</span>
            <Zap className="w-4 h-4 fill-white" />
          </button>
        </div>
        <div className="absolute top-0 right-0 w-1/2 h-full opacity-10 pointer-events-none hidden md:block">
           <Search className="w-full h-full p-24 text-white" />
        </div>
      </section>
    </div>
  );
}
