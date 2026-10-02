"use client";

import { useEffect, useMemo, useState } from "react";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  updateDoc,
} from "firebase/firestore";
import {
  ChevronDown,
  IndianRupee,
  Lock,
  Package,
  RefreshCcw,
  Search,
  Users,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import GoogleIcon from "@/components/GoogleIcon";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { orderStatuses, type Order, type OrderStatus } from "@/types/order";

const statusStyles: Record<OrderStatus, string> = {
  placed: "bg-sky-500/10 text-sky-600",
  confirmed: "bg-amber-500/10 text-amber-600",
  out_for_delivery: "bg-violet-500/10 text-violet-600",
  delivered: "bg-emerald-500/10 text-emerald-600",
  cancelled: "bg-red-500/10 text-red-600",
};

const statusLabels: Record<OrderStatus, string> = {
  placed: "Placed",
  confirmed: "Confirmed",
  out_for_delivery: "Out for delivery",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

function formatDate(order: Order) {
  if (!order.createdAt) return "Just now";
  return order.createdAt.toDate().toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function isToday(order: Order) {
  if (!order.createdAt) return true;
  const created = order.createdAt.toDate();
  const now = new Date();
  return (
    created.getDate() === now.getDate() &&
    created.getMonth() === now.getMonth() &&
    created.getFullYear() === now.getFullYear()
  );
}

export default function AdminPage() {
  const { user, loading: authLoading, signInWithGoogle } = useAuth();

  const [checkingAccess, setCheckingAccess] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "all">("all");
  const [dateFilter, setDateFilter] = useState<"all" | "today">("all");

  useEffect(() => {
    async function checkAccess() {
      if (!user || !db) {
        setCheckingAccess(false);
        return;
      }
      setCheckingAccess(true);
      try {
        const snapshot = await getDoc(doc(db, "admins", user.uid));
        setIsAdmin(snapshot.exists());
      } catch {
        setIsAdmin(false);
      } finally {
        setCheckingAccess(false);
      }
    }
    checkAccess();
  }, [user]);

  const loadOrders = async () => {
    if (!db) return;
    setLoadingOrders(true);
    try {
      const snapshot = await getDocs(
        query(collection(db, "orders"), orderBy("createdAt", "desc"))
      );
      setOrders(
        snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as Order)
      );
    } finally {
      setLoadingOrders(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial fetch on admin access being confirmed
    if (isAdmin) loadOrders();
  }, [isAdmin]);

  const handleStatusChange = async (orderId: string, status: OrderStatus) => {
    if (!db) return;
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status } : o))
    );
    await updateDoc(doc(db, "orders", orderId), { status });
  };

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      if (statusFilter !== "all" && order.status !== statusFilter) return false;
      if (dateFilter === "today" && !isToday(order)) return false;
      if (search) {
        const q = search.toLowerCase();
        const haystack = [
          order.userName,
          order.userEmail ?? "",
          ...order.storeGroups.map((g) => g.storeName),
        ]
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [orders, statusFilter, dateFilter, search]);

  const stats = useMemo(() => {
    const activeOrders = orders.filter((o) => o.status !== "cancelled");
    const revenue = activeOrders.reduce((sum, o) => sum + o.grandTotal, 0);
    const uniqueUsers = new Set(orders.map((o) => o.userId)).size;
    const todayCount = orders.filter(isToday).length;
    return { revenue, totalOrders: orders.length, uniqueUsers, todayCount };
  }, [orders]);

  if (authLoading || checkingAccess) {
    return (
      <>
        <Navbar />
        <main className="flex-1 px-4 py-16 text-center text-muted">
          Loading…
        </main>
        <Footer />
      </>
    );
  }

  if (!user) {
    return (
      <>
        <Navbar />
        <main className="flex-1 px-4 py-16">
          <div className="card-flat mx-auto flex max-w-md flex-col items-center gap-4 rounded-2xl p-10 text-center shadow-sm">
            <Lock size={32} className="text-accent" />
            <p className="text-muted">
              Sign in with the Google account that has admin access.
            </p>
            <button
              onClick={signInWithGoogle}
              className="flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-white hover:bg-accent/90"
            >
              <GoogleIcon size={16} />
              Continue with Google
            </button>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  if (!isAdmin) {
    return (
      <>
        <Navbar />
        <main className="flex-1 px-4 py-16">
          <div className="card-flat mx-auto flex max-w-md flex-col items-center gap-3 rounded-2xl p-10 text-center shadow-sm">
            <Lock size={32} className="text-accent" />
            <p className="font-semibold">Not authorized</p>
            <p className="text-sm text-muted">
              {user.email} isn&apos;t on the admin list for Prime Bookin.
            </p>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="flex-1 px-4 py-10">
        <div className="mx-auto max-w-6xl">
          <div className="flex items-center justify-between">
            <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
              Admin dashboard
            </h1>
            <button
              onClick={loadOrders}
              disabled={loadingOrders}
              className="flex items-center gap-2 rounded-full border border-surface-border px-4 py-2 text-sm font-medium hover:bg-surface-border disabled:opacity-60"
            >
              <RefreshCcw size={14} className={loadingOrders ? "animate-spin" : ""} />
              Refresh
            </button>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <StatCard
              icon={<IndianRupee size={16} />}
              label="Revenue"
              value={`₹${stats.revenue}`}
            />
            <StatCard
              icon={<Package size={16} />}
              label="Total orders"
              value={String(stats.totalOrders)}
            />
            <StatCard
              icon={<Users size={16} />}
              label="Active users"
              value={String(stats.uniqueUsers)}
            />
            <StatCard
              icon={<Package size={16} />}
              label="Orders today"
              value={String(stats.todayCount)}
            />
          </div>

          <div className="card-flat mt-6 flex flex-col gap-3 rounded-2xl p-4 shadow-sm sm:flex-row sm:items-center">
            <div className="flex flex-1 items-center gap-2 rounded-xl border border-surface-border px-3 py-2">
              <Search size={15} className="text-muted" aria-hidden="true" />
              <input
                aria-label="Search orders by customer, email or store"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search customer, email or store…"
                className="w-full bg-transparent text-sm outline-none"
              />
            </div>
            <select
              aria-label="Filter by order status"
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value as OrderStatus | "all")
              }
              className="rounded-xl border border-surface-border px-3 py-2 text-sm outline-none"
            >
              <option value="all">All statuses</option>
              {orderStatuses.map((s) => (
                <option key={s} value={s}>
                  {statusLabels[s]}
                </option>
              ))}
            </select>
            <select
              aria-label="Filter by date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value as "all" | "today")}
              className="rounded-xl border border-surface-border px-3 py-2 text-sm outline-none"
            >
              <option value="all">All time</option>
              <option value="today">Today</option>
            </select>
          </div>

          <div className="mt-4 flex flex-col gap-3">
            {loadingOrders && (
              <p className="py-8 text-center text-muted">Loading orders…</p>
            )}

            {!loadingOrders && filteredOrders.length === 0 && (
              <p className="py-8 text-center text-muted">No orders match.</p>
            )}

            {!loadingOrders &&
              filteredOrders.map((order) => (
                <div
                  key={order.id}
                  className="card-flat rounded-2xl p-4 shadow-sm"
                >
                  <button
                    onClick={() =>
                      setExpandedId(expandedId === order.id ? null : order.id)
                    }
                    className="flex w-full flex-col items-start gap-2 text-left sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <p className="text-sm font-semibold">
                        {order.userName || "Unknown"}{" "}
                        <span className="font-normal text-muted">
                          · {order.userEmail}
                        </span>
                      </p>
                      <p className="text-xs text-muted">
                        {order.storeGroups.map((g) => g.storeName).join(", ")}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-xs text-muted">
                        {formatDate(order)}
                      </span>
                      <span className="font-display text-sm font-bold">
                        ₹{order.grandTotal}
                      </span>
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusStyles[order.status]}`}
                      >
                        {statusLabels[order.status]}
                      </span>
                      <ChevronDown
                        size={16}
                        className={`text-muted transition-transform ${
                          expandedId === order.id ? "rotate-180" : ""
                        }`}
                      />
                    </div>
                  </button>

                  {expandedId === order.id && (
                    <div className="mt-4 grid grid-cols-1 gap-4 border-t border-surface-border pt-4 sm:grid-cols-2">
                      <div>
                        <p className="text-xs font-semibold uppercase text-muted">
                          Items
                        </p>
                        <div className="mt-2 flex flex-col gap-1 text-sm">
                          {order.items.map((item) => (
                            <div
                              key={item.id}
                              className="flex justify-between"
                            >
                              <span>
                                {item.emoji} {item.name} × {item.quantity}
                              </span>
                              <span className="text-muted">
                                ₹{item.price * item.quantity}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <p className="text-xs font-semibold uppercase text-muted">
                          Delivery
                        </p>
                        <p className="mt-2 text-sm">
                          {order.address.line}, {order.address.city} —{" "}
                          {order.address.pincode}
                        </p>
                        <p className="text-sm text-muted">
                          {order.userPhone}
                        </p>
                        <p className="mt-2 text-sm">
                          Payment:{" "}
                          <span className="font-medium">
                            {order.paymentMethod === "cod"
                              ? "Cash on Delivery"
                              : order.paymentMethod}
                          </span>
                        </p>

                        <label className="mt-3 flex items-center gap-2 text-sm">
                          Status:
                          <select
                            value={order.status}
                            onChange={(e) =>
                              handleStatusChange(
                                order.id,
                                e.target.value as OrderStatus
                              )
                            }
                            className="rounded-lg border border-surface-border px-2 py-1 text-sm outline-none"
                          >
                            {orderStatuses.map((s) => (
                              <option key={s} value={s}>
                                {statusLabels[s]}
                              </option>
                            ))}
                          </select>
                        </label>
                      </div>
                    </div>
                  )}
                </div>
              ))}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="card-flat rounded-2xl p-4 shadow-sm">
      <div className="flex items-center gap-2 text-muted">
        {icon}
        <span className="text-xs font-medium">{label}</span>
      </div>
      <p className="font-display mt-2 text-2xl font-bold">{value}</p>
    </div>
  );
}
