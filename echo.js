const epaCall = ( id ) => `https://echodata.epa.gov/echo/dfr_rest_services.get_dfr?p_id=${id}&p_echo=Y`

const kinds = {
  CAA: "Air",
  CWA: "Water",
  RCRA: "Waste",
  EPCRA: "Chemical",
  CERCLA: "Hazardous",
  TSCA: "Toxins"
}

export const EchoStatus = {
  VALID: "valid",
  VIOLATION: "violation",
  TERMINATED: "terminated"
}



const getStatus = (status) => {
  if( ["Terminated Permit"].includes(status) )
    return EchoStatus.TERMINATED;
  else if( ["High Priority Violation", "Violation w/in 1 Year", "Violation Identified"].includes(status) )
    return EchoStatus.VIOLATION;
  else
    return EchoStatus.VALID;
}

async function fetchEPADataForUrl(url) {
  try {
    const id = url.replace(/.*fid=(\d*).*/, "$1");
    const request = epaCall(id);
    const response = await fetch(request);
    const json = await response.json();
    
    const permits = json?.Results?.EnforcementComplianceSummaries?.Summaries.map( summary => ({
      statute: summary.Statute,
      type: kinds[summary.Statute] || "",
      last_inspection: summary.LastInspection,
      status: getStatus( summary.CurrentStatus ),
      status_text: summary.CurrentStatus || "In Compliance",
      penalties: summary.TotalPenalties ? parseFloat(summary.TotalPenalties.replace(/[^\d]*/g, '')) : 0
    }))

    return permits || [];
  } catch(e) {
    return [];
  }
}

export default fetchEPADataForUrl;