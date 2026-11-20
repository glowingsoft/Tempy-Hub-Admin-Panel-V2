import { parsePhoneNumber } from 'react-phone-number-input';

import { countries } from 'src/assets/data/countries';

// ----------------------------------------------------------------------

export function getCountryCode(inputValue, countryCode = 'GB') {
  if (inputValue) {
    const phoneNumber = parsePhoneNumber(inputValue, countryCode);

    if (phoneNumber?.country) {
      return phoneNumber.country;
    }
  }

  return countryCode ?? 'GB';
}

// ----------------------------------------------------------------------

export function getCountry(countryCode) {
  const option = countries.filter((country) => country.code === countryCode)[0];
  return option;
}

export function applyFilter({ inputData, query }) {
  if (query) {
    return inputData.filter(
      (country) =>
        country.label.toLowerCase().indexOf(query.toLowerCase()) !== -1 ||
        country.code.toLowerCase().indexOf(query.toLowerCase()) !== -1 ||
        country.phone.toLowerCase().indexOf(query.toLowerCase()) !== -1
    );
  }

  return inputData;
}
