'use strict';

const React = require('react');
const { arrayOf, bool, func, number, shape, string } = React.PropTypes;
const _ = require('lodash');
const Util = require('../../utils/util');

require('./table.less');


const Table = React.createClass({

  propTypes: {
    rows: arrayOf(shape({
      id: number.isRequired
    })),
    columns: arrayOf(shape({
      key: string.isRequired,
      label: string.isRequired,
      defaultSortingDirection: bool.isRequired,
      sortingKey: string
    })).isRequired,
    initialSortingField: string.isRequired,
    onRowClick: func
  },

  getInitialState: function() {
    const sortingField = this.props.initialSortingField;
    const sortingDirection = this.getDefaultSortingDirection(sortingField);

    return {
      sortingField: sortingField,
      sortingDirection: sortingDirection
    };
  },

  handleSorting: function(newSortingField) {
    if (this.state.sortingField === newSortingField) {
      this.setState(previousState => {
        return {
          sortingDirection: !previousState.sortingDirection
        };
      });
      return;
    }

    const newsortingDirection = this.getDefaultSortingDirection(newSortingField);
    this.setState({
      sortingField: newSortingField,
      sortingDirection: newsortingDirection
    });
  },

  handleRowClick: function(flightId) {
    if (this.props.onRowClick) {
      this.props.onRowClick(flightId);
    }
  },

  getDefaultSortingDirection: function(fieldName) {
    let sortingDirection = true;
    for (let i = 0; i < this.props.columns.length; i++) {
      const column = this.props.columns[i];
      // If sortingKey column property presents, compare it to fieldName
      // otherwise compare fieldName with key property
      if ((column.sortingKey && column.sortingKey === fieldName) ||
        (!column.sortingKey && column.key === fieldName)
      ) {
        sortingDirection = column.defaultSortingDirection;
        break;
      }
    }
    return sortingDirection;
  },

  render: function() {

    const headerNodes = _.map(this.props.columns, column => {
      let arrow = '\u25bc';
      let arrowClassName = 'arrow';
      if (column.key === this.state.sortingField ||
        column.sortingKey === this.state.sortingField
      ) {
        arrow = this.state.sortingDirection ? '\u25b2' : '\u25bc';
      } else {
        arrowClassName += ' x-hidden';
      }

      return (
        <th
          key={'column-' + column.key}
          onClick={() => this.handleSorting(column.sortingKey || column.key)}
        >
          {column.label}
          <span className={arrowClassName}>{arrow}</span>
        </th>
      );
    });


    const sortingOrder = this.state.sortingDirection ? 'asc' : 'desc';
    const sortedRows = _.sortByOrder(
      this.props.rows,
      // make string uppercase so as to avoid ABCabc type of sorting
      [ row => Util.upperCaseString(row[this.state.sortingField]) ],
      [ sortingOrder ]
    );

    const rowNodes = _.map(sortedRows, row => {
      const rowToDisplay = [];
      for (let i = 0; i < this.props.columns.length; i++) {
        const columnKey = this.props.columns[i].key;
        rowToDisplay.push(
          <td key={'cell-' + row.id + '-' + columnKey}>
            {Util.formatText(row[columnKey])}
          </td>
        );
      }
      return (
        <tr
          key={'row-' + row.id}
          onClick={() => this.handleRowClick(row.id)}
        >
          {rowToDisplay}
        </tr>
      );
    });

    return (
      <table className='koifly-table'>
        <thead>
        <tr>{headerNodes}</tr>
        </thead>
        <tbody>{rowNodes}</tbody>
      </table>
    );
  }
});


module.exports = Table;
