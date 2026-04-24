interface CardProps {
  className?: string
  children: React.ReactNode
  clickable?: boolean
  selected?: boolean
}

export default function Card({ className = '', children, clickable, selected }: CardProps) {
  const classes = [
    'bg-background-surface border border-border-default rounded-lg p-4',
    clickable
      ? 'hover:border-border-strong hover:shadow-md cursor-pointer transition-all duration-150 active:scale-[0.99]'
      : '',
    selected ? 'bg-brand-subtle border-brand-primary' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return <div className={classes}>{children}</div>
}
