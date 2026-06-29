
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bone, ChevronLeft, Camera, Loader2, Sparkles, Dog, Cat, CheckCircle2, AlertTriangle, Info, Send, MapPin, Calendar, Clock, Truck, Building2, Signal, Coins } from 'lucide-react';
import { FoodAnalysis, AnimalType, Location, User, Donation } from '../types';
import { analyzeFoodDonation, getAreaDescription } from '../services/gemini';

interface DonationScreenProps {
  onDonate: (donationData: Omit<Donation, 'id'|'donorId'|'donorName'|'timestamp'|'status'|'claimedBy'>) => void;
  currentUser: User | null;
}

const DonationScreen: React.FC<DonationScreenProps> = ({ onDonate, currentUser }) => {
  const navigate = useNavigate();
  
  // Overall state management
  const [step, setStep] = useState<'upload' | 'analyzing' | 'result' | 'deliveryMethod' | 'scheduling' | 'ngoInfo' | 'confirmed'>('upload');
  
  // Data state
  const [photo, setPhoto] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<FoodAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedAnimal, setSelectedAnimal] = useState<AnimalType | null>(null);
  const [deliveryMethod, setDeliveryMethod] = useState<'pickup' | 'dropoff' | null>(null);

  // Scheduling state
  const [pickupDate, setPickupDate] = useState('');
  const [pickupTime, setPickupTime] = useState('');
  const [pickupLocation, setPickupLocation] = useState<Location | null>(null);
  const [isManualLocation, setIsManualLocation] = useState(false);
  const [manualAddress, setManualAddress] = useState('');
  const [locationInfo, setLocationInfo] = useState<string | null>(null);
  const [isFetchingLocation, setIsFetchingLocation] = useState(false);

  useEffect(() => {
    if (step === 'scheduling' && !isManualLocation && !pickupLocation) {
      if (!window.isSecureContext) {
        setLocationInfo('GPS requires a secure (HTTPS) connection. Please enter your location manually.');
        setIsManualLocation(true);
        setIsFetchingLocation(false);
        return;
      }

      setIsFetchingLocation(true);
      setLocationInfo('Acquiring GPS Signal...');
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          setPickupLocation(coords);
          fetchLocationInfo(coords.lat, coords.lng);
          setIsFetchingLocation(false);
        },
        () => {
          setLocationInfo('GPS failed. Please enter location manually.');
          setIsManualLocation(true);
          setIsFetchingLocation(false);
        },
        { enableHighAccuracy: true }
      );
    }
  }, [step, isManualLocation]);

  const fetchLocationInfo = async (lat: number, lng: number) => {
    try {
      const info = await getAreaDescription(lat, lng);
      setLocationInfo(info || "Could not determine landmarks.");
    } catch (e) {
      console.error(e);
      setLocationInfo("Could not determine landmarks.");
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = async () => {
      const b64 = reader.result as string;
      setPhoto(b64);
      setStep('analyzing');
      setAnalysis(null);
      setError(null);
      setSelectedAnimal(null);

      try {
        const result = await analyzeFoodDonation(b64);
        setAnalysis(result);

        const suitableAnimals = Object.entries(result.suitability)
          .filter(([_, isSuitable]) => isSuitable)
          .map(([animal]) => animal as AnimalType);
        
        if (suitableAnimals.length === 1) {
          setSelectedAnimal(suitableAnimals[0]);
        }

        setStep('result');
      } catch (err) {
        console.error("Food analysis failed", err);
        setError("Sorry, the AI analysis failed. Please try a clearer photo or a different item.");
        setStep('upload');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleReset = () => {
    setStep('upload');
    setPhoto(null);
    setAnalysis(null);
    setError(null);
    setSelectedAnimal(null);
    setDeliveryMethod(null);
    setPickupDate('');
    setPickupTime('');
    setPickupLocation(null);
    setIsManualLocation(false);
    setManualAddress('');
    setLocationInfo(null);
  };

  const handleSubmitDonation = () => {
    if (!currentUser || !photo || !analysis || !selectedAnimal || !deliveryMethod) return;
    
    const donationData: Omit<Donation, 'id'|'donorId'|'donorName'|'timestamp'|'status'|'claimedBy'> = {
      photo,
      foodType: analysis.foodType,
      estimatedQuantity: analysis.estimatedQuantity,
      animalType: selectedAnimal,
      comments: analysis.comments,
      deliveryMethod,
      pickupDetails: deliveryMethod === 'pickup' ? {
        date: pickupDate,
        time: pickupTime,
        location: pickupLocation || undefined,
        manualAddress: manualAddress || undefined,
        locationInfo: locationInfo || undefined,
      } : undefined
    };

    onDonate(donationData);
    setStep('confirmed');
  };

  const animalMap = analysis ? [
    { id: AnimalType.DOG, icon: Dog, label: 'Dogs', suitable: analysis.suitability.dog },
    { id: AnimalType.CAT, icon: Cat, label: 'Cats', suitable: analysis.suitability.cat },
    { id: 'COW' as AnimalType, emoji: '🐮', label: 'Cows', suitable: analysis.suitability.cow },
  ] : [];

  const suitableAnimals = analysis ? animalMap.filter(a => a.suitable) : [];
  const selectedAnimalLabel = animalMap.find(a => a.id === selectedAnimal)?.label;
  
  // Final Thank You Screen
  if (step === 'confirmed') {
    const confirmationTitle = deliveryMethod === 'pickup' ? "Pickup Scheduled!" : "Donation Registered!";
    const confirmationMessage = deliveryMethod === 'pickup' 
      ? "Your generous donation has been scheduled for pickup. We'll coordinate with you shortly. Remember, a 5% transaction fee on monetary donations helps keep our servers running, ensuring 95% goes directly to the animals."
      : "Your donation is registered. Please drop it off at our center during operating hours. We look forward to seeing you! Remember, a 5% transaction fee on monetary donations helps keep our servers running, ensuring 95% goes directly to the animals.";

    return (
      <div className="p-6 md:p-0 animate-in fade-in zoom-in duration-500 max-w-3xl mx-auto pb-24 md:pb-6 text-center">
        <div className="bg-white rounded-[2.5rem] p-8 md:p-16 border-2 border-dashed border-emerald-200 relative overflow-hidden">
          <div className="w-24 h-24 bg-emerald-600 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-emerald-200 animate-soft-pulse border-4 border-white">
            <CheckCircle2 className="w-12 h-12 text-white" />
          </div>
          <h2 className="text-2xl font-800 text-gray-900 tracking-tight">{confirmationTitle}</h2>
          <p className="text-sm text-gray-600 font-medium mt-4 max-w-md mx-auto leading-relaxed">
            {confirmationMessage} You are a true hero for the animals!
          </p>
          <button
            onClick={handleReset}
            className="mt-8 px-8 py-4 bg-emerald-600 text-white font-800 rounded-2xl text-sm uppercase tracking-widest shadow-lg shadow-emerald-200 hover:bg-emerald-700 transition-colors active:scale-95"
          >
            Donate More
          </button>
        </div>
      </div>
    );
  }

  // Delivery Method Choice Screen
  if (step === 'deliveryMethod') {
     return (
       <div className="p-6 md:p-0 animate-in fade-in duration-500 max-w-3xl mx-auto pb-24 md:pb-6 space-y-6">
        <div className="flex items-center gap-4">
          <button onClick={() => setStep('result')} className="p-3 bg-white border border-gray-100 rounded-full shadow-sm hover:text-emerald-600 transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-3xl font-800 text-gray-900 tracking-tight">How to Donate?</h1>
            <p className="text-sm text-gray-700 font-medium mt-1">Choose how you'd like to get the food to us.</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <button onClick={() => { setDeliveryMethod('pickup'); setStep('scheduling'); }} className="text-left bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm hover:border-emerald-300 hover:shadow-xl transition-all active:scale-95 group">
            <div className="p-4 bg-emerald-50 rounded-3xl inline-block mb-4 group-hover:scale-110 transition-transform">
              <Truck className="w-8 h-8 text-emerald-600"/>
            </div>
            <h3 className="text-lg font-800 text-gray-900">Schedule a Pickup</h3>
            <p className="text-sm text-gray-600 mt-2 font-medium">Our volunteers will collect the donation right from your doorstep.</p>
          </button>
           <button onClick={() => { setDeliveryMethod('dropoff'); setStep('ngoInfo'); }} className="text-left bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm hover:border-amber-300 hover:shadow-xl transition-all active:scale-95 group">
            <div className="p-4 bg-amber-50 rounded-3xl inline-block mb-4 group-hover:scale-110 transition-transform">
              <Building2 className="w-8 h-8 text-amber-600"/>
            </div>
            <h3 className="text-lg font-800 text-gray-900">Drop off at NGO</h3>
            <p className="text-sm text-gray-600 mt-2 font-medium">Visit our nearest center and hand over the donation personally.</p>
          </button>
        </div>
       </div>
     );
  }
  
  // NGO Info Screen
  if (step === 'ngoInfo') {
    return (
      <div className="p-6 md:p-0 animate-in fade-in duration-500 max-w-3xl mx-auto pb-24 md:pb-6 space-y-6">
        <div className="flex items-center gap-4">
          <button onClick={() => setStep('deliveryMethod')} className="p-3 bg-white border border-gray-100 rounded-full shadow-sm hover:text-emerald-600 transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-3xl font-800 text-gray-900 tracking-tight">Drop-off Point</h1>
            <p className="text-sm text-gray-700 font-medium mt-1">Our doors are open for your contribution.</p>
          </div>
        </div>

        <div className="bg-white rounded-[2.5rem] p-6 border border-gray-100 shadow-lg shadow-gray-50/50 space-y-6">
           <div className="aspect-[16/7] bg-gray-100 rounded-3xl overflow-hidden">
             <img src="https://maps.googleapis.com/maps/api/staticmap?center=19.0760,72.8777&zoom=13&size=600x300&maptype=roadmap&markers=color:red%7Clabel:P%7C19.0760,72.8777&key=dummy" alt="Map" className="w-full h-full object-cover" />
           </div>
           <div>
             <h3 className="text-lg font-800 text-gray-900">Hope for Paws Center</h3>
             <p className="text-sm font-medium text-gray-600 mt-1">123, Kindness Street, Animal City, 400050</p>
           </div>
           <div className="grid grid-cols-2 gap-4">
             <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
               <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Timings</p>
               <p className="font-bold text-sm text-gray-800">10:00 AM - 6:00 PM</p>
             </div>
             <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
               <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Days</p>
               <p className="font-bold text-sm text-gray-800">Mon - Sat</p>
             </div>
           </div>
           <button onClick={handleSubmitDonation} className="w-full bg-emerald-600 text-white font-800 text-base py-4 rounded-2xl shadow-lg shadow-emerald-200 transition-all active:scale-95 hover:bg-emerald-700 flex items-center justify-center gap-3">
              I will Drop it Off
           </button>
        </div>
      </div>
    );
  }

  // Scheduling Screen
  if (step === 'scheduling') {
    return (
      <div className="p-6 md:p-0 animate-in fade-in duration-500 max-w-3xl mx-auto pb-24 md:pb-6 space-y-6">
        <div className="flex items-center gap-4">
          <button onClick={() => setStep('deliveryMethod')} className="p-3 bg-white border border-gray-100 rounded-full shadow-sm hover:text-emerald-600 transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-3xl font-800 text-gray-900 tracking-tight">Schedule Pickup</h1>
            <p className="text-sm text-gray-700 font-medium mt-1">Let us know when and where to collect.</p>
          </div>
        </div>

        <div className="bg-white rounded-[2.5rem] p-6 border border-gray-100 shadow-lg shadow-gray-50/50 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 ml-1"><Calendar className="w-3.5 h-3.5"/> Date</label>
              <input type="date" value={pickupDate} onChange={e => setPickupDate(e.target.value)} className="w-full bg-gray-50 border-gray-200 rounded-2xl p-4 text-sm font-medium focus:ring-2 focus:ring-emerald-500 outline-none" />
            </div>
            <div>
              <label className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 ml-1"><Clock className="w-3.5 h-3.5"/> Time</label>
              <input type="time" value={pickupTime} onChange={e => setPickupTime(e.target.value)} className="w-full bg-gray-50 border-gray-200 rounded-2xl p-4 text-sm font-medium focus:ring-2 focus:ring-emerald-500 outline-none" />
            </div>
          </div>
          
          <div>
            <label className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 ml-1"><MapPin className="w-3.5 h-3.5"/> Location</label>
            {isManualLocation ? (
               <textarea placeholder="e.g., 'Corner of Main St, near the big tree'" value={manualAddress} onChange={e => setManualAddress(e.target.value)} className="w-full h-24 p-4 bg-gray-50 border-gray-200 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-emerald-500 outline-none resize-none" />
            ) : (
              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200">
                <p className="text-sm font-bold text-gray-900">{isFetchingLocation ? 'Searching...' : locationInfo || 'Location not found'}</p>
                {pickupLocation && <p className="text-[10px] text-gray-500 font-medium">{pickupLocation.lat.toFixed(4)}, {pickupLocation.lng.toFixed(4)}</p>}
              </div>
            )}
            <button onClick={() => setIsManualLocation(!isManualLocation)} className="text-xs font-bold text-emerald-600 hover:underline mt-2">
              {isManualLocation ? 'Use my current location' : 'Enter address manually'}
            </button>
          </div>
          
          <button onClick={handleSubmitDonation} disabled={!pickupDate || !pickupTime || (!pickupLocation && !manualAddress)} className="w-full bg-emerald-600 text-white font-800 text-base py-4 rounded-2xl shadow-lg shadow-emerald-200 transition-all active:scale-95 hover:bg-emerald-700 flex items-center justify-center gap-3 disabled:bg-gray-300 disabled:shadow-none">
            <Send className="w-5 h-5" />
            Confirm Pickup Details
          </button>
        </div>
      </div>
    );
  }

  // Main Upload and Analysis Screen
  return (
    <div className="p-6 md:p-0 animate-in fade-in duration-500 max-w-3xl mx-auto pb-24 md:pb-6 space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="p-3 bg-white border border-gray-100 rounded-full shadow-sm hover:text-emerald-600 transition-colors">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-3xl font-800 text-gray-900 tracking-tight">Make a Donation</h1>
          <p className="text-sm text-gray-700 font-medium mt-1">Help us feed and treat the rescued souls.</p>
        </div>
      </div>

      {step === 'upload' && !photo && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm hover:border-emerald-300 hover:shadow-xl transition-all group">
            <div className="p-4 bg-emerald-50 rounded-3xl inline-block mb-4 group-hover:scale-110 transition-transform">
              <Coins className="w-8 h-8 text-emerald-600"/>
            </div>
            <h3 className="text-lg font-800 text-gray-900">Donate Funds</h3>
            <p className="text-sm text-gray-600 mt-2 font-medium mb-6">Support vet bills and rescue operations. A 5% transaction fee helps keep our servers running, ensuring 95% goes directly to the animals.</p>
            <button onClick={() => alert("Payment Gateway Integration Coming Soon!")} className="w-full bg-emerald-600 text-white font-bold py-3 rounded-xl hover:bg-emerald-700 transition-colors">
              Donate Now
            </button>
          </div>
          
          <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm hover:border-amber-300 hover:shadow-xl transition-all group">
            <div className="p-4 bg-amber-50 rounded-3xl inline-block mb-4 group-hover:scale-110 transition-transform">
              <Bone className="w-8 h-8 text-amber-600"/>
            </div>
            <h3 className="text-lg font-800 text-gray-900">Donate Food</h3>
            <p className="text-sm text-gray-600 mt-2 font-medium mb-6">Have extra pet food? Upload a photo and our AI will check its safety and suitability for our animals.</p>
            <label className="w-full bg-amber-500 text-white font-bold py-3 rounded-xl hover:bg-amber-600 transition-colors cursor-pointer flex items-center justify-center">
              Upload Food Photo
              <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
            </label>
          </div>
        </div>
      )}

      {step !== 'upload' || photo ? (
        <div className="relative aspect-video rounded-[2.5rem] bg-gray-100 border-2 border-dashed border-gray-200 flex items-center justify-center overflow-hidden transition-all hover:border-amber-400 group shadow-inner">
          {photo && step !== 'upload' ? (
            <img src={photo} alt="Food donation" className="w-full h-full object-cover" />
          ) : (
            <label className="flex flex-col items-center cursor-pointer p-8 w-full h-full justify-center hover:bg-white/50 transition-colors">
              <div className="p-5 bg-white rounded-3xl shadow-xl shadow-gray-200 mb-5 group-hover:scale-110 transition-transform duration-300">
                <Camera className="w-10 h-10 text-amber-600" />
              </div>
              <span className="text-lg font-bold text-gray-800">Upload Food Photo</span>
              <span className="text-sm text-gray-500 mt-2 font-medium italic text-center max-w-xs">Our AI will analyze it for safety & suitability.</span>
              <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
            </label>
          )}
          {step === 'analyzing' && (
            <div className="absolute inset-0 bg-amber-900/90 backdrop-blur-md flex flex-col items-center justify-center text-white p-8 text-center animate-in fade-in duration-300">
              <div className="w-16 h-16 bg-white/10 rounded-3xl flex items-center justify-center mb-6 animate-soft-pulse border border-white/20">
                <Loader2 className="w-8 h-8 animate-spin" />
              </div>
              <p className="text-xl font-800 tracking-tight">AI Nutritionist Analyzing...</p>
              <p className="text-sm text-amber-200 mt-2 font-medium max-w-xs">Checking food type and safety for our animals...</p>
            </div>
          )}
        </div>
      ) : null}

      {error && (
        <div className="p-4 bg-red-50 text-red-700 rounded-2xl border border-red-100 flex items-center gap-3 animate-in fade-in">
          <AlertTriangle className="w-5 h-5 shrink-0" />
          <p className="text-xs font-bold">{error}</p>
        </div>
      )}

      {analysis && step === 'result' && (
        <div className="bg-white rounded-[2.5rem] p-6 border border-gray-100 shadow-lg shadow-gray-50/50 animate-in slide-in-from-bottom-4 duration-500">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 bg-emerald-50 rounded-xl"><Sparkles className="w-5 h-5 text-emerald-600" /></div>
            <div>
              <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">AI Analysis Result</p>
              <h3 className="text-lg font-800 text-gray-900">{analysis.foodType}</h3>
            </div>
          </div>
          
          {analysis.isSpoiledOrExpired && (
            <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-2xl border border-red-200 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold">Unsafe / Spoiled Food Detected</p>
                <p className="text-xs font-medium text-red-600 mt-1">This food appears to be expired, spoiled, or contains toxic items and cannot be accepted for donation.</p>
              </div>
            </div>
          )}

          {analysis.imageQuality && (
            <div className={`flex items-center gap-2 mb-3 px-3 py-1.5 rounded-lg w-fit ${analysis.imageQuality === 'Low' ? 'bg-orange-100 text-orange-700' : 'bg-blue-50 text-blue-700'}`}>
               <Signal className="w-3.5 h-3.5" />
               <span className="text-[10px] font-bold uppercase">{analysis.imageQuality === 'Low' ? 'Low Quality - Enhanced' : 'Image Quality: ' + analysis.imageQuality}</span>
            </div>
          )}
          <p className="text-sm font-medium text-gray-600 border-l-2 border-gray-200 pl-3 mb-4">Quantity: <span className="font-bold">{analysis.estimatedQuantity}</span></p>
          
          {analysis.specificFoodDetected && analysis.specificFoodDetected.length > 0 && (
            <div className="mb-4 pr-4">
              <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Detected Items</h4>
              <div className="flex flex-wrap gap-2">
                {analysis.specificFoodDetected.map((item, idx) => (
                  <span key={idx} className="text-xs font-bold bg-amber-50 text-amber-700 px-3 py-1.5 rounded-lg border border-amber-100">{item}</span>
                ))}
              </div>
            </div>
          )}
          <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
            <div className="flex items-center gap-2 mb-2"><Info className="w-4 h-4 text-gray-500 shrink-0" /> <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest">Nutritionist's Note</h4></div>
            <p className="text-sm font-medium text-gray-800 leading-relaxed">{analysis.comments}</p>
          </div>
          
          {suitableAnimals.length > 1 && !selectedAnimal && (
            <div className="mt-6">
              <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest text-center mb-3">Select who to donate to:</h4>
              <div className="grid grid-cols-3 gap-3">
                {animalMap.map(item => {
                  const Icon = item.icon;
                  return (
                    <button key={item.id} onClick={() => setSelectedAnimal(item.id)} disabled={!item.suitable}
                      className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed ${
                        item.suitable ? 'bg-white border-gray-100 hover:border-amber-300' : 'bg-gray-50 border-gray-100'
                      }`}>
                      {item.emoji ? <span className="text-2xl">{item.emoji}</span> : <Icon className="w-7 h-7" />}
                      <span className="text-[10px] font-bold uppercase tracking-wider">{item.label}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          )}
          
          {selectedAnimal && (
            <div className="mt-6 pt-6 border-t border-gray-100 animate-in fade-in duration-500">
              <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest text-center mb-4">Donation Summary & Confirmation</h4>
              
              <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-2xl border border-gray-100">
                <img src={photo!} alt="food" className="w-16 h-16 rounded-xl object-cover shadow-sm" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600">You are about to donate:</p>
                  <p className="text-base font-bold text-gray-900">{analysis.foodType} <span className="font-medium">({analysis.estimatedQuantity})</span></p>
                  <p className="text-sm font-medium text-gray-600">for the <span className="font-bold text-emerald-600">{selectedAnimalLabel}</span>.</p>
                </div>
              </div>

              <button
                onClick={() => setStep('deliveryMethod')}
                className="mt-4 w-full bg-emerald-600 text-white font-800 text-base py-4 rounded-2xl shadow-lg shadow-emerald-200 transition-all active:scale-95 hover:bg-emerald-700 flex items-center justify-center gap-3"
              >
                Confirm Donation
              </button>
            </div>
          )}
        </div>
      )}
      
      {photo && (step === 'upload' || step === 'result') && (
          <button onClick={handleReset} className="text-xs text-gray-500 font-bold hover:underline text-center w-full mt-2">
            Upload a different photo
          </button>
      )}
    </div>
  );
};

export default DonationScreen;
