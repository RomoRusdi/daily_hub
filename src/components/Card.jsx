// Card — surface container with a thin border (favoured over heavy shadow).
export default function Card({ className = '', as: Tag = 'div', ...props }) {
  return (
    <Tag
      className={
        'bg-surface dark:bg-surface-dark border border-line dark:border-line-dark ' +
        `rounded-2xl ${className}`
      }
      {...props}
    />
  )
}
