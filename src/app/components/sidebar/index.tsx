'use strict';

import React, { CSSProperties } from 'react';
import PropTypes from 'prop-types';
import HideableComponent from '../generic/hideable';
import { PreferencesSection } from '../../../../types/preferences';

interface SidebarProps {
    sections: PreferencesSection[];
    activeSection: string;
    onSelectSection: (id: string) => void;
    preferences: Record<string, any>;
}
class Sidebar extends React.Component<SidebarProps> {
    render() {
        const { preferences } = this;

        const sections = this.sections.map((section) => {
            const isActive = this.activeSection === section.id;
            let className = 'sidebar-section' + (isActive ? ' active' : '');

            const rawPath = section.customIcon
                ? section.customIcon
                : `svg/${section.icon}.svg`;
            const iconUrl = rawPath.replace(/\\/g, '/');
            const safeUrl = encodeURI(iconUrl);

            const iconStyle = section.unmaskedIcon
                ? {
                      background: `transparent url("${safeUrl}") no-repeat center / contain`,
                  }
                : {
                      mask: `url("${safeUrl}") no-repeat center / contain`,
                      WebkitMask: `url("${safeUrl}") no-repeat center / contain`,
                  };

            const liStyle: CSSProperties = section.iconColor
                ? ({ '--icon-clr': section.iconColor } as CSSProperties)
                : {};

            return (
                <HideableComponent
                    key={section.id}
                    allPreferences={preferences}
                    field={section}
                >
                    <li
                        className={className}
                        style={liStyle}
                        role="tab"
                        id={`tab-${section.id}`}
                        aria-selected={isActive}
                        aria-controls={`tabpanel-${section.id}`}
                        tabIndex={isActive ? 0 : -1}
                        aria-label={section.label}
                        onClick={this.selectSection.bind(this, section.id)}
                    >
                        <div className="section-icon" style={iconStyle} />
                        <span className="section-label">{section.label}</span>
                    </li>
                </HideableComponent>
            );
        });

        return (
            <ul
                className="sidebar"
                role="tablist"
                aria-label="Side bar"
                onKeyDown={this.onTablistKeyDown}
            >
                {sections}
            </ul>
        );
    }

    get preferences() {
        return this.props.preferences;
    }

    get sections() {
        return this.props.sections;
    }

    get activeSection() {
        return this.props.activeSection;
    }

    get onSelectSection() {
        return this.props.onSelectSection;
    }

    selectSection(sectionId) {
        this.setState({
            activeSection: sectionId,
        });

        this.onSelectSection(sectionId);
    }

    onTablistKeyDown(e) {
        if (e.repeat) {
            return;
        }

        let tabIncrement = 0;
        if (e.keyCode === 40 || e.keyCode === 39) {
            tabIncrement++;
        } else if (e.keyCode === 37 || e.keyCode === 38) {
            tabIncrement--;
        }

        if (tabIncrement === 0) {
            return;
        }

        const { activeSection, sections } = this;
        const sectionIds = sections.map((section) => section.id);
        if (sectionIds.length <= 0) {
            return;
        }

        const index = sectionIds.indexOf(activeSection);
        if (
            index === -1 ||
            (tabIncrement > 0 && index >= sectionIds.length - 1)
        ) {
            // Last tab is selected, or no tab found... Just return to the first tab.
            this.selectSection(sectionIds[0]);
        } else if (index === 0 && tabIncrement < 0) {
            // Select last tab
            this.selectSection(sectionIds[sectionIds.length - 1]);
        } else {
            this.selectSection(sectionIds[index + tabIncrement]);
        }
    }
}

Sidebar.propTypes = {
    sections: PropTypes.array,
    activeSection: PropTypes.string,
    onSelectSection: PropTypes.func,
    selectSection: PropTypes.func,
    onTablistKeyDown: PropTypes.func,
    preferences: PropTypes.object,
};

export default Sidebar;
