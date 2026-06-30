
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Camera, MapPin, Activity, ChevronRight, Info, PawPrint, Heart, Users, Shield, ArrowUpRight, Bone, Soup, Sparkles } from 'lucide-react';
import { UserRole, EmergencyReport, Donation, DonationStatus } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

interface HomeScreenProps {
  role: UserRole;
  reports: EmergencyReport[];
  donations: Donation[];
}

// Animated counter that counts up on mount
const AnimatedStat: React.FC<{ target: string; duration?: number }> = ({ target, duration = 1500 }) => {
  const [display, setDisplay] = useState('0');
  
  useEffect(() => {
    // Parse the target: could be "1.2k", "450", "98%"
    const isPercentage = target.includes('%');
    const hasK = target.includes('k');
    const numericPart = parseFloat(target.replace(/[^0-9.]/g, ''));
    
    const steps = 50;
    const stepDuration = duration / steps;
    let current = 0;
    const increment = numericPart / steps;
    
    const timer = setInterval(() => {
      current += increment;
      if (current >= numericPart) {
        setDisplay(target); // Set final formatted value
        clearInterval(timer);
      } else {
        let formatted = '';
        if (hasK) {
          formatted = current.toFixed(1) + 'k';
        } else if (isPercentage) {
          formatted = Math.floor(current) + '%';
        } else {
          formatted = Math.floor(current).toString();
        }
        setDisplay(formatted);
      }
    }, stepDuration);
    
    return () => clearInterval(timer);
  }, [target, duration]);

  return <span>{display}</span>;
};

const HomeScreen: React.FC<HomeScreenProps> = ({ role, reports, donations }) => {
  const { t } = useLanguage();
  const recentReports = reports.slice(0, 3);
  const availableDonations = donations.filter(d => d.status === DonationStatus.AVAILABLE);
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    requestAnimationFrame(() => setMounted(true));
  }, []);

  return (
    <div className={`p-6 md:p-0 space-y-8 pb-24 md:pb-6 mesh-gradient min-h-screen transition-opacity duration-700 ${mounted ? 'opacity-100' : 'opacity-0'}`}>
      {/* Desktop Welcome */}
      <div className="hidden md:block mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-bold uppercase tracking-widest text-emerald-600">Live</span>
        </div>
        <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">
          {t('missionControl')}
        </h1>
        <p className="text-gray-500 font-medium mt-1">{t('welcomeBack')} <span className="text-emerald-600 font-bold">{t('onlineMonitoring')}</span></p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main Hero Card — animated gradient border */}
        <div className="md:col-span-2 relative group">
          <div className="absolute -inset-1 rounded-[var(--border-radius-xl)] blur-lg opacity-30 group-hover:opacity-50 transition-all duration-700 animate-gradient-shift"
            style={{ background: 'linear-gradient(135deg, #059669, #34d399, #6ee7b7, #059669)', backgroundSize: '200% 200%' }}
          />
          <Link 
            to="/report" 
            className="relative h-full flex flex-col md:flex-row items-center md:items-start md:justify-between rounded-[var(--border-radius-xl)] p-8 md:p-10 shadow-2xl shadow-emerald-200/50 active:scale-[0.99] transition-all duration-500 overflow-hidden hover:shadow-emerald-300/60 card-lift"
            style={{ background: 'linear-gradient(135deg, #059669 0%, #047857 50%, #065f46 100%)' }}
          >
            {/* Decorative orbs */}
            <div className="absolute top-[-30%] right-[-10%] w-[60%] h-[60%] bg-white/5 rounded-full blur-3xl animate-float-slow" />
            <div className="absolute bottom-[-20%] left-[-10%] w-[40%] h-[40%] bg-emerald-300/10 rounded-full blur-2xl animate-float" style={{ animationDelay: '2s' }} />
            
            <div className="z-10 text-center md:text-left">
              <div className="inline-flex p-4 bg-white/15 rounded-3xl backdrop-blur-md ring-1 ring-white/20 mb-6 animate-float" style={{ animationDuration: '4s' }}>
                <Camera className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-3xl font-extrabold text-white mb-2 tracking-tight">
                 {t('reportEmergencyTitle')}
              </h2>
              <p className="text-emerald-100/80 font-medium max-w-xs leading-relaxed">{t('reportEmergencyDesc')}</p>
            </div>
            
            <div className="absolute -right-10 -bottom-10 opacity-[0.06] rotate-12 pointer-events-none">
              <PawPrint className="w-64 h-64 text-white" />
            </div>
            
            <div className="mt-8 md:mt-0 md:self-end z-10">
               <div className="w-12 h-12 rounded-full bg-white text-emerald-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                 <ArrowUpRight className="w-6 h-6" />
               </div>
            </div>
          </Link>
        </div>

        {/* Quick Stats Grid — with counting animation */}
        <div className="grid grid-cols-3 md:grid-cols-1 gap-3 md:gap-4">
          {[
            { icon: Heart, count: '1.2k', label: t('livesSaved'), color: 'text-rose-500', bgIcon: 'bg-rose-50', bgCard: 'md:bg-gradient-to-br md:from-rose-50 md:to-pink-50', borderHover: 'hover:border-rose-200' },
            { icon: Users, count: '450', label: t('activeHeroes'), color: 'text-blue-500', bgIcon: 'bg-blue-50', bgCard: 'md:bg-gradient-to-br md:from-blue-50 md:to-indigo-50', borderHover: 'hover:border-blue-200' },
            { icon: Shield, count: '98%', label: t('responseRate'), color: 'text-emerald-500', bgIcon: 'bg-emerald-50', bgCard: 'md:bg-gradient-to-br md:from-emerald-50 md:to-teal-50', borderHover: 'hover:border-emerald-200' },
          ].map((stat, i) => (
            <div 
              key={i} 
              className={`bg-white ${stat.bgCard} p-4 md:p-6 rounded-[var(--border-radius-lg)] text-center md:text-left md:flex md:items-center md:gap-4 
                border border-gray-100/50 shadow-sm hover:shadow-lg ${stat.borderHover} transition-all duration-500 card-lift`}
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <div className={`w-11 h-11 rounded-2xl flex items-center justify-center ${stat.bgIcon} mb-2 md:mb-0 mx-auto md:mx-0 shrink-0`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <div>
                <div className="text-xl md:text-2xl font-extrabold text-gray-900 leading-none tabular-nums">
                  <AnimatedStat target={stat.count} />
                </div>
                <div className="text-[9px] md:text-[10px] font-bold text-gray-500 uppercase tracking-wider mt-1">{stat.label}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Recent Activity */}
        <section className="md:col-span-2 space-y-5">
          <div className="flex justify-between items-end px-2">
            <div>
              <h3 className="text-lg font-extrabold text-gray-900">{t('nearbyIncidents')}</h3>
              <p className="text-xs text-gray-500 font-medium mt-1">{t('liveUpdates')}</p>
            </div>
            <Link to="/dashboard" className="text-emerald-600 text-xs font-bold uppercase tracking-wider flex items-center gap-1 hover:underline hover:text-emerald-700 transition-colors">
              {t('viewMap')} <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          
          {recentReports.length === 0 ? (
            <div className="bg-white border-2 border-dashed border-gray-200 rounded-[var(--border-radius-xl)] p-12 text-center hover:border-emerald-200 transition-all duration-500 group">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-emerald-50 transition-colors">
                <Info className="w-8 h-8 text-gray-300 group-hover:text-emerald-400 transition-colors" />
              </div>
              <p className="text-gray-800 font-bold">{t('allQuiet')}</p>
              <p className="text-sm text-gray-500 font-medium mt-1">{t('noActiveReports')}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {recentReports.map((report, idx) => (
                <Link 
                  key={report.id}
                  to={`/status/${report.id}`}
                  className="group flex items-center gap-5 p-4 bg-white border border-gray-100 rounded-[var(--border-radius-lg)] hover:border-emerald-200 hover:shadow-xl hover:shadow-emerald-50/50 transition-all duration-500 card-lift"
                  style={{ animationDelay: `${idx * 0.1}s` }}
                >
                  <div className="relative shrink-0">
                    <img src={report.photo} alt="Case" className="w-20 h-20 rounded-2xl object-cover bg-gray-100 ring-4 ring-white group-hover:ring-emerald-50 transition-all" />
                  </div>
                  <div className="flex-1 min-w-0 py-1">
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="text-base font-extrabold text-gray-900">{report.animalType}</span>
                      <span className="text-[10px] font-bold text-gray-500 bg-gray-50 px-2 py-1 rounded-lg">2m ago</span>
                    </div>
                    <p className="text-sm text-gray-500 truncate font-medium pr-4">"{report.notes || 'Emergency assistance needed'}"</p>
                    <div className="flex items-center gap-3 mt-3">
                       <span className={`text-[9px] font-bold px-2.5 py-1 rounded-lg uppercase tracking-tight ${
                          report.status === 'REPORTED' ? 'bg-orange-100 text-orange-600' : 'bg-emerald-100 text-emerald-600'
                        }`}>
                          {report.status}
                        </span>
                        <span className="text-[10px] text-gray-500 flex items-center gap-1 font-bold">
                          <MapPin className="w-3 h-3" /> 0.8 KM Away
                        </span>
                    </div>
                  </div>
                  <div className="pr-2">
                    <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-all duration-300">
                      <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-white" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* Sidebar Widgets */}
        <div className="space-y-6">
          {role === 'VOLUNTEER' || role === 'NGO' ? (
            <Link to="/food-donations" className="block bg-gradient-to-br from-blue-50 to-indigo-50 rounded-[var(--border-radius-xl)] p-6 border border-blue-100/50 text-center shadow-sm hover:shadow-xl hover:shadow-blue-100/50 transition-all duration-500 card-lift group">
              <div className="flex justify-center mb-4">
                  <div className="p-3.5 bg-white rounded-2xl shadow-sm text-blue-600 group-hover:scale-110 transition-transform">
                    <Soup className="w-6 h-6" />
                  </div>
              </div>
              <h4 className="font-extrabold text-blue-900 text-lg">{t('foodBankTitle')}</h4>
              <p className="text-xs text-blue-700/70 font-medium mt-2 leading-relaxed">
                {t('foodBankDesc', { count: availableDonations.length })}
              </p>
              <div
                className="mt-5 inline-block px-6 py-3 bg-blue-500 text-white font-extrabold rounded-2xl text-xs uppercase tracking-widest shadow-lg shadow-blue-200/50 hover:bg-blue-600 transition-colors active:scale-95"
              >
                {t('viewDonations')}
              </div>
            </Link>
          ) : (
            <Link to="/donate" className="block bg-gradient-to-br from-amber-50 to-orange-50 rounded-[var(--border-radius-xl)] p-6 border border-amber-100/50 text-center shadow-sm hover:shadow-xl hover:shadow-amber-100/50 transition-all duration-500 card-lift group">
               <div className="flex justify-center mb-4">
                  <div className="p-3.5 bg-white rounded-2xl shadow-sm text-amber-600 group-hover:scale-110 transition-transform">
                    <Bone className="w-6 h-6" />
                  </div>
               </div>
               <h4 className="font-extrabold text-amber-900 text-lg">{t('feedAStray')}</h4>
               <p className="text-xs text-amber-800/70 font-medium mt-2 leading-relaxed">
                 {t('feedAStrayDesc')}
               </p>
               <div
                 className="mt-5 inline-block px-6 py-3 bg-amber-500 text-white font-extrabold rounded-2xl text-xs uppercase tracking-widest shadow-lg shadow-amber-200/50 hover:bg-amber-600 transition-colors active:scale-95"
               >
                 {t('donateFood')}
               </div>
            </Link>
          )}

          {/* Adopt a friend card */}
          <Link to="/adoption" className="block relative overflow-hidden rounded-[var(--border-radius-xl)] shadow-sm hover:shadow-xl transition-all duration-500 card-lift group">
            <div className="absolute inset-0 bg-gradient-to-br from-pink-500/90 to-rose-600/90 z-10" />
            <div className="absolute inset-0 z-0">
              <img src="https://images.unsplash.com/photo-1544175282-9ce662bc239b?auto=format&fit=crop&q=80&w=400" alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
            </div>
            <div className="relative z-20 p-6 text-white text-center">
              <Sparkles className="w-8 h-8 mx-auto mb-3 animate-float" style={{ animationDuration: '3s' }} />
              <h4 className="font-extrabold text-lg">{t('meetFriends')}</h4>
              <p className="text-xs text-white/80 font-medium mt-2 leading-relaxed">
                {t('adoptDesc')}
              </p>
              <div className="mt-4 inline-block px-5 py-2.5 bg-white text-rose-600 font-extrabold rounded-2xl text-xs uppercase tracking-widest shadow-lg hover:bg-rose-50 transition-colors">
                {t('findFriend')}
              </div>
            </div>
          </Link>

          {/* Daily tip */}
          <div className="relative overflow-hidden rounded-[var(--border-radius-xl)] p-6 text-white shadow-xl card-lift"
            style={{ background: 'linear-gradient(135deg, #111827 0%, #1f2937 50%, #111827 100%)' }}
          >
            <div className="absolute top-0 right-0 w-40 h-40 rounded-full -mr-12 -mt-12 blur-3xl" style={{ background: 'rgba(16,185,129,0.15)' }} />
            <div className="absolute bottom-0 left-0 w-32 h-32 rounded-full -ml-10 -mb-10 blur-2xl" style={{ background: 'rgba(59,130,246,0.1)' }} />
            
            <div className="flex items-center gap-3 relative z-10">
              <div className="p-3 bg-emerald-500/15 rounded-2xl backdrop-blur-md border border-emerald-500/20">
                <Activity className="w-6 h-6 text-emerald-400" />
              </div>
              <h4 className="font-bold text-lg">{t('dailyTip')}</h4>
            </div>
            <p className="text-sm text-gray-300 font-medium leading-relaxed mt-4 relative z-10">
              {t('safetyTip')}
            </p>
            <button className="mt-4 text-[10px] font-bold uppercase tracking-widest text-emerald-400 hover:text-emerald-300 transition-colors relative z-10">
              Read Safety Guide →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomeScreen;
