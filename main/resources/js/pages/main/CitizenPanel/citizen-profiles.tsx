import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import {
    ArrowLeft, Search, Plus, PenSquare, Trash2,
    User, MapPin, Briefcase, UserX, GraduationCap,
    HeartPulse, Baby, Phone, Hash, Calendar, Flag,
    AlertCircle, FileBadge
} from 'lucide-react';
import { useState } from 'react';

// --- 1. Comprehensive Type Definition ---
interface Citizen {
    id: number;
    // Header
    firstName: string;
    middleName: string;
    lastName: string;
    suffix?: string;
    citizenId: string;
    status: string; // Active, Deceased, Moved

    // Personal
    dob: string;
    age: number;
    sex: string;
    bloodType: string;
    civilStatus: string;
    religion: string;
    pob: string; // Place of Birth

    // Contact (Dynamic Array) & Address
    email: string;
    contact: string[];
    fullAddress: string;
    sitio: string;

    // Socio-Economic
    employmentStatus: string;
    occupation: string;
    socioEconomicStatus: string;

    // Flags
    isGovWorker: boolean;
    isStudent: boolean;
    isVoter: boolean;
    isIp: boolean;
    isDeceased: boolean;

    // Conditional Data
    dateOfDeath?: string;
    causeOfDeath?: string;

    educAttainment?: string;
    schoolName?: string;

    fpStatus?: string; // Family Planning
    fpMethod?: string;
    fpDateStarted?: string;
    fpDateEnded?: string;

    // System IDs
    nhtsNumber?: string;
    householdId: string;
    relationship: string;
    philhealthCategory?: string;
    philhealthId?: string;
    membershipType?: string;
    healthClassification?: string;

    // Audit
    dateEncoded: string;
    encodedBy: string;
    dateUpdated: string;
    updatedBy: string;
}

// --- 2. 20 Example Data Entries ---
const mockCitizens: Citizen[] = [
    {
        id: 1, firstName: 'Roberto', middleName: 'Jose', lastName: 'Cadulang', suffix: 'Jr.', citizenId: 'CIT-2025-001', status: 'Active',
        dob: '1980-05-12', age: 45, sex: 'Male', bloodType: 'O+', civilStatus: 'Married', religion: 'Roman Catholic', pob: 'Cebu City',
        email: 'roberto@email.com', contact: ['09171234567', '09987654321'], fullAddress: 'House 123, Cadulang 2, Marigondon', sitio: 'Cadulang 2',
        employmentStatus: 'Employed', occupation: 'Carpenter', socioEconomicStatus: 'Low Income',
        isGovWorker: false, isStudent: false, isVoter: true, isIp: false, isDeceased: false,
        fpStatus: 'Active', fpMethod: 'Condoms', fpDateStarted: '2023-01-01',
        nhtsNumber: 'NHTS-10001', householdId: 'HH-001', relationship: 'Head', philhealthCategory: 'Indigent', philhealthId: '12-0000001-0', membershipType: 'Member', healthClassification: 'Healthy',
        dateEncoded: '2024-01-15', encodedBy: 'ADMIN', dateUpdated: '2025-08-15', updatedBy: 'Ian N. Majica'
    },
    {
        id: 2, firstName: 'Maria', middleName: 'Anne', lastName: 'Santos', suffix: '', citizenId: 'CIT-2025-002', status: 'Active',
        dob: '2003-02-20', age: 22, sex: 'Female', bloodType: 'A+', civilStatus: 'Single', religion: 'Roman Catholic', pob: 'Davao City',
        email: 'maria.s@email.com', contact: ['09123456789'], fullAddress: 'Lot 4, Chocolate Hills, Marigondon', sitio: 'Chocolate Hills',
        employmentStatus: 'Unemployed', occupation: 'Student', socioEconomicStatus: 'Middle Income',
        isGovWorker: false, isStudent: true, isVoter: true, isIp: false, isDeceased: false,
        educAttainment: 'College Level', schoolName: 'Cebu Normal University',
        householdId: 'HH-005', relationship: 'Daughter', philhealthCategory: 'Dependent', philhealthId: 'N/A', membershipType: 'N/A', healthClassification: 'Healthy',
        dateEncoded: '2024-02-20', encodedBy: 'ADMIN', dateUpdated: '2025-09-13', updatedBy: 'ADMIN'
    },
    {
        id: 3, firstName: 'Juan', middleName: 'Dela', lastName: 'Gonzales', suffix: '', citizenId: 'CIT-2025-003', status: 'Deceased',
        dob: '1950-11-01', age: 75, sex: 'Male', bloodType: 'B-', civilStatus: 'Widowed', religion: 'Iglesia ni Cristo', pob: 'Manila',
        email: 'N/A', contact: [], fullAddress: 'Blk 1, Marigondon Proper', sitio: 'Marigondon Proper',
        employmentStatus: 'Retired', occupation: 'Retired Teacher', socioEconomicStatus: 'Pensioner',
        isGovWorker: true, isStudent: false, isVoter: true, isIp: false, isDeceased: true,
        dateOfDeath: '2025-01-01', causeOfDeath: 'Cardiac Arrest',
        householdId: 'HH-010', relationship: 'Head', philhealthCategory: 'Senior Citizen', philhealthId: '02-1234567-8', membershipType: 'Member', healthClassification: 'Hypertensive',
        dateEncoded: '2023-11-01', encodedBy: 'ADMIN', dateUpdated: '2025-01-02', updatedBy: 'System'
    },
    {
        id: 4, firstName: 'Elena', middleName: 'Cruz', lastName: 'Bautista', suffix: '', citizenId: 'CIT-2025-004', status: 'Active',
        dob: '1990-07-15', age: 35, sex: 'Female', bloodType: 'AB+', civilStatus: 'Married', religion: 'Roman Catholic', pob: 'Lapu-Lapu City',
        email: 'elena.b@gmail.com', contact: ['09225556666'], fullAddress: 'Purok 3, Suba-Basbas', sitio: 'Suba-Basbas',
        employmentStatus: 'Employed', occupation: 'Government Employee', socioEconomicStatus: 'Middle Income',
        isGovWorker: true, isStudent: false, isVoter: true, isIp: false, isDeceased: false,
        fpStatus: 'Active', fpMethod: 'Pills', fpDateStarted: '2020-05-10',
        householdId: 'HH-022', relationship: 'Wife', philhealthCategory: 'Formal Economy', philhealthId: '10-2223334-5', membershipType: 'Member', healthClassification: 'Healthy',
        dateEncoded: '2024-03-10', encodedBy: 'STAFF_01', dateUpdated: '2025-02-01', updatedBy: 'ADMIN'
    },
    {
        id: 5, firstName: 'Pedro', middleName: 'Penduko', lastName: 'Magtanggol', suffix: '', citizenId: 'CIT-2025-005', status: 'Active',
        dob: '1975-08-30', age: 50, sex: 'Male', bloodType: 'O-', civilStatus: 'Separated', religion: 'Born Again', pob: 'Leyte',
        email: 'pedro.m@yahoo.com', contact: ['09181112222', '09203334444'], fullAddress: 'Sitio Kawayan, Marigondon', sitio: 'Kawayan',
        employmentStatus: 'Self-Employed', occupation: 'Tricycle Driver', socioEconomicStatus: 'Low Income',
        isGovWorker: false, isStudent: false, isVoter: true, isIp: false, isDeceased: false,
        nhtsNumber: 'NHTS-54321', householdId: 'HH-030', relationship: 'Head', philhealthCategory: 'Informal Economy', philhealthId: '11-3334445-6', membershipType: 'Member', healthClassification: 'Smoker',
        dateEncoded: '2024-01-20', encodedBy: 'ADMIN', dateUpdated: '2025-06-15', updatedBy: 'STAFF_02'
    },
    {
        id: 6, firstName: 'Linda', middleName: 'Reyes', lastName: 'Lim', suffix: '', citizenId: 'CIT-2025-006', status: 'Active',
        dob: '1960-12-25', age: 65, sex: 'Female', bloodType: 'A-', civilStatus: 'Widowed', religion: 'Buddhist', pob: 'Cebu City',
        email: 'linda.lim@gmail.com', contact: ['09178889999'], fullAddress: 'Villa del Rio, Marigondon', sitio: 'Villa del Rio',
        employmentStatus: 'Retired', occupation: 'Business Owner', socioEconomicStatus: 'High Income',
        isGovWorker: false, isStudent: false, isVoter: true, isIp: false, isDeceased: false,
        householdId: 'HH-045', relationship: 'Head', philhealthCategory: 'Senior Citizen', philhealthId: '08-5556667-8', membershipType: 'Lifetime', healthClassification: 'Diabetic',
        dateEncoded: '2023-12-05', encodedBy: 'ADMIN', dateUpdated: '2025-01-10', updatedBy: 'ADMIN'
    },
    {
        id: 7, firstName: 'Miguel', middleName: 'Santos', lastName: 'Tan', suffix: '', citizenId: 'CIT-2025-007', status: 'Active',
        dob: '2015-06-01', age: 10, sex: 'Male', bloodType: 'B+', civilStatus: 'Single', religion: 'Roman Catholic', pob: 'Lapu-Lapu City',
        email: 'N/A', contact: [], fullAddress: 'Sitio Bankal, Marigondon', sitio: 'Bankal',
        employmentStatus: 'N/A', occupation: 'Student', socioEconomicStatus: 'Dependent',
        isGovWorker: false, isStudent: true, isVoter: false, isIp: false, isDeceased: false,
        educAttainment: 'Elementary', schoolName: 'Marigondon Elementary School',
        householdId: 'HH-050', relationship: 'Son', philhealthCategory: 'Dependent', philhealthId: 'N/A', membershipType: 'N/A', healthClassification: 'Healthy',
        dateEncoded: '2024-05-15', encodedBy: 'STAFF_01', dateUpdated: '2024-05-15', updatedBy: 'STAFF_01'
    },
    {
        id: 8, firstName: 'Sarah', middleName: 'Jane', lastName: 'Doe', suffix: '', citizenId: 'CIT-2025-008', status: 'Moved',
        dob: '1995-03-10', age: 30, sex: 'Female', bloodType: 'O+', civilStatus: 'Single', religion: 'Protestant', pob: 'USA',
        email: 'sarah.doe@email.com', contact: ['09991112222'], fullAddress: 'Sitio Timpolok, Marigondon', sitio: 'Timpolok',
        employmentStatus: 'Employed', occupation: 'Call Center Agent', socioEconomicStatus: 'Middle Income',
        isGovWorker: false, isStudent: false, isVoter: false, isIp: false, isDeceased: false,
        householdId: 'HH-060', relationship: 'Head', philhealthCategory: 'Formal Economy', philhealthId: '14-7778889-0', membershipType: 'Member', healthClassification: 'Healthy',
        dateEncoded: '2024-04-01', encodedBy: 'ADMIN', dateUpdated: '2025-10-01', updatedBy: 'ADMIN'
    },
    {
        id: 9, firstName: 'Datu', middleName: 'Lapu', lastName: 'Silapulapu', suffix: '', citizenId: 'CIT-2025-009', status: 'Active',
        dob: '1985-04-27', age: 40, sex: 'Male', bloodType: 'AB-', civilStatus: 'Married', religion: 'Islam', pob: 'Mindanao',
        email: 'datu@email.com', contact: ['09159990000'], fullAddress: 'Sitio Basak, Marigondon', sitio: 'Basak',
        employmentStatus: 'Self-Employed', occupation: 'Vendor', socioEconomicStatus: 'Low Income',
        isGovWorker: false, isStudent: false, isVoter: true, isIp: true, isDeceased: false,
        nhtsNumber: 'NHTS-99887', householdId: 'HH-070', relationship: 'Head', philhealthCategory: 'Indigent', philhealthId: '15-1112223-4', membershipType: 'Member', healthClassification: 'Healthy',
        dateEncoded: '2024-02-10', encodedBy: 'STAFF_02', dateUpdated: '2025-07-20', updatedBy: 'STAFF_02'
    },
    {
        id: 10, firstName: 'Baby', middleName: 'Boy', lastName: 'Gomez', suffix: '', citizenId: 'CIT-2025-010', status: 'Active',
        dob: '2025-01-01', age: 0, sex: 'Male', bloodType: 'Unknown', civilStatus: 'Single', religion: 'Roman Catholic', pob: 'Lapu-Lapu City',
        email: 'N/A', contact: [], fullAddress: 'Sitio Looc, Marigondon', sitio: 'Looc',
        employmentStatus: 'N/A', occupation: 'N/A', socioEconomicStatus: 'Dependent',
        isGovWorker: false, isStudent: false, isVoter: false, isIp: false, isDeceased: false,
        householdId: 'HH-080', relationship: 'Son', philhealthCategory: 'Dependent', philhealthId: 'N/A', membershipType: 'N/A', healthClassification: 'Infant',
        dateEncoded: '2025-01-10', encodedBy: 'ADMIN', dateUpdated: '2025-01-10', updatedBy: 'ADMIN'
    },
    {
        id: 11, firstName: 'Carmen', middleName: 'Rosales', lastName: 'Vda de Cruz', suffix: '', citizenId: 'CIT-2025-011', status: 'Active',
        dob: '1945-09-15', age: 80, sex: 'Female', bloodType: 'B+', civilStatus: 'Widowed', religion: 'Roman Catholic', pob: 'Bohol',
        email: 'N/A', contact: ['09201239876'], fullAddress: 'Sitio Sangi, Marigondon', sitio: 'Sangi',
        employmentStatus: 'Retired', occupation: 'None', socioEconomicStatus: 'Pensioner',
        isGovWorker: false, isStudent: false, isVoter: true, isIp: false, isDeceased: false,
        householdId: 'HH-090', relationship: 'Head', philhealthCategory: 'Senior Citizen', philhealthId: '01-2223334-5', membershipType: 'Lifetime', healthClassification: 'Hypertensive',
        dateEncoded: '2023-10-05', encodedBy: 'STAFF_01', dateUpdated: '2025-03-12', updatedBy: 'ADMIN'
    },
    {
        id: 12, firstName: 'Rico', middleName: 'J.', lastName: 'Puno', suffix: '', citizenId: 'CIT-2025-012', status: 'Deceased',
        dob: '1955-02-14', age: 68, sex: 'Male', bloodType: 'O+', civilStatus: 'Married', religion: 'Roman Catholic', pob: 'Manila',
        email: 'N/A', contact: [], fullAddress: 'Sitio Crossing, Marigondon', sitio: 'Crossing',
        employmentStatus: 'Retired', occupation: 'Musician', socioEconomicStatus: 'High Income',
        isGovWorker: false, isStudent: false, isVoter: true, isIp: false, isDeceased: true,
        dateOfDeath: '2023-10-30', causeOfDeath: 'Heart Failure',
        householdId: 'HH-100', relationship: 'Head', philhealthCategory: 'Senior Citizen', philhealthId: '03-4445556-7', membershipType: 'Member', healthClassification: 'Deceased',
        dateEncoded: '2023-01-15', encodedBy: 'ADMIN', dateUpdated: '2023-11-01', updatedBy: 'ADMIN'
    },
    {
        id: 13, firstName: 'Jasmine', middleName: 'Lee', lastName: 'Ong', suffix: '', citizenId: 'CIT-2025-013', status: 'Active',
        dob: '1998-11-11', age: 27, sex: 'Female', bloodType: 'A+', civilStatus: 'Single', religion: 'Christian', pob: 'Cebu City',
        email: 'jasmine.ong@gmail.com', contact: ['09175554444'], fullAddress: 'Agro-Macro Subdivision, Marigondon', sitio: 'Agro-Macro',
        employmentStatus: 'Employed', occupation: 'Nurse', socioEconomicStatus: 'High Income',
        isGovWorker: false, isStudent: false, isVoter: true, isIp: false, isDeceased: false,
        fpStatus: 'N/A',
        householdId: 'HH-110', relationship: 'Daughter', philhealthCategory: 'Formal Economy', philhealthId: '16-8889990-1', membershipType: 'Member', healthClassification: 'Healthy',
        dateEncoded: '2024-06-20', encodedBy: 'ADMIN', dateUpdated: '2025-08-01', updatedBy: 'STAFF_02'
    },
    {
        id: 14, firstName: 'Antonio', middleName: 'B.', lastName: 'Luna', suffix: '', citizenId: 'CIT-2025-014', status: 'Active',
        dob: '1982-10-29', age: 43, sex: 'Male', bloodType: 'AB+', civilStatus: 'Married', religion: 'Roman Catholic', pob: 'Ilocos',
        email: 'antonio.luna@email.com', contact: ['09187776666'], fullAddress: 'Sitio Ibabao, Marigondon', sitio: 'Ibabao',
        employmentStatus: 'Employed', occupation: 'Police Officer', socioEconomicStatus: 'Middle Income',
        isGovWorker: true, isStudent: false, isVoter: true, isIp: false, isDeceased: false,
        householdId: 'HH-120', relationship: 'Head', philhealthCategory: 'Formal Economy', philhealthId: '17-2221110-9', membershipType: 'Member', healthClassification: 'Healthy',
        dateEncoded: '2024-03-15', encodedBy: 'ADMIN', dateUpdated: '2025-04-10', updatedBy: 'ADMIN'
    },
    {
        id: 15, firstName: 'Teresa', middleName: 'M.', lastName: 'Magbanua', suffix: '', citizenId: 'CIT-2025-015', status: 'Active',
        dob: '1970-05-05', age: 55, sex: 'Female', bloodType: 'O+', civilStatus: 'Separated', religion: 'Roman Catholic', pob: 'Iloilo',
        email: 'teresa.m@gmail.com', contact: ['09193332222'], fullAddress: 'Sitio Suba-Panas, Marigondon', sitio: 'Suba-Panas',
        employmentStatus: 'Self-Employed', occupation: 'Sari-sari Store Owner', socioEconomicStatus: 'Low Income',
        isGovWorker: false, isStudent: false, isVoter: true, isIp: false, isDeceased: false,
        nhtsNumber: 'NHTS-66778', householdId: 'HH-130', relationship: 'Head', philhealthCategory: 'Indigent', philhealthId: '18-4443332-1', membershipType: 'Member', healthClassification: 'Healthy',
        dateEncoded: '2023-12-12', encodedBy: 'STAFF_02', dateUpdated: '2025-02-14', updatedBy: 'STAFF_01'
    },
    {
        id: 16, firstName: 'Chris', middleName: 'P.', lastName: 'Bacon', suffix: '', citizenId: 'CIT-2025-016', status: 'Active',
        dob: '2000-01-01', age: 25, sex: 'Male', bloodType: 'A+', civilStatus: 'Single', religion: 'Agnostic', pob: 'USA',
        email: 'chris.bacon@email.com', contact: ['09228881111'], fullAddress: 'Collinwood Subdivision, Marigondon', sitio: 'Collinwood',
        employmentStatus: 'Employed', occupation: 'Freelancer', socioEconomicStatus: 'Middle Income',
        isGovWorker: false, isStudent: false, isVoter: false, isIp: false, isDeceased: false,
        householdId: 'HH-140', relationship: 'Son', philhealthCategory: 'Formal Economy', philhealthId: '19-5554443-2', membershipType: 'Member', healthClassification: 'Healthy',
        dateEncoded: '2024-07-01', encodedBy: 'ADMIN', dateUpdated: '2025-01-20', updatedBy: 'ADMIN'
    },
    {
        id: 17, firstName: 'Gabriela', middleName: 'S.', lastName: 'Silang', suffix: '', citizenId: 'CIT-2025-017', status: 'Active',
        dob: '1988-03-19', age: 37, sex: 'Female', bloodType: 'B+', civilStatus: 'Married', religion: 'Roman Catholic', pob: 'Ilocos Sur',
        email: 'gabriela@email.com', contact: ['09170001111', '09180002222'], fullAddress: 'Sitio Tumoy, Marigondon', sitio: 'Tumoy',
        employmentStatus: 'Employed', occupation: 'Social Worker', socioEconomicStatus: 'Middle Income',
        isGovWorker: true, isStudent: false, isVoter: true, isIp: false, isDeceased: false,
        fpStatus: 'Active', fpMethod: 'IUD', fpDateStarted: '2021-06-15',
        householdId: 'HH-150', relationship: 'Wife', philhealthCategory: 'Formal Economy', philhealthId: '20-6667778-9', membershipType: 'Member', healthClassification: 'Healthy',
        dateEncoded: '2024-01-30', encodedBy: 'STAFF_01', dateUpdated: '2025-05-05', updatedBy: 'ADMIN'
    },
    {
        id: 18, firstName: 'Lapu', middleName: 'Lapu', lastName: 'Dimagiba', suffix: '', citizenId: 'CIT-2025-018', status: 'Active',
        dob: '1990-04-27', age: 35, sex: 'Male', bloodType: 'O-', civilStatus: 'Single', religion: 'Animism', pob: 'Mactan',
        email: 'N/A', contact: ['09234445555'], fullAddress: 'Sitio Mactan, Marigondon', sitio: 'Mactan',
        employmentStatus: 'Self-Employed', occupation: 'Fisherman', socioEconomicStatus: 'Low Income',
        isGovWorker: false, isStudent: false, isVoter: true, isIp: true, isDeceased: false,
        nhtsNumber: 'NHTS-33221', householdId: 'HH-160', relationship: 'Head', philhealthCategory: 'Indigent', philhealthId: '21-9998887-6', membershipType: 'Member', healthClassification: 'Healthy',
        dateEncoded: '2023-11-20', encodedBy: 'ADMIN', dateUpdated: '2025-08-25', updatedBy: 'STAFF_02'
    },
    {
        id: 19, firstName: 'Melchora', middleName: 'A.', lastName: 'Aquino', suffix: '', citizenId: 'CIT-2025-019', status: 'Active',
        dob: '1930-01-06', age: 95, sex: 'Female', bloodType: 'A+', civilStatus: 'Widowed', religion: 'Roman Catholic', pob: 'Caloocan',
        email: 'N/A', contact: [], fullAddress: 'Sitio Tandang Sora, Marigondon', sitio: 'Tandang Sora',
        employmentStatus: 'Retired', occupation: 'None', socioEconomicStatus: 'Pensioner',
        isGovWorker: false, isStudent: false, isVoter: true, isIp: false, isDeceased: false,
        householdId: 'HH-170', relationship: 'Grandmother', philhealthCategory: 'Senior Citizen', philhealthId: '22-1110009-8', membershipType: 'Lifetime', healthClassification: 'Bedridden',
        dateEncoded: '2023-09-10', encodedBy: 'ADMIN', dateUpdated: '2025-01-15', updatedBy: 'ADMIN'
    },
    {
        id: 20, firstName: 'Andres', middleName: 'B.', lastName: 'Bonifacio', suffix: '', citizenId: 'CIT-2025-020', status: 'Moved',
        dob: '1992-11-30', age: 32, sex: 'Male', bloodType: 'AB-', civilStatus: 'Married', religion: 'Roman Catholic', pob: 'Manila',
        email: 'andres.b@email.com', contact: ['09152223333'], fullAddress: 'Sitio Katipunan, Marigondon', sitio: 'Katipunan',
        employmentStatus: 'Employed', occupation: 'Factory Worker', socioEconomicStatus: 'Low Income',
        isGovWorker: false, isStudent: false, isVoter: true, isIp: false, isDeceased: false,
        householdId: 'HH-180', relationship: 'Head', philhealthCategory: 'Formal Economy', philhealthId: '23-4445551-2', membershipType: 'Member', healthClassification: 'Healthy',
        dateEncoded: '2024-02-25', encodedBy: 'STAFF_01', dateUpdated: '2025-09-01', updatedBy: 'STAFF_01'
    }
];

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Citizen Panel', href: '/citizen-panel' },
    { title: 'Citizen Profiles', href: '/citizen-panel/citizen-profile' },
];

export default function CitizenProfiles() {
    const [selectedCitizen, setSelectedCitizen] = useState<Citizen | null>(mockCitizens[0]);
    const [searchQuery, setSearchQuery] = useState('');

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Citizen Profiles" />

            <div className="flex flex-col h-[calc(100vh-4rem)] p-4 lg:p-6 gap-6 overflow-hidden max-w-[1920px] mx-auto w-full">

                {/* --- Header Bar --- */}
                <div className="flex items-center gap-4 pb-2 border-b border-sidebar-border/60">
                    <Link href="/citizen-panel" className="p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors">
                        <ArrowLeft className="size-6 text-neutral-600 dark:text-neutral-300" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 uppercase tracking-tight">
                            Citizen Panel: <span className="text-blue-600 dark:text-blue-400">Citizen Profiles</span>
                        </h1>
                    </div>
                </div>

                {/* --- Main Content Split --- */}
                <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0">

                    {/* === LEFT COLUMN: Table List (Spans 4 columns) === */}
                    <div className="lg:col-span-4 flex flex-col gap-4 bg-white dark:bg-sidebar rounded-2xl border border-sidebar-border/60 shadow-sm overflow-hidden">
                        {/* Table Header / Search */}
                        <div className="p-4 bg-neutral-50/50 dark:bg-neutral-900/20 border-b border-sidebar-border/60 space-y-3">
                            <div className="flex justify-between items-center">
                                <h2 className="text-xs font-bold text-white bg-neutral-900 dark:bg-blue-600 py-1 px-3 rounded-md uppercase tracking-wider">
                                    Registered List
                                </h2>
                                <span className="text-[10px] text-neutral-400 font-mono">
                                    TOTAL: {mockCitizens.length}
                                </span>
                            </div>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-neutral-400" />
                                <input
                                    type="text"
                                    placeholder="Search Name, ID, or Sitio..."
                                    className="w-full pl-10 pr-4 py-2 text-sm border border-sidebar-border rounded-lg bg-white dark:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Table Content */}
                        <div className="flex-1 overflow-auto">
                            <div className="flex flex-col">
                                {mockCitizens.map((citizen) => (
                                    <div
                                        key={citizen.id}
                                        onClick={() => setSelectedCitizen(citizen)}
                                        // Fixed the "weird line" by keeping border-l-4 always present but colored differently
                                        className={`
                                            group cursor-pointer p-4 border-b border-sidebar-border/50 border-l-4 transition-all duration-200
                                            ${selectedCitizen?.id === citizen.id
                                            ? 'bg-blue-50 dark:bg-blue-900/20 border-l-blue-500'
                                            : 'border-l-transparent hover:bg-neutral-50 dark:hover:bg-neutral-800/50 hover:border-l-blue-200'}
                                        `}
                                    >
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h3 className={`font-bold text-sm ${selectedCitizen?.id === citizen.id ? 'text-blue-700 dark:text-blue-300' : 'text-neutral-900 dark:text-neutral-100'}`}>
                                                    {citizen.lastName}, {citizen.firstName}
                                                </h3>
                                                <p className="text-xs text-neutral-500 font-mono mt-0.5">{citizen.citizenId}</p>
                                            </div>
                                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${citizen.status === 'Deceased' ? 'bg-red-100 text-red-700' : 'bg-neutral-100 text-neutral-600'}`}>
                                                {citizen.sitio}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* === RIGHT COLUMN: Detailed Profile (Spans 8 columns) === */}
                    <div className="lg:col-span-8 flex flex-col gap-4 min-h-0">

                        {/* Action Buttons Bar */}
                        <div className="flex gap-3">
                            <ActionButton icon={<Plus className="size-4" />} label="Register" color="bg-green-600 hover:bg-green-700" />
                            <ActionButton icon={<PenSquare className="size-4" />} label="Update" color="bg-blue-600 hover:bg-blue-700" />
                            <ActionButton icon={<Trash2 className="size-4" />} label="Delete" color="bg-red-600 hover:bg-red-700" />
                        </div>

                        {/* Main Profile Container */}
                        {selectedCitizen ? (
                            <div className="flex-1 bg-white dark:bg-sidebar rounded-2xl border border-sidebar-border/60 shadow-sm flex flex-col overflow-hidden">

                                {/* 1. Top Header (Name & Key Stats) */}
                                <div className="p-6 border-b border-sidebar-border/60 bg-neutral-50/50 dark:bg-neutral-900/30">
                                    <div className="flex items-start gap-5">
                                        {/* Photo */}
                                        <div className="w-24 h-24 shrink-0 bg-white dark:bg-neutral-800 rounded-xl border border-sidebar-border flex items-center justify-center shadow-sm">
                                            <User className="size-10 text-neutral-300" />
                                        </div>

                                        {/* Name Block */}
                                        <div className="flex-1">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                                                        {selectedCitizen.firstName} {selectedCitizen.middleName} {selectedCitizen.lastName} <span className="text-neutral-400 text-lg">{selectedCitizen.suffix}</span>
                                                    </h1>
                                                    <div className="flex items-center gap-3 mt-1">
                                                        <span className="font-mono text-xs text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-2 py-0.5 rounded">
                                                            {selectedCitizen.citizenId}
                                                        </span>
                                                        <span className={`text-xs font-bold px-2 py-0.5 rounded border ${selectedCitizen.status === 'Deceased' ? 'bg-red-50 text-red-600 border-red-100' : 'bg-green-50 text-green-600 border-green-100'}`}>
                                                            {selectedCitizen.status.toUpperCase()}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Flags / Tags Row */}
                                            <div className="flex flex-wrap gap-2 mt-4">
                                                <FlagBadge label="Voter" active={selectedCitizen.isVoter} color="green" />
                                                <FlagBadge label="Gov. Worker" active={selectedCitizen.isGovWorker} color="blue" />
                                                <FlagBadge label="Student" active={selectedCitizen.isStudent} color="yellow" />
                                                <FlagBadge label="4Ps / NHTS" active={!!selectedCitizen.nhtsNumber} color="purple" />
                                                <FlagBadge label="Indigenous" active={selectedCitizen.isIp} color="indigo" />
                                                <FlagBadge label="Senior" active={selectedCitizen.age >= 60} color="orange" />
                                                <FlagBadge label="Deceased" active={selectedCitizen.isDeceased} color="red" />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* 2. Scrollable Details */}
                                <div className="flex-1 overflow-y-auto p-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                                        {/* Card: Personal Information */}
                                        <div className="col-span-1 md:col-span-2 lg:col-span-1 space-y-4">
                                            <SectionHeader icon={<User className="size-4" />} title="Identity" />
                                            <div className="bg-neutral-50 dark:bg-neutral-900/20 rounded-xl p-4 border border-sidebar-border space-y-3">
                                                <div className="grid grid-cols-2 gap-2">
                                                    <InfoItem label="Age" value={`${selectedCitizen.age} yrs`} />
                                                    <InfoItem label="Sex" value={selectedCitizen.sex} />
                                                    <InfoItem label="Blood Type" value={selectedCitizen.bloodType} />
                                                    <InfoItem label="Civil Status" value={selectedCitizen.civilStatus} />
                                                </div>
                                                <div className="pt-2 border-t border-sidebar-border/50">
                                                    <InfoItem label="Date of Birth" value={selectedCitizen.dob} />
                                                    <InfoItem label="Place of Birth" value={selectedCitizen.pob} />
                                                    <InfoItem label="Religion" value={selectedCitizen.religion} />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Card: Contact & Address (Dynamic) */}
                                        <div className="col-span-1 md:col-span-2 lg:col-span-1 space-y-4">
                                            <SectionHeader icon={<MapPin className="size-4" />} title="Contact & Address" />
                                            <div className="bg-neutral-50 dark:bg-neutral-900/20 rounded-xl p-4 border border-sidebar-border space-y-3">
                                                {/* Dynamic Contact Numbers */}
                                                <div>
                                                    <span className="text-[10px] font-bold text-neutral-400 uppercase">Contact Numbers</span>
                                                    <div className="flex flex-wrap gap-2 mt-1">
                                                        {selectedCitizen.contact.length > 0 ? (
                                                            selectedCitizen.contact.map((num, idx) => (
                                                                <span key={idx} className="inline-flex items-center gap-1 text-xs font-mono bg-white dark:bg-neutral-800 border border-sidebar-border px-2 py-1 rounded-md text-neutral-700 dark:text-neutral-300">
                                                                    <Phone className="size-3 text-neutral-400" /> {num}
                                                                </span>
                                                            ))
                                                        ) : (
                                                            <span className="text-xs text-neutral-400 italic">No contact info provided</span>
                                                        )}
                                                    </div>
                                                </div>
                                                <InfoItem label="Email Address" value={selectedCitizen.email} />
                                                <div className="pt-2 border-t border-sidebar-border/50">
                                                    <InfoItem label="Sitio" value={selectedCitizen.sitio} highlight />
                                                    <InfoItem label="Full Address" value={selectedCitizen.fullAddress} />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Card: Economic & Occupation */}
                                        <div className="col-span-1 md:col-span-2 lg:col-span-1 space-y-4">
                                            <SectionHeader icon={<Briefcase className="size-4" />} title="Socio-Economic" />
                                            <div className="bg-neutral-50 dark:bg-neutral-900/20 rounded-xl p-4 border border-sidebar-border space-y-3">
                                                <InfoItem label="Emp. Status" value={selectedCitizen.employmentStatus} />
                                                <InfoItem label="Occupation" value={selectedCitizen.occupation} />
                                                <InfoItem label="Economic Class" value={selectedCitizen.socioEconomicStatus} />
                                            </div>
                                        </div>

                                        {/* Card: System IDs */}
                                        <div className="col-span-1 md:col-span-2 space-y-4">
                                            <SectionHeader icon={<Hash className="size-4" />} title="Government IDs" />
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-blue-50/50 dark:bg-blue-900/10 rounded-xl p-4 border border-blue-100 dark:border-blue-900/30">
                                                <InfoItem label="PhilHealth ID" value={selectedCitizen.philhealthId || 'N/A'} />
                                                <InfoItem label="Category" value={selectedCitizen.philhealthCategory || 'N/A'} />
                                                <InfoItem label="Membership" value={selectedCitizen.membershipType || 'N/A'} />
                                                <InfoItem label="Health Class." value={selectedCitizen.healthClassification || 'N/A'} />

                                                {/* Second Row */}
                                                <InfoItem label="NHTS Number" value={selectedCitizen.nhtsNumber || 'N/A'} />
                                                <InfoItem label="Household ID" value={selectedCitizen.householdId} highlight />
                                                <InfoItem label="Relationship" value={selectedCitizen.relationship} />
                                            </div>
                                        </div>

                                        {/* Card: Conditional Sections (Grid based) */}

                                        {/* Family Planning */}
                                        {selectedCitizen.fpStatus && selectedCitizen.fpStatus !== 'N/A' && (
                                            <div className="col-span-1 space-y-4">
                                                <SectionHeader icon={<Baby className="size-4 text-purple-500" />} title="Family Planning" />
                                                <div className="bg-purple-50/50 dark:bg-purple-900/10 border border-purple-200 rounded-xl p-4 space-y-2">
                                                    <InfoItem label="Status" value={selectedCitizen.fpStatus} />
                                                    <InfoItem label="Method" value={selectedCitizen.fpMethod || 'N/A'} />
                                                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-purple-200/50">
                                                        <InfoItem label="Started" value={selectedCitizen.fpDateStarted || 'N/A'} />
                                                        <InfoItem label="Ended" value={selectedCitizen.fpDateEnded || 'N/A'} />
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {selectedCitizen.isStudent && (
                                            <div className="col-span-1 space-y-4">
                                                <SectionHeader icon={<GraduationCap className="size-4 text-yellow-600" />} title="Education" />
                                                <div className="bg-yellow-50/50 dark:bg-yellow-900/10 border border-yellow-200 rounded-xl p-4 space-y-2">
                                                    <InfoItem label="Level" value={selectedCitizen.educAttainment || 'N/A'} />
                                                    <InfoItem label="School" value={selectedCitizen.schoolName || 'N/A'} />
                                                </div>
                                            </div>
                                        )}

                                        {selectedCitizen.isDeceased && (
                                            <div className="col-span-1 space-y-4">
                                                <SectionHeader icon={<UserX className="size-4 text-red-600" />} title="Deceased Info" />
                                                <div className="bg-red-50/50 dark:bg-red-900/10 border border-red-200 rounded-xl p-4 space-y-2">
                                                    <InfoItem label="Date of Death" value={selectedCitizen.dateOfDeath || 'N/A'} />
                                                    <InfoItem label="Cause" value={selectedCitizen.causeOfDeath || 'N/A'} />
                                                </div>
                                            </div>
                                        )}

                                    </div>
                                </div>

                                {/* 3. Footer Audit Log */}
                                <div className="p-4 border-t border-sidebar-border/60 bg-neutral-50 dark:bg-neutral-900/50 flex flex-wrap gap-6 text-[10px] text-neutral-400 font-mono">
                                    <div className="flex gap-2">
                                        <span className="font-bold text-neutral-500">ENCODED:</span>
                                        <span>{selectedCitizen.dateEncoded} by {selectedCitizen.encodedBy}</span>
                                    </div>
                                    <div className="flex gap-2">
                                        <span className="font-bold text-neutral-500">UPDATED:</span>
                                        <span>{selectedCitizen.dateUpdated} by {selectedCitizen.updatedBy}</span>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-sidebar-border rounded-2xl bg-neutral-50/50 text-neutral-400">
                                <User className="size-12 mb-2 opacity-20" />
                                <p>Select a citizen from the list to view full profile</p>
                            </div>
                        )}

                    </div>
                </div>
            </div>
        </AppLayout>
    );
}

// --- Reusable Sub-Components ---

function ActionButton({ icon, label, color }: { icon: React.ReactNode, label: string, color: string }) {
    return (
        <button className={`flex items-center gap-2 px-4 py-2 rounded-lg text-white text-xs font-bold uppercase tracking-wider shadow-sm transition-all hover:shadow-md active:scale-95 ${color}`}>
            {icon} <span>{label}</span>
        </button>
    );
}

function SectionHeader({ icon, title }: { icon: React.ReactNode, title: string }) {
    return (
        <div className="flex items-center gap-2 pb-1 border-b border-sidebar-border/50">
            <span className="text-neutral-400">{icon}</span>
            <h3 className="text-xs font-bold uppercase text-neutral-600 dark:text-neutral-300 tracking-wider">{title}</h3>
        </div>
    );
}

function InfoItem({ label, value, highlight = false }: { label: string, value: string | number, highlight?: boolean }) {
    return (
        <div className="flex flex-col">
            <span className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wide">{label}</span>
            <span className={`text-sm truncate font-medium ${highlight ? 'text-blue-600 dark:text-blue-400' : 'text-neutral-800 dark:text-neutral-200'}`}>
                {value}
            </span>
        </div>
    );
}

function FlagBadge({ label, active, color }: { label: string, active: boolean, color: 'blue' | 'green' | 'red' | 'yellow' | 'purple' | 'orange' | 'indigo' }) {
    if (!active) return null;

    const colors = {
        blue: 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800',
        green: 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800',
        red: 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800',
        yellow: 'bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-800',
        purple: 'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800',
        orange: 'bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-800',
        indigo: 'bg-indigo-100 text-indigo-700 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-300 dark:border-indigo-800',
    };

    return (
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${colors[color]}`}>
            {label}
        </span>
    );
}
