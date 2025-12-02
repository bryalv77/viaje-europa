export interface TripItem {
  id: string;
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
  tripId?: string;
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
  id?: string; // Optional because it's added by getTrip and not always present when creating
  name: string;
  description: string;
  userId: string;
  items?: { [key: string]: TripItem };
  participants?: ParticipantObject;
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