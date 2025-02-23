"use client"

import {
    ShopItem,
    ShopItemCreateRequest,
    ShopItemId,
    ShopService,
} from "@/generated"
import { handleError, useRoles } from "@/util/api-client"
import { useEffect, useState } from "react"
import ItemCard, { ItemAddCard } from "./ItemCard"

import styles from "./style.module.scss"
import Loading from "@/components/Loading"
import ItemEditPopup from "./ItemEditPopup"

export default function Shop() {
    const [loading, setLoading] = useState(true)
    const [items, setItems] = useState<ShopItem[]>([])

    const [raffleView, setRaffleView] = useState(false)
    const [editingItem, setEditingItem] = useState<Partial<ShopItem> | null>(
        null,
    )

    const roles = useRoles()

    const refresh = () => {
        setLoading(true)
        return ShopService.getShop()
            .then(handleError)
            .then((items) => {
                setItems(items)
                setLoading(false)
            })
    }

    const deleteItem = async (itemId: ShopItemId) => {
        await ShopService.deleteShopItemById({ path: { id: itemId } })
        setEditingItem(null)
        await refresh()
    }

    const updateItem = async (
        itemId: ShopItemId | undefined,
        newItem: ShopItemCreateRequest,
    ) => {
        const request = itemId
            ? ShopService.putShopItemById({
                  path: { id: itemId },
                  body: newItem,
              })
            : ShopService.postShopItem({ body: newItem })

        await request.then(handleError)
        setEditingItem(null)
        await refresh()
    }

    useEffect(() => {
        refresh()
    }, [])

    if (loading) {
        return <Loading />
    }

    const isAdmin = roles.includes("ADMIN")

    return (
        <div className={styles.container}>
            <div className={styles.titles}>
                <div
                    className={raffleView ? styles.active : ""}
                    onClick={() => setRaffleView(true)}
                >
                    Raffle
                </div>
                <div
                    className={!raffleView ? styles.active : ""}
                    onClick={() => setRaffleView(false)}
                >
                    Purchases
                </div>
            </div>
            <div className={styles.items}>
                {editingItem && (
                    <ItemEditPopup
                        editingItemId={editingItem.itemId}
                        initialItem={editingItem}
                        onDismiss={() => setEditingItem(null)}
                        onDeleteItem={deleteItem}
                        onUpdateItem={updateItem}
                    />
                )}
                {items
                    .filter((item) => item.isRaffle === raffleView)
                    .map((item) => (
                        <ItemCard
                            key={item.itemId}
                            item={item}
                            editable={isAdmin}
                            onClick={() => isAdmin && setEditingItem(item)}
                        />
                    ))}
                {isAdmin && (
                    <ItemAddCard
                        onClick={() => setEditingItem({ isRaffle: raffleView })}
                    />
                )}
            </div>
        </div>
    )
}
