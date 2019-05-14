'use strict';

const React = require('react');
const browserHistory = require('react-router').browserHistory;
const ErrorBox = require('../common/notice/error-box');
const MobileTopMenu = require('../common/menu/mobile-top-menu');
const NavigationMenu = require('../common/menu/navigation-menu');
const SectionLoader = require('../common/section/section-loader');
const View = require('../common/view');


const itemViewMixin = function(modelKey) {

    const VIEW_ASSETS = require('../../constants/view-assets')[modelKey];
    const Model = VIEW_ASSETS.model;

    return {

        getInitialState: function() {
            return {
                item: null, // no data received
                loadingError: null
            };
        },

        /**
         * Once store data was modified or on initial rendering,
         * requests for presentational data form the Model
         * and updates component's state
         */
        handleStoreModified: function() {
            const storeContent = Model.getItemOutput(this.props.params.id);
            
            if (storeContent && storeContent.error) {
                this.setState({ loadingError: storeContent.error });
            } else {
                this.setState({
                    item: storeContent,
                    loadingError: null
                });
            }
        },

        handleGoToListView: function() {
            browserHistory.push(`/${encodeURIComponent(Model.keys.plural)}`);
        },

        handleEditItem: function() {
            browserHistory.push(
                `/${encodeURIComponent(Model.keys.single)}/${encodeURIComponent(this.props.params.id)}/edit`
            );
        },

        renderNavigationMenu: function() {
            return <NavigationMenu currentView={Model.getModelKey()} />;
        },
        
        renderSimpleLayout: function(children) {
            return (
                <View onStoreModified={this.handleStoreModified} error={this.state.loadingError}>
                    <MobileTopMenu
                        leftButtonCaption='Back'
                        onLeftClick={this.handleGoToListView}
                    />
                    {this.renderNavigationMenu()}
                    {children}
                </View>
            );
        },

        renderLoader: function() {
            return this.renderSimpleLayout(<SectionLoader />);
        },

        renderError: function() {
            return this.renderSimpleLayout(
                <ErrorBox error={this.state.loadingError} onTryAgain={this.handleStoreModified} />
            );
        }
    };
};


module.exports = itemViewMixin;
