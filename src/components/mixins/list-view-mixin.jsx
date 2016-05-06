'use strict';

var React = require('react');
var browserHistory = require('react-router').browserHistory;

var Button = require('../common/buttons/button');
var EmptyList = require('../common/empty-list');
var Loader = require('../common/loader');
var NavigationMenu = require('../common/menu/navigation-menu');


var listViewMixin = function(modelKey) {

    const VIEW_ASSETS = require('../../constants/view-assets')[modelKey];
    var Model = VIEW_ASSETS.model;

    return {

        getInitialState: function() {
            return {
                items: null, // no data received
                loadingError: null
            };
        },

        /**
         * Once store data was modified or on initial rendering,
         * requests for presentational data form the Model
         * and updates component's state
         */
        handleStoreModified: function() {
            var storeContent = Model.getListOutput();

            if (storeContent && storeContent.error) {
                this.setState({ loadingError: storeContent.error });
            } else {
                this.setState({
                    items: storeContent,
                    loadingError: null
                });
            }
        },

        /**
         * @param {number} id - id of the item which page to open
         */
        handleRowClick: function(id) {
            browserHistory.push(`/${encodeURIComponent(Model.keys.single)}/${encodeURIComponent(id)}`);
        },

        handleAddItem: function() {
            browserHistory.push(`/${encodeURIComponent(Model.keys.single)}/0/edit`);
        },
        
        renderNavigationMenu: function() {
            return <NavigationMenu currentView={ Model.getModelKey() } />;
        },

        renderLoader: function() {
            return (this.state.items === null) ? <Loader /> : null;
        },

        renderEmptyList: function() {
            if (this.state.items &&
                this.state.items.length === 0
            ) {
                return <EmptyList ofWhichItems={ Model.keys.plural } onAdding={ this.handleAddItem } />;
            }
        },

        renderAddItemButton: function() {
            return <Button caption={ VIEW_ASSETS.addButtonCaption } onClick={ this.handleAddItem } />;
        }
    };
};


module.exports = listViewMixin;
