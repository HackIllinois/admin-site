import clsx from 'clsx'
import React from 'react'
import './style.scss'

export default function Message({ children, className, ...props }) {
    return <div className={clsx('message', className)}>{children}</div>
}
