'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useDictionary } from '@/context/DictionaryContext';
import { 
  LayoutDashboard, 
  Users, 
  Store, 
  FileText, 
  BarChart3, 
  Map, 
  MapPin, 
  Box, 
  Settings, 
  Activity, 
  ShieldAlert, 
  ShoppingBag, 
  MessageSquare,
  PackageCheck,
  Calendar,
  Lock
} from 'lucide-react';
import { useState } from 'react';

export function AdminSidebar({ country }: { country: string }) {
  const pathname = usePathname();
  const dict = useDictionary();

  const navGroups = [
    {
      title: dict?.adminShell?.groups?.core || 'CORE',
      items: [
        { name: dict?.adminShell?.menu?.dashboard || 'Command Center', href: `/${country}/admin`, icon: LayoutDashboard, exact: true },
        { name: dict?.adminShell?.menu?.sellerIntake || 'Seller Intake', href: `/${country}/admin/sellers`, icon: Store },
        { name: dict?.adminShell?.menu?.productReview || 'Revisión Productos', href: `/${country}/admin/productos/revision`, icon: ShoppingBag },
        { name: dict?.adminShell?.menu?.discrepancias || 'WMS Discrepancias', href: `/${country}/admin/bodega/discrepancias`, icon: ShieldAlert },
      ]
    },
    {
      title: dict?.adminShell?.groups?.operations || 'OPERACIONES',
      items: [
        { name: dict?.adminShell?.menu?.users || 'Users / Buyers', href: `/${country}/admin/users`, icon: Users, disabled: true },
        { name: dict?.adminShell?.menu?.crm || 'AZHON Care (CRM)', href: `/${country}/admin/crm`, icon: MessageSquare, disabled: true },
        { name: dict?.adminShell?.menu?.orders || 'Orders', href: `/${country}/admin/orders`, icon: FileText, disabled: true },
        { name: dict?.adminShell?.menu?.finance || 'Finance', href: `/${country}/admin/finance`, icon: BarChart3, disabled: true },
        { name: dict?.adminShell?.menu?.campaigns || 'Campaigns', href: `/${country}/admin/campaigns`, icon: Calendar, disabled: true },
      ]
    },
    {
      title: dict?.adminShell?.groups?.logistics || 'LOGÍSTICA & GEO',
      items: [
        { name: dict?.adminShell?.menu?.delivery || 'Delivery Intelligence', href: `/${country}/admin/delivery`, icon: Map, disabled: true },
        { name: dict?.adminShell?.menu?.address || 'Address Intelligence', href: `/${country}/admin/address`, icon: MapPin, disabled: true },
        { name: dict?.adminShell?.menu?.wms || 'Warehouse Full', href: `/${country}/admin/wms`, icon: Box, disabled: true },
        { name: dict?.adminShell?.menu?.pickup || 'Pickup Points', href: `/${country}/admin/pickup`, icon: PackageCheck, disabled: true },
      ]
    },
    {
      title: dict?.adminShell?.groups?.system || 'SISTEMA',
      items: [
        { name: dict?.adminShell?.menu?.categories || 'Marketplace Control', href: `/${country}/admin/categories`, icon: LayoutDashboard, disabled: true },
        { name: dict?.adminShell?.menu?.access || 'Access Control', href: `/${country}/admin/access`, icon: Lock, disabled: true },
        { name: dict?.adminShell?.menu?.audit || 'Audit / Events', href: `/${country}/admin/audit`, icon: Activity, disabled: true },
        { name: dict?.adminShell?.menu?.settings || 'Settings', href: `/${country}/admin/settings`, icon: Settings, disabled: true },
      ]
    }
  ];

  return (
    <aside className="w-64 flex-shrink-0 bg-[#0A0A0B] text-gray-300 hidden lg:flex flex-col h-full border-r border-gray-800">
      <div className="h-16 flex items-center px-6 border-b border-gray-800">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-orange-500 rounded flex items-center justify-center font-bold text-white">AZ</div>
          <span className="font-bold text-white tracking-wide text-sm">COMMAND CENTER</span>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto py-6 custom-scrollbar">
        {navGroups.map((group, i) => (
          <div key={i} className="mb-8 px-4">
            <h3 className="px-3 text-[10px] font-bold text-gray-500 tracking-widest uppercase mb-3">
              {group.title}
            </h3>
            <div className="space-y-1">
              {group.items.map((item: any) => {
                const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href);
                const Icon = item.icon;

                if (item.disabled) {
                  return (
                    <div key={item.name} className="flex items-center justify-between px-3 py-2 rounded-lg text-gray-600 opacity-60 cursor-not-allowed">
                      <div className="flex items-center gap-3">
                        <Icon className="w-4 h-4" />
                        <span className="text-sm font-medium">{item.name}</span>
                      </div>
                      <span className="text-[9px] bg-gray-800 text-gray-400 px-1.5 py-0.5 rounded font-bold uppercase">{dict?.adminShell?.comingSoon}</span>
                    </div>
                  );
                }

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center justify-between px-3 py-2 rounded-lg transition-colors text-sm font-medium ${
                      isActive 
                        ? 'bg-orange-500/10 text-orange-500' 
                        : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`w-4 h-4 ${isActive ? 'text-orange-500' : ''}`} />
                      <span>{item.name}</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
}
