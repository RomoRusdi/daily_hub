// Card — frosted glass container.
// `lite` swaps to the blur-free variant: use it for long lists (Tasks rows,
// Notes grid) where many backdrop-filter surfaces would jank mid-range phones.
export default function Card({ className = '', as: Tag = 'div', lite = false, ...props }) {
  return (
    <Tag
      className={`${lite ? 'glass-lite' : 'glass'} rounded-2xl ${className}`}
      {...props}
    />
  )
}
