import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, MapPin, ExternalLink } from 'lucide-react';
import { getUserBookings } from '../services/bookingService';
import { getPropertyById } from '../services/propertyService';
import { Booking, Property } from '../types';

export default function BookingsPage() {
  const [items, setItems] = useState<{ booking: Booking, property: Property | null }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const bookings = await getUserBookings();
      if (bookings) {
        const enriched = await Promise.all(bookings.map(async b => {
          const prop = await getPropertyById(b.propertyId);
          return { booking: b, property: prop || null };
        }));
        setItems(enriched);
      }
      setLoading(false);
    }
    load();
  }, []);

  if (loading) return (
    <div className="flex justify-center py-48">
      <div className="w-12 h-12 border-4 border-[#141414] border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="space-y-12 pb-24">
      <header className="space-y-4">
        <h1 className="text-6xl font-black uppercase tracking-tighter">My Schedule</h1>
        <p className="text-[#141414]/40 uppercase text-sm font-bold tracking-widest max-w-lg">
          Manage your upcoming property visits and appointments.
        </p>
      </header>

      {items.length === 0 ? (
        <div className="bg-white rounded-[3rem] p-24 text-center space-y-8 border border-[#141414]/5">
          <Calendar className="w-24 h-24 text-[#141414]/5 mx-auto" />
          <div className="space-y-2">
            <h3 className="text-2xl font-bold uppercase tracking-tight">No Visists Scheduled</h3>
            <p className="text-[#141414]/40 text-sm font-medium uppercase tracking-widest">Explore our collection to book your first inspection.</p>
          </div>
          <Link to="/properties" className="inline-block px-12 py-4 bg-[#141414] text-white rounded-full font-bold uppercase tracking-widest hover:bg-black transition-colors">
            Start Exploring
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {items.map((item) => (
            <div key={item.booking.id} className="bg-white rounded-[2rem] p-8 flex flex-col md:flex-row gap-8 items-center border border-[#141414]/5 hover:shadow-xl transition-shadow">
              <div className="w-full md:w-48 h-32 rounded-2xl overflow-hidden flex-shrink-0">
                {item.property ? (
                  <img src={item.property.imageUrl} alt={item.property.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-[#f5f5f0] flex items-center justify-center">
                    <MapPin className="w-8 h-8 text-[#141414]/10" />
                  </div>
                )}
              </div>

              <div className="flex-1 space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-bold uppercase tracking-tight">
                      {item.property?.title || 'Unknown Property'}
                    </h3>
                    <p className="text-sm text-[#141414]/40 font-medium flex items-center mt-1">
                      <MapPin className="w-3 h-3 mr-1" />
                      {item.property?.area || 'N/A'}
                    </p>
                  </div>
                  <div className="px-3 py-1 bg-yellow-100 text-yellow-800 text-[10px] font-bold uppercase tracking-widest rounded-full">
                    {item.booking.status}
                  </div>
                </div>

                <div className="flex flex-wrap gap-6">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-[#141414]/40" />
                    <span className="text-sm font-bold uppercase tracking-wide">{item.booking.date}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-[#141414]/40" />
                    <span className="text-sm font-bold uppercase tracking-wide">{item.booking.time}</span>
                  </div>
                </div>
              </div>

              <div className="w-full md:w-auto">
                <Link 
                  to={`/properties/${item.booking.propertyId}`}
                  className="flex items-center justify-center space-x-2 px-6 py-3 bg-[#f5f5f0] text-[#141414] rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-[#141414] hover:text-white transition-all w-full md:w-auto"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>View Property</span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
