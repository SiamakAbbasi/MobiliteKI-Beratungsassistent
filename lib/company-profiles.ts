export const COMPANY_PROFILE_VERSION = "2026-11-04-v1";
export const ANALYSIS_VERSION = `bd-intelligence-${COMPANY_PROFILE_VERSION}`;

export type CompanyKey = "MOBILITE" | "BSL";

export type CompanyProfileDefinition = {
  key: CompanyKey;
  name: string;
  website: string;
  capabilities: string[];
  customerTypes: string[];
  industries: string[];
  sourceUrls: string[];
};

export const companyProfiles: CompanyProfileDefinition[] = [
  {
    key: "MOBILITE",
    name: "mobilité Unternehmensberatung",
    website: "https://mobilite.de/",
    capabilities: [
      "Strategy development and implementation for passenger transport",
      "Tariff design, sales, digital customer management and dynamic pricing",
      "Revenue-sharing system conception, development and implementation",
      "Public transport financing structures and incentive systems",
      "Organisational design, role definition and allocation of responsibilities",
      "Controlling, benchmarking, variance analysis and recommendations",
      "Software and digital solutions for passenger transport",
    ],
    customerTypes: ["Public transport authorities", "Transport operators", "Transport associations", "Mobility industry and service companies"],
    industries: ["Passenger transport", "Public transport", "Mobility services"],
    sourceUrls: ["https://mobilite.de/", "https://mobilite.de/kompetenzen/", "https://mobilite.de/ueber-uns/"],
  },
  {
    key: "BSL",
    name: "BSL Transportation Consultants",
    website: "https://bsl-transportation.com/en/",
    capabilities: [
      "Transport and logistics strategy",
      "Controlling, management, optimisation and benchmarking",
      "Marketing and sales for transport companies",
      "Operational improvement and implementation",
      "Vehicle and fleet management",
      "Infrastructure management",
      "Overhead efficiency and organisational optimisation",
      "Freight transport and logistics solutions",
      "Innovation management and impact assessment",
    ],
    customerTypes: ["Transport companies", "Logistics companies", "Senior management and decision makers in transport and logistics"],
    industries: ["Public transport", "Freight transport", "Logistics", "Transport infrastructure"],
    sourceUrls: ["https://bsl-transportation.com/en/", "https://bsl-transportation.com/en/competencies/"],
  },
];
