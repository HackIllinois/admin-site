import React from 'react';

import Checkbox from 'components/Checkbox';
import './LocationInput.scss';

const locations = [
  {
    "description": "Siebel",
    "latitude": 40.1138,
    "longitude": -88.2249
  },
  {
    "description": "ECEB",
    "latitude": 40.1138,
    "longitude": -88.2249
  }
];

export default function LocationCheckbox({ field, form }) {
  const selectedLocationNames = field.value.map(x => x.description);

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
          <Checkbox
            key={locationName}
            value={selectedLocationNames.includes(locationName)}
            label={locationName}
            onChange={checked => checked ? addLocation(locationName) : removeLocation(locationName)}/>
        ))
      }
    </div>
  )
}