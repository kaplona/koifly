'use strict';

var React = require('react');
var History = require('react-router').History;

var ErrorBox = require('../common/notice/error-box');
var Loader = require('../common/loader');
var MobileTopMenu = require('../common/menu/mobile-top-menu');
var NavigationMenu = require('../common/menu/navigation-menu');
var View = require('../common/view');


var itemViewMixin = function(modelKey) {

    const VIEW_ASSETS = require('../../constants/view-assets')[modelKey];
    var Model = VIEW_ASSETS.model;

    return {

        mixins: [ History ],

        handleStoreModified: function() {
            var storeContent = Model.getItemOutput(this.props.params.id);
            if (storeContent !== null && storeContent.error) {
                this.setState({ loadingError: storeContent.error });
            } else {
                this.setState({
                    item: storeContent,
                    loadingError: null
                });
            }
        },

        handleToListView: function() {
            this.history.pushState(null, `/${Model.keys.plural}`);
        },

        handleEditItem: function() {
            this.history.pushState(null, `/${Model.keys.single}/${this.props.params.id}/edit`);
        },
        
        renderLayout: function(children) {
            return (
                <View onStoreModified={ this.handleStoreModified } error={ this.state.loadingError }>
                    <MobileTopMenu
                        leftButtonCaption='Back'
                        onLeftClick={ this.handleToListView }
                        />
                    <NavigationMenu currentView={ Model.getModelKey() } />
                    { children }
                </View>
            );
        },

        renderLoader: function() {
            return this.renderLayout(<Loader />);
        },

        renderError: function() {
            return this.renderLayout(<ErrorBox error={ this.state.loadingError } onTryAgain={ this.handleStoreModified } />);
        }
    };
};


module.exports = itemViewMixin;
