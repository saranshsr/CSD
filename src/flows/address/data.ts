import { user } from '../../data';

/**
 * Copy — every string is the real value from bappzaar origin/master
 * `src/locale/translations/en.json` (noon-en.json has no overrides for these keys).
 * Key names are kept so they can be grepped back to the source.
 */
export const t = {
  address_v2_account_list_title: 'Address Book',
  address_v2_select_delivery_location: 'Select delivery location',
  address_v2_latlng_tab_title: 'Address',
  address_v2_collection_tab_title: 'Locker/ Pickup',
  address_v2_add_new_latlng_address: 'Add new address',
  address_v2_add_new_collection_address: 'Add new locker/pickup point',
  address_v2_map_search_button: 'Search for your building, area...',
  address_v2_enable_location_title: 'Location not enabled',
  address_v2_enable_location_subtitle: 'Enable for seamless deliveries',
  address_v2_enable_location_button_title: 'Enable',
  address_v2_empty_latlng_saved_addresses_title: 'No Saved Addresses',
  address_v2_empty_latlng_saved_addresses_subtitle: 'Add an address to get your orders delivered straight to your doorstep',
  address_v2_empty_collection_saved_addresses_title: 'Get your order delivered to a locker or pickup point',
  address_v2_empty_collection_saved_addresses_subtitle1: 'No minimum order size',
  address_v2_empty_collection_saved_addresses_subtitle2: 'Your preferred time & location',
  address_v2_empty_collection_saved_addresses_subtitle3: 'Free Delivery',
  address_v2_empty_search_title: 'Location not found',
  address_v2_empty_search_subtitle: 'Check your spelling or choose a location on the map',
  address_v2_empty_button_text: 'Select location on map',
  search_results: 'Search results',
  address_v2_selected_address_toast_message: 'Address already selected',
  address_v2_changed_default_address_toast_message: 'Address updated',
  address_v2_created_address_toast_message: 'Address added',
  address_v2_updated_address_toast_message: 'Address updated',
  address_v2_add_address_details: 'Add address details',
  address_v2_edit_address_details: 'Edit address details',
  address_v2_confirm_latlng: 'Confirm location',
  address_v2_search_address: 'Search for your location',
  address_v2_map_pin_success_title: 'Your order will be delivered here',
  address_v2_map_pin_error_title: 'Something went wrong',
  address_v2_map_pin_zoom_in_title: 'Zoom in to place the pin',
  address_v2_map_pin_unserviceable_title: 'Outside our service area :(',
  address_v2_unserviceable_title: 'Sorry, we’re not here yet',
  address_v2_unserviceable_subtitle: 'Try searching for a different location',
  address_v2_use_current_location: 'Current location',
  address_v2_use_search_current_location: 'Use my current location',
  address_v2_set_location_map: 'Select location on map',
  address_v2_distance_text: (distance: string) => `${distance} away`,
  address_v2_current_location_distance_note: (distance: string) => `Pin is ${distance} away from your current location`,
  address_v2_address_details: 'Address Details',
  save: 'Save',
  edit: 'Edit',
  address_v2_receiver_details_for_address: 'Receiver details for this address',
  address_v2_first_name_field: 'First name',
  address_v2_last_name_field: 'Last name',
  address_v2_phone_field: 'Phone number',
  address_v2_form_validation_required_field_short: 'This field is required',
  home_label: 'Home',
  work_label: 'Work',
  other_label: 'Other',
  address_v2_address_save_success_title: 'Address saved successfully!',
  share: 'Share',
  verify_number: 'Verify',
  delete: 'Delete',
  address_v2_delete_modal_title: 'Delete this address?',
  common_cancel: 'Cancel',
  yes: 'Yes',
  address_v2_location_access_sheet_title: 'Allow location access',
  address_v2_location_access_sheet_subtitle: 'Please allow location permission for a better delivery experience',
  address_v2_location_access_button1_title: 'Allow access',
  address_v2_location_access_button2_title: 'Search location',
} as const;

/** AddressLabels + AddressFieldsDescription (src/constants/AddressConstants.ts, EN). */
export type AddressTag = 'HOME' | 'WORK' | 'OTHER';

export const tagLabels: Record<AddressTag, string> = { HOME: t.home_label, WORK: t.work_label, OTHER: t.other_label };

export const fieldLabels: Record<AddressTag, { unitIdentifier: string; propertyName: string; streetName: string; addressTitle: string; directions: string }> = {
  HOME: {
    unitIdentifier: 'Apt & Floor No./ Villa No. *',
    propertyName: 'Building/ Cluster name *',
    streetName: 'Street name/ Landmark',
    addressTitle: 'Nickname',
    directions: 'Directions to Reach',
  },
  WORK: {
    unitIdentifier: 'Company Name/ Floor No. *',
    propertyName: 'Building Name *',
    streetName: 'Street name/ Landmark',
    addressTitle: 'Nickname',
    directions: 'Directions to Reach',
  },
  OTHER: {
    unitIdentifier: 'Room / House / Floor No. *',
    propertyName: 'Building/ Cluster name *',
    streetName: 'Street name/ Landmark',
    addressTitle: 'Nickname',
    directions: 'Directions to Reach',
  },
};

// ─── Map places (fake reverse-geocoding for the local stylised map) ──────────────────────────────

/** A point on the 1800×1800 map world (px). */
export interface MapPoint {
  x: number;
  y: number;
}

export interface Place extends MapPoint {
  id: string;
  placeName: string;
  area: string;
  propertyName: string;
  streetName: string;
  /** distance from the user's current location, as the autocomplete API would return it */
  distanceText?: string;
}

/** Where "current location" is (Marina Gate 2 — matches mocks user.address). */
export const CURRENT_LOCATION: MapPoint = { x: 905, y: 868 };

export const places: Place[] = [
  { id: 'marina-gate-2', x: 905, y: 868, placeName: 'Marina Gate 2', area: 'Dubai Marina, Dubai', propertyName: 'Marina Gate 2', streetName: 'Al Marsa Street', distanceText: '50 m' },
  { id: 'marina-mall', x: 1010, y: 905, placeName: 'Dubai Marina Mall', area: 'Dubai Marina, Dubai', propertyName: 'Dubai Marina Mall', streetName: 'Sheikh Zayed Road', distanceText: '400 m' },
  { id: 'cayan', x: 760, y: 735, placeName: 'Cayan Tower', area: 'Dubai Marina, Dubai', propertyName: 'Cayan Tower', streetName: 'Al Mesk Street', distanceText: '1.1 km' },
  { id: 'princess', x: 1120, y: 1105, placeName: 'Princess Tower', area: 'Dubai Marina, Dubai', propertyName: 'Princess Tower', streetName: 'Al Hubob Street', distanceText: '1.6 km' },
  { id: 'jbr-sadaf', x: 560, y: 560, placeName: 'Sadaf 5, JBR', area: 'Jumeirah Beach Residence, Dubai', propertyName: 'Sadaf 5', streetName: 'The Walk', distanceText: '2.3 km' },
  { id: 'marina-promenade', x: 1235, y: 950, placeName: 'Marina Promenade - Delphine', area: 'Dubai Marina, Dubai', propertyName: 'Delphine Tower', streetName: 'Marina Walk', distanceText: '1.4 km' },
  { id: 'media-city', x: 1330, y: 560, placeName: 'Building 5, Dubai Media City', area: 'Al Sufouh, Dubai', propertyName: 'Building 5', streetName: 'Al Bourooj Street', distanceText: '3.2 km' },
  { id: 'jlt-x2', x: 1305, y: 1300, placeName: 'Jumeirah Bay X2', area: 'Jumeirah Lakes Towers, Dubai', propertyName: 'Jumeirah Bay X2', streetName: 'Cluster X', distanceText: '2.8 km' },
  { id: 'jlt-mazaya', x: 1120, y: 1400, placeName: 'Mazaya Business Avenue', area: 'Jumeirah Lakes Towers, Dubai', propertyName: 'Mazaya Business Avenue BB1', streetName: 'Cluster BB', distanceText: '3.1 km' },
  { id: 'greens', x: 1520, y: 1180, placeName: 'Al Ghozlan 3, The Greens', area: 'Emirates Living, Dubai', propertyName: 'Al Ghozlan 3', streetName: 'Street 1', distanceText: '4.0 km' },
  { id: 'barsha-heights', x: 1560, y: 880, placeName: 'Al Shafar Tower 1', area: 'Barsha Heights, Dubai', propertyName: 'Al Shafar Tower 1', streetName: 'Al Thanya Street', distanceText: '4.6 km' },
  { id: 'bluewaters', x: 330, y: 470, placeName: 'Bluewaters Residences 8', area: 'Bluewaters Island, Dubai', propertyName: 'Bluewaters Residences 8', streetName: 'Bluewaters Island', distanceText: '3.4 km' },
];

// ─── Saved addresses (AddressV2LatLngType, mocked) ───────────────────────────────────────────

export interface SavedAddress {
  id: number;
  code: string;
  label: AddressTag;
  nickname?: string;
  unitIdentifier: string;
  propertyName: string;
  streetName?: string;
  directions?: string;
  placeName: string;
  area: string;
  location: MapPoint;
  distance?: string | null;
  firstName: string;
  lastName: string;
  dialCode: string;
  phone: string;
  isPhoneVerified: boolean;
  isShareable: boolean;
}

/** `+971 50 123 4567` → dial code + national number, like AddressUtils.getFormInitialPhoneNumberValue. */
export const userDialCode = '+971';
export const userPhone = user.phone.replace(userDialCode, '').replace(/\s/g, '');

export const initialAddresses: SavedAddress[] = [
  {
    id: 101,
    code: 'AE-HOME-101',
    label: 'HOME',
    unitIdentifier: 'Apt 2304, 23rd Floor',
    propertyName: user.address.line.split(',')[0], // Marina Gate 2
    streetName: 'Al Marsa Street',
    placeName: 'Marina Gate 2',
    area: 'Dubai Marina, Dubai',
    location: { x: 905, y: 868 },
    distance: '50 m',
    firstName: user.firstName,
    lastName: user.lastName,
    dialCode: userDialCode,
    phone: userPhone,
    isPhoneVerified: true,
    isShareable: true,
  },
  {
    id: 102,
    code: 'AE-WORK-102',
    label: 'WORK',
    unitIdentifier: 'noon, 4th Floor',
    propertyName: 'Building 5',
    streetName: 'Al Bourooj Street',
    placeName: 'Building 5, Dubai Media City',
    area: 'Al Sufouh, Dubai',
    location: { x: 1330, y: 560 },
    distance: '3.2 km',
    firstName: user.firstName,
    lastName: user.lastName,
    dialCode: userDialCode,
    phone: userPhone,
    isPhoneVerified: true,
    isShareable: true,
  },
  {
    id: 103,
    code: 'AE-OTHER-103',
    label: 'OTHER',
    nickname: "Mom's place",
    unitIdentifier: 'Apt 1708',
    propertyName: 'Jumeirah Bay X2',
    streetName: 'Cluster X',
    directions: 'Use the lake-side entrance',
    placeName: 'Jumeirah Bay X2',
    area: 'Jumeirah Lakes Towers, Dubai',
    location: { x: 1305, y: 1300 },
    distance: '2.8 km',
    firstName: 'Rina',
    lastName: 'Debnath',
    dialCode: userDialCode,
    phone: '559876543',
    isPhoneVerified: false,
    isShareable: true,
  },
];

/** Single line address as the API builds it: unit, building, street. */
export const singleLineAddress = (a: Pick<SavedAddress, 'unitIdentifier' | 'propertyName' | 'streetName'>) =>
  [a.unitIdentifier, a.propertyName, a.streetName].filter(Boolean).join(', ');

/** getLatLngAddressTitle: nickname || label || placename || area */
export const addressTitle = (a: SavedAddress) => a.nickname || tagLabels[a.label] || a.placeName || a.area;

export const fullPhone = (a: Pick<SavedAddress, 'dialCode' | 'phone'>) => `${a.dialCode}${a.phone}`;
