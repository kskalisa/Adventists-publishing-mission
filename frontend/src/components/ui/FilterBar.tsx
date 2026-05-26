import { Filter } from 'lucide-react'
import { Button } from './Button'
import { Card } from './Card'
import { SearchBox } from './SearchBox'

export function FilterBar({ placeholder, filters = [] }: { placeholder: string; filters?: string[] }) {
  return (
    <Card className="p-4">
      <div className="flex flex-col gap-3 md:flex-row">
        <div className="md:flex-1">
          <SearchBox placeholder={placeholder} />
        </div>
        {filters.map((filter) => (
          <button className="h-10 rounded-md border border-slate-200 bg-white px-4 text-left text-sm text-slate-700" key={filter} type="button">
            {filter}
          </button>
        ))}
        <Button variant="secondary" icon={Filter}>More Filters</Button>
      </div>
    </Card>
  )
}

