'use client'

interface Tab {
  id: string
  label: string
}

interface TabsProps {
  tabs: Tab[]
  activeTab: string
  onTabChange: (id: string) => void
}

export default function Tabs({ tabs, activeTab, onTabChange }: TabsProps) {
  return (
    <div className="flex bg-background-elevated rounded-lg p-1 gap-1" role="tablist">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          role="tab"
          aria-selected={activeTab === tab.id}
          onClick={() => onTabChange(tab.id)}
          className={[
            'flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors duration-150',
            activeTab === tab.id
              ? 'bg-background-surface text-text-primary shadow-sm'
              : 'text-text-disabled hover:text-text-secondary',
          ].join(' ')}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}
