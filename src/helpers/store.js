import { atom, map } from "nanostores";
import theData from "../data/map-data.json";

export const data = theData;

export const currentFacilitySlug = atom("");
export const search = atom("");
export const attachment = map(null)
export const resultCount = atom(data.facilities.length);
export const totalFacilities = atom(data.facilities.length);

export function getFacilityBySlug(slug) {
  return data.facilities.find( facility => facility.slug === slug );
}