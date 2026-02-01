import * as React from "react"
import { Input } from "@/components/ui/input"

interface CurrencyInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  value?: string | number
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void
}

export const CurrencyInput = React.forwardRef<
  HTMLInputElement,
  CurrencyInputProps
>(({ value, onChange, ...props }, ref) => {
  const [displayValue, setDisplayValue] = React.useState("")

  const formatCurrency = (val: string | number) => {
    if (val === undefined || val === null || val === "") return ""
    const number = typeof val === "number" ? val : parseFloat(val)
    if (isNaN(number)) return ""
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(number)
  }

  React.useEffect(() => {
    if (value !== undefined) {
      setDisplayValue(formatCurrency(value))
    }
  }, [value])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/\D/g, "")
    const numericValue = parseFloat(rawValue) / 100

    if (onChange) {
      const newEvent = {
        ...e,
        target: {
          ...e.target,
          value: numericValue.toString(),
        },
      } as React.ChangeEvent<HTMLInputElement>
      onChange(newEvent)
    }
  }

  return (
    <div className="relative">
      <Input
        {...props}
        ref={ref}
        value={displayValue}
        onChange={handleChange}
        placeholder="R$ 0,00"
      />
    </div>
  )
})

CurrencyInput.displayName = "CurrencyInput"
