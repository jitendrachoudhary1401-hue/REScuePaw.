
import React from 'react';
import { Link } from 'react-router-dom';
import { Camera, MapPin, Activity, ChevronRight, Info, PawPrint, Heart, Users, Shield, ArrowUpRight, Bone, Soup } from 'lucide-react';
import { UserRole, EmergencyReport, Donation, DonationStatus } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import Typewriter from '../components/Typewriter';

interface HomeScreenProps {
  role: UserRole;
  reports: EmergencyReport[];
  donations: Donation[];
}

const HomeScreen: React.FC<HomeScreenProps> = ({ role, reports, donations }) => {
  const { t } = useLanguage();
  const recentReports = reports.slice(0, 3);
  const availableDonations = donations.filter(d => d.status === DonationStatus.AVAILABLE);

  return (
    <div className="p-6 md:p-0 space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700 pb-24 md:pb-6">
      {/* Desktop Welcome */}
      <div className="hidden md:block mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
          <Typewriter text={t('missionControl')} speed={50} delay={300} cursor />
        </h1>
        <p className="text-gray-600 font-medium">{t('welcomeBack')} <span className="text-emerald-600 font-bold">{t('onlineMonitoring')}</span></p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main Hero Card - Spans 2 cols on desktop */}
        <div className="md:col-span-2 relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-emerald-600 to-teal-400 rounded-[var(--border-radius-xl)] blur opacity-25 group-hover:opacity-40 transition duration-1000"></div>
          <Link 
            to="/report" 
            className="relative h-full flex flex-col md:flex-row items-center md:items-start md:justify-between bg-emerald-600 rounded-[var(--border-radius-xl)] p-8 md:p-10 shadow-2xl shadow-emerald-200 active:scale-[0.99] transition-transform overflow-hidden hover:bg-emerald-700"
          >
            <div className="z-10 text-center md:text-left">
              <div className="inline-flex p-4 bg-white/20 rounded-3xl backdrop-blur-md ring-1 ring-white/30 animate-soft-pulse mb-6">
                <Camera className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-3xl font-extrabold text-white mb-2 tracking-tight">
                 {t('reportEmergencyTitle')}
              </h2>
              <p className="text-emerald-100 font-medium max-w-xs leading-relaxed">{t('reportEmergencyDesc')}</p>
            </div>
            
            <div className="absolute -right-10 -bottom-10 opacity-10 rotate-12 pointer-events-none">
              <PawPrint className="w-64 h-64 text-white" />
            </div>
            
            <div className="mt-8 md:mt-0 md:self-end z-10">
               <div className="w-12 h-12 rounded-full bg-white text-emerald-600 flex items-center justify-center shadow-lg">
                 <ArrowUpRight className="w-6 h-6" />
               </div>
            </div>
          </Link>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-3 md:grid-cols-1 gap-3 md:gap-4">
          {[
            { icon: Heart, count: '1.2k', label: t('livesSaved'), color: 'text-rose-500', bg: 'bg-white md:bg-rose-50' },
            { icon: Users, count: '450', label: t('activeHeroes'), color: 'text-blue-500', bg: 'bg-white md:bg-blue-50' },
            { icon: Shield, count: '98%', label: t('responseRate'), color: 'text-emerald-500', bg: 'bg-white md:bg-emerald-50' },
          ].map((stat, i) => (
            <div key={i} className={`${stat.bg} p-4 md:p-6 rounded-[var(--border-radius-lg)] text-center md:text-left md:flex md:items-center md:gap-4 border border-gray-100/50 md:border-transparent shadow-sm hover:shadow-md transition-all`}>
              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${stat.bg === 'bg-white' ? 'bg-gray-50' : 'bg-white'} mb-2 md:mb-0`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <div>
                <div className="text-lg md:text-2xl font-extrabold text-gray-900 leading-none">{stat.count}</div>
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
            <Link to="/dashboard" className="text-emerald-600 text-xs font-bold uppercase tracking-wider flex items-center gap-1 hover:underline hover:text-emerald-700">
              {t('viewMap')} <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          
          {recentReports.length === 0 ? (
            <div className="bg-white border-2 border-dashed border-gray-200 rounded-[var(--border-radius-xl)] p-12 text-center hover:border-emerald-200 transition-colors">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Info className="w-8 h-8 text-gray-300" />
              </div>
              <p className="text-gray-800 font-bold">{t('allQuiet')}</p>
              <p className="text-sm text-gray-500 font-medium mt-1">{t('noActiveReports')}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {recentReports.map(report => (
                <Link 
                  key={report.id}
                  to={`/status/${report.id}`}
                  className="group flex items-center gap-5 p-4 bg-white border border-gray-100 rounded-[var(--border-radius-lg)] hover:border-emerald-200 hover:shadow-xl hover:shadow-emerald-50/50 transition-all"
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
                    <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors">
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
            <Link to="/food-donations" className="block bg-blue-50 rounded-[var(--border-radius-xl)] p-6 border border-blue-100 text-center shadow-sm hover:shadow-lg hover:shadow-blue-50 transition-all">
              <div className="flex justify-center mb-4">
                  <div className="p-3 bg-white rounded-2xl shadow-sm text-blue-600">
                    <Soup className="w-6 h-6" />
                  </div>
              </div>
              <h4 className="font-extrabold text-blue-900 text-lg">{t('foodBankTitle')}</h4>
              <p className="text-xs text-blue-800 font-medium mt-2 leading-relaxed">
                {t('foodBankDesc', { count: availableDonations.length })}
              </p>
              <div
                className="mt-5 inline-block px-6 py-3 bg-blue-500 text-white font-extrabold rounded-2xl text-xs uppercase tracking-widest shadow-lg shadow-blue-200 hover:bg-blue-600 transition-colors active:scale-95"
              >
                {t('viewDonations')}
              </div>
            </Link>
          ) : (
            <Link to="/donate" className="block bg-amber-50 rounded-[var(--border-radius-xl)] p-6 border border-amber-100 text-center shadow-sm hover:shadow-lg hover:shadow-amber-50 transition-all">
               <div className="flex justify-center mb-4">
                  <div className="p-3 bg-white rounded-2xl shadow-sm text-amber-600">
                    <Bone className="w-6 h-6" />
                  </div>
               </div>
               <h4 className="font-extrabold text-amber-900 text-lg">{t('feedAStray')}</h4>
               <p className="text-xs text-amber-800 font-medium mt-2 leading-relaxed">
                 {t('feedAStrayDesc')}
               </p>
               <div
                 className="mt-5 inline-block px-6 py-3 bg-amber-500 text-white font-extrabold rounded-2xl text-xs uppercase tracking-widest shadow-lg shadow-amber-200 hover:bg-amber-600 transition-colors active:scale-95"
               >
                 {t('donateFood')}
               </div>
            </Link>
          )}

          <div className="bg-gray-900 rounded-[var(--border-radius-xl)] p-6 text-white flex flex-col gap-4 overflow-hidden relative shadow-xl">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/20 rounded-full -mr-10 -mt-10 blur-2xl"></div>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-md">
                <Activity className="w-6 h-6 text-emerald-400" />
              </div>
              <h4 className="font-bold text-lg">{t('dailyTip')}</h4>
            </div>
            <p className="text-sm text-gray-200 font-medium leading-relaxed z-10">
              {t('safetyTip')}
            </p>
            <button className="text-[10px] font-bold uppercase tracking-widest text-emerald-400 self-start hover:text-emerald-300 transition-colors">
              Read Safety Guide
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default HomeScreen;
