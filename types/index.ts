export interface TripItem {
  id: number;
  initial_date: string;
  initial_time: string;
  end_date: string;
  end_time: string;
  initial_place: string;
  final_place: string;
  type: string;
  description: string;
  participants: string[];
  info: string;
  maps_url: string;
  geolocatition?: string;
  flight: string;
  reservation: string;
  hand_equipment: string;
  facturation_equipment: string;
  file: string;
  price: string;
  payed_price: string;
  price_cecy: string;
  payed_price_cecy: string;
}

export interface TripItemObject {
  [key: string]: TripItem;
}

export interface UserData {
  uid: string;
  name: string;
  email: string;
  role: 'client' | 'admin';
  trips?: string[];
}

export interface Trip {
  items?: { [key: string]: TripItem };
  participants: ParticipantObject;
  tripId: string;
}

export type ParticipantObject = {
  [key: string]: Participant;
};

export interface Participant {
  name: string;
  participantId: string;
  color: string;
  avatarUrl?: string;
}