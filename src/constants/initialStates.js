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
  start_mode: '',
  start_time: moment(),
  position_url: '',
  distance: 0,
  baseZone: 0,
  basePrice: 0,
  bonus: 0,
  lat: null,
  long: null,
  notes: '',
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
    talk_to: hasAddress ? address.talk_to : '',
    phone_1: apiResponse.phone_1,
    phone_2: apiResponse.phone_2,
    email: apiResponse.email,
    start_mode: apiResponse.start_mode,
    start_time: moment(apiResponse.start_time),
    position_url: apiResponse.url,
    // email: hasCustomer ? customer.email : '',
    distance: 0,
    baseZone: 0,
    basePrice: 0,
    bonus: 0,
    lat: hasAddress ? address.lat : '',
    long: hasAddress ? address.lon : '',
    notes: apiResponse.memo,
    payment: hasCustomer ? customer.payment : '',
    autoCompleteItems: [],
    options: [],
    weight_size_bonus: apiResponse.weight_size_bonus,
    is_cargo: apiResponse.is_cargo,
    is_express: apiResponse.is_express,
    is_bigbuilding: apiResponse.is_bigbuilding,
    get_there_bonus: apiResponse.get_there_bonus,
    waiting_bonus: apiResponse.waiting_bonus,
    hasDelayedPayment: hasCustomer ? customer.has_delayed_payment : false,
    hasDelayedPaymentMemo: hasCustomer ? customer.has_delayed_payment_memo : false,
  };
}

export { INITIAL_CONTRACT_FORM_STATE, apiResponseToInitialState };
