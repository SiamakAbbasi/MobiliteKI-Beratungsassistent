import { db } from "./db";
import { COMPANY_PROFILE_VERSION, companyProfiles } from "./company-profiles";

export async function syncCompanyProfiles() {
  for (const profile of companyProfiles) {
    await db.companyProfile.upsert({
      where: { key: profile.key },
      update: {
        name: profile.name, website: profile.website, profileVersion: COMPANY_PROFILE_VERSION,
        capabilitiesJson: JSON.stringify(profile.capabilities), customerTypesJson: JSON.stringify(profile.customerTypes),
        industriesJson: JSON.stringify(profile.industries), sourceUrlsJson: JSON.stringify(profile.sourceUrls), active: true,
      },
      create: {
        key: profile.key, name: profile.name, website: profile.website, profileVersion: COMPANY_PROFILE_VERSION,
        capabilitiesJson: JSON.stringify(profile.capabilities), customerTypesJson: JSON.stringify(profile.customerTypes),
        industriesJson: JSON.stringify(profile.industries), sourceUrlsJson: JSON.stringify(profile.sourceUrls),
      },
    });
  }
}
