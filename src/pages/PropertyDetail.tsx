import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { MapPin, Bed, Bath, Maximize, Calendar, Clock, Loader2, CheckCircle2 } from 'lucide-react';
import { getPropertyById, getRecommendedProperties } from '../services/propertyService';
import { createBooking } from '../services/bookingService';
import { Property, BookingStatus } from '../types';
import { auth } from '../lib/firebase';
import { motion } from 'motion/react';

export default function PropertyDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [property, setProperty] = useState<Property | null>(null);
  const [recommendations, setRecommendations] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [bookingDate, setBookingDate] = useState('');
  const [bookingTime, setBookingTime] = useState('');
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    getPropertyById(id).then(prop => {
      if (prop) {
        setProperty(prop);
        getRecommendedProperties(prop.price, prop.area, prop.type).then(recs => {
          if (recs) setRecommendations(recs.filter(r => r.id !== id));
        });
      }
      setLoading(false);
    });
  }, [id]);

  const handleBooking = async () => {
    if (!auth.currentUser) {
      alert("Please sign in to book a visit.");
      return;
    }
    if (!bookingDate || !bookingTime || !id) return;

    setBookingLoading(true);
    try {
      await createBooking({ propertyId: id, date: bookingDate, time: bookingTime });
      setBookingSuccess(true);
      setTimeout(() => setBookingSuccess(false), 5000);
    } catch (error) {
      console.error("Booking failed:", error);
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) return (
    <div className="flex justify-center py-48">
      <div className="w-12 h-12 border-4 border-[#141414] border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  if (!property) return <div className="text-center py-48">Property not found.</div>;

  return (
    <div className="space-y-24 pb-24">
      {/* Hero Section */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        <div className="space-y-8">
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <span className="px-3 py-1 bg-[#141414] text-white text-[10px] font-bold uppercase tracking-widest rounded-md">
                {property.type}
              </span>
              <span className="text-[#141414]/40 uppercase text-xs font-bold tracking-widest flex items-center">
                <MapPin className="w-4 h-4 mr-1" />
                {property.area}
              </span>
            </div>
            <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter leading-none">
              {property.title}
            </h1>
            <p className="text-4xl font-black text-[#141414]">
              PKR {(property.price / 10000000).toFixed(1)} Crore
            </p>
          </div>

          <div className="grid grid-cols-3 gap-4">
            {[
              { icon: Bed, label: "Rooms", value: property.rooms },
              { icon: Bath, label: "Baths", value: property.bathrooms },
              { icon: Maximize, label: "Area", value: property.areaSize }
            ].map((stat, i) => (
              <div key={i} className="bg-white border border-[#141414]/5 p-6 rounded-3xl space-y-2">
                <stat.icon className="w-6 h-6 text-[#141414]/40" />
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#141414]/40">{stat.label}</p>
                <p className="text-lg font-bold">{stat.value}</p>
              </div>
            ))}
          </div>

          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-widest underline decoration-offset-4">Description</h3>
            <p className="text-[#141414]/70 leading-relaxed font-medium">
              {property.description}
            </p>
          </div>
        </div>

        <div className="space-y-12">
          <div className="aspect-[4/3] rounded-[3rem] overflow-hidden shadow-2xl">
            <img src={property.imageUrl} alt={property.title} className="w-full h-full object-cover" />
          </div>

          {/* Booking Card */}
          <div className="bg-white rounded-[3rem] p-10 shadow-xl border border-[#141414]/5 space-y-8">
            <div>
              <h3 className="text-2xl font-black uppercase tracking-tight">Book a Visit</h3>
              <p className="text-sm text-[#141414]/40 uppercase font-bold tracking-widest mt-1">Schedule a physical inspection</p>
            </div>

            {bookingSuccess ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-green-50 border border-green-100 p-8 rounded-3xl text-center space-y-4"
              >
                <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto" />
                <div>
                  <h4 className="font-bold text-green-800 uppercase tracking-tight">Visit Scheduled!</h4>
                  <p className="text-sm text-green-600 font-medium">An agent will call you shortly to confirm the details.</p>
                </div>
              </motion.div>
            ) : (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-[#141414]/40 ml-2">Date</label>
                    <div className="relative">
                      <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#141414]/40" />
                      <input 
                        type="date"
                        className="w-full bg-[#f5f5f0] border-none rounded-2xl pl-12 pr-4 py-4 text-sm font-bold focus:ring-2 focus:ring-[#141414]"
                        value={bookingDate}
                        onChange={(e) => setBookingDate(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-[#141414]/40 ml-2">Time</label>
                    <div className="relative">
                      <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#141414]/40" />
                      <input 
                        type="time"
                        className="w-full bg-[#f5f5f0] border-none rounded-2xl pl-12 pr-4 py-4 text-sm font-bold focus:ring-2 focus:ring-[#141414]"
                        value={bookingTime}
                        onChange={(e) => setBookingTime(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <button
                  disabled={bookingLoading || !bookingDate || !bookingTime}
                  onClick={handleBooking}
                  className="w-full bg-[#141414] text-white py-5 rounded-2xl font-bold uppercase tracking-widest hover:bg-black transition-all flex items-center justify-center space-x-3 disabled:opacity-50"
                >
                  {bookingLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <span>Confirm Visit</span>}
                </button>
                <p className="text-[10px] text-center text-[#141414]/30 uppercase tracking-widest font-bold">
                  By booking, you agree to be contacted by our sales team.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <section className="space-y-12">
          <div className="text-center">
            <h2 className="text-4xl font-black uppercase tracking-tighter">You might also like</h2>
            <p className="text-[#141414]/40 uppercase text-xs font-bold tracking-widest mt-2">Recommended based on location & price</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {recommendations.map((prop) => (
              <Link key={prop.id} to={`/properties/${prop.id}`} className="group block space-y-4">
                <div className="aspect-[4/3] overflow-hidden rounded-3xl relative">
                  <img src={prop.imageUrl} alt={prop.title} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" />
                  <div className="absolute top-4 right-4 bg-black/80 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold text-white uppercase tracking-widest">
                    {prop.type}
                  </div>
                </div>
                <div className="px-2">
                  <p className="text-[10px] font-bold text-[#141414]/40 uppercase tracking-widest">{prop.area}</p>
                  <h4 className="font-bold uppercase leading-tight group-hover:underline">{prop.title}</h4>
                  <p className="font-black text-[#141414]">PKR {(prop.price / 10000000).toFixed(1)} Cr</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
