/**
 * Illustrative regional companies, not a confirmed ExpoJuy 2026 participant or
 * sponsor list. Regional ties were researched on 2026-09-08; sources below.
 * Official logo files are stored locally without redrawing or recoloring them.
 * Public availability is not a reuse license: confirm brand permission before publication.
 */
import type { ImageMetadata } from 'astro';
import jemseLogo from '../assets/companies/jemse.png';
import ejesaLogo from '../assets/companies/ejesa.png';

export interface RegionalCompany {
  name: string;
  source: string;
  logo?: ImageMetadata;
}

export const regionalCompaniesTitle = 'Empresas de Jujuy';
export const regionalCompaniesNotice =
  'Selección ilustrativa. No representa participantes ni patrocinadores confirmados de ExpoJuy 2026.';

export const regionalCompanies: RegionalCompany[] = [
  {
    name: 'JEMSE',
    source: 'https://jemse.gob.ar/',
    // https://jemse.gob.ar/wp-content/uploads/2026/03/LOGO-EN-ALTA-JEMSE-2026B-480x448.png
    logo: jemseLogo,
  },
  {
    name: 'EJESA',
    source: 'https://www.ejesa.com.ar/info/pwa/contactanos/canales-de-contacto',
    // https://www.ejesa.com.ar/info/pwa/Content/Images/LOGOEJESAAZUL.png
    logo: ejesaLogo,
  },
  // TODO: obtain and verify official reusable logo assets; keep plain text meanwhile.
  {
    name: 'Ledesma',
    source: 'https://www.ledesma.com.ar/nosotros/',
  },
  {
    name: 'Agua Potable de Jujuy',
    source: 'https://aguapotable.jujuy.gob.ar/cau/',
  },
  {
    name: 'Cooperativa de Tabacaleros de Jujuy',
    source: 'https://jujuyeconomico.com.ar/index.php/innovacion/item/6204-apoyo-empresarial-del-valle-de-los-pericos-en-el-lanzamiento-de-la-expojuy-2026',
  },
];
