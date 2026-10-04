export function parseAddress(address, formValues) {
  // Split the address into parts by commas
  const parts = address.split(',').map(part => part.trim());

  // Destructure the parts into variables
  const [streetAndHouseNumber, zipAndCity, country] = parts;

  // Extract street and house number using regex
  const streetHouseRegex = /^(.*\D)\s(\d+\w*)$/;
  const streetHouseMatch = streetAndHouseNumber.match(streetHouseRegex);

  if (!streetHouseMatch) {
    throw new Error('Invalid street and house number format');
  }

  const [, street, houseNumber] = streetHouseMatch;

  // Extract zip code and city using regex
  const zipCityRegex = /^(\d{5})\s(.+)$/;
  const zipCityMatch = zipAndCity.match(zipCityRegex);

  if (!zipCityMatch) {
    throw new Error('Invalid zip code and city format');
  }

  const [, zipCode, city] = zipCityMatch;

  formValues.country = country;
  formValues.city = city;
  formValues.zipCode = zipCode;
  formValues.street = street;
  formValues.houseNumber = houseNumber;

  return formValues;
}

export const handleStringFromAddress = (address) => {
  if (!address) {
    console.log("A address, which cannot be converted, has been requested to be a String");
    return '';
  }
  return `${address.street} ${address.houseNumber}, ${address.zipCode} ${address.city}, ${address.country}`;
};