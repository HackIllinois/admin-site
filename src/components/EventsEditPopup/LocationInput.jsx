import React from 'react';

import Checkbox from 'components/Checkbox';
import './LocationInput.scss';

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

export default function LocationCheckbox({ field, form }) {
  // Note: The description of a selectedLocation may include additional details ("DCL Basement and 1st floor")
  // while the description of the corresponding location would only contain "DCL"

  const selectedLocations = field.value || [];

  const addLocation = (location, details = '') => {
    const newLocation = Object.assign({}, location);
    newLocation.description += ` ${details}`;

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

  const getDetails = location => {
    // Find the corresponding selectedLocation's description (contains extra details) for this location
    const selectedDescription = selectedLocations
      .map(selected => selected.description)
      .find(description => description.includes(location.description));
    
    // Remove the base location name to only return the details
    return (selectedDescription || '').replace(location.description, '').trim();
  }

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
              onChange={e => addLocation(location, e.target.value)}
            />
          </div>
        ))
      }
    </div>
  )
}
