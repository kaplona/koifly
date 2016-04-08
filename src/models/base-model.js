'use strict';

var _ = require('lodash');

var dataService = require('../services/data-service');
var ErrorTypes = require('../errors/error-types');
var KoiflyError = require('../errors/error');
var Util = require('../utils/util');


var BaseModel = {
    
    getModelKey: function() {
        return this.keys.single;
    },


    /**
     *
     * @param {string|number} [itemId]
     * @returns {Object|null} - all or one item of particular store
     * null - if store is empty
     * error - if loading error occurred or there is no item with requested id
     */
    getStoreContent: function(itemId) {
        // There is loading error
        var loadingError = dataService.getLoadingError();
        if (loadingError) {
            return { error: loadingError };
        }

        // No data has been received yet
        var storeContent = dataService.getStoreContent(this.keys.plural);
        if (!storeContent) {
            dataService.initiateStore();
            return null;
        }

        // No item with requested id
        if (itemId && !storeContent[itemId]) {
            return { error: new KoiflyError(ErrorTypes.RECORD_NOT_FOUND) };
        }

        if (itemId) {
            return storeContent[itemId];
        }

        return storeContent;
    },


    getValidationConfig: function() {
        return this.formValidationConfig;
    },


    /**
     * @param {object} newItem
     * @returns {Promise} - if saving was successful or not
     */
    saveItem: function(newItem) {
        newItem = this.getDataForServer(newItem);
        return dataService.saveData(newItem, this.getModelKey());
    },


    /**
     * @param {number} itemId
     * @returns {Promise} - if deleting was successful or not
     */
    deleteItem: function(itemId) {
        return dataService.saveData({ id: itemId, see: false }, this.getModelKey());
    },


    /**
     * Walks through new item and replace all empty values with default ones
     * @param {object} newItem
     * @returns {object} - with replaced empty fields
     */
    setDefaultValues: function(newItem) {
        var fieldsToReplace = {};
        _.each(this.getValidationConfig(), (config, fieldName) => {
            // If there is default value for empty field - set it
            if (Util.isEmptyString(newItem[fieldName]) &&
                config.rules.defaultVal !== undefined
            ) {
                fieldsToReplace[fieldName] = config.rules.defaultVal;
            }
        });
        return _.extend({}, newItem, fieldsToReplace);
    }
};


module.exports = BaseModel;
