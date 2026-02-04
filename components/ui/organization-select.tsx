'use client'

import * as React from 'react'
import { Check, ChevronsUpDown, Building } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover'
import { Input } from '@/components/ui/input'

const organizations = [
    "AfCHPR - African Court on Human and Peoples' Rights",
    "DCO - UN Development Coordination Office",
    "FAO - Food and Agriculture Organization",
    "IAEA - International Atomic Energy Agency",
    "ICAO - International Civil Aviation Organization",
    "IFAD - International Fund for Agricultural Development",
    "IFC - International Finance Corporation",
    "ILO - International Labour Organization",
    "IMF - International Monetary Fund",
    "IOM - International Organization for Migration",
    "IRMCT - International Residual Mechanism for Criminal Tribunals",
    "ITC - International Trade Centre",
    "ITU - International Telecommunication Union",
    "MIGA - Multilateral Investment Guarantee Agency",
    "OCHA - United Nations Office for the Coordination of Humanitarian Affairs",
    "OHCHR - Office of the High Commissioner for Human Rights",
    "RCO - UN Resident Coordinator's Office",
    "UN Tourism",
    "UN Women - UN Entity for Gender Equality and the Empowerment of Women",
    "UNA - United Nations Association",
    "UNAIDS - Joint United Nations Programme on HIV/AIDS",
    "UNCDF - United Nations Capital Development Fund",
    "UNCTAD - United Nations Conference on Trade and Development",
    "UNDF - United Nations Detention Facility",
    "UNDP - United Nations Development Programme",
    "UNDSS - UN Department of Safety and Security",
    "UNEP - UN Environment Programme",
    "UNESCO - UN Educational, Scientific and Cultural Organization",
    "UNFCCC - United Nations Framework Convention on Climate Change",
    "UNFPA - United Nations Population Fund",
    "UN-Habitat - UN Human Settlements Programme",
    "UNHCR - UN Refugee Agency",
    "UNIC - United Nations Information Centre",
    "UNICEF - United Nations Children’s Fund",
    "UNIDO - UN Industrial Development Organization",
    "UNODC - UN Office on Drugs and Crime",
    "UNOPS - UN Office for Project Services",
    "UNV - UN Volunteers",
    "UPU - Universal Postal Union",
    "WFP - World Food Programme",
    "WHO - World Health Organization",
    "WIPO - World Intellectual Property Organization",
    "WMO - World Meteorological Organization",
    "World Bank"
]

interface OrganizationSelectProps {
    value: string
    onValueChange: (value: string) => void
    placeholder?: string
    className?: string
    disabled?: boolean
}

export function OrganizationSelect({
    value,
    onValueChange,
    placeholder = "Select organization...",
    className,
    disabled = false
}: OrganizationSelectProps) {
    const [open, setOpen] = React.useState(false)
    const [searchQuery, setSearchQuery] = React.useState("")

    // Sync internal search query with incoming value
    React.useEffect(() => {
        setSearchQuery(value)
    }, [value])

    const filteredOrgs = organizations.filter((org) => {
        const query = searchQuery.toLowerCase()
        return org.toLowerCase().includes(query)
    })

    const handleSelect = (org: string) => {
        onValueChange(org)
        setOpen(false)
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value
        setSearchQuery(val)
        onValueChange(val) // Allow manual input
        if (val.length > 0 && !open) {
            setOpen(true)
        }
    }

    return (
        <div className={cn("relative w-full", className)}>
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <div className="relative group">
                        <Input
                            value={searchQuery}
                            onChange={handleInputChange}
                            onFocus={() => setOpen(true)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    setOpen(false)
                                }
                            }}
                            onClick={(e) => {
                                e.stopPropagation() // Stop Radix PopoverTrigger from toggling
                                setOpen(true)
                            }}
                            placeholder={placeholder}
                            disabled={disabled}
                            className="pr-10 h-12 rounded-2xl border-neutral-200 focus:border-brand-primary transition-all duration-200"
                        />
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                            onClick={() => setOpen(!open)}
                            disabled={disabled}
                        >
                            <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                    </div>
                </PopoverTrigger>
                <PopoverContent
                    className="p-0 border border-neutral-200 shadow-xl rounded-2xl overflow-hidden bg-white z-[150]"
                    // Use a larger width if needed, or match trigger
                    style={{ width: 'var(--radix-popover-trigger-width)' }}
                    align="start"
                    onOpenAutoFocus={(e) => e.preventDefault()} // Don't steal focus from input
                >
                    <div className="max-h-[300px] overflow-y-auto p-1 custom-scrollbar">
                        {filteredOrgs.length > 0 ? (
                            filteredOrgs.map((org) => (
                                <button
                                    key={org}
                                    type="button"
                                    onClick={() => handleSelect(org)}
                                    className={cn(
                                        "w-full text-left flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm transition-colors duration-150",
                                        "hover:bg-blue-50 hover:text-blue-700",
                                        value === org ? "bg-blue-50 text-blue-700 font-medium" : "text-neutral-700"
                                    )}
                                >
                                    <div className={cn(
                                        "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-colors",
                                        value === org ? "bg-blue-100" : "bg-neutral-100 group-hover:bg-blue-100"
                                    )}>
                                        <Building className={cn("w-4 h-4", value === org ? "text-blue-600" : "text-neutral-400")} />
                                    </div>
                                    <span className="flex-1 truncate">{org}</span>
                                    {value === org && (
                                        <Check className="w-4 h-4 text-blue-600 ml-auto" />
                                    )}
                                </button>
                            ))
                        ) : searchQuery.length > 0 ? (
                            <div className="p-6 text-center">
                                <div className="w-12 h-12 bg-neutral-50 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <Building className="w-6 h-6 text-neutral-300" />
                                </div>
                                <p className="text-sm font-semibold text-neutral-800 mb-1">Organization not in our list?</p>
                                <p className="text-xs text-neutral-500 mb-4 leading-relaxed">
                                    No problem! You can still continue—just type your organization's name manually.
                                </p>
                                <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-2xl text-xs font-bold border border-blue-100 italic transition-all animate-in zoom-in-95 duration-200">
                                    "{searchQuery}"
                                </div>
                            </div>
                        ) : (
                            <div className="p-4 text-center text-sm text-neutral-400">
                                Start typing to see organizations
                            </div>
                        )}
                    </div>
                </PopoverContent>
            </Popover>
        </div>
    )
}
