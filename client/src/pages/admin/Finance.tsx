import { useState, useEffect } from "react";
import { Plus, Trash2, TrendingUp, TrendingDown, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import AdminLayout from "@/components/admin/AdminLayout";
import { authHeaders, apiRequest } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";

export default function Finance() {
  const [income, setIncome] = useState<any[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [incomeModal, setIncomeModal] = useState(false);
  const [expenseModal, setExpenseModal] = useState(false);
  const [incomeForm, setIncomeForm] = useState({ title: "", amount: "", category: "fee", date: new Date().toISOString().split("T")[0], description: "" });
  const [expenseForm, setExpenseForm] = useState({ title: "", amount: "", category: "salary", date: new Date().toISOString().split("T")[0], description: "" });
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const fetchAll = () => {
    setLoading(true);
    const h = authHeaders();
    Promise.all([
      fetch("/api/finance/income", { headers: h }).then(r => r.json()),
      fetch("/api/finance/expenses", { headers: h }).then(r => r.json()),
      fetch("/api/finance/summary", { headers: h }).then(r => r.json()),
    ]).then(([i, e, s]) => { setIncome(i); setExpenses(e); setSummary(s); }).finally(() => setLoading(false));
  };
  useEffect(fetchAll, []);

  const saveIncome = async () => {
    setSaving(true);
    try { await apiRequest("POST", "/api/finance/income", incomeForm); toast({ title: "Income recorded" }); setIncomeModal(false); fetchAll(); }
    catch (e: any) { toast({ variant: "destructive", title: "Error", description: e.message }); }
    finally { setSaving(false); }
  };

  const saveExpense = async () => {
    setSaving(true);
    try { await apiRequest("POST", "/api/finance/expenses", expenseForm); toast({ title: "Expense recorded" }); setExpenseModal(false); fetchAll(); }
    catch (e: any) { toast({ variant: "destructive", title: "Error", description: e.message }); }
    finally { setSaving(false); }
  };

  const delIncome = async (id: number) => {
    if (!confirm("Delete this income record?")) return;
    try { await apiRequest("DELETE", `/api/finance/income/${id}`); fetchAll(); }
    catch {}
  };

  const delExpense = async (id: number) => {
    if (!confirm("Delete this expense?")) return;
    try { await apiRequest("DELETE", `/api/finance/expenses/${id}`); fetchAll(); }
    catch {}
  };

  const chartData = [
    { name: "Income", amount: summary?.totalIncome || 0 },
    { name: "Expenses", amount: summary?.totalExpenses || 0 },
    { name: "Profit", amount: summary?.profit || 0 },
  ];

  return (
    <AdminLayout>
      <div className="space-y-4 animate-fade-in">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold">Financial Accounting</h1>
            <p className="text-muted-foreground text-sm">Track income, expenses and profit/loss</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setExpenseModal(true)} className="gap-2 text-red-600"><Plus className="w-4 h-4" /> Add Expense</Button>
            <Button onClick={() => setIncomeModal(true)} className="gap-2" data-testid="button-add-income"><Plus className="w-4 h-4" /> Add Income</Button>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Total Income", value: summary?.totalIncome || 0, color: "text-green-600", icon: TrendingUp },
            { label: "Total Expenses", value: summary?.totalExpenses || 0, color: "text-red-600", icon: TrendingDown },
            { label: "Net Profit/Loss", value: summary?.profit || 0, color: summary?.profit >= 0 ? "text-green-600" : "text-red-600", icon: DollarSign },
          ].map(s => (
            <Card key={s.label} className="p-4">
              <div className="flex items-center gap-3">
                <div className={`${s.color} opacity-20 bg-current w-10 h-10 rounded-lg flex items-center justify-center`}>
                  <s.icon className={`w-5 h-5 ${s.color}`} />
                </div>
                <div>
                  <div className={`text-xl font-bold ${s.color}`}>₹{loading ? "—" : Number(s.value).toLocaleString("en-IN")}</div>
                  <div className="text-xs text-muted-foreground">{s.label}</div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader><CardTitle className="text-base">Financial Overview</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip formatter={(v: number) => `₹${v.toLocaleString("en-IN")}`} />
                <Bar dataKey="amount" fill="hsl(215, 60%, 35%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Tabs defaultValue="income">
          <TabsList><TabsTrigger value="income">Income Records</TabsTrigger><TabsTrigger value="expense">Expense Records</TabsTrigger></TabsList>
          <TabsContent value="income">
            <Card>
              <CardContent className="pt-4">
                {loading ? <Skeleton className="h-40" /> : (
                  <table className="w-full text-sm">
                    <thead><tr className="border-b border-border">{["Title", "Category", "Date", "Amount", ""].map(h => <th key={h} className="text-left py-2 px-3 font-medium text-muted-foreground">{h}</th>)}</tr></thead>
                    <tbody>
                      {income.map(i => (
                        <tr key={i.id} className="border-b border-border last:border-0 hover:bg-muted/40">
                          <td className="py-2 px-3">{i.title}</td>
                          <td className="py-2 px-3 capitalize text-muted-foreground">{i.category}</td>
                          <td className="py-2 px-3 text-muted-foreground">{i.date}</td>
                          <td className="py-2 px-3 font-semibold text-green-600">₹{Number(i.amount).toLocaleString("en-IN")}</td>
                          <td className="py-2 px-3"><Button size="icon" variant="ghost" className="text-destructive" onClick={() => delIncome(i.id)}><Trash2 className="w-3.5 h-3.5" /></Button></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
                {income.length === 0 && !loading && <div className="text-center py-8 text-muted-foreground">No income records yet.</div>}
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="expense">
            <Card>
              <CardContent className="pt-4">
                {loading ? <Skeleton className="h-40" /> : (
                  <table className="w-full text-sm">
                    <thead><tr className="border-b border-border">{["Title", "Category", "Date", "Amount", ""].map(h => <th key={h} className="text-left py-2 px-3 font-medium text-muted-foreground">{h}</th>)}</tr></thead>
                    <tbody>
                      {expenses.map(e => (
                        <tr key={e.id} className="border-b border-border last:border-0 hover:bg-muted/40">
                          <td className="py-2 px-3">{e.title}</td>
                          <td className="py-2 px-3 capitalize text-muted-foreground">{e.category}</td>
                          <td className="py-2 px-3 text-muted-foreground">{e.date}</td>
                          <td className="py-2 px-3 font-semibold text-red-600">₹{Number(e.amount).toLocaleString("en-IN")}</td>
                          <td className="py-2 px-3"><Button size="icon" variant="ghost" className="text-destructive" onClick={() => delExpense(e.id)}><Trash2 className="w-3.5 h-3.5" /></Button></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
                {expenses.length === 0 && !loading && <div className="text-center py-8 text-muted-foreground">No expense records yet.</div>}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {[
        { open: incomeModal, setOpen: setIncomeModal, title: "Add Income", form: incomeForm, setForm: setIncomeForm, save: saveIncome, categories: ["fee", "donation", "grant", "event", "other"] },
        { open: expenseModal, setOpen: setExpenseModal, title: "Add Expense", form: expenseForm, setForm: setExpenseForm, save: saveExpense, categories: ["salary", "utilities", "maintenance", "supplies", "transport", "other"] },
      ].map(({ open, setOpen, title, form, setForm, save, categories }) => (
        <Dialog key={title} open={open} onOpenChange={setOpen}>
          <DialogContent>
            <DialogHeader><DialogTitle>{title}</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div><Label>Title</Label><Input className="mt-1" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Amount (₹)</Label><Input type="number" className="mt-1" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} /></div>
                <div><Label>Date</Label><Input type="date" className="mt-1" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} /></div>
              </div>
              <div><Label>Category</Label>
                <select className="mt-1 w-full h-9 rounded-md border border-input bg-background px-3 text-sm" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                  {categories.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                </select>
              </div>
              <div><Label>Description (Optional)</Label><Input className="mt-1" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></div>
            </div>
            <DialogFooter className="mt-4">
              <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button onClick={save} disabled={saving}>{saving ? "Saving..." : "Save"}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      ))}
    </AdminLayout>
  );
}
