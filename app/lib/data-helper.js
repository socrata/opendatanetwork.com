'use strict';

//TODO: Better name.
class DataHelper {
    static getConstraintByValueOrDefault(permutations, year) {

        const constraintValue = year.toLowerCase();

        for (var i = 0; i < permutations.length; i++) {

            var constraint = permutations[i];

            if (constraint.constraint_value == constraintValue)
                return constraint;
        }

        return permutations[0];
    }

}

module.exports = DataHelper;
