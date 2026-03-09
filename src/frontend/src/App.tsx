import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Toaster } from "@/components/ui/sonner";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  BookOpen,
  CheckCircle,
  ChevronRight,
  Circle,
  Coins,
  Lock,
  LogOut,
  Mail,
  Menu,
  Pencil,
  Plus,
  Shield,
  Trash2,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useInternetIdentity } from "./hooks/useInternetIdentity";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Listing {
  id: string;
  title: string;
  description: string;
  era: string;
  price: string;
  condition: string;
  imageUrl: string;
  category: string;
  sold: boolean;
  createdAt: number;
}

interface Inquiry {
  id: string;
  name: string;
  email: string;
  message: string;
  listingTitle: string;
  createdAt: number;
  isRead: boolean;
}

const STORAGE_KEY_LISTINGS = "imperial_listings";
const STORAGE_KEY_INQUIRIES = "imperial_inquiries";

const CONDITIONS = [
  "Poor",
  "Fair",
  "Good",
  "Very Good",
  "Fine",
  "Very Fine",
  "Extremely Fine",
  "Uncirculated",
];

const CATEGORIES = [
  "British India",
  "World Coins",
  "Banknotes",
  "Sets & Collections",
];

const CATEGORY_FILTERS = ["All", ...CATEGORIES];

// ─── Seed Data ────────────────────────────────────────────────────────────────

const SEED_LISTINGS: Listing[] = [
  {
    id: "seed-1",
    title: "George V One Rupee 1917",
    description:
      "A superb example of the George V One Rupee, struck at the Bombay Mint. The obverse bears the effigy of King George V with the legend 'GEORGE V KING EMPEROR'. Reverse displays the denomination in English and Urdu within a wreath.",
    era: "1917, George V",
    price: "£45",
    condition: "Very Fine",
    imageUrl: "",
    category: "British India",
    sold: false,
    createdAt: Date.now() - 6 * 24 * 60 * 60 * 1000,
  },
  {
    id: "seed-2",
    title: "Victoria Empress Rupee 1900",
    description:
      "Iconic Victoria Empress rupee from 1900 featuring the mature portrait of Queen Victoria as Empress of India. A historically significant piece from the height of the British Raj era. Well-struck with pleasing original surfaces.",
    era: "1900, Victoria Empress",
    price: "£85",
    condition: "Fine",
    imageUrl: "",
    category: "British India",
    sold: false,
    createdAt: Date.now() - 5 * 24 * 60 * 60 * 1000,
  },
  {
    id: "seed-3",
    title: "Edward VII Half Rupee 1906",
    description:
      "Elegant Edward VII Half Rupee from 1906, the Calcutta Mint. Features the uniformed bust of King Edward VII on obverse. A relatively short-reigned monarch makes this a sought-after piece for colonial India collectors.",
    era: "1906, Edward VII",
    price: "£35",
    condition: "Very Good",
    imageUrl: "",
    category: "British India",
    sold: false,
    createdAt: Date.now() - 4 * 24 * 60 * 60 * 1000,
  },
  {
    id: "seed-4",
    title: "George VI One Anna 1944",
    description:
      "George VI One Anna from the final years of British India, 1944. This cupro-nickel piece represents the twilight of the British Raj. The reverse features a tiger design — a notable departure from earlier floral motifs.",
    era: "1944, George VI",
    price: "£12",
    condition: "Extremely Fine",
    imageUrl: "",
    category: "British India",
    sold: false,
    createdAt: Date.now() - 3 * 24 * 60 * 60 * 1000,
  },
  {
    id: "seed-5",
    title: "Ceylon 50 Cents 1913",
    description:
      "George V Ceylon 50 Cents silver piece struck in 1913. Ceylon (modern Sri Lanka) was administered separately from British India and issued its own coinage. Beautiful luster with original patina on a boldly struck coin.",
    era: "1913, George V",
    price: "£28",
    condition: "Very Fine",
    imageUrl: "",
    category: "World Coins",
    sold: false,
    createdAt: Date.now() - 2 * 24 * 60 * 60 * 1000,
  },
  {
    id: "seed-6",
    title: "Reserve Bank of India 10 Rupees 1943",
    description:
      "Scarce Reserve Bank of India 10 Rupees banknote dated 1943, signed by C.D. Deshmukh. Features the classic George VI portrait on obverse with the RBI seal. Crisp, well-preserved example of late colonial Indian paper money.",
    era: "1943",
    price: "£120",
    condition: "Fine",
    imageUrl: "",
    category: "Banknotes",
    sold: false,
    createdAt: Date.now() - 1 * 24 * 60 * 60 * 1000,
  },
];

// ─── Storage Helpers ──────────────────────────────────────────────────────────

function loadListings(): Listing[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_LISTINGS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_LISTINGS, JSON.stringify(SEED_LISTINGS));
      return SEED_LISTINGS;
    }
    return JSON.parse(raw) as Listing[];
  } catch {
    return SEED_LISTINGS;
  }
}

function saveListings(listings: Listing[]) {
  localStorage.setItem(STORAGE_KEY_LISTINGS, JSON.stringify(listings));
}

function loadInquiries(): Inquiry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_INQUIRIES);
    if (!raw) return [];
    return JSON.parse(raw) as Inquiry[];
  } catch {
    return [];
  }
}

function saveInquiries(inquiries: Inquiry[]) {
  localStorage.setItem(STORAGE_KEY_INQUIRIES, JSON.stringify(inquiries));
}

function formatDate(ts: number) {
  return new Date(ts).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

// ─── Condition Badge Colors ───────────────────────────────────────────────────

function conditionVariant(
  condition: string,
): "default" | "secondary" | "outline" {
  if (["Uncirculated", "Extremely Fine"].includes(condition)) return "default";
  if (["Very Fine", "Fine"].includes(condition)) return "secondary";
  return "outline";
}

// ─── Components ───────────────────────────────────────────────────────────────

function CoinPlaceholder({ size = "lg" }: { size?: "sm" | "lg" }) {
  const s = size === "lg" ? "h-48" : "h-32";
  return (
    <div
      className={`${s} w-full bg-parchment-dark flex items-center justify-center overflow-hidden relative`}
    >
      <img
        src="/assets/generated/coin-placeholder.dim_400x400.jpg"
        alt="Antique coin"
        className="w-full h-full object-cover opacity-60"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-sepia-dark/30 to-transparent" />
    </div>
  );
}

function ListingCard({
  listing,
  index,
  onInquire,
}: {
  listing: Listing;
  index: number;
  onInquire: (title: string) => void;
}) {
  return (
    <motion.div
      data-ocid={`listing.item.${index}`}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.45, delay: index * 0.07 }}
      className="group relative bg-card border border-border rounded-lg shadow-antique overflow-hidden flex flex-col hover:shadow-antique-lg transition-shadow duration-300"
    >
      {/* Image */}
      <div className="relative overflow-hidden">
        {listing.imageUrl ? (
          <img
            src={listing.imageUrl}
            alt={listing.title}
            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <CoinPlaceholder />
        )}

        {/* Sold overlay */}
        {listing.sold && (
          <div className="absolute inset-0 bg-sepia-dark/70 flex items-center justify-center">
            <span className="font-display text-2xl font-bold text-gold-light tracking-widest rotate-[-12deg] border-2 border-gold-light px-4 py-1">
              SOLD
            </span>
          </div>
        )}

        {/* Category badge */}
        <div className="absolute top-2 left-2">
          <Badge
            variant="secondary"
            className="text-xs font-body bg-sepia-dark/80 text-gold-light border-0 backdrop-blur-sm"
          >
            {listing.category}
          </Badge>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1 gap-2">
        <h3 className="font-display font-semibold text-base leading-tight text-foreground">
          {listing.title}
        </h3>

        <p className="text-xs text-muted-foreground font-body italic">
          {listing.era}
        </p>

        <p className="text-sm text-muted-foreground font-body line-clamp-2 flex-1">
          {listing.description}
        </p>

        <div className="flex items-center justify-between mt-2 pt-2 border-t border-border">
          <div className="flex flex-col gap-1">
            <Badge
              variant={conditionVariant(listing.condition)}
              className="text-xs w-fit"
            >
              {listing.condition}
            </Badge>
            <span className="font-display text-lg font-bold text-gold-deep">
              {listing.price}
            </span>
          </div>

          <Button
            data-ocid={`listing.primary_button.${index}`}
            size="sm"
            disabled={listing.sold}
            onClick={() => onInquire(listing.title)}
            className="bg-gold-deep hover:bg-gold text-parchment border-0 font-body text-xs"
          >
            {listing.sold ? "Sold" : "Inquire"}
            {!listing.sold && <ChevronRight className="ml-1 h-3 w-3" />}
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Admin Panel ──────────────────────────────────────────────────────────────

const EMPTY_LISTING: Omit<Listing, "id" | "createdAt"> = {
  title: "",
  description: "",
  era: "",
  price: "",
  condition: "Very Fine",
  imageUrl: "",
  category: "British India",
  sold: false,
};

function AdminPanel({
  listings,
  inquiries,
  onListingsChange,
  onInquiriesChange,
  onLogout,
}: {
  listings: Listing[];
  inquiries: Inquiry[];
  onListingsChange: (l: Listing[]) => void;
  onInquiriesChange: (i: Inquiry[]) => void;
  onLogout: () => void;
}) {
  const [editListing, setEditListing] = useState<Listing | null>(null);
  const [isNewListing, setIsNewListing] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] =
    useState<Omit<Listing, "id" | "createdAt">>(EMPTY_LISTING);

  const openAdd = () => {
    setForm(EMPTY_LISTING);
    setIsNewListing(true);
    setEditListing(null);
  };

  const openEdit = (l: Listing) => {
    const { id: _id, createdAt: _createdAt, ...rest } = l;
    setForm(rest);
    setEditListing(l);
    setIsNewListing(false);
  };

  const handleSave = () => {
    if (!form.title.trim() || !form.price.trim()) {
      toast.error("Title and price are required");
      return;
    }
    let updated: Listing[];
    if (isNewListing) {
      const newItem: Listing = {
        ...form,
        id: `listing-${Date.now()}`,
        createdAt: Date.now(),
      };
      updated = [newItem, ...listings];
      toast.success("Listing added");
    } else if (editListing) {
      updated = listings.map((l) =>
        l.id === editListing.id ? { ...l, ...form } : l,
      );
      toast.success("Listing updated");
    } else {
      return;
    }
    onListingsChange(updated);
    saveListings(updated);
    setIsNewListing(false);
    setEditListing(null);
  };

  const handleDelete = (id: string) => {
    const updated = listings.filter((l) => l.id !== id);
    onListingsChange(updated);
    saveListings(updated);
    setDeleteId(null);
    toast.success("Listing removed");
  };

  const toggleSold = (id: string) => {
    const updated = listings.map((l) =>
      l.id === id ? { ...l, sold: !l.sold } : l,
    );
    onListingsChange(updated);
    saveListings(updated);
  };

  const markRead = (id: string) => {
    const updated = inquiries.map((i) =>
      i.id === id ? { ...i, isRead: true } : i,
    );
    onInquiriesChange(updated);
    saveInquiries(updated);
  };

  const unreadCount = inquiries.filter((i) => !i.isRead).length;

  const isDialogOpen = isNewListing || editListing !== null;

  return (
    <div className="min-h-screen bg-parchment-dark">
      {/* Admin Header */}
      <header className="bg-sepia-dark text-gold-light border-b border-gold/30 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Lock className="h-5 w-5 text-gold" />
            <span className="font-display text-lg font-semibold">
              Admin Panel — Imperial Numismatics
            </span>
          </div>
          <Button
            data-ocid="admin.logout_button"
            variant="outline"
            size="sm"
            onClick={onLogout}
            className="border-gold/40 text-gold-light hover:bg-gold/10 font-body"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Log Out
          </Button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <Tabs defaultValue="listings" data-ocid="admin.tab">
          <TabsList className="mb-6 bg-card border border-border">
            <TabsTrigger
              value="listings"
              data-ocid="admin.listings.tab"
              className="font-body"
            >
              Listings ({listings.length})
            </TabsTrigger>
            <TabsTrigger
              value="inquiries"
              data-ocid="admin.inquiries.tab"
              className="font-body"
            >
              Inquiries
              {unreadCount > 0 && (
                <Badge className="ml-2 bg-gold text-sepia-dark text-xs">
                  {unreadCount}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          {/* ── Listings Tab ── */}
          <TabsContent value="listings">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-display text-xl font-semibold">
                Manage Listings
              </h2>
              <Button
                data-ocid="admin.listing.open_modal_button"
                onClick={openAdd}
                className="bg-gold-deep hover:bg-gold text-parchment font-body"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Listing
              </Button>
            </div>

            {listings.length === 0 ? (
              <div
                data-ocid="admin.listing.empty_state"
                className="text-center py-16 text-muted-foreground font-body"
              >
                No listings yet. Add your first one!
              </div>
            ) : (
              <div className="bg-card border border-border rounded-lg overflow-hidden shadow-antique">
                <div className="overflow-x-auto">
                  <Table data-ocid="admin.listing.table">
                    <TableHeader>
                      <TableRow className="bg-parchment-dark">
                        <TableHead className="font-body font-semibold">
                          Title
                        </TableHead>
                        <TableHead className="font-body font-semibold">
                          Category
                        </TableHead>
                        <TableHead className="font-body font-semibold">
                          Price
                        </TableHead>
                        <TableHead className="font-body font-semibold">
                          Condition
                        </TableHead>
                        <TableHead className="font-body font-semibold">
                          Sold
                        </TableHead>
                        <TableHead className="font-body font-semibold text-right">
                          Actions
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {listings.map((listing, idx) => (
                        <TableRow
                          key={listing.id}
                          data-ocid={`admin.listing.row.${idx + 1}`}
                          className="hover:bg-parchment/50"
                        >
                          <TableCell className="font-body font-medium max-w-[200px] truncate">
                            {listing.title}
                          </TableCell>
                          <TableCell className="font-body text-sm text-muted-foreground">
                            {listing.category}
                          </TableCell>
                          <TableCell className="font-display font-semibold text-gold-deep">
                            {listing.price}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={conditionVariant(listing.condition)}
                              className="text-xs"
                            >
                              {listing.condition}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Switch
                              data-ocid={`admin.listing.switch.${idx + 1}`}
                              checked={listing.sold}
                              onCheckedChange={() => toggleSold(listing.id)}
                            />
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                data-ocid={`admin.listing.edit_button.${idx + 1}`}
                                variant="ghost"
                                size="icon"
                                onClick={() => openEdit(listing)}
                                className="h-8 w-8 hover:bg-gold/10"
                              >
                                <Pencil className="h-3.5 w-3.5" />
                              </Button>
                              <Button
                                data-ocid={`admin.listing.delete_button.${idx + 1}`}
                                variant="ghost"
                                size="icon"
                                onClick={() => setDeleteId(listing.id)}
                                className="h-8 w-8 hover:bg-destructive/10 text-destructive"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}
          </TabsContent>

          {/* ── Inquiries Tab ── */}
          <TabsContent value="inquiries">
            <h2 className="font-display text-xl font-semibold mb-4">
              Customer Inquiries
            </h2>

            {inquiries.length === 0 ? (
              <div
                data-ocid="admin.inquiry.empty_state"
                className="text-center py-16 text-muted-foreground font-body"
              >
                No inquiries yet.
              </div>
            ) : (
              <div className="bg-card border border-border rounded-lg overflow-hidden shadow-antique">
                <div className="overflow-x-auto">
                  <Table data-ocid="admin.inquiry.table">
                    <TableHeader>
                      <TableRow className="bg-parchment-dark">
                        <TableHead className="font-body font-semibold">
                          Status
                        </TableHead>
                        <TableHead className="font-body font-semibold">
                          Name
                        </TableHead>
                        <TableHead className="font-body font-semibold">
                          Email
                        </TableHead>
                        <TableHead className="font-body font-semibold">
                          Regarding
                        </TableHead>
                        <TableHead className="font-body font-semibold">
                          Message
                        </TableHead>
                        <TableHead className="font-body font-semibold">
                          Date
                        </TableHead>
                        <TableHead className="font-body font-semibold">
                          Action
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {inquiries
                        .slice()
                        .sort((a, b) => b.createdAt - a.createdAt)
                        .map((inq, idx) => (
                          <TableRow
                            key={inq.id}
                            data-ocid={`admin.inquiry.row.${idx + 1}`}
                            className={
                              !inq.isRead
                                ? "bg-gold/5 hover:bg-gold/10"
                                : "hover:bg-parchment/50"
                            }
                          >
                            <TableCell>
                              {inq.isRead ? (
                                <CheckCircle className="h-4 w-4 text-muted-foreground" />
                              ) : (
                                <Circle className="h-4 w-4 text-gold fill-gold" />
                              )}
                            </TableCell>
                            <TableCell className="font-body font-medium">
                              {inq.name}
                            </TableCell>
                            <TableCell className="font-body text-sm text-muted-foreground">
                              {inq.email}
                            </TableCell>
                            <TableCell className="font-body text-sm max-w-[150px] truncate">
                              {inq.listingTitle || "General"}
                            </TableCell>
                            <TableCell className="font-body text-sm max-w-[200px] truncate text-muted-foreground">
                              {inq.message}
                            </TableCell>
                            <TableCell className="font-body text-sm text-muted-foreground whitespace-nowrap">
                              {formatDate(inq.createdAt)}
                            </TableCell>
                            <TableCell>
                              {!inq.isRead && (
                                <Button
                                  data-ocid={`admin.inquiry.button.${idx + 1}`}
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => markRead(inq.id)}
                                  className="text-xs font-body hover:bg-gold/10"
                                >
                                  Mark Read
                                </Button>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* ── Add/Edit Dialog ── */}
      <Dialog
        open={isDialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            setIsNewListing(false);
            setEditListing(null);
          }
        }}
      >
        <DialogContent
          data-ocid="admin.listing.dialog"
          className="max-w-xl max-h-[90vh] overflow-y-auto bg-card border-border"
        >
          <DialogHeader>
            <DialogTitle className="font-display">
              {isNewListing ? "Add New Listing" : "Edit Listing"}
            </DialogTitle>
            <DialogDescription className="font-body text-muted-foreground">
              {isNewListing
                ? "Fill in the details for your new item."
                : "Update the listing details below."}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label className="font-body">Title *</Label>
              <Input
                data-ocid="admin.listing.input"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="e.g. George V One Rupee 1917"
                className="font-body"
              />
            </div>

            <div className="grid gap-2">
              <Label className="font-body">Description</Label>
              <Textarea
                data-ocid="admin.listing.textarea"
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                placeholder="Describe the coin or note..."
                className="font-body min-h-[80px]"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label className="font-body">Era / Date</Label>
                <Input
                  value={form.era}
                  onChange={(e) => setForm({ ...form, era: e.target.value })}
                  placeholder="e.g. 1917, George V"
                  className="font-body"
                />
              </div>
              <div className="grid gap-2">
                <Label className="font-body">Price *</Label>
                <Input
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  placeholder="e.g. £45"
                  className="font-body"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label className="font-body">Condition</Label>
                <Select
                  value={form.condition}
                  onValueChange={(v) => setForm({ ...form, condition: v })}
                >
                  <SelectTrigger
                    data-ocid="admin.listing.select"
                    className="font-body"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CONDITIONS.map((c) => (
                      <SelectItem key={c} value={c} className="font-body">
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label className="font-body">Category</Label>
                <Select
                  value={form.category}
                  onValueChange={(v) => setForm({ ...form, category: v })}
                >
                  <SelectTrigger className="font-body">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((c) => (
                      <SelectItem key={c} value={c} className="font-body">
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-2">
              <Label className="font-body">Image URL (optional)</Label>
              <Input
                value={form.imageUrl}
                onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                placeholder="https://..."
                className="font-body"
              />
            </div>

            <div className="flex items-center gap-3">
              <Switch
                checked={form.sold}
                onCheckedChange={(v) => setForm({ ...form, sold: v })}
              />
              <Label className="font-body">Mark as Sold</Label>
            </div>
          </div>

          <DialogFooter>
            <Button
              data-ocid="admin.listing.cancel_button"
              variant="outline"
              onClick={() => {
                setIsNewListing(false);
                setEditListing(null);
              }}
              className="font-body"
            >
              Cancel
            </Button>
            <Button
              data-ocid="admin.listing.save_button"
              onClick={handleSave}
              className="bg-gold-deep hover:bg-gold text-parchment font-body"
            >
              {isNewListing ? "Add Listing" : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Delete Confirm ── */}
      <AlertDialog
        open={deleteId !== null}
        onOpenChange={(open) => !open && setDeleteId(null)}
      >
        <AlertDialogContent
          data-ocid="admin.listing.delete.dialog"
          className="bg-card"
        >
          <AlertDialogHeader>
            <AlertDialogTitle className="font-display">
              Remove Listing?
            </AlertDialogTitle>
            <AlertDialogDescription className="font-body">
              This action cannot be undone. The listing will be permanently
              removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              data-ocid="admin.listing.delete.cancel_button"
              className="font-body"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              data-ocid="admin.listing.delete.confirm_button"
              onClick={() => deleteId && handleDelete(deleteId)}
              className="bg-destructive text-destructive-foreground font-body"
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────────

export default function App() {
  const { identity, login, clear, isLoggingIn, isInitializing } =
    useInternetIdentity();

  const [listings, setListings] = useState<Listing[]>(loadListings);
  const [inquiries, setInquiries] = useState<Inquiry[]>(loadInquiries);
  const [activeCategory, setActiveCategory] = useState("All");
  const [inquiryListing, setInquiryListing] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [inquiryForm, setInquiryForm] = useState({
    name: "",
    email: "",
    message: "",
    listingTitle: "",
  });

  const collectionRef = useRef<HTMLDivElement>(null);
  const aboutRef = useRef<HTMLDivElement>(null);
  const inquiryRef = useRef<HTMLDivElement>(null);

  // Pre-fill listing title from card click
  useEffect(() => {
    if (inquiryListing) {
      setInquiryForm((prev) => ({ ...prev, listingTitle: inquiryListing }));
      inquiryRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [inquiryListing]);

  const scrollTo = (ref: React.RefObject<HTMLDivElement | null>) => {
    ref.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    setMobileMenuOpen(false);
  };

  const filteredListings =
    activeCategory === "All"
      ? listings
      : listings.filter((l) => l.category === activeCategory);

  const handleInquirySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !inquiryForm.name.trim() ||
      !inquiryForm.email.trim() ||
      !inquiryForm.message.trim()
    ) {
      toast.error("Please fill in all required fields");
      return;
    }
    const newInquiry: Inquiry = {
      id: `inq-${Date.now()}`,
      name: inquiryForm.name,
      email: inquiryForm.email,
      message: inquiryForm.message,
      listingTitle: inquiryForm.listingTitle,
      createdAt: Date.now(),
      isRead: false,
    };
    const updated = [newInquiry, ...inquiries];
    setInquiries(updated);
    saveInquiries(updated);
    setInquiryForm({ name: "", email: "", message: "", listingTitle: "" });
    setInquiryListing("");
    toast.success("Inquiry submitted! We'll be in touch within 24–48 hours.");
  };

  // Admin panel view
  if (identity) {
    return (
      <>
        <AdminPanel
          listings={listings}
          inquiries={inquiries}
          onListingsChange={setListings}
          onInquiriesChange={setInquiries}
          onLogout={clear}
        />
        <Toaster richColors />
      </>
    );
  }

  // Public storefront
  return (
    <div className="min-h-screen bg-background font-body">
      <Toaster richColors />

      {/* ── Navbar ── */}
      <header className="sticky top-0 z-50 bg-sepia-dark/95 backdrop-blur-md border-b border-gold/20 shadow-sm">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <Coins className="h-6 w-6 text-gold" />
            <span className="font-display text-lg font-bold text-gold-light tracking-wide">
              Imperial Numismatics
            </span>
          </div>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-6">
            <button
              type="button"
              data-ocid="nav.collection.link"
              onClick={() => scrollTo(collectionRef)}
              className="font-body text-sm text-gold-light/80 hover:text-gold transition-colors"
            >
              Collection
            </button>
            <button
              type="button"
              data-ocid="nav.about.link"
              onClick={() => scrollTo(aboutRef)}
              className="font-body text-sm text-gold-light/80 hover:text-gold transition-colors"
            >
              About
            </button>
            <button
              type="button"
              data-ocid="nav.contact.link"
              onClick={() => scrollTo(inquiryRef)}
              className="font-body text-sm text-gold-light/80 hover:text-gold transition-colors"
            >
              Contact
            </button>
            <Button
              data-ocid="nav.login.button"
              size="sm"
              onClick={login}
              disabled={isLoggingIn || isInitializing}
              variant="outline"
              className="border-gold/50 text-gold-light hover:bg-gold/15 hover:border-gold font-body text-xs"
            >
              {isLoggingIn ? "Signing in…" : "Admin Login"}
            </Button>
          </div>

          {/* Mobile menu button */}
          <button
            type="button"
            data-ocid="nav.menu.toggle"
            className="md:hidden text-gold-light p-1"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </nav>

        {/* Mobile menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="md:hidden bg-sepia-dark border-t border-gold/15 overflow-hidden"
            >
              <div className="px-4 py-4 flex flex-col gap-3">
                <button
                  type="button"
                  data-ocid="nav.mobile.collection.link"
                  onClick={() => scrollTo(collectionRef)}
                  className="font-body text-sm text-gold-light/80 hover:text-gold text-left py-1"
                >
                  Collection
                </button>
                <button
                  type="button"
                  data-ocid="nav.mobile.about.link"
                  onClick={() => scrollTo(aboutRef)}
                  className="font-body text-sm text-gold-light/80 hover:text-gold text-left py-1"
                >
                  About
                </button>
                <button
                  type="button"
                  data-ocid="nav.mobile.contact.link"
                  onClick={() => scrollTo(inquiryRef)}
                  className="font-body text-sm text-gold-light/80 hover:text-gold text-left py-1"
                >
                  Contact
                </button>
                <Button
                  data-ocid="nav.mobile.login.button"
                  size="sm"
                  onClick={login}
                  disabled={isLoggingIn || isInitializing}
                  variant="outline"
                  className="border-gold/50 text-gold-light hover:bg-gold/15 font-body text-xs w-fit"
                >
                  Admin Login
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* ── Hero ── */}
      <section className="relative overflow-hidden min-h-[560px] md:min-h-[640px] flex items-center">
        {/* Background image */}
        <div className="absolute inset-0">
          <img
            src="/assets/generated/hero-coins-british-india.dim_1400x600.jpg"
            alt="British India coin collection"
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-sepia-dark/90 via-sepia-dark/70 to-sepia-dark/40" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-sepia-dark/60" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 py-20 md:py-28">
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="max-w-xl"
          >
            <div className="flex items-center gap-2 mb-4">
              <div className="h-px w-8 bg-gold" />
              <span className="font-body text-xs tracking-[0.2em] uppercase text-gold">
                Est. in the Tradition of Excellence
              </span>
            </div>

            <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-bold text-gold-light leading-tight mb-4">
              Imperial
              <br />
              <span className="italic text-gold">Numismatics</span>
            </h1>

            <p className="font-body text-lg text-gold-light/80 mb-2">
              Rare British India &amp; World Currencies
            </p>
            <p className="font-body text-sm text-gold-light/60 mb-8 max-w-sm">
              Curated coins and banknotes from the golden age of the British
              Empire — each piece authenticated and described with scholarly
              precision.
            </p>

            <div className="flex flex-wrap gap-3">
              <Button
                data-ocid="hero.browse.primary_button"
                onClick={() => scrollTo(collectionRef)}
                className="bg-gold-deep hover:bg-gold text-parchment font-body"
              >
                Browse Collection
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
              <Button
                data-ocid="hero.contact.secondary_button"
                onClick={() => scrollTo(inquiryRef)}
                variant="outline"
                className="border-gold/50 text-gold-light hover:bg-gold/15 font-body"
              >
                Make an Enquiry
              </Button>
            </div>
          </motion.div>

          {/* Trust indicators */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="mt-12 flex flex-wrap gap-6"
          >
            {[
              "100+ Items Catalogued",
              "Authenticity Guaranteed",
              "Worldwide Shipping",
            ].map((item) => (
              <div
                key={item}
                className="flex items-center gap-2 text-gold-light/70"
              >
                <div className="h-1 w-1 rounded-full bg-gold" />
                <span className="font-body text-xs tracking-wide">{item}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Collection ── */}
      <section
        ref={collectionRef}
        id="collection"
        className="py-16 md:py-24 px-4 sm:px-6 max-w-7xl mx-auto"
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <p className="font-body text-xs tracking-[0.2em] uppercase text-gold mb-3">
            Our Catalogue
          </p>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
            Featured Collection
          </h2>
          <div className="ornament-divider max-w-xs mx-auto">
            <Coins className="h-4 w-4 text-gold flex-shrink-0" />
          </div>
        </motion.div>

        {/* Category filters */}
        <div className="flex flex-wrap gap-2 justify-center mb-10">
          {CATEGORY_FILTERS.map((cat) => (
            <button
              type="button"
              key={cat}
              data-ocid="collection.filter.tab"
              onClick={() => setActiveCategory(cat)}
              className={`font-body text-sm px-4 py-2 rounded-sm border transition-all ${
                activeCategory === cat
                  ? "bg-gold-deep text-parchment border-gold-deep"
                  : "bg-card text-muted-foreground border-border hover:border-gold hover:text-foreground"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Grid */}
        {filteredListings.length === 0 ? (
          <div
            data-ocid="collection.empty_state"
            className="text-center py-20 text-muted-foreground font-body"
          >
            <Coins className="h-12 w-12 mx-auto mb-4 text-muted-foreground/40" />
            <p>No items in this category yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredListings.map((listing, i) => (
              <ListingCard
                key={listing.id}
                listing={listing}
                index={i + 1}
                onInquire={(title) => setInquiryListing(title)}
              />
            ))}
          </div>
        )}
      </section>

      <Separator className="max-w-4xl mx-auto" />

      {/* ── About / Trust ── */}
      <section
        ref={aboutRef}
        id="about"
        className="py-16 md:py-24 bg-parchment-dark"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <p className="font-body text-xs tracking-[0.2em] uppercase text-gold mb-3">
              Our Promise
            </p>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
              Why Collectors Trust Us
            </h2>
            <div className="ornament-divider max-w-xs mx-auto">
              <Shield className="h-4 w-4 text-gold flex-shrink-0" />
            </div>
          </motion.div>

          {/* Trust pillars */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {[
              {
                Icon: Shield,
                title: "Authenticity Guaranteed",
                body: "Every coin and banknote in our catalogue is personally examined and authenticated. We provide detailed provenance notes and will refund any item that proves to be other than described.",
              },
              {
                Icon: BookOpen,
                title: "Expert Knowledge",
                body: "With decades of experience specialising in British India and colonial coinage, we offer scholarly descriptions and grading consistent with established numismatic standards.",
              },
              {
                Icon: Lock,
                title: "Secure Transactions",
                body: "All purchases are conducted through secure, insured channels. Items are carefully packaged in archival-quality materials and dispatched with full tracking and insurance.",
              },
            ].map(({ Icon, title, body }, i) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="bg-card border border-border rounded-lg p-6 shadow-antique text-center"
              >
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gold/10 border border-gold/30 mb-4">
                  <Icon className="h-5 w-5 text-gold-deep" />
                </div>
                <h3 className="font-display text-lg font-semibold mb-3">
                  {title}
                </h3>
                <p className="font-body text-sm text-muted-foreground leading-relaxed">
                  {body}
                </p>
              </motion.div>
            ))}
          </div>

          {/* About blurb */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="max-w-2xl mx-auto text-center"
          >
            <p className="font-body text-base text-muted-foreground leading-relaxed">
              Imperial Numismatics has been a trusted name among collectors of
              British Empire coinage for many years. Our particular passion lies
              in the rich numismatic legacy of British India — from the earliest
              East India Company issues through Victoria, Edward VII, George V,
              and the final issues of George VI. We source items with care,
              document them with rigour, and present them to collectors
              worldwide with the honesty and transparency that this fascinating
              field deserves.
            </p>
          </motion.div>
        </div>
      </section>

      <Separator className="max-w-4xl mx-auto" />

      {/* ── Inquiry Form ── */}
      <section
        ref={inquiryRef}
        id="contact"
        className="py-16 md:py-24 px-4 sm:px-6"
      >
        <div className="max-w-xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-10"
          >
            <p className="font-body text-xs tracking-[0.2em] uppercase text-gold mb-3">
              Get in Touch
            </p>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
              Make an Enquiry
            </h2>
            <div className="ornament-divider max-w-xs mx-auto">
              <Mail className="h-4 w-4 text-gold flex-shrink-0" />
            </div>
            <p className="font-body text-sm text-muted-foreground mt-4">
              Interested in a piece? We respond to all genuine enquiries within
              24–48 hours.
            </p>
          </motion.div>

          <motion.form
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            onSubmit={handleInquirySubmit}
            className="bg-card border border-border rounded-lg p-6 sm:p-8 shadow-antique"
          >
            <div className="grid gap-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="inq-name" className="font-body text-sm">
                    Name *
                  </Label>
                  <Input
                    id="inq-name"
                    data-ocid="inquiry.name.input"
                    value={inquiryForm.name}
                    onChange={(e) =>
                      setInquiryForm({ ...inquiryForm, name: e.target.value })
                    }
                    placeholder="Your name"
                    className="font-body"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="inq-email" className="font-body text-sm">
                    Email *
                  </Label>
                  <Input
                    id="inq-email"
                    data-ocid="inquiry.email.input"
                    type="email"
                    value={inquiryForm.email}
                    onChange={(e) =>
                      setInquiryForm({ ...inquiryForm, email: e.target.value })
                    }
                    placeholder="you@example.com"
                    className="font-body"
                    required
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="inq-listing" className="font-body text-sm">
                  Regarding (optional)
                </Label>
                <Input
                  id="inq-listing"
                  data-ocid="inquiry.listing.input"
                  value={inquiryForm.listingTitle}
                  onChange={(e) =>
                    setInquiryForm({
                      ...inquiryForm,
                      listingTitle: e.target.value,
                    })
                  }
                  placeholder="Listing title or general enquiry"
                  className="font-body"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="inq-message" className="font-body text-sm">
                  Message *
                </Label>
                <Textarea
                  id="inq-message"
                  data-ocid="inquiry.message.textarea"
                  value={inquiryForm.message}
                  onChange={(e) =>
                    setInquiryForm({
                      ...inquiryForm,
                      message: e.target.value,
                    })
                  }
                  placeholder="Please describe your interest, any questions about condition, or specific requirements..."
                  className="font-body min-h-[120px]"
                  required
                />
              </div>

              <Button
                data-ocid="inquiry.submit_button"
                type="submit"
                className="w-full bg-gold-deep hover:bg-gold text-parchment font-body"
              >
                <Mail className="mr-2 h-4 w-4" />
                Send Enquiry
              </Button>
            </div>
          </motion.form>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-sepia-dark border-t border-gold/20 py-8 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Coins className="h-5 w-5 text-gold" />
              <span className="font-display text-sm font-semibold text-gold-light">
                Imperial Numismatics
              </span>
            </div>

            <p className="font-body text-xs text-gold-light/50 text-center">
              Rare British India &amp; World Currencies
            </p>

            <p className="font-body text-xs text-gold-light/50">
              © {new Date().getFullYear()}. Built with love using{" "}
              <a
                href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-gold transition-colors"
              >
                caffeine.ai
              </a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
