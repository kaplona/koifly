'use strict';

var React = require('react');
var _ = require('lodash');

require('./table.less');


var Table = React.createClass({

    propTypes: {
        rows: React.PropTypes.array,
        columns: React.PropTypes.arrayOf(React.PropTypes.shape({
            key: React.PropTypes.string,
            label: React.PropTypes.string,
            defaultSortingDirection: React.PropTypes.bool
        })).isRequired,
        initialSortingField: React.PropTypes.string.isRequired,
        onRowClick: React.PropTypes.func
    },

    getInitialState: function() {
        var sortingField = this.props.initialSortingField;
        var sortingDirection = this.getDefaultSortingDirection(sortingField);

        return {
            sortingField: sortingField,
            sortingDirection: sortingDirection
        };
    },

    handleSorting: function(newSortingField) {
        if (this.state.sortingField === newSortingField) {
            this.setState((previousState) => {
                return {
                    sortingDirection: !previousState.sortingDirection
                };
            });
            return;
        }

        var newsortingDirection = this.getDefaultSortingDirection(newSortingField);
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
        var sortingDirection = true;
        for (var i = 0; i < this.props.columns.length; i++) {
            if (this.props.columns[i].key === fieldName) {
                sortingDirection = this.props.columns[i].defaultSortingDirection;
                break;
            }
        }
        return sortingDirection;
    },

    render: function() {

        var headerNodes = _.map(this.props.columns, (column) => {
            var arrow = '\u25bc';
            var arrowClassName = 'arrow';
            if (column.key === this.state.sortingField) {
                arrow = this.state.sortingDirection ? '\u25bc' : '\u25b2';
            } else {
                arrowClassName += ' x-hidden';
            }

            return (
                <th
                    key={ 'column-' + column.key }
                    onClick={ () => this.handleSorting(column.key) }
                    >
                    { column.label }
                    <span className={ arrowClassName }>{ arrow }</span>
                </th>
            );
        });


        var sortingOrder = this.state.sortingDirection ? 'asc' : 'desc';
        var sortedRows = _.sortByOrder(this.props.rows, [ (row) => {
            // turn string to upper case so as to avoid ABCabc type of sorting
            if (typeof row[this.state.sortingField] === 'string') {
                return row[this.state.sortingField].toUpperCase();
            }
            return row[this.state.sortingField];
        } ], [ sortingOrder ]);

        var rowNodes = _.map(sortedRows, (row) => {
            var rowToDisplay = [];
            for (var i = 0; i < this.props.columns.length; i++) {
                var columnKey = this.props.columns[i].key;
                rowToDisplay.push(
                    <td>
                        { (row[columnKey] !== null) ? row[columnKey] : '-' }
                    </td>
                );
            }
            return (
                <tr
                    key={ 'row-' + row.id }
                    onClick={ () => this.handleRowClick(row.id) }
                    >
                    { rowToDisplay }
                </tr>
            );
        });

        return (
            <table>
                <thead>
                    <tr>{ headerNodes }</tr>
                </thead>
                <tbody>{ rowNodes }</tbody>
            </table>
        );
    }
});


module.exports = Table;
