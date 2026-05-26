import { BookOpen, Download, PackageCheck, ShoppingBag } from 'lucide-react'
import type { PageProps } from '../../types/navigation'
import { Shell } from '../../components/layout'
import { Button, Card, PageHeader, SimpleTable, StatCard } from '../../components/ui'

export function CustomerDashboard({ active, onNavigate }: PageProps) {
  return (
    <Shell active={active} onNavigate={onNavigate} role="customer">
      <PageHeader
        title="Customer Dashboard"
        subtitle="Track orders, invoices, and recommended titles."
        actions={<Button variant="secondary" icon={Download}>Download Statement</Button>}
      />
      <div className="grid gap-5 md:grid-cols-4">
        <StatCard stat={{ label: 'Open Orders', value: '3', helper: '1 awaiting delivery', icon: ShoppingBag }} />
        <StatCard stat={{ label: 'Books Purchased', value: '42', helper: 'This year', icon: BookOpen, tone: 'green' }} />
        <StatCard stat={{ label: 'Pending Balance', value: 'RWF 18,500', helper: 'Due this month' }} />
        <StatCard stat={{ label: 'Deliveries', value: '12', helper: 'Completed', icon: PackageCheck, tone: 'blue' }} />
      </div>
      <Card className="mt-6 p-6">
        <h2 className="mb-4 text-lg font-semibold text-blue-950">Recent Orders</h2>
        <SimpleTable
          headers={['Order', 'Items', 'Date', 'Amount', 'Status']}
          rows={[
            ['#ORD-9041', 'The Great Controversy, Steps to Christ', 'Oct 24, 2024', 'RWF 17,000', 'Processing'],
            ['#ORD-8920', 'Sabbath School Lesson Q4', 'Oct 18, 2024', 'RWF 3,500', 'Delivered'],
            ['#ORD-8808', 'Ministry of Healing', 'Oct 04, 2024', 'RWF 12,500', 'Delivered'],
          ]}
        />
      </Card>
    </Shell>
  )
}

