"use client";

import Link from "next/link";
import { useState } from "react";
import { ApiState } from "@/components/ApiState";
import { SectionTitle } from "@/components/SectionTitle";
import { useApi } from "@/hooks/useApi";
import { adminService } from "@/services/admin.service";
import { formatCOP } from "@/services/format";
import clsx from "clsx";

function ShoppingBagIcon({ className }: { className?: string }) {
  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line></svg>;
}

function UsersIcon({ className }: { className?: string }) {
  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>;
}

function BoxIcon({ className }: { className?: string }) {
  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>;
}

function PlusIcon({ className }: { className?: string }) {
  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>;
}

function ArrowRightIcon({ className }: { className?: string }) {
  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>;
}

function SlidersIcon({ className }: { className?: string }) {
  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" y1="21" x2="4" y2="14"></line><line x1="4" y1="10" x2="4" y2="3"></line><line x1="12" y1="21" x2="12" y2="12"></line><line x1="12" y1="8" x2="12" y2="3"></line><line x1="20" y1="21" x2="20" y2="16"></line><line x1="20" y1="12" x2="20" y2="3"></line><line x1="1" y1="14" x2="7" y2="14"></line><line x1="9" y1="8" x2="15" y2="8"></line><line x1="17" y1="16" x2="23" y2="16"></line></svg>;
}

function ClockIcon({ className }: { className?: string }) {
  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>;
}

function CheckCircleIcon({ className }: { className?: string }) {
  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>;
}

function AlertTriangleIcon({ className }: { className?: string }) {
  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>;
}

function CreditCardIcon({ className }: { className?: string }) {
  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"></rect><line x1="2" y1="10" x2="22" y2="10"></line></svg>;
}

function BellIcon({ className }: { className?: string }) {
  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>;
}

function MoreVerticalIcon({ className }: { className?: string }) {
  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1"></circle><circle cx="12" cy="5" r="1"></circle><circle cx="12" cy="19" r="1"></circle></svg>;
}

function EditIcon({ className }: { className?: string }) {
  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>;
}

function TrashIcon({ className }: { className?: string }) {
  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>;
}

const recentActivity = [
  { id: 1, type: "order", title: "Nuevo pedido #ORD-2024-001", description: "Juan Pérez - 3 productos", time: "hace 5 min", icon: ShoppingBagIcon, color: "primary" },
  { id: 2, type: "payment", title: "Pago confirmado", description: "$1,250,000 COP - Orden #ORD-2024-001", time: "hace 15 min", icon: CreditCardIcon, color: "green" },
  { id: 3, type: "user", title: "Nuevo cliente registrado", description: "María González - maria@email.com", time: "hace 1 hora", icon: UsersIcon, color: "blue" },
  { id: 4, type: "stock", title: "Stock bajo: SKU-0045", description: "Solo 3 unidades restantes", time: "hace 2 horas", icon: AlertTriangleIcon, color: "orange" },
  { id: 5, type: "order", title: "Pedido enviado #ORD-2024-002", description: "Carlos Ruiz - 1 producto", time: "hace 3 horas", icon: CheckCircleIcon, color: "primary" },
];

const quickActions = [
  { title: "Agregar producto", description: "Crear nuevo producto en catálogo", icon: PlusIcon, href: "/admin/products?new=true" },
  { title: "Gestionar pedidos", description: "Ver y actualizar estado de pedidos", icon: ShoppingBagIcon, href: "/admin/orders" },
  { title: "Ver clientes", description: "Lista completa de clientes registrados", icon: UsersIcon, href: "/admin/customers" },
  { title: "Control inventario", description: "Ajustar stock y ver movimientos", icon: BoxIcon, href: "/admin/inventory" },
];

const recentProducts = [
  { id: 1, name: "Auriculares Bluetooth Pro", sku: "AUD-001", price: 299000, stock: 45, status: "active" },
  { id: 2, name: "Smartwatch Series 5", sku: "SWT-002", price: 899000, stock: 12, status: "active" },
  { id: 3, name: "Cargador Rápido 65W", sku: "CHG-003", price: 129000, stock: 3, status: "low-stock" },
  { id: 4, name: "Mouse Ergonómico MX", sku: "MOU-004", price: 189000, stock: 28, status: "draft" },
  { id: 5, name: "Teclado Mecánico RGB", sku: "KEY-005", price: 349000, stock: 0, status: "out-of-stock" },
  { id: 6, name: "Monitor 27\" 4K", sku: "MON-006", price: 1299000, stock: 8, status: "paused" },
];

const paymentSummary = [
  { label: "Pendientes", value: "$4.2M", count: 12, color: "orange" },
  { label: "Procesando", value: "$1.8M", count: 5, color: "blue" },
  { label: "Completados", value: "$12.5M", count: 45, color: "green" },
  { label: "Rechazados", value: "$320K", count: 3, color: "red" },
];

const notifications = [
  { id: 1, title: "Stock crítico", message: "Cargador Rápido 65W (SKU-003) tiene solo 3 unidades", time: "hace 2 horas", type: "warning", unread: true },
  { id: 2, title: "Nuevo pedido", message: "Pedido #ORD-2024-003 por $450,000 COP", time: "hace 4 horas", type: "info", unread: true },
  { id: 3, title: "Pago fallido", message: "Pago de orden #ORD-2024-002 rechazado por banco", time: "hace 6 horas", type: "error", unread: false },
  { id: 4, title: "Reporte semanal", message: "Tu reporte semanal está listo para descargar", time: "hace 1 día", type: "success", unread: false },
];

function StatCard({ title, value, change, changeType, icon: Icon, color }: {
  title: string;
  value: string;
  change?: string;
  changeType?: "positive" | "negative";
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}) {
  const colorClasses = {
    primary: "stat-primary",
    blue: "stat-blue",
    green: "stat-green",
    orange: "stat-orange",
  };

  return (
    <article className={clsx("stat-card", colorClasses[color as keyof typeof colorClasses])}>
      <div className="stat-header">
        <div className="stat-icon">
          <Icon className="stat-icon-svg" aria-hidden="true" />
        </div>
      </div>
      <div className="stat-content">
        <p className="stat-title">{title}</p>
        <p className="stat-value">{value}</p>
        {change && (
          <p className={clsx("stat-change", changeType)}>{changeType ? `${change} vs mes anterior` : change}</p>
        )}
      </div>
    </article>
  );
}

function QuickActionCard({ title, description, icon: Icon, href }: {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
}) {
  return (
    <Link href={href} className="quick-action-card">
      <div className="action-icon">
        <Icon className="action-icon-svg" aria-hidden="true" />
      </div>
      <div className="action-content">
        <h4 className="action-title">{title}</h4>
        <p className="action-desc">{description}</p>
      </div>
      <ArrowRightIcon className="action-arrow" aria-hidden="true" />
    </Link>
  );
}

function ActivityItem({ activity }: { activity: typeof recentActivity[0] }) {
  return (
    <div className="activity-item">
      <div className={clsx("activity-icon", activity.color)}>
        <activity.icon className="activity-icon-svg" aria-hidden="true" />
      </div>
      <div className="activity-content">
        <p className="activity-title">{activity.title}</p>
        <p className="activity-desc">{activity.description}</p>
      </div>
      <div className="activity-meta">
        <ClockIcon className="activity-clock" aria-hidden="true" />
        <span className="activity-time">{activity.time}</span>
      </div>
    </div>
  );
}

function ProductRow({ product, onEdit, onDelete, menuOpen, onToggleMenu }: {
  product: typeof recentProducts[0];
  onEdit: () => void;
  onDelete: () => void;
  menuOpen: boolean;
  onToggleMenu: () => void;
}) {
  const statusConfig: Record<string, { label: string; className: string }> = {
    active: { label: "Activo", className: "status-active" },
    "low-stock": { label: "Stock bajo", className: "status-warning" },
    "out-of-stock": { label: "Agotado", className: "status-danger" },
    draft: { label: "Borrador", className: "status-neutral" },
    paused: { label: "Pausado", className: "status-neutral" },
  };

  const config = statusConfig[product.status] ?? { label: "Desconocido", className: "status-active" };

  return (
    <tr>
      <td>
        <div className="product-info">
          <div className="product-avatar">
            <BoxIcon className="product-avatar-icon" aria-hidden="true" />
          </div>
          <div>
            <p className="product-name">{product.name}</p>
            <p className="product-sku">{product.sku}</p>
          </div>
        </div>
      </td>
      <td><span className="product-price">{formatCOP(product.price)}</span></td>
      <td>{product.stock}</td>
      <td><span className={clsx("status-badge", config.className)}>{config.label}</span></td>
      <td>
        <div className="action-menu">
          <button className="action-btn" aria-label="Editar" onClick={onEdit}><EditIcon className="action-icon" /></button>
          <button className="action-btn" aria-label="Eliminar" onClick={onDelete}><TrashIcon className="action-icon" /></button>
          <div className="action-menu-wrap">
            <button className="action-btn" aria-label="Más opciones" aria-expanded={menuOpen} onClick={onToggleMenu}>
              <MoreVerticalIcon className="action-icon" />
            </button>
            {menuOpen && (
              <div className="row-menu" role="menu">
                <button role="menuitem" onClick={onEdit}>Ver en Productos</button>
                <button
                  role="menuitem"
                  onClick={() => {
                    navigator.clipboard?.writeText(product.sku).catch(() => {});
                    onToggleMenu();
                  }}
                >
                  Copiar SKU
                </button>
              </div>
            )}
          </div>
        </div>
      </td>
    </tr>
  );
}

function PaymentSummaryItem({ item }: { item: typeof paymentSummary[0] }) {
  return (
    <div className={clsx("payment-item", item.color)}>
      <div className="payment-info">
        <p className="payment-label">{item.label}</p>
        <p className="payment-count">{item.count} transacciones</p>
      </div>
      <div className="payment-value">
        <p className="payment-amount">{item.value}</p>
      </div>
    </div>
  );
}

function NotificationItem({ notification, onClick }: { notification: typeof notifications[0]; onClick: () => void }) {
  return (
    <button
      type="button"
      className={clsx("notification-item", notification.unread && "unread")}
      onClick={onClick}
      aria-label={notification.unread ? `Marcar como leída: ${notification.title}` : notification.title}
    >
      <div className={clsx("notification-dot", notification.type)}></div>
      <div className="notification-content">
        <p className="notification-title">{notification.title}</p>
        <p className="notification-message">{notification.message}</p>
      </div>
      <span className="notification-time">{notification.time}</span>
    </button>
  );
}

export default function AdminDashboardPage() {
  const { data, status, error, reload } = useApi(() => adminService.stats());
  const [activeTab, setActiveTab] = useState<"products" | "activity">("products");
  const [productFilter, setProductFilter] = useState<"todos" | "activos" | "borradores" | "pausados">("todos");
  const [products, setProducts] = useState(recentProducts);
  const [dashNotifications, setDashNotifications] = useState(notifications);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [lowStockOnly, setLowStockOnly] = useState(false);
  const [rowMenuId, setRowMenuId] = useState<number | null>(null);

  function markAllNotificationsRead() {
    setDashNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
  }

  function markNotificationRead(id: number) {
    setDashNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, unread: false } : n)));
  }

  function deleteProduct(id: number) {
    const product = products.find((p) => p.id === id);
    if (!product) return;
    if (!confirm(`¿Eliminar "${product.name}" de la lista?`)) return;
    setProducts((prev) => prev.filter((p) => p.id !== id));
  }

  const statsCards = [
    { title: "Total de Productos", value: String(data?.totalProducts ?? 0), change: "En catálogo", icon: BoxIcon, color: "primary" },
    { title: "Productos en Stock", value: String(data?.inStock ?? 0), change: "Con disponibilidad", icon: ShoppingBagIcon, color: "green" },
    { title: "Stock abajo", value: String(data?.lowStockCount ?? 0), change: `Hasta ${data?.lowStockThreshold ?? 5} unidades`, icon: AlertTriangleIcon, color: "orange" },
    { title: "Productos Activos", value: String(data?.activeProducts ?? 0), change: "Habilitados en la tienda", icon: CheckCircleIcon, color: "blue" },
  ];

  const filterTabs = [
    { key: "todos", label: "Todos" },
    { key: "activos", label: "Activos" },
    { key: "borradores", label: "Borradores" },
    { key: "pausados", label: "Pausados" },
  ] as const;

  const filteredProducts = products.filter((p) => {
    if (productFilter === "activos" && p.status !== "active") return false;
    if (productFilter === "borradores" && p.status !== "draft") return false;
    if (productFilter === "pausados" && p.status !== "paused") return false;
    if (lowStockOnly && p.stock > 5) return false;
    return true;
  });

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <div>
          <SectionTitle title="GESTIÓN DE PRODUCTOS" sub="Administra, actualiza y controla todo tu inventario desde un solo lugar." />
        </div>
        <a href="/admin/products?new=true" className="btn btn-primary">
          <PlusIcon className="btn-icon" aria-hidden="true" />
          <span>Agregar producto</span>
        </a>
      </div>

      <ApiState status={status} error={error} onRetry={reload} />

      {status === "success" && data && (
        <>
          <section className="dashboard-section stats-section" aria-label="Estadísticas principales">
            <div className="stats-grid">
              {statsCards.map((stat, i) => (
                <StatCard key={i} {...stat} />
              ))}
            </div>
          </section>

          <div className="dashboard-grid">
            <section className="dashboard-section products-section" aria-label="Productos recientes">
              <div className="section-header">
                <h2>Productos recientes</h2>
                <div className="section-tabs">
                  <button
                    className={clsx("tab-btn", activeTab === "products" && "active")}
                    onClick={() => setActiveTab("products")}
                  >
                    Productos
                  </button>
                  <button
                    className={clsx("tab-btn", activeTab === "activity" && "active")}
                    onClick={() => setActiveTab("activity")}
                  >
                    Actividad
                  </button>
                </div>
              </div>

              {activeTab === "products" && (
                <>
                  <div className="filter-bar" role="group" aria-label="Filtrar productos por estado">
                    {filterTabs.map((tab) => (
                      <button
                        key={tab.key}
                        className={clsx("filter-btn", productFilter === tab.key && "active")}
                        onClick={() => setProductFilter(tab.key)}
                      >
                        {tab.label}
                      </button>
                    ))}
                    <button
                      type="button"
                      className={clsx("filter-btn", "filter-btn-outline", filtersOpen && "active")}
                      onClick={() => setFiltersOpen(!filtersOpen)}
                      aria-expanded={filtersOpen}
                    >
                      <SlidersIcon className="filter-btn-icon" aria-hidden="true" />
                      <span>Filtros</span>
                    </button>
                  </div>

                  {filtersOpen && (
                    <div className="filter-panel">
                      <label className="filter-checkbox">
                        <input
                          type="checkbox"
                          checked={lowStockOnly}
                          onChange={(e) => setLowStockOnly(e.target.checked)}
                        />
                        <span>Solo productos con stock bajo (≤ 5)</span>
                      </label>
                      {lowStockOnly && (
                        <button type="button" className="filter-clear" onClick={() => setLowStockOnly(false)}>
                          Limpiar
                        </button>
                      )}
                    </div>
                  )}

                  {filteredProducts.length === 0 ? (
                    <p className="empty-state">No hay productos con este estado.</p>
                  ) : (
                    <div className="table-container">
                      <table className="data-table" role="table">
                        <thead>
                          <tr>
                            <th scope="col">Producto</th>
                            <th scope="col">Precio</th>
                            <th scope="col">Stock</th>
                            <th scope="col">Estado</th>
                            <th scope="col">Acciones</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredProducts.map((product) => (
                            <ProductRow
                              key={product.id}
                              product={product}
                              onEdit={() => {
                                setRowMenuId(null);
                                window.location.href = "/admin/products";
                              }}
                              onDelete={() => {
                                setRowMenuId(null);
                                deleteProduct(product.id);
                              }}
                              menuOpen={rowMenuId === product.id}
                              onToggleMenu={() => setRowMenuId(rowMenuId === product.id ? null : product.id)}
                            />
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </>
              )}

              {activeTab === "activity" && (
                <div className="activity-list">
                  {recentActivity.map((activity) => (
                    <ActivityItem key={activity.id} activity={activity} />
                  ))}
                </div>
              )}
            </section>

            <aside className="dashboard-sidebar" aria-label="Paneles laterales">
              <section className="sidebar-card quick-actions-card" aria-label="Acciones rápidas">
                <h3>Acciones rápidas</h3>
                <div className="quick-actions-grid">
                  {quickActions.map((action, i) => (
                    <QuickActionCard key={i} {...action} />
                  ))}
                </div>
              </section>

              <section className="sidebar-card payments-card" aria-label="Resumen de pagos">
                <h3>Resumen de pagos</h3>
                <div className="payments-list">
                  {paymentSummary.map((item, i) => (
                    <PaymentSummaryItem key={i} item={item} />
                  ))}
                </div>
                <a href="/admin/payments" className="view-all-link">Ver todos los pagos</a>
              </section>

              <section className="sidebar-card notifications-card" aria-label="Notificaciones recientes">
                <div className="card-heading-row">
                  <h3>Notificaciones</h3>
                  {dashNotifications.some((n) => n.unread) && (
                    <button type="button" className="mark-read-btn" onClick={markAllNotificationsRead}>
                      Marcar todas como leídas
                    </button>
                  )}
                </div>
                <div className="notifications-list">
                  {dashNotifications.map((notif) => (
                    <NotificationItem
                      key={notif.id}
                      notification={notif}
                      onClick={() => markNotificationRead(notif.id)}
                    />
                  ))}
                </div>
                <a href="/admin/notifications" className="view-all-link">Ver todas</a>
              </section>
            </aside>
          </div>
        </>
      )}
    </div>
  );
}