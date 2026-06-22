import { Image, Settings as SettingsIcon, Upload } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { readImageAsDataUrl } from '../../lib/files'
import type { PageProps } from '../../types/navigation'
import { Shell } from '../../components/layout'
import { Button, Card, PageHeader } from '../../components/ui'

function SettingsCard({ title, subtitle, fields, upload = false }: { title: string; subtitle: string; fields: string[]; upload?: boolean }) {
  const [logo, setLogo] = useState('')
  const [error, setError] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (upload) {
      setLogo(window.localStorage.getItem('adventist-logo') ?? '')
    }
  }, [upload])

  const chooseLogo = async (file: File | undefined) => {
    if (!file) return
    setError('')
    try {
      const dataUrl = await readImageAsDataUrl(file)
      window.localStorage.setItem('adventist-logo', dataUrl)
      setLogo(dataUrl)
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Unable to upload logo.')
    }
  }

  return (
    <Card className="p-6">
      <h2 className="text-lg font-semibold">{title}</h2><p className="mb-6 text-sm text-slate-400">{subtitle}</p>
      {upload && <div className="mb-6 flex items-center gap-6"><div className="grid size-20 place-items-center overflow-hidden rounded-md border border-dashed border-slate-300 bg-blue-50">{logo ? <img className="h-full w-full object-cover" src={logo} alt="Organization logo" /> : <Image className="size-6 text-slate-400" />}</div><input ref={inputRef} className="sr-only" accept="image/png,image/jpeg,image/webp" type="file" onChange={(event) => chooseLogo(event.target.files?.[0])} /><Button variant="secondary" icon={Upload} onClick={() => inputRef.current?.click()}>Upload New Logo</Button></div>}
      {error && <p className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}
      <div className="grid gap-6 md:grid-cols-2">{fields.map((field, index) => { const [label, value] = field.split('|'); return <label className={index === 2 && fields.length === 3 ? 'md:col-span-2' : ''} key={label}><span className="mb-2 block text-sm font-medium">{label}</span><input className="h-10 w-full rounded-md border border-slate-200 px-4 text-sm" value={value} readOnly /></label> })}</div>
    </Card>
  )
}

export function Settings({ active, onNavigate }: PageProps) {
  return (
    <Shell active={active} onNavigate={onNavigate}>
      <PageHeader title="Settings" subtitle="Dashboard / Settings" actions={<Button>Save Changes</Button>} />
      <div className="mb-12 flex gap-8 overflow-x-auto border-b border-slate-200 text-sm font-medium text-slate-400"><span className="border-b-2 border-blue-700 py-4 text-blue-800">General Settings</span><span className="py-4">Security & Access</span><span className="py-4">Notifications</span><span className="py-4">Team Members</span><span className="py-4">Integrations</span></div>
      <div className="grid gap-8 lg:grid-cols-[225px_1fr]">
        <div className="space-y-2">{['Organization', 'Regional', 'Appearance', 'Data Management'].map((item, i) => <button className={`flex w-full items-center gap-3 rounded-md px-4 py-3 text-left ${i === 0 ? 'bg-blue-50 text-blue-900' : 'text-slate-400'}`} key={item} type="button"><SettingsIcon className="size-4" />{item}</button>)}</div>
        <div className="space-y-6">
          <SettingsCard title="Organization Profile" subtitle="Update your organization details and public profile information." fields={['Organization Name|Rwanda Union Mission - Publishing Dept', 'Support Email|support@adventist.rw', 'Headquarters Address|KG 548 St, Kigali, Rwanda']} upload />
          <SettingsCard title="Regional Preferences" subtitle="Set your local timezone, currency, and language preferences." fields={['Default Language|English', 'Time Zone|(GMT+02:00) Central Africa Time', 'Currency|RWF (Rwandan Franc)', 'Date Format|DD/MM/YYYY']} />
          <Card className="p-6"><h2 className="text-lg font-semibold">System Preferences</h2><p className="text-sm text-slate-400">Manage system-wide behavior and accessibility settings.</p>{['Maintenance Mode', 'Public Registration', 'Automatic Reports'].map((item, i) => <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-5" key={item}><div><p className="font-medium">{item}</p><p className="text-sm text-slate-400">Generate and manage access settings.</p></div><span className={`h-6 w-11 rounded-full p-1 ${i === 2 ? 'bg-emerald-500' : 'bg-slate-200'}`}><i className={`block size-4 rounded-full bg-white ${i === 2 ? 'ml-5' : ''}`} /></span></div>)}</Card>
        </div>
      </div>
    </Shell>
  )
}
