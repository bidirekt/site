import { useId, useRef, useState } from 'react'
import type { KeyboardEvent, ReactNode } from 'react'
import { tv } from 'tailwind-variants'

type Tab = { name: string; icon?: ReactNode; panel: ReactNode }

type TabsProps = { label: string; tabs: Array<Tab>; className?: string }

const NEXT_KEYS = ['ArrowRight', 'ArrowDown']
const PREVIOUS_KEYS = ['ArrowLeft', 'ArrowUp']

const tab = tv({
  base: 'pressable inline-flex cursor-pointer items-center gap-2.5 rounded-[8px] px-3 py-1.5 text-[14px] font-medium whitespace-nowrap',
  variants: {
    selected: {
      true: 'bg-raised text-primary',
      false: 'text-muted hover:text-primary',
    },
  },
})

export function Tabs({ label, tabs, className }: TabsProps) {
  const [selected, setSelected] = useState(0)
  const buttons = useRef<Array<HTMLButtonElement | null>>([])
  const baseId = useId()

  function selectAndFocus(index: number) {
    setSelected(index)
    buttons.current[index]?.focus()
  }

  function moveSelection(event: KeyboardEvent, index: number) {
    if (NEXT_KEYS.includes(event.key)) {
      event.preventDefault()
      selectAndFocus((index + 1) % tabs.length)
    }
    if (PREVIOUS_KEYS.includes(event.key)) {
      event.preventDefault()
      selectAndFocus((index + tabs.length - 1) % tabs.length)
    }
  }

  return (
    <div className={className}>
      <div
        role="tablist"
        aria-label={label}
        className="flex flex-wrap gap-1 border-b border-line p-2 max-[479px]:grid max-[479px]:grid-cols-2 max-[479px]:[&>:last-child:nth-child(odd)]:col-span-2"
      >
        {tabs.map(({ name, icon }, index) => {
          const isSelected = index === selected
          return (
            <button
              key={name}
              ref={(element) => {
                buttons.current[index] = element
              }}
              type="button"
              role="tab"
              id={`${baseId}-tab-${index}`}
              aria-controls={`${baseId}-panel`}
              aria-selected={isSelected}
              tabIndex={rovingTabIndex(isSelected)}
              onClick={() => setSelected(index)}
              onKeyDown={(event) => moveSelection(event, index)}
              className={tab({ selected: isSelected })}
            >
              {icon}
              {name}
            </button>
          )
        })}
      </div>
      <div
        key={selected}
        className="animate-settle motion-reduce:animate-none"
        role="tabpanel"
        id={`${baseId}-panel`}
        aria-labelledby={`${baseId}-tab-${selected}`}
      >
        {tabs[selected].panel}
      </div>
    </div>
  )
}

function rovingTabIndex(isSelected: boolean): number {
  if (isSelected) return 0
  return -1
}
