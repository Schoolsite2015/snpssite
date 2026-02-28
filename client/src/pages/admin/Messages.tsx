import { useState, useEffect } from "react";
import { Mail, Trash2, Check, Phone, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AdminLayout from "@/components/admin/AdminLayout";
import { authHeaders, apiRequest } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";

export default function Messages() {
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchMessages = () => {
    setLoading(true);
    fetch("/api/contact/messages", { headers: authHeaders() })
      .then(r => r.json()).then(setMessages).finally(() => setLoading(false));
  };
  useEffect(fetchMessages, []);

  const markRead = async (id: number) => {
    try { await apiRequest("PUT", `/api/contact/messages/${id}/read`); fetchMessages(); }
    catch {}
  };

  const del = async (id: number) => {
    if (!confirm("Delete this message?")) return;
    try { await apiRequest("DELETE", `/api/contact/messages/${id}`); toast({ title: "Message deleted" }); fetchMessages(); }
    catch {}
  };

  const unread = messages.filter(m => !m.isRead);
  const read = messages.filter(m => m.isRead);

  const MessageCard = ({ m }: { m: any }) => (
    <Card key={m.id} className={`p-4 ${!m.isRead ? "border-primary/30 bg-primary/5" : ""}`} data-testid={`card-message-${m.id}`}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${!m.isRead ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
            <Mail className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="font-semibold text-sm">{m.name}</span>
              {!m.isRead && <Badge className="bg-primary text-primary-foreground text-xs">New</Badge>}
            </div>
            <div className="font-medium text-sm">{m.subject}</div>
            <p className="text-sm text-muted-foreground mt-1">{m.message}</p>
            <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground flex-wrap">
              <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{m.email}</span>
              {m.phone && <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{m.phone}</span>}
              <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{new Date(m.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
            </div>
          </div>
        </div>
        <div className="flex gap-1 flex-shrink-0">
          {!m.isRead && (
            <Button size="icon" variant="ghost" className="h-7 w-7 text-green-600" onClick={() => markRead(m.id)} title="Mark as read" data-testid={`button-read-${m.id}`}><Check className="w-3.5 h-3.5" /></Button>
          )}
          <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => del(m.id)} data-testid={`button-delete-message-${m.id}`}><Trash2 className="w-3.5 h-3.5" /></Button>
        </div>
      </div>
    </Card>
  );

  return (
    <AdminLayout>
      <div className="space-y-4 animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold">Contact Messages</h1>
          <p className="text-muted-foreground text-sm">Messages from parents and visitors</p>
        </div>

        <div className="grid grid-cols-2 gap-4 max-w-sm">
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">{unread.length}</div>
            <div className="text-xs text-muted-foreground">Unread</div>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold">{messages.length}</div>
            <div className="text-xs text-muted-foreground">Total</div>
          </Card>
        </div>

        <Tabs defaultValue="unread">
          <TabsList>
            <TabsTrigger value="unread">Unread ({unread.length})</TabsTrigger>
            <TabsTrigger value="read">Read ({read.length})</TabsTrigger>
            <TabsTrigger value="all">All ({messages.length})</TabsTrigger>
          </TabsList>
          {loading ? <Skeleton className="h-48 mt-4" /> : (
            <>
              <TabsContent value="unread" className="space-y-3 mt-4">
                {unread.map(m => <MessageCard key={m.id} m={m} />)}
                {unread.length === 0 && <div className="text-center py-10 text-muted-foreground">No unread messages.</div>}
              </TabsContent>
              <TabsContent value="read" className="space-y-3 mt-4">
                {read.map(m => <MessageCard key={m.id} m={m} />)}
                {read.length === 0 && <div className="text-center py-10 text-muted-foreground">No read messages.</div>}
              </TabsContent>
              <TabsContent value="all" className="space-y-3 mt-4">
                {messages.map(m => <MessageCard key={m.id} m={m} />)}
                {messages.length === 0 && <div className="text-center py-10 text-muted-foreground">No messages yet.</div>}
              </TabsContent>
            </>
          )}
        </Tabs>
      </div>
    </AdminLayout>
  );
}
