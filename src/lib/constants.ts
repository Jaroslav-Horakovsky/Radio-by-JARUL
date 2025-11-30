import { Station } from "@/types/station";

// Seznam overenych HTTPS streamu (vetsina ceskych radii jede na http, coz moderni prohlizece blokuji, nebo jsou to playlisty)
export const DEFAULT_STATIONS: Station[] = [
  // Hip-Hop stanice
  {
    id: "10",
    name: "HipHopVibes Radio",
    frequency: "Web",
    url: "https://ice2.radia.cz/hiphopvibes128.aac",
    genre: "Hip Hop / Rap",
  },
  {
    id: "11",
    name: "COLOR Radio",
    frequency: "99.4 FM",
    url: "http://icecast1.play.cz/color32aac",
    genre: "Hip-Hop",
  },
  {
    id: "12",
    name: "Fajn Vibe",
    frequency: "Web",
    url: "http://mp3stream2.abradio.cz:8000/fajn_vibe_128.mp3",
    genre: "Hip-Hop",
  },
  {
    id: "15",
    name: "SLow Down Radio",
    frequency: "Web",
    url: "https://icecast9.play.cz/slowdown.mp3",
    genre: "Hip-Hop",
  },
  {
    id: "16",
    name: "HOT 97 (WQHT) – New York",
    frequency: "97.1 FM",
    url: "https://playerservices.streamtheworld.com/api/livestream-redirect/WQHTFMAAC.aac",
    genre: "Hip-Hop",
  },
  {
    id: "17",
    name: "Skyrock – Premier sur le Rap (Paříž)",
    frequency: "96.0 FM",
    url: "https://icecast.skyrock.net/s/natio_mp3_128k",
    genre: "Hip-Hop",
  },
  // Reggaeton stanice
  {
    id: "14",
    name: "100% Reggaeton Radio",
    frequency: "Web",
    url: "https://stream.zeno.fm/8wup8yd9dm0uv",
    genre: "Reggaeton",
  },
  {
    id: "18",
    name: "Clásicos Reggaeton 24/7 (Medellín, Kolumbie)",
    frequency: "Web",
    url: "https://stream.zeno.fm/2g1qkn4cbpeuv",
    genre: "Reggaeton",
  },
  // Ostatní stanice
  {
    id: "7",
    name: "Fajn Radio",
    frequency: "Web",
    url: "http://ice.radia.cz/fajn128.mp3",
    genre: "Pop/Hity",
  },
  {
    id: "13",
    name: "Radio SPIN",
    frequency: "96.2 FM",
    url: "https://icecast4.play.cz/spin128.mp3",
    genre: "Pop/Rock",
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
  },
  // ČRo stanice (na konci)
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
];
