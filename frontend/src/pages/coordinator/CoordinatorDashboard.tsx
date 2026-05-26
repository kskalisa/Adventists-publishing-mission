import {
  BarChart3,
  Calendar,
  Download,
  Filter,
  Gauge,
  Megaphone,
  Package,
  Plus,
  Printer,
  Upload,
  Users,
  WalletCards,
  Zap,
} from 'lucide-react'
import { Shell } from '../../components/layout'
import { Badge, Button, Card } from '../../components/ui'
import type { PageProps } from '../../types/navigation'

function Stat({ label, value, helper, tone = 'slate', icon: Icon }: { label: string; value: string; helper?: string; tone?: 'slate' | 'green' | 'red' | 'orange' | 'blue'; icon?: typeof BarChart3 }) {
  const helperColor = tone === 'green' ? 'text-emerald-600' : tone === 'red' ? 'text-red-600' : tone === 'orange' ? 'text-orange-500' : 'text-slate-400'
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm text-slate-400">{label}</p>
          <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">{value}</p>
          {helper && <p className={`mt-2 text-sm ${helperColor}`}>{helper}</p>}
        </div>
        {Icon && <span className="grid size-10 place-items-center rounded-full bg-blue-50 text-blue-600"><Icon className="size-5" /></span>}
      </div>
    </Card>
  )
}

function Bars({ values, labels, colors }: { values: number[]; labels: string[]; colors?: string[] }) {
  return (
    <div className="flex h-48 items-end gap-4">
      {values.map((value, index) => (
        <div className="flex flex-1 flex-col items-center gap-3" key={`${value}-${index}`}>
          <div className={`w-full rounded-t ${colors?.[index] ?? (index === values.length - 1 ? 'bg-blue-600' : 'bg-blue-100')}`} style={{ height: `${value}%` }} />
          <span className="text-xs text-slate-400">{labels[index]}</span>
        </div>
      ))}
    </div>
  )
}

function Progress({ value, color = 'bg-blue-600' }: { value: number; color?: string }) {
  return <div className="h-1.5 w-20 rounded bg-blue-50"><div className={`h-full rounded ${color}`} style={{ width: `${value}%` }} /></div>
}

export function CoordinatorDashboardScreen({ active, onNavigate }: PageProps) {
  return (
    <Shell active={active} onNavigate={onNavigate} role="coordinator">
      <div className="grid gap-6 md:grid-cols-4">
        <Stat label="Reprint Recommended" value="12" helper="+2 from last month" tone="green" icon={Gauge} />
        <Stat label="Fast Moving Titles" value="45" helper="High demand" tone="green" icon={Zap} />
        <Stat label="Slow Moving Titles" value="8" helper="Requires promotion" icon={Megaphone} />
        <Stat label="Production Budget (RWF)" value="15.2M" helper="85% Utilized" tone="red" icon={WalletCards} />
      </div>
      <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_300px]">
        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="p-5"><h2 className="font-bold">Sales by Category <span className="float-right rounded bg-slate-100 px-2 py-1 text-xs font-normal text-slate-500">Last 30 Days</span></h2><div className="mt-12"><Bars values={[54, 78, 36, 50, 27]} labels={['Theology', 'Health', 'Family', 'Educ', 'Prophecy']} colors={['bg-blue-400', 'bg-emerald-300', 'bg-amber-400', 'bg-indigo-300', 'bg-pink-400']} /></div></Card>
          <Card className="p-5"><h2 className="font-bold">Reprint Forecast <span className="float-right text-slate-400">...</span></h2><div className="mt-16 h-44 rounded-b-full bg-gradient-to-t from-blue-50 to-transparent"><div className="h-full rounded-t-[100%] border-t-4 border-blue-600" /></div><div className="mt-4 flex justify-between text-xs text-slate-500"><span>Q1</span><span>Q2</span><span>Q3</span><span>Q4</span></div></Card>
          <Card className="grid place-items-center p-5 text-center"><h2 className="self-start justify-self-start font-bold">Inventory Status</h2><div><p className="text-2xl font-bold">85%</p><p className="text-xs text-slate-500">Active</p></div><p className="self-end text-xs text-slate-500"><span className="text-blue-600">●</span> Sold &nbsp; <span className="text-slate-300">●</span> Stock &nbsp; <span className="text-blue-950">●</span> Damaged</p></Card>
        </div>
        <aside className="space-y-6">
          <ReprintCalculator />
          <ScheduleCard />
        </aside>
      </div>
      <Card className="mt-6 overflow-hidden xl:w-[58%]">
        <div className="flex items-center justify-between p-5"><h2 className="font-bold">Reprint Planning</h2><Button variant="secondary" icon={Download}>Export</Button></div>
        <table className="w-full text-sm">
          <thead className="border-y border-slate-200 text-left text-slate-500"><tr>{['Book Title', 'Current Stock', 'Avg Sales/Mo', 'Rec. Qty', 'Est. Cost', 'Status'].map((h) => <th className="px-4 py-3" key={h}>{h}</th>)}</tr></thead>
          <tbody>{[
            ['The Great Controversy', '50', '120', '500', '2.5M RWF', 'Critical'],
            ['Steps to Christ (Kiny)', '200', '80', '300', '800k RWF', 'Warning'],
            ['Health & Power', '15', '40', '200', '1.2M RWF', 'Critical'],
            ['Adventist Home', '450', '60', '--', '--', 'Adequate'],
          ].map((row) => <tr className="border-t border-slate-100" key={row[0]}>{row.map((cell, index) => <td className={`px-4 py-4 ${index === 3 ? 'font-bold text-blue-600' : ''}`} key={index}>{index === 5 ? <Badge tone={cell === 'Critical' ? 'red' : cell === 'Warning' ? 'orange' : 'green'}>{cell}</Badge> : cell}</td>)}</tr>)}</tbody>
        </table>
      </Card>
    </Shell>
  )
}

function ReprintCalculator() {
  return (
    <Card className="p-5">
      <h2 className="mb-6 font-bold">Reprint Calculator</h2>
      <label className="text-sm font-medium">Book Title<input className="mt-2 h-9 w-full rounded-md border border-slate-200 px-3 text-sm" placeholder="Select book..." /></label>
      <div className="mt-4 grid grid-cols-2 gap-3">
        <label className="text-sm font-medium">Avg Sales<input className="mt-2 h-9 w-full rounded-md border border-slate-200 px-3 text-sm" defaultValue="120" /></label>
        <label className="text-sm font-medium">Current Stock<input className="mt-2 h-9 w-full rounded-md border border-slate-200 px-3 text-sm" defaultValue="50" /></label>
      </div>
      <label className="mt-4 block text-sm font-medium text-blue-600">Suggested Reprint<input className="mt-2 h-9 w-full rounded-md border border-slate-200 px-3 text-sm font-bold text-slate-900" defaultValue="500 Units" /></label>
      <Button className="mt-4 w-full">Create Production Order</Button>
    </Card>
  )
}

function ScheduleCard() {
  return (
    <Card className="p-5">
      <h2 className="font-bold">Reprint Schedule <span className="float-right text-sm font-normal text-slate-400">Oct 2023</span></h2>
      <div className="mt-6 grid grid-cols-6 gap-3 text-center text-sm text-slate-500">
        {['M', 'T', 'W', 'T', 'F', 'S', '25', '26', '27', '28', '29', '30', '2', '3', '4', '5', '6', '7', '9', '10', '11', '12', '13', '14'].map((day) => <span className={`rounded py-1 ${day === '4' || day === '12' ? 'bg-blue-600 text-white' : ''}`} key={day}>{day}</span>)}
      </div>
    </Card>
  )
}

export function ReprintPlanningScreen({ active, onNavigate }: PageProps) {
  return (
    <Shell active={active} onNavigate={onNavigate} role="coordinator" title="Reprint Planning">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div><h1 className="text-2xl font-bold text-[#12313d]">Publishing & Reprint Planning</h1><p className="mt-2 text-slate-500">Monitor stock depletion and manage production schedules</p></div>
        <div className="flex gap-3"><Button variant="secondary" icon={Download}>Export Plan</Button><Button icon={Plus}>New Print Order</Button></div>
      </div>
      <div className="grid gap-5 md:grid-cols-4">
        <Stat label="Reprint Recommendations" value="14 Titles" helper="+3 from last week (High Sales)" tone="red" />
        <Stat label="Active Print Orders" value="6 Orders" helper="2 deliveries expected this week" tone="green" icon={Printer} />
        <Stat label="Q3 Budget Spent" value="18.5M RWF" helper="74% of 25.0M RWF allocated" icon={WalletCards} />
        <Stat label="Avg. Production Time" value="21 Days" helper="-3 days vs last quarter" tone="green" />
      </div>
      <div className="mt-8 grid gap-6 xl:grid-cols-[1fr_335px]">
        <Card className="overflow-hidden">
          <div className="flex justify-between p-5"><h2 className="text-lg font-bold">Reprint Engine Recommendations</h2><Button variant="secondary">View All</Button></div>
          <table className="w-full text-sm">
            <thead className="bg-slate-100 text-left uppercase tracking-wide text-slate-500"><tr>{['Book Details', 'Stock / Run Rate', 'Est. Depletion', 'Suggested Qty', 'Action'].map((h) => <th className="px-5 py-4" key={h}>{h}</th>)}</tr></thead>
            <tbody>{[
              ['Intambwe Ijya Kuri Yesu|Kinyarwanda • Devotional', '124 units|45 units/week', '18 Days', '5,000', 'Order'],
              ['The Great Controversy|English • Theology', '412 units|60 units/week', '48 Days', '3,000', 'Plan'],
              ['Ubuzima Bwiza (Health & Wellness)|Kinyarwanda • Health', '205 units|20 units/week', '10 Weeks', '2,000', 'Plan'],
              ['Sabbath School Lesson (Q4)|Kinyarwanda • Study Guide', '0 units|New Quarter', 'Pre-order', '15,000', 'Order'],
            ].map((row) => {
              const [book, stock, depletion, qty, action] = row
              return <tr className="border-t border-slate-100" key={book}><td className="px-5 py-4 font-bold text-[#12313d]">{book.split('|')[0]}<p className="font-normal text-slate-500">{book.split('|')[1]}</p></td><td className="px-5 py-4 font-bold">{stock.split('|')[0]}<p className="font-normal text-slate-500">{stock.split('|')[1]}</p></td><td className="px-5 py-4"><Badge tone={depletion.includes('18') ? 'red' : depletion.includes('48') ? 'orange' : 'blue'}>{depletion}</Badge></td><td className="px-5 py-4 text-lg font-bold">{qty}</td><td className="px-5 py-4"><Button className="h-8 px-4" variant={action === 'Order' ? 'primary' : 'secondary'}>{action}</Button></td></tr>
            })}</tbody>
          </table>
          <div className="h-52" />
        </Card>
        <Card className="p-5"><h2 className="mb-6 text-lg font-bold">Production Tracking</h2>{[
          ['Adventist Youth Manual', 'In Transit to ABC', 'Tomorrow', 'Kigali Print Press • Qty: 1,500', 35, 'bg-blue-600'],
          ['Messages to Young People', 'Printing Phase', 'Oct 24', 'Union Press • Qty: 3,000', 62, 'bg-orange-500'],
          ['Family Life Magazine Vol 4', 'Pre-press / Proofing', 'Nov 02', 'East Africa Publ. • Qty: 5,000', 28, 'bg-slate-500'],
        ].map(([title, stage, date, printer, progress, color]) => <div className="mb-8 border-l border-slate-200 pl-8" key={title as string}><p className="font-bold">{title}</p><p className="mt-1 text-slate-500">{stage}<span className="float-right text-blue-950">{date}</span></p><div className="mt-4 h-1.5 rounded bg-blue-50"><div className={`h-full rounded ${color}`} style={{ width: `${progress}%` }} /></div><p className="mt-2 text-sm text-slate-500">Printer: {printer}</p></div>)}</Card>
      </div>
    </Shell>
  )
}

export function SalesAnalysisScreen({ active, onNavigate }: PageProps) {
  return (
    <Shell active={active} onNavigate={onNavigate} role="coordinator" title="Sales Analysis">
      <div className="mb-6 flex justify-between"><h1 className="text-xl font-bold">Sales Analysis</h1><div className="flex gap-3"><Button variant="secondary" icon={Calendar}>Last 30 Days</Button><Button variant="secondary" icon={Filter}>Filter</Button><Button icon={Download}>Export Report</Button></div></div>
      <div className="grid gap-6 md:grid-cols-4"><Stat label="Total Revenue" value="$124,500" helper="12.5% vs last month" tone="green" /><Stat label="Books Distributed" value="15,420" helper="8.2% vs last month" tone="green" /><Stat label="Active Colporteurs" value="45" helper="-2.1% vs last month" tone="red" /><Stat label="Avg Order Value" value="$85.20" helper="1.4% vs last month" tone="green" /></div>
      <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_333px]">
        <Card className="p-5"><h2 className="font-bold">Revenue Performance <span className="float-right text-sm font-normal text-slate-400">Current Year</span></h2><div className="mt-8"><Bars values={[42, 49, 45, 57, 52, 71, 80, 76, 87, 61, 0, 0]} labels={['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']} colors={['bg-blue-500','bg-blue-500','bg-blue-500','bg-blue-500','bg-blue-500','bg-blue-500','bg-blue-500','bg-blue-500','bg-blue-500','bg-blue-200','bg-transparent','bg-transparent']} /></div></Card>
        <Card className="grid place-items-center p-5"><h2 className="self-start justify-self-start font-bold">Sales by Channel</h2><div className="text-center"><p className="text-3xl font-bold">100%</p><p className="text-sm text-slate-400">Distribution</p></div><p className="self-end text-sm text-slate-400">Colporteurs (40%) &nbsp; Churches (30%)<br />Schools (20%) &nbsp; ABC Walk-in (10%)</p></Card>
      </div>
      <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_260px]">
        <Card className="overflow-hidden"><h2 className="p-5 font-bold">Recent Transactions</h2><table className="w-full text-sm"><thead className="border-y border-slate-100 text-left text-slate-400"><tr>{['Order ID','Entity / Customer','Date','Items','Amount','Status'].map((h)=><th className="px-4 py-3" key={h}>{h}</th>)}</tr></thead><tbody>{['Kigali English Church|125 Books|$2,450.00|Completed','Gitwe Adventist College|450 Books|$8,920.00|Processing','Jean Baptiste (LE)|42 Books|$680.00|Completed','Jean Baptiste (LE)|42 Books|$680.00|Completed'].map((row,i)=>{const [name,items,amount,status]=row.split('|');return <tr className="border-t border-slate-100" key={`${name}-${i}`}><td className="px-4 py-4 text-slate-400">#ORD-778{i}</td><td className="px-4 py-4 font-medium">{name}</td><td className="px-4 py-4">Oct 24, 2023</td><td className="px-4 py-4">{items}</td><td className="px-4 py-4 font-bold">{amount}</td><td className="px-4 py-4"><Badge tone={status === 'Completed' ? 'green':'orange'}>{status}</Badge></td></tr>})}</tbody></table></Card>
        <Card className="p-5"><h2 className="font-bold">Top Selling Titles <span className="float-right text-sm font-normal text-blue-600">View All</span></h2>{['The Great Controversy|2,450|95','Steps to Christ (Kinya)|1,820|70','Health & Happiness|1,450|58','Desire of Ages|980|45','Education|720|30'].map((item,index)=>{const [title,count,width]=item.split('|');return <div className="mt-5 flex gap-3" key={title}><span className="grid size-6 place-items-center rounded-full bg-slate-100 text-xs">{index+1}</span><div className="flex-1"><p className="font-semibold leading-tight">{title}<strong className="float-right">{count}</strong></p><Progress value={Number(width)} /></div></div>})}</Card>
      </div>
    </Shell>
  )
}

export function ProductionOrdersScreen({ active, onNavigate }: PageProps) {
  return (
    <Shell active={active} onNavigate={onNavigate} role="coordinator" title="Production Orders">
      <div className="mb-6 flex justify-between"><h1 className="text-xl font-bold">Production Orders</h1><div className="flex gap-3"><Button variant="secondary" icon={Printer}>Printers</Button><Button icon={Plus}>Create New Order</Button></div></div>
      <div className="grid gap-6 md:grid-cols-4"><Stat label="Active Orders" value="12" helper="Across 3 different presses" /><Stat label="Books in Production" value="8,450" helper="Total units being printed" /><Stat label="Pending Approval" value="3" helper="Requires immediate attention" tone="orange" /><Stat label="Budget Committed" value="$42,150" helper="45% of Q4 Allocation" /></div>
      <div className="mt-8 flex gap-8 border-b border-slate-200 text-sm text-slate-400">{['All Orders 12','In Production 6','Pending Approval 3','Completed 24','Delayed 1'].map((tab,index)=><button className={`pb-3 ${index===0?'border-b-2 border-blue-600 text-blue-600':''}`} type="button" key={tab}>{tab}</button>)}</div>
      <Card className="mt-6 overflow-hidden"><table className="w-full text-sm"><thead className="bg-slate-50 text-left text-slate-400"><tr>{['Order ID','Book Details','Quantity','Printer','Est. Delivery','Cost','Progress','Status',''].map((h)=><th className="px-4 py-4" key={h}>{h}</th>)}</tr></thead><tbody>{[
        ['#PO-2023-84','The Great Controversy|Paperback, Standard','5,000','Hope Press Ltd','Nov 15, 2023','$12,500','65','In Production'],
        ['#PO-2023-83','Steps to Christ (Kinya)|Pocket Edition','10,000','Alpha Printers','Nov 02, 2023','$8,200','90','In Production'],
        ['#PO-2023-82','Health & Happiness|Full Color, Hardcover','2,500','PrintMaster Kigali','Oct 30, 2023','$15,750','0','Delayed'],
        ['#PO-2023-85','Education|Reprint Request','3,000','-','-','$5,400 (Est)','0','Approval Needed'],
        ['#PO-2023-86','Education|Reprint Request','3,000','-','-','$5,400 (Est)','0','Approval Needed'],
        ['#PO-2023-87','Education|Reprint Request','3,000','-','-','$5,400 (Est)','0','Approval Needed'],
      ].map((row)=>{const [id,book,qty,printer,delivery,cost,progress,status]=row;return <tr className="border-t border-slate-100" key={id}><td className="px-4 py-4 text-slate-400">{id}</td><td className="px-4 py-4 font-bold">{book.split('|')[0]}<p className="font-normal text-slate-400">{book.split('|')[1]}</p></td><td className="px-4 py-4">{qty}</td><td className="px-4 py-4">{printer}</td><td className="px-4 py-4">{delivery}</td><td className="px-4 py-4">{cost}</td><td className="px-4 py-4"><span className="text-xs">{progress}%</span><Progress value={Number(progress)} color={Number(progress)>80?'bg-teal-500':'bg-blue-600'} /></td><td className="px-4 py-4"><Badge tone={status==='Delayed'?'red':status==='Approval Needed'?'orange':'blue'}>{status}</Badge></td><td className="px-4 py-4 text-slate-400">...</td></tr>})}</tbody></table></Card>
    </Shell>
  )
}

export function BudgetTrackingScreen({ active, onNavigate }: PageProps) {
  return (
    <Shell active={active} onNavigate={onNavigate} role="coordinator" title="Budget Tracking">
      <div className="mb-6 flex justify-between"><h1 className="text-xl font-bold">Budget Tracking</h1><div className="flex gap-3"><Button variant="secondary" icon={Download}>Export Report</Button><Button icon={Plus}>Allocate Funds</Button></div></div>
      <div className="grid gap-6 md:grid-cols-4"><Stat label="Total Annual Budget" value="$250,000" helper="+12% vs last year" tone="green" /><Stat label="Year-to-Date Spent" value="$145,200" helper="58% Utilized" /><Stat label="Committed Funds" value="$42,150" helper="Pending Orders & Contracts" /><Stat label="Available Remaining" value="$62,650" helper="Tight for Q4 reprints" tone="orange" /></div>
      <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_374px]"><Card className="p-5"><h2 className="font-bold">Monthly Spend vs Budget</h2><div className="mt-12"><Bars values={[42,56,33,74,51,65]} labels={['May','Jun','Jul','Aug','Sep','Oct']} /></div></Card><Card className="p-5"><h2 className="mb-10 font-bold">Category Breakdown</h2>{[['Production & Printing',65,'bg-blue-600'],['Logistics',15,'bg-slate-500'],['Marketing',12,'bg-orange-500'],['Royalties & Admin',8,'bg-red-500']].map(([label,value,color])=><div className="mb-5" key={label as string}><p className="mb-2 text-sm">{label as string}<strong className="float-right">{value}%</strong></p><div className="h-1.5 rounded bg-blue-50"><div className={`h-full rounded ${color}`} style={{width:`${value}%`}} /></div></div>)}</Card></div>
      <Card className="mt-6 overflow-hidden"><table className="w-full text-sm"><thead className="border-b border-slate-200 text-left text-slate-400"><tr>{['Budget Category','Allocated','Spent YTD','Committed','Remaining','Utilization','Status',''].map((h)=><th className="px-5 py-4" key={h}>{h}</th>)}</tr></thead><tbody>{[['Book Production','PRD-001','$162,500','$95,000','$38,000','$29,500',82,'High Usage'],['Logistics & Shipping','LOG-002','$37,500','$21,500','$2,500','$13,500',64,'On Track'],['Marketing & Promos','MKT-104','$30,000','$18,200','$1,200','$10,600',65,'On Track'],['Marketing & Promos','MKT-104','$30,000','$18,200','$1,200','$10,600',65,'On Track']].map((row)=> <tr className="border-t border-slate-100" key={`${row[0]}-${row[1]}`}><td className="px-5 py-4 font-bold">{row[0]}<p className="font-normal text-slate-400">Code: {row[1]}</p></td><td className="px-5 py-4 font-bold">{row[2]}</td><td className="px-5 py-4">{row[3]}</td><td className="px-5 py-4">{row[4]}</td><td className="px-5 py-4 font-bold text-blue-600">{row[5]}</td><td className="px-5 py-4"><span className="text-xs">{row[6]}%</span><Progress value={Number(row[6])} color={Number(row[6])>80?'bg-blue-600':'bg-teal-500'} /></td><td className="px-5 py-4"><Badge tone={row[7]==='High Usage'?'orange':'green'}>{row[7]}</Badge></td><td className="px-5 py-4 text-slate-400">...</td></tr>)}</tbody></table></Card>
    </Shell>
  )
}

export function CoordinatorReportsScreen({ active, onNavigate }: PageProps) {
  return (
    <Shell active={active} onNavigate={onNavigate} role="coordinator" title="Reports">
      <div className="mb-6 flex justify-between"><div><h1 className="text-2xl font-bold text-blue-950">Reports & Analytics</h1><p className="text-slate-500">Generate and manage detailed operational reports.</p></div><Button icon={Upload}>Export Report</Button></div>
      <Card className="p-4"><div className="grid gap-4 md:grid-cols-[160px_160px_160px_1fr]"><label className="text-xs text-slate-500">Date Range<input className="mt-2 h-9 w-full rounded-md border border-slate-200 px-4 text-sm text-blue-950" defaultValue="Last 30 Days" /></label><label className="text-xs text-slate-500">Category<input className="mt-2 h-9 w-full rounded-md border border-slate-200 px-4 text-sm text-blue-950" defaultValue="All Categories" /></label><label className="text-xs text-slate-500">Format<input className="mt-2 h-9 w-full rounded-md border border-slate-200 px-4 text-sm text-blue-950" defaultValue="All Formats" /></label><div className="flex items-end justify-end"><Button>Apply Filters</Button></div></div></Card>
      <h2 className="mt-8 text-xl font-bold text-blue-950">Generate Standard Reports</h2>
      <div className="mt-4 grid gap-5 md:grid-cols-4">{[['Sales Summary',BarChart3,'Monthly overview of book sales by category and territory.'],['Inventory Valuation',Package,'Current stock levels and total asset value per warehouse.'],['Production Costs',Printer,'Analysis of printing expenses vs. budget allocation.'],['Colporteur Stats',Users,'Performance metrics for distribution agents and teams.']].map(([title,Icon,body])=><Card className="p-6" key={title as string}><span className="grid size-12 place-items-center rounded-md bg-blue-50 text-blue-600">{typeof Icon !== 'string' && <Icon className="size-6" />}</span><h3 className="mt-5 font-bold text-blue-950">{title as string}</h3><p className="mt-2 text-sm leading-6 text-slate-500">{body as string}</p></Card>)}</div>
      <h2 className="mt-10 text-xl font-bold text-blue-950">Recently Generated</h2>
      <Card className="mt-4 overflow-hidden"><table className="w-full text-sm"><thead className="bg-blue-50 text-left text-slate-500"><tr>{['Report Name','Type','Date Generated','Generated By','Size','Actions'].map((h)=><th className="px-6 py-4" key={h}>{h}</th>)}</tr></thead><tbody>{[['Q2 2025 Sales Forecast.pdf','Sales','June 10, 2025','Sarah Uwase','2.4 MB'],['Inventory_Audit_May2025.xlsx','Inventory','June 01, 2025','System Auto','856 KB'],['Reprint_Cost_Analysis.pdf','Production','May 28, 2025','Jean-Paul M.','1.2 MB'],['Distribution_Log_WK22.csv','Logistics','May 25, 2025','Sarah Uwase','420 KB'],['Monthly_Budget_Variance.pdf','Financial','May 05, 2025','Finance Dept','3.1 MB']].map((row)=><tr className="border-t border-slate-100" key={row[0]}><td className="px-6 py-4 font-medium text-blue-950">{row[0]}</td><td className="px-6 py-4"><Badge tone="blue">{row[1]}</Badge></td><td className="px-6 py-4">{row[2]}</td><td className="px-6 py-4">{row[3]}</td><td className="px-6 py-4">{row[4]}</td><td className="px-6 py-4"><Button className="h-8 px-3" variant="secondary">Download</Button></td></tr>)}</tbody></table></Card>
    </Shell>
  )
}

export function CoordinatorDashboard(props: PageProps) {
  if (props.active === 'coordinator-reprint') return <ReprintPlanningScreen {...props} />
  if (props.active === 'coordinator-sales') return <SalesAnalysisScreen {...props} />
  if (props.active === 'coordinator-production') return <ProductionOrdersScreen {...props} />
  if (props.active === 'coordinator-budget') return <BudgetTrackingScreen {...props} />
  if (props.active === 'coordinator-reports') return <CoordinatorReportsScreen {...props} />
  return <CoordinatorDashboardScreen {...props} />
}
