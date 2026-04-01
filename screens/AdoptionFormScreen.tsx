
import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { User, AdoptionPet, AnimalType } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { Check, ChevronRight, Upload, AlertTriangle, Loader2, FileText, Home, ShieldCheck, CheckCircle2, ChevronLeft, CreditCard, Calendar, Clock, Sparkles, Receipt } from 'lucide-react';
import { verifyAdoptionDoc } from '../services/gemini';

interface AdoptionFormScreenProps {
  currentUser: User | null;
  pets?: AdoptionPet[];
  onAdopt?: (petId: string, adopterId: string, adopterName: string) => void;
}

const AdoptionFormScreen: React.FC<AdoptionFormScreenProps> = ({ currentUser, pets = [], onAdopt }) => {
  const { petId } = useParams();
  const navigate = useNavigate();
  const { t } = useLanguage();
  
  const pet = useMemo(() => pets.find(p => p.id === petId), [petId, pets]);

  // Steps: 1-Eligibility, 2-Housing, 3-Docs, 4-Verification, 5-Review, 6-Schedule
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Form Data
  const [age, setAge] = useState('');
  const [housingType, setHousingType] = useState<'OWNED' | 'RENTED'>('OWNED');
  const [income, setIncome] = useState('');
  const [agreementChecked, setAgreementChecked] = useState(false);
  const [finalTermsChecked, setFinalTermsChecked] = useState(false);

  // Scheduling Data
  const [pickupDate, setPickupDate] = useState('');
  const [pickupTime, setPickupTime] = useState('');

  // Documents
  const [idProof, setIdProof] = useState<string | null>(null);
  const [addressProof, setAddressProof] = useState<string | null>(null);
  const [landlordNoc, setLandlordNoc] = useState<string | null>(null);

  // Verification Results
  const [verificationResults, setVerificationResults] = useState<{
    id: { valid: boolean; reason: string } | null;
    address: { valid: boolean; reason: string } | null;
    landlord: { valid: boolean; reason: string } | null;
  }>({ id: null, address: null, landlord: null });

  if (!pet) return <div className="p-8 text-center">Pet not found.</div>;
  if (pet.isAdopted) return <div className="p-8 text-center">This pet has already been adopted.</div>;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, setter: React.Dispatch<React.SetStateAction<string | null>>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setter(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const verifyDocuments = async () => {
    setLoading(true);
    try {
      // Parallel verification
      const promises = [
        verifyAdoptionDoc(idProof!, 'ID'),
        verifyAdoptionDoc(addressProof!, 'ADDRESS')
      ];
      
      if (housingType === 'RENTED' && landlordNoc) {
        promises.push(verifyAdoptionDoc(landlordNoc, 'LANDLORD'));
      }

      const results = await Promise.all(promises);
      
      setVerificationResults({
        id: { valid: results[0].isValid, reason: results[0].reason },
        address: { valid: results[1].isValid, reason: results[1].reason },
        landlord: housingType === 'RENTED' && landlordNoc ? { valid: results[2].isValid, reason: results[2].reason } : null
      });
      
    } catch (e) {
      console.error("Verification error", e);
      alert("AI Verification failed. Please ensure images are clear.");
    } finally {
      setLoading(false);
      setStep(4);
    }
  };

  const handleFinalSubmit = () => {
    if (onAdopt && currentUser && pet) {
      onAdopt(pet.id, currentUser.id, currentUser.name);
      
      // We can also save the application details locally if needed for records
      const apps = JSON.parse(localStorage.getItem('adoption_applications') || '[]');
      apps.push({
         id: Math.random().toString(36).substr(2, 9),
         petId: pet.id,
         applicantId: currentUser.id,
         status: 'APPROVED', 
         timestamp: Date.now(),
         housingType,
         pickupDetails: { date: pickupDate, time: pickupTime },
         documents: { idProof, addressProof, landlordNoc },
         verificationStatus: verificationResults
      });
      localStorage.setItem('adoption_applications', JSON.stringify(apps));

      // Navigate back to profile or adoption screen
      navigate('/profile'); 
    }
  };

  const Stepper = () => (
    <div className="flex items-center justify-between mb-8 px-2">
      {[1, 2, 3, 4, 5, 6].map(s => (
        <div key={s} className={`flex flex-col items-center gap-2 relative`}>
           <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${step >= s ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-400'}`}>
             {step > s ? <Check className="w-4 h-4"/> : s}
           </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="p-6 md:p-0 animate-in fade-in duration-500 pb-24 md:pb-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
         <button onClick={() => step > 1 ? setStep(step - 1) : navigate(-1)} className="p-3 bg-white border border-gray-100 rounded-full shadow-sm hover:text-emerald-600 transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-800 text-gray-900 tracking-tight">{t('adoptionApp')}</h1>
            <p className="text-xs text-emerald-600 font-bold uppercase tracking-widest">
              {step === 6 ? 'Success' : `Step ${step} of 6`}
            </p>
          </div>
      </div>

      <Stepper />

      <div className="bg-white border border-gray-100 rounded-[2.5rem] p-6 shadow-sm">
        
        {/* Step 1: Eligibility */}
        {step === 1 && (
          <div className="space-y-6 animate-in slide-in-from-right-4">
             <h2 className="text-lg font-800 text-gray-900">{t('stepEligibility')}</h2>
             
             <div className="space-y-1">
               <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Your Age</label>
               <input type="number" value={age} onChange={e => setAge(e.target.value)} placeholder="Must be 18+" className="w-full bg-gray-50 border-gray-200 rounded-2xl p-4 text-sm font-medium focus:ring-2 focus:ring-emerald-500 outline-none" />
             </div>

             <div className="space-y-1">
               <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Annual Income (Approx)</label>
               <input type="text" value={income} onChange={e => setIncome(e.target.value)} placeholder="e.g. 5L - 8L" className="w-full bg-gray-50 border-gray-200 rounded-2xl p-4 text-sm font-medium focus:ring-2 focus:ring-emerald-500 outline-none" />
             </div>

             <div className="flex items-start gap-3 p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                <input type="checkbox" checked={agreementChecked} onChange={e => setAgreementChecked(e.target.checked)} className="mt-1 w-5 h-5 accent-emerald-600" />
                <p className="text-xs text-emerald-900 leading-relaxed font-medium">
                  I certify that I am over 18 years old and all members of my household agree to adopting a pet. I understand a home visit may be required.
                </p>
             </div>

             <button disabled={!age || parseInt(age) < 18 || !income || !agreementChecked} onClick={() => setStep(2)} className="w-full bg-emerald-600 text-white font-800 py-4 rounded-2xl disabled:bg-gray-200 disabled:text-gray-400 transition-all flex items-center justify-center gap-2">
               Next: Housing <ChevronRight className="w-4 h-4"/>
             </button>
          </div>
        )}

        {/* Step 2: Housing */}
        {step === 2 && (
          <div className="space-y-6 animate-in slide-in-from-right-4">
             <h2 className="text-lg font-800 text-gray-900">{t('stepHousing')}</h2>
             
             <div className="grid grid-cols-2 gap-4">
               <button onClick={() => setHousingType('OWNED')} className={`p-6 rounded-3xl border-2 transition-all flex flex-col items-center gap-3 ${housingType === 'OWNED' ? 'bg-emerald-50 border-emerald-500' : 'bg-white border-gray-100'}`}>
                  <Home className={`w-8 h-8 ${housingType === 'OWNED' ? 'text-emerald-600' : 'text-gray-400'}`} />
                  <span className="text-xs font-bold uppercase tracking-wider">Owned</span>
               </button>
               <button onClick={() => setHousingType('RENTED')} className={`p-6 rounded-3xl border-2 transition-all flex flex-col items-center gap-3 ${housingType === 'RENTED' ? 'bg-emerald-50 border-emerald-500' : 'bg-white border-gray-100'}`}>
                  <FileText className={`w-8 h-8 ${housingType === 'RENTED' ? 'text-emerald-600' : 'text-gray-400'}`} />
                  <span className="text-xs font-bold uppercase tracking-wider">Rented</span>
               </button>
             </div>

             {housingType === 'RENTED' && (
                <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 animate-in fade-in">
                   <div className="flex items-center gap-2 mb-2 text-amber-700">
                     <AlertTriangle className="w-4 h-4" />
                     <p className="text-xs font-bold uppercase tracking-widest">Landlord Permission Required</p>
                   </div>
                   <p className="text-xs text-amber-800 mb-4">Please upload a NOC or permission letter from your landlord.</p>
                   <label className="block w-full p-4 bg-white border-2 border-dashed border-amber-300 rounded-2xl text-center cursor-pointer hover:bg-amber-50/50">
                      {landlordNoc ? <span className="text-emerald-600 text-xs font-bold flex items-center justify-center gap-2"><Check className="w-4 h-4"/> Uploaded</span> : <span className="text-amber-600 text-xs font-bold flex items-center justify-center gap-2"><Upload className="w-4 h-4"/> Upload NOC</span>}
                      <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, setLandlordNoc)} />
                   </label>
                </div>
             )}

             <button onClick={() => setStep(3)} disabled={housingType === 'RENTED' && !landlordNoc} className="w-full bg-emerald-600 text-white font-800 py-4 rounded-2xl disabled:bg-gray-200 disabled:text-gray-400 transition-all flex items-center justify-center gap-2">
               Next: Documents <ChevronRight className="w-4 h-4"/>
             </button>
          </div>
        )}

        {/* Step 3: Docs */}
        {step === 3 && (
           <div className="space-y-6 animate-in slide-in-from-right-4">
             <h2 className="text-lg font-800 text-gray-900">{t('stepDocs')}</h2>
             <p className="text-xs text-gray-500">We need to verify your identity. Our AI will check these documents.</p>

             <div className="space-y-4">
                <div className="space-y-2">
                   <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{t('uploadId')}</label>
                   <label className={`block w-full p-6 bg-gray-50 border-2 border-dashed rounded-3xl text-center cursor-pointer transition-colors ${idProof ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200 hover:border-emerald-300'}`}>
                      {idProof ? <div className="text-emerald-600 flex flex-col items-center"><CheckCircle2 className="w-8 h-8 mb-2"/><span className="text-xs font-bold">ID Uploaded</span></div> : <div className="text-gray-400 flex flex-col items-center"><CreditCard className="w-8 h-8 mb-2"/><span className="text-xs font-bold">Tap to upload ID</span></div>}
                      <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, setIdProof)} />
                   </label>
                </div>

                <div className="space-y-2">
                   <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{t('uploadAddress')}</label>
                   <label className={`block w-full p-6 bg-gray-50 border-2 border-dashed rounded-3xl text-center cursor-pointer transition-colors ${addressProof ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200 hover:border-emerald-300'}`}>
                      {addressProof ? <div className="text-emerald-600 flex flex-col items-center"><CheckCircle2 className="w-8 h-8 mb-2"/><span className="text-xs font-bold">Address Proof Uploaded</span></div> : <div className="text-gray-400 flex flex-col items-center"><Home className="w-8 h-8 mb-2"/><span className="text-xs font-bold">Tap to upload Bill/Rent Agreement</span></div>}
                      <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, setAddressProof)} />
                   </label>
                </div>
             </div>

             <button onClick={verifyDocuments} disabled={!idProof || !addressProof} className="w-full bg-gray-900 text-white font-800 py-4 rounded-2xl disabled:bg-gray-200 disabled:text-gray-400 transition-all flex items-center justify-center gap-2 shadow-lg shadow-gray-200">
               {loading ? <Loader2 className="w-5 h-5 animate-spin"/> : <><ShieldCheck className="w-5 h-5"/> Verify Documents with AI</>}
             </button>
           </div>
        )}

        {/* Step 4: Verification Result */}
        {step === 4 && (
           <div className="space-y-6 animate-in slide-in-from-right-4">
              <h2 className="text-lg font-800 text-gray-900">Verification Result</h2>
              
              <div className="space-y-3">
                 <VerificationItem label="Govt ID Proof" result={verificationResults.id} />
                 <VerificationItem label="Address Proof" result={verificationResults.address} />
                 {housingType === 'RENTED' && <VerificationItem label="Landlord NOC" result={verificationResults.landlord} />}
              </div>

              {verificationResults.id?.valid && verificationResults.address?.valid ? (
                 <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 text-center">
                    <p className="text-sm font-bold text-emerald-800">{t('verificationSuccess')}</p>
                    <p className="text-xs text-emerald-600 mt-1">Your documents have been approved by our AI system.</p>
                 </div>
              ) : (
                 <div className="p-4 bg-red-50 rounded-2xl border border-red-100 text-center">
                    <p className="text-sm font-bold text-red-800">{t('verificationFail')}</p>
                    <p className="text-xs text-red-600 mt-1">Please re-upload clearer images for the failed items.</p>
                    <button onClick={() => setStep(3)} className="mt-3 text-xs font-bold text-red-700 underline">Go Back & Upload Again</button>
                 </div>
              )}

              <button 
                onClick={() => setStep(5)} 
                disabled={!(verificationResults.id?.valid && verificationResults.address?.valid)}
                className="w-full bg-emerald-600 text-white font-800 py-4 rounded-2xl disabled:bg-gray-200 disabled:text-gray-400 transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-200"
              >
                Next: Review & Fees <ChevronRight className="w-4 h-4"/>
              </button>
           </div>
        )}

        {/* Step 5: Review & Fees */}
        {step === 5 && (
          <div className="space-y-6 animate-in slide-in-from-right-4">
             <h2 className="text-lg font-800 text-gray-900">Review & Fees</h2>
             
             <div className="bg-gray-50 rounded-[2rem] p-6 border border-gray-100">
                <div className="flex justify-between items-center mb-4 border-b border-gray-200 pb-4">
                   <div>
                      <p className="text-sm font-bold text-gray-900">Adoption of {pet.name}</p>
                      <p className="text-xs text-gray-500">Adoption ID: #{Math.random().toString().slice(2,8)}</p>
                   </div>
                   <div className="text-right">
                      <p className="text-lg font-800 text-emerald-600">{pet.fee}</p>
                   </div>
                </div>
                
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-xs text-gray-600">
                    <span>Vaccination Charge</span>
                    <span>Included</span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-600">
                    <span>Sterilization</span>
                    <span>Included</span>
                  </div>
                  <div className="flex justify-between text-xs font-bold text-gray-900 pt-2">
                    <span>Total Payable</span>
                    <span>{pet.fee}</span>
                  </div>
                </div>
             </div>

             <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-2xl border border-blue-100">
                <input type="checkbox" checked={finalTermsChecked} onChange={e => setFinalTermsChecked(e.target.checked)} className="mt-1 w-5 h-5 accent-emerald-600" />
                <p className="text-xs text-blue-900 leading-relaxed font-medium">
                  I agree to pay the adoption fee and abide by the shelter's rules. I understand that abandoning the animal is a punishable offense.
                </p>
             </div>

             <button 
                onClick={() => setStep(6)} 
                disabled={!finalTermsChecked}
                className="w-full bg-gray-900 text-white font-800 py-4 rounded-2xl disabled:bg-gray-200 disabled:text-gray-400 transition-all flex items-center justify-center gap-2 shadow-lg shadow-gray-200"
             >
               <Receipt className="w-4 h-4" /> Confirm & Proceed
             </button>
          </div>
        )}

        {/* Step 6: Success & Schedule */}
        {step === 6 && (
           <div className="space-y-6 animate-in fade-in zoom-in duration-500">
              <div className="text-center py-6">
                 <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                    <Sparkles className="w-10 h-10 text-emerald-600" />
                 </div>
                 <h2 className="text-2xl font-800 text-gray-900">Congratulations!</h2>
                 <p className="text-sm text-gray-600 mt-2 font-medium">
                   <span className="font-bold text-emerald-600">{pet.name}</span> has been officially adopted by you!
                 </p>
              </div>

              <div className="bg-emerald-50 rounded-[2rem] p-6 border border-emerald-100 space-y-4">
                 <h3 className="text-sm font-bold text-emerald-800 text-center uppercase tracking-widest mb-2">Schedule Pickup</h3>
                 
                 <div>
                    <label className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 ml-1"><Calendar className="w-3.5 h-3.5"/> Select Date</label>
                    <input type="date" value={pickupDate} onChange={e => setPickupDate(e.target.value)} className="w-full bg-white border-emerald-200 rounded-2xl p-4 text-sm font-medium focus:ring-2 focus:ring-emerald-500 outline-none" />
                 </div>

                 <div>
                    <label className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 ml-1"><Clock className="w-3.5 h-3.5"/> Select Time</label>
                    <input type="time" value={pickupTime} onChange={e => setPickupTime(e.target.value)} className="w-full bg-white border-emerald-200 rounded-2xl p-4 text-sm font-medium focus:ring-2 focus:ring-emerald-500 outline-none" />
                 </div>
              </div>

              <button 
                onClick={handleFinalSubmit}
                disabled={!pickupDate || !pickupTime}
                className="w-full bg-emerald-600 text-white font-800 py-4 rounded-2xl disabled:bg-gray-200 disabled:text-gray-400 transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-200"
              >
                Confirm Pickup & Finish
              </button>
           </div>
        )}

      </div>
    </div>
  );
};

const VerificationItem = ({ label, result }: { label: string, result: { valid: boolean, reason: string } | null }) => {
  if (!result) return null;
  return (
    <div className={`p-4 rounded-2xl border flex items-start gap-3 ${result.valid ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200'}`}>
       {result.valid ? <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0"/> : <AlertTriangle className="w-5 h-5 text-red-500 shrink-0"/>}
       <div>
          <p className={`text-xs font-bold uppercase tracking-wider ${result.valid ? 'text-emerald-700' : 'text-red-700'}`}>{label}</p>
          <p className={`text-xs mt-1 ${result.valid ? 'text-emerald-600' : 'text-red-600'}`}>{result.reason}</p>
       </div>
    </div>
  );
};

export default AdoptionFormScreen;
