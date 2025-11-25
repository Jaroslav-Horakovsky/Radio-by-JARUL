"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { Station } from "@/types/station";

interface EditStationModalProps {
  station: Station | null;
  isOpen: boolean;
  onClose: () => void;
  onEditStation: (station: Station) => void;
}

export function EditStationModal({ station, isOpen, onClose, onEditStation }: EditStationModalProps) {
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [frequency, setFrequency] = useState("");
  const [genre, setGenre] = useState("");

  // Update form when station changes
  useEffect(() => {
    if (station) {
      setName(station.name);
      setUrl(station.url);
      setFrequency(station.frequency || "");
      setGenre(station.genre || "");
    }
  }, [station]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !url || !station) return;

    const updatedStation: Station = {
      ...station,
      name,
      url,
      frequency,
      genre
    };

    onEditStation(updatedStation);
    onClose();
  };

  if (!isOpen || !station) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-md shadow-2xl p-6 relative animate-in fade-in zoom-in duration-200">

        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white">Upravit rádio</h2>
          <button onClick={onClose} className="text-zinc-400 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-medium text-zinc-400">Název stanice</label>
            <input
              autoFocus
              type="text"
              placeholder="Např. Radio 1"
              className="w-full bg-zinc-800 border-zinc-700 text-white rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-600 outline-none"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-zinc-400">Stream URL</label>
            <input
              type="url"
              placeholder="https://..."
              className="w-full bg-zinc-800 border-zinc-700 text-white rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-600 outline-none"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-medium text-zinc-400">Frekvence</label>
              <input
                type="text"
                placeholder="91.9 FM"
                className="w-full bg-zinc-800 border-zinc-700 text-white rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-600 outline-none"
                value={frequency}
                onChange={(e) => setFrequency(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-zinc-400">Žánr</label>
              <input
                type="text"
                placeholder="Rock"
                className="w-full bg-zinc-800 border-zinc-700 text-white rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-600 outline-none"
                value={genre}
                onChange={(e) => setGenre(e.target.value)}
              />
            </div>
          </div>

          <div className="flex gap-3 mt-6 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white py-2 rounded-lg font-medium transition-colors"
            >
              Zrušit
            </button>
            <button
              type="submit"
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-medium transition-colors"
            >
              Uložit změny
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
