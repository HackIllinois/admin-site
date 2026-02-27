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
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faSync } from "@fortawesome/free-solid-svg-icons"
import { Box, Tab, Tabs, TextField } from "@mui/material"

export default function Shop() {
    const [loading, setLoading] = useState(true)
    const [items, setItems] = useState<ShopItem[]>([])

    const [raffleView, setRaffleView] = useState(false)
    const [searchQuery, setSearchQuery] = useState("")
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

    const raffleItem = async (itemId: ShopItemId) => {
        const result = await ShopService.getShopRaffleById({
            path: { id: itemId },
        }).then(handleError)
        alert(`The winner is: ${result.userId}`)
    }

    useEffect(() => {
        refresh()
    }, [])

    if (loading) {
        return <Loading />
    }

    const isAdmin = roles.includes("ADMIN")
    const tabIndex = raffleView ? 0 : 1
    const filteredItems = items.filter((item) => {
        if (item.isRaffle !== raffleView) return false
        const query = searchQuery.trim().toLowerCase()
        if (!query) return true
        return item.name.toLowerCase().includes(query)
    })

    return (
        <div className={styles.container}>

            <div className={styles["heading-container"]}>

                <Tabs value={tabIndex} onChange={(_, idx) => setRaffleView(idx === 0)}>
                    <Tab label="Raffle" className={styles.tab} />
                    <Tab label="Purchases" className={styles.tab} />
                </Tabs>

                <FontAwesomeIcon
                    className={styles.refresh}
                    icon={faSync}
                    onClick={refresh}
                />
            </div>
            <Box sx={{ mb: 2 }}>
                <TextField
                    label="Search items"
                    size="small"
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    sx={{ minWidth: 320, maxWidth: 520 }}
                />
            </Box>

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
                {filteredItems.map((item) => (
                        <ItemCard
                            key={item.itemId}
                            item={item}
                            editable={isAdmin}
                            onClick={() => isAdmin && setEditingItem(item)}
                            onRaffle={() => isAdmin && raffleItem(item.itemId)}
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
