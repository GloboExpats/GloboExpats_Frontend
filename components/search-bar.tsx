'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'

export default function SearchBar() {
  const [searchQuery, setSearchQuery] = useState('')
  const router = useRouter()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      // Navigate to search results page using Next.js router
      router.push(`/browse?q=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  return (
    <form
      onSubmit={handleSearch}
      className="flex-1 max-w-2xl mx-auto"
      role="search"
      aria-label="Search products"
    >
      <div className="relative">
        <Label htmlFor="search-input" className="sr-only">
          Search for products in the global marketplace
        </Label>
        <Input
          id="search-input"
          type="search"
          placeholder="Search global marketplace..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full h-9 sm:h-10 pl-3 sm:pl-4 pr-10 sm:pr-12 bg-white border-slate-300 rounded-full text-sm focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 text-neutral-900 placeholder-neutral-500"
          autoComplete="off"
          aria-describedby="search-description"
        />
        <div id="search-description" className="sr-only">
          Search for products by name, category, or description. Press Enter or click the search
          button to start searching.
        </div>
        <Button
          type="submit"
          size="icon"
          className="absolute right-1 top-1 h-7 w-7 sm:h-8 sm:w-8 bg-cyan-500 hover:bg-cyan-600 rounded-full"
          aria-label="Search"
          disabled={!searchQuery.trim()}
        >
          <Search className="h-3 w-3 sm:h-4 sm:w-4" />
          <span className="sr-only">Search</span>
        </Button>
      </div>
    </form>
  )
}
