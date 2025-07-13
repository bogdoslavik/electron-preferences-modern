'use strict';

import React from 'react';
import PropTypes from 'prop-types';
import {PreferenceField} from "../../../types";

interface HideableProps {
    field: PreferenceField;
    allPreferences: Record<string, any>;
    children: React.ReactNode;
}
class HideableComponent extends React.Component<HideableProps> {
    render() {
        const { isHidden } = this;

        if (isHidden) {
            return null;
        }

        return this.props.children;
    }

    get field() {
        return this.props.field;
    }

    get isHidden() {
        const { allPreferences } = this.props;
        try {
            return (
                typeof this.field.hideFunction !== 'undefined' &&
                typeof this.field.hideFunction === 'function' &&
                this.field.hideFunction(allPreferences)
            );
        } catch (e) {
            console.error(
                "Seems like there's an error within your hideFunction. Please investigate: " +
                    e.message,
                e,
            );
            console.error(
                'These were the current preferences: ',
                allPreferences,
            );
        }

        return false;
    }
}

HideableComponent.propTypes = {
    field: PropTypes.object,
    allPreferences: PropTypes.object,
    children: PropTypes.node,
};

export default HideableComponent;
