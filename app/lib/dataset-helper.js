'use strict';

class DatasetHelper {
    static isNotComputedField(column) {
        return !column.fieldName.match(':@computed_');
    }

    static getDataset(dataAvailability, vector) {
        for (var topicKey in dataAvailability.topics) {
            var topic = dataAvailability.topics[topicKey];
            if (topic.datasets[vector])
                return topic.datasets[vector];
        }
        return null;
    }

    static getVariableByIdOrDefault(variablesArray, metric) {

        // If metric is empty, use first variable
        //
        if (metric.length == 0)
            return variablesArray[0];

        for (var i = 0; i < variablesArray.length; i++) {

            var variable = variablesArray[i];

            if (variable.id == metric)
                return variable;
        }

        // If not found, use first variable
        //
        return variablesArray[0];
    }

}

module.exports = DatasetHelper;
