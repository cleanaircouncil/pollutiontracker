const permitData = {
  CAA: {
    short: "Air",
    long: "Clean Air Act",
    icon: "fa-fan",
  },
  CWA: {
    short: "Water",
    long: "Clean Water Act",
    icon: "fa-water",
  },
  RCRA: {
    short: "Waste",
    long: "Resource Conservation and Recovery Act",
    icon: "fa-arrows-spin",
  },
  EPCRA: {
    short: "Chemical",
    long: "Emergency Planning and Community Right-to-Know Act",
    icon: "fa-vial",
  },
  CERCLA: {
    short: "Hazardous",
    long: "Comprehensive Environmental Response, Compensation, and Liability Act (Superfund)",
    icon: "fa-triangle-exclamation",
  },
  TSCA: {
    short: "Toxins",
    long: "Toxic Substances Control Act",
    icon: "fa-skull-crossbones",
  },
};

export default {
  short: permit => permitData[permit.statute].short,
  long: permit => permitData[permit.statute].long,
  icon: permit => permitData[permit.statute].icon,
  classes: permit =>`permit--${ permitData[permit.statute].short.toLowerCase() } permit--${ permit.status }`
}