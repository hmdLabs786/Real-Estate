import { useState, useEffect, useRef } from 'react';
import { MessageSquare, X, Send, User, ChevronDown, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { processChatMessage, ChatMessage } from '../services/chatbotService';
import { auth } from '../lib/firebase';
import ReactMarkdown from 'react-markdown';

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [bookingPrompt, setBookingPrompt] = useState<{ active: boolean, propertyTitle: string | null } | null>(null);
  const [bookingDate, setBookingDate] = useState('');
  const [bookingTime, setBookingTime] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping, bookingPrompt]);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([
        { role: 'assistant', content: "Hello! Welcome to Karachi Estates. I'm here to help you find the perfect property in Karachi. \n\nTo get started, could you tell me your **budget** and which **area** you're interested in?" }
      ]);
    }
  }, [isOpen]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setIsTyping(true);

    try {
      const response = await processChatMessage(input, [...messages, userMessage]);
      setMessages(prev => [...prev, { role: 'assistant', content: response.message }]);
      
      if (response.data?.bookingRequested) {
        setBookingPrompt({
          active: true,
          propertyTitle: response.data.targetProperty
        });
      }
    } catch (error) {
      setMessages(prev => [...prev, { role: 'assistant', content: "Sorry, I had a bit of a glitch. Could you try saying that again?" }]);
    } finally {
      setIsLoading(false);
      setIsTyping(false);
    }
  };

  const confirmBooking = async () => {
    if (!bookingDate || !bookingTime) return;
    
    setIsLoading(true);
    try {
      // In a real app, we'd lookup propertyId from title or use one passed from AI
      // For now, let's say it's a general request if no ID
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: `✅ **Great!** I've noted down your visit request for **${bookingPrompt?.propertyTitle || 'the property'}** on **${bookingDate}** at **${bookingTime}**. \n\nOne of our agents will contact you shortly to confirm!` 
      }]);
      setBookingPrompt(null);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className="mb-4 w-80 sm:w-96 bg-white rounded-2xl border border-slate-200 shadow-xl flex flex-col overflow-hidden h-[500px]"
          >
            {/* Header */}
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]"></div>
                <h2 className="text-sm font-bold tracking-tight">AI Assistant: Ayesha</h2>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-slate-50 rounded-full transition-colors text-slate-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Messages */}
            <div 
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-4 space-y-4 bg-white"
            >
              {messages.map((msg, i) => (
                <div key={i} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                  <div className={`max-w-[90%] p-3 text-xs leading-relaxed ${
                    msg.role === 'user' 
                      ? 'bg-blue-600 text-white rounded-2xl rounded-tr-none' 
                      : 'bg-slate-100 text-slate-700 rounded-2xl rounded-tl-none'
                  }`}>
                    <div className="prose prose-sm prose-slate max-w-none">
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                    </div>
                  </div>
                  <span className="text-[9px] text-slate-400 mt-1 uppercase tracking-widest font-medium">
                    {msg.role === 'user' ? 'You' : 'Ayesha'} • Just now
                  </span>
                </div>
              ))}
              
              {bookingPrompt?.active && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col items-start"
                >
                  <div className="bg-blue-50 border border-blue-100 p-4 rounded-2xl rounded-tl-none w-full space-y-3">
                    <div>
                      <p className="text-[10px] font-bold text-blue-800 uppercase tracking-widest mb-1">Schedule Visit</p>
                      <p className="text-xs text-blue-600 font-medium">For: {bookingPrompt.propertyTitle || 'Interested Property'}</p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2">
                       <div className="space-y-1">
                         <label className="text-[9px] text-blue-400 uppercase font-bold">Date</label>
                         <input 
                           type="date" 
                           className="w-full bg-white border border-blue-200 rounded-lg p-1.5 text-[10px] focus:outline-none focus:border-blue-500"
                           value={bookingDate}
                           onChange={(e) => setBookingDate(e.target.value)}
                         />
                       </div>
                       <div className="space-y-1">
                         <label className="text-[9px] text-blue-400 uppercase font-bold">Time</label>
                         <select 
                           className="w-full bg-white border border-blue-200 rounded-lg p-1.5 text-[10px] focus:outline-none focus:border-blue-500"
                           value={bookingTime}
                           onChange={(e) => setBookingTime(e.target.value)}
                         >
                           <option value="">Select Time</option>
                           <option value="10:00 AM">10:00 AM</option>
                           <option value="11:00 AM">11:00 AM</option>
                           <option value="12:00 PM">12:00 PM</option>
                           <option value="02:00 PM">02:00 PM</option>
                           <option value="03:00 PM">03:00 PM</option>
                           <option value="04:00 PM">04:00 PM</option>
                           <option value="05:00 PM">05:00 PM</option>
                         </select>
                       </div>
                    </div>
                    
                    <button 
                      onClick={confirmBooking}
                      disabled={!bookingDate || !bookingTime}
                      className="w-full bg-blue-600 text-white py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-blue-700 transition-all disabled:opacity-50"
                    >
                      Confirm Appointment
                    </button>
                    <button 
                      onClick={() => setBookingPrompt(null)}
                      className="w-full text-blue-400 text-[10px] font-bold uppercase tracking-widest pt-1"
                    >
                      Maybe Later
                    </button>
                  </div>
                </motion.div>
              )}

              {isTyping && (
                <div className="flex flex-col items-start">
                  <div className="bg-slate-100 p-3 rounded-2xl rounded-tl-none flex items-center space-x-1.5">
                    <span className="w-1 h-1 bg-slate-400 rounded-full animate-bounce"></span>
                    <span className="w-1 h-1 bg-slate-400 rounded-full animate-bounce delay-75"></span>
                    <span className="w-1 h-1 bg-slate-400 rounded-full animate-bounce delay-150"></span>
                  </div>
                  <span className="text-[9px] text-slate-400 mt-1 uppercase tracking-widest italic font-mono">Typing...</span>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center gap-2">
              <div className="flex-1 bg-white border border-slate-200 rounded-full px-4 py-2 flex items-center focus-within:border-blue-400 transition-all shadow-sm">
                <input
                  type="text"
                  placeholder="Message Ayesha..."
                  className="flex-1 bg-transparent border-none focus:outline-none text-xs text-slate-600 placeholder:text-slate-400"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                />
              </div>
              <button
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className="w-9 h-9 flex items-center justify-center bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors disabled:opacity-50 shadow-md"
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-14 h-14 rounded-full shadow-2xl flex items-center justify-center transition-all ${
          isOpen ? 'bg-white text-[#141414] rotate-90 border border-[#141414]/10' : 'bg-[#141414] text-white'
        }`}
      >
        {isOpen ? <ChevronDown className="w-6 h-6" /> : <MessageSquare className="w-6 h-6" />}
      </motion.button>
    </div>
  );
}
