
import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';

type Language = 'en' | 'hi';

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string, replacements?: { [key: string]: string | number }) => string;
}

const translations: Record<string, Record<Language, string>> = {
  // App/Navigation
  home: { en: 'Home', hi: 'होम' },
  myCases: { en: 'My Cases', hi: 'मेरे केस' },
  dashboard: { en: 'Dashboard', hi: 'डैशबोर्ड' },
  reportEmergency: { en: 'Report Emergency', hi: 'आपातकाल की रिपोर्ट करें' },
  foodBank: { en: 'Food Bank', hi: 'फ़ूड बैंक' },
  donateFood: { en: 'Donate Food', hi: 'खाना दान करें' },
  profile: { en: 'Profile', hi: 'प्रोफ़ाइल' },
  signOut: { en: 'Sign Out', hi: 'साइन आउट' },
  board: { en: 'Board', hi: 'बोर्ड' },
  food: { en: 'Food', hi: 'भोजन' },
  donate: { en: 'Donate', hi: 'दान करें' },
  report: { en: 'Report', hi: 'रिपोर्ट' },
  adoption: { en: 'Adopt', hi: 'गोद लें' },

  // HomeScreen
  missionControl: { en: 'Mission Control', hi: 'मिशन कंट्रोल' },
  welcomeBack: { en: 'Welcome back, Hero. Status:', hi: 'वापसी पर स्वागत है, हीरो। स्थिति:' },
  onlineMonitoring: { en: 'Online & Monitoring', hi: 'ऑनलाइन और निगरानी' },
  reportEmergencyTitle: { en: 'Report Emergency', hi: 'आपातकाल की रिपोर्ट करें' },
  reportEmergencyDesc: { en: 'AI-assisted reporting captures critical details. Instant dispatching within minutes.', hi: 'एआई-सहायता प्राप्त रिपोर्टिंग महत्वपूर्ण विवरण कैप्चर करती है। मिनटों के भीतर तुरंत मदद भेजें।' },
  livesSaved: { en: 'Lives Saved', hi: 'जानें बचाई गईं' },
  activeHeroes: { en: 'Active Heroes', hi: 'सक्रिय हीरो' },
  responseRate: { en: 'Response Rate', hi: 'प्रतिक्रिया दर' },
  nearbyIncidents: { en: 'Nearby Incidents', hi: 'आस-पास की घटनाएँ' },
  liveUpdates: { en: 'Live updates from your radius', hi: 'आपके दायरे से लाइव अपडेट' },
  viewMap: { en: 'View Map', hi: 'नक्शा देखें' },
  allQuiet: { en: 'All Quiet', hi: 'सब शांत है' },
  noActiveReports: { en: 'Your neighborhood is safe. No active reports found.', hi: 'आपका पड़ोस सुरक्षित है। कोई सक्रिय रिपोर्ट नहीं मिली।' },
  feedAStray: { en: 'Feed a Stray', hi: 'एक आवारा को खिलाएं' },
  feedAStrayDesc: { en: 'Your contribution provides a meal for an animal in need. 95% goes directly to the NGO, and 5% helps keep our servers running.', hi: 'आपका योगदान एक जरूरतमंद जानवर के लिए भोजन प्रदान करता है। 95% सीधे एनजीओ को जाता है, और 5% हमारे सर्वर को चालू रखने में मदद करता है।' },
  foodBankTitle: { en: 'Food Bank', hi: 'फ़ूड बैंक' },
  foodBankDesc: { en: '{count} donation(s) available for pickup. View the list and coordinate collection.', hi: '{count} दान पिकअप के लिए उपलब्ध हैं। सूची देखें और संग्रह का समन्वय करें।' },
  viewDonations: { en: 'View Donations', hi: 'दान देखें' },
  dailyTip: { en: 'Daily Tip', hi: 'आज का सुझाव' },
  safetyTip: { en: 'Keep a safe distance from injured stray animals. Pain can cause aggression even in docile pets.', hi: 'घायल आवारा जानवरों से सुरक्षित दूरी बनाए रखें। दर्द शांत पालतू जानवरों में भी आक्रामकता पैदा कर सकता है।' },
  meetFriends: { en: 'Meet Our Friends', hi: 'हमारे दोस्तों से मिलें' },
  adoptDesc: { en: 'Give a rescued animal a forever home.', hi: 'बचाए गए जानवर को हमेशा के लिए घर दें।' },
  findFriend: { en: 'Find a Friend', hi: 'दोस्त खोजें' },

  // ReportScreen
  newReportTitle: { en: 'New Emergency Report', hi: 'नई आपातकालीन रिपोर्ट' },
  newReportDesc: { en: 'Capture details for immediate dispatch', hi: 'तत्काल प्रेषण के लिए विवरण कैप्चर करें' },
  provideImageTitle: { en: 'Provide an Image', hi: 'एक छवि प्रदान करें' },
  provideImageDesc: { en: 'A clear photo is crucial for an accurate AI assessment.', hi: 'एक सटीक एआई मूल्यांकन के लिए एक स्पष्ट तस्वीर महत्वपूर्ण है।' },
  takePhoto: { en: 'Take Photo', hi: 'फोटो लें' },
  upload: { en: 'Upload', hi: 'अपलोड करें' },
  aiAnalysisComplete: { en: 'AI Analysis Complete', hi: 'एआई विश्लेषण पूरा हुआ' },
  imageRejected: { en: 'Image Rejected', hi: 'छवि अस्वीकृत' },
  tryAgain: { en: 'Try Again', hi: 'पुनः प्रयास करें' },
  aiVisionEngine: { en: 'AI Vision Engine', hi: 'एआई विजन इंजन' },
  aiScanning: { en: 'Scanning for authenticity, animal presence, and injuries...', hi: 'प्रामाणिकता, पशु उपस्थिति और चोटों के लिए स्कैनिंग...' },
  locationAcquired: { en: 'Location Acquired (GPS)', hi: 'स्थान प्राप्त (जीपीएस)' },
  incidentLocation: { en: 'Incident Location', hi: 'घटना स्थल' },
  acquiringGPS: { en: 'Acquiring GPS Signal...', hi: 'जीपीएस सिग्नल प्राप्त हो रहा है...' },
  incorrectLocation: { en: 'Incorrect location? Enter manually', hi: 'गलत स्थान? मैन्युअल रूप से दर्ज करें' },
  dispatchNotes: { en: 'Dispatch Notes', hi: 'प्रेषण नोट्स' },
  animalSpecies: { en: 'Animal Species', hi: 'पशु प्रजाति' },
  aiVerified: { en: 'AI Verified', hi: 'एआई सत्यापित' },
  dog: { en: 'Dog', hi: 'कुत्ता' },
  cat: { en: 'Cat', hi: 'बिल्ली' },
  cow: { en: 'Cow', hi: 'गाय' },
  other: { en: 'Other', hi: 'अन्य' },
  incidentNotes: { en: 'Incident Notes', hi: 'घटना नोट्स' },
  notesPlaceholder: { en: 'Describe visible injuries, behavior (aggressive/scared), and any specific landmarks to help rescuers locate the animal...', hi: 'दिखाई देने वाली चोटों, व्यवहार (आक्रामक/डरा हुआ) और किसी भी विशिष्ट स्थलचिह्न का वर्णन करें ताकि बचाव दल को जानवर का पता लगाने में मदद मिल सके...' },
  broadcastReport: { en: 'Broadcast Emergency Report', hi: 'आपातकालीन रिपोर्ट प्रसारित करें' },
  volunteersNotified: { en: '{count} nearest volunteers will be notified instantly', hi: '{count} निकटतम स्वयंसेवकों को तुरंत सूचित किया जाएगा' },
  back: { en: 'Back', hi: 'वापस' },

  // DashboardScreen
  caseBoard: { en: 'Case Board', hi: 'केस बोर्ड' },
  caseBoardDesc: { en: 'Real-time emergency feed & coordination', hi: 'वास्तविक समय आपातकालीन फ़ीड और समन्वय' },
  searchPlaceholder: { en: 'Search cases...', hi: 'केस खोजें...' },
  incoming: { en: 'Incoming', hi: 'आने वाले' },
  inProgress: { en: 'In Progress', hi: 'प्रगति में' },
  rescued: { en: 'Rescued', hi: 'बचाया गया' },
  recovered: { en: 'Recovered', hi: 'ठीक हो गया' },
  sectionClear: { en: '{tab} is Clear', hi: '{tab} साफ़ है' },
  noCasesInSection: { en: 'No active cases in this section.', hi: 'इस अनुभाग में कोई सक्रिय मामले नहीं हैं।' },
  accept: { en: 'Accept', hi: 'स्वीकार करें' },
  markRescued: { en: 'Rescued', hi: 'बचाया गया' },
  completeCase: { en: 'Complete Case', hi: 'केस पूरा करें' },
  before: {en: 'Before', hi: 'पहले'},
  after: {en: 'After', hi: 'बाद में'},

  // StatusScreen
  trackRecovery: { en: 'Track Recovery', hi: 'रिकवरी ट्रैक करें' },
  caseId: { en: 'Case ID', hi: 'केस आईडी' },
  incidentBroadcasted: { en: 'Incident Broadcasted', hi: 'घटना प्रसारित' },
  alertSent: { en: 'Alert sent to nearby rescuers', hi: 'आस-पास के बचावकर्ताओं को अलर्ट भेजा गया' },
  heroEnRoute: { en: 'Hero En Route', hi: 'हीरो रास्ते में है' },
  volunteerAccepted: { en: 'A volunteer has accepted the case', hi: 'एक स्वयंसेवक ने केस स्वीकार कर लिया है' },
  safeInTransit: { en: 'Safe in Transit', hi: 'पारगमन में सुरक्षित' },
  animalTransported: { en: 'Animal being transported to a clinic', hi: 'जानवर को क्लिनिक ले जाया जा रहा है' },
  recovering: { en: 'Recovering', hi: 'ठीक हो रहा है' },
  careProvided: { en: 'Professional care is being provided', hi: 'पेशेवर देखभाल प्रदान की जा रही है' },
  thankYouHero: { en: 'Thank you, Hero!', hi: 'धन्यवाद, हीरो!' },
  thankYouMessage: { en: 'Because of your quick action, this animal is now safe and receiving the care it needs. You\'ve made a real difference today.', hi: 'आपकी त्वरित कार्रवाई के कारण, यह जानवर अब सुरक्षित है और उसे आवश्यक देखभाल मिल रही है। आपने आज एक वास्तविक अंतर बनाया है।' },
  callRescuer: { en: 'Call Rescuer', hi: 'बचावकर्ता को कॉल करें' },
  updateInfo: { en: 'Update Info', hi: 'जानकारी अपडेट करें' },

  // Donation Screens
  foodDonationTitle: { en: 'Food Donation', hi: 'भोजन दान' },
  foodDonationDesc: { en: 'Help us feed the rescued souls with AI safety checks.', hi: 'एआई सुरक्षा जांच के साथ बचाई गई आत्माओं को खिलाने में हमारी मदद करें।' },
  foodBankPageDesc: { en: 'Browse and claim available food donations.', hi: 'उपलब्ध भोजन दान ब्राउज़ करें और दावा करें।' },
  myClaims: { en: 'My Claims', hi: 'मेरे दावे' },
  claimDonation: { en: 'Claim Donation', hi: 'दान का दावा करें' },
  howToDonate: { en: 'How to Donate?', hi: 'दान कैसे करें?' },
  howToDonateDesc: { en: "Choose how you'd like to get the food to us.", hi: 'चुनें कि आप हम तक भोजन कैसे पहुंचाना चाहते हैं।' },
  schedulePickup: { en: 'Schedule a Pickup', hi: 'पिकअप शेड्यूल करें' },
  pickupDesc: { en: 'Our volunteers will collect the donation right from your doorstep.', hi: 'हमारे स्वयंसेवक आपके दरवाजे से दान एकत्र करेंगे।' },
  dropOff: { en: 'Drop off at NGO', hi: 'एनजीओ में छोड़ें' },
  dropOffDesc: { en: 'Visit our nearest center and hand over the donation personally.', hi: 'हमारे निकटतम केंद्र पर जाएँ और व्यक्तिगत रूप से दान सौंपें।' },
  confirmDonation: { en: 'Confirm Donation', hi: 'दान की पुष्टि करें' },

  // Adoption Screens
  adoptHero: { en: 'Adopt a Soul', hi: 'एक आत्मा को अपनाएं' },
  adoptHeroDesc: { en: 'Find your perfect companion and give them a forever home.', hi: 'अपने आदर्श साथी को खोजें और उन्हें हमेशा के लिए घर दें।' },
  adoptionFee: { en: 'Adoption Fee', hi: 'गोद लेने का शुल्क' },
  adoptMe: { en: 'Adopt Me', hi: 'मुझे गोद लें' },
  adoptionApp: { en: 'Adoption Application', hi: 'दत्तक ग्रहण आवेदन' },
  stepEligibility: { en: 'Eligibility', hi: 'पात्रता' },
  stepHousing: { en: 'Housing', hi: 'आवास' },
  stepDocs: { en: 'Documents', hi: 'दस्तावेज़' },
  stepReview: { en: 'Review', hi: 'समीक्षा' },
  uploadId: { en: 'Upload Govt ID', hi: 'सरकारी आईडी अपलोड करें' },
  uploadAddress: { en: 'Upload Address Proof', hi: 'पता प्रमाण अपलोड करें' },
  uploadLandlord: { en: 'Upload Landlord NOC', hi: 'मकान मालिक एनओसी अपलोड करें' },
  verifyingDocs: { en: 'AI Verifying Documents...', hi: 'एआई दस्तावेजों का सत्यापन कर रहा है...' },
  verificationSuccess: { en: 'Documents Verified', hi: 'दस्तावेज़ सत्यापित' },
  verificationFail: { en: 'Verification Failed', hi: 'सत्यापन विफल' },
  
  // Chat Assistant
  chatTitle: { en: 'AI Medical Guide', hi: 'एआई मेडिकल गाइड' },
  chatWelcome: { en: 'Hello! I am your Emergency Pet Assistant. Ask me for first aid advice while help is on the way.', hi: 'नमस्ते! मैं आपका आपातकालीन पालतू सहायक हूँ। मदद आने तक मुझसे प्राथमिक उपचार की सलाह मांगें।' },
  chatPlaceholder: { en: 'How to stop bleeding...', hi: 'खून बहना कैसे रोकें...' },
  chatDisclaimer: { en: 'Advice is for emergency use only. Rescuers are being notified.', hi: 'सलाह केवल आपातकालीन उपयोग के लिए है। बचाव दल को सूचित किया जा रहा है।' },

  // ProfileScreen -> SettingsScreen translations
  accountSettingsTitle: { en: 'Account Settings', hi: 'अकाउंट सेटिंग' },
  manageYourProfile: { en: 'Manage your profile', hi: 'अपनी प्रोफ़ाइल प्रबंधित करें' },
  languageTitle: { en: 'Language / भाषा', hi: 'भाषा / Language' },
  languageDescription: { en: 'Choose your preferred language', hi: 'अपनी पसंदीदा भाषा चुनें' },
  personalInformation: { en: 'Personal Information', hi: 'व्यक्तिगत जानकारी' },
  name: { en: 'Name', hi: 'नाम' },
  email: { en: 'Email', hi: 'ईमेल' },
  phone: { en: 'Phone', hi: 'फ़ोन' },
  security: { en: 'Security', hi: 'सुरक्षा' },
  password: { en: 'Password', hi: 'पासवर्ड' },
  dangerZone: { en: 'Danger Zone', hi: 'खतरनाक क्षेत्र' },
  deleteMyAccount: { en: 'Delete My Account', hi: 'मेरा खाता हटाएं' },
  edit: { en: 'Edit', hi: 'संपादित करें' },

  // ProfileScreen -> Main Screen menu
  caseHistory: { en: 'Case History', hi: 'केस इतिहास' },
  caseHistorySub: { en: 'View all your past reports', hi: 'अपनी सभी पिछली रिपोर्टें देखें' },
  accountSettings: { en: 'Account Settings', hi: 'अकाउंट सेटिंग' },
  accountSettingsSub: { en: 'Name, email, password', hi: 'नाम, ईमेल, पासवर्ड' },
  privacySecurity: { en: 'Privacy & Security', hi: 'गोपनीयता और सुरक्षा' },
  privacySecuritySub: { en: 'Data and permissions', hi: 'डेटा और अनुमतियाँ' },
  aboutApp: { en: 'About REScue Paw', hi: 'रेस्क्यू पॉ के बारे में' },
  aboutAppSub: { en: 'Our mission and vision', hi: 'हमारा मिशन और विजन' },
  helpContact: { en: 'Help & Contact Us', hi: 'सहायता और संपर्क करें' },
  helpContactSub: { en: 'Get support or ask questions', hi: 'समर्थन प्राप्त करें या प्रश्न पूछें' },
  
  // Profile Roles
  role_CITIZEN: { en: 'Rescue Reporter', hi: 'बचाव रिपोर्टर' },
  role_VOLUNTEER: { en: 'Field Volunteer', hi: 'क्षेत्र स्वयंसेवक' },
  role_NGO: { en: 'Rescue Organization', hi: 'बचाव संगठन' },
  role_VET: { en: 'Medical Expert', hi: 'चिकित्सा विशेषज्ञ' },

  // Privacy & Security
  privacySecurityTitle: { en: 'Privacy & Security', hi: 'गोपनीयता और सुरक्षा' },
  privacySecurityDesc: { en: 'Control how your data is used and stored.', hi: 'नियंत्रित करें कि आपका डेटा कैसे उपयोग और संग्रहीत किया जाता है।' },
  chatHistory: { en: 'Chat History', hi: 'चैट इतिहास' },
  chatHistoryDesc: { en: 'Save your conversations with the AI Medical Guide for future reference.', hi: 'भविष्य के संदर्भ के लिए एआई मेडिकल गाइड के साथ अपनी बातचीत सहेजें।' },
  privateMode: { en: 'Private Mode', hi: 'निजी मोड' },
  privateModeDesc: { en: 'When enabled, new reports and changes will not be saved to your device.', hi: 'सक्षम होने पर, नई रिपोर्ट और परिवर्तन आपके डिवाइस पर सहेजे नहीं जाएंगे।' },
  dataConsent: { en: 'Data Usage Consent', hi: 'डेटा उपयोग सहमति' },
  dataConsentDesc: { en: 'Allow us to use your anonymized report data to improve our AI models.', hi: 'हमारे एआई मॉडल को बेहतर बनाने के लिए हमें अपने अनाम रिपोर्ट डेटा का उपयोग करने की अनुमति दें।' },
  deleteAllData: { en: 'Delete All App Data', hi: 'सभी ऐप डेटा हटाएं' },
  deleteAllDataDesc: { en: 'Permanently remove all your reports and account information from this device.', hi: 'इस डिवाइस से अपनी सभी रिपोर्ट और खाता जानकारी स्थायी रूप से हटा दें।' },
  deleteAllDataConfirmationTitle: { en: 'Are you absolutely sure?', hi: 'क्या आप बिल्कुल निश्चित हैं?' },
  deleteAllDataConfirmationText: { en: 'This action cannot be undone. To confirm, type "ERASE" below.', hi: 'यह कार्रवाई पूर्ववत नहीं की जा सकती। पुष्टि करने के लिए, नीचे "ERASE" टाइप करें।' },
  confirm: { en: 'Confirm & Erase', hi: 'पुष्टि करें और मिटाएं' },
  cancel: { en: 'Cancel', hi: 'रद्द करें' },
  erasePlaceholder: { en: 'ERASE', hi: 'ERASE' },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    return (localStorage.getItem('rescue_paw_language') as Language) || 'en';
  });

  useEffect(() => {
    localStorage.setItem('rescue_paw_language', language);
  }, [language]);
  
  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  const t = (key: string, replacements: { [key: string]: string | number } = {}): string => {
    let translation = translations[key]?.[language] || key;
    Object.keys(replacements).forEach(placeholder => {
      const regex = new RegExp(`{${placeholder}}`, 'g');
      translation = translation.replace(regex, String(replacements[placeholder]));
    });
    return translation;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
