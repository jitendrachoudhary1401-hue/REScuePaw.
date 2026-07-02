
import React, { useState, useRef, useEffect } from 'react';
import { User, EmergencyReport, UserRole, ReportStatus, AdoptionPet } from '../types';
import { 
  User as UserIcon, 
  Settings, 
  ChevronRight, 
  LogOut, 
  Heart, 
  Award, 
  Lock, 
  History, 
  ArrowLeft,
  Info,
  Camera,
  Trash2,
  AlertTriangle,
  X,
  Loader2,
  PawPrint,
  HeartHandshake,
  DatabaseZap,
  Palette,
  BarChart3,
  LifeBuoy,
  Mail,
  Phone,
  ChevronDown,
  Languages,
  MessageCircle,
  EyeOff,
  Database,
  ShieldCheck,
  Star,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import ScrollyTyping from '../components/ScrollyTyping';

interface ProfileScreenProps {
  user: User;
  reports: EmergencyReport[];
  pets?: AdoptionPet[]; 
  onLogout: () => void;
  onUpdateUser: (user: User) => void;
  onDeleteUser: (userId: string) => void;
  onDeleteAllData: () => void;
}

type ProfileView = 'main' | 'history' | 'privacy' | 'settings' | 'about' | 'help' | 'adoptions';

// Extract SettingsRow outside to prevent re-mounting issues
const SettingsRow = ({ label, value, onEdit }: { label: string, value: string, onEdit: () => void }) => {
  const { t } = useLanguage();
  return (
    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
      <div>
        <p className="text-[10px] font-bold text-gray-500">{label}</p>
        <p className="text-sm font-medium text-gray-800">{value}</p>
      </div>
      <button onClick={onEdit} className="text-xs font-bold text-emerald-600 hover:underline">{t('edit')}</button>
    </div>
  );
};

const ProfileScreen: React.FC<ProfileScreenProps> = ({ user, reports, pets = [], onLogout, onUpdateUser, onDeleteUser, onDeleteAllData }) => {
  const [currentView, setCurrentView] = useState<ProfileView>('main');
  const { t } = useLanguage();
  
  // States for modals and forms
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState<'name' | 'email' | 'phone' | 'password' | 'delete' | null>(null);
  
  const [formData, setFormData] = useState({ 
    name: user.name, 
    email: user.email, 
    phone: user.phone || '',
    password: '' 
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const userReports = reports.filter(r => r.reporterId === user.id);
  const handledReports = reports.filter(r => r.status !== ReportStatus.REPORTED && user.role !== 'CITIZEN');
  const displayReports = user.role === 'CITIZEN' ? userReports : handledReports;
  const totalImpact = reports.length * 12 + userReports.length * 50;
  
  const myAdoptions = pets.filter(p => p.adopterId === user.id);
  const ngoAdoptions = pets.filter(p => p.isAdopted); 

  const roleLabels: Record<UserRole, string> = {
    CITIZEN: t('role_CITIZEN'), 
    VOLUNTEER: t('role_VOLUNTEER'), 
    NGO: t('role_NGO'), 
    VET: t('role_VET'),
  };

  const menuItems = [
    { id: 'history' as ProfileView, icon: History, label: t('caseHistory'), sub: t('caseHistorySub') },
    { id: 'adoptions' as ProfileView, icon: Heart, label: user.role === 'CITIZEN' ? 'My Adoptions' : 'Adoption Records', sub: user.role === 'CITIZEN' ? 'Your adopted pets' : 'Track successful adoptions' },
    { id: 'settings' as ProfileView, icon: Settings, label: t('accountSettings'), sub: t('accountSettingsSub') },
    { id: 'privacy' as ProfileView, icon: Lock, label: t('privacySecurity'), sub: t('privacySecuritySub') },
    { id: 'about' as ProfileView, icon: Info, label: t('aboutApp'), sub: t('aboutAppSub') },
    { id: 'help' as ProfileView, icon: LifeBuoy, label: t('helpContact'), sub: t('helpContactSub') },
  ];
  
  const openModal = (content: 'name' | 'email' | 'phone' | 'password' | 'delete') => {
    setModalContent(content);
    setIsModalOpen(true);
    setFormData({ 
      name: user.name, 
      email: user.email, 
      phone: user.phone || '',
      password: '' 
    });
  };
  
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };
  
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onUpdateUser({ ...user, avatar: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleRemoveAvatar = () => {
    const { avatar, ...userWithoutAvatar } = user;
    onUpdateUser(userWithoutAvatar);
  };

  const handleSaveChanges = () => {
    setIsLoading(true);
    setTimeout(() => { 
      const updates: User = { ...user };
      
      if (modalContent === 'name') updates.name = formData.name;
      if (modalContent === 'email') updates.email = formData.email;
      if (modalContent === 'phone') updates.phone = formData.phone;
      if (modalContent === 'password' && formData.password) updates.password = formData.password;

      onUpdateUser(updates);
      setIsLoading(false);
      setIsModalOpen(false);
    }, 800);
  };
  
  const handleDeleteAccount = () => {
    setIsLoading(true);
    setTimeout(() => {
      onDeleteUser(user.id);
    }, 1200);
  };

  // Render modal content as a function to avoid re-mount issues
  const renderSettingsModal = () => {
    if (!isModalOpen) return null;
    
    const titles = {
      name: 'Change Your Name', email: 'Update Email Address', phone: 'Update Phone Number',
      password: 'Change Password', delete: 'Delete Account'
    };
    
    return (
      <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setIsModalOpen(false)}>
        <div className="bg-white rounded-[2rem] w-full max-w-md shadow-2xl p-6" onClick={e => e.stopPropagation()}>
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-800 text-gray-900">{titles[modalContent!]}</h3>
            <button onClick={() => setIsModalOpen(false)} className="p-2 text-gray-500 hover:bg-gray-100 rounded-full"><X/></button>
          </div>
          <div className="space-y-4">
            {modalContent === 'name' && (
              <input 
                type="text" 
                name="name" 
                value={formData.name} 
                onChange={handleFormChange} 
                placeholder="Full Name" 
                className="w-full bg-gray-50 p-3 rounded-xl border-gray-200 focus:ring-2 focus:ring-emerald-500 outline-none" 
              />
            )}
            {modalContent === 'email' && (
              <input 
                type="email" 
                name="email" 
                value={formData.email} 
                onChange={handleFormChange} 
                placeholder="Email Address" 
                className="w-full bg-gray-50 p-3 rounded-xl border-gray-200 focus:ring-2 focus:ring-emerald-500 outline-none" 
              />
            )}
            {modalContent === 'phone' && (
              <input 
                type="tel" 
                name="phone" 
                value={formData.phone} 
                onChange={handleFormChange} 
                placeholder="Mobile Number" 
                className="w-full bg-gray-50 p-3 rounded-xl border-gray-200 focus:ring-2 focus:ring-emerald-500 outline-none" 
              />
            )}
            {modalContent === 'password' && (
              <div className="space-y-2">
                 <input 
                  type="password" 
                  name="password" 
                  value={formData.password} 
                  onChange={handleFormChange} 
                  placeholder="Enter New Password" 
                  className="w-full bg-gray-50 p-3 rounded-xl border-gray-200 focus:ring-2 focus:ring-emerald-500 outline-none" 
                />
                <p className="text-xs text-gray-500 px-1">Ensure it is at least 6 characters long.</p>
              </div>
            )}
            
            {modalContent === 'delete' && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl space-y-3 text-center">
                 <AlertTriangle className="w-10 h-10 text-red-500 mx-auto" />
                 <p className="text-sm font-bold text-red-800">Are you sure you want to delete your account?</p>
                 <p className="text-xs text-red-700">This action is irreversible. Your account will be removed from this device.</p>
              </div>
            )}
            
            {modalContent !== 'delete' ? (
              <button 
                onClick={handleSaveChanges} 
                disabled={isLoading || (modalContent === 'password' && formData.password.length < 3)} 
                className="w-full bg-emerald-600 text-white font-bold py-3 rounded-xl flex items-center justify-center disabled:bg-gray-300 shadow-lg shadow-emerald-100"
              >
                {isLoading ? <Loader2 className="animate-spin" /> : 'Save Changes'}
              </button>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <button onClick={() => setIsModalOpen(false)} disabled={isLoading} className="w-full bg-gray-100 text-gray-700 font-bold py-3 rounded-xl">Cancel</button>
                <button onClick={handleDeleteAccount} disabled={isLoading} className="w-full bg-red-600 text-white font-bold py-3 rounded-xl flex items-center justify-center">
                   {isLoading ? <Loader2 className="animate-spin" /> : 'Yes, Delete'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };
  
  const SettingsScreen = () => {
    const { language, setLanguage, t } = useLanguage();

    return (
      <div className="p-6 md:p-0 space-y-6 animate-in slide-in-from-right-4 duration-500 pb-10">
        <div className="flex items-center gap-4">
          <button onClick={() => setCurrentView('main')} className="p-3 bg-white border border-gray-100 rounded-full shadow-sm hover:text-emerald-600 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-800 text-gray-900 tracking-tight">{t('accountSettingsTitle')}</h1>
            <p className="text-[10px] text-emerald-600 font-800 uppercase tracking-widest">{t('manageYourProfile')}</p>
          </div>
        </div>
        <div className="bg-white border border-gray-100 rounded-[2.5rem] p-6 shadow-sm space-y-6">
          <div>
            <h3 className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-widest mb-2"><Languages className="w-4 h-4" /> {t('languageTitle')}</h3>
            <p className="text-xs text-gray-400 mb-3">{t('languageDescription')}</p>
            <div className="grid grid-cols-2 gap-3 p-1 bg-gray-50 rounded-2xl">
              <button onClick={() => setLanguage('en')} className={`py-3 rounded-[1.2rem] text-sm font-bold transition-colors ${language === 'en' ? 'bg-white text-emerald-600 shadow-md' : 'text-gray-500 hover:bg-white/50'}`}>
                English
              </button>
              <button onClick={() => setLanguage('hi')} className={`py-3 rounded-[1.2rem] text-sm font-bold transition-colors ${language === 'hi' ? 'bg-white text-emerald-600 shadow-md' : 'text-gray-500 hover:bg-white/50'}`}>
                हिन्दी
              </button>
            </div>
          </div>

          <div>
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">{t('personalInformation')}</h3>
            <div className="space-y-2">
              <SettingsRow label={t('name')} value={user.name} onEdit={() => openModal('name')} />
              <SettingsRow label={t('email')} value={user.email} onEdit={() => openModal('email')} />
              <SettingsRow label={t('phone')} value={user.phone || 'Not provided'} onEdit={() => openModal('phone')} />
            </div>
          </div>
          <div>
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">{t('security')}</h3>
            <SettingsRow label={t('password')} value="••••••••" onEdit={() => openModal('password')} />
          </div>
          <div className="pt-4 mt-4 border-t border-gray-100">
            <h3 className="text-xs font-bold text-red-500 uppercase tracking-widest mb-2">{t('dangerZone')}</h3>
            <button onClick={() => openModal('delete')} className="w-full text-left p-4 rounded-2xl bg-red-50 border border-red-100 text-red-700 font-bold text-sm hover:bg-red-100 transition-colors">{t('deleteMyAccount')}</button>
          </div>
        </div>
      </div>
    );
  };
  
  const AboutScreen = () => (
    <div className="p-6 md:p-0 space-y-6 animate-in slide-in-from-right-4 duration-500 pb-10">
        <div className="flex items-center gap-4">
          <button onClick={() => setCurrentView('main')} className="p-3 bg-white border border-gray-100 rounded-full shadow-sm hover:text-emerald-600 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-800 text-gray-900 tracking-tight">About REScue Paw</h1>
            <p className="text-[10px] text-emerald-600 font-800 uppercase tracking-widest">Our Story & Mission</p>
          </div>
        </div>
        <div className="bg-white border border-gray-100 rounded-[2.5rem] p-8 shadow-sm space-y-8">
           <div className="flex flex-col items-center text-center">
             <div className="p-4 bg-emerald-600 rounded-3xl mb-4 shadow-lg shadow-emerald-200">
               <PawPrint className="w-8 h-8 text-white" />
             </div>
             
             {/* ScrollyTyping Effect for the Hero Text */}
             <ScrollyTyping 
                text="Healing Street Souls, One Paw at a Time." 
                className="text-2xl font-800 mb-4 block" 
                highlightColor="text-gray-900" 
                baseColor="text-gray-300"
                as="h2"
                threshold={0.7}
             />
             
             <ScrollyTyping 
                text="REScue Paw was born from a shared passion for animal welfare and a belief in the power of technology to create change. Our platform is sustained through a transparent model: veterinary clinics pay a small subscription fee for our triage software, and a 5% transaction fee on user donations helps keep our servers running, ensuring 95% goes directly to the animals."
                className="text-sm font-medium mt-2 max-w-xl leading-relaxed"
                highlightColor="text-gray-600"
                baseColor="text-gray-200"
                threshold={0.6}
             />
           </div>
           
           <div className="space-y-6 pt-6 border-t border-gray-100">
             <h3 className="text-center text-sm font-bold text-gray-500 uppercase tracking-widest">Meet The Team</h3>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <TeamMemberCard 
                  icon={DatabaseZap} 
                  name="Jitendra Choudhary"
                  role="Data Security & Backend Lead"
                  bio="Jitendra is the architect of our secure and scalable backend. He ensures that every piece of sensitive information is protected, building the trustworthy foundation upon which our entire rescue network operates."
                />
                <TeamMemberCard 
                  icon={Palette} 
                  name="Saniya Indulkar"
                  role="UI/UX Designer"
                  bio="Saniya is the creative mind behind our app's intuitive and empathetic design. She translates complex rescue workflows into a seamless, user-friendly experience, ensuring anyone can become a hero for an animal."
                />
                <TeamMemberCard 
                  icon={BarChart3} 
                  name="Rupesh Gore"
                  role="Frontend & Data Analyst"
                  bio="Rupesh brings our vision to life on your screen and uncovers stories in our data. He develops the responsive frontend and analyzes rescue data to significantly reduce response times and measure our collective impact."
                />
             </div>
           </div>
        </div>
    </div>
  );
  
  const PrivacyScreen = () => {
    const { t } = useLanguage();
    const [chatHistoryEnabled, setChatHistoryEnabled] = useState(localStorage.getItem('privacy_chat_history') !== 'false');
    const [privateModeEnabled, setPrivateModeEnabled] = useState(localStorage.getItem('privacy_private_mode') === 'true');
    const [dataConsentGiven, setDataConsentGiven] = useState(localStorage.getItem('privacy_data_consent') === 'true');
    
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deleteConfirmationText, setDeleteConfirmationText] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);
    
    const handleToggle = (setter: React.Dispatch<React.SetStateAction<boolean>>, key: string) => (value: boolean) => {
      setter(value);
      localStorage.setItem(key, String(value));
      window.dispatchEvent(new Event('storage'));
    };

    const handleDeleteAllData = () => {
      if (deleteConfirmationText === 'ERASE') {
        setIsDeleting(true);
        setTimeout(() => {
          onDeleteAllData();
        }, 1200);
      }
    };
    
    return (
      <>
        <div className="p-6 md:p-0 space-y-6 animate-in slide-in-from-right-4 duration-500 pb-10">
          <div className="flex items-center gap-4">
            <button onClick={() => setCurrentView('main')} className="p-3 bg-white border border-gray-100 rounded-full shadow-sm hover:text-emerald-600 transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-xl font-800 text-gray-900 tracking-tight">{t('privacySecurityTitle')}</h1>
              <p className="text-[10px] text-emerald-600 font-800 uppercase tracking-widest">{t('privacySecurityDesc')}</p>
            </div>
          </div>
          <div className="bg-white border border-gray-100 rounded-[2.5rem] p-6 shadow-sm space-y-4">
             <PrivacyToggleRow icon={MessageCircle} label={t('chatHistory')} description={t('chatHistoryDesc')} enabled={chatHistoryEnabled} onToggle={handleToggle(setChatHistoryEnabled, 'privacy_chat_history')} />
             <PrivacyToggleRow icon={EyeOff} label={t('privateMode')} description={t('privateModeDesc')} enabled={privateModeEnabled} onToggle={handleToggle(setPrivateModeEnabled, 'privacy_private_mode')} />
             <PrivacyToggleRow icon={Database} label={t('dataConsent')} description={t('dataConsentDesc')} enabled={dataConsentGiven} onToggle={handleToggle(setDataConsentGiven, 'privacy_data_consent')} />
          </div>
           <div className="bg-white border border-gray-100 rounded-[2.5rem] p-6 shadow-sm">
             <h3 className="text-xs font-bold text-red-500 uppercase tracking-widest mb-2">{t('dangerZone')}</h3>
             <button onClick={() => setIsDeleteModalOpen(true)} className="w-full text-left p-4 rounded-2xl bg-red-50 border border-red-100 text-red-700 font-bold text-sm hover:bg-red-100 transition-colors flex items-center justify-between">
                <div>
                  <p>{t('deleteAllData')}</p>
                  <p className="text-xs font-medium text-red-600">{t('deleteAllDataDesc')}</p>
                </div>
                <Trash2 className="w-5 h-5" />
             </button>
           </div>
        </div>
        
        {isDeleteModalOpen && (
          <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setIsDeleteModalOpen(false)}>
            <div className="bg-white rounded-[2rem] w-full max-w-md shadow-2xl p-6" onClick={e => e.stopPropagation()}>
              <div className="text-center">
                 <AlertTriangle className="w-12 h-12 text-red-500 mx-auto" />
                 <h3 className="text-lg font-800 text-gray-900 mt-4">{t('deleteAllDataConfirmationTitle')}</h3>
                 <p className="text-xs text-red-700 mt-2">{t('deleteAllDataConfirmationText')}</p>
                 <input type="text" value={deleteConfirmationText} onChange={e => setDeleteConfirmationText(e.target.value)} placeholder={t('erasePlaceholder')} className="w-full text-center p-2 mt-4 rounded-lg border-red-300 font-bold tracking-widest" />
              </div>
              <div className="grid grid-cols-2 gap-3 mt-6">
                <button onClick={() => setIsDeleteModalOpen(false)} className="w-full bg-gray-100 text-gray-700 font-bold py-3 rounded-xl">{t('cancel')}</button>
                <button onClick={handleDeleteAllData} disabled={deleteConfirmationText !== 'ERASE' || isDeleting} className="w-full bg-red-600 text-white font-bold py-3 rounded-xl disabled:bg-red-300 flex items-center justify-center">
                  {isDeleting ? <Loader2 className="animate-spin" /> : t('confirm')}
                </button>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  const PrivacyToggleRow = ({ icon: Icon, label, description, enabled, onToggle }: { icon: React.ElementType, label: string, description: string, enabled: boolean, onToggle: (enabled: boolean) => void }) => (
    <div className="flex items-start gap-4 p-4 rounded-2xl transition-colors hover:bg-gray-50">
      <div className="p-2.5 bg-gray-100 rounded-xl"><Icon className="w-5 h-5 text-gray-500"/></div>
      <div className="flex-1">
         <p className="text-sm font-bold text-gray-900">{label}</p>
         <p className="text-xs text-gray-500 leading-relaxed mt-1">{description}</p>
      </div>
      <button onClick={() => onToggle(!enabled)} className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${enabled ? 'bg-emerald-600' : 'bg-gray-200'}`}>
        <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${enabled ? 'translate-x-5' : 'translate-x-0'}`}/>
      </button>
    </div>
  );

  const HelpScreen = () => {
    const [openFaq, setOpenFaq] = useState<number | null>(null);

    const faqs = [
      { q: "How does the AI injury analysis work?", a: "Our system uses a powerful vision model trained to identify animals, assess their condition, and recognize potential injuries from a photo. It provides a preliminary triage to help rescuers understand the urgency, but it is not a substitute for professional veterinary diagnosis." },
      { q: "How can I become a verified volunteer?", a: "After registering as a volunteer, our team will review your profile. You may be contacted for a brief verification process. Once approved, you'll start receiving emergency alerts in your area. Thank you for your interest!" },
      { q: "Is my data safe?", a: "Absolutely. We prioritize your privacy and security. All personal information and report data are encrypted and stored securely. We never share your data with third parties without your explicit consent. Please review our Privacy Policy for more details." },
      { q: "What should I do if I find an animal but my phone has no internet?", a: "Your safety comes first. If you're in an area with no connectivity, try to move to a location with a signal if it's safe to do so. Note the exact location and the animal's condition. You can submit the report as soon as you're back online. You can also try calling local animal services directly if you have their number saved." }
    ];

    return (
      <div className="p-6 md:p-0 space-y-6 animate-in slide-in-from-right-4 duration-500 pb-10">
        <div className="flex items-center gap-4">
          <button onClick={() => setCurrentView('main')} className="p-3 bg-white border border-gray-100 rounded-full shadow-sm hover:text-emerald-600 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-800 text-gray-900 tracking-tight">Help & Support</h1>
            <p className="text-[10px] text-emerald-600 font-800 uppercase tracking-widest">We're here for you</p>
          </div>
        </div>

        <div className="bg-white border border-gray-100 rounded-[2.5rem] p-6 shadow-sm space-y-6">
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest">Contact Information</h3>
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
              <div className="p-3 bg-white rounded-xl shadow-sm border border-gray-100"><UserIcon className="w-5 h-5 text-emerald-600"/></div>
              <div>
                <p className="text-[10px] font-bold text-gray-500">Contact Person</p>
                <p className="text-sm font-medium text-gray-800">Jitendra Choudhary</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <a href="mailto:jitendrachoudhary1401@gmail.com" className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100 hover:border-emerald-200 transition-colors group">
                <div className="p-3 bg-white rounded-xl shadow-sm border border-gray-100 group-hover:bg-emerald-50"><Mail className="w-5 h-5 text-emerald-600"/></div>
                <div>
                  <p className="text-[10px] font-bold text-gray-500">Email Us</p>
                  <p className="text-sm font-medium text-gray-800 group-hover:text-emerald-700 truncate">jitendrachoudhary1401@gmail.com</p>
                </div>
              </a>
              <a href="tel:8850321664" className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100 hover:border-emerald-200 transition-colors group">
                <div className="p-3 bg-white rounded-xl shadow-sm border border-gray-100 group-hover:bg-emerald-50"><Phone className="w-5 h-5 text-emerald-600"/></div>
                <div>
                  <p className="text-[10px] font-bold text-gray-500">Call Us</p>
                  <p className="text-sm font-medium text-gray-800 group-hover:text-emerald-700">8850321664</p>
                </div>
              </a>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-100 rounded-[2.5rem] p-6 shadow-sm space-y-2">
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Frequently Asked Questions</h3>
          {faqs.map((faq, index) => (
            <div key={index} className="border-b border-gray-100 last:border-b-0">
              <button onClick={() => setOpenFaq(openFaq === index ? null : index)} className="w-full flex justify-between items-center text-left py-4">
                <p className="text-sm font-bold text-gray-900 pr-4">{faq.q}</p>
                <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${openFaq === index ? 'rotate-180' : ''}`} />
              </button>
              {openFaq === index && (
                <div className="pb-4 text-xs text-gray-600 leading-relaxed animate-in fade-in duration-300 pr-6">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };
  
  const TeamMemberCard = ({ icon: Icon, name, role, bio }: { icon: React.ElementType, name: string, role: string, bio: string }) => (
    <div className="bg-gray-50 rounded-3xl p-6 text-center border border-gray-100 hover:shadow-lg hover:border-emerald-100 transition-all">
       <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 border border-gray-200 shadow-sm">
         <Icon className="w-8 h-8 text-emerald-600" />
       </div>
       <h4 className="font-800 text-gray-900">{name}</h4>
       <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">{role}</p>
       <p className="text-xs text-gray-600 leading-relaxed mt-3">{bio}</p>
    </div>
  );

  const HistoryView = ({ data, title, type }: { data: any[], title: string, type: 'report' | 'pet' }) => (
    <div className="p-6 md:p-0 space-y-6 animate-in slide-in-from-right-4 duration-500 pb-10">
      <div className="flex items-center gap-4">
        <button onClick={() => setCurrentView('main')} className="p-3 bg-white border border-gray-100 rounded-full shadow-sm hover:text-emerald-600 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-xl font-800 text-gray-900 tracking-tight">{title}</h1>
          <p className="text-[10px] text-emerald-600 font-800 uppercase tracking-widest">Your Records</p>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {data.length === 0 ? (
          <div className="col-span-full text-center py-20 bg-white rounded-[2.5rem] border border-dashed border-gray-200">
            <History className="w-12 h-12 text-gray-200 mx-auto mb-4" />
            <p className="text-sm font-bold text-gray-500 uppercase tracking-widest">No records yet</p>
          </div>
        ) : (
          data.map(item => (
            type === 'report' ? (
              <Link key={item.id} to={`/status/${item.id}`} className="block bg-white border border-gray-100 rounded-3xl p-4 shadow-sm hover:shadow-md transition-all">
                <div className="flex gap-4">
                  <img src={item.photo} alt="Case" className="w-20 h-20 rounded-2xl object-cover" />
                  <div>
                    <h4 className="text-sm font-800 text-gray-900">{item.animalType}</h4>
                    <p className="text-[10px] text-gray-600 mt-1 line-clamp-2 italic">"{item.notes || 'Emergency assistance'}"</p>
                  </div>
                </div>
              </Link>
            ) : (
              <div key={item.id} className="block bg-white border border-gray-100 rounded-3xl p-4 shadow-sm hover:shadow-md transition-all">
                 <div className="flex gap-4">
                    <img src={item.photo} alt={item.name} className="w-20 h-20 rounded-2xl object-cover" />
                    <div>
                      <h4 className="text-sm font-800 text-gray-900">{item.name}</h4>
                      <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-widest mt-1">Adopted {item.adoptionDate ? new Date(item.adoptionDate).toLocaleDateString() : ''}</p>
                      {type === 'pet' && user.role !== 'CITIZEN' && (
                        <p className="text-[10px] text-gray-500 mt-1">Adopter: {item.adopterName}</p>
                      )}
                    </div>
                 </div>
              </div>
            )
          ))
        )}
      </div>
    </div>
  );

  // Main Profile Content
  const MainProfileContent = () => (
      <div className="p-6 md:p-0 space-y-8 page-enter max-w-5xl mx-auto pb-28 md:pb-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          <div className="md:col-span-4 space-y-6">
            <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm text-center overflow-hidden card-lift spotlight-card">
              {/* Profile Hero Banner */}
              <div className="h-32 bg-gradient-to-br from-emerald-600 via-emerald-500 to-teal-500 relative">
                <div className="absolute inset-0 bg-white/10 blur-xl opacity-50 animate-pulse" />
                <div className="absolute inset-0 particles-bg opacity-30" />
                <button onClick={() => avatarInputRef.current?.click()} className="absolute top-4 right-4 p-2 bg-black/20 backdrop-blur-md rounded-full text-white hover:bg-black/40 transition-colors z-10">
                  <Camera className="w-4 h-4" />
                </button>
              </div>
              
              <div className="px-8 pb-8 relative">
                {/* Overlapping Avatar with Progress Ring */}
                <div className="relative inline-block -mt-16 mb-4 group">
                  <div className="relative w-32 h-32 rounded-[2rem] bg-white p-1.5 shadow-xl">
                    {/* SVG Radial Progress Background */}
                    <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="48" fill="none" stroke="#f3f4f6" strokeWidth="4" />
                      <circle cx="50" cy="50" r="48" fill="none" stroke="#10b981" strokeWidth="4" 
                        strokeDasharray="301.59" strokeDashoffset="75.39" className="transition-all duration-1000 ease-out" 
                      />
                    </svg>
                    
                    <div className="w-full h-full bg-emerald-50 rounded-[1.7rem] flex items-center justify-center overflow-hidden text-emerald-600 font-bold text-5xl relative z-10">
                       {user.avatar ? (
                         <img src={user.avatar} alt="User Avatar" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                       ) : (
                         user.name[0]
                       )}
                    </div>
                  </div>
                  
                  {/* Remove Avatar Button */}
                  {user.avatar && (
                    <button onClick={handleRemoveAvatar} className="absolute bottom-0 -right-2 p-2 bg-white rounded-full shadow-lg text-rose-500 hover:bg-rose-500 hover:text-white transition-colors border border-gray-100 z-20">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                  
                  {/* Level Badge */}
                  <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-widest shadow-lg border-2 border-white z-20 animate-badge-pop shine-button">
                    Level 5
                  </div>
                </div>
                
                <div>
                  <h2 className="text-2xl font-800 text-gray-900">{user.name}</h2>
                  <div className="flex items-center justify-center gap-2 mt-2">
                    <span className="text-[10px] font-800 bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full uppercase tracking-widest">{roleLabels[user.role]}</span>
                    <span className="text-[10px] font-800 bg-blue-50 text-blue-600 px-3 py-1 rounded-full uppercase tracking-widest flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" /> Verified
                    </span>
                  </div>
                </div>
                
                {/* Recent Achievement */}
                <div className="mt-6 p-3 bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl border border-amber-100 flex items-center gap-3 text-left animate-slide-in-bottom">
                  <div className="p-2 bg-white rounded-xl shadow-sm"><Star className="w-5 h-5 text-amber-500 fill-amber-500" /></div>
                  <div>
                    <p className="text-[10px] font-extrabold text-amber-600 uppercase tracking-widest">Latest Badge</p>
                    <p className="text-sm font-bold text-gray-900">Guardian Angel</p>
                  </div>
                </div>
              </div>
            </div>
            
            <button onClick={onLogout} className="md:hidden w-full flex items-center justify-center gap-3 p-4 text-rose-500 font-800 text-sm bg-white border border-gray-100 rounded-[2rem] hover:bg-rose-50 transition-colors shadow-sm active:scale-95">
              <LogOut className="w-5 h-5" /> {t('signOut')}
            </button>
          </div>

          <div className="md:col-span-8 space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white p-6 rounded-[2.5rem] border border-gray-100 text-center card-lift spotlight-card group">
                <div className="w-12 h-12 bg-rose-50 rounded-2xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                  <Heart className="w-6 h-6 text-rose-500" />
                </div>
                <p className="text-3xl font-800 text-gray-900 tabular-nums">{user.role === 'CITIZEN' ? userReports.length : handledReports.length}</p>
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">{user.role === 'CITIZEN' ? 'Reports' : 'Cases Handled'}</p>
              </div>
              <div className="bg-white p-6 rounded-[2.5rem] border border-gray-100 text-center card-lift spotlight-card group relative overflow-hidden">
                <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-emerald-50 rounded-full blur-2xl group-hover:bg-emerald-100 transition-colors" />
                <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 group-hover:-rotate-6 transition-all duration-300 relative z-10">
                  <Award className="w-6 h-6 text-emerald-500" />
                </div>
                <p className="text-3xl font-800 text-gray-900 tabular-nums relative z-10">{totalImpact}</p>
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1 relative z-10">Impact Score</p>
              </div>
            </div>

            <div className="bg-white border border-gray-100 rounded-[2.5rem] p-2 shadow-sm">
              <div className="space-y-1">
                {menuItems.map((item, i) => (
                  <button 
                    key={item.id} 
                    onClick={() => setCurrentView(item.id)} 
                    className="w-full flex items-center justify-between p-4 hover:bg-gray-50 rounded-2xl group transition-colors animate-slide-in-right"
                    style={{ animationDelay: `${i * 0.05}s` }}
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-gray-50 border border-gray-100 rounded-xl group-hover:bg-white group-hover:shadow-sm group-hover:border-emerald-100 transition-all duration-300 group-hover:scale-110">
                        <item.icon className="w-5 h-5 text-gray-500 group-hover:text-emerald-600 transition-colors" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-900 text-left group-hover:text-emerald-700 transition-colors">{item.label}</p>
                        <p className="text-[10px] text-gray-500 text-left font-medium">{item.sub}</p>
                      </div>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-emerald-50 transition-colors">
                      <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-emerald-600 transition-colors" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
  );

  const renderContent = () => {
    switch (currentView) {
      case 'history': return <HistoryView data={displayReports} title="Case History" type="report" />;
      case 'adoptions': return <HistoryView data={user.role === 'CITIZEN' ? myAdoptions : ngoAdoptions} title={user.role === 'CITIZEN' ? 'My Adopted Pets' : 'All Adoption Records'} type="pet" />;
      case 'settings': return <SettingsScreen />;
      case 'about': return <AboutScreen />;
      case 'help': return <HelpScreen />;
      case 'privacy': return <PrivacyScreen />;
      case 'main': return <MainProfileContent />;
      default: return (
        <div className="p-6 md:p-0 space-y-6 animate-in slide-in-from-right-4 duration-500 pb-10">
          <div className="flex items-center gap-4">
            <button onClick={() => setCurrentView('main')} className="p-3 bg-white border border-gray-100 rounded-full shadow-sm hover:text-emerald-600 transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-xl font-800 text-gray-900 tracking-tight capitalize">{currentView}</h1>
              <p className="text-[10px] text-emerald-600 font-800 uppercase tracking-widest">Configuration</p>
            </div>
          </div>
          <div className="bg-white border border-gray-100 rounded-[2.5rem] p-16 text-center shadow-sm">
            <p className="text-sm text-gray-600 font-medium">This feature is coming soon.</p>
          </div>
        </div>
      );
    }
  };

  return (
    <>
      {renderSettingsModal()}
      {renderContent()}
    </>
  );
};

export default ProfileScreen;
