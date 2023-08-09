import React, { Component } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import AsyncSelect from 'react-select/async';
import { getCustomersByNameList, getCustomer, getCustomersByExternalIdList } from '../utils/transportFunctions';
import CustomerDetail from '../components/CustomerDetail';

class CustomerList extends Component {
  constructor() {
    super();

    this.update = this.update.bind(this);
    this.selectChangeHandler = this.selectChangeHandler.bind(this);
    this.nameFilter = this.nameFilter.bind(this);
  }

  state = {
    loading: false,
    customer: {
      url: '',
      id: 0,
      addresses: [{
        street: '',
      }],
    },
    address: {},
  };

  componentDidMount() {
    this.update();
  }

  update() {
    if (this.state.customer.id !== 0) {
      this.setState({ loading: true });
      getCustomer(this.state.customer.id, (response) => {
        const address = response.addresses[0];
        this.setState({ customer: response, address, loading: false });
      });
    }
  }

  selectLoadOptions(input, callback) {
    setTimeout(() => {
      const options = [];
      if (input.length > 2) {
        getCustomersByNameList(input, ((response) => {
          response.forEach((customer) => {
            const { id, name, url } = customer;
            options.push({ value: id, label: name, url });
          });
          options.push({ value: 'neu', label: 'Neuer Kunde' });
          callback(options);
        }));
      } else {
        options.push({ value: 'neu', label: 'Neuer Kunde' });
        callback(options);
      }
    }, 100);
  }

  selectbyIdLoadOptions(input, callback) {
    setTimeout(() => {
      const options = [];
      if (input.length > 2) {
        getCustomersByExternalIdList(input, ((response) => {
          response.forEach((customer) => {
            const {
              id, external_id, name, url,
            } = customer;
            options.push({ value: id, label: `${external_id} ${name}`, url });
          });
          options.push({ value: 'neu', label: 'Neuer Kunde' });
          callback(options);
        }));
      } else {
        options.push({ value: 'neu', label: 'Neuer Kunde' });
        callback(options);
      }
    }, 100);
  }

  nameFilter(option, filter) {
    let hasSubstring = false;
    if (filter.includes(' ')) {
      const parts = filter.split(' ');
      parts.forEach((part) => {
        if (option.label.toLowerCase().includes(part.toLowerCase())) hasSubstring = true;
      });
    } else if (option.label.toLowerCase().includes(filter.toLowerCase())) hasSubstring = true;
    return hasSubstring;
  }

  idFilter(option, filter) {
    return true;
  }

  selectChangeHandler(val) {
    val = val.value;
    if (val !== null && val !== 0 && val !== '') {
      getCustomer(val, (response) => {
        if (response.addresses) {
          const address = response.addresses[0];
          this.setState({ customer: response, address });
        }
      });
    }
  }

  render() {
    const { customer } = this.state;
    return (
      <Container fluid className="contractList bbott">
        <Row>
          <Col xs={12}>
            <h3 className="def-headline">Kundendatenbank</h3>
          </Col>
          <Col xs={2}>
            Name
          </Col>
          <Col xs={4}>
            <AsyncSelect
              name="customer_name"
              value={this.state.customer.id}
              loadOptions={this.selectLoadOptions}
              filterOption={this.nameFilter}
              onChange={this.selectChangeHandler}
              cacheOptions
              defaultOptions
              placeholder="Name"

            />
          </Col>
          <Col xs={1} />
          <Col xs={1}>
            Kdn.Nr
          </Col>
          <Col xs={4}>
            <AsyncSelect
              name="customer_name"
              value={this.state.customer.id}
              loadOptions={this.selectbyIdLoadOptions}
              filterOption={this.idFilter}
              onChange={this.selectChangeHandler}
              cacheOptions
              defaultOptions
              placeholder="Kundennummer"

            />
          </Col>
        </Row>
        {customer.id
          ? <CustomerDetail key={customer.id} customer={customer} cl="blgg" update={this.update} />
          : (
            <div>
              <hr />
              Kein:e Kund:in ausgewählt
            </div>
          )}
      </Container>
    );
  }
}

export default CustomerList;
