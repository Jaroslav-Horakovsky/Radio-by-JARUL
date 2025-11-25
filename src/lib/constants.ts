import { Station } from "@/types/station";

// Seznam overenych HTTPS streamu (vetsina ceskych radii jede na http, coz moderni prohlizece blokuji, nebo jsou to playlisty)
export const DEFAULT_STATIONS: Station[] = [
  {
    id: "1",
    name: "ČRo Radiožurnál",
    frequency: "91.9 FM",
    url: "https://rozhlas.stream/radiozurnal.mp3",
    genre: "Zprávy",
  },
  {
    id: "2",
    name: "ČRo Dvojka",
    frequency: "100.7 FM",
    url: "https://rozhlas.stream/dvojka.mp3",
    genre: "Talk/Hudba",
  },
  {
    id: "3",
    name: "ČRo Vltava",
    frequency: "105.0 FM",
    url: "https://rozhlas.stream/vltava.mp3",
    genre: "Klasika",
  },
  {
    id: "4",
    name: "ČRo Plus",
    frequency: "95.4 FM",
    url: "https://rozhlas.stream/plus.mp3",
    genre: "Analytika",
  },
  {
    id: "5",
    name: "ČRo Radio Wave",
    frequency: "Digital",
    url: "https://rozhlas.stream/radio_wave.mp3",
    genre: "Alternative",
  },
  {
    id: "6",
    name: "ČRo Jazz",
    frequency: "Digital",
    url: "https://rozhlas.stream/jazz.mp3",
    genre: "Jazz",
  },
  {
    id: "7",
    name: "Fajn Radio",
    frequency: "Web",
    url: "http://ice.radia.cz/fajn128.mp3",
    genre: "Pop/Hity",
  },
  {
    id: "8",
    name: "Evropa 2",
    frequency: "Web",
    url: "http://ice.actve.net/fm-evropa2-128",
    genre: "Pop",
  },
  {
    id: "9",
    name: "Blaník",
    frequency: "103.4 FM",
    url: "http://ice.radia.cz/blanikfm128.mp3",
    genre: "Česká radia",
  }
];
