import { ShopItem } from "@/generated"

import styles from "./ItemCard.module.scss"
import Image from "next/image"
import { faPlus, faTrophy } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"

interface ItemCardProps {
    item: ShopItem
    editable?: boolean
    onClick: () => void
    onRaffle: () => void
}

export default function ItemCard({
    item,
    editable,
    onClick,
    onRaffle,
}: ItemCardProps) {
    return (
        <div className={styles.container}>
            <button
                className={
                    styles.card + (editable ? " " + styles.clickable : "")
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

            {editable && (
                <div className={styles.buttons}>
                    {item.isRaffle && (
                        <button onClick={onRaffle}>
                            <FontAwesomeIcon icon={faTrophy} fixedWidth />
                        </button>
                    )}
                </div>
            )}
        </div>
    )
}

interface ItemAddCardProps {
    onClick: () => void
}

export function ItemAddCard({ onClick }: ItemAddCardProps) {
    return (
        <div className={styles.container}>
            <button
                className={`${styles.card} ${styles.clickable}`}
                onClick={onClick}
            >
                <div className={styles.add}>
                    <FontAwesomeIcon icon={faPlus} />
                </div>
            </button>
        </div>
    )
}
