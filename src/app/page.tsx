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
    // Load from local storage or defaults
    const saved = localStorage.getItem("radioplay-stations");
    if (saved) {
      const savedStations: Station[] = JSON.parse(saved);

      // Update existing stations with fresh data from DEFAULT_STATIONS (e.g. fixed URLs)
      const updatedSavedStations = savedStations.map((s) => {
        const defaultStation = DEFAULT_STATIONS.find((d) => d.id === s.id);
        return defaultStation ? { ...s, ...defaultStation } : s;
      });
      
      // Check for any new stations in DEFAULT_STATIONS that aren't in savedStations
      const newDefaults = DEFAULT_STATIONS.filter(
        (defStation) => !savedStations.some((s) => s.id === defStation.id)
      );

      const mergedStations = [...updatedSavedStations, ...newDefaults];
      setStations(mergedStations);
      localStorage.setItem("radioplay-stations", JSON.stringify(mergedStations));
    } else {
      setStations(DEFAULT_STATIONS);
    }
  }, []);

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

      const updated = arrayMove(stations, oldIndex, newIndex);
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
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 my-12">
          <div className="space-y-3">
            <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              RadioPlay
            </h1>
            <div className="flex items-center gap-2">
              <span className="text-lg text-zinc-500 font-medium tracking-wide">Radio by</span>
              <span className="text-2xl md:text-3xl font-black bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent tracking-tight animate-pulse">
                JARUL
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsEditMode(!isEditMode)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium transition-colors ${
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
      </div>

      {/* Grid with Street Art Background - Full Width */}
      <div className="relative w-full py-16 overflow-hidden">
        {/* Background Image - Full Viewport Width */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/street-art-bg.png"
            alt="Street Art Background"
            fill
            className="object-cover object-center"
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

      {/* Historic Brno Image */}
      <div className="max-w-6xl mx-auto px-8 pb-32">
        <div className="mt-8 mb-8 relative overflow-hidden rounded-2xl border-2 border-zinc-800 bg-zinc-900/50">
          <div className="relative w-full h-48 md:h-64 lg:h-80">
            <Image
              src="/images/brno-historic.png"
              alt="Historické Brno"
              fill
              className="object-cover object-center opacity-70 hover:opacity-90 transition-opacity duration-500"
              priority={false}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
          </div>
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
