export const site = {
  name: "Strada Racing Studio",
  tagline: "From a vision to the starting grid",
  city: "Hyderabad, Telangana",
  mapsUrl: "https://maps.app.goo.gl/hDKVNBzJruQDoxQX8",
  instagram: "stradaracingstudio",
  phones: [
    { display: "+91 85006 19593", tel: "+918500619593" },
    { display: "+91 89193 36136", tel: "+918919336136" },
  ],
  whatsapp: "918500619593",
  // 24h clock. Last session must finish by closing time.
  hours: { open: 11, close: 23, label: "Open daily · 11 AM – 11 PM" },
  rigs: 6,
  bookingWindowDays: 14,
} as const;

export type Plan = {
  id: string;
  name: string;
  minutes: number;
  price: number;
  perDriver: boolean;
  summary: string;
  featured?: boolean;
};

export const plans: Plan[] = [
  {
    id: "sprint",
    name: "Sprint",
    minutes: 30,
    price: 499,
    perDriver: true,
    summary: "A quick taste. Learn the car, set a lap, race once.",
  },
  {
    id: "grand-prix",
    name: "Grand Prix",
    minutes: 60,
    price: 899,
    perDriver: true,
    summary: "Practice, qualifying and a full race weekend in an hour.",
    featured: true,
  },
  {
    id: "endurance",
    name: "Endurance",
    minutes: 120,
    price: 1599,
    perDriver: true,
    summary: "Two hours in the seat. Multiple circuits, multiple races.",
  },
  {
    id: "private-grid",
    name: "Private Grid",
    minutes: 60,
    price: 4999,
    perDriver: false,
    summary: "All six rigs, just your group. Birthdays, teams, rivalries.",
  },
];

export const rupees = (n: number) => `₹${n.toLocaleString("en-IN")}`;

export const duration = (minutes: number) =>
  minutes < 60 ? `${minutes} min` : `${minutes / 60} hr${minutes > 60 ? "s" : ""}`;
