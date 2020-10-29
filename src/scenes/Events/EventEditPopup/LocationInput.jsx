import React from 'react';

import './LocationInput.scss';
import Checkbox from 'components/Checkbox';
import { StyledSelect } from 'components/SelectField';

const locations = [
  {
    description: 'Siebel',
    latitude: 40.113812,
    longitude: -88.224937
  },
  {
    description: 'ECEB',
    latitude: 40.114937,
    longitude: -88.228063
  },
  {
    description: 'DCL',
    latitude: 40.113062,
    longitude: -88.226563
  },
  {
    description: 'Kenney Gym',
    latitude: 40.113062,
    longitude: -88.228438
  }
];

const tags = ['DCL', 'KENNEY', 'SIEBEL0', 'SIEBEL1', 'SIEBEL2', 'ECEB1', 'ECEB2', 'ECEB3'];

const blankLocation = { description: '', latitude: 0, longitude: 0, tags: [] };

export default function LocationCheckbox({ field, form }) {
  // Note: The description of a selectedLocation may include additional details ("DCL Basement and 1st floor")
  // while the description of the corresponding location would only contain "DCL"

  const selectedLocations = field.value || [];

  const addLocation = (location, otherInfo = {}) => {
    // otherInfo may be only updating a single field (e.g. tags) so we set the current
    // values of the other fields as the defaults
    const {
      details = getDetails(location),
      tags = getTags(location)
    } = otherInfo;

    const newLocation = Object.assign({}, location);
    newLocation.description += ` ${details}`;
    newLocation.tags = tags;

    // First remove any existing selectedLocations corresponding to this location (for editing details)
    form.setFieldValue(field.name, selectedLocations
      .filter(selected => !selected.description.includes(location.description))
      .concat(newLocation)
    );
  }

  const removeLocation = location => {
    form.setFieldValue(field.name, selectedLocations
      .filter(selected => !selected.description.includes(location.description))
    );
  }

  const isSelected = location => (
    selectedLocations.some(selected => selected.description.includes(location.description))
  );

  const findSelectedLocation = name =>
    selectedLocations.find(({ description }) => description.includes(name)) || blankLocation;

  const getDetails = location => {
    // Find the corresponding selectedLocation's description (contains extra details) for this location
    const selectedDescription = findSelectedLocation(location.description).description;

    // Remove the base location name to only return the details
    return selectedDescription.replace(location.description, '').trimStart();
  }

  const getTags = location => findSelectedLocation(location.description).tags;

  return (
    <div className="location-input">
      {
        locations.map(location => (
          <div className="location-option" key={location.description}>
            <Checkbox
              value={isSelected(location)}
              label={location.description}
              onChange={checked => checked ? addLocation(location) : removeLocation(location)}
            />

            <input
              className="details"
              placeholder="Details"
              value={getDetails(location)}
              disabled={!isSelected(location)}
              onChange={e => addLocation(location, { details: e.target.value })}
            />

            <StyledSelect
              className="tags-select"
              placeholder="Tags"
              value={getTags(location).map(tag => ({ value: tag, label: tag }))}
              options={tags.map(tag => ({ value: tag, label: tag }))}
              onChange={selected => addLocation(location, { tags: (selected || []).map(x => x.value) })}
              isDisabled={!isSelected(location)}
              menuPlacement="top"
              isMulti={true}
              controlShouldRenderValue={false}
              hideSelectedOptions={false}
              closeMenuOnSelect={false}
              isClearable={false}
            />
          </div>
        ))
      }
    </div>
  )
}
