"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { DEFAULT_STATIONS } from "@/lib/constants";
import { StationCard } from "@/components/station-card";
import { PlayerBar } from "@/components/player-bar";
import { AddStationModal } from "@/components/add-station-modal";
import { EditStationModal } from "@/components/edit-station-modal";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { Station } from "@/types/station";
import { Edit3, X } from "lucide-react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
} from "@dnd-kit/sortable";

export default function Home() {
  // Initialize with default stations, but allows adding more locally
  const [stations, setStations] = useState<Station[]>([]);
  const [isEditMode, setIsEditMode] = useState(false);
  const [stationToDelete, setStationToDelete] = useState<Station | null>(null);
  const [stationToEdit, setStationToEdit] = useState<Station | null>(null);

  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    const saved = localStorage.getItem("radioplay-stations");
    const initialized = localStorage.getItem("radioplay-initialized");

    if (!initialized) {
      if (saved) {
        // Existující uživatel (upgrade z v0.1.0) - zachovej jeho stanice
        setStations(JSON.parse(saved));
        localStorage.setItem("radioplay-initialized", "true");
      } else {
        // Nový uživatel - inicializuj defaultní stanice
        setStations(DEFAULT_STATIONS);
        localStorage.setItem("radioplay-stations", JSON.stringify(DEFAULT_STATIONS));
        localStorage.setItem("radioplay-initialized", "true");
      }
    } else {
      // Flag existuje - načti uložené stanice (bez synchronizace s DEFAULT_STATIONS)
      if (saved) {
        setStations(JSON.parse(saved));
      } else {
        // Fallback pro případ, že je initialized true, ale stations chybí
        setStations(DEFAULT_STATIONS);
        localStorage.setItem("radioplay-stations", JSON.stringify(DEFAULT_STATIONS));
      }
    }
  }, []);

  // Keyboard shortcuts for edit mode
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Don't trigger shortcuts if user is typing in an input/textarea
      const target = event.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
        return;
      }

      // Don't trigger if modal is open
      if (stationToEdit || stationToDelete) {
        return;
      }

      // Ctrl+E (or Cmd+E on Mac) to toggle edit mode ON
      if ((event.ctrlKey || event.metaKey) && event.key === 'e') {
        event.preventDefault();
        setIsEditMode(true);
      }

      // Esc to turn OFF edit mode
      if (event.key === 'Escape' && isEditMode) {
        event.preventDefault();
        setIsEditMode(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isEditMode, stationToEdit, stationToDelete]);

  const saveStations = (updatedStations: Station[]) => {
    setStations(updatedStations);
    localStorage.setItem("radioplay-stations", JSON.stringify(updatedStations));
  };

  const handleAddStation = (newStation: Station) => {
    const updated = [...stations, newStation];
    saveStations(updated);
  };

  const handleDeleteStation = (station: Station) => {
    setStationToDelete(station);
  };

  const confirmDelete = () => {
    if (stationToDelete) {
      const updated = stations.filter((s) => s.id !== stationToDelete.id);
      saveStations(updated);
      setStationToDelete(null);
    }
  };

  const handleEditStation = (station: Station) => {
    setStationToEdit(station);
  };

  const confirmEdit = (updatedStation: Station) => {
    const updated = stations.map((s) =>
      s.id === updatedStation.id ? updatedStation : s
    );
    saveStations(updated);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = stations.findIndex((s) => s.id === active.id);
      const newIndex = stations.findIndex((s) => s.id === over.id);

      // Swap positions instead of array move
      const updated = [...stations];
      [updated[oldIndex], updated[newIndex]] = [updated[newIndex], updated[oldIndex]];

      saveStations(updated);
    }
  };

  const handleMoveUp = (station: Station) => {
    const index = stations.findIndex((s) => s.id === station.id);
    if (index > 0) {
      const updated = arrayMove(stations, index, index - 1);
      saveStations(updated);
    }
  };

  const handleMoveDown = (station: Station) => {
    const index = stations.findIndex((s) => s.id === station.id);
    if (index < stations.length - 1) {
      const updated = arrayMove(stations, index, index + 1);
      saveStations(updated);
    }
  };

  return (
    <main className="min-h-screen bg-background">
      {/* Header with max-width */}
      <div className="max-w-6xl mx-auto px-8 pt-8">
        <div className="flex flex-col items-center justify-center gap-6 my-16">
          <div className="space-y-6 text-center">
            <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              RadioPlay
            </h1>
            <div className="flex flex-col items-center justify-center gap-3">
              <span className="text-3xl md:text-4xl text-zinc-400 font-medium tracking-wider">Radio by</span>
              <span
                className="text-7xl md:text-8xl lg:text-9xl font-black tracking-tight animate-gradient-text"
                style={{
                  background: 'linear-gradient(90deg, #60a5fa, #a78bfa, #ec4899, #f59e0b, #60a5fa)',
                  backgroundSize: '200% 200%',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  textShadow: '0 0 40px rgba(168, 139, 250, 0.5), 0 0 80px rgba(96, 165, 250, 0.3)',
                  filter: 'drop-shadow(0 0 20px rgba(168, 139, 250, 0.6))',
                }}
              >
                JARUL
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Grid with Street Art Background - Full Width */}
      <div className="relative w-full py-16 overflow-hidden min-h-[1500px]">
        {/* Background Image - Full Viewport Width, Anchored at Top */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/street-art-bg.png"
            alt="Street Art Background"
            fill
            className="object-cover object-top"
            priority={false}
          />
          <div className="absolute inset-0 bg-black/5"></div>
        </div>

        {/* Grid with Drag and Drop - Centered Content */}
        <div className="relative z-10 max-w-6xl mx-auto px-8">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext items={stations.map((s) => s.id)} strategy={rectSortingStrategy}>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {stations.map((station, index) => (
                  <StationCard
                    key={station.id}
                    station={station}
                    isEditMode={isEditMode}
                    onDelete={handleDeleteStation}
                    onEdit={handleEditStation}
                    onMoveUp={handleMoveUp}
                    onMoveDown={handleMoveDown}
                    isFirst={index === 0}
                    isLast={index === stations.length - 1}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        </div>
      </div>

      {/* Three Images Gallery */}
      <div className="max-w-6xl mx-auto px-8 pb-32">
        <div className="mt-8 mb-8 flex flex-col md:flex-row gap-4">
          {/* Left Image */}
          <div className="relative flex-1 overflow-hidden rounded-2xl border-2 border-zinc-800 bg-zinc-900/50">
            <div className="relative w-full h-48 md:h-64 lg:h-80">
              <Image
                src="/images/brno-left.png"
                alt="Brno Left"
                fill
                className="object-contain object-center opacity-70 hover:opacity-90 transition-opacity duration-500"
                priority={false}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
            </div>
          </div>

          {/* Center Image */}
          <div className="relative flex-1 overflow-hidden rounded-2xl border-2 border-zinc-800 bg-zinc-900/50">
            <div className="relative w-full h-48 md:h-64 lg:h-80">
              <Image
                src="/images/brno-center.png"
                alt="Brno Center"
                fill
                className="object-contain object-center opacity-70 hover:opacity-90 transition-opacity duration-500"
                priority={false}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
            </div>
          </div>

          {/* Right Image */}
          <div className="relative flex-1 overflow-hidden rounded-2xl border-2 border-zinc-800 bg-zinc-900/50">
            <div className="relative w-full h-48 md:h-64 lg:h-80">
              <Image
                src="/images/brno-right.png"
                alt="Brno Right"
                fill
                className="object-contain object-center opacity-70 hover:opacity-90 transition-opacity duration-500"
                priority={false}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
            </div>
          </div>
        </div>

        {/* Action Buttons - Moved Below Gallery */}
        <div className="flex items-center justify-center gap-3 mt-8">
          <button
            onClick={() => setIsEditMode(!isEditMode)}
            className={`flex items-center gap-2 px-6 py-3 rounded-full font-medium transition-colors ${
              isEditMode
                ? "bg-orange-600 hover:bg-orange-700 text-white"
                : "bg-zinc-800 hover:bg-zinc-700 text-zinc-300"
            }`}
          >
            {isEditMode ? (
              <>
                <X size={20} />
                Ukončit úpravy
              </>
            ) : (
              <>
                <Edit3 size={20} />
                Upravit stanice
              </>
            )}
          </button>
          <AddStationModal onAddStation={handleAddStation} />
        </div>
      </div>

      <PlayerBar />

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!stationToDelete}
        title="Smazat stanici?"
        message={`Opravdu chcete smazat stanici "${stationToDelete?.name}"? Tuto akci nelze vrátit zpět.`}
        confirmText="Smazat"
        cancelText="Zrušit"
        onConfirm={confirmDelete}
        onCancel={() => setStationToDelete(null)}
        variant="danger"
      />

      {/* Edit Station Modal */}
      <EditStationModal
        station={stationToEdit}
        isOpen={!!stationToEdit}
        onClose={() => setStationToEdit(null)}
        onEditStation={confirmEdit}
      />
    </main>
  );
}
