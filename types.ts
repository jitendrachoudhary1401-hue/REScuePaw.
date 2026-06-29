
export enum AnimalType {
  DOG = 'DOG',
  CAT = 'CAT',
  COW = 'COW',
  OTHER = 'OTHER'
}

export enum ReportStatus {
  REPORTED = 'REPORTED',
  QUEUED = 'QUEUED',
  ACCEPTED = 'ACCEPTED',
  RESCUED = 'RESCUED',
  TREATED = 'TREATED'
}

export enum DonationStatus {
  AVAILABLE = 'AVAILABLE',
  CLAIMED = 'CLAIMED',
  COLLECTED = 'COLLECTED',
}

export interface Location {
  lat: number;
  lng: number;
  address?: string;
}

export interface AiAnalysis {
  isAiGenerated: boolean;
  isAnimalPresent: boolean;
  animalType: AnimalType;
  breedSuggestion?: string;
  detectionNotes?: string;
  visualDescription?: string;
  categories: string[]; // e.g., 'Bleeding', 'Mobility Issue', 'Skin Condition'
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  visualObservation: string; // Replaces 'summary' to be less diagnostic
  firstAidAdvice: string[];
  confidenceScore: number;
  imageQuality?: 'Low' | 'Medium' | 'High';
}

export interface FoodAnalysis {
  foodType: string;
  specificFoodDetected?: string[];
  isSpoiledOrExpired?: boolean;
  estimatedQuantity: string;
  suitability: {
    dog: boolean;
    cat: boolean;
    cow: boolean;
  };
  comments: string;
  imageQuality?: 'Low' | 'Medium' | 'High';
}

export interface ReportUpdate {
  timestamp: number;
  text: string;
  authorId: string;
  authorName: string;
  authorRole: UserRole;
}

export interface EmergencyReport {
  id: string;
  photo: string; // base64
  animalType: AnimalType;
  notes: string;
  location: Location;
  status: ReportStatus;
  timestamp: number;
  aiAnalysis?: AiAnalysis;
  reporterId: string;
  declinedBy?: string[]; // IDs of NGOs/Volunteers who declined
  updates?: ReportUpdate[];
  recoveryPhoto?: string;
  adoptionPetId?: string; // Link to adoption listing if created
}

export type UserRole = 'CITIZEN' | 'VOLUNTEER' | 'NGO' | 'VET';

export interface User {
  id: string;
  uid?: string; // Added for Firestore security rules
  name: string;
  email: string;
  role: UserRole;
  organization?: string;
  isVerifiedProfessional?: boolean; // True if they uploaded a valid Vet/NGO certificate
  phone?: string;
  avatar?: string; // base64
  password?: string; // Optional for updates
  createdAt?: string | any; // Added for Firestore security rules
}

export interface Donation {
  id: string;
  photo: string; // base64
  foodType: string;
  estimatedQuantity: string;
  animalType: AnimalType;
  comments: string;

  donorId: string;
  donorName: string;
  timestamp: number;
  
  deliveryMethod: 'pickup' | 'dropoff';
  status: DonationStatus;

  // Optional fields based on delivery method and status
  pickupDetails?: {
    date: string;
    time: string;
    location?: Location;
    manualAddress?: string;
    locationInfo?: string;
  };
  claimedBy?: {
    id: string;
    name: string;
  };
}

// Adoption Types
export interface AdoptionPet {
  id: string;
  sourceReportId?: string; // ID of the emergency report this came from
  name: string;
  age: string;
  gender: 'Male' | 'Female';
  breed: string;
  type: AnimalType;
  photo: string;
  description: string;
  healthStatus: string; // e.g., "Vaccinated, Sterilized"
  fee: string;
  isAdopted: boolean;
  adopterId?: string;
  adopterName?: string;
  adoptionDate?: number;
}

export interface AdoptionApplication {
  id: string;
  petId: string;
  applicantId: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  timestamp: number;
  housingType: 'OWNED' | 'RENTED';
  documents: {
    idProof: string; // base64
    addressProof: string; // base64
    landlordConsent?: string; // base64
  };
  verificationStatus: {
    isIdValid: boolean;
    isAddressValid: boolean;
    isConsentValid?: boolean;
    aiNotes: string;
  };
}

export interface DocVerificationResult {
  isValid: boolean;
  reason: string;
  documentTypeDetected: string;
  imageQuality?: 'Low' | 'Medium' | 'High';
}

export enum ShopCategory {
  FOOD = 'FOOD',
  STUFFS = 'STUFFS'
}

export interface ShopItem {
  id: string;
  name: string;
  price: number;
  image: string;
  description: string;
  category: ShopCategory;
  stock?: number;
}

export enum OrderStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  SHIPPED = 'SHIPPED',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED'
}

export enum PaymentMethod {
  COD = 'COD',
  ONLINE = 'ONLINE'
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED'
}

export interface ShippingAddress {
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
}

export interface OrderItem {
  shopItemId: string;
  name: string;
  quantity: number;
  priceAtPurchase: number;
  image: string;
}

export interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  status: OrderStatus;
  totalAmount: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  paymentId?: string; // e.g., Razorpay Order ID or Payment ID
  shippingAddress: ShippingAddress;
  createdAt: number;
}
