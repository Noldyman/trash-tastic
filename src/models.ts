export interface AddressInfo {
  bagid: string;
  postcode: string;
  huisnummer: number;
  huisletter: string;
  toevoeging: string;
  description: string;
  straat: string;
  woonplaats: string;
  woonplaatsId: number;
  gemeenteId: number;
  latitude: number;
  longitude: number;
}

export interface WasteStream {
  id: number;
  parent_id: number;
  title: string;
  slug: string | null;
  tags: string | null;
  page_title: string;
  content: string;
  menu_title: string;
  icon: string;
  icon_data: string;
  ophaaldatum: string | null;
}

export interface PickupDate {
  afvalstroom_id: number;
  /**Format: yyyy-MM-dd*/
  ophaaldatum: string;
}
