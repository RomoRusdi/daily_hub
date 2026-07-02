// Card — surface container with a thin border (favoured over heavy shadow).
export default function Card({ className = '', as: Tag = 'div', ...props }) {
  return (
    <Tag className={`glass rounded-2xl ${className}`} {...props} />
  )
}
