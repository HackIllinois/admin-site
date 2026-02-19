import React from "react"

import { useField } from "formik"
import { StyledSelect } from "@/components/SelectField/SelectField"

import styles from "./LocationInput.module.scss"
import { Location } from "@/generated"

const buildingLocations: Location[] = [
    {
        description: "Siebel Center for Computer Science",
        latitude: 40.113812,
        longitude: -88.224937,
    },
    {
        description: "Siebel Center for Design",
        latitude: 40.113812,
        longitude: -88.224937,
    },
    {
        description: "Sidney Lu Mechanical Engineering Building",
        latitude: 40.113812,
        longitude: -88.224937,
    },
    //   {
    //     description: 'ECEB',
    //     latitude: 40.114937,
    //     longitude: -88.228063
    //   },
    //   {
    //     description: 'DCL',
    //     latitude: 40.113062,
    //     longitude: -88.226563
    //   },
    //   {
    //     description: 'Kenney Gym',
    //     latitude: 40.113062,
    //     longitude: -88.228438
    //   }
    {
        description: "CIF",
        latitude: 40.11264,
        longitude: -88.22832,
    },
    {
        description: "Illini Union",
        latitude: 40.10935,
        longitude: -88.227169,
    },
    {
        description: "Legends",
        latitude: 40.110436,
        longitude: -88.231146,
    },
    {
        description: "Siebel",
        latitude: 40.113812,
        longitude: -88.224937,
    },
]

function findBuildingForLocation(location: Location): Location | null {
    for (const building of buildingLocations) {
        if (location.description.startsWith(building.description)) {
            return building
        }
    }
    return null
}

function findAreaForLocation(location: Location, building: Location): string {
    // Building is always the prefix, +1 for space
    return location.description.substring(building.description.length + 1)
}

function createLocationFromBuildingAndArea(
    building: Location,
    area: string,
): Location {
    return {
        ...building,
        description: `${building.description} ${area}`,
    }
}

export default function LocationInput({ name }: { name: string }) {
    const [field, , helpers] = useField<Location[]>(name)
    const building =
        field.value.length > 0 ? findBuildingForLocation(field.value[0]) : null
    const area = building ? findAreaForLocation(field.value[0], building) : ""

    return (
        <div className={styles.main}>
            <StyledSelect
                className={styles.select}
                isMulti={false}
                options={buildingLocations.map((value) => ({
                    label: value.description,
                    value,
                }))}
                placeholder={"Location..."}
                value={
                    building
                        ? {
                              label: building.description,
                              value: building,
                          }
                        : null
                }
                onChange={(option) =>
                    option &&
                    helpers.setValue([
                        createLocationFromBuildingAndArea(
                            (option as { label: string; value: Location })
                                .value,
                            area,
                        ),
                    ])
                }
            />
            <input
                className={styles["form-field"]}
                type="text"
                placeholder="Room or area..."
                value={area}
                onChange={(event) => {
                    if (building) {
                        helpers.setValue([
                            createLocationFromBuildingAndArea(
                                building,
                                event.target.value,
                            ),
                        ])
                    }
                }}
            />
        </div>
    )
}
