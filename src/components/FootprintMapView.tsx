import React, { useEffect, useRef, useState } from 'react';
import {
  MapPin,
  ExternalLink,
  Navigation,
  Calendar,
  Clock,
  Compass,
  Layers,
  Sparkles
} from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { ExpenseItem, TripInfo } from '../types';
import { getCategoryById } from '../utils/categories';
import { createGoogleMapsUrl, formatCoordinates } from '../utils/geo';
import { formatCurrency } from '../utils/settlement';

interface FootprintMapViewProps {
  trip: TripInfo;
  expenses: ExpenseItem[];
  onAddExpenseWithGps: () => void;
}

export const FootprintMapView: React.FC<FootprintMapViewProps> = ({
  trip,
  expenses,
  onAddExpenseWithGps,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const [selectedExpense, setSelectedExpense] = useState<ExpenseItem | null>(null);

  // Filter expenses that have valid coordinates
  const gpsExpenses = expenses
    .filter((e) => e.latitude !== undefined && e.longitude !== undefined)
    .sort((a, b) => {
      const dateA = `${a.date} ${a.time || '00:00'}`;
      const dateB = `${b.date} ${b.time || '00:00'}`;
      return dateA.localeCompare(dateB);
    });

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Clean up previous map if exists
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    if (gpsExpenses.length === 0) return;

    // Default center from first point
    const firstPoint: [number, number] = [
      gpsExpenses[0].latitude!,
      gpsExpenses[0].longitude!,
    ];

    const map = L.map(mapContainerRef.current, {
      zoomControl: true,
      scrollWheelZoom: false,
    }).setView(firstPoint, 13);

    // OpenStreetMap clean tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map);

    const latLngs: [number, number][] = [];

    // Add polyline if > 1 point
    gpsExpenses.forEach((item, index) => {
      const pos: [number, number] = [item.latitude!, item.longitude!];
      latLngs.push(pos);

      // Custom div icon
      const customIcon = L.divIcon({
        className: 'custom-footprint-marker',
        html: `
          <div style="
            background: #0d9488;
            color: white;
            font-weight: 800;
            font-size: 11px;
            width: 28px;
            height: 28px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 4px 10px rgba(13, 148, 136, 0.4);
            border: 2px solid white;
          ">
            ${index + 1}
          </div>
        `,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      });

      const marker = L.marker(pos, { icon: customIcon }).addTo(map);

      // Marker popup
      const googleMapsUrl = createGoogleMapsUrl(item.latitude!, item.longitude!);
      const cat = getCategoryById(item.category);
      const popupHtml = `
        <div style="font-family: sans-serif; min-width: 160px; padding: 4px;">
          <div style="font-size: 11px; color: #0d9488; font-weight: bold; margin-bottom: 2px;">
            第 ${index + 1} 站 • ${cat.name}
          </div>
          <div style="font-size: 13px; font-weight: bold; color: #1e293b; margin-bottom: 4px;">
            ${item.title}
          </div>
          <div style="font-size: 14px; font-weight: 900; color: #0f766e; margin-bottom: 6px;">
            ${formatCurrency(item.amount, trip.currencySymbol)}
          </div>
          <div style="font-size: 11px; color: #64748b; margin-bottom: 8px;">
            ${item.date} ${item.time || ''}
          </div>
          <a href="${googleMapsUrl}" target="_blank" rel="noopener noreferrer" style="
            display: inline-block;
            background: #0d9488;
            color: white;
            padding: 4px 8px;
            border-radius: 6px;
            text-decoration: none;
            font-size: 11px;
            font-weight: bold;
          ">
            在 Google Maps 開啟 ↗
          </a>
        </div>
      `;

      marker.bindPopup(popupHtml);
      marker.on('click', () => setSelectedExpense(item));
    });

    if (latLngs.length > 1) {
      L.polyline(latLngs, {
        color: '#0d9488',
        weight: 3,
        opacity: 0.8,
        dashArray: '6, 8',
      }).addTo(map);

      const bounds = L.latLngBounds(latLngs);
      map.fitBounds(bounds, { padding: [40, 40] });
    }

    mapInstanceRef.current = map;

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [gpsExpenses, trip]);

  return (
    <div className="space-y-4">
      {/* Overview header */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-teal-50 text-teal-600">
              <Compass className="w-4 h-4" />
            </span>
            <h2 className="text-sm font-bold text-slate-800">
              旅程地理足跡與地圖
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            共記錄了 <strong className="text-teal-700">{gpsExpenses.length}</strong> 個 GPS 打卡消費地標，點擊即可開啟 Google Maps 導航。
          </p>
        </div>

        <button
          onClick={onAddExpenseWithGps}
          className="flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 active:scale-95 text-white text-xs font-bold shadow-xs transition"
        >
          <Navigation className="w-3.5 h-3.5" />
          <span>定位記一筆</span>
        </button>
      </div>

      {gpsExpenses.length === 0 ? (
        <div className="p-8 text-center rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
          <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-teal-50 flex items-center justify-center text-teal-600">
            <MapPin className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-slate-800">尚未記錄任何 GPS 地點</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            記帳時點擊「取得目前位置 (GPS)」，系統就會自動記錄經緯度並繪製出專屬的旅遊足跡地圖！
          </p>
          <div className="mt-4">
            <button
              onClick={onAddExpenseWithGps}
              className="px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-sm transition active:scale-95"
            >
              ＋ 立即記帳並打卡定位
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Interactive Leaflet Map Container */}
          <div className="rounded-2xl overflow-hidden border border-slate-200/90 shadow-sm relative z-0 h-80 sm:h-96">
            <div ref={mapContainerRef} className="w-full h-full" />
          </div>

          {/* Chronological Footprint Timeline */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-3">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Navigation className="w-3.5 h-3.5 text-teal-600" />
              <span>依時間順序的足跡路線 ({gpsExpenses.length} 個點)</span>
            </h3>

            <div className="relative pl-6 space-y-4 before:content-[''] before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-teal-200">
              {gpsExpenses.map((item, idx) => {
                const cat = getCategoryById(item.category);
                const googleMapsUrl = createGoogleMapsUrl(item.latitude!, item.longitude!);

                return (
                  <div key={item.id} className="relative group">
                    {/* Circle marker on line */}
                    <div className="absolute -left-6 top-1 w-5 h-5 rounded-full bg-white border-2 border-teal-600 flex items-center justify-center text-[10px] font-bold text-teal-700 shadow-xs">
                      {idx + 1}
                    </div>

                    <div className="p-3 rounded-xl bg-slate-50 hover:bg-slate-100/90 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 transition">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[11px] font-semibold text-teal-700 bg-teal-50 px-1.5 py-0.5 rounded border border-teal-100">
                            {cat.name}
                          </span>
                          <h4 className="text-xs font-bold text-slate-800">
                            {item.title}
                          </h4>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 mt-1 text-[11px] text-slate-500">
                          {item.locationName && (
                            <span className="font-medium text-slate-700">
                              📍 {item.locationName}
                            </span>
                          )}
                          <span className="font-mono text-slate-400">
                            ({formatCoordinates(item.latitude, item.longitude)})
                          </span>
                          <span>•</span>
                          <span>
                            {item.date} {item.time || ''}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-200">
                        <span className="text-xs font-black text-slate-900">
                          {formatCurrency(item.amount, trip.currencySymbol)}
                        </span>

                        <a
                          href={googleMapsUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-2xs transition active:scale-95"
                        >
                          <span>在 Google Maps 查看</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
