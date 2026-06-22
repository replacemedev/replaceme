import * as React from "react"

export interface RoleOption {
  label: string
  value: string
}

interface RoleSelectorProps {
  options: [RoleOption, RoleOption]
  value: string
  onChange: (value: string) => void
}

export function RoleSelector({ options, value, onChange }: RoleSelectorProps) {
  return (
    <div className="flex w-full p-1 bg-[#f1f3fa] rounded-xl mb-6">
      {options.map((option) => {
        const isSelected = value === option.value
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={`flex-1 py-3 px-4 text-sm font-body-bold font-bold rounded-lg transition-all duration-200 ${
              isSelected
                ? "bg-white text-[#006e2f] shadow-sm"
                : "text-slate-500 hover:text-slate-700 hover:bg-white/50"
            }`}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}
