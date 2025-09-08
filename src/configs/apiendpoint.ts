const addressSearch = (address: string) => {
  return `https://msearch.gsi.go.jp/address-search/AddressSearch?q=${encodeURIComponent(
    address
  )}`;
};

export const API_ENDPOINT = {
  addressSearch,
};
