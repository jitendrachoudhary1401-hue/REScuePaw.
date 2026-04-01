
import React, { useState, useEffect, useMemo } from 'react';
import { Donation, DonationStatus, User, AnimalType, Location } from '../types';
import { Soup, User as UserIcon, Clock, MapPin, Building2, Truck, Check, Filter, X, Dog, Cat } from 'lucide-react';

interface FoodDonationsScreenProps {
  donations: Donation[];
  onUpdateDonation: (id: string, status: DonationStatus) => void;
  currentUser: User | null;
}

// Helper functions
const calculateDistance = (loc1: Location, loc2: Location): number => {
  const R = 6371; // Radius of the Earth in km
  const dLat = (loc2.lat - loc1.lat) * (Math.PI / 180);
  const dLon = (loc2.lng - loc1.lng) * (Math.PI / 180);
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(loc1.lat * (Math.PI / 180)) * Math.cos(loc2.lat * (Math.PI / 180)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in km
};

const parseQuantity = (quantityStr: string): number => {
  const match = quantityStr.match(/(\d+(\.\d+)?)/);
  return match ? parseFloat(match[1]) : 0;
};

const FoodDonationsScreen: React.FC<FoodDonationsScreenProps> = ({ donations, onUpdateDonation, currentUser }) => {
  const [activeTab, setActiveTab] = useState('Available');
  
  // Filter & Sort State
  const [showFilters, setShowFilters] = useState(false);
  const [filterAnimalTypes, setFilterAnimalTypes] = useState<AnimalType[]>([]);
  const [sortBy, setSortBy] = useState('newest');
  
  // Location State
  const [userLocation, setUserLocation] = useState<Location | null>(null);
  const [isLocationLoading, setIsLocationLoading] = useState(true);
  const [locationError, setLocationError] = useState<string | null>(null);

  useEffect(() => {
    if (!window.isSecureContext) {
      setLocationError("Location access requires a secure (HTTPS) connection.");
      setIsLocationLoading(false);
      return;
    }

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          setIsLocationLoading(false);
        },
        () => {
          setLocationError("Could not retrieve your location.");
          setIsLocationLoading(false);
        },
        { enableHighAccuracy: true }
      );
    } else {
      setLocationError("Geolocation is not supported by this browser.");
      setIsLocationLoading(false);
    }
  }, []);

  if (!currentUser) return null;

  const handleAnimalFilterToggle = (animalType: AnimalType) => {
    setFilterAnimalTypes(prev => 
      prev.includes(animalType) 
        ? prev.filter(a => a !== animalType) 
        : [...prev, animalType]
    );
  };
  
  const resetFilters = () => {
    setFilterAnimalTypes([]);
    setSortBy('newest');
  };

  const processedDonations = useMemo(() => {
    const baseDonations = activeTab === 'Available' 
      ? donations.filter(d => d.status === DonationStatus.AVAILABLE)
      : donations.filter(d => d.status === DonationStatus.CLAIMED && d.claimedBy?.id === currentUser.id);

    // 1. Apply Filters
    let filtered = baseDonations;
    if (filterAnimalTypes.length > 0) {
      filtered = filtered.filter(d => filterAnimalTypes.includes(d.animalType));
    }

    // 2. Apply Sorting
    let sorted = [...filtered];
    switch (sortBy) {
      case 'oldest':
        sorted.sort((a, b) => a.timestamp - b.timestamp);
        break;
      case 'quantity_asc':
        sorted.sort((a, b) => parseQuantity(a.estimatedQuantity) - parseQuantity(b.estimatedQuantity));
        break;
      case 'quantity_desc':
        sorted.sort((a, b) => parseQuantity(b.estimatedQuantity) - parseQuantity(a.estimatedQuantity));
        break;
      case 'distance':
        if (userLocation) {
          sorted.sort((a, b) => {
            const distA = a.pickupDetails?.location ? calculateDistance(userLocation, a.pickupDetails.location) : Infinity;
            const distB = b.pickupDetails?.location ? calculateDistance(userLocation, b.pickupDetails.location) : Infinity;
            return distA - distB;
          });
        }
        break;
      case 'newest':
      default:
        sorted.sort((a, b) => b.timestamp - a.timestamp);
        break;
    }
    return sorted;
  }, [donations, activeTab, currentUser.id, filterAnimalTypes, sortBy, userLocation]);

  const filtersAreActive = filterAnimalTypes.length > 0 || sortBy !== 'newest';

  return (
    <div className="p-6 md:p-0 space-y-8 animate-in fade-in duration-500 pb-24 md:pb-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-800 text-gray-900 tracking-tight">Food Bank</h1>
          <p className="text-sm text-gray-700 font-medium mt-1">Browse and claim available food donations.</p>
        </div>
      </div>
      
      <div className="flex gap-3">
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide -mx-2 px-2 md:mx-0 md:px-0 flex-1">
          {['Available', 'My Claims'].map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 rounded-2xl text-xs font-800 uppercase tracking-wider whitespace-nowrap transition-all ${
                activeTab === tab ? 'bg-amber-500 text-white shadow-lg shadow-amber-200' : 'bg-white border border-gray-100 text-gray-600 hover:bg-gray-50'
              }`}>
              {tab}
            </button>
          ))}
        </div>
        {activeTab === 'Available' && (
          <button onClick={() => setShowFilters(true)} className="relative px-5 bg-white border border-gray-100 text-gray-600 hover:bg-gray-50 rounded-2xl text-xs font-800 uppercase tracking-wider flex items-center gap-2">
            <Filter className="w-4 h-4" /> Filter
            {filtersAreActive && <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white"></div>}
          </button>
        )}
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="fixed inset-0 bg-black/40 z-50 animate-in fade-in duration-300" onClick={() => setShowFilters(false)}>
          <div className="absolute bottom-0 left-0 right-0 bg-gray-50 rounded-t-3xl p-6 shadow-2xl animate-in slide-in-from-bottom-8 duration-500" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-800 text-gray-900">Filter & Sort</h3>
              <button onClick={() => setShowFilters(false)} className="p-2 bg-gray-100 rounded-full"><X className="w-4 h-4 text-gray-600"/></button>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Animal Type</label>
                <div className="grid grid-cols-3 gap-3 mt-2">
                  {[
                    { type: AnimalType.DOG, icon: Dog, label: 'Dogs' },
                    { type: AnimalType.CAT, icon: Cat, label: 'Cats' },
                    { type: 'COW' as AnimalType, emoji: '🐮', label: 'Cows' },
                  ].map(animal => (
                    <button key={animal.type} onClick={() => handleAnimalFilterToggle(animal.type)}
                      className={`flex items-center justify-center gap-2 p-3 rounded-2xl border-2 transition-all ${
                        filterAnimalTypes.includes(animal.type) ? 'bg-emerald-50 border-emerald-500' : 'bg-white border-gray-200'
                      }`}>
                      {animal.icon ? <animal.icon className="w-5 h-5"/> : <span className="text-xl">{animal.emoji}</span>}
                      <span className="text-xs font-bold">{animal.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Sort By</label>
                 <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="w-full mt-2 bg-white border-gray-200 rounded-2xl p-4 text-sm font-medium focus:ring-2 focus:ring-emerald-500 outline-none appearance-none">
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="quantity_desc">Quantity (High to Low)</option>
                  <option value="quantity_asc">Quantity (Low to High)</option>
                  <option value="distance" disabled={!userLocation}>Distance (Nearest First)</option>
                </select>
                {locationError && <p className="text-[10px] text-red-500 font-medium mt-1 pl-1">{locationError}</p>}
              </div>
              
              <div className="grid grid-cols-2 gap-3 pt-4">
                <button onClick={resetFilters} className="w-full bg-white border border-gray-200 text-gray-700 text-sm font-800 py-3.5 rounded-2xl">Reset</button>
                <button onClick={() => setShowFilters(false)} className="w-full bg-emerald-600 text-white text-sm font-800 py-3.5 rounded-2xl">Apply Filters</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {processedDonations.length === 0 ? (
          <div className="col-span-full text-center py-20 bg-white rounded-[2.5rem] border border-dashed border-gray-200">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-dashed border-gray-200">
               <Soup className="w-8 h-8 text-gray-200" />
            </div>
            <p className="text-gray-600 font-bold text-sm uppercase tracking-widest">No Donations Found</p>
            <p className="text-sm text-gray-600 font-medium mt-1 italic">Try adjusting your filters or check back later.</p>
          </div>
        ) : (
          processedDonations.map(donation => (
            <div key={donation.id} className="bg-white border border-gray-100 rounded-[2.5rem] overflow-hidden shadow-sm hover:shadow-xl hover:shadow-amber-50 transition-all flex flex-col h-full group">
              <div className="p-5 flex gap-5">
                <img src={donation.photo} alt={donation.foodType} className="w-24 h-24 rounded-3xl object-cover ring-4 ring-gray-50 group-hover:ring-amber-50 transition-all" />
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-800 text-gray-900 leading-tight truncate">{donation.foodType}</h3>
                  <p className="text-sm text-gray-600 font-medium">{donation.estimatedQuantity}</p>
                  <p className="text-[10px] text-gray-600 font-bold uppercase tracking-wider mt-2">For: {donation.animalType}</p>
                </div>
              </div>
              
              <div className="px-5 pb-5 mt-auto space-y-4">
                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                  <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">Donor Info</p>
                  <div className="flex items-center gap-2 mt-1">
                    <UserIcon className="w-4 h-4 text-gray-400" />
                    <p className="text-sm font-bold text-gray-800">{donation.donorName}</p>
                  </div>
                   <div className="flex items-center gap-2 mt-1">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <p className="text-xs font-medium text-gray-700">{new Date(donation.timestamp).toLocaleDateString()}</p>
                  </div>
                </div>

                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                   <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {donation.deliveryMethod === 'pickup' ? <Truck className="w-4 h-4 text-emerald-600"/> : <Building2 className="w-4 h-4 text-amber-600"/>}
                        <p className="text-[10px] font-bold uppercase tracking-widest">{donation.deliveryMethod === 'pickup' ? 'Pickup Required' : 'Drop-off at NGO'}</p>
                      </div>
                      {sortBy === 'distance' && userLocation && donation.pickupDetails?.location && (
                        <p className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">
                          {calculateDistance(userLocation, donation.pickupDetails.location).toFixed(1)} km away
                        </p>
                      )}
                   </div>
                  {donation.deliveryMethod === 'pickup' && donation.pickupDetails?.locationInfo && (
                     <p className="text-xs font-medium text-gray-700 mt-2 pl-1 border-l-2 border-gray-200">{donation.pickupDetails.locationInfo}</p>
                  )}
                   {donation.deliveryMethod === 'dropoff' && (
                     <p className="text-xs font-medium text-gray-700 mt-2 pl-1 border-l-2 border-gray-200">123, Kindness Street, Animal City, 400050</p>
                  )}
                </div>

                {activeTab === 'Available' && (
                  <button onClick={() => onUpdateDonation(donation.id, DonationStatus.CLAIMED)} className="w-full bg-emerald-600 text-white text-sm font-800 py-3.5 rounded-2xl flex items-center justify-center gap-2 active:scale-95 transition-transform hover:bg-emerald-700 shadow-lg shadow-emerald-100">
                    <Check className="w-5 h-5" /> Claim Donation
                  </button>
                )}

                {activeTab === 'My Claims' && (
                   <div className="w-full bg-emerald-50 text-emerald-700 text-sm font-800 py-3.5 rounded-2xl flex items-center justify-center gap-2 border border-emerald-100">
                    <Check className="w-5 h-5" /> Claimed
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default FoodDonationsScreen;
