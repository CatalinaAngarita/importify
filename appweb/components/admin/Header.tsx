"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { authService } from "@/services/auth.service";

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8"></circle>
      <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
    </svg>
  );
}

function BellIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
      <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
    </svg>
  );
}

function ChevronDownIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 12 15 18 9"></polyline>
    </svg>
  );
}

function LogOutIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
      <polyline points="16 17 21 12 16 7"></polyline>
      <line x1="21" y1="12" x2="9" y2="12"></line>
    </svg>
  );
}

function UserIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
      <circle cx="12" cy="7" r="4"></circle>
    </svg>
  );
}

function SettingsIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3"></circle>
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
    </svg>
  );
}

interface AdminHeaderProps {
  onMenuClick: () => void;
}

export function AdminHeader({ onMenuClick }: AdminHeaderProps) {
  const pathname = usePathname();
  const [searchQuery, setSearchQuery] = useState("");
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const notificationsRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const notifications = [
    { id: 1, title: "Nuevo pedido", message: "Pedido #ORD-2024-001 recibido", time: "hace 5 min", unread: true, type: "order" },
    { id: 2, title: "Stock bajo", message: "Producto SKU-0045 tiene 3 unidades", time: "hace 1 hora", unread: true, type: "warning" },
    { id: 3, title: "Pago confirmado", message: "Pago de $1,250,000 COP aprobado", time: "hace 2 horas", unread: false, type: "success" },
    { id: 4, title: "Nuevo cliente", message: "Juan Pérez se registró", time: "hace 4 horas", unread: false, type: "info" },
  ];

  const unreadCount = notifications.filter((n) => n.unread).length;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setNotificationsOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function handleLogout() {
    authService.logout();
    window.location.href = "/admin/login";
  }

  return (
    <header className="admin-header" role="banner">
      <div className="header-left">
        <button className="header-menu-btn" onClick={onMenuClick} aria-label="Abrir menú" aria-expanded="false">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
          </svg>
        </button>

        <div className="header-search">
          <SearchIcon className="search-icon" aria-hidden="true" />
          <input
            type="search"
            placeholder="Buscar productos, pedidos, clientes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
            aria-label="Buscar"
          />
        </div>
      </div>

      <div className="header-right">
        <div className={clsx("header-notifications", notificationsOpen && "open")} ref={notificationsRef}>
          <button
            className="header-icon-btn"
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            aria-label="Notificaciones"
            aria-expanded={notificationsOpen}
            aria-haspopup="true"
          >
            <BellIcon className="header-icon" aria-hidden="true" />
            {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
          </button>

          {notificationsOpen && (
            <div className="notifications-dropdown" role="menu">
              <div className="dropdown-header">
                <h3>Notificaciones</h3>
                {unreadCount > 0 && <button className="mark-read-btn">Marcar todas como leídas</button>}
              </div>
              <div className="dropdown-list" role="listbox">
                {notifications.map((notif) => (
                  <button key={notif.id} className={clsx("notification-item", notif.unread && "unread")} role="option">
                    <div className="notification-icon">
                      {notif.type === "order" && <OrderIcon />}
                      {notif.type === "warning" && <AlertIcon />}
                      {notif.type === "success" && <CheckCircleIcon />}
                      {notif.type === "info" && <InfoIcon />}
                    </div>
                    <div className="notification-content">
                      <p className="notification-title">{notif.title}</p>
                      <p className="notification-message">{notif.message}</p>
                      <span className="notification-time">{notif.time}</span>
                    </div>
                  </button>
                ))}
              </div>
              <div className="dropdown-footer">
                <Link href="/admin/notifications" className="view-all-link">Ver todas</Link>
              </div>
            </div>
          )}
        </div>

        <div className={clsx("header-user-menu", userMenuOpen && "open")} ref={userMenuRef}>
          <button
            className="user-menu-trigger"
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            aria-label="Menú de usuario"
            aria-expanded={userMenuOpen}
            aria-haspopup="true"
          >
            <div className="user-avatar">
              <UserIcon className="avatar-icon" aria-hidden="true" />
            </div>
            <div className="user-info">
              <span className="user-name">Carlos Mendoza</span>
              <span className="user-role">Administrador</span>
            </div>
            <ChevronDownIcon className="chevron-icon" aria-hidden="true" />
          </button>

          {userMenuOpen && (
            <div className="user-dropdown" role="menu">
              <div className="user-dropdown-header">
                <div className="user-avatar large">
                  <UserIcon className="avatar-icon" aria-hidden="true" />
                </div>
                <div>
                  <p className="dropdown-user-name">Carlos Mendoza</p>
                  <p className="dropdown-user-email">carlos@importify.com</p>
                </div>
              </div>
              <div className="dropdown-divider"></div>
              <Link href="/admin/profile" className="dropdown-item" role="menuitem">
                <UserIcon className="dropdown-icon" aria-hidden="true" />
                <span>Mi perfil</span>
              </Link>
              <Link href="/admin/settings" className="dropdown-item" role="menuitem">
                <SettingsIcon className="dropdown-icon" aria-hidden="true" />
                <span>Configuración</span>
              </Link>
              <div className="dropdown-divider"></div>
              <button className="dropdown-item danger" onClick={handleLogout} role="menuitem">
                <LogOutIcon className="dropdown-icon" aria-hidden="true" />
                <span>Cerrar sesión</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

function OrderIcon({ className }: { className?: string }) {
  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line></svg>;
}

function AlertIcon({ className }: { className?: string }) {
  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>;
}

function CheckCircleIcon({ className }: { className?: string }) {
  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>;
}

function InfoIcon({ className }: { className?: string }) {
  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>;
}