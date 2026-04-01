
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Search, Filter, Dog, Cat, ArrowRight, Info, CheckCircle2, ListPlus, PawPrint, X, Megaphone, Clock, Activity, Coins, SlidersHorizontal, CalendarDays } from 'lucide-react';
import { AdoptionPet, AnimalType, User, EmergencyReport, ReportStatus } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

interface AdoptionScreenProps {
  pets?: AdoptionPet[]; 
  currentUser?: User | null;
  reports?: EmergencyReport[];
  onListForAdoption?: (petData: AdoptionPet, reportId: string) => void;
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
               <p className="text-xs text-gray-500 font-medium">Enter details for {report?.animalType.toLowerCase()}</p>
            </div>
            <button onClick={onClose} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"><X className="w-4 h-4 text-gray-600" /></button>
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

            {/* Description */}
            <div className="space-y-1">
               <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Story & Description</label>
               <textarea placeholder="Tell us about the pet..." value={listingData.description} onChange={e => setListingData({...listingData, description: e.target.value})} className="w-full bg-gray-50 p-3 rounded-xl border border-gray-200 h-24 resize-none focus:ring-2 focus:ring-emerald-500 outline-none text-sm font-medium" />
            </div>
            
            <button onClick={onSubmit} disabled={!listingData.name || !listingData.age} className="w-full bg-emerald-600 text-white font-800 py-3.5 rounded-xl disabled:bg-gray-200 disabled:text-gray-400 shadow-lg shadow-emerald-200 hover:bg-emerald-700 transition-all mt-2">
               Publish Listing
            </button>
         </div>
      </div>
    </div>
  );
};

const AdoptionScreen: React.FC<AdoptionScreenProps> = ({ pets = [], currentUser, reports = [], onListForAdoption }) => {
  const { t } = useLanguage();
  
  // Basic Filters
  const [filterType, setFilterType] = useState<AnimalType | 'ALL'>('ALL');
  
  // Advanced Filters
  const [showFilters, setShowFilters] = useState(false);
  const [ageFilter, setAgeFilter] = useState<'ALL' | 'BABY' | 'YOUNG' | 'ADULT' | 'SENIOR'>('ALL');
  const [feeFilter, setFeeFilter] = useState<'ALL' | 'FREE' | 'UNDER_1K' | '1K_5K' | 'ABOVE_5K'>('ALL');

  // New filters for staff: 'ALL' (Available), 'ADOPTED', 'READY_TO_LIST'
  const [staffFilter, setStaffFilter] = useState<'AVAILABLE' | 'ADOPTED' | 'READY_TO_LIST'>('AVAILABLE');
  
  // Modal state for listing
  const [isListingModalOpen, setIsListingModalOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<EmergencyReport | null>(null);
  const [listingData, setListingData] = useState({ 
    name: '', 
    age: '', 
    gender: 'Male', 
    breed: '', 
    fee: '', 
    description: '',
    healthStatus: '' 
  });

  const isStaff = currentUser?.role === 'NGO' || currentUser?.role === 'VOLUNTEER';

  // Logic to find animals that are TREATED but not yet linked to an adoption pet
  const pendingListings = reports.filter(r => r.status === ReportStatus.TREATED && !r.adoptionPetId);

  // Helper: Categorize Age from string (e.g., "2 Years", "8 Months")
  const getAgeCategory = (ageStr: string) => {
    const lower = ageStr.toLowerCase();
    // If it mentions months, it's a baby
    if (lower.includes('month') || lower.includes('week')) return 'BABY';
    
    // Parse years
    const years = parseFloat(ageStr) || 0;
    if (years < 1) return 'BABY';
    if (years <= 3) return 'YOUNG';
    if (years <= 8) return 'ADULT';
    return 'SENIOR';
  };

  // Helper: Parse Fee
  const checkFee = (feeStr: string, filter: string) => {
    if (filter === 'ALL') return true;
    
    // Remove currency symbols and non-digits
    const cleanFee = feeStr.toLowerCase().replace(/[^0-9.]/g, '');
    const amount = parseFloat(cleanFee) || 0;
    const isFree = feeStr.toLowerCase().includes('free') || amount === 0;

    if (filter === 'FREE') return isFree;
    if (isFree) return false; // If looking for paid but item is free

    if (filter === 'UNDER_1K') return amount < 1000;
    if (filter === '1K_5K') return amount >= 1000 && amount <= 5000;
    if (filter === 'ABOVE_5K') return amount > 5000;
    return true;
  };

  // Filter pets based on user role and selection
  const visiblePets = pets
    .filter(p => {
      // Citizen only sees available pets
      if (!isStaff) return !p.isAdopted;
      
      // Staff filtering
      if (staffFilter === 'AVAILABLE') return !p.isAdopted;
      if (staffFilter === 'ADOPTED') return p.isAdopted;
      return false; 
    })
    .filter(p => filterType === 'ALL' || p.type === filterType)
    .filter(p => {
       if (ageFilter === 'ALL') return true;
       return getAgeCategory(p.age) === ageFilter;
    })
    .filter(p => {
       return checkFee(p.fee, feeFilter);
    });

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
    if (selectedReport && onListForAdoption) {
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
      setStaffFilter('AVAILABLE'); // Switch to available tab to see the new listing
    }
  };

  return (
    <div className="p-6 md:p-0 space-y-8 animate-in fade-in duration-500 pb-24 md:pb-6">
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
          <h1 className="text-3xl font-800 text-gray-900 tracking-tight">{t('adoptHero')}</h1>
          <p className="text-sm text-gray-700 font-medium mt-1">{t('adoptHeroDesc')}</p>
        </div>
        {!isStaff && (
          <div className="flex gap-2">
              <Link to="/adoption" className="bg-emerald-50 text-emerald-700 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                  <Heart className="w-4 h-4 fill-emerald-600" /> {t('findFriend')}
              </Link>
          </div>
        )}
      </div>

      <div className="space-y-4">
        {/* Staff-only status filter */}
        {isStaff && (
           <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              <button onClick={() => setStaffFilter('AVAILABLE')} className={`px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${staffFilter === 'AVAILABLE' ? 'bg-gray-900 text-white shadow-lg' : 'bg-white border border-gray-100 text-gray-500 hover:bg-gray-50'}`}>
                Available
              </button>
              <button onClick={() => setStaffFilter('ADOPTED')} className={`px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${staffFilter === 'ADOPTED' ? 'bg-blue-600 text-white shadow-lg' : 'bg-white border border-gray-100 text-gray-500 hover:bg-gray-50'}`}>
                Adopted
              </button>
              <button onClick={() => setStaffFilter('READY_TO_LIST')} className={`px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 ${staffFilter === 'READY_TO_LIST' ? 'bg-emerald-600 text-white shadow-lg' : 'bg-white border border-gray-100 text-gray-500 hover:bg-gray-50'}`}>
                <ListPlus className="w-3.5 h-3.5" /> Ready to List <span className="ml-1 px-1.5 py-0.5 bg-white/20 rounded text-[10px]">{pendingListings.length}</span>
              </button>
           </div>
        )}

        {/* Filters Row */}
        {staffFilter !== 'READY_TO_LIST' && (
          <div className="space-y-3">
             <div className="flex gap-2 items-center">
                 <button onClick={() => setShowFilters(!showFilters)} className={`p-3 rounded-2xl border transition-all flex items-center gap-2 text-xs font-bold uppercase tracking-wider ${showFilters ? 'bg-gray-900 text-white border-gray-900' : 'bg-white border-gray-200 text-gray-600'}`}>
                    <SlidersHorizontal className="w-4 h-4" /> Filters
                    {(ageFilter !== 'ALL' || feeFilter !== 'ALL') && <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>}
                 </button>

                 <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide flex-1">
                  {[
                    { id: 'ALL', label: 'All Types', icon: Search },
                    { id: AnimalType.DOG, label: 'Dogs', icon: Dog },
                    { id: AnimalType.CAT, label: 'Cats', icon: Cat },
                  ].map((filter) => (
                    <button
                      key={filter.id}
                      onClick={() => setFilterType(filter.id as any)}
                      className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-xs font-800 uppercase tracking-wider whitespace-nowrap transition-all ${
                        filterType === filter.id 
                          ? 'bg-rose-500 text-white shadow-lg shadow-rose-200' 
                          : 'bg-white border border-gray-100 text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <filter.icon className="w-4 h-4" /> {filter.label}
                    </button>
                  ))}
                </div>
             </div>

             {/* Expanded Filters */}
             {showFilters && (
                <div className="bg-white border border-gray-100 rounded-[2rem] p-5 shadow-sm animate-in slide-in-from-top-2">
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                         <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 block flex items-center gap-1"><CalendarDays className="w-3.5 h-3.5"/> Age Group</label>
                         <div className="flex flex-wrap gap-2">
                            {['ALL', 'BABY', 'YOUNG', 'ADULT', 'SENIOR'].map(opt => (
                               <button 
                                 key={opt}
                                 onClick={() => setAgeFilter(opt as any)}
                                 className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider border transition-all ${ageFilter === opt ? 'bg-emerald-50 border-emerald-500 text-emerald-700' : 'bg-gray-50 border-transparent text-gray-500 hover:bg-gray-100'}`}
                               >
                                 {opt === 'BABY' ? 'Puppy/Kitten' : opt}
                               </button>
                            ))}
                         </div>
                      </div>
                      <div>
                         <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 block flex items-center gap-1"><Coins className="w-3.5 h-3.5"/> Adoption Fee</label>
                         <div className="flex flex-wrap gap-2">
                            {[
                               { id: 'ALL', label: 'Any' },
                               { id: 'FREE', label: 'Free' },
                               { id: 'UNDER_1K', label: '< ₹1k' },
                               { id: '1K_5K', label: '₹1k - 5k' },
                               { id: 'ABOVE_5K', label: '> ₹5k' }
                            ].map(opt => (
                               <button 
                                 key={opt.id}
                                 onClick={() => setFeeFilter(opt.id as any)}
                                 className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider border transition-all ${feeFilter === opt.id ? 'bg-emerald-50 border-emerald-500 text-emerald-700' : 'bg-gray-50 border-transparent text-gray-500 hover:bg-gray-100'}`}
                               >
                                 {opt.label}
                               </button>
                            ))}
                         </div>
                      </div>
                   </div>
                </div>
             )}
          </div>
        )}
      </div>

      {/* Render based on view */}
      {staffFilter === 'READY_TO_LIST' && isStaff ? (
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pendingListings.length === 0 ? (
               <div className="col-span-full text-center py-20 bg-white rounded-[2.5rem] border border-dashed border-gray-200">
                 <CheckCircle2 className="w-16 h-16 text-emerald-200 mx-auto mb-4" />
                 <p className="text-gray-500 font-bold text-sm uppercase tracking-widest">All Caught Up</p>
                 <p className="text-sm text-gray-500 font-medium mt-1 italic">No treated animals waiting to be listed.</p>
               </div>
            ) : (
               pendingListings.map(report => (
                  <div key={report.id} className="bg-white border border-gray-100 rounded-[2.5rem] overflow-hidden shadow-sm flex flex-col">
                     <div className="relative h-48">
                        <img src={report.recoveryPhoto || report.photo} alt="Case" className="w-full h-full object-cover" />
                        <div className="absolute top-4 left-4 bg-emerald-600 text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-sm">
                           Treated Case
                        </div>
                     </div>
                     <div className="p-6 flex-1 flex flex-col">
                        <div className="flex justify-between items-start mb-2">
                           <h3 className="text-lg font-800 text-gray-900">{report.animalType}</h3>
                           <span className="text-[10px] text-gray-500 font-medium flex items-center gap-1"><Clock className="w-3 h-3"/> {new Date(report.timestamp).toLocaleDateString()}</span>
                        </div>
                        <p className="text-sm text-gray-600 leading-relaxed mb-4 line-clamp-2 italic">"{report.notes}"</p>
                        <div className="mt-auto">
                           <button onClick={() => openListingModal(report)} className="w-full bg-gray-900 text-white py-3 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-emerald-600 transition-colors flex items-center justify-center gap-2">
                              <Megaphone className="w-4 h-4" /> Create Listing
                           </button>
                        </div>
                     </div>
                  </div>
               ))
            )}
         </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {visiblePets.length === 0 ? (
            <div className="col-span-full text-center py-20 bg-white rounded-[2.5rem] border border-dashed border-gray-200">
              <Heart className="w-16 h-16 text-gray-200 mx-auto mb-4" />
              <p className="text-gray-500 font-bold text-sm uppercase tracking-widest">No friends found</p>
              <p className="text-sm text-gray-500 font-medium mt-1 italic">
                 {staffFilter === 'ADOPTED' ? 'No adoption records match your filter.' : 'All our rescued friends have homes or none match your filter.'}
              </p>
            </div>
          ) : (
            visiblePets.map(pet => (
              <div key={pet.id} className="bg-white border border-gray-100 rounded-[2.5rem] overflow-hidden shadow-sm hover:shadow-xl hover:shadow-rose-50 transition-all flex flex-col group relative">
                
                {pet.isAdopted && (
                   <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] z-10 flex flex-col items-center justify-center text-center p-6">
                      <div className="bg-blue-600 text-white p-4 rounded-full shadow-xl mb-4 transform -rotate-12 border-4 border-white">
                         <PawPrint className="w-8 h-8" />
                      </div>
                      <h3 className="text-2xl font-900 text-blue-900 uppercase tracking-tighter transform -rotate-6">Adopted!</h3>
                      <p className="text-xs font-bold text-blue-800 uppercase tracking-widest mt-2 bg-blue-100 px-3 py-1 rounded-full">
                         by {pet.adopterName || 'Someone Special'}
                      </p>
                   </div>
                )}

                <div className="h-64 relative overflow-hidden">
                    <img src={pet.photo} alt={pet.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest text-gray-800 border border-white/50 shadow-sm">
                      {pet.gender} • {pet.age}
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
                      <h3 className="text-2xl font-800 text-white">{pet.name}</h3>
                      <p className="text-white/80 text-xs font-medium">{pet.breed}</p>
                    </div>
                </div>
                
                <div className="p-6 flex-1 flex flex-col">
                    <p className="text-sm text-gray-600 leading-relaxed line-clamp-3 mb-4 font-medium">{pet.description}</p>
                    
                    <div className="flex flex-wrap gap-2 mb-6">
                      {pet.healthStatus.split(',').map((status, i) => (
                          <span key={i} className="px-2.5 py-1 bg-emerald-50 text-emerald-700 text-[10px] font-bold uppercase tracking-wider rounded-lg flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> {status.trim()}
                          </span>
                      ))}
                    </div>

                    <div className="mt-auto flex items-center justify-between pt-4 border-t border-gray-50">
                      <div>
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{t('adoptionFee')}</p>
                          <p className="text-lg font-800 text-gray-900">{pet.fee}</p>
                      </div>
                      {!pet.isAdopted && (
                        <Link to={`/adoption/apply/${pet.id}`} className="bg-gray-900 text-white px-6 py-3 rounded-2xl text-xs font-bold uppercase tracking-widest hover:bg-rose-500 hover:shadow-lg hover:shadow-rose-200 transition-all active:scale-95 flex items-center gap-2">
                            {t('adoptMe')} <ArrowRight className="w-4 h-4" />
                        </Link>
                      )}
                    </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default AdoptionScreen;
