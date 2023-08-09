import React, { Component } from 'react';
import AsyncSelect from 'react-select/async';
import { getCustomer, getCustomersByNameList } from '../utils/transportFunctions';

class CustomerSelect extends Component {
  constructor(props) {
    super(props);
    this.selectLoadOptions = this.selectLoadOptions.bind(this);
    this.nameFilter = this.nameFilter.bind(this);
    this.selectChangeHandler = this.selectChangeHandler.bind(this);
    this.state = {
      customer: {
        url: '',
        id: 0,
        name: '',
        addresses: [{
          street: '',
        }],
      },
      address: {},
      selectedOption: null,
    };
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
          callback(options);
        }));
      }
    }, 50);
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

  selectChangeHandler(val) {
    if (val !== null) {
      const { value } = val;
      getCustomer(value, (response) => {
        const address = response.addresses[0];
        this.setState({ customer: response, address, selectedOption: val }, this.props.setCustomer(response));
      });
    } else {
      this.setState({ customer: null, address: null, selectedOption: null }, this.props.setCustomer(null));
    }
  }

  render() {
    const value = this.state.selectedOption;
    return (
      <div>
        <AsyncSelect
          name="customer_name"
          value={value}
          loadOptions={this.selectLoadOptions}
          ignoreAccents={false}
          ignoreCase={false}
          filterOption={this.nameFilter}
          onChange={this.selectChangeHandler}
          cacheOptions
          defaultOptions
        />
      </div>
    );
  }
}

export default CustomerSelect;
