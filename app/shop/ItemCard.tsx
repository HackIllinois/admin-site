import { ShopItem } from "@/generated"

import styles from "./ItemCard.module.scss"
import Image from "next/image"
import { faPlus } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"

interface ItemCardProps {
    item: ShopItem
    editable?: boolean
    onClick: () => void
}

export default function ItemCard({ item, editable, onClick }: ItemCardProps) {
    return (
        <button
            className={
                styles.container + (editable ? " " + styles.clickable : "")
            }
            onClick={onClick}
        >
            <div className={styles.title}>{item.name}</div>
            <div>
                <Image
                    src={item.imageURL}
                    alt="Image"
                    width={100}
                    height={100}
                />
            </div>
            <div className={styles.details}>
                <div className={styles.price}>{item.price} Points</div>
                {!item.isRaffle && (
                    <div className={styles.quantity}>
                        {item.quantity} In Stock
                    </div>
                )}
            </div>
        </button>
    )
}

interface ItemAddCardProps {
    onClick: () => void
}

export function ItemAddCard({ onClick }: ItemAddCardProps) {
    return (
        <button
            className={`${styles.container} ${styles.clickable}`}
            onClick={onClick}
        >
            <div className={styles.add}>
                <FontAwesomeIcon icon={faPlus} />
            </div>
        </button>
    )
}
