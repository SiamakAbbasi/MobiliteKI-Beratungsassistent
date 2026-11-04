const WFS = "https://sgx.geodatenzentrum.de/wfs_vg250";

function featureUrl(typeName: string, filter?: string) {
  const params = new URLSearchParams({
    service: "WFS",
    version: "2.0.0",
    request: "GetFeature",
    typeNames: `vg250:${typeName}`,
    count: "100",
    outputFormat: "application/json",
    srsName: "EPSG:4326",
  });
  if (filter) params.set("CQL_FILTER", filter);
  return `${WFS}?${params}`;
}

export async function GET() {
  const [statesResponse, countryResponse] = await Promise.all([
    fetch(featureUrl("vg250_lan", "gf=4"), { next: { revalidate: 86400 } }),
    fetch(featureUrl("vg250_sta", "gf=4"), { next: { revalidate: 86400 } }),
  ]);

  if (!statesResponse.ok || !countryResponse.ok) {
    return Response.json({ error: "Official BKG geography service is unavailable" }, { status: 502 });
  }

  const [states, country] = await Promise.all([statesResponse.json(), countryResponse.json()]);
  if (states.features?.length !== 16 || !country.features?.length) {
    return Response.json({ error: "Unexpected BKG geography response" }, { status: 502 });
  }

  return Response.json({
    states,
    country,
    attribution: "© BKG (2025), dl-de/by-2-0",
    attributionUrl: "https://www.bkg.bund.de",
    licenseUrl: "https://www.govdata.de/dl-de/by-2-0",
  });
}
