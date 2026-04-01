
import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, useNavigate, Link, Navigate, useLocation } from 'react-router-dom';
import { Home, PlusCircle, LayoutDashboard, MessageCircle, PawPrint, ShieldCheck, User as UserIcon, LogOut, UserCircle, Bone, Soup, Heart } from 'lucide-react';
import HomeScreen from './screens/HomeScreen';
import ReportScreen from './screens/ReportScreen';
import DashboardScreen from './screens/DashboardScreen';
import StatusScreen from './screens/StatusScreen';
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import SplashScreen from './screens/SplashScreen';
import ProfileScreen from './screens/ProfileScreen';
import ChatAssistant from './components/ChatAssistant';
import DonationScreen from './screens/DonationScreen';
import FoodDonationsScreen from './screens/FoodDonationsScreen';
import AdoptionScreen from './screens/AdoptionScreen';
import AdoptionFormScreen from './screens/AdoptionFormScreen';
import IntroStoryScreen from './screens/IntroStoryScreen';
import AuthSidePanel from './components/AuthSidePanel'; // Import Side Panel
import { UserRole, EmergencyReport, User, ReportUpdate, ReportStatus, Donation, DonationStatus, AdoptionPet, AnimalType } from './types';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';

// Firebase Imports
import { auth, db } from './services/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

const AppContent: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [reports, setReports] = useState<EmergencyReport[]>([]);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [pets, setPets] = useState<AdoptionPet[]>([]); 
  const [isInitialized, setIsInitialized] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  const [showIntro, setShowIntro] = useState(true); // State for Intro Screen
  const { t } = useLanguage();
  const navigate = useNavigate();

  useEffect(() => {
    // 1. Setup Firebase Auth Listener
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
        if (firebaseUser) {
            // Fetch extended user profile from Firestore
            try {
                const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
                if (userDoc.exists()) {
                    setCurrentUser(userDoc.data() as User);
                } else {
                    // Fallback if document missing (rare with proper flow)
                    setCurrentUser({
                        id: firebaseUser.uid,
                        name: firebaseUser.displayName || 'User',
                        email: firebaseUser.email || '',
                        role: 'CITIZEN'
                    });
                }
                setShowIntro(false); // Skip intro if logged in
            } catch (error) {
                console.error("Error fetching user profile:", error);
            }
        } else {
            setCurrentUser(null);
            // Don't auto-show intro here to avoid flickering on refresh if intended to be logout state,
            // but logic below handles 'showIntro' logic separately based on 'intro_seen'.
        }
    });

    // 2. Load Local Data (Mock Reports/Donations for Demo)
    const existingUsers = localStorage.getItem('rescue_paw_users');
    if (!existingUsers) {
      localStorage.setItem('rescue_paw_users', JSON.stringify([
        { id: 'demo_cit', name: 'John Citizen', email: 'citizen@demo.com', password: '123456', role: 'CITIZEN' },
        { id: 'demo_vol', name: 'Sarah Volunteer', email: 'volunteer@demo.com', password: '123456', role: 'VOLUNTEER' },
        { id: 'demo_ngo', name: 'Hope Rescue', email: 'ngo@demo.com', password: '123456', role: 'NGO', organization: 'Hope NGO' },
        { id: 'demo_vet', name: 'Dr. Paw Clinic', email: 'vet@demo.com', password: '123456', role: 'VET', organization: 'City Vet Hospital' }
      ]));
    }
    
    // Check if user manually logged in via demo account (Local Storage Fallback)
    const savedUser = localStorage.getItem('rescue_paw_current_user');
    if (savedUser && !auth.currentUser) {
      setCurrentUser(JSON.parse(savedUser));
      setShowIntro(false);
    }

    const introSeen = localStorage.getItem('intro_seen');
    if (introSeen === 'true' && !savedUser && !auth.currentUser) {
         // Intro already seen
    }

    const savedReports = localStorage.getItem('street_pet_reports');
    if (savedReports) setReports(JSON.parse(savedReports));

    const savedDonations = localStorage.getItem('rescue_paw_donations');
    if (savedDonations) setDonations(JSON.parse(savedDonations));

    const savedPets = localStorage.getItem('rescue_paw_pets');
    if (savedPets) {
      setPets(JSON.parse(savedPets));
    } else {
      // Demo pets
      const demoPets: AdoptionPet[] = [
        {
          id: 'pet_1', name: 'Luna', age: '2 Years', gender: 'Female', breed: 'Indie Mix', type: AnimalType.DOG,
          photo: 'https://images.unsplash.com/photo-1544175282-9ce662bc239b?auto=format&fit=crop&q=80&w=800',
          description: 'Luna is a gentle soul rescued from a construction site.', healthStatus: 'Vaccinated, Sterilized', fee: '₹2000', isAdopted: false
        },
        {
          id: 'pet_2', name: 'Ginger', age: '8 Months', gender: 'Male', breed: 'Tabby', type: AnimalType.CAT,
          photo: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&q=80&w=800',
          description: 'Ginger is playful and curious.', healthStatus: 'Vaccinated', fee: '₹1000', isAdopted: false
        }
      ];
      setPets(demoPets);
      localStorage.setItem('rescue_paw_pets', JSON.stringify(demoPets));
    }
    
    setIsInitialized(true);

    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 2800);

    return () => {
        clearTimeout(timer);
        unsubscribe();
    }
  }, []);

  const login = (user: User) => {
    // This is primarily for the manual demo login flow.
    // Real Firebase login updates state via onAuthStateChanged.
    setCurrentUser(user);
    localStorage.setItem('rescue_paw_current_user', JSON.stringify(user));
  };

  const logout = async () => {
    try {
        await signOut(auth); // Firebase Logout
    } catch (e) {
        console.error("Firebase signout failed", e);
    }
    
    setCurrentUser(null);
    localStorage.removeItem('rescue_paw_current_user');
    localStorage.removeItem('rescue_paw_language');
    setShowIntro(true); // Reset intro on logout so it shows again or goes to login
    localStorage.removeItem('intro_seen'); // Optional: reset seen state
  };
  
  const deleteAllData = () => {
    localStorage.removeItem('rescue_paw_current_user');
    localStorage.removeItem('street_pet_reports');
    localStorage.removeItem('rescue_paw_donations');
    localStorage.removeItem('rescue_paw_users');
    localStorage.removeItem('rescue_paw_pets'); 
    localStorage.removeItem('privacy_chat_history');
    localStorage.removeItem('privacy_private_mode');
    localStorage.removeItem('privacy_data_consent');
    localStorage.removeItem('rescue_paw_language');
    localStorage.removeItem('intro_seen');
    logout();
  };

  const updateUser = (updatedUser: User) => {
    setCurrentUser(updatedUser);
    localStorage.setItem('rescue_paw_current_user', JSON.stringify(updatedUser));
    
    const privateMode = localStorage.getItem('privacy_private_mode') === 'true';
    if (privateMode) return;

    const users = JSON.parse(localStorage.getItem('rescue_paw_users') || '[]');
    const userIndex = users.findIndex((u: any) => u.id === updatedUser.id);
    if (userIndex > -1) {
      const oldUser = users[userIndex];
      users[userIndex] = { ...oldUser, ...updatedUser };
      localStorage.setItem('rescue_paw_users', JSON.stringify(users));
    }
  };
  
  const deleteUser = (userId: string) => {
    const users = JSON.parse(localStorage.getItem('rescue_paw_users') || '[]');
    const updatedUsers = users.filter((u: any) => u.id !== userId);
    localStorage.setItem('rescue_paw_users', JSON.stringify(updatedUsers));
    logout();
  };

  const addReport = (report: EmergencyReport) => {
    const newReports = [{ ...report, reporterId: currentUser?.id || 'anonymous' }, ...reports];
    setReports(newReports);
    const privateMode = localStorage.getItem('privacy_private_mode') === 'true';
    if (!privateMode) {
      localStorage.setItem('street_pet_reports', JSON.stringify(newReports));
    }
  };

  const addDonation = (donationData: Omit<Donation, 'id'|'donorId'|'donorName'|'timestamp'|'status'|'claimedBy'>) => {
    if (!currentUser) return;
    const newDonation: Donation = {
      ...donationData,
      id: Math.random().toString(36).substr(2, 9),
      donorId: currentUser.id,
      donorName: currentUser.organization || currentUser.name,
      timestamp: Date.now(),
      status: DonationStatus.AVAILABLE,
    };
    const newDonations = [newDonation, ...donations];
    setDonations(newDonations);
    const privateMode = localStorage.getItem('privacy_private_mode') === 'true';
    if (!privateMode) {
      localStorage.setItem('rescue_paw_donations', JSON.stringify(newDonations));
    }
  };

  const updateDonation = (id: string, newStatus: DonationStatus) => {
    if (!currentUser) return;
    const newDonations = donations.map(d => {
      if (d.id === id) {
        const updatedDonation: Donation = { ...d, status: newStatus };
        if (newStatus === DonationStatus.CLAIMED) {
          updatedDonation.claimedBy = { id: currentUser.id, name: currentUser.organization || currentUser.name };
        }
        return updatedDonation;
      }
      return d;
    });
    setDonations(newDonations);
    const privateMode = localStorage.getItem('privacy_private_mode') === 'true';
    if (!privateMode) {
      localStorage.setItem('rescue_paw_donations', JSON.stringify(newDonations));
    }
  };

  const updateReport = (id: string, newStatus: EmergencyReport['status'], updateText?: string, recoveryPhoto?: string, adoptionPetId?: string) => {
    const newReports = reports.map(r => {
      if (r.id === id) {
        const newReport: EmergencyReport = { ...r, status: newStatus };
        
        const autoMessage: { [key in ReportStatus]?: string } = {
          [ReportStatus.QUEUED]: 'Due to high volume, this case is currently in the rescue queue. We are searching for the next available responder.',
          [ReportStatus.ACCEPTED]: 'The case has been accepted. A volunteer is being assigned.',
          [ReportStatus.RESCUED]: 'The animal has been secured and is in transit to a medical facility.',
          [ReportStatus.TREATED]: 'The animal has received medical care and is now recovering.',
        };

        const text = updateText || autoMessage[newStatus];
        
        if (text && currentUser) {
          const newUpdate: ReportUpdate = {
            timestamp: Date.now(),
            text,
            authorId: currentUser.id,
            authorName: currentUser.name,
            authorRole: currentUser.role,
          };
          newReport.updates = [...(r.updates || []), newUpdate];
        }

        if (recoveryPhoto) {
          newReport.recoveryPhoto = recoveryPhoto;
        }

        if (adoptionPetId) {
          newReport.adoptionPetId = adoptionPetId;
        }

        return newReport;
      }
      return r;
    });
    setReports(newReports);
    const privateMode = localStorage.getItem('privacy_private_mode') === 'true';
    if (!privateMode) {
      localStorage.setItem('street_pet_reports', JSON.stringify(newReports));
    }
  };

  const listForAdoption = (petData: AdoptionPet, reportId: string) => {
    const newPets = [petData, ...pets];
    setPets(newPets);
    updateReport(reportId, ReportStatus.TREATED, "Animal has been listed for adoption.", undefined, petData.id);
    const privateMode = localStorage.getItem('privacy_private_mode') === 'true';
    if (!privateMode) {
      localStorage.setItem('rescue_paw_pets', JSON.stringify(newPets));
    }
  };

  const declineReport = (id: string) => {
    if (!currentUser) return;
    const newReports = reports.map(r => {
      if (r.id === id) {
        const declinedBy = [...(r.declinedBy || []), currentUser.id];
        // For demo purposes, if it's declined by anyone, we move it to QUEUED
        // In a real app, you might check if there are other NGOs nearby first
        const newStatus = ReportStatus.QUEUED;
        
        const newReport: EmergencyReport = { 
          ...r, 
          status: newStatus,
          declinedBy
        };

        const newUpdate: ReportUpdate = {
          timestamp: Date.now(),
          text: `Responder ${currentUser.organization || currentUser.name} is currently at capacity. Case moved to priority queue.`,
          authorId: 'system',
          authorName: 'REScue System',
          authorRole: 'NGO',
        };
        newReport.updates = [...(r.updates || []), newUpdate];
        
        return newReport;
      }
      return r;
    });
    setReports(newReports);
    localStorage.setItem('street_pet_reports', JSON.stringify(newReports));
  };

  const adoptPet = (petId: string, adopterId: string, adopterName: string) => {
    const newPets = pets.map(p => {
      if (p.id === petId) {
        return {
          ...p,
          isAdopted: true,
          adopterId,
          adopterName,
          adoptionDate: Date.now()
        };
      }
      return p;
    });
    setPets(newPets);
    const privateMode = localStorage.getItem('privacy_private_mode') === 'true';
    if (!privateMode) {
      localStorage.setItem('rescue_paw_pets', JSON.stringify(newPets));
    }
  };

  const handleIntroComplete = (targetPath: string) => {
    setShowIntro(false);
    localStorage.setItem('intro_seen', 'true');
    navigate(targetPath);
  };

  if (!isInitialized) return null;

  return (
      <div className="flex min-h-screen bg-gray-50/50">
        {showSplash && <SplashScreen />}
        
        {/* Intro Screen Logic: Show after splash, before login, if not logged in */}
        {!showSplash && !currentUser && showIntro ? (
          <IntroStoryScreen onComplete={handleIntroComplete} />
        ) : (
          currentUser ? (
          <>
            {/* Desktop Sidebar */}
            <aside className="hidden md:flex flex-col w-72 bg-white border-r border-gray-100 h-screen sticky top-0 z-40 p-6 shadow-sm">
              <Link to="/" className="flex items-center gap-3 mb-10 px-2">
                <div className="p-2.5 bg-emerald-600 rounded-xl shadow-lg shadow-emerald-200">
                  <PawPrint className="w-6 h-6 text-white" />
                </div>
                <span className="font-extrabold text-gray-800 text-xl tracking-tight italic">REScue <span className="text-emerald-600">Paw</span></span>
              </Link>
              
              <nav className="flex-1 space-y-2">
                <SidebarLink to="/" icon={Home} label={t('home')} />
                <SidebarLink 
                  to={currentUser.role === 'CITIZEN' ? '/status-overview' : '/dashboard'} 
                  icon={LayoutDashboard} 
                  label={currentUser.role === 'CITIZEN' ? t('myCases') : t('dashboard')} 
                />
                <SidebarLink to="/report" icon={PlusCircle} label={t('reportEmergency')} highlight />
                
                {currentUser.role === 'VOLUNTEER' || currentUser.role === 'NGO' ? (
                  <SidebarLink to="/food-donations" icon={Soup} label={t('foodBank')} />
                ) : (
                  <SidebarLink to="/donate" icon={Bone} label={t('donateFood')} />
                )}
                
                <SidebarLink to="/adoption" icon={Heart} label={t('adoption')} />

                <SidebarLink to="/profile" icon={UserCircle} label={t('profile')} />
              </nav>

              <div className="pt-6 border-t border-gray-50 mt-auto">
                <Link to="/profile" className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-gray-50 transition-colors mb-2">
                  <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-700 font-bold border-2 border-white shadow-sm overflow-hidden">
                    {currentUser.avatar ? (
                      <img src={currentUser.avatar} alt="User Avatar" className="w-full h-full object-cover" />
                    ) : (
                      currentUser.name[0]
                    )}
                  </div>
                  <div className="flex-1 min-w-0 text-left">
                    <p className="text-sm font-bold text-gray-900 truncate">{currentUser.name}</p>
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">{currentUser.role}</p>
                  </div>
                </Link>
                <button 
                  onClick={logout}
                  className="w-full flex items-center gap-3 px-4 py-3 text-gray-500 hover:bg-rose-50 hover:text-rose-600 rounded-xl transition-colors text-xs font-bold uppercase tracking-widest"
                >
                  <LogOut className="w-4 h-4" /> {t('signOut')}
                </button>
              </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
              {/* Mobile Header */}
              <header className="md:hidden px-6 py-4 bg-white border-b flex justify-between items-center sticky top-0 z-30">
                <Link to="/" className="flex items-center gap-2">
                  <div className="p-2 bg-emerald-600 rounded-lg">
                    <PawPrint className="w-5 h-5 text-white" />
                  </div>
                  <span className="font-bold text-gray-800 text-lg leading-tight tracking-tight italic">REScue <span className="text-emerald-600">Paw</span></span>
                </Link>
                <div className="flex items-center gap-3">
                  <Link to="/profile" className="flex flex-col items-end">
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-tighter leading-none">{currentUser.role}</span>
                    <span className="text-xs font-semibold text-gray-800 leading-tight">{currentUser.name.split(' ')[0]}</span>
                  </Link>
                  <button 
                    onClick={logout}
                    className="p-2 bg-gray-50 rounded-full border text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
                    title="Logout"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </header>

              <main className="flex-1 overflow-y-auto scroll-smooth">
                <div className="w-full max-w-7xl mx-auto md:p-8">
                  <Routes>
                    <Route path="/" element={<HomeScreen role={currentUser.role} reports={reports} donations={donations} />} />
                    <Route path="/report" element={<ReportScreen onReport={addReport} currentUser={currentUser} reports={reports} />} />
                    <Route path="/dashboard" element={<DashboardScreen reports={reports} onUpdate={updateReport} onDecline={declineReport} currentUser={currentUser} pets={pets} onListForAdoption={listForAdoption} />} />
                    <Route path="/profile" element={<ProfileScreen user={currentUser} reports={reports} pets={pets} onLogout={logout} onUpdateUser={updateUser} onDeleteUser={deleteUser} onDeleteAllData={deleteAllData} />} />
                    <Route path="/status/:id" element={<StatusScreen reports={reports} currentUser={currentUser}/>} />
                    <Route path="/donate" element={<DonationScreen onDonate={addDonation} currentUser={currentUser} />} />
                    <Route path="/food-donations" element={<FoodDonationsScreen donations={donations} onUpdateDonation={updateDonation} currentUser={currentUser} />} />
                    <Route 
                      path="/adoption" 
                      element={<AdoptionScreen pets={pets} currentUser={currentUser} reports={reports} onListForAdoption={listForAdoption} />} 
                    />
                    <Route path="/adoption/apply/:petId" element={<AdoptionFormScreen currentUser={currentUser} pets={pets} onAdopt={adoptPet} />} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                </div>
              </main>

              {/* Mobile Bottom Nav */}
              <nav className="md:hidden fixed bottom-0 left-0 w-full bg-white border-t px-6 py-3 flex justify-around items-center safe-bottom z-50">
                <Link to="/" className="flex flex-col items-center gap-1 text-gray-600 hover:text-emerald-500 active:text-emerald-600">
                  <Home className="w-6 h-6" />
                  <span className="text-[10px] font-medium uppercase tracking-wider">{t('home')}</span>
                </Link>
                <Link to="/adoption" className="flex flex-col items-center gap-1 text-gray-600 hover:text-emerald-500 active:text-emerald-600">
                  <Heart className="w-6 h-6" />
                  <span className="text-[10px] font-medium uppercase tracking-wider">{t('adoption')}</span>
                </Link>
                <Link to="/report" className="flex flex-col items-center -mt-8">
                  <div className="w-14 h-14 bg-emerald-600 rounded-full flex items-center justify-center shadow-lg shadow-emerald-200 border-4 border-white transform transition-transform active:scale-95 hover:scale-105 hover:shadow-emerald-300">
                    <PlusCircle className="w-8 h-8 text-white" />
                  </div>
                  <span className="text-[10px] font-bold text-emerald-600 mt-1 uppercase">{t('report')}</span>
                </Link>
                {currentUser.role === 'VOLUNTEER' || currentUser.role === 'NGO' ? (
                  <Link to="/food-donations" className="flex flex-col items-center gap-1 text-gray-600 hover:text-amber-500 active:text-amber-600">
                    <Soup className="w-6 h-6" />
                    <span className="text-[10px] font-medium uppercase tracking-wider">{t('food')}</span>
                  </Link>
                ) : (
                  <Link to="/donate" className="flex flex-col items-center gap-1 text-gray-600 hover:text-amber-500 active:text-amber-600">
                    <Bone className="w-6 h-6" />
                    <span className="text-[10px] font-medium uppercase tracking-wider">{t('donate')}</span>
                  </Link>
                )}
              </nav>

              <ChatAssistant />
            </div>
          </>
        ) : (
          !showSplash && (
            <div className="w-full min-h-screen flex bg-gray-50">
              {/* Left Panel - Storytelling on Login */}
              <div className="hidden md:block w-1/2 relative bg-black overflow-hidden">
                 <AuthSidePanel />
              </div>
              
              {/* Right Panel - Auth Forms */}
              <div className="w-full md:w-1/2 flex items-center justify-center p-6 md:p-12 relative">
                <div className="w-full max-w-md bg-white md:rounded-[2.5rem] md:shadow-2xl md:shadow-emerald-50 md:p-8 overflow-hidden border border-transparent md:border-gray-100">
                  <Routes>
                    <Route path="/login" element={<LoginScreen onLogin={login} />} />
                    <Route path="/register" element={<RegisterScreen onRegister={login} />} />
                    <Route path="*" element={<Navigate to="/login" replace />} />
                  </Routes>
                </div>
              </div>
            </div>
          )
        ))}

        <div className="fixed bottom-0 right-0 md:left-72 left-0 pointer-events-none z-10 hidden md:block">
          <div className="bg-gray-900 text-[10px] text-gray-300 text-center py-2 px-6 rounded-tl-2xl inline-block ml-auto pointer-events-auto">
            Not a replacement for professional veterinary care.
          </div>
        </div>
      </div>
  );
};

const App: React.FC = () => (
  <Router>
    <LanguageProvider>
      <AppContent />
    </LanguageProvider>
  </Router>
);

// Sidebar Helper Component
const SidebarLink = ({ to, icon: Icon, label, highlight = false }: { to: string, icon: any, label: string, highlight?: boolean }) => {
  const location = useLocation();
  const isActive = location.pathname === to || location.pathname.startsWith(to + '/');
  
  return (
    <Link to={to} className={`flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all font-bold text-sm group ${
      isActive || highlight
        ? highlight ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200' : 'bg-emerald-50 text-emerald-700' 
        : 'text-gray-700 hover:bg-gray-50 hover:text-emerald-600'
    }`}>
      <Icon className={`w-5 h-5 ${highlight ? 'text-white' : (isActive ? 'text-emerald-600' : 'text-gray-500 group-hover:text-emerald-500')}`} />
      {label}
      {isActive && !highlight && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-600" />}
    </Link>
  );
};

export default App;
