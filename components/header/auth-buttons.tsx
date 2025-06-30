import React from 'react'
import Link from 'next/link'
import { LogIn, UserPlus } from 'lucide-react'
import { Button } from '@/components/ui/button'

export const AuthButtons = React.memo(() => (
  <div className="flex items-center gap-2">
    <Link href="/login">
      <Button
        variant="ghost"
        size="sm"
        className="text-white hover:bg-white/10 hover:text-white border border-transparent hover:border-white/20 h-8 px-3"
      >
        <LogIn className="w-4 h-4 mr-1" />
        Login
      </Button>
    </Link>
    <Link href="/register">
      <Button
        size="sm"
        className="bg-brand-secondary hover:bg-amber-500 text-slate-900 font-semibold h-8 px-3"
      >
        <UserPlus className="w-4 h-4 mr-1" />
        Join
      </Button>
    </Link>
  </div>
))

AuthButtons.displayName = 'AuthButtons'
