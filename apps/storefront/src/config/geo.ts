export type GeoOperationalStatus = 'active' | 'candidate' | 'upcoming' | 'inactive';
export type DeliveryMode = 'seller_managed' | 'azhon_managed' | 'pickup_only' | 'locker_only' | 'pending' | 'unavailable';
export type GeoStatus = 'pending_geocode' | 'pending_review' | 'geocoded' | 'invalid_location';
export type CoverageStatus = 'pending_review' | 'covered' | 'out_of_bounds' | 'restricted';
export type DeliveryEligibility = 'pending_review' | 'door_delivery' | 'pickup_required' | 'locker_required' | 'no_delivery';

export interface GeoCity {
  cityCode: string;
  name: string;
  departmentCode: string;
  status: GeoOperationalStatus;
  isActiveBuy: boolean;
  isActiveSell: boolean;
  deliveryMode: DeliveryMode;
  geoStatus: GeoStatus;
  coverageStatus: CoverageStatus;
  deliveryEligibility: DeliveryEligibility;
  commercialPriority: number;
  logisticsPriority: number;
  isCapital?: boolean;
}

export interface GeoDepartment {
  departmentCode: string;
  name: string;
  capitalCity: string;
  status: GeoOperationalStatus;
  isActiveBuy: boolean;
  isActiveSell: boolean;
  deliveryMode: DeliveryMode;
  coverageStatus: CoverageStatus;
  cities: GeoCity[];
}

export interface GeoCountry {
  countryCode: string;
  name: string;
  status: GeoOperationalStatus;
  departments: GeoDepartment[];
}

export const SUPPORTED_SELLER_COUNTRIES = ['HN', 'SV', 'GT', 'CR', 'NI', 'PA'] as const;

function createDefaultCity(name: string, cityCode: string, departmentCode: string, isCapital: boolean = false, status: GeoOperationalStatus = 'candidate'): GeoCity {
  return {
    cityCode,
    name,
    departmentCode,
    status,
    isActiveBuy: false,
    isActiveSell: false,
    deliveryMode: 'pending',
    geoStatus: 'pending_review',
    coverageStatus: 'pending_review',
    deliveryEligibility: 'pending_review',
    commercialPriority: 5,
    logisticsPriority: 5,
    isCapital,
  };
}

function createDefaultDepartment(name: string, departmentCode: string, capitalCity: string, cities: GeoCity[], status: GeoOperationalStatus = 'candidate'): GeoDepartment {
  return {
    departmentCode,
    name,
    capitalCity,
    status,
    isActiveBuy: false,
    isActiveSell: false,
    deliveryMode: 'pending',
    coverageStatus: 'pending_review',
    cities,
  };
}

export const GEO_CATALOG_HN: GeoCountry = {
  countryCode: 'HN',
  name: 'Honduras',
  status: 'active',
  departments: [
    createDefaultDepartment('Atlántida', 'AT', 'La Ceiba', [
      createDefaultCity('La Ceiba', 'AT-LC', 'AT', true),
      createDefaultCity('Tela', 'AT-TL', 'AT'),
      createDefaultCity('El Porvenir', 'AT-EP', 'AT'),
      createDefaultCity('La Masica', 'AT-LM', 'AT'),
      createDefaultCity('Jutiapa', 'AT-JT', 'AT'),
    ]),
    createDefaultDepartment('Choluteca', 'CH', 'Choluteca', [
      createDefaultCity('Choluteca', 'CH-CH', 'CH', true),
      createDefaultCity('San Marcos de Colón', 'CH-SMC', 'CH'),
      createDefaultCity('El Triunfo', 'CH-ET', 'CH'),
      createDefaultCity('Pespire', 'CH-PE', 'CH'),
      createDefaultCity('Namasigüe', 'CH-NA', 'CH'),
    ], 'upcoming'),
    createDefaultDepartment('Colón', 'CL', 'Trujillo', [
      createDefaultCity('Tocoa', 'CL-TC', 'CL'),
      createDefaultCity('Trujillo', 'CL-TR', 'CL', true),
      createDefaultCity('Sonaguera', 'CL-SO', 'CL'),
      createDefaultCity('Sabá', 'CL-SA', 'CL'),
      createDefaultCity('Bonito Oriental', 'CL-BO', 'CL'),
    ], 'upcoming'),
    createDefaultDepartment('Comayagua', 'CM', 'Comayagua', [
      createDefaultCity('Comayagua', 'CM-CM', 'CM', true),
      createDefaultCity('Siguatepeque', 'CM-SG', 'CM'),
      createDefaultCity('La Libertad', 'CM-LL', 'CM'),
      createDefaultCity('Taulabé', 'CM-TA', 'CM'),
      createDefaultCity('Villa de San Antonio', 'CM-VSA', 'CM'),
    ]),
    createDefaultDepartment('Copán', 'CP', 'Santa Rosa de Copán', [
      createDefaultCity('Santa Rosa de Copán', 'CP-SRC', 'CP', true),
      createDefaultCity('Copán Ruinas', 'CP-CR', 'CP'),
      createDefaultCity('Nueva Arcadia / La Entrada', 'CP-NA', 'CP'),
      createDefaultCity('Cucuyagua', 'CP-CU', 'CP'),
      createDefaultCity('Corquín', 'CP-CQ', 'CP'),
    ], 'upcoming'),
    createDefaultDepartment('Cortés', 'CR', 'San Pedro Sula', [
      createDefaultCity('San Pedro Sula', 'CR-SPS', 'CR', true),
      createDefaultCity('Choloma', 'CR-CH', 'CR'),
      createDefaultCity('Villanueva', 'CR-VN', 'CR'),
      createDefaultCity('Puerto Cortés', 'CR-PC', 'CR'),
      createDefaultCity('La Lima', 'CR-LL', 'CR'),
    ]),
    createDefaultDepartment('El Paraíso', 'EP', 'Yuscarán', [
      createDefaultCity('Danlí', 'EP-DA', 'EP'),
      createDefaultCity('El Paraíso', 'EP-EP', 'EP'),
      createDefaultCity('Yuscarán', 'EP-YU', 'EP', true),
      createDefaultCity('Trojes', 'EP-TR', 'EP'),
      createDefaultCity('Teupasenti', 'EP-TE', 'EP'),
    ], 'upcoming'),
    createDefaultDepartment('Francisco Morazán', 'FM', 'Distrito Central / Tegucigalpa', [
      createDefaultCity('Distrito Central / Tegucigalpa', 'FM-DC', 'FM', true),
      createDefaultCity('Talanga', 'FM-TA', 'FM'),
      createDefaultCity('Guaimaca', 'FM-GU', 'FM'),
      createDefaultCity('Valle de Ángeles', 'FM-VA', 'FM'),
      createDefaultCity('Santa Lucía', 'FM-SL', 'FM'),
    ]),
    createDefaultDepartment('Gracias a Dios', 'GD', 'Puerto Lempira', [
      createDefaultCity('Puerto Lempira', 'GD-PL', 'GD', true),
      createDefaultCity('Brus Laguna', 'GD-BL', 'GD'),
      createDefaultCity('Ahuas', 'GD-AH', 'GD'),
      createDefaultCity('Wampusirpi', 'GD-WA', 'GD'),
      createDefaultCity('Juan Francisco Bulnes', 'GD-JFB', 'GD'),
    ], 'upcoming'),
    createDefaultDepartment('Intibucá', 'IN', 'La Esperanza', [
      createDefaultCity('La Esperanza', 'IN-LE', 'IN', true),
      createDefaultCity('Intibucá', 'IN-IN', 'IN'),
      createDefaultCity('Jesús de Otoro', 'IN-JO', 'IN'),
      createDefaultCity('Yamaranguila', 'IN-YA', 'IN'),
      createDefaultCity('Camasca', 'IN-CA', 'IN'),
    ], 'upcoming'),
    createDefaultDepartment('Islas de la Bahía', 'IB', 'Roatán', [
      createDefaultCity('Roatán', 'IB-RO', 'IB', true),
      createDefaultCity('Utila', 'IB-UT', 'IB'),
      createDefaultCity('José Santos Guardiola', 'IB-JSG', 'IB'),
      createDefaultCity('Guanaja', 'IB-GU', 'IB'),
    ], 'upcoming'),
    createDefaultDepartment('La Paz', 'LP', 'La Paz', [
      createDefaultCity('La Paz', 'LP-LP', 'LP', true),
      createDefaultCity('Marcala', 'LP-MA', 'LP'),
      createDefaultCity('Santiago de Puringla', 'LP-SP', 'LP'),
      createDefaultCity('Guajiquiro', 'LP-GU', 'LP'),
      createDefaultCity('Santa María', 'LP-SM', 'LP'),
    ], 'upcoming'),
    createDefaultDepartment('Lempira', 'LE', 'Gracias', [
      createDefaultCity('Gracias', 'LE-GR', 'LE', true),
      createDefaultCity('Lepaera', 'LE-LE', 'LE'),
      createDefaultCity('Erandique', 'LE-ER', 'LE'),
      createDefaultCity('La Campa', 'LE-LC', 'LE'),
      createDefaultCity('San Andrés', 'LE-SA', 'LE'),
    ], 'upcoming'),
    createDefaultDepartment('Ocotepeque', 'OC', 'Nueva Ocotepeque', [
      createDefaultCity('Nueva Ocotepeque', 'OC-NO', 'OC', true),
      createDefaultCity('San Marcos', 'OC-SM', 'OC'),
      createDefaultCity('La Labor', 'OC-LL', 'OC'),
      createDefaultCity('Sinuapa', 'OC-SI', 'OC'),
      createDefaultCity('Santa Fe', 'OC-SF', 'OC'),
    ], 'upcoming'),
    createDefaultDepartment('Olancho', 'OL', 'Juticalpa', [
      createDefaultCity('Juticalpa', 'OL-JU', 'OL', true),
      createDefaultCity('Catacamas', 'OL-CA', 'OL'),
      createDefaultCity('Patuca', 'OL-PA', 'OL'),
      createDefaultCity('Campamento', 'OL-CM', 'OL'),
      createDefaultCity('San Esteban', 'OL-SE', 'OL'),
    ], 'upcoming'),
    createDefaultDepartment('Santa Bárbara', 'SB', 'Santa Bárbara', [
      createDefaultCity('Santa Bárbara', 'SB-SB', 'SB', true),
      createDefaultCity('Quimistán', 'SB-QU', 'SB'),
      createDefaultCity('Las Vegas', 'SB-LV', 'SB'),
      createDefaultCity('Trinidad', 'SB-TR', 'SB'),
      createDefaultCity('Macuelizo', 'SB-MA', 'SB'),
    ], 'upcoming'),
    createDefaultDepartment('Valle', 'VA', 'Nacaome', [
      createDefaultCity('Nacaome', 'VA-NA', 'VA', true),
      createDefaultCity('San Lorenzo', 'VA-SL', 'VA'),
      createDefaultCity('Amapala', 'VA-AM', 'VA'),
      createDefaultCity('Langue', 'VA-LA', 'VA'),
      createDefaultCity('Alianza', 'VA-AL', 'VA'),
    ], 'upcoming'),
    createDefaultDepartment('Yoro', 'YO', 'Yoro', [
      createDefaultCity('El Progreso', 'YO-EP', 'YO'),
      createDefaultCity('Yoro', 'YO-YO', 'YO', true),
      createDefaultCity('Olanchito', 'YO-OL', 'YO'),
      createDefaultCity('Morazán', 'YO-MO', 'YO'),
      createDefaultCity('El Negrito', 'YO-EN', 'YO'),
    ], 'upcoming'),
  ]
};

// Placeholders estructurales para otros países de Centroamérica
export const GEO_CATALOG_SV: GeoCountry = { countryCode: 'SV', name: 'El Salvador', status: 'upcoming', departments: [] };
export const GEO_CATALOG_GT: GeoCountry = { countryCode: 'GT', name: 'Guatemala', status: 'upcoming', departments: [] };
export const GEO_CATALOG_CR: GeoCountry = { countryCode: 'CR', name: 'Costa Rica', status: 'upcoming', departments: [] };
export const GEO_CATALOG_NI: GeoCountry = { countryCode: 'NI', name: 'Nicaragua', status: 'upcoming', departments: [] };
export const GEO_CATALOG_PA: GeoCountry = { countryCode: 'PA', name: 'Panamá', status: 'upcoming', departments: [] };

export const MASTER_GEO_CATALOG: Record<string, GeoCountry> = {
  HN: GEO_CATALOG_HN,
  SV: GEO_CATALOG_SV,
  GT: GEO_CATALOG_GT,
  CR: GEO_CATALOG_CR,
  NI: GEO_CATALOG_NI,
  PA: GEO_CATALOG_PA
};
