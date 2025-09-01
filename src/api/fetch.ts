export const fetcher = async (url: string) => {
  const res = await fetch(url, {
    headers: {
      Accept: "application/json",
      "User-Agent": "japan-address-distance/1.0 (+https://your.domain/)",
      Referer: location.origin,
    },
  });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return res.json();
};
