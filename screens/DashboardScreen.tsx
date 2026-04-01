
import React, { useState } from 'react';
import { EmergencyReport, ReportStatus, User, AdoptionPet, AnimalType } from '../types';
import { Clock, CheckCircle2, Navigation, Search, Filter, ShieldAlert, PawPrint, ExternalLink, Activity, Loader2, MessageSquare, X, Send, Heart, Camera, Megaphone, Coins } from 'lucide-react';
import { getLocalResources } from '../services/gemini';
import { useLanguage } from '../contexts/LanguageContext';

interface DashboardScreenProps {
  reports: EmergencyReport[];
  onUpdate: (id: string, status: ReportStatus, updateText?: string, recoveryPhoto?: string) => void;
  onDecline: (id: string) => void;
  currentUser: User | null;
  pets: AdoptionPet[];
  onListForAdoption: (petData: AdoptionPet, reportId: string) => void;
}

// Extracted ListingModal to prevent re-renders losing focus
const ListingModal = ({ 
  isOpen, 
  onClose, 
  listingData, 
  setListingData, 
  onSubmit, 
  report 
}: {
  isOpen: boolean;
  onClose: () => void;
  listingData: any;
  setListingData: (d: any) => void;
  onSubmit: () => void;
  report: EmergencyReport | null;
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 animate-in fade-in duration-300" onClick={onClose}>
      <div className="bg-white rounded-[2rem] w-full max-w-md shadow-2xl p-6 md:p-8 animate-in zoom-in-95 duration-500 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
         <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-xl font-800 text-gray-900">List for Adoption</h3>
              <p className="text-xs text-gray-500 font-medium">Case #{report?.id.slice(0,4)}</p>
            </div>
            <button onClick={onClose} className="p-2 bg-gray-100 rounded-full"><X className="w-4 h-4 text-gray-600" /></button>
         </div>
         <div className="space-y-4">
             {/* Row 1: Name & Age */}
            <div className="grid grid-cols-2 gap-4">
               <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Name</label>
                  <input type="text" placeholder="e.g. Luna" value={listingData.name} onChange={e => setListingData({...listingData, name: e.target.value})} className="w-full bg-gray-50 p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 outline-none text-sm font-bold" />
               </div>
               <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Age</label>
                  <input type="text" placeholder="e.g. 2 Years" value={listingData.age} onChange={e => setListingData({...listingData, age: e.target.value})} className="w-full bg-gray-50 p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 outline-none text-sm font-bold" />
               </div>
            </div>

            {/* Row 2: Gender Selection */}
            <div className="space-y-1">
               <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Gender</label>
               <div className="flex bg-gray-50 p-1 rounded-xl border border-gray-200">
                  {['Male', 'Female'].map(g => (
                     <button 
                        key={g} 
                        onClick={() => setListingData({...listingData, gender: g})}
                        className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition-all ${listingData.gender === g ? 'bg-white text-emerald-600 shadow-sm border border-gray-100' : 'text-gray-400 hover:text-gray-600'}`}
                     >
                        {g}
                     </button>
                  ))}
               </div>
            </div>

            {/* Row 3: Breed & Health */}
            <div className="space-y-4">
               <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Breed</label>
                  <input type="text" placeholder="e.g. Indie Mix" value={listingData.breed} onChange={e => setListingData({...listingData, breed: e.target.value})} className="w-full bg-gray-50 p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 outline-none text-sm font-bold" />
               </div>
               <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Health Status</label>
                  <div className="relative">
                     <Activity className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                     <input type="text" placeholder="e.g. Vaccinated, Sterilized" value={listingData.healthStatus} onChange={e => setListingData({...listingData, healthStatus: e.target.value})} className="w-full bg-gray-50 p-3 pl-10 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 outline-none text-sm font-bold" />
                  </div>
               </div>
            </div>
            
             {/* Row 4: Fee */}
             <div className="space-y-1">
               <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Adoption Fee</label>
               <div className="relative">
                  <Coins className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type="text" placeholder="e.g. ₹2000" value={listingData.fee} onChange={e => setListingData({...listingData, fee: e.target.value})} className="w-full bg-gray-50 p-3 pl-10 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 outline-none text-sm font-bold" />
               </div>
             </div>

            <div className="space-y-1">
               <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Description</label>
               <textarea placeholder="Description" value={listingData.description} onChange={e => setListingData({...listingData, description: e.target.value})} className="w-full bg-gray-50 p-3 rounded-xl border border-gray-200 h-24 resize-none focus:ring-2 focus:ring-emerald-500 outline-none text-sm font-medium" />
            </div>
            
            <button onClick={onSubmit} disabled={!listingData.name || !listingData.age} className="w-full bg-emerald-600 text-white font-bold py-3.5 rounded-xl disabled:bg-gray-300 shadow-lg shadow-emerald-200 hover:bg-emerald-700 transition-all mt-2">
               Publish Listing
            </button>
         </div>
      </div>
    </div>
  );
};

const DashboardScreen: React.FC<DashboardScreenProps> = ({ reports, onUpdate, onDecline, currentUser, pets, onListForAdoption }) => {
  const { t } = useLanguage();
  const [loadingResources, setLoadingResources] = useState(false);
  const [resources, setResources] = useState<{ text: string | undefined; places: any[] } | null>(null);
  const [isResourcesModalOpen, setIsResourcesModalOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<EmergencyReport | null>(null);

  const [activeUpdateId, setActiveUpdateId] = useState<string | null>(null);
  const [updateText, setUpdateText] = useState('');
  const [recoveryPhoto, setRecoveryPhoto] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('Incoming');

  // Adoption listing state
  const [isListingModalOpen, setIsListingModalOpen] = useState(false);
  const [listingData, setListingData] = useState({ 
    name: '', 
    age: '', 
    gender: 'Male', 
    breed: '', 
    fee: '', 
    description: '',
    healthStatus: '' 
  });

  const tabs = [
    { key: 'Incoming', label: t('incoming') },
    { key: 'Queued', label: 'Queued' },
    { key: 'In Progress', label: t('inProgress') },
    { key: 'Rescued', label: t('rescued') },
    { key: 'Recovered', label: t('recovered') },
  ];
  const statusMap: { [key: string]: ReportStatus } = {
    'Incoming': ReportStatus.REPORTED,
    'Queued': ReportStatus.QUEUED,
    'In Progress': ReportStatus.ACCEPTED,
    'Rescued': ReportStatus.RESCUED,
    'Recovered': ReportStatus.TREATED,
  };
  const filteredReports = reports.filter(r => r.status === statusMap[activeTab]);

  const fetchNearbyVets = async (report: EmergencyReport) => {
    setSelectedReport(report);
    setIsResourcesModalOpen(true);
    setLoadingResources(true);
    setResources(null);
    try {
      const data = await getLocalResources(report.location.lat, report.location.lng);
      setResources(data);
    } catch (e) { 
      console.error(e);
      setResources({ text: "An error occurred while fetching resources.", places: [] });
    } finally { 
      setLoadingResources(false);
    }
  };

  const handlePostUpdate = (id: string, currentStatus: ReportStatus) => {
    if (updateText.trim()) {
      onUpdate(id, currentStatus, updateText);
      setActiveUpdateId(null);
      setUpdateText('');
    }
  };
  
  const handleCompleteCase = (id: string) => {
    if (recoveryPhoto && updateText) {
      onUpdate(id, ReportStatus.TREATED, updateText, recoveryPhoto);
      setActiveUpdateId(null);
      setUpdateText('');
      setRecoveryPhoto(null);
    } else {
      alert("Please provide a recovery photo and a final note.");
    }
  }

  const handleRecoveryPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => { setRecoveryPhoto(reader.result as string); };
      reader.readAsDataURL(file);
    }
  };

  const openListingModal = (report: EmergencyReport) => {
    setSelectedReport(report);
    setIsListingModalOpen(true);
    setListingData({ 
      name: '', 
      age: '', 
      gender: 'Male',
      breed: report.aiAnalysis?.breedSuggestion || '', 
      fee: '₹0', 
      description: `Rescued ${report.animalType.toLowerCase()} looking for a loving home.`,
      healthStatus: 'Treated, Vaccinated, Dewormed' 
    });
  };

  const submitListing = () => {
    if (selectedReport) {
      const pet: AdoptionPet = {
        id: Math.random().toString(36).substr(2, 9),
        sourceReportId: selectedReport.id,
        name: listingData.name,
        age: listingData.age,
        gender: listingData.gender as 'Male' | 'Female',
        breed: listingData.breed,
        type: selectedReport.animalType,
        photo: selectedReport.recoveryPhoto || selectedReport.photo,
        description: listingData.description,
        healthStatus: listingData.healthStatus,
        fee: listingData.fee,
        isAdopted: false,
      };
      onListForAdoption(pet, selectedReport.id);
      setIsListingModalOpen(false);
    }
  };

  // Helper to find pet info for a report
  const getPetInfo = (report: EmergencyReport) => {
    return pets.find(p => p.sourceReportId === report.id);
  };

  const ResourcesModal = () => (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 animate-in fade-in duration-300" onClick={() => setIsResourcesModalOpen(false)}>
      <div className="bg-white rounded-[var(--border-radius-xl)] w-full max-w-lg shadow-2xl p-6 md:p-8 animate-in zoom-in-95 duration-500" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-xl font-extrabold text-gray-900 tracking-tight">Nearby Medical Resources</h3>
            <p className="text-xs text-gray-500 font-medium mt-1">For Case #{selectedReport?.id.slice(0, 6)}</p>
          </div>
          <button onClick={() => setIsResourcesModalOpen(false)} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors">
            <X className="w-4 h-4 text-gray-600" />
          </button>
        </div>
        <div className="mt-6 max-h-[60vh] overflow-y-auto pr-2 space-y-4">
          {loadingResources ? (
            <div className="text-center py-12">
              <Loader2 className="w-8 h-8 text-emerald-600 animate-spin mx-auto mb-4" />
              <p className="text-sm font-bold text-gray-700">Searching Google Maps...</p>
              <p className="text-xs text-gray-500">Finding vets and shelters.</p>
            </div>
          ) : resources ? (
            <div>
              <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100 mb-4">
                <p className="text-xs font-bold text-emerald-800 leading-relaxed">{resources.text}</p>
              </div>
              <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Places Found:</h4>
              <ul className="space-y-2">
                {resources.places.map((place: any) => (
                  <li key={place.uri}>
                    <a href={place.uri} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 bg-white border border-gray-100 rounded-2xl hover:border-emerald-200 hover:shadow-md transition-all group">
                      <div className="p-2.5 bg-gray-100 rounded-lg group-hover:bg-emerald-100">
                         <Navigation className="w-4 h-4 text-gray-600 group-hover:text-emerald-600" />
                      </div>
                      <span className="flex-1 text-sm font-bold text-gray-800 group-hover:text-emerald-700 truncate">{place.title}</span>
                      <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-emerald-500 shrink-0" />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
             <div className="text-center py-12">
                <p className="text-sm font-bold text-gray-700">No resources found.</p>
             </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-6 md:p-0 space-y-8 animate-in fade-in duration-500 pb-24 md:pb-6">
      {isResourcesModalOpen && <ResourcesModal />}
      <ListingModal 
        isOpen={isListingModalOpen} 
        onClose={() => setIsListingModalOpen(false)}
        listingData={listingData}
        setListingData={setListingData}
        onSubmit={submitListing}
        report={selectedReport}
      />
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">{t('caseBoard')}</h1>
          <p className="text-sm text-gray-600 font-medium mt-1">{t('caseBoardDesc')}</p>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
             <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
             <input type="text" placeholder={t('searchPlaceholder')} className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-2xl text-sm text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/50 shadow-sm" />
          </div>
        </div>
      </div>

      {/* Transparency & Funding Banner */}
      <div className="bg-emerald-50 border border-emerald-100 rounded-[2.5rem] p-6 flex flex-col md:flex-row items-center gap-6 shadow-sm">
        <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shrink-0 shadow-sm border border-emerald-100">
          <Coins className="w-8 h-8 text-emerald-600" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-800 text-gray-900 mb-1">Transparent Funding Model</h3>
          <p className="text-sm text-gray-700 font-medium leading-relaxed">
            Running cloud servers, APIs, and maintaining an active network is expensive. To keep REScue Paw sustainable and ensure vet care is funded:
          </p>
          <ul className="mt-2 space-y-1">
            <li className="text-xs font-bold text-emerald-800 flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> 
              Hospitals & Clinics pay a small subscription fee for our advanced triage software.
            </li>
            <li className="text-xs font-bold text-emerald-800 flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> 
              A 5% transaction fee on user monetary donations covers server costs, ensuring 95% goes directly to animal care.
            </li>
          </ul>
        </div>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide -mx-2 px-2 md:mx-0 md:px-0">
        {tabs.map((tab) => (
          <button 
            key={tab.key} 
            onClick={() => setActiveTab(tab.key)}
            className={`px-6 py-3 rounded-2xl text-xs font-extrabold uppercase tracking-wider whitespace-nowrap transition-all ${
              activeTab === tab.key ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200' : 'bg-white border border-gray-100 text-gray-500 hover:bg-gray-50'
            }`}>
            {tab.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredReports.length === 0 ? (
          <div className="col-span-full text-center py-20 bg-white rounded-[var(--border-radius-xl)] border-2 border-dashed border-gray-200">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-dashed border-gray-200">
               <PawPrint className="w-8 h-8 text-gray-300" />
            </div>
            <p className="text-gray-500 font-bold text-sm uppercase tracking-widest">{t('sectionClear', { tab: activeTab })}</p>
            <p className="text-sm text-gray-500 font-medium mt-1 italic">{t('noCasesInSection')}</p>
          </div>
        ) : (
          filteredReports.map(report => {
            const petInfo = getPetInfo(report);
            return (
            <div key={report.id} className="bg-white border border-gray-100 rounded-[var(--border-radius-xl)] overflow-hidden shadow-sm hover:shadow-xl hover:shadow-emerald-50 transition-all flex flex-col h-full group">
              {report.status === ReportStatus.TREATED && report.recoveryPhoto ? (
                <div className="p-5 grid grid-cols-2 gap-4">
                  <div>
                    <img src={report.photo} alt="Before" className="aspect-square w-full object-cover rounded-3xl" />
                    <p className="text-center text-[10px] font-bold text-gray-500 uppercase mt-2 tracking-widest">{t('before')}</p>
                  </div>
                  <div>
                    <img src={report.recoveryPhoto} alt="After" className="aspect-square w-full object-cover rounded-3xl" />
                     <p className="text-center text-[10px] font-bold text-emerald-600 uppercase mt-2 tracking-widest">{t('after')}</p>
                  </div>
                </div>
              ) : (
                <div className="p-5 flex gap-5">
                  <div className="relative shrink-0">
                    <img src={report.photo} alt="Case" className="w-24 h-24 rounded-3xl object-cover ring-4 ring-white group-hover:ring-emerald-50 transition-all" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <h3 className="text-lg font-extrabold text-gray-900 leading-tight truncate">{report.animalType} <span className="text-gray-400 text-sm font-medium">#{(report.id).slice(0,4)}</span></h3>
                      <span className="text-[10px] text-gray-500 font-extrabold uppercase tracking-tighter flex items-center gap-1 bg-gray-50 px-2 py-1 rounded-lg shrink-0">
                        <Clock className="w-3 h-3" /> {new Date(report.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 mt-2 font-medium line-clamp-2 leading-relaxed italic">"{report.notes || 'Emergency assistance requested'}"</p>
                  </div>
                </div>
              )}
              
              <div className="px-5 pb-5 mt-auto">
                 {report.aiAnalysis && (
                  <div className="mb-4 p-3 bg-emerald-900 text-white rounded-3xl border border-emerald-800">
                    <div className="flex justify-between items-start mb-1">
                      <p className="text-[10px] font-extrabold text-emerald-400 uppercase tracking-widest">AI Observation</p>
                      <span className="text-[9px] font-bold px-1.5 py-0.5 bg-white/10 rounded-md text-emerald-200">{report.aiAnalysis.severity}</span>
                    </div>
                    <div className="flex flex-wrap gap-1 mb-2">
                      {report.aiAnalysis.categories.map(cat => (
                        <span key={cat} className="text-[9px] font-bold bg-emerald-700/50 px-1.5 py-0.5 rounded-md border border-emerald-600/30">{cat}</span>
                      ))}
                    </div>
                    <p className="text-[11px] font-medium opacity-90 italic leading-tight">
                      "{report.aiAnalysis.visualObservation}"
                    </p>
                  </div>
                )}
                {report.status === ReportStatus.TREATED && (
                  <div className="p-4 bg-emerald-50 rounded-3xl text-center border border-emerald-100 mb-3">
                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-sm">
                       <Heart className="w-6 h-6 text-emerald-600"/>
                    </div>
                    <p className="text-sm font-extrabold text-emerald-800">Case Complete</p>
                    <p className="text-[10px] text-emerald-600 font-medium mt-1">Another life saved. Thank you!</p>
                  </div>
                )}
                
                {/* Adoption Status on Card */}
                {petInfo && (
                   <div className={`p-3 rounded-2xl mb-3 text-center border ${petInfo.isAdopted ? 'bg-blue-50 border-blue-100 text-blue-700' : 'bg-amber-50 border-amber-100 text-amber-700'}`}>
                      <p className="text-xs font-bold uppercase tracking-widest">
                         {petInfo.isAdopted ? `Adopted by ${petInfo.adopterName || 'Unknown'}` : 'Listed for Adoption'}
                      </p>
                   </div>
                )}

                <div className="mt-auto bg-gray-50/80 p-3 rounded-2xl flex gap-2 border-t border-gray-100 flex-wrap">
                  {(report.status === ReportStatus.REPORTED || report.status === ReportStatus.QUEUED) && (
                    <>
                      <button onClick={() => onUpdate(report.id, ReportStatus.ACCEPTED)} className="flex-1 bg-gray-900 text-white text-xs font-extrabold py-3.5 rounded-xl flex items-center justify-center gap-2 active:scale-95 transition-transform hover:bg-gray-800">
                        <CheckCircle2 className="w-4 h-4" /> {t('accept')}
                      </button>
                      <button onClick={() => onDecline(report.id)} className="px-4 bg-white border border-rose-100 text-rose-600 text-xs font-extrabold py-3.5 rounded-xl hover:bg-rose-50 active:scale-95 transition-all shadow-sm flex items-center justify-center gap-2">
                        <X className="w-4 h-4" /> Decline
                      </button>
                    </>
                  )}
                  {report.status === ReportStatus.ACCEPTED && <button onClick={() => onUpdate(report.id, ReportStatus.RESCUED)} className="flex-1 bg-emerald-600 text-white text-xs font-extrabold py-3.5 rounded-xl flex items-center justify-center gap-2 active:scale-95 transition-transform hover:bg-emerald-700"><Navigation className="w-4 h-4" /> {t('markRescued')}</button>}
                  {report.status === ReportStatus.RESCUED && <button onClick={() => { setActiveUpdateId(report.id); setUpdateText(''); setRecoveryPhoto(null); }} className="flex-1 bg-emerald-600 text-white text-xs font-extrabold py-3.5 rounded-xl flex items-center justify-center gap-2 active:scale-95 transition-transform hover:bg-emerald-700"><CheckCircle2 className="w-4 h-4" /> {t('completeCase')}</button>}
                  
                  <button onClick={() => fetchNearbyVets(report)} className="px-5 bg-white border border-gray-100 text-gray-700 text-xs font-extrabold py-3.5 rounded-xl hover:bg-white hover:text-emerald-600 hover:border-emerald-200 active:scale-95 transition-all shadow-sm">Vets</button>
                  
                  {report.status === ReportStatus.ACCEPTED && <button onClick={() => { setActiveUpdateId(activeUpdateId === report.id ? null : report.id); setUpdateText(''); }} className="flex-1 bg-white border border-gray-100 text-gray-700 text-xs font-extrabold py-3.5 rounded-xl hover:bg-white hover:text-emerald-600 hover:border-emerald-200 active:scale-95 transition-all shadow-sm flex items-center justify-center gap-2"><MessageSquare className="w-4 h-4" /> Update</button>}
                  
                  {/* Adoption Listing Button for Treated cases */}
                  {report.status === ReportStatus.TREATED && !petInfo && (currentUser?.role === 'NGO' || currentUser?.role === 'VOLUNTEER') && (
                     <button onClick={() => openListingModal(report)} className="flex-1 bg-rose-500 text-white text-xs font-extrabold py-3.5 rounded-xl flex items-center justify-center gap-2 active:scale-95 transition-transform hover:bg-rose-600 shadow-md shadow-rose-200">
                        <Megaphone className="w-4 h-4"/> List for Adoption
                     </button>
                  )}
                </div>
              </div>
              
              {activeUpdateId === report.id && report.status === ReportStatus.RESCUED && (
                 <div className="p-5 bg-white border-t border-gray-100 animate-in slide-in-from-top-2 duration-300 space-y-3">
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Complete Case File</p>
                  <label className="w-full aspect-video bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 flex items-center justify-center cursor-pointer hover:border-emerald-300">
                    {recoveryPhoto ? <img src={recoveryPhoto} className="w-full h-full object-cover rounded-2xl" /> : <div className="text-center text-gray-500"><Camera className="w-6 h-6 mx-auto mb-2"/> <span className="text-xs font-bold">Upload Recovery Photo</span></div>}
                    <input type="file" accept="image/*" className="hidden" onChange={handleRecoveryPhotoUpload} />
                  </label>
                  <textarea placeholder="Add final recovery notes..." className="w-full h-20 p-3 bg-gray-50 border border-gray-200 rounded-2xl text-xs text-gray-900 focus:ring-2 focus:ring-emerald-50 focus:border-emerald-500 outline-none transition-all resize-none font-medium" value={updateText} onChange={(e) => setUpdateText(e.target.value)} />
                  <button onClick={() => handleCompleteCase(report.id)} className="w-full text-xs font-bold bg-emerald-600 text-white p-3 rounded-xl hover:bg-emerald-700 transition-colors disabled:bg-gray-200" disabled={!recoveryPhoto || !updateText}>Post & Mark as Treated</button>
                </div>
              )}

              {activeUpdateId === report.id && report.status === ReportStatus.ACCEPTED && (
                <div className="p-5 bg-white border-t border-gray-100 animate-in slide-in-from-top-2 duration-300 space-y-3">
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Add Procedural Note</p>
                  <textarea placeholder="e.g., 'Animal is responsive but scared...'" className="w-full h-20 p-3 bg-gray-50 border border-gray-200 rounded-2xl text-xs text-gray-900 focus:ring-2 focus:ring-emerald-50 focus:border-emerald-500 outline-none transition-all resize-none font-medium" value={updateText} onChange={(e) => setUpdateText(e.target.value)} />
                  <button onClick={() => handlePostUpdate(report.id, report.status)} className="w-full text-xs font-bold bg-emerald-50 text-emerald-600 p-3 rounded-xl hover:bg-emerald-100 transition-colors">Post Update</button>
                </div>
              )}
            </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default DashboardScreen;
