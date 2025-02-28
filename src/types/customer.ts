export interface Customer {
  id: number;
  ref: string;
  name: string;
  icon: string;
  color: string;
  latitude: number;
  longitude: number;
  city: string;
  substate: string;
  state: string;
  street: string;
  street2: string;
  phone: string;
  mobile: string;
  image_1920: string;
  pos_url: string;
  partner_custom_attributes: CustomAttributeValue[];
  stats: CustomerStats[];
}

export interface CustomAttributeValue {
  label: string;
  value: string;
  icon: string;
  color: string;
}

export interface CustomerStats {
  label: string;
  value: string;
}

export interface CustomerFilter {
  hint: "text" | "bool" | "selection";
  label: string;
  name: string;
  values: null | CustomerFilterValue[];
}

export interface CustomerFilterValue {
  id: number | string;
  label: string;
}

export interface CustomerQueryParams {
  actor_ids: number[];
  filters: CustomerFilterInput[];
  date_from: Date | null;
  date_to: Date | null;
}

export interface CustomerFilterInput {
  name: string;
  values: number[] | boolean | string[];
}

export interface CustomerInfoParams {
  id: number;
  actor_ids: number[];
  date_from: Date | null;
  date_to: Date | null;
}
