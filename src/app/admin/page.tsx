"use client";

import { Fragment, useEffect, useMemo, useState } from "react";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  updateDoc,
} from "firebase/firestore";
import { ChevronDown, Inbox, Lock, RefreshCcw, Search } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import GoogleIcon from "@/components/GoogleIcon";
import EmptyState from "@/components/EmptyState";
import StatusBadge, { paymentLabel, statusLabels } from "@/components/StatusBadge";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { formatINR } from "@/lib/format";
import { orderStatuses, type Order, type OrderStatus } from "@/types/order";

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
  const [loadError, setLoadError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
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
    setLoadError(null);
    try {
      const snapshot = await getDocs(
        query(collection(db, "orders"), orderBy("createdAt", "desc"))
      );
      setOrders(
        snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as Order)
      );
    } catch {
      setLoadError("Couldn't load orders. Check your connection and try again.");
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
    const previous = orders.find((o) => o.id === orderId)?.status;
    setActionError(null);
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status } : o))
    );
    try {
      await updateDoc(doc(db, "orders", orderId), { status });
    } catch {
      // Roll back the optimistic update so the table reflects what's saved.
      setOrders((prev) =>
        prev.map((o) =>
          o.id === orderId && previous ? { ...o, status: previous } : o
        )
      );
      setActionError("Couldn't update the order status. Please try again.");
    }
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

  const hasFilters = search !== "" || statusFilter !== "all" || dateFilter !== "all";
  const clearFilters = () => {
    setSearch("");
    setStatusFilter("all");
    setDateFilter("all");
  };

  if (authLoading || checkingAccess) {
    return (
      <AdminShell>
        <div aria-busy="true" aria-live="polite" className="flex flex-col gap-4">
          <span className="sr-only">Checking access…</span>
          <div className="skeleton h-10 w-48" />
          <div className="skeleton h-24" />
          <div className="skeleton h-64" />
        </div>
      </AdminShell>
    );
  }

  if (!user) {
    return (
      <AdminShell>
        <EmptyState
          icon={<Lock size={22} strokeWidth={1.75} />}
          headingLevel="h1"
          title="Admin sign-in required"
          description="Sign in with the Google account that has admin access."
          action={
            <button onClick={signInWithGoogle} className="btn btn-primary">
              <GoogleIcon size={16} />
              Continue with Google
            </button>
          }
        />
      </AdminShell>
    );
  }

  if (!isAdmin) {
    return (
      <AdminShell>
        <EmptyState
          tone="danger"
          icon={<Lock size={22} strokeWidth={1.75} />}
          headingLevel="h1"
          title="You don't have access"
          description={`${user.email} isn't on the admin list for Prime Bookin. Ask an existing admin to add you.`}
        />
      </AdminShell>
    );
  }

  return (
    <AdminShell>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="page-title">Orders</h1>
          <p className="mt-1 text-sm text-muted">
            Manage incoming orders and update their status.
          </p>
        </div>
        <button
          onClick={loadOrders}
          disabled={loadingOrders}
          className="btn btn-secondary"
        >
          <RefreshCcw
            size={14}
            aria-hidden="true"
            className={loadingOrders ? "animate-spin" : ""}
          />
          {loadingOrders ? "Refreshing…" : "Refresh"}
        </button>
      </div>

      <dl className="mt-6 grid grid-cols-2 gap-px overflow-hidden rounded-[var(--radius-card)] border border-border bg-border sm:grid-cols-4">
        <Stat label="Revenue" value={formatINR(stats.revenue)} hint="Excl. cancelled" />
        <Stat label="Orders" value={String(stats.totalOrders)} />
        <Stat label="Customers" value={String(stats.uniqueUsers)} />
        <Stat label="Orders today" value={String(stats.todayCount)} />
      </dl>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search
            size={15}
            aria-hidden="true"
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted"
          />
          <input
            type="search"
            aria-label="Search orders by customer, email or store"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search customer, email or store"
            className="input pl-9"
          />
        </div>
        <div className="flex gap-3">
          <select
            aria-label="Filter by order status"
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value as OrderStatus | "all")
            }
            className="input w-auto flex-1 sm:flex-none"
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
            className="input w-auto flex-1 sm:flex-none"
          >
            <option value="all">All time</option>
            <option value="today">Today</option>
          </select>
        </div>
      </div>

      {(loadError || actionError) && (
        <p role="alert" className="alert-error mt-4">
          {loadError ?? actionError}
        </p>
      )}

      <div className="mt-4">
        {loadingOrders && orders.length === 0 ? (
          <div aria-busy="true" className="skeleton h-64" />
        ) : orders.length === 0 && !loadError ? (
          <EmptyState
            icon={<Inbox size={20} />}
            title="No orders yet"
            description="New orders will appear here as soon as customers check out."
          />
        ) : filteredOrders.length === 0 && orders.length > 0 ? (
          <EmptyState
            icon={<Search size={20} />}
            title="No matching orders"
            description="Try a different search term or filter."
            action={
              hasFilters && (
                <button onClick={clearFilters} className="btn btn-secondary">
                  Clear filters
                </button>
              )
            }
          />
        ) : filteredOrders.length > 0 ? (
          <div className="panel overflow-hidden">
            <p className="border-b border-border px-4 py-2.5 text-xs text-muted">
              Showing {filteredOrders.length} of {orders.length} orders
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-border bg-subtle/50 text-xs text-muted">
                  <tr>
                    <th scope="col" className="px-4 py-2.5 font-medium">Customer</th>
                    <th scope="col" className="hidden px-4 py-2.5 font-medium md:table-cell">Stores</th>
                    <th scope="col" className="hidden px-4 py-2.5 font-medium sm:table-cell">Placed</th>
                    <th scope="col" className="px-4 py-2.5 text-right font-medium">Total</th>
                    <th scope="col" className="px-4 py-2.5 font-medium">Status</th>
                    <th scope="col" className="w-10 px-2 py-2.5">
                      <span className="sr-only">Details</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredOrders.map((order) => {
                    const expanded = expandedId === order.id;
                    return (
                      <Fragment key={order.id}>
                        <tr
                          className={`cursor-pointer hover:bg-subtle/50 ${expanded ? "bg-subtle/50" : ""}`}
                          onClick={() => setExpandedId(expanded ? null : order.id)}
                        >
                          <td className="px-4 py-3 align-top">
                            <p className="font-medium">{order.userName || "Unknown"}</p>
                            <p className="max-w-[16rem] truncate text-xs text-muted">
                              {order.userEmail}
                            </p>
                          </td>
                          <td className="hidden max-w-[16rem] truncate px-4 py-3 align-top text-muted md:table-cell">
                            {order.storeGroups.map((g) => g.storeName).join(", ")}
                          </td>
                          <td className="hidden whitespace-nowrap px-4 py-3 align-top text-muted sm:table-cell">
                            {formatDate(order)}
                          </td>
                          <td className="whitespace-nowrap px-4 py-3 text-right align-top font-medium tabular-nums">
                            {formatINR(order.grandTotal)}
                          </td>
                          <td className="px-4 py-3 align-top">
                            <StatusBadge status={order.status} />
                          </td>
                          <td className="px-2 py-2 align-top">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setExpandedId(expanded ? null : order.id);
                              }}
                              aria-expanded={expanded}
                              aria-controls={`order-${order.id}`}
                              aria-label={`${expanded ? "Hide" : "Show"} details for ${order.userName || "order"}`}
                              className="btn btn-icon btn-ghost h-8 w-8"
                            >
                              <ChevronDown
                                size={16}
                                aria-hidden="true"
                                className={`transition-transform ${expanded ? "rotate-180" : ""}`}
                              />
                            </button>
                          </td>
                        </tr>
                        {expanded && (
                          <tr id={`order-${order.id}`} className="bg-subtle/30">
                            <td colSpan={6} className="px-4 py-5">
                              <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                                <div className="md:col-span-2">
                                  <h3 className="eyebrow">Items</h3>
                                  <ul className="mt-2 flex flex-col gap-1.5">
                                    {order.items.map((item) => (
                                      <li key={item.id} className="flex justify-between gap-4">
                                        <span>
                                          {item.name}{" "}
                                          <span className="text-muted">
                                            × {item.quantity} · {item.storeName}
                                          </span>
                                        </span>
                                        <span className="tabular-nums">
                                          {formatINR(item.price * item.quantity)}
                                        </span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                                <div className="flex flex-col gap-4">
                                  <div>
                                    <h3 className="eyebrow">Delivery</h3>
                                    <p className="mt-2">
                                      {order.address.line}, {order.address.city}{" "}
                                      {order.address.pincode}
                                    </p>
                                    <p className="text-muted">{order.userPhone}</p>
                                    <p className="text-muted sm:hidden">{formatDate(order)}</p>
                                    <p className="mt-1 text-muted">
                                      {paymentLabel(order.paymentMethod)}
                                    </p>
                                  </div>
                                  <div className="flex flex-col gap-1.5">
                                    <label
                                      htmlFor={`status-${order.id}`}
                                      className="eyebrow"
                                    >
                                      Update status
                                    </label>
                                    <select
                                      id={`status-${order.id}`}
                                      value={order.status}
                                      onChange={(e) =>
                                        handleStatusChange(
                                          order.id,
                                          e.target.value as OrderStatus
                                        )
                                      }
                                      className="input"
                                    >
                                      {orderStatuses.map((s) => (
                                        <option key={s} value={s}>
                                          {statusLabels[s]}
                                        </option>
                                      ))}
                                    </select>
                                  </div>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : null}
      </div>
    </AdminShell>
  );
}

function AdminShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <main id="main" className="flex-1 py-8 sm:py-10">
        <div className="container-page">{children}</div>
      </main>
      <Footer />
    </>
  );
}

function Stat({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="bg-surface p-4 sm:p-5">
      <dt className="text-xs font-medium text-muted">{label}</dt>
      <dd className="mt-1 text-xl font-semibold tabular-nums sm:text-2xl">{value}</dd>
      {hint && <dd className="mt-0.5 text-xs text-muted">{hint}</dd>}
    </div>
  );
}
