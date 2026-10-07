"use client";

import Link from "next/link";
import { useState } from "react";
import { ApiState } from "@/components/ApiState";
import { SectionTitle } from "@/components/SectionTitle";
import { useApi } from "@/hooks/useApi";
import { adminService } from "@/services/admin.service";
import { formatCOP } from "@/services/format";
import clsx from "clsx";

function TrendingUpIcon({ className }: { className?: string }) {
  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg>;
}

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

const statsCards = [
  { title: "Ventas del mes", value: "$12.5M", change: "+12.5%", changeType: "positive" as const, icon: TrendingUpIcon, color: "primary" },
  { title: "Pedidos totales", value: "1,234", change: "+8.2%", changeType: "positive" as const, icon: ShoppingBagIcon, color: "blue" },
  { title: "Clientes activos", value: "567", change: "+3.1%", changeType: "positive" as const, icon: UsersIcon, color: "green" },
  { title: "Productos en stock", value: "89", change: "-2.4%", changeType: "negative" as const, icon: BoxIcon, color: "orange" },
];

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
  { id: 4, name: "Mouse Ergonómico MX", sku: "MOU-004", price: 189000, stock: 28, status: "active" },
  { id: 5, name: "Teclado Mecánico RGB", sku: "KEY-005", price: 349000, stock: 0, status: "out-of-stock" },
  { id: 6, name: "Monitor 27\" 4K", sku: "MON-006", price: 1299000, stock: 8, status: "active" },
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
  change: string;
  changeType: "positive" | "negative";
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
        <p className={clsx("stat-change", changeType)}>{change} vs mes anterior</p>
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

function ProductRow({ product }: { product: typeof recentProducts[0] }) {
  const statusConfig: Record<string, { label: string; className: string }> = {
    active: { label: "Activo", className: "status-active" },
    "low-stock": { label: "Stock bajo", className: "status-warning" },
    "out-of-stock": { label: "Agotado", className: "status-danger" },
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
          <button className="action-btn" aria-label="Editar"><EditIcon className="action-icon" /></button>
          <button className="action-btn" aria-label="Eliminar"><TrashIcon className="action-icon" /></button>
          <button className="action-btn" aria-label="Más opciones"><MoreVerticalIcon className="action-icon" /></button>
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

function NotificationItem({ notification }: { notification: typeof notifications[0] }) {
  const typeIcons: Record<string, React.ComponentType<{ className?: string }>> = {
    warning: AlertTriangleIcon,
    info: BellIcon,
    error: AlertTriangleIcon,
    success: CheckCircleIcon,
  };

  const Icon = typeIcons[notification.type] ?? BellIcon;

  return (
    <div className={clsx("notification-item", notification.unread && "unread")}>
      <div className={clsx("notification-dot", notification.type)}></div>
      <div className="notification-content">
        <p className="notification-title">{notification.title}</p>
        <p className="notification-message">{notification.message}</p>
      </div>
      <span className="notification-time">{notification.time}</span>
    </div>
  );
}

export default function AdminDashboardPage() {
  const { data, status, error, reload } = useApi(() => adminService.stats());
  const [activeTab, setActiveTab] = useState<"products" | "activity">("products");

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <div>
          <SectionTitle title="Dashboard" sub="Resumen general de tu tienda" />
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
                      {recentProducts.map((product) => (
                        <ProductRow key={product.id} product={product} />
                      ))}
                    </tbody>
                  </table>
                </div>
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
                <h3>Notificaciones</h3>
                <div className="notifications-list">
                  {notifications.map((notif) => (
                    <NotificationItem key={notif.id} notification={notif} />
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