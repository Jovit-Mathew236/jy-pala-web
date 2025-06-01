export interface Parish {
  id: string;
  name: string;
}

export interface Forane {
  id: string;
  name: string;
  fullName: string;
  totalParishes: number;
  parishes: Parish[];
}

export interface ContactPerson {
  $id: string;
  id: string;
  name: string;
  phone: string;
  forane: string;
  parish: string;
  dob: string;
  createdAt: string;
  updatedAt: string;
}
