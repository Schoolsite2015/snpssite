import { useState, useEffect } from "react";
import { X, ZoomIn } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import Navbar from "@/components/public/Navbar";
import Footer from "@/components/public/Footer";

interface GalleryItem { id: number; title: string; description?: string; imageUrl: string; category: string; }

const categories = ["all", "events", "academics", "sports", "campus", "general"];

export default function Gallery() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [selected, setSelected] = useState<GalleryItem | null>(null);

  useEffect(() => {
    fetch("/api/gallery")
      .then(r => r.json())
      .then(d => setItems(d))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = filter === "all" ? items : items.filter(i => i.category === filter);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <section className="hero-gradient text-white py-14">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <Badge className="mb-4 bg-secondary/90 text-secondary-foreground border-0">Photo Gallery</Badge>
          <h1 className="text-4xl font-bold mb-3">Our Gallery</h1>
          <p className="text-white/80 text-lg">Glimpses of life at S.N. Public School</p>
        </div>
      </section>

      <section className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex-1">
        <div className="flex flex-wrap gap-2 mb-8 justify-center">
          {categories.map(cat => (
            <Button key={cat} variant={filter === cat ? "default" : "outline"} size="sm" onClick={() => setFilter(cat)} className="capitalize" data-testid={`button-filter-${cat}`}>
              {cat}
            </Button>
          ))}
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="aspect-square rounded-lg" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <p className="text-lg">No images found in this category.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filtered.map(item => (
              <div key={item.id} className="relative group overflow-hidden rounded-lg aspect-square bg-muted cursor-pointer"
                onClick={() => setSelected(item)} data-testid={`img-gallery-${item.id}`}>
                <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all duration-300 flex flex-col items-center justify-center gap-2">
                  <ZoomIn className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <span className="text-white text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-center px-2">{item.title}</span>
                </div>
                <div className="absolute top-2 right-2">
                  <Badge className="text-xs capitalize opacity-0 group-hover:opacity-100 transition-opacity">{item.category}</Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {selected && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4" onClick={() => setSelected(null)}>
          <button className="absolute top-4 right-4 text-white hover:text-muted-foreground transition-colors" onClick={() => setSelected(null)} data-testid="button-close-modal">
            <X className="w-8 h-8" />
          </button>
          <div className="max-w-4xl w-full" onClick={e => e.stopPropagation()}>
            <img src={selected.imageUrl} alt={selected.title} className="w-full max-h-[80vh] object-contain rounded-lg" />
            <div className="mt-4 text-center text-white">
              <h3 className="text-xl font-semibold">{selected.title}</h3>
              {selected.description && <p className="text-white/70 mt-1">{selected.description}</p>}
              <Badge className="mt-2 capitalize">{selected.category}</Badge>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
