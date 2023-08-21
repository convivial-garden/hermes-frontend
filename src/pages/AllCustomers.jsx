import React, { Component } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import ReactPaginate from 'react-paginate';
import { faHourglass } from '@fortawesome/free-solid-svg-icons';
import * as R from 'ramda';
import {
  getFullCustomers, getCustomer2, getCustomerPage, BACKEND,
} from '@/utils/transportFunctions.jsx';
import CustomerDetail from '@/components/CustomerDetail';

class AllCustomers extends Component {
  constructor() {
    super();

    this.update = this.update.bind(this);
    this.updateCustomer = this.updateCustomer.bind(this);
  }

  state = {
    loading: false,
    customers: [],
    totalCustomers: 0,
    pageCount: 0,
    nextPage: '',
    previousPage: '',
    itemsPerPage: 100,
    currentPage: 1,
  };

  componentDidMount() {
    this.update();
  }

  update() {
    this.setState({ loading: true });
    getFullCustomers()
      .then((results) => {
        this.setState({
          totalCustomers: results.count,
          pageCount: Math.ceil(results.count / 100),
          nextPage: results.next,
          previousPage: results.previous,
          customers: results.results,
          loading: false,
        });
      });
  }

  updateCustomer(id) {
    const update = () => {
      const customer = this.state.customers.find((customer) => customer && customer.id === id);

      const index = this.state.customers.findIndex((customer) => customer && customer.id === id);
      if (customer) {
        this.setState({ loading: true });

        getCustomer2(customer.id)
          .then((response) => {
            if (response.status === 200) {
              this.setState((prevState) => ({ loading: false, customers: R.update(index, response.data.results, prevState.customers) }));
            }
          });
      }
    };
    return update;
  }

  handleClick(event) {
    let url = '';
    if (event.isNext && this.state.nextPage !== null) {
      this.setState({ currentPage: this.state.currentPage + 1 });
      url = this.state.nextPage;
    } else if (event.isPrevious && this.state.previousPage !== null) {
      this.setState({ currentPage: this.state.currentPage - 1 });
      url = this.state.previousPage;
    } else if (event.nextSelectedPage) {
      this.setState({ currentPage: event.nextSelectedPage + 1 });
      url = `${BACKEND}customers/?page=${event.nextSelectedPage}`;
    }
    if (url !== '') {
      this.setState({ loading: true });
      getCustomerPage(url).then((data) => {
        const results = data.data;
        this.setState({
          customers: results.results,
          loading: false,
          nextPage: results.next,
          previousPage: results.previous,
        });
      });
    }
  }

  render() {
    return (
      <Container fluid className="contractList bbott allcustomers">
        <Row>
          <Col xs={3}>
            <h3 className="def-headline">Liste Aller Kunden</h3>
            {this.state.loading
              ? (
                <h4>
                  <FontAwesomeIcon icon={faHourglass} />
                  {' '}
                  Lade Kunden...
                </h4>
              )
              : (
                <div>
                  <p>
                    {this.state.totalCustomers}
                    {' '}
                    {this.state.totalCustomers === 1 ? 'Kund*Inn' : 'KundInnen'}
                  </p>
                </div>
              )}
          </Col>
          <Col xs={12}>
            <ReactPaginate
              breakLabel="..."
              nextLabel="next >"
              onClick={this.handleClick.bind(this)}
                            // onPageChange={this.handlePageClick.bind(this)}
              pageRangeDisplayed={5}
              pageCount={this.state.pageCount}
              previousLabel="< previous"
              renderOnZeroPageCount={null}
              pageClassName="page-item"
              pageLinkClassName="page-link"
              previousClassName="page-item"
              previousLinkClassName="page-link"
              nextClassName="page-item"
              nextLinkClassName="page-link"
              breakClassName="page-item"
              breakLinkClassName="page-link"
              containerClassName="pagination"
              activeClassName="active"
            />
          </Col>
        </Row>
        {
                    !this.state.loading && this.state.customers.map((customer, index) => {
                      if (customer) {
                        return (
                          <CustomerDetail key={customer.id} customer={customer} cl={index % 2 === 0 ? 'blg' : 'blgg'} update={this.updateCustomer(customer.id)} refresh={this.update} />
                        );
                      }
                    })
                }
        <Row>
          <Col xs={12}>
            <ReactPaginate
              breakLabel="..."
              nextLabel="next >"
              onClick={this.handleClick.bind(this)}
                            // onPageChange={this.handlePageClick.bind(this)}
              pageRangeDisplayed={5}
              pageCount={this.state.pageCount}
              previousLabel="< previous"
              renderOnZeroPageCount={null}
              pageClassName="page-item"
              pageLinkClassName="page-link"
              previousClassName="page-item"
              previousLinkClassName="page-link"
              nextClassName="page-item"
              nextLinkClassName="page-link"
              breakClassName="page-item"
              breakLinkClassName="page-link"
              containerClassName="pagination"
              activeClassName="active"
            />
          </Col>
        </Row>
      </Container>
    );
  }
}

export default AllCustomers;
