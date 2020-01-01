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
  const selectedLocations = field.value || [];
  const selectedLocationNames = selectedLocations.map(x => x.description);

  const addLocation = locationName => {
    form.setFieldValue(field.name, locations.filter(location => (
      selectedLocationNames.includes(location.description) || location.description === locationName
    )));
  }

  const removeLocation = locationName => {
    form.setFieldValue(field.name, locations.filter(location => (
      selectedLocationNames.includes(location.description) && location.description !== locationName
    )));
  }

  return (
    <div className="location-input">
      {
        locations.map(location => location.description).map(locationName => (
          <div className="location-option" key={locationName}>
            <Checkbox
              value={selectedLocationNames.includes(locationName)}
              label={locationName}
              onChange={checked => checked ? addLocation(locationName) : removeLocation(locationName)}/>
          </div>
        ))
      }
    </div>
  )
}
