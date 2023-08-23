import moment from 'moment';

const INITIAL_CONTRACT_FORM_STATE = {
  new_customer: false,
  customer_anon: false,
  date_time_created: moment(),
  customer_name: '',
  customer_number: '',
  customer_id: '',
  customer_url: '',
  postal_code: '',
  street_name: '',
  street_selected: false,
  number: '',
  stair: '',
  level: '',
  door: '',
  talk_to: '',
  phone_1: '',
  phone_2: '',
  email: '',
  start_time: moment(),
  start_time_to: moment(),
  position_url: '',
  distance: 0,
  baseZone: 0,
  basePrice: 0,
  bonus: 0,
  lat: null,
  long: null,
  customer_is_pick_up: true,
  customer_is_drop_off: false,
  memo: '',
  payment: 'Scheck',
  autoCompleteItems: [],
  options: [],
  weight_size_bonus: '',
  is_cargo: false,
  is_express: false,
  is_bigbuilding: false,
  get_there_bonus: 0.0,
  waiting_bonus: 0,
  hasDelayedPayment: false,
  hasDelayedPaymentMemo: '',
  status: 'unsaved',
};

function apiResponseToInitialState(apiResponse) {
  const { customer } = apiResponse;
  const hasCustomer = customer !== null;
  const customer_name = hasCustomer ? customer.name : '';
  const customer_url = hasCustomer ? customer.url : '';
  const customer_id = hasCustomer ? customer.id : '';
  const customer_number = hasCustomer ? customer.external_id : '';

  const address = apiResponse.address[0];
  const hasAddress = address !== undefined;
  return {
    new_customer: false,
    date_time_created: moment(apiResponse.start_time),
    customer_name,
    customer_number,
    customer_id,
    customer_url,
    customer_anon: apiResponse.anon_name !== '',
    anon_name: apiResponse.anon_name,
    postal_code: hasAddress ? address.postal_code : '',
    street_name: hasAddress ? address.street : '',
    street_selected: true,
    number: hasAddress ? address.number : '',
    stair: hasAddress ? address.stair : '',
    level: hasAddress ? address.level : '',
    door: hasAddress ? address.door : '',
    customer_is_pick_up: apiResponse.costumer_is_pickup,
    customer_is_drop_off: apiResponse.costumer_is_dropoff,

    start_time: moment(apiResponse.start_time),
    start_time_to: moment(apiResponse.start_time_to),
    position_url: apiResponse.url,
    // email: hasCustomer ? customer.email : '',

    lat: hasAddress ? address.lat : '',
    long: hasAddress ? address.lon : '',
    payment: hasCustomer ? customer.payment : '',
    autoCompleteItems: [],
    options: [],

    weight_size_bonus: apiResponse.weight_size_bonus,
    is_cargo: apiResponse.is_cargo,
    is_express: apiResponse.is_express,
    is_bigbuilding: apiResponse.is_bigbuilding,
    get_there_bonus: apiResponse.get_there_bonus,
    waiting_bonus: apiResponse.waiting_bonus,
    memo: apiResponse.memo,
    distance: 0,
    basePrice: 0,
    bonus: 0,
    storage: apiResponse.storage,
    baseZone: 0,

    phone_1: apiResponse.phone_1,
    talk_to: hasAddress ? address.talk_to : '',
    email: apiResponse.email,

    hasDelayedPayment: hasCustomer ? customer.has_delayed_payment : false,
    hasDelayedPaymentMemo: hasCustomer ? customer.has_delayed_payment_memo : false,
  };
}

export { INITIAL_CONTRACT_FORM_STATE, apiResponseToInitialState };

export const emptyContractForm = {
  customer_url: '',
  customer_name: '',
  customer_number: '-1',
  street_name: '',
  postal_code: '',
  number: '',
  level: '',
  stair: '',
  door: '',
  phone_1: '',
  email: '',
  payment: 'Bar',
};

export const initial_contract_state = {
  filteredPositions: [],
  saved: 'unsaved',
  date: new Date(),
  url: '',
  id: '',
  zone: 0,
  distance: 0,
  price: 0,
  marken: 0,
  extra: 0,
  extra2: 0,
  extra2_string: '',
  customer: '',
  weightValue: '',
  getThereValue: '',
  waitingTimeValue: '',
  hasDelayedPayment: false,
  isCargo: false,
  isBigBuilding: false,
  isProvisionally: false,
  isExpress: false,
  type: '',
  isRepeated: false,
  repeatedstartdate: new Date(),
  repeatedenddate: null,
  positionsDeleteRequests: [],
  repeated: {
    days_of_the_week: '',
  },
  settings: null,
  contractForms: [
    {
      id: 0,
      data: INITIAL_CONTRACT_FORM_STATE,
    },
    {
      id: 1,
      data: INITIAL_CONTRACT_FORM_STATE,
    },
  ],
};
