import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { finalPrice, type MenuItem } from "./menu";

type Line = { item: MenuItem; qty: number };
type Ctx = {
  lines: Line[];
  add: (item: MenuItem) => void;
  setQty: (id: string, qty: number) => void;
  count: number;
  subtotal: number;
  open: boolean;
  setOpen: (o: boolean) => void;
  clear: () => void;
};
const CartCtx = createContext<Ctx | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<Line[]>([]);
  const [open, setOpen] = useState(false);
  const value = useMemo<Ctx>(() => {
    const add = (item: MenuItem) =>
      setLines((ls) => {
        const ex = ls.find((l) => l.item.id === item.id);
        return ex ? ls.map((l) => (l.item.id === item.id ? { ...l, qty: l.qty + 1 } : l)) : [...ls, { item, qty: 1 }];
      });
    const setQty = (id: string, qty: number) =>
      setLines((ls) => (qty <= 0 ? ls.filter((l) => l.item.id !== id) : ls.map((l) => (l.item.id === id ? { ...l, qty } : l))));
    return {
      lines, add, setQty, open, setOpen, clear: () => setLines([]),
      count: lines.reduce((s, l) => s + l.qty, 0),
      subtotal: lines.reduce((s, l) => s + l.qty * finalPrice(l.item), 0),
    };
  }, [lines, open]);
  return <CartCtx.Provider value={value}>{children}</CartCtx.Provider>;
}

export function useCart() {
  const c = useContext(CartCtx);
  if (!c) throw new Error("useCart outside provider");
  return c;
}
