import { ConversationSkeleton, ChatSkeleton } from '@/components/common/loading-skeleton'
import { Card, CardContent } from '@/components/ui/card'

export default function Loading() {
  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
          {/* Conversations List */}
          <Card className="lg:col-span-1">
            <CardContent className="p-0">
              <div className="p-4 border-b">
                <div className="h-8 w-32 bg-gray-200 rounded animate-pulse" />
              </div>
              <div className="space-y-0">
                {Array.from({ length: 8 }).map((_, i) => (
                  <ConversationSkeleton key={i} />
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Chat Area */}
          <ChatSkeleton />
        </div>
      </div>
    </div>
  )
}
