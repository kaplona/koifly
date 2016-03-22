'use strict';

var React = require('react');
var History = require('react-router').History;

var Button = require('../common/buttons/button');
var EmptyList = require('../common/empty-list');
var Loader = require('../common/loader');
var NavigationMenu = require('../common/menu/navigation-menu');


var listViewMixin = function(modelKey) {

    const VIEW_ASSETS = require('../../constants/view-assets')[modelKey];
    var Model = VIEW_ASSETS.model;

    return {

        mixins: [ History ],

        getInitialState: function() {
            return {
                items: null,
                loadingError: null
            };
        },

        handleStoreModified: function() {
            var storeContent = Model.getListOutput();

            if (storeContent !== null && storeContent.error) {
                this.setState({ loadingError: storeContent.error });
            } else {
                this.setState({
                    items: storeContent,
                    loadingError: null
                });
            }
        },

        handleRowClick: function(id) {
            this.history.pushState(null, `/${Model.keys.single}/${id}`);
        },

        handleAddItem: function() {
            this.history.pushState(null, `/${Model.keys.single}/0/edit`);
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
