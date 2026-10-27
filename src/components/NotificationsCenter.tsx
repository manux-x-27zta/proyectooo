import React from 'react';
import { 
  Bell, 
  MapPin, 
  Check, 
  Trash2, 
  Wifi, 
  ShieldAlert, 
  Radio, 
  Sparkles,
  RefreshCw,
  ExternalLink
} from 'lucide-react';
import { PushNotification, Species } from '../types';
import { COLOMBIAN_SPECIES } from '../data/speciesData';

interface NotificationsCenterProps {
  notifications: PushNotification[];
  onMarkAsRead: (id: string) => void;
  onClearAll: () => void;
  onSimulateNewPush: () => void;
  onSelectSpeciesOnMap: (species: Species) => void;
}

export const NotificationsCenter: React.FC<NotificationsCenterProps> = ({
  notifications,
  onMarkAsRead,
  onClearAll,
  onSimulateNewPush,
  onSelectSpeciesOnMap,
}) => {
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16">
      {/* Header */}
      <div className="p-6 rounded-2xl border border-stone-800 bg-stone-900/60 backdrop-blur-sm space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-950 text-emerald-300 border border-emerald-800">
            <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <span>Sistema Push de Bajo Consumo de Datos</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onSimulateNewPush}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition-colors flex items-center gap-1.5 shadow-md shadow-emerald-950"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-200" />
              <span>Simular Alerta de Campo</span>
            </button>
            {notifications.length > 0 && (
              <button
                onClick={onClearAll}
                className="p-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 text-stone-400 hover:text-rose-400 transition-colors"
                title="Limpiar todas las notificaciones"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        <h2 className="text-xl sm:text-2xl font-bold text-white">
          Alertas de Avistamientos Cercanos
        </h2>
        <p className="text-xs sm:text-sm text-stone-300">
          Mensajería instantánea geolocalizada comprimida (payload de &lt; 90 bytes) diseñada para áreas rurales sin cobertura de alta velocidad. Notifica cuando se confirma la presencia de una especie protegida en tu cuadrante de expedición.
        </p>
      </div>

      {/* Low-bandwidth data savings indicator */}
      <div className="p-3.5 rounded-xl border border-stone-800 bg-stone-900/40 flex flex-wrap items-center justify-between text-xs text-stone-300 gap-2">
        <div className="flex items-center gap-2">
          <Wifi className="w-4 h-4 text-emerald-400" />
          <span>Protocolo Micro-MQTT: Solo consume <strong>0.08 KB</strong> por alerta recibida.</span>
        </div>
        <span className="text-[11px] font-mono text-emerald-400 font-semibold">
          {unreadCount} alertas sin leer
        </span>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {notifications.map((notif) => {
          const matchedSpecies = notif.speciesId 
            ? COLOMBIAN_SPECIES.find(s => s.id === notif.speciesId) 
            : null;

          return (
            <div
              key={notif.id}
              className={`p-4 sm:p-5 rounded-xl border transition-all duration-200 ${
                notif.read 
                  ? 'bg-stone-950 border-stone-800/80 text-stone-400' 
                  : 'bg-stone-900/90 border-emerald-500/40 text-stone-100 shadow-lg shadow-black/40'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex gap-3">
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                    notif.type === 'conservation_alert'
                      ? 'bg-amber-950 text-amber-400 border border-amber-800'
                      : notif.type === 'sync'
                      ? 'bg-cyan-950 text-cyan-400 border border-cyan-800'
                      : 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                  }`}>
                    {notif.type === 'conservation_alert' ? (
                      <ShieldAlert className="w-5 h-5" />
                    ) : notif.type === 'sync' ? (
                      <RefreshCw className="w-5 h-5" />
                    ) : (
                      <MapPin className="w-5 h-5" />
                    )}
                  </div>

                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="font-bold text-sm text-white">{notif.title}</h4>
                      {!notif.read && (
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      )}
                      <span className="text-[10px] text-stone-400 font-mono">
                        {notif.timestamp}
                      </span>
                    </div>

                    <p className="text-xs text-stone-300 leading-relaxed">
                      {notif.message}
                    </p>

                    <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] text-stone-400">
                      <span className="flex items-center gap-1 text-emerald-400 font-medium">
                        <MapPin className="w-3 h-3" /> {notif.locationName}
                      </span>
                      {notif.distanceKm > 0 && (
                        <span>A ~{notif.distanceKm} km de distancia</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2 shrink-0">
                  {!notif.read && (
                    <button
                      onClick={() => onMarkAsRead(notif.id)}
                      className="text-[11px] font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
                      title="Marcar como leída"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Leída</span>
                    </button>
                  )}

                  {matchedSpecies && (
                    <button
                      onClick={() => onSelectSpeciesOnMap(matchedSpecies)}
                      className="px-2.5 py-1 rounded text-[11px] font-semibold bg-emerald-600/20 text-emerald-300 hover:bg-emerald-600 hover:text-white transition-colors"
                    >
                      Ver en Mapa
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {notifications.length === 0 && (
          <div className="p-12 text-center rounded-2xl border border-stone-800 bg-stone-900/30 space-y-2">
            <Bell className="w-8 h-8 text-stone-500 mx-auto" />
            <h4 className="text-sm font-bold text-white">No hay alertas recientes</h4>
            <p className="text-xs text-stone-400 max-w-sm mx-auto">
              Te notificaremos en tiempo real cuando investigadores o guardaparques registren nuevos avistamientos en tu región.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
