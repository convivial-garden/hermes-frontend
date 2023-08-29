import axios from 'axios';
import moment from 'moment';
import initKeycloak, { keycloak } from './keycloak';

import { toast } from 'react-toastify';

const BACKEND = import.meta.env.DEV
  ? `http://${window.location.hostname}:8000/api/hermes/disposerv/`
  : 'https://collectivo.hermes/api/hermes/disposerv/';
// const BACKEND = "http://10.8.0.3:8000/";
const PUBHOST = import.meta.env.DEV?`http://${window.location.hostname}:3000/`: `https://${window.location.hostname}/`;
// const DEBUG_ = process.env.NODE_ENV === 'development';
const DEBUG = false;
const CONTRACTS = `${BACKEND}contracts/`;
const CONTRACTSBYDATE = 'contracts/date/';
const CONTRACTSBYRIDER = 'contracts/rider/';
const CONTRACTS_SELF = 'contracts/self/';
const CUSTOMERSBYNAME = 'customers/name/';
const CUSTOMERSBYID = 'customers/externalid/';
const CUSTOMERS = 'customers/';
const ADDRESSES = `${BACKEND}addresses/`;
const GENERATEREPEATED = `${BACKEND}generaterepeatedcontracts/`;
const DELAYEDPAYMENT = 'delayedpayment';
const ANON = 'anon/';
const SETTINGS = `${BACKEND}settings/`;
const CONTRACTS_BY_DATE = CONTRACTSBYDATE;
const CONTRACTS_BY_DATE_AND_RIDER = CONTRACTSBYRIDER;
const CUSTOMERS_BY_NAME = CUSTOMERSBYNAME;
const CUSTOMERS_BY_EXTERNAL_ID = CUSTOMERSBYID;
const GET_ANON = ANON;
const CUSTOMERS_ENDPOINT = CUSTOMERS;
const CONTRACTS_ENDPOINT = CONTRACTS;
const CONTRACTS_ARCHIVE = `contracts/archive/`;
const CONTRACTS_ARCHIVE_BYCUSTOMER = `contracts/customer/`;
const PREORDERS = `preorders/`;
const STREETNAMES = `street/name/`;
const STREETNAMES_FAST = `faststreet/name/`;
const DELAYEDPAYMENTS = `payments/`;
const SETTINGS_ALL = `${SETTINGS}1/`;

const Api = axios.create({
  baseURL: BACKEND,
  timeout: 10000,
});

Api.interceptors.request.use(
  (config) => {
    console.log('interceptor request', config.url);
    console.log('interceptor request', keycloak?.authenticated);
    const controller = new AbortController();
    if (keycloak?.authenticated) {
      config.headers.Authorization = `Token ${keycloak.token}`;
    } else if (localStorage.getItem('token') !== null) {
      const token = localStorage.getItem('token');
      config.headers.Authorization = `Token ${token}`;
    } else {
      // throw new axios.Cancel('Keycloak not ready.');
    }
    config.headers['Accept'] = 'application/json; version=0.1.0';
    return { ...config, signal: controller.signal };
  },
  function (error) {
    return Promise.reject(error);
  },
);

Api.interceptors.response.use(
  function (response) {
    // Any status code that lie within the range of 2xx cause this function to trigger
    // Do something with response data
    console.log('interceptor response', response.status, response.config.url);
    return response;
  },
  function (error) {
    // Any status codes that falls outside the range of 2xx cause this function to trigger
    // Do something with response error
    console.log('interceptor error', error.response);
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      console.log('interceptor error 401');
    }
    return Promise.reject(error);
  },
);


function getDelayedPaymentCustomers() {
  return Api.get(DELAYEDPAYMENTS).then((response) => response.data.results);
}

function getCustomersByNameList(name, callback) {
  if (name === '' || name.length < 3) {
    callback([]);
    return;
  }
  Api.get(`${CUSTOMERS_BY_NAME}${name}/`).then((response) =>
    callback(response.data.results),
  );
}

function getCustomersByExternalIdList(id, callback) {
  if (id === '') {
    callback([]);
    return;
  }
  Api.get(`${CUSTOMERS_BY_EXTERNAL_ID}${id}/`).then((response) =>
    callback(response.data.results),
  );
}
function getPreorders() {
  return Api.get(PREORDERS).then((response) => response.data.results);
}

function generateRepeatedContracts() {
  // return Api.get(GENERATEREPEATEDCONTRACTS);
}

function getContractArchive(date, type, riderId = null, customerId = null) {
  date = moment(date);
  const year = date.format('YYYY');
  const month = date.format('MM');
  const day = date.format('D');
  let backend = CONTRACTS_ARCHIVE;
  const customerString = customerId !== null ? `${customerId}/` : '';
  if (!riderId && customerId) {
    backend = CONTRACTS_ARCHIVE_BYCUSTOMER;
  }

  if (type === 'Woche') {
    const startOfWeek = new moment(date).startOf('week');
    const requests = [];
    for (let i = 0; i <= 7; i += 1) {
      const year1 = startOfWeek.format('YYYY');
      const month1 = startOfWeek.format('MM');
      const day1 = startOfWeek.format('D');
      requests.push(
        Api.get(`${backend}${year1}/${month1}/${day1}/${customerString}`).then(
          (response) => response.data.results,
        ),
      );
      startOfWeek.add(1, 'd');
    }
    return axios.all(requests).then((results) => {
      let endResult = [];
      results.forEach((result) => (endResult = endResult.concat(result)));
      return endResult;
    });
  }

  if (type === 'Jahr') {
    return Api.get(`${backend}${year}/${customerString}`).then(
      (response) => response.data.results,
    );
  }
  if (type === 'Monat') {
    return Api.get(`${backend}${year}/${month}/${customerString}`).then(
      (response) => response.data.results,
    );
  }
  if (type === 'Tag') {
    if (riderId === null) {
      return Api.get(
        `${backend}${year}/${month}/${day}/${customerString}`,
      ).then((response) => response.data.results);
    }
    return Api.get(
      `${backend}${year}/${month}/${day}/${riderId}/${customerString}`,
    ).then((response) => response.data.results);
  }
}

function getUnassignedContractByDate(date, callback) {
  date = moment(date);
  const year = date.format('YYYY');
  const month = date.format('MM');
  const day = date.format('D');
  Api.get(`${CONTRACTS_BY_DATE}${year}/${month}/${day}/`).then(
    (response, err) => {
      callback(response.data.results ? response.data.results : []);
    },
  );
}

function getAssignedContractByDate(date, id, callback) {
  date = moment(date);
  const year = date.format('YYYY');
  const month = date.format('MM');
  const day = date.format('D');
  Api.get(`${CONTRACTS_BY_DATE_AND_RIDER}${year}/${month}/${day}/${id}/`).then(
    (response) => {
      callback(response.data.results ? response.data.results : []);
    },
  );
}
function getAssignedContractSelfByDate(date, callback) {
  const date_moment = moment(date);
  const year = date_moment.format('YYYY');
  const month = date_moment.format('MM');
  const day = date_moment.format('D');
  Api.get(`${CONTRACTS_SELF}${year}/${month}/${day}/`).then(
    (response) => {
      callback(response.data.results ? response.data.results : []);
    },
  );
}
function getCustomer(id, callback) {
  console.log('getCustomer', CUSTOMERS_ENDPOINT, id);
  Api.get(`${CUSTOMERS_ENDPOINT}${id}/`).then((customerResp) => {
    callback(customerResp.data);
  });
}

function getCustomer2(id) {
  console.log('getCustomer2', CUSTOMERS_ENDPOINT, id);
  return Api.get(`${CUSTOMERS_ENDPOINT}${id}/`);
}

function getCustomerPage(url) {
  return Api.get(url);
}

function getSettings() {
  return Api.get(`${BACKEND}settings/1/`).then((response) => response.data);
}
function saveSettings(settings) {
  return Api.put(`${SETTINGS}${settings.id}/`, settings).then(
    (response) => response.data,
  );
}
function deleteCustomer2(id) {
  return Api.delete(`${CUSTOMERS_ENDPOINT}${id}/`);
}

function deleteCustomer(id, callback) {
  Api.delete(`${CUSTOMERS_ENDPOINT}${id}/`).then((customerResp) => {
    callback(customerResp.data);
  });
}

function getFullCustomers(callback) {
  return Api.get(CUSTOMERS_ENDPOINT).then((response) => response.data);
}

function deleteContract(url, callback) {
  Api.delete(url).then((response) => callback(response.data.results));
}

function postNewAddress(newAddress, callback) {
  Api.post(ADDRESSES, newAddress).then((resp) => callback(resp.data));
}

function deleteAddress(url) {
  return Api.delete(url);
}

function contractPayloadFromFrontend(contract) {
  return getAnon().then((resp) => {
    const { contractForms: contractPositions } = contract;
    console.log(contract);
    const newContract = {
      customer: contract.customer.customer_url,
      zone: contract.zone,
      distance: contract.distance,
      price: contract.price + contract.extra,
      extra: contract.extra2,
      dispo: [],
      type: contract.type,
      repeated: contract.isRepeated
        ? {
            start_date: contract.repeatedstartdate,
            end_date: contract.repeatedenddate,
            days_of_the_week: contract.repeated.days_of_the_week,
          }
        : null,
    };
    newContract.positions = [];
    contractPositions.forEach((entry) => {
      const { data: position, id: pos } = entry;
      let customerUrl = position.customer_anon
        ? resp.data.url
        : position.customer_url;
      console.log(position, pos);
      if (position.customer_is_pick_up && pos === 0) {
        customerUrl = newContract.customer;
      }
      if (position.customer_is_drop_off && pos > 0) {
        customerUrl = position.customer_url;
      }

      newContract.positions.push({
        position: pos,
        start_time: position.start_time.format('YYYY-MM-DDTHH:mm:ssZ'),
        start_time_to: position.start_time_to.format('YYYY-MM-DDTHH:mm:ssZ'),
        customer_is_drop_off: position.customer_is_drop_off,
        customer_is_pick_up: position.customer_is_pick_up,
        memo: position.notes,
        new_customer: customerUrl,
        weight_size_bonus: position.weight_size_bonus,
        is_cargo: position.is_cargo,
        is_express: position.is_express,
        is_bigbuilding: position.is_bigbuilding,
        anon_name: position.customer_anon ? position.anon_name : '',
        get_there_bonus: position.get_there_bonus,
        waiting_bonus: position.waiting_bonus,
        distance: position.distance,
        price: position.basePrice,
        bonus: position.bonus,
        zone: position.baseZone,
        phone_1: position.phone_1,
        phone_2: position.phone_2,
        email: position.email,
        talk_to: position.talk_to,
        address: [
          {
            street: position.street_name,
            number: position.number,
            stair: position.stair,
            level: position.level,
            door: position.door,
            postal_code: position.postal_code,
            lat: position.lat,
            lon: position.long,
            talk_to: position.talk_to,
            talk_to_extra: '',
            extra: '',
          },
        ],
      });
    });
    return newContract;
  });
}

function prepareNewContract(contract) {
  return contractPayloadFromFrontend(contract);
}

function putContract(contract, callback) {
  prepareNewContract(contract).then((payload) =>
  {
    let url = contract.url;
    if (BACKEND.includes('https:') && url.includes('http:')) {
      url = url.replace('http:', 'https:');
    }
    Api.put(url, payload)
      .then((response) => {
        callback(response);
      })
      .catch((error) => console.log(error))},
  );
}

function postNewContract(contract, callback) {
  prepareNewContract(contract).then((payload) =>
    Api.post(`${CONTRACTS_ENDPOINT}`, payload)
      .then((response) => callback(response))
      .catch((error) => console.log(error)),
  );
}

function customerPayloadFromContractform(formData) {
  const position = formData;
  const ext_id =
    position.customer_number !== '' ? position.customer_number : '-1';
  const newCustomerPayload = {
    name: position.customer_name,
    phone_1: position.phone_1,
    phone_2: position.phone_2,
    external_id: ext_id,
    email: position.email,
    payment: position.payment,
    has_delayed_payment: position.hasDelayedPayment,
    addresses: [
      {
        street: position.street_name,
        number: position.number,
        stair: position.stair,
        level: position.level,
        door: position.door,
        extra: '',
        postal_code: position.postal_code,
        lat: position.lat,
        lon: position.long,
        talk_to: position.talk_to,
        talk_to_extra: position.talk_to_extra,
      },
    ],
  };
  return newCustomerPayload;
}

function putCustomer(data, callback) {
  console.log('putCustomer', data);
  Api.put(
    `${CUSTOMERS_ENDPOINT}
    data.customer_url`,
    customerPayloadFromContractform(data),
  ).then((response) => callback(response.data.results));
}

function putCustomer2(url, payload) {
  console.log('putCustomer2', url, payload);
  if (BACKEND.includes('https:') && url.includes('http:')) {
    url = url.replace('http:', 'https:');
  }
  return Api.put(`${url}`, payload);
}

function postNewCustomer(data) {
  return Api.post(
    `${CUSTOMERS_ENDPOINT}`,
    customerPayloadFromContractform(data),
  ).then((response) => {
    toast.success('Kunde gespeichert');
    return response.data;
  });
}

function getAnon() {
  return Api.get(`${GET_ANON}`).then((resp) =>
    Api.get(`${CUSTOMERS_ENDPOINT}${resp.data.id}/`),
  );
}

function getStaffByDate(date, callback) {
  date = moment(date);
  const year = date.format('YYYY');
  const month = date.format('MM');
  const day = date.format('DD');
  Api.get(`staff/date/${year}/${month}/${day}/`).then((response) => {
    return callback(response.data);
  });
}

function getActiveStaffByDate(date, callback) {
  date = moment(date);
  const year = date.format('YYYY');
  const month = date.format('MM');
  const day = date.format('DD');
  Api.get(`staff/active/${year}/${month}/${day}/`).then((response) =>
    callback(response.data),
  );
}

function getTimesByDate(date, callback) {
  date = moment(date);
  const year = date.format('YYYY');
  const month = date.format('MM');
  const day = date.format('DD');
  Api.get(`times/date/${year}/${month}/${day}/`).then((response) =>
    callback(response.data.results),
  );
}

function getTimesByMonth(date, callback) {
  date = moment(date);
  const year = date.format('YYYY');
  const month = date.format('MM');
  Api.get(`times/date/${year}/${month}/`).then((response) =>
    callback(response.data.results),
  );
}

function getStaffNames(callback) {
  Api.get(`staffnames/`).then((response) => {
    callback(response.data);
  });
}

function postNewStaffMember(newStaffMember) {
  return Api.post(`staff/`, newStaffMember)
    .then((response) => response.data.results)
    .catch((error) => console.log('postNewStaffMember Error', error));
}

function getStreetNames(name) {
  return Api.get(`${STREETNAMES}${name}/`).then(
    (response) => response.data.results,
  );
}

function getStreetNamesFast(name) {
  if (name && name !== '') {
    return Api.get(`${STREETNAMES_FAST}${name}/`);
  }
  return new Promise((resolve) => {
    resolve([]);
  });
}

function getSales(date) {
  date = moment(date);
  const year = date.format('YYYY');
  const month = date.format('MM');
  const day = date.format('DD');
  return Api.get(`sales/${year}/${month}/${day}/`).then(
    (response) => response,
  );
}

function getContracts() {
  return Api.get(`totalcontracts/`).then((response) => response.data);
}

function getRepeatedContracts(weekday) {
  const endpoint = weekday !== 'All' ? `repeated/${weekday}/` : 'repeatedall';
  return Api.get(endpoint).then((response) => response.data.results);
}

function getTerminatedRepeatedContracts(weekday) {
  const endpoint =
    weekday !== 'All' ? `repeateddone/${weekday}/` : 'repeateddoneall';
  return Api.get(endpoint).then((response) => response.data.results);
}

function putDelayedPayment(id, delayedObj) {
  return Api.put(`${DELAYEDPAYMENT}/${id}/`, delayedObj);
}

export {
  getStreetNames,
  getStreetNamesFast,
  postNewContract,
  putContract,
  deleteContract,
  getCustomer,
  getCustomer2,
  getCustomerPage,
  deleteCustomer,
  deleteCustomer2,
  getFullCustomers,
  postNewAddress,
  getUnassignedContractByDate,
  getAssignedContractByDate,
  getAssignedContractSelfByDate,
  getContractArchive,
  getPreorders,
  getCustomersByNameList,
  getCustomersByExternalIdList,
  postNewCustomer,
  putCustomer,
  putCustomer2,
  getAnon,
  getStaffByDate,
  getActiveStaffByDate,
  getStaffNames,
  postNewStaffMember,
  deleteAddress,
  getSales,
  getContracts,
  getRepeatedContracts,
  getTerminatedRepeatedContracts,
  putDelayedPayment,
  getTimesByDate,
  getTimesByMonth,
  getDelayedPaymentCustomers,
  generateRepeatedContracts,
  getSettings,
  saveSettings,
  BACKEND,
  PUBHOST,
  DEBUG,
  Api,
};
