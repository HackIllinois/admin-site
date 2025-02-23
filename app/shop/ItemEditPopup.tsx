import { ShopItemCreateRequest, ShopItemId } from "@/generated"
import { getMetadataSuffix, METADATA_REPO, useMetadata } from "@/util/metadata"

import styles from "./ItemEditPopup.module.scss"
import { Field, Form, Formik } from "formik"
import { FormikCheckbox } from "@/components/Checkbox"
import SelectField from "@/components/SelectField/SelectField"
import Link from "next/link"
import { useRef } from "react"

type ItemEditForm = Omit<ShopItemCreateRequest, "imageURL"> & {
    imageURL: {
        label: string
        value: string
    } | null
}

interface ItemEditProps {
    editingItemId?: ShopItemId
    initialItem: Partial<ShopItemCreateRequest>
    onDismiss: () => void
    onDeleteItem: (itemId: ShopItemId) => void
    onUpdateItem: (
        itemId: ShopItemId | undefined,
        newItem: ShopItemCreateRequest,
    ) => void
}

export default function ItemEditPopup({
    editingItemId,
    initialItem,
    onDismiss,
    onDeleteItem,
    onUpdateItem,
}: ItemEditProps) {
    const popupContainerRef = useRef<HTMLDivElement>(null)
    const initialValues: ItemEditForm = {
        name: "",
        price: 0,
        quantity: 0,
        isRaffle: false,
        ...initialItem,
        imageURL: initialItem.imageURL
            ? {
                  label: getMetadataSuffix(initialItem.imageURL),
                  value: initialItem.imageURL,
              }
            : null,
    }

    const submit = (values: ItemEditForm) => {
        if (!values.imageURL) {
            return alert("Image URL is required!")
        }
        const newItem: ShopItemCreateRequest = {
            ...values,
            imageURL: values.imageURL.value,
            quantity: values.isRaffle ? 999_999 : values.quantity,
        }
        onUpdateItem(editingItemId, newItem)
    }

    const shopUrls = useMetadata("shop")
    const showUrlOptions = shopUrls.map(({ path, url }) => ({
        label: path,
        value: url,
    }))

    return (
        <div className={styles["item-edit-popup"]}>
            <div className={styles["popup-background"]} onClick={onDismiss} />

            <div className={styles["popup-container"]} ref={popupContainerRef}>
                <div className={styles.title}>
                    {editingItemId ? "Edit Item" : "Add Item"}
                </div>
                <Formik initialValues={initialValues} onSubmit={submit}>
                    {({ values }) => (
                        <Form className={styles.form}>
                            <Field
                                className={styles["form-field"]}
                                name="name"
                                placeholder="Item Name"
                                autoFocus
                            />
                            <Field
                                className={styles["form-field"]}
                                name="price"
                                placeholder="Price"
                                type="number"
                            />
                            <Field
                                className={styles["form-margins"]}
                                component={FormikCheckbox}
                                name="isRaffle"
                                label="Raffle"
                            />
                            {!values.isRaffle && (
                                <Field
                                    className={styles["form-field"]}
                                    name="quantity"
                                    placeholder="Quantity"
                                    type="number"
                                />
                            )}
                            <SelectField
                                className={styles.select}
                                name="imageURL"
                                menuPlacement="top"
                                options={showUrlOptions}
                                placeholder="Image URL"
                                creatable
                                // Set target so it doesn't get cropped by div
                                menuPortalTarget={popupContainerRef.current}
                            />
                            <small>
                                Images are pulled from{" "}
                                <Link href={METADATA_REPO} target="_blank">
                                    adonix-metadata
                                </Link>{" "}
                                - please contact systems to add more
                            </small>

                            <div className={styles.buttons}>
                                {editingItemId && (
                                    <button
                                        className={styles.delete}
                                        type="button"
                                        onClick={() =>
                                            onDeleteItem(editingItemId)
                                        }
                                    >
                                        Delete
                                    </button>
                                )}

                                <div className={styles.spacer} />
                                <button type="button" onClick={onDismiss}>
                                    Cancel
                                </button>
                                <button type="submit">Save</button>
                            </div>
                        </Form>
                    )}
                </Formik>
            </div>
        </div>
    )
}
