import React from 'react';
import { arrayOf, bool, func, number, shape, string } from 'prop-types';
import orderBy from 'lodash.orderby';
import Util from '../../utils/util';

require('./table.less');


export default class Table extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      sortingField: this.props.initialSortingField,
      sortingDirection: this.getDefaultSortingDirection(this.props.initialSortingField)
    };

    this.handleSorting = this.handleSorting.bind(this);
    this.handleRowClick = this.handleRowClick.bind(this);
  }

  handleSorting(newSortingField) {
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
  }

  handleRowClick(flightId) {
    if (this.props.onRowClick) {
      this.props.onRowClick(flightId);
    }
  }

  getDefaultSortingDirection(fieldName) {
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
  }

  render() {
    const headerNodes = this.props.columns.map(column => {
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
    const sortedRows = orderBy(
      this.props.rows,
      // Sort is case insensitive
      [ row => Util.upperCaseString(row[this.state.sortingField]) ],
      [ sortingOrder ]
    );

    const rowNodes = sortedRows.map(row => {
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
}


Table.propTypes = {
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
};
