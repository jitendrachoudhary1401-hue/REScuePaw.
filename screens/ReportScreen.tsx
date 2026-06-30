
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, MapPin, X, Loader2, Dog, Cat, HelpCircle, CheckCircle2, AlertCircle, ShieldAlert, Sparkles, ChevronLeft, List, Shield, ImageUp, Video, AlertTriangle, ArrowRight, Check, Eye, Signal } from 'lucide-react';
import { AnimalType, ReportStatus, EmergencyReport, Location, User, AiAnalysis } from '../types';
import { analyzeInjury, getAreaDescription, geocodeAddress, checkIsSameAnimal } from '../services/gemini';

interface ReportScreenProps {
  onReport: (report: EmergencyReport) => void;
  currentUser: User | null;
  reports: EmergencyReport[];
}

const calculateDistance = (loc1: Location, loc2: Location) => {
  const R = 6371e3; // metres
  const φ1 = loc1.lat * Math.PI / 180;
  const φ2 = loc2.lat * Math.PI / 180;
  const Δφ = (loc2.lat - loc1.lat) * Math.PI / 180;
  const Δλ = (loc2.lng - loc1.lng) * Math.PI / 180;

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) *
    Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // in metres
};

const ReportScreen: React.FC<ReportScreenProps> = ({ onReport, currentUser, reports }) => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [photo, setPhoto] = useState<string | null>(null);
  const [animalType, setAnimalType] = useState<AnimalType>(AnimalType.OTHER);
  const [notes, setNotes] = useState('');
  const [location, setLocation] = useState<Location | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiResult, setAiResult] = useState<AiAnalysis | null>(null);
  const [areaInfo, setAreaInfo] = useState<string | null>(null);
  const [wasAutoDetected, setWasAutoDetected] = useState(false);
  const [gpsError, setGpsError] = useState(false);
  const [manualAddress, setManualAddress] = useState('');
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [isManualEntry, setIsManualEntry] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [duplicateReport, setDuplicateReport] = useState<EmergencyReport | null>(null);
  const [isCheckingDuplicate, setIsCheckingDuplicate] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    getLocation();
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const getLocation = () => {
    if (!window.isSecureContext) {
      setGpsError(true); setIsManualEntry(true);
      return;
    }
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          setLocation(coords);
          fetchAreaInfo(coords.lat, coords.lng);
          setGpsError(false);
        },
        () => { setGpsError(true); setIsManualEntry(true); },
        { enableHighAccuracy: true }
      );
    } else {
      setGpsError(true); setIsManualEntry(true);
    }
  };

  const fetchAreaInfo = async (lat: number, lng: number) => {
    try {
      setAreaInfo("Generating dispatch notes...");
      const info = await getAreaDescription(lat, lng);
      setAreaInfo(info || "Could not determine landmarks.");
    } catch (e) {
      console.error(e);
      setAreaInfo("Could not determine landmarks.");
    }
  };

  const setPhotoAndAnalyze = async (b64: string) => {
    setPhoto(b64);
    setStep(2);
    setIsAnalyzing(true);
    setAiResult(null);
    setAnalysisError(null);
    setWasAutoDetected(false);
    try {
      const analysis = await analyzeInjury(b64);
      if (analysis.isAiGenerated || !analysis.isAnimalPresent) {
        setAnalysisError(analysis.firstAidAdvice[0] || "Invalid image. Please try again.");
      } else {
        // Robust normalization to ensure auto-select works even with case differences
        const rawType = analysis.animalType.toUpperCase();
        let detectedType = AnimalType.OTHER;
        
        if (rawType.includes('DOG')) detectedType = AnimalType.DOG;
        else if (rawType.includes('CAT')) detectedType = AnimalType.CAT;
        else if (rawType.includes('COW')) detectedType = AnimalType.COW;
        else if (Object.values(AnimalType).includes(rawType as AnimalType)) {
          detectedType = rawType as AnimalType;
        }

        setAnimalType(detectedType);
        setAiResult(analysis);
        setWasAutoDetected(true);
      }
    } catch (e) {
      console.error("AI Analysis failed", e);
      setAnalysisError("AI analysis failed. Please try again with a clearer photo.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPhotoAndAnalyze(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const openCamera = async () => {
    if (!window.isSecureContext) {
      alert("Camera access is only available on secure (HTTPS) connections.");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setIsCameraOpen(true);
      }
    } catch (err) {
      alert("Could not access camera. Please check permissions.");
    }
  };
  
  const closeCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    setIsCameraOpen(false);
  };

  const handleCapture = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context?.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
      setPhotoAndAnalyze(canvas.toDataURL('image/jpeg', 0.9));
      closeCamera();
    }
  };

  const resetPhoto = () => {
    setPhoto(null);
    setAiResult(null);
    setWasAutoDetected(false);
    setAnalysisError(null);
    setStep(1);
  };

  const handleSubmit = async () => {
    let reportLocation = location;
    if (isManualEntry && manualAddress.trim()) {
      setIsGeocoding(true);
      try {
        const coords = await geocodeAddress(manualAddress);
        if (!coords?.lat || !coords?.lng) throw new Error("Invalid geocoding result.");
        reportLocation = coords;
      } catch (e) {
        alert("Could not verify address. Please be more specific.");
        setIsGeocoding(false);
        return;
      } finally {
        setIsGeocoding(false);
      }
    }

    if (!photo || !reportLocation) {
      alert("Photo and location are required.");
      return;
    }

    setIsCheckingDuplicate(true);
    try {
      // Check for duplicates within 50 meters
      const nearbyReports = reports.filter(r => {
        if (r.status === ReportStatus.TREATED) return false;
        const dist = calculateDistance(r.location, reportLocation!);
        return dist < 50;
      });

      let duplicate: EmergencyReport | null = null;

      if (nearbyReports.length > 0) {
        for (const r of nearbyReports) {
          const isSame = await checkIsSameAnimal(photo, r.photo);
          if (isSame) {
            duplicate = r;
            break;
          }
        }
      }

      if (duplicate) {
        setDuplicateReport(duplicate);
        return;
      }

      const report: EmergencyReport = {
        id: Math.random().toString(36).substr(2, 9),
        photo, animalType, notes,
        location: { ...reportLocation, address: areaInfo || (isManualEntry ? manualAddress : undefined) },
        status: ReportStatus.REPORTED,
        timestamp: Date.now(),
        aiAnalysis: aiResult || undefined,
        reporterId: currentUser?.id || 'anonymous'
      };

      onReport(report);
      navigate(`/status/${report.id}`);
    } catch (e) {
      console.error("Error submitting report", e);
      alert("An error occurred while submitting the report. Please try again.");
    } finally {
      setIsCheckingDuplicate(false);
    }
  };

  const ProgressBar = () => (
    <div className="flex items-center gap-2 md:gap-4 mb-8">
      {['Capture', 'Analyze', 'Confirm'].map((name, index) => (
        <React.Fragment key={name}>
          <div className="flex items-center gap-2">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all ${step > index ? 'bg-emerald-600 text-white shadow-[0_0_15px_rgba(16,185,129,0.5)]' : 'bg-gray-200/50 text-gray-500'}`}>
              {step > index ? <Check className="w-4 h-4" /> : index + 1}
            </div>
            <span className={`font-bold text-xs uppercase tracking-wider transition-colors ${step > index ? 'text-emerald-600 drop-shadow-sm' : 'text-gray-400'}`}>{name}</span>
          </div>
          {index < 2 && <div className={`flex-1 h-1 rounded-full transition-colors ${step > index + 1 ? 'bg-emerald-600 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-gray-200/50'}`}></div>}
        </React.Fragment>
      ))}
    </div>
  );

  const CameraView = () => (
    <div className="fixed inset-0 bg-black z-50 flex flex-col animate-in fade-in">
      <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover"></video>
      <canvas ref={canvasRef} className="hidden"></canvas>
      <div className="absolute top-4 right-4"><button onClick={closeCamera} className="p-2 bg-black/50 text-white rounded-full"><X/></button></div>
      <div className="absolute bottom-6 left-0 right-0 flex justify-center">
        <button onClick={handleCapture} className="w-16 h-16 rounded-full bg-white ring-4 ring-white/30" aria-label="Capture"/>
      </div>
    </div>
  );

  return (
    <>
      {isCameraOpen && <CameraView />}
      {duplicateReport && (
        <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-[2.5rem] w-full max-w-md p-8 shadow-2xl animate-in zoom-in-95 duration-500 text-center">
            <div className="w-20 h-20 bg-amber-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <ShieldAlert className="w-10 h-10 text-amber-600" />
            </div>
            <h3 className="text-xl font-800 text-gray-900 tracking-tight mb-2">Already Reported</h3>
            <p className="text-sm text-gray-600 font-medium leading-relaxed mb-8">
              An animal at this location has already been reported and help is on the way. You can track its status instead.
            </p>
            <div className="space-y-3">
              <button 
                onClick={() => navigate(`/status/${duplicateReport.id}`)}
                className="w-full bg-emerald-600 text-white font-bold py-4 rounded-2xl shadow-lg shadow-emerald-200 hover:bg-emerald-700 transition-all"
              >
                Track Existing Case
              </button>
              <button 
                onClick={() => setDuplicateReport(null)}
                className="w-full bg-gray-100 text-gray-600 font-bold py-4 rounded-2xl hover:bg-gray-200 transition-all"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="p-6 md:p-0 animate-in fade-in duration-500 pb-24 md:pb-6 max-w-4xl mx-auto">
        <div className="relative">
          <button onClick={() => navigate(-1)} className="absolute -left-16 top-1 hidden md:flex items-center gap-1 text-gray-600 font-bold text-sm mb-2">
            <ChevronLeft className="w-4 h-4" /> Back
          </button>
          <h1 className="text-3xl font-800 text-gray-900 tracking-tight">Report an Emergency</h1>
        </div>
        
        <div className="mt-6">
          <ProgressBar />
          <div className="relative min-h-[500px]">
            {/* Step 1: Upload */}
            {step === 1 && (
              <div key="step1" className="glass-card rounded-[2.5rem] p-8 border border-white/60 shadow-xl animate-in fade-in zoom-in-95 duration-500 text-center flex flex-col items-center justify-center min-h-[500px]">
                <div className="p-6 bg-gray-50 rounded-[2rem] shadow-inner mb-6">
                  <Camera className="w-12 h-12 text-emerald-600" />
                </div>
                <span className="text-xl font-bold text-gray-800">Provide a Clear Image</span>
                <span className="text-sm text-gray-600 mt-2 font-medium italic max-w-xs">A good photo is crucial for an accurate AI assessment and quick response.</span>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8 w-full max-w-md">
                  <button onClick={openCamera} className="w-full bg-gray-900 text-white font-800 text-sm py-4 rounded-2xl shadow-lg shadow-gray-200 flex items-center justify-center gap-2 active:scale-95 transition-all hover:bg-gray-800">
                    <Video className="w-5 h-5" /> Take Photo
                  </button>
                  <button onClick={() => fileInputRef.current?.click()} className="w-full bg-white text-gray-800 font-800 text-sm py-4 rounded-2xl shadow-md border border-gray-100 flex items-center justify-center gap-2 active:scale-95 transition-all hover:bg-gray-50 hover:border-gray-200">
                    <ImageUp className="w-5 h-5" /> Upload from Device
                  </button>
                </div>
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileSelect} />
              </div>
            )}

            {/* Step 2: Analyze */}
            {step === 2 && (
              <div key="step2" className="animate-in fade-in duration-700">
                <div className="gradient-border rounded-[2.5rem] p-[3px] mb-6 shadow-xl">
                  <div className="relative aspect-video rounded-[2.3rem] bg-gray-900 overflow-hidden">
                    <img src={photo!} className={`w-full h-full object-cover transition-all duration-700 ${aiResult ? '' : 'opacity-30 blur-sm scale-110'}`} />
                  
                  {/* Loading / Error State Overlay */}
                  {(!aiResult || isAnalyzing) && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      {isAnalyzing ? (
                        <div className="text-center text-white p-8">
                          <Loader2 className="w-10 h-10 animate-spin mx-auto mb-4" />
                          <p className="text-lg font-bold">AI Vision Analyzing...</p>
                          <p className="text-sm text-emerald-200 max-w-xs">Enhancing image clarity and checking for injuries.</p>
                        </div>
                      ) : analysisError && (
                        <div className="text-center text-white p-8">
                          <AlertTriangle className="w-10 h-10 text-red-400 mx-auto mb-4" />
                          <p className="text-lg font-bold">Analysis Failed</p>
                          <p className="text-sm text-red-200 max-w-xs">{analysisError}</p>
                          <button onClick={resetPhoto} className="mt-6 px-6 py-2 bg-white text-red-700 font-bold text-xs rounded-full uppercase tracking-widest">Try Again</button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                </div>

                {/* AI Result Card - Displayed BELOW the image when analysis is done */}
                {aiResult && !isAnalyzing && (
                  <div className="w-full glass-card border border-white/60 rounded-[2.5rem] p-6 shadow-xl animate-in slide-in-from-bottom-4">
                    <div className="flex justify-between items-start mb-4">
                       <div className="flex items-center gap-3">
                          <div className="p-2.5 bg-emerald-100 rounded-xl"><Sparkles className="w-5 h-5 text-emerald-600" /></div>
                          <div>
                            <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">AI Triage Complete</p>
                            <h3 className="text-lg font-800 text-gray-900">{aiResult.breedSuggestion || aiResult.animalType}</h3>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] font-bold text-gray-500 uppercase">Severity</p>
                          <p className={`font-bold text-sm ${aiResult.severity.toLowerCase().includes('critical') || aiResult.severity.toLowerCase().includes('high') ? 'text-red-600' : 'text-orange-600'}`}>{aiResult.severity}</p>
                        </div>
                    </div>
                    {aiResult.imageQuality && (
                      <div className={`flex items-center gap-2 mb-3 px-3 py-1.5 rounded-lg w-fit ${aiResult.imageQuality === 'Low' ? 'bg-orange-100 text-orange-700' : 'bg-blue-50 text-blue-700'}`}>
                         <Signal className="w-3.5 h-3.5" />
                         <span className="text-[10px] font-bold uppercase">{aiResult.imageQuality === 'Low' ? 'Low Quality Image - Auto Enhanced' : 'Image Quality: ' + aiResult.imageQuality}</span>
                      </div>
                    )}
                    {aiResult.visualDescription && (
                       <div className="mb-4 bg-emerald-50/50 p-4 rounded-2xl border border-emerald-50">
                         <div className="flex items-center gap-2 mb-2">
                           <Eye className="w-4 h-4 text-emerald-600" />
                           <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">Visual Analysis</span>
                         </div>
                         <p className="text-sm text-emerald-900 leading-relaxed font-medium">{aiResult.visualDescription}</p>
                       </div>
                    )}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {aiResult.categories.map(cat => (
                        <span key={cat} className="text-[10px] font-bold bg-emerald-100 text-emerald-700 px-2 py-1 rounded-lg border border-emerald-200">{cat}</span>
                      ))}
                    </div>
                    <p className="text-sm font-medium italic text-gray-700 mb-4 border-l-2 border-emerald-500 pl-3">"{aiResult.visualObservation}"</p>
                    <div className="bg-amber-50 rounded-2xl p-4 border border-amber-100">
                      <h4 className="text-xs font-bold text-amber-700 uppercase tracking-widest mb-2 flex items-center gap-2"><Shield className="w-4 h-4"/> First-Aid Checklist</h4>
                      <ul className="space-y-1.5">
                        {aiResult.firstAidAdvice.map((tip, i) => (
                          <li key={i} className="flex items-start gap-2 text-xs text-amber-900 font-medium">
                            <CheckCircle2 className="w-3.5 h-3.5 mt-0.5 shrink-0 text-amber-600"/> <span>{tip}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <button onClick={() => setStep(3)} className="w-full mt-6 bg-emerald-600 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-200">
                      Next: Confirm Details <ArrowRight className="w-4 h-4"/>
                    </button>
                  </div>
                )}
              </div>
            )}
            
            {/* Step 3: Confirm Details */}
            {step === 3 && aiResult && (
              <div key="step3" className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in duration-700">
                 <div className="space-y-6">
                    <div>
                      <label className="text-xs font-bold text-gray-600 uppercase tracking-widest ml-1 mb-2 block">Animal Species</label>
                      <div className="grid grid-cols-4 gap-2">
                        {[
                          { id: AnimalType.DOG, icon: Dog, label: 'Dog' },
                          { id: AnimalType.CAT, icon: Cat, label: 'Cat' },
                          { id: AnimalType.COW, emoji: '🐮', label: 'Cow' },
                          { id: AnimalType.OTHER, icon: HelpCircle, label: 'Other' },
                        ].map(item => (
                          <button key={item.id} onClick={() => setAnimalType(item.id)}
                            className={`relative flex flex-col items-center gap-2 p-3 rounded-2xl border-2 transition-all ${animalType === item.id ? 'bg-emerald-50 border-emerald-500' : 'bg-white border-gray-100'}`}>
                            {wasAutoDetected && animalType === item.id && (
                               <div className="absolute -top-2 -right-1 bg-emerald-600 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-0.5 shadow-sm border border-white z-10">
                                 <Sparkles className="w-2 h-2" /> Auto
                               </div>
                            )}
                            {item.emoji ? <span className="text-2xl">{item.emoji}</span> : <item.icon className={`w-6 h-6 ${animalType === item.id ? 'text-emerald-600' : 'text-gray-400'}`} />}
                            <span className="text-[10px] font-bold uppercase">{item.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                     <div>
                      <label className="block text-xs font-bold text-gray-600 uppercase tracking-widest mb-2 ml-1">Incident Notes</label>
                        <textarea
                          placeholder="Add any other relevant details..."
                          className="w-full h-48 p-4 glass border border-white/60 shadow-sm rounded-2xl text-sm outline-none focus:ring-4 focus:ring-emerald-500/20 transition-all"
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                        />
                    </div>
                 </div>
                 <div className="space-y-6">
                    <div className="glass-card border border-white/60 shadow-sm rounded-2xl p-4">
                       <label className="flex items-center gap-2 text-xs font-bold text-gray-600 uppercase tracking-widest mb-2 ml-1"><MapPin className="w-4 h-4"/> Location</label>
                        {isManualEntry ? (
                          <textarea
                            placeholder="e.g., 'Corner of Main St and Park Ave'"
                            className="w-full h-24 p-3 bg-gray-50 border-gray-200 rounded-xl text-sm"
                            value={manualAddress}
                            onChange={(e) => setManualAddress(e.target.value)}
                          />
                        ) : (
                          <div className="p-3 bg-gray-50 rounded-xl">
                            <p className="text-xs font-bold text-gray-800 leading-relaxed">{areaInfo || 'Loading...'}</p>
                          </div>
                        )}
                        <button onClick={() => setIsManualEntry(!isManualEntry)} className="text-[10px] font-bold text-emerald-600 mt-2 hover:underline">
                          {isManualEntry ? 'Use GPS Location' : 'Enter Manually'}
                        </button>
                    </div>
                    <button
                      onClick={handleSubmit}
                      disabled={isGeocoding || isCheckingDuplicate}
                      className="glow-button w-full bg-emerald-600 text-white font-800 text-lg py-5 rounded-2xl shadow-2xl shadow-emerald-200 disabled:bg-gray-300 disabled:shadow-none flex items-center justify-center gap-3 hover:bg-emerald-700 transition-colors">
                      {isGeocoding ? <><Loader2 className="w-6 h-6 animate-spin" /> Verifying Address...</> : isCheckingDuplicate ? <><Loader2 className="w-6 h-6 animate-spin" /> Checking Duplicates...</> : 'Broadcast Emergency Report'}
                    </button>
                    <p className="text-[10px] text-center text-gray-500 font-bold uppercase tracking-tighter flex items-center justify-center gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5" /> 15 nearest volunteers will be notified
                    </p>
                 </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default ReportScreen;
