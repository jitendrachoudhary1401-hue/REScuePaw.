
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { EmergencyReport, ReportStatus, User, UserRole } from '../types';
import { CheckCircle2, Circle, ArrowLeft, MapPin, Phone, Shield, Navigation, Heart, HeartHandshake, ShieldCheck, User as UserIcon, ExternalLink } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface StatusScreenProps {
  reports: EmergencyReport[];
  currentUser: User | null;
}

const StatusScreen: React.FC<StatusScreenProps> = ({ reports, currentUser }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const report = reports.find(r => r.id === id);
  const { t } = useLanguage();

  if (!report) return <div className="p-10 text-center font-bold text-gray-500">Report not found.</div>;

  const steps = [
    { status: ReportStatus.REPORTED, label: t('incidentBroadcasted'), desc: t('alertSent') },
    { status: ReportStatus.QUEUED, label: 'In Rescue Queue', desc: 'Searching for next available responder due to high volume.' },
    { status: ReportStatus.ACCEPTED, label: t('heroEnRoute'), desc: t('volunteerAccepted') },
    { status: ReportStatus.RESCUED, label: t('safeInTransit'), desc: t('animalTransported') },
    { status: ReportStatus.TREATED, label: t('recovering'), desc: t('careProvided') },
  ];

  // If report is REPORTED but not QUEUED, we skip QUEUED in the visual progress if we want, 
  // but it's better to just show the current status correctly.
  const currentIdx = steps.findIndex(s => s.status === report.status);
  
  // Filter steps to show a clean timeline: if not queued, don't show the queued step as a 'pending' step
  const visibleSteps = steps.filter(s => {
    if (s.status === ReportStatus.QUEUED && report.status !== ReportStatus.QUEUED) return false;
    return true;
  });

  const visibleCurrentIdx = visibleSteps.findIndex(s => s.status === report.status);
  
  const roleIcons: Record<UserRole, React.ElementType> = {
    CITIZEN: UserIcon,
    VOLUNTEER: HeartHandshake,
    NGO: HeartHandshake,
    VET: ShieldCheck,
  };

  return (
    <div className="p-6 space-y-6 animate-in slide-in-from-left-4 duration-500 pb-24 md:pb-10">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="p-3 bg-white border border-gray-100 rounded-full shadow-sm hover:text-emerald-600 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-xl font-800 text-gray-900 tracking-tight">{t('trackRecovery')}</h1>
          <p className="text-[10px] text-emerald-600 font-800 uppercase tracking-widest">{t('caseId')} #{id?.slice(0,6)}</p>
        </div>
      </div>

      <div className="bg-white border border-gray-100 rounded-[2.5rem] overflow-hidden shadow-xl shadow-emerald-50">
        {!(report.status === ReportStatus.TREATED && report.recoveryPhoto) && (
          <div className="h-56 relative group">
            <img src={report.photo} alt="Case" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
            <div className="absolute bottom-4 left-4 flex gap-2">
              <span className="px-3 py-1 bg-emerald-600 text-white text-[10px] font-800 rounded-full uppercase tracking-widest shadow-lg">LIVE UPDATES</span>
            </div>
          </div>
        )}
        
        <a 
          href={`https://www.google.com/maps?q=${report.location.lat},${report.location.lng}`} 
          target="_blank" 
          rel="noopener noreferrer"
          className="p-5 border-b border-gray-50 bg-gray-50/50 flex justify-between items-center hover:bg-emerald-50/50 transition-colors"
        >
          <div className="flex items-center gap-3 min-w-0">
             <div className="p-2.5 bg-white rounded-2xl border border-gray-100 shadow-sm">
                <Navigation className="w-5 h-5 text-emerald-600" />
             </div>
             <div className="min-w-0">
               <p className="text-[10px] font-800 text-gray-500 uppercase tracking-widest">Location</p>
               <p className="text-sm font-bold text-gray-900 truncate">
                 {report.location.address || `${report.location.lat}, ${report.location.lng}`}
               </p>
             </div>
          </div>
          <div className="text-right flex items-center gap-2">
            <div>
              <p className="text-[10px] font-800 text-gray-500 uppercase tracking-widest">Severity</p>
              <p className="text-sm font-800 text-orange-600 flex items-center justify-end gap-1">
                {report.aiAnalysis?.severity || 'High'}
              </p>
            </div>
            <ExternalLink className="w-4 h-4 text-gray-400" />
          </div>
        </a>

        <div className="p-8 space-y-10">
          {visibleSteps.map((step, idx) => (
            <div key={step.status} className="flex gap-6 relative">
              {idx < visibleSteps.length - 1 && (
                <div className={`absolute left-[13px] top-8 w-[2px] h-[calc(100%)] transition-colors duration-1000 ${
                  idx < visibleCurrentIdx ? 'bg-emerald-500' : 'bg-gray-100'
                }`} />
              )}
              
              <div className="relative z-10">
                <div className={`w-7 h-7 rounded-full border-2 transition-all duration-700 flex items-center justify-center ${
                  idx <= visibleCurrentIdx ? 'bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-200' : 'bg-white border-gray-100 text-gray-300'
                }`}>
                  {idx <= visibleCurrentIdx ? <CheckCircle2 className="w-4 h-4" /> : <Circle className="w-4 h-4" />}
                </div>
              </div>
              
              <div className="flex-1 min-w-0">
                 <h3 className={`text-sm font-800 transition-colors duration-700 tracking-tight ${idx <= visibleCurrentIdx ? 'text-gray-900' : 'text-gray-500'}`}>
                    {step.label}
                  </h3>
                <p className={`text-xs mt-1 font-medium leading-relaxed transition-colors duration-700 ${idx <= visibleCurrentIdx ? 'text-gray-600' : 'text-gray-500'}`}>
                  {step.desc}
                </p>
                {idx === visibleCurrentIdx && (
                   <div className={`mt-3 px-3 py-1 ${step.status === ReportStatus.QUEUED ? 'bg-amber-50 text-amber-700 border-amber-100' : 'bg-emerald-50 text-emerald-700 border-emerald-100'} text-[10px] font-800 rounded-full inline-flex items-center gap-1.5 uppercase tracking-widest border`}>
                      <span className="flex h-1.5 w-1.5"><span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${step.status === ReportStatus.QUEUED ? 'bg-amber-400' : 'bg-emerald-400'} opacity-75`}></span><span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${step.status === ReportStatus.QUEUED ? 'bg-amber-500' : 'bg-emerald-500'}`}></span></span>
                      {step.status === ReportStatus.QUEUED ? 'Priority Queue' : 'In Progress'}
                   </div>
                )}
              </div>
            </div>
          ))}
        </div>
        
        {report.updates && report.updates.length > 0 && (
          <div className="bg-gray-50/70 p-8 border-t border-gray-100 space-y-6">
            <h3 className="text-sm font-800 text-gray-500 uppercase tracking-widest">Case Log</h3>
            <div className="space-y-6">
              {report.updates.slice().reverse().map(update => {
                const Icon = roleIcons[update.authorRole] || UserIcon;
                return (
                  <div key={update.timestamp} className="flex gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div className="p-3 bg-white rounded-full shadow-sm border border-gray-100 h-fit">
                      <Icon className="w-4 h-4 text-emerald-600" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-xs font-bold text-gray-900">{update.authorName}</p>
                        <p className="text-[9px] text-gray-400 font-medium">{new Date(update.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                      </div>
                      <p className="text-xs text-gray-600 mt-1 font-medium bg-white p-3 rounded-2xl rounded-tl-none border border-gray-100">{update.text}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {report.status === ReportStatus.TREATED && currentUser?.id === report.reporterId && (
        <div className="mt-8 bg-white rounded-[2.5rem] p-8 border-2 border-dashed border-emerald-200 text-center relative overflow-hidden animate-in fade-in zoom-in duration-500">
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-emerald-400/20 rounded-full blur-2xl animate-pulse"></div>
            <div className="absolute -bottom-12 -left-12 w-40 h-40 bg-rose-400/20 rounded-full blur-3xl animate-pulse delay-500"></div>
            <div className="relative z-10">
              <div className="w-20 h-20 bg-emerald-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-emerald-200 animate-soft-pulse">
                <Heart className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-2xl font-800 text-gray-900 tracking-tight">{t('thankYouHero')}</h2>
              <p className="text-sm text-gray-600 font-medium mt-2 max-w-sm mx-auto">
                {t('thankYouMessage')}
              </p>
              {report.recoveryPhoto && (
                 <div className="mt-6 grid grid-cols-2 gap-4 max-w-sm mx-auto">
                   <div>
                     <img src={report.photo} alt="Before" className="aspect-square w-full object-cover rounded-2xl shadow-lg" />
                     <p className="text-[10px] font-bold text-gray-500 uppercase mt-2 tracking-widest">{t('before')}</p>
                   </div>
                   <div>
                     <img src={report.recoveryPhoto} alt="After" className="aspect-square w-full object-cover rounded-2xl shadow-lg" />
                     <p className="text-[10px] font-bold text-emerald-600 uppercase mt-2 tracking-widest">{t('after')}</p>
                   </div>
                 </div>
              )}
            </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 pt-4">
        <button className="p-5 bg-gray-900 text-white rounded-[2rem] font-800 text-sm flex items-center justify-center gap-3 active:scale-95 transition-all shadow-xl shadow-gray-200">
          <Phone className="w-5 h-5" /> {t('callRescuer')}
        </button>
        <button className="p-5 bg-white border-2 border-gray-100 text-gray-700 rounded-[2rem] font-800 text-sm flex items-center justify-center hover:bg-gray-50 active:scale-95 transition-all shadow-sm">
          {t('updateInfo')}
        </button>
      </div>

    </div>
  );
};

export default StatusScreen;
