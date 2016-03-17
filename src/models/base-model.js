'use strict';

var dataService = require('../services/data-service');


var BaseModel = {
    
    getModelKey: function() {
        return this.keys.single;
    },

    getStoreContent: function() {
        return dataService.getStoreContent(this.keys.plural);
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
        return dataService.saveItem({ id: itemId, see: false }, this.getModelKey());
    }
};


module.exports = BaseModel;
