import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Input } from '@/components/ui/input'
import { Search } from 'lucide-react'
import { getInitials } from '@/lib/utils'
import type { Conversation } from '@/lib/types'

interface ConversationsListProps {
  conversations: Conversation[]
  selectedId: number
  onSelect: (conversation: Conversation) => void
}

export const ConversationsList = ({
  conversations,
  selectedId,
  onSelect,
}: ConversationsListProps) => (
  <div className="col-span-1 flex flex-col border-r h-full">
    <div className="p-4 border-b flex-shrink-0">
      <h2 className="text-2xl font-bold">Messages</h2>
      <div className="relative mt-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
        <Input placeholder="Search conversations..." className="pl-10" />
      </div>
    </div>
    <ScrollArea className="flex-1 h-0">
      <div className="p-2 space-y-2">
        {conversations.map((convo) => (
          <button
            key={convo.id}
            className={`w-full text-left p-3 rounded-lg flex items-start gap-4 transition-colors mb-2 ${
              selectedId === convo.id ? 'bg-blue-100/60' : 'hover:bg-neutral-100/80'
            }`}
            onClick={() => onSelect(convo)}
          >
            <div className="relative">
              <Avatar className="w-12 h-12 border">
                <AvatarImage src={convo.avatar} alt={convo.name} />
                <AvatarFallback>{getInitials(convo.name)}</AvatarFallback>
              </Avatar>
              {convo.online && (
                <span className="absolute bottom-0 right-0 block h-3 w-3 rounded-full bg-green-500 border-2 border-white" />
              )}
            </div>
            <div className="flex-1 flex items-start justify-between">
              <div className="truncate pr-4">
                <h3 className="font-semibold truncate">{convo.name}</h3>
                <p className="text-sm text-muted-foreground truncate mt-1">{convo.lastMessage}</p>
                <p className="text-xs text-blue-600 font-medium mt-1 truncate">
                  Re: {convo.product}
                </p>
              </div>
              <div className="flex flex-col items-end flex-shrink-0">
                <p className="text-xs text-muted-foreground whitespace-nowrap">{convo.time}</p>
                {convo.unread > 0 && (
                  <Badge className="bg-blue-500 text-white w-5 h-5 flex items-center justify-center p-0 mt-2">
                    {convo.unread}
                  </Badge>
                )}
              </div>
            </div>
          </button>
        ))}
      </div>
    </ScrollArea>
  </div>
)
