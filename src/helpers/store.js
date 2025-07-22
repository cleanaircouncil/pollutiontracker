import { atom, map } from "nanostores";
import theData from "../data/data.json";


export const currentFacilitySlug = atom("");
export const attachment = map(null)

export const data = theData;

export function getFacilityBySlug(slug) {
  return data.facilities.find( facility => facility.slug === slug );
}