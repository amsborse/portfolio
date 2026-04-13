type SectionLabelProps = {
  children: React.ReactNode
  id?: string
}

export function SectionLabel({ children, id }: SectionLabelProps) {
  return (
    <p id={id} className="section-label">
      {children}
    </p>
  )
}
