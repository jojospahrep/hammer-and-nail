export interface SupplierSummary {
  id: number;
  name: string;
  distance: number;
  materials: string[];
  image: string;
  address?: string;
  phone?: string;
  email?: string;
  certifications?: string[];
  leadTimeDays?: number;
  reliabilityScore?: number;
}

export interface SupplierProfile {
  id: number;
  name: string;
  distance: number;
  materials: string[];
  image: string;
  description: string;
  rating: number;
  reviews: number;
  yearsInBusiness: number;
  certifications: string[];
  deliveryTime: string;
  minimumOrder: string;
  paymentTerms: string;
  coverage: string;
  recentProjects: { name: string; value: string; date: string }[];
  pricing: { material: string; price: string; unit: string; availability: string }[];
  contact: {
    phone: string;
    email: string;
    address: string;
  };
}

export interface BoMInputItem {
  partNumber: string;
  description: string;
  specification: string;
  quantity: number;
  unit: string;
  basePrice: number;
  maxLeadTimeDays: number;
  category: 'Cement' | 'Concrete' | 'Steel' | 'Aggregates' | 'Timber' | 'Masonry' | 'Plumbing' | 'Electrical';
}

export interface ExampleProjectBoM {
  id: string;
  title: string;
  shortLabel: string;
  location: string;
  projectType: string;
  contractValue: string;
  fileName: string;
  csvUrl: string;
  defaultPrompt: string;
  items: BoMInputItem[];
}

export interface CatalogInputItem {
  sku: string;
  name: string;
  category: string;
  unit: string;
  yourPrice: number;
  marketBenchmark: number;
  supplyCondition: 'Abundant' | 'Normal' | 'Limited' | 'Tight';
  demand: 'Low' | 'Moderate' | 'High' | 'Very\u00A0High';
  competitorCount: number;
}

export interface ExampleSupplierCatalog {
  id: string;
  title: string;
  shortLabel: string;
  fileName: string;
  csvUrl: string;
  defaultPrompt: string;
  items: CatalogInputItem[];
}

export interface ContractorOpportunity {
  id: string;
  title: string;
  materialsSummary: string;
  value: string;
  matchPercent: number;
  distance: string;
  deadline: string;
  deadlineUrgent?: boolean;
  contractorName: string;
  projectCode: string;
  promptForNail: string;
  linkedCatalogId: string;
  requiredItems: {
    partNumber: string;
    material: string;
    quantity: number;
    unit: string;
    targetRate: number;
    recommendedBidRate: number;
    winProbability: string;
  }[];
}

export const FEATURED_SUPPLIERS: SupplierSummary[] = [
  {
    id: 1,
    name: 'Selco Builders Warehouse',
    distance: 2.3,
    materials: ['Cement', 'Concrete', 'Aggregates'],
    image:
      'https://images.unsplash.com/photo-1761805618757-9d2b9552ee32?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb25zdHJ1Y3Rpb24lMjBtYXRlcmlhbHMlMjB3YXJlaG91c2V8ZW58MXx8fHwxNzcwNDg1OTQ2fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    address: '1234 Industrial Estate, Beckton, London E6 5NT',
    phone: '+44 20 7946 0123',
    email: 'sales@selcobuilders.co.uk',
    certifications: ['ISO 9001:2015', 'BS EN 197-1', 'BS 8500-2'],
    leadTimeDays: 3,
    reliabilityScore: 98.4,
  },
  {
    id: 2,
    name: 'Steel & Metal Co.',
    distance: 5.7,
    materials: ['Steel Beams', 'Rebar', 'Metal Sheets'],
    image:
      'https://images.unsplash.com/photo-1763926025678-95d196d0ab28?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdGVlbCUyMG1ldGFsJTIwd2FyZWhvdXNlJTIwaW5kdXN0cmlhbHxlbnwxfHx8fDE3NzA0ODM1NzV8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    address: '5678 Steel Way, Trafford Park, Manchester M17 1WA',
    phone: '+44 161 496 0234',
    email: 'orders@steelmetal.co.uk',
    certifications: ['CARES Approved', 'UKCA Execution Class 3', 'ISO 9001:2015'],
    leadTimeDays: 6,
    reliabilityScore: 99.1,
  },
  {
    id: 3,
    name: 'Timber Solutions',
    distance: 3.2,
    materials: ['Lumber', 'Plywood', 'Treated Wood'],
    image:
      'https://images.unsplash.com/photo-1629965995905-bf0bbd10dcaf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0aW1iZXIlMjBsdW1iZXIlMjB3YXJlaG91c2UlMjBzdG9yYWdlfGVufDF8fHx8MTc3MDQ4NTk0N3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    address: '9012 Lumber Ln, Wood District, WD 34567',
    phone: '+44 123 456 0345',
    email: 'sales@timbersolutions.co.uk',
    certifications: ['FSC 100%', 'PEFC Chain of Custody', 'BS 1088 Marine'],
    leadTimeDays: 4,
    reliabilityScore: 96.8,
  },
  {
    id: 4,
    name: 'Electrical Supply Hub',
    distance: 4.1,
    materials: ['Wiring', 'Switches', 'Circuit Breakers'],
    image:
      'https://images.unsplash.com/photo-1555983076-1d4ce0cec1aa?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3YXJlaG91c2UlMjBpbnRlcmlvciUyMHNoZWx2ZXN8ZW58MXx8fHwxNzcwNDg1OTUyfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    address: '3456 Circuit Rd, Electric City, EC 45678',
    phone: '+44 20 7946 0456',
    email: 'info@electricalsupplyhub.com',
    certifications: ['BASEC Approved', 'BS EN 61386', 'ISO 9001:2015'],
    leadTimeDays: 2,
    reliabilityScore: 97.9,
  },
  {
    id: 5,
    name: 'Plumbing Pro Warehouse',
    distance: 6.8,
    materials: ['Pipes', 'Fittings', 'Fixtures'],
    image:
      'https://images.unsplash.com/photo-1673201159848-a0908cff3ccf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwbHVtYmluZyUyMHdhcmVob3VzZSUyMGluZHVzdHJpYWx8ZW58MXx8fHwxNzcwNDg1OTQ4fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    address: '7890 Pipe St, Plumbing District, PD 56789',
    phone: '+44 20 7946 0567',
    email: 'orders@plumbingpro.com',
    certifications: ['WRAS Approved', 'BS EN 1401-1', 'NSF/ANSI 61'],
    leadTimeDays: 3,
    reliabilityScore: 96.2,
  },
  {
    id: 6,
    name: 'Masonry Materials Ltd',
    distance: 1.9,
    materials: ['Bricks', 'Blocks', 'Mortar'],
    image:
      'https://images.unsplash.com/photo-1763926025477-423847028860?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxidWlsZGluZyUyMG1hdGVyaWFscyUyMHdhcmVob3VzZSUyMHN0b3JhZ2V8ZW58MXx8fHwxNzcwNDg1OTQ4fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    address: '2345 Brick Ave, Masonry Town, MT 67890',
    phone: '+44 20 7946 0678',
    email: 'sales@masonrymaterials.com',
    certifications: ['BS EN 771-1 F2', 'ASTM C90', 'ISO 9001:2015'],
    leadTimeDays: 2,
    reliabilityScore: 98.0,
  },
];

export const VERIFIED_SUPPLIER_POOL: { id: number; name: string; distanceKm: number; tier: string; certBadge: string }[] = [
  { id: 1, name: 'Selco Builders Warehouse', distanceKm: 2.3, tier: 'Tier-1 National', certBadge: 'ISO 9001 / BS EN' },
  { id: 2, name: 'Steel & Metal Co.', distanceKm: 5.7, tier: 'Tier-1 Mill Direct', certBadge: 'CARES / UKCA Ex3' },
  { id: 3, name: 'Timber Solutions', distanceKm: 3.2, tier: 'Tier-1 Sustainable', certBadge: 'FSC 100% / PEFC' },
  { id: 6, name: 'Masonry Materials Ltd', distanceKm: 1.9, tier: 'Tier-1 Regional', certBadge: 'BS EN 771-1 F2' },
  { id: 5, name: 'Plumbing Pro Warehouse', distanceKm: 6.8, tier: 'Tier-1 MEP', certBadge: 'WRAS / BS EN 1401' },
  { id: 4, name: 'Electrical Supply Hub', distanceKm: 4.1, tier: 'Tier-1 Electrical', certBadge: 'BASEC / LSF' },
  { id: 1, name: 'BuildRight Supplies', distanceKm: 4.5, tier: 'Verified Merchant', certBadge: 'ISO 9001:2015' },
  { id: 2, name: 'Metro Construction Materials', distanceKm: 7.4, tier: 'Verified Merchant', certBadge: 'BS 8500 Certified' },
  { id: 3, name: 'Prime Materials Group', distanceKm: 6.1, tier: 'Verified Merchant', certBadge: 'ISO 14001' },
  { id: 2, name: 'Industrial Supply Partners', distanceKm: 8.9, tier: 'Verified Stockist', certBadge: 'UKCA / CE' },
  { id: 5, name: 'TradePro Distribution', distanceKm: 5.2, tier: 'Verified Wholesale', certBadge: 'BSI Kitemark' },
  { id: 6, name: 'Quality Building Merchants', distanceKm: 3.8, tier: 'Verified Regional', certBadge: 'NHBC Accepted' },
  { id: 1, name: 'Apex Supply Chain', distanceKm: 9.4, tier: 'National Logistics', certBadge: 'FORS Gold' },
  { id: 6, name: 'Regional Building Co.', distanceKm: 4.9, tier: 'Verified Merchant', certBadge: 'ISO 9001' },
  { id: 3, name: 'Professional Contractors Warehouse', distanceKm: 6.3, tier: 'Trade Bulk Hub', certBadge: 'FSC / BSI' },
  { id: 2, name: 'Elite Building Solutions', distanceKm: 7.8, tier: 'Specialist Structural', certBadge: 'CARES / ISO' },
  { id: 4, name: 'City Wide Materials', distanceKm: 3.5, tier: 'Urban Express', certBadge: 'FORS Silver' },
  { id: 1, name: 'Contractors Choice Supply', distanceKm: 5.6, tier: 'Verified Partner', certBadge: 'ISO 9001:2015' },
];

export const SUPPLIER_PROFILES: Record<number, SupplierProfile> = {
  1: {
    id: 1,
    name: 'Selco Builders Warehouse',
    distance: 2.3,
    materials: ['Cement', 'Concrete', 'Aggregates', 'Ready-Mix', 'Mortar'],
    image: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&h=400&fit=crop',
    description:
      'Leading supplier of cement and concrete products with over 20 years of experience serving the construction industry. We specialize in bulk materials delivery and maintain the largest ready-mix fleet in the region.',
    rating: 4.8,
    reviews: 187,
    yearsInBusiness: 22,
    certifications: ['ISO 9001:2015', 'ASTM C150', 'Green Building Certified'],
    deliveryTime: '1-2 weeks',
    minimumOrder: '£4,000',
    paymentTerms: 'Net 30',
    coverage: '80 km radius',
    recentProjects: [
      { name: 'Canary Wharf Tower Complex', value: '£1.9M', date: 'Jan 2026' },
      { name: 'Thames Crossing Bridge Project', value: '£1.4M', date: 'Dec 2025' },
      { name: 'Stratford Residential Quarter', value: '£760K', date: 'Nov 2025' },
    ],
    pricing: [
      { material: 'Portland Cement Type I', price: '£110', unit: 'per tonne', availability: 'In Stock' },
      { material: 'Ready-Mix Concrete C25/30', price: '£105', unit: 'per cubic metre', availability: 'In Stock' },
      { material: 'Washed Sand', price: '£28', unit: 'per tonne', availability: 'In Stock' },
      { material: 'Crushed Stone', price: '£34', unit: 'per tonne', availability: 'In Stock' },
    ],
    contact: {
      phone: '+44 20 7946 0123',
      email: 'sales@selcobuilders.co.uk',
      address: '1234 Industrial Estate, Beckton, London E6 5NT',
    },
  },
  2: {
    id: 2,
    name: 'Steel & Metal Co.',
    distance: 9.2,
    materials: ['Steel Beams', 'Rebar', 'Metal Sheets', 'Structural Steel', 'Fasteners'],
    image: 'https://images.unsplash.com/photo-1565611806229-47c6b4c4ab26?w=800&h=400&fit=crop',
    description:
      'Premium structural steel supplier with state-of-the-art fabrication facilities. We provide certified steel products for commercial and industrial construction projects.',
    rating: 4.9,
    reviews: 93,
    yearsInBusiness: 18,
    certifications: ['AISC Certified', 'AWS D1.1', 'ISO 9001:2015', 'OSHA Compliant'],
    deliveryTime: '3-4 weeks',
    minimumOrder: '£8,000',
    paymentTerms: 'Net 45',
    coverage: '160 km radius',
    recentProjects: [
      { name: 'Birmingham City Centre Tower', value: '£2.6M', date: 'Feb 2026' },
      { name: 'Manchester Industrial Warehouse', value: '£2.2M', date: 'Jan 2026' },
      { name: 'Wembley Stadium Extension', value: '£3.3M', date: 'Dec 2025' },
    ],
    pricing: [
      { material: 'Steel Rebar Grade B500B', price: '£560', unit: 'per tonne', availability: 'In Stock' },
      { material: 'Universal Beam Sections', price: '£680', unit: 'per tonne', availability: 'Made to Order' },
      { material: 'Metal Decking', price: '£13', unit: 'per sq metre', availability: 'In Stock' },
      { material: 'Steel Columns', price: '£740', unit: 'per tonne', availability: 'Made to Order' },
    ],
    contact: {
      phone: '+44 161 496 0234',
      email: 'orders@steelmetal.co.uk',
      address: '5678 Steel Way, Trafford Park, Manchester M17 1WA',
    },
  },
  3: {
    id: 3,
    name: 'Timber Solutions',
    distance: 5.1,
    materials: ['Lumber', 'Plywood', 'Treated Wood', 'Engineered Wood', 'Framing Materials'],
    image: 'https://images.unsplash.com/photo-1611080626919-7cf5a9dbab5b?w=800&h=400&fit=crop',
    description:
      'Your trusted partner for quality lumber and wood products. We offer sustainable wood solutions sourced from certified forests with complete traceability.',
    rating: 4.7,
    reviews: 156,
    yearsInBusiness: 15,
    certifications: ['FSC Certified', 'SFI Certified', 'PEFC Chain of Custody'],
    deliveryTime: '2 weeks',
    minimumOrder: '£2,400',
    paymentTerms: 'Net 30',
    coverage: '120 km radius',
    recentProjects: [
      { name: 'Cotswolds Housing Estate', value: '£960K', date: 'Feb 2026' },
      { name: 'Lake District Lodge Resort', value: '£710K', date: 'Jan 2026' },
      { name: 'Reading Suburban Development', value: '£1.2M', date: 'Dec 2025' },
    ],
    pricing: [
      { material: 'Dimensional Lumber 47x100mm', price: '£4.00', unit: 'per piece', availability: 'In Stock' },
      { material: 'Plywood 2440x1220 18mm', price: '£34', unit: 'per sheet', availability: 'In Stock' },
      { material: 'Pressure Treated Timber', price: '£5.20', unit: 'per piece', availability: 'In Stock' },
      { material: 'Engineered LVL Beams', price: '£6.60', unit: 'per linear metre', availability: 'In Stock' },
    ],
    contact: {
      phone: '+44 123 456 0345',
      email: 'sales@timbersolutions.co.uk',
      address: '9012 Lumber Ln, Wood District, WD 34567',
    },
  },
  4: {
    id: 4,
    name: 'Electrical Supply Hub',
    distance: 4.1,
    materials: ['Wiring', 'Switches', 'Circuit Breakers', 'Conduit', 'Lighting'],
    image: 'https://images.unsplash.com/photo-1621905251918-48416bd8575a?w=800&h=400&fit=crop',
    description:
      'Comprehensive electrical supply distributor serving contractors with quality products from leading manufacturers. Our expert team provides technical support and project planning assistance.',
    rating: 4.8,
    reviews: 189,
    yearsInBusiness: 25,
    certifications: ['UL Listed Products', 'NEC Compliant', 'ISO 9001:2015'],
    deliveryTime: '1 week',
    minimumOrder: '£2,000',
    paymentTerms: 'Net 30',
    coverage: '60 km radius',
    recentProjects: [
      { name: 'Tech Campus Phase 2', value: '£1.6M', date: 'Feb 2026' },
      { name: 'Hospital Expansion', value: '£2.1M', date: 'Jan 2026' },
      { name: 'Retail Plaza', value: '£780K', date: 'Dec 2025' },
    ],
    pricing: [
      { material: 'Copper Wire 12 AWG', price: '£1.50', unit: 'per foot', availability: 'In Stock' },
      { material: 'Circuit Breaker Panel 200A', price: '£300', unit: 'per unit', availability: 'In Stock' },
      { material: 'EMT Conduit', price: '£2.80', unit: 'per foot', availability: 'In Stock' },
      { material: 'LED Fixtures', price: '£85', unit: 'per unit', availability: 'In Stock' },
    ],
    contact: {
      phone: '+44 20 7946 0456',
      email: 'info@electricalsupplyhub.com',
      address: '3456 Circuit Rd, Electric City, EC 45678',
    },
  },
  5: {
    id: 5,
    name: 'Plumbing Pro Warehouse',
    distance: 6.8,
    materials: ['Pipes', 'Fittings', 'Fixtures', 'Valves', 'Water Heaters'],
    image: 'https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?w=800&h=400&fit=crop',
    description:
      'Full-service plumbing supply warehouse with extensive inventory and same-day availability on most items. We support both residential and commercial plumbing contractors.',
    rating: 4.6,
    reviews: 142,
    yearsInBusiness: 12,
    certifications: ['IAPMO Certified', 'NSF/ANSI Standards', 'Lead-Free Compliant'],
    deliveryTime: '1 week',
    minimumOrder: '£1,500',
    paymentTerms: 'Net 30',
    coverage: '80 km radius',
    recentProjects: [
      { name: 'Luxury Condos', value: '£950K', date: 'Feb 2026' },
      { name: 'Shopping Center', value: '£670K', date: 'Jan 2026' },
      { name: 'Municipal Building', value: '£1.1M', date: 'Nov 2025' },
    ],
    pricing: [
      { material: 'PVC Pipe Schedule 40 3"', price: '£4.00', unit: 'per foot', availability: 'In Stock' },
      { material: 'Copper Pipe Type L', price: '£8.50', unit: 'per foot', availability: 'In Stock' },
      { material: 'PEX Tubing', price: '£1.20', unit: 'per foot', availability: 'In Stock' },
      { material: 'Ball Valves', price: '£18', unit: 'per unit', availability: 'In Stock' },
    ],
    contact: {
      phone: '+44 20 7946 0567',
      email: 'orders@plumbingpro.com',
      address: '7890 Pipe St, Plumbing District, PD 56789',
    },
  },
  6: {
    id: 6,
    name: 'Masonry Materials Ltd',
    distance: 1.9,
    materials: ['Bricks', 'Blocks', 'Mortar', 'Stone', 'Pavers'],
    image: 'https://images.unsplash.com/photo-1590908993742-5f5f827f4c15?w=800&h=400&fit=crop',
    description:
      'Premier masonry supplier offering a wide range of bricks, blocks, and masonry materials. Our local production facility ensures consistent quality and rapid delivery.',
    rating: 4.7,
    reviews: 98,
    yearsInBusiness: 28,
    certifications: ['ASTM C90', 'NCMA Certified', 'ISO 9001:2015'],
    deliveryTime: '1-2 weeks',
    minimumOrder: '£4,000',
    paymentTerms: 'Net 30',
    coverage: '40 km radius',
    recentProjects: [
      { name: 'Historic Renovation', value: '£820K', date: 'Feb 2026' },
      { name: 'University Campus', value: '£1.4M', date: 'Jan 2026' },
      { name: 'Commercial Plaza', value: '£990K', date: 'Dec 2025' },
    ],
    pricing: [
      { material: 'Concrete Block 8x8x16', price: '£1.50', unit: 'per unit', availability: 'In Stock' },
      { material: 'Clay Brick Standard', price: '£0.85', unit: 'per unit', availability: 'In Stock' },
      { material: 'Mortar Mix Type S', price: '£12', unit: 'per bag', availability: 'In Stock' },
      { material: 'Natural Stone Veneer', price: '£18', unit: 'per sq ft', availability: 'In Stock' },
    ],
    contact: {
      phone: '+44 20 7946 0678',
      email: 'sales@masonrymaterials.com',
      address: '2345 Brick Ave, Masonry Town, MT 67890',
    },
  },
};

export const EXAMPLE_CONTRACTOR_PROJECTS: ExampleProjectBoM[] = [
  {
    id: 'canary-wharf-p3',
    title: 'Canary Wharf Phase 3 Commercial Tower (Core & Shell)',
    shortLabel: '🏗️ Canary Wharf Tower BoM (12 items)',
    location: 'London Docklands E14 (≤10 km radius)',
    projectType: '42-Storey Mixed-Use Commercial Core & Podium',
    contractValue: '$412,800 Est. Material Package',
    fileName: 'Canary_Wharf_Phase3_Tower_BoM.csv',
    csvUrl: 'examples/Canary_Wharf_Phase3_Tower_BoM.csv',
    defaultPrompt:
      'Analyze Canary Wharf Phase 3 Tower BOQ (12 items). Enforce BS 8500-2 / BS 4449 CARES compliance, max 14-day lead time, and prioritize suppliers within 10km of London E14.',
    items: [
      {
        partNumber: 'BOQ-0001',
        description: 'Portland Cement Type I',
        specification: 'BS EN 197-1 CEM I 52.5N High Early Strength',
        quantity: 850,
        unit: 'bags',
        basePrice: 12.5,
        maxLeadTimeDays: 7,
        category: 'Cement',
      },
      {
        partNumber: 'BOQ-0002',
        description: 'Ready-Mix Concrete M30',
        specification: 'BS 8500-2 C30/37 S3 Pumpable Mix',
        quantity: 620,
        unit: 'm³',
        basePrice: 145.0,
        maxLeadTimeDays: 5,
        category: 'Concrete',
      },
      {
        partNumber: 'BOQ-0003',
        description: 'Steel Reinforcement Bars 12mm',
        specification: 'BS 4449 Grade B500B CARES Approved Cut & Bent',
        quantity: 140,
        unit: 'ton',
        basePrice: 850.0,
        maxLeadTimeDays: 14,
        category: 'Steel',
      },
      {
        partNumber: 'BOQ-0004',
        description: 'Steel Reinforcement Bars 16mm',
        specification: 'BS 4449 Grade B500B CARES Approved High Yield',
        quantity: 210,
        unit: 'ton',
        basePrice: 875.0,
        maxLeadTimeDays: 14,
        category: 'Steel',
      },
      {
        partNumber: 'BOQ-0005',
        description: 'Aggregates 20mm',
        specification: 'BS EN 12620 Graded Crushed Granite',
        quantity: 480,
        unit: 'm³',
        basePrice: 45.0,
        maxLeadTimeDays: 7,
        category: 'Aggregates',
      },
      {
        partNumber: 'BOQ-0006',
        description: 'Sand Fine Grade',
        specification: 'BS EN 13139 0/4mm Washed Concreting Sand',
        quantity: 340,
        unit: 'm³',
        basePrice: 38.0,
        maxLeadTimeDays: 7,
        category: 'Aggregates',
      },
      {
        partNumber: 'BOQ-0007',
        description: 'Plywood 18mm Marine Grade',
        specification: 'BS 1088 WBP Phenolic Film Faced Formwork FSC',
        quantity: 320,
        unit: 'sheets',
        basePrice: 65.0,
        maxLeadTimeDays: 10,
        category: 'Timber',
      },
      {
        partNumber: 'BOQ-0008',
        description: 'Timber Lumber 2x4x8',
        specification: 'BS EN 14081 C24 Kiln Dried Structural Graded',
        quantity: 750,
        unit: 'pieces',
        basePrice: 8.5,
        maxLeadTimeDays: 10,
        category: 'Timber',
      },
      {
        partNumber: 'BOQ-0009',
        description: 'Clay Bricks Standard',
        specification: 'BS EN 771-1 F2 Frost Resistant Facing 215x102.5x65mm',
        quantity: 85,
        unit: '1000 pcs',
        basePrice: 420.0,
        maxLeadTimeDays: 14,
        category: 'Masonry',
      },
      {
        partNumber: 'BOQ-0010',
        description: 'Concrete Blocks 8"',
        specification: 'BS EN 771-3 7.3N High Strength Dense Aggregate',
        quantity: 190,
        unit: '100 pcs',
        basePrice: 180.0,
        maxLeadTimeDays: 10,
        category: 'Masonry',
      },
      {
        partNumber: 'BOQ-0011',
        description: 'PVC Pipes 4" Schedule 40',
        specification: 'BS EN 1401-1 SN8 Heavy Duty Soil & Drainage',
        quantity: 540,
        unit: 'm',
        basePrice: 15.5,
        maxLeadTimeDays: 7,
        category: 'Plumbing',
      },
      {
        partNumber: 'BOQ-0012',
        description: 'Electrical Conduit 1" PVC',
        specification: 'BS EN 61386-21 Heavy Gauge LSF Fire Retardant',
        quantity: 900,
        unit: 'm',
        basePrice: 4.25,
        maxLeadTimeDays: 7,
        category: 'Electrical',
      },
    ],
  },
  {
    id: 'manchester-plaza-steel',
    title: 'Manchester City Centre Plaza — Structural Steel & Piling',
    shortLabel: '🏢 Manchester Plaza Steel BoM (8 items)',
    location: 'Deansgate, Manchester M3',
    projectType: 'Commercial Steel Frame Podium & Composite Decking',
    contractValue: '$618,400 Est. Material Package',
    fileName: 'Manchester_City_Plaza_Steel_BoM.csv',
    csvUrl: 'examples/Manchester_City_Plaza_Steel_BoM.csv',
    defaultPrompt:
      'Source structural steel frame and piling BOQ for Manchester City Centre Plaza. Require UKCA Execution Class 3 mill certificates and verify lead times under 21 days.',
    items: [
      {
        partNumber: 'BOQ-1001',
        description: 'Universal Steel Beam UKB 457x191x67 S355JR',
        specification: 'BS EN 10025-2 Shotblasted & Weldable Primer',
        quantity: 185,
        unit: 'ton',
        basePrice: 980.0,
        maxLeadTimeDays: 21,
        category: 'Steel',
      },
      {
        partNumber: 'BOQ-1002',
        description: 'Universal Steel Column UKC 305x305x137 S355J2',
        specification: 'BS EN 10025-2 UKCA Execution Class 3',
        quantity: 120,
        unit: 'ton',
        basePrice: 1040.0,
        maxLeadTimeDays: 21,
        category: 'Steel',
      },
      {
        partNumber: 'BOQ-1003',
        description: 'Composite Metal Floor Decking 60mm (1.2mm Gauge)',
        specification: 'BS EN 10346 Galvanized Z275 Re-Entrant Profile',
        quantity: 3400,
        unit: 'm²',
        basePrice: 18.5,
        maxLeadTimeDays: 14,
        category: 'Steel',
      },
      {
        partNumber: 'BOQ-1004',
        description: 'Steel Reinforcement Bars 20mm B500B',
        specification: 'BS 4449 CARES Certified Straight Lengths',
        quantity: 95,
        unit: 'ton',
        basePrice: 860.0,
        maxLeadTimeDays: 10,
        category: 'Steel',
      },
      {
        partNumber: 'BOQ-1005',
        description: 'Structural Bolts M24x80 Grade 8.8 HSFG',
        specification: 'BS EN 14399-3 Hot Dip Galvanized Assemblies',
        quantity: 420,
        unit: '100 pcs',
        basePrice: 135.0,
        maxLeadTimeDays: 7,
        category: 'Steel',
      },
      {
        partNumber: 'BOQ-1006',
        description: 'Intumescent Fire Protection Coating (120-Min)',
        specification: 'BS 476-21 Thin Film Reactive Basecoat 25L',
        quantity: 280,
        unit: 'drums',
        basePrice: 210.0,
        maxLeadTimeDays: 10,
        category: 'Cement',
      },
      {
        partNumber: 'BOQ-1007',
        description: 'Ready-Mix Concrete M40 Pile Cap Mix',
        specification: 'BS 8500-2 C32/40 Sulphate Resisting SRPC',
        quantity: 410,
        unit: 'm³',
        basePrice: 158.0,
        maxLeadTimeDays: 5,
        category: 'Concrete',
      },
      {
        partNumber: 'BOQ-1008',
        description: 'Welded Steel Fabric Mesh A393 (2.4x4.8m)',
        specification: 'BS 4483 Ribbed High Tensile 10mm Wire',
        quantity: 550,
        unit: 'sheets',
        basePrice: 72.0,
        maxLeadTimeDays: 7,
        category: 'Steel',
      },
    ],
  },
  {
    id: 'birmingham-eco-housing',
    title: 'Birmingham Eco-Residential Estate (85 Timber-Frame Units)',
    shortLabel: '🏘️ Birmingham Residential BoM (8 items)',
    location: 'Edgbaston, Birmingham B15',
    projectType: 'Low-Carbon Timber Frame & Masonry Housing Development',
    contractValue: '$214,600 Est. Material Package',
    fileName: 'Birmingham_Eco_Residential_BoM.csv',
    csvUrl: 'examples/Birmingham_Eco_Residential_BoM.csv',
    defaultPrompt:
      'Optimize procurement for 85-unit Birmingham Eco-Residential Estate. Require 100% FSC/PEFC Chain of Custody on all timber and WRAS/BASEC compliance on MEP.',
    items: [
      {
        partNumber: 'BOQ-2001',
        description: 'Engineered LVL Structural Beams 45x240mm',
        specification: 'BS EN 14374 PEFC Chain of Custody Certified',
        quantity: 1450,
        unit: 'm',
        basePrice: 14.8,
        maxLeadTimeDays: 14,
        category: 'Timber',
      },
      {
        partNumber: 'BOQ-2002',
        description: 'Timber Lumber 2x6x8 C24 Pressure Treated',
        specification: 'BS 8417 UC3 Kiln Dried Structural Framing',
        quantity: 2200,
        unit: 'pieces',
        basePrice: 11.2,
        maxLeadTimeDays: 7,
        category: 'Timber',
      },
      {
        partNumber: 'BOQ-2003',
        description: 'Plywood 18mm Marine Grade Structural Decking',
        specification: 'BS EN 636-3 S T&G FSC 100% Certified',
        quantity: 680,
        unit: 'sheets',
        basePrice: 62.0,
        maxLeadTimeDays: 7,
        category: 'Timber',
      },
      {
        partNumber: 'BOQ-2004',
        description: 'Clay Bricks Standard Cotswold Buff Facing',
        specification: 'BS EN 771-1 F2 Low Soluble Salt',
        quantity: 110,
        unit: '1000 pcs',
        basePrice: 445.0,
        maxLeadTimeDays: 14,
        category: 'Masonry',
      },
      {
        partNumber: 'BOQ-2005',
        description: 'Concrete Blocks 6" Thermal Aircrete 3.6N',
        specification: 'BS EN 771-4 Lambda 0.11 W/mK Part L Compliant',
        quantity: 310,
        unit: '100 pcs',
        basePrice: 162.0,
        maxLeadTimeDays: 7,
        category: 'Masonry',
      },
      {
        partNumber: 'BOQ-2006',
        description: 'PEX-a Barrier Plumbing Pipe 22mm Coil',
        specification: 'BS 7291-3 WRAS Approved Heating & Potable',
        quantity: 1800,
        unit: 'm',
        basePrice: 2.95,
        maxLeadTimeDays: 5,
        category: 'Plumbing',
      },
      {
        partNumber: 'BOQ-2007',
        description: 'Copper Wire 12 AWG Twin & Earth LSF 2.5mm²',
        specification: 'BS 6724 BASEC Approved Low Smoke Zero Halogen',
        quantity: 3200,
        unit: 'm',
        basePrice: 1.85,
        maxLeadTimeDays: 5,
        category: 'Electrical',
      },
      {
        partNumber: 'BOQ-2008',
        description: 'Portland Cement Type I Eco-Blend CEM II/A-L',
        specification: 'BS EN 197-1 Reduced Embodied Carbon',
        quantity: 600,
        unit: 'bags',
        basePrice: 11.8,
        maxLeadTimeDays: 7,
        category: 'Cement',
      },
    ],
  },
  {
    id: 'thames-viaduct-civil',
    title: 'Thames Crossing Viaduct Approach — Heavy Civil Works',
    shortLabel: '🌉 Thames Viaduct Civil BoM (7 items)',
    location: 'Lower Thames Corridor (East London / Kent)',
    projectType: 'Highway Viaduct Piers, Marine Concrete & Drainage',
    contractValue: '$829,500 Est. Material Package',
    fileName: 'Thames_Crossing_Viaduct_Civil_BoM.csv',
    csvUrl: 'examples/Thames_Crossing_Viaduct_Civil_BoM.csv',
    defaultPrompt:
      'Run heavy civil procurement analysis for Thames Crossing Viaduct Approach. Verify XS3 marine concrete chloride resistance, B500C seismic rebar ductility, and FORS Gold haulage.',
    items: [
      {
        partNumber: 'BOQ-3001',
        description: 'Ready-Mix Concrete M50 Marine Grade (C40/50)',
        specification: 'BS 8500-2 50% GGBS Replacement XS3 Exposure',
        quantity: 1250,
        unit: 'm³',
        basePrice: 172.0,
        maxLeadTimeDays: 5,
        category: 'Concrete',
      },
      {
        partNumber: 'BOQ-3002',
        description: 'Steel Reinforcement Bars 32mm B500C Seismic',
        specification: 'BS 4449 High Ductility Class C CARES Approved',
        quantity: 380,
        unit: 'ton',
        basePrice: 910.0,
        maxLeadTimeDays: 14,
        category: 'Steel',
      },
      {
        partNumber: 'BOQ-3003',
        description: 'Aggregates 40mm Crushed Basalt Type 1 Sub-base',
        specification: 'SHW Clause 803 Unbound Mixture',
        quantity: 1900,
        unit: 'm³',
        basePrice: 49.0,
        maxLeadTimeDays: 7,
        category: 'Aggregates',
      },
      {
        partNumber: 'BOQ-3004',
        description: 'Sand Fine Grade Sharp Screed & Bedding',
        specification: 'BS EN 12620 0/4mm Washed Grit Sand',
        quantity: 820,
        unit: 'm³',
        basePrice: 39.5,
        maxLeadTimeDays: 5,
        category: 'Aggregates',
      },
      {
        partNumber: 'BOQ-3005',
        description: 'Precast Concrete Box Culvert 2400x1800mm',
        specification: 'BS EN 14844 Highway LM1 Loading',
        quantity: 65,
        unit: 'units',
        basePrice: 1420.0,
        maxLeadTimeDays: 21,
        category: 'Concrete',
      },
      {
        partNumber: 'BOQ-3006',
        description: 'PVC Pipes 4" Schedule 40 Perforated Highway Drain',
        specification: 'BS EN 1401-1 Twinwall SDR41 Ring Stiffness SN8',
        quantity: 1400,
        unit: 'm',
        basePrice: 15.8,
        maxLeadTimeDays: 7,
        category: 'Plumbing',
      },
      {
        partNumber: 'BOQ-3007',
        description: 'Plywood 18mm Marine Grade Heavy Pier Shutter',
        specification: 'BS 1088 Birch Core 220g/m² Phenolic Overlay',
        quantity: 460,
        unit: 'sheets',
        basePrice: 68.0,
        maxLeadTimeDays: 7,
        category: 'Timber',
      },
    ],
  },
];

export const EXAMPLE_SUPPLIER_CATALOGS: ExampleSupplierCatalog[] = [
  {
    id: 'selco-full-catalog',
    title: 'Selco Builders Full Multi-Trade Catalog (20 SKUs)',
    shortLabel: '📦 Selco Multi-Trade Catalog (20 SKUs)',
    fileName: 'Selco_Builders_Catalog_2026.csv',
    csvUrl: 'examples/Selco_Builders_Catalog_2026.csv',
    defaultPrompt:
      'Analyze our 20-SKU multi-trade builders warehouse catalog against Q4 UK construction demand. Optimize unit margins on tight-supply steel & concrete while keeping high-velocity cement competitive.',
    items: [
      { sku: 'SKU-00001', name: 'Portland Cement Type I', category: 'Cement & Binders', unit: 'bag (25kg)', yourPrice: 12.40, marketBenchmark: 13.15, supplyCondition: 'Normal', demand: 'Very\u00A0High', competitorCount: 9 },
      { sku: 'SKU-00002', name: 'Ready-Mix Concrete M25', category: 'Concrete', unit: 'm³', yourPrice: 132.00, marketBenchmark: 138.50, supplyCondition: 'Normal', demand: 'High', competitorCount: 7 },
      { sku: 'SKU-00003', name: 'Ready-Mix Concrete M30', category: 'Concrete', unit: 'm³', yourPrice: 144.50, marketBenchmark: 154.20, supplyCondition: 'Tight', demand: 'Very\u00A0High', competitorCount: 5 },
      { sku: 'SKU-00004', name: 'Steel Reinforcement Bars 10mm', category: 'Steel & Metal', unit: 'ton', yourPrice: 835.00, marketBenchmark: 862.00, supplyCondition: 'Limited', demand: 'High', competitorCount: 6 },
      { sku: 'SKU-00005', name: 'Steel Reinforcement Bars 12mm', category: 'Steel & Metal', unit: 'ton', yourPrice: 848.00, marketBenchmark: 889.50, supplyCondition: 'Tight', demand: 'Very\u00A0High', competitorCount: 4 },
      { sku: 'SKU-00006', name: 'Steel Reinforcement Bars 16mm', category: 'Steel & Metal', unit: 'ton', yourPrice: 872.00, marketBenchmark: 918.00, supplyCondition: 'Tight', demand: 'Very\u00A0High', competitorCount: 4 },
      { sku: 'SKU-00007', name: 'Aggregates 20mm', category: 'Aggregates', unit: 'm³', yourPrice: 44.00, marketBenchmark: 46.80, supplyCondition: 'Abundant', demand: 'High', competitorCount: 11 },
      { sku: 'SKU-00008', name: 'Aggregates 40mm', category: 'Aggregates', unit: 'm³', yourPrice: 47.50, marketBenchmark: 45.90, supplyCondition: 'Abundant', demand: 'Moderate', competitorCount: 12 },
      { sku: 'SKU-00009', name: 'Sand Fine Grade', category: 'Sand', unit: 'm³', yourPrice: 37.50, marketBenchmark: 39.90, supplyCondition: 'Normal', demand: 'High', competitorCount: 10 },
      { sku: 'SKU-00010', name: 'Plywood 12mm Marine Grade', category: 'Timber & Wood', unit: 'sheet', yourPrice: 49.00, marketBenchmark: 52.40, supplyCondition: 'Limited', demand: 'Moderate', competitorCount: 8 },
      { sku: 'SKU-00011', name: 'Plywood 18mm Marine Grade', category: 'Timber & Wood', unit: 'sheet', yourPrice: 64.00, marketBenchmark: 68.90, supplyCondition: 'Limited', demand: 'High', competitorCount: 6 },
      { sku: 'SKU-00012', name: 'Timber Lumber 2x4x8', category: 'Timber & Wood', unit: 'piece', yourPrice: 8.40, marketBenchmark: 8.95, supplyCondition: 'Normal', demand: 'High', competitorCount: 11 },
      { sku: 'SKU-00013', name: 'Timber Lumber 2x6x8', category: 'Timber & Wood', unit: 'piece', yourPrice: 11.60, marketBenchmark: 12.30, supplyCondition: 'Normal', demand: 'Moderate', competitorCount: 9 },
      { sku: 'SKU-00014', name: 'Clay Bricks Standard', category: 'Masonry', unit: '1000 pcs', yourPrice: 418.00, marketBenchmark: 436.00, supplyCondition: 'Normal', demand: 'High', competitorCount: 7 },
      { sku: 'SKU-00015', name: 'Concrete Blocks 6"', category: 'Masonry', unit: '100 pcs', yourPrice: 155.00, marketBenchmark: 149.50, supplyCondition: 'Abundant', demand: 'Low', competitorCount: 13 },
      { sku: 'SKU-00016', name: 'Concrete Blocks 8"', category: 'Masonry', unit: '100 pcs', yourPrice: 179.00, marketBenchmark: 188.40, supplyCondition: 'Normal', demand: 'High', competitorCount: 8 },
      { sku: 'SKU-00017', name: 'PVC Pipes 2" Schedule 40', category: 'Plumbing', unit: 'm', yourPrice: 9.80, marketBenchmark: 9.45, supplyCondition: 'Abundant', demand: 'Moderate', competitorCount: 10 },
      { sku: 'SKU-00018', name: 'PVC Pipes 4" Schedule 40', category: 'Plumbing', unit: 'm', yourPrice: 15.20, marketBenchmark: 16.40, supplyCondition: 'Limited', demand: 'High', competitorCount: 6 },
      { sku: 'SKU-00019', name: 'Electrical Conduit 1" PVC', category: 'Electrical', unit: 'm', yourPrice: 4.15, marketBenchmark: 4.50, supplyCondition: 'Normal', demand: 'High', competitorCount: 9 },
      { sku: 'SKU-00020', name: 'Electrical Wire 12 AWG', category: 'Electrical', unit: 'meter', yourPrice: 1.95, marketBenchmark: 2.18, supplyCondition: 'Tight', demand: 'Very\u00A0High', competitorCount: 5 },
    ],
  },
  {
    id: 'steel-metal-mill-catalog',
    title: 'Steel & Metal Co. Structural Mill Catalog (8 SKUs)',
    shortLabel: '🔩 Structural Steel & Rebar Catalog (8 SKUs)',
    fileName: 'Steel_And_Metal_Mill_Catalog.csv',
    csvUrl: 'examples/Steel_And_Metal_Mill_Catalog.csv',
    defaultPrompt:
      'Run Nail Agent pricing strategy on our structural steel & CARES rebar mill catalog. Target Manchester & London high-rise tenders and capture premium margin on UKCA Ex3 sections.',
    items: [
      { sku: 'SKU-10001', name: 'Universal Steel Beam UKB 457x191x67 S355JR', category: 'Steel & Metal', unit: 'ton', yourPrice: 965.00, marketBenchmark: 1018.00, supplyCondition: 'Tight', demand: 'Very\u00A0High', competitorCount: 4 },
      { sku: 'SKU-10002', name: 'Universal Steel Column UKC 305x305x137 S355J2', category: 'Steel & Metal', unit: 'ton', yourPrice: 1025.00, marketBenchmark: 1085.00, supplyCondition: 'Tight', demand: 'Very\u00A0High', competitorCount: 3 },
      { sku: 'SKU-10003', name: 'Steel Reinforcement Bars 12mm B500B', category: 'Steel & Metal', unit: 'ton', yourPrice: 815.00, marketBenchmark: 854.00, supplyCondition: 'Limited', demand: 'High', competitorCount: 6 },
      { sku: 'SKU-10004', name: 'Steel Reinforcement Bars 16mm B500B', category: 'Steel & Metal', unit: 'ton', yourPrice: 838.00, marketBenchmark: 882.00, supplyCondition: 'Tight', demand: 'Very\u00A0High', competitorCount: 5 },
      { sku: 'SKU-10005', name: 'Steel Reinforcement Bars 32mm B500C Seismic', category: 'Steel & Metal', unit: 'ton', yourPrice: 895.00, marketBenchmark: 948.00, supplyCondition: 'Tight', demand: 'Very\u00A0High', competitorCount: 3 },
      { sku: 'SKU-10006', name: 'Composite Metal Floor Decking 60mm', category: 'Steel & Metal', unit: 'm²', yourPrice: 17.80, marketBenchmark: 19.10, supplyCondition: 'Limited', demand: 'High', competitorCount: 5 },
      { sku: 'SKU-10007', name: 'Welded Steel Fabric Mesh A393', category: 'Steel & Metal', unit: 'sheet', yourPrice: 69.50, marketBenchmark: 73.20, supplyCondition: 'Normal', demand: 'High', competitorCount: 8 },
      { sku: 'SKU-10008', name: 'Structural Bolts M24x80 Grade 8.8 HSFG', category: 'Fasteners', unit: '100 pcs', yourPrice: 129.00, marketBenchmark: 136.50, supplyCondition: 'Normal', demand: 'Moderate', competitorCount: 9 },
    ],
  },
  {
    id: 'timber-mep-catalog',
    title: 'Timber Solutions & MEP Wholesale Catalog (8 SKUs)',
    shortLabel: '🌲 Timber & MEP Wholesale Catalog (8 SKUs)',
    fileName: 'Timber_And_MEP_Wholesale_Catalog.csv',
    csvUrl: 'examples/Timber_And_MEP_Wholesale_Catalog.csv',
    defaultPrompt:
      'Analyze FSC timber and MEP wholesale inventory for residential housing estates in the Midlands. Balance turnover velocity against rising copper and marine plywood spot rates.',
    items: [
      { sku: 'SKU-20001', name: 'Engineered LVL Structural Beams 45x240mm', category: 'Timber & Wood', unit: 'm', yourPrice: 14.60, marketBenchmark: 15.55, supplyCondition: 'Limited', demand: 'Very\u00A0High', competitorCount: 4 },
      { sku: 'SKU-20002', name: 'Timber Lumber 2x4x8 C24 Kiln Dried', category: 'Timber & Wood', unit: 'piece', yourPrice: 8.10, marketBenchmark: 8.60, supplyCondition: 'Normal', demand: 'High', competitorCount: 10 },
      { sku: 'SKU-20003', name: 'Timber Lumber 2x6x8 C24 Pressure Treated', category: 'Timber & Wood', unit: 'piece', yourPrice: 10.90, marketBenchmark: 11.75, supplyCondition: 'Limited', demand: 'High', competitorCount: 7 },
      { sku: 'SKU-20004', name: 'Plywood 18mm Marine Grade WBP', category: 'Timber & Wood', unit: 'sheet', yourPrice: 61.50, marketBenchmark: 65.80, supplyCondition: 'Limited', demand: 'High', competitorCount: 6 },
      { sku: 'SKU-20005', name: 'PEX-a Barrier Plumbing Pipe 22mm', category: 'Plumbing', unit: 'm', yourPrice: 2.85, marketBenchmark: 3.05, supplyCondition: 'Normal', demand: 'High', competitorCount: 8 },
      { sku: 'SKU-20006', name: 'PVC Pipes 4" Schedule 40 Soil & Drainage', category: 'Plumbing', unit: 'm', yourPrice: 14.90, marketBenchmark: 15.70, supplyCondition: 'Normal', demand: 'Moderate', competitorCount: 9 },
      { sku: 'SKU-20007', name: 'Copper Wire 12 AWG Twin & Earth LSF', category: 'Electrical', unit: 'meter', yourPrice: 1.78, marketBenchmark: 1.96, supplyCondition: 'Tight', demand: 'Very\u00A0High', competitorCount: 5 },
      { sku: 'SKU-20008', name: 'Electrical Conduit 1" PVC Heavy Gauge', category: 'Electrical', unit: 'm', yourPrice: 3.95, marketBenchmark: 3.82, supplyCondition: 'Abundant', demand: 'Moderate', competitorCount: 11 },
    ],
  },
];

export const CONTRACTOR_OPPORTUNITIES: ContractorOpportunity[] = [
  {
    id: 'opp-canary-wharf',
    title: 'Canary Wharf Development',
    materialsSummary: 'Cement & Aggregates • 2,400 tonnes',
    value: '£268K',
    matchPercent: 85,
    distance: '5.2 km',
    deadline: 'Deadline: 5 days',
    contractorName: 'Balfour Tier-1 Canary JV',
    projectCode: 'CW-P3-CIV-09',
    linkedCatalogId: 'selco-full-catalog',
    promptForNail:
      'Match catalog against Canary Wharf Development tender (£268K • Cement & Aggregates 2,400 tonnes • 5.2 km away). Optimize bid pricing for 85%+ win probability.',
    requiredItems: [
      { partNumber: 'CW-01', material: 'Portland Cement Type I (CEM I 52.5N)', quantity: 8500, unit: 'bag (25kg)', targetRate: 12.80, recommendedBidRate: 12.35, winProbability: '91%' },
      { partNumber: 'CW-02', material: 'Ready-Mix Concrete M30 Pumpable', quantity: 620, unit: 'm³', targetRate: 152.00, recommendedBidRate: 146.50, winProbability: '88%' },
      { partNumber: 'CW-03', material: 'Aggregates 20mm Graded Granite', quantity: 950, unit: 'm³', targetRate: 46.50, recommendedBidRate: 44.20, winProbability: '86%' },
      { partNumber: 'CW-04', material: 'Sand Fine Grade Washed Concreting', quantity: 640, unit: 'm³', targetRate: 39.50, recommendedBidRate: 37.80, winProbability: '89%' },
    ],
  },
  {
    id: 'opp-manchester-plaza',
    title: 'Manchester City Centre Plaza',
    materialsSummary: 'Steel Beams & Rebar • 180 tonnes',
    value: '£101K',
    matchPercent: 72,
    distance: '8.2 km',
    deadline: 'Deadline: 8 days',
    contractorName: 'NorthWest Structural Build Ltd',
    projectCode: 'MCR-PLZ-STL-04',
    linkedCatalogId: 'steel-metal-mill-catalog',
    promptForNail:
      'Match catalog against Manchester City Centre Plaza tender (£101K • Steel Beams & Rebar 180 tonnes • 8.2 km away). Verify CARES/UKCA Ex3 compliance and generate dynamic quote.',
    requiredItems: [
      { partNumber: 'MCR-01', material: 'Universal Steel Beam UKB 457x191x67 S355JR', quantity: 65, unit: 'ton', targetRate: 1010.00, recommendedBidRate: 978.00, winProbability: '84%' },
      { partNumber: 'MCR-02', material: 'Steel Reinforcement Bars 16mm B500B', quantity: 75, unit: 'ton', targetRate: 880.00, recommendedBidRate: 852.00, winProbability: '87%' },
      { partNumber: 'MCR-03', material: 'Steel Reinforcement Bars 12mm B500B', quantity: 40, unit: 'ton', targetRate: 850.00, recommendedBidRate: 826.00, winProbability: '85%' },
    ],
  },
  {
    id: 'opp-birmingham-residential',
    title: 'Birmingham Residential Estate',
    materialsSummary: 'Lumber & Plywood • Mixed materials',
    value: '£71K',
    matchPercent: 68,
    distance: '12.5 km',
    deadline: 'Deadline: 3 days',
    deadlineUrgent: true,
    contractorName: 'Midlands Eco-Homes Group',
    projectCode: 'BHX-RES-TIM-12',
    linkedCatalogId: 'timber-mep-catalog',
    promptForNail:
      'Match catalog against urgent Birmingham Residential Estate tender (£71K • Lumber & Plywood • 3 days left). Prioritize immediate stock availability and FSC certification.',
    requiredItems: [
      { partNumber: 'BHX-01', material: 'Timber Lumber 2x6x8 C24 Pressure Treated', quantity: 2200, unit: 'piece', targetRate: 11.60, recommendedBidRate: 11.15, winProbability: '86%' },
      { partNumber: 'BHX-02', material: 'Plywood 18mm Marine Grade WBP', quantity: 680, unit: 'sheet', targetRate: 65.00, recommendedBidRate: 62.40, winProbability: '83%' },
      { partNumber: 'BHX-03', material: 'Engineered LVL Structural Beams 45x240mm', quantity: 1450, unit: 'm', targetRate: 15.40, recommendedBidRate: 14.85, winProbability: '88%' },
    ],
  },
];
