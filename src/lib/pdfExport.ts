import { HazardReport } from '@/types';

export function generateWorkOrderHTML(hazards: HazardReport[], crewName: string = 'Zone-IV Rapid Action Crew'): string {
  const dateStr = new Date().toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
  const orderNumber = `GVMC-WO-2026-${Math.floor(1000 + Math.random() * 9000)}`;

  const totalAsphalt = hazards
    .reduce((sum, h) => sum + (h.estimated_asphalt_m3 || 0.6), 0)
    .toFixed(2);

  const rows = hazards
    .map(
      (h, idx) => `
    <tr style="border-bottom: 1px solid #e2e8f0;">
      <td style="padding: 10px 8px; font-weight: bold; font-family: monospace;">${idx + 1}</td>
      <td style="padding: 10px 8px;">
        <div style="font-weight: 700; color: #0b2545;">${h.id} - ${h.title}</div>
        <div style="font-size: 11px; color: #475569;">${h.location}</div>
        <div style="font-size: 10px; color: #028090;">GPS: ${h.coordinates.lat.toFixed(4)}° N, ${h.coordinates.lng.toFixed(4)}° E</div>
      </td>
      <td style="padding: 10px 8px;">
        <span style="display: inline-block; padding: 2px 8px; border-radius: 9999px; font-size: 11px; font-weight: bold; background: ${
          h.severity === 'Critical'
            ? '#fee2e2; color: #dc2626;'
            : h.severity === 'High'
            ? '#ffedd5; color: #ea580c;'
            : '#fef3c7; color: #d97706;'
        }">
          ${h.severity} (${h.risk_score})
        </span>
      </td>
      <td style="padding: 10px 8px; font-size: 12px;">
        ${h.width_cm}cm × ${h.depth_cm}cm
      </td>
      <td style="padding: 10px 8px; font-size: 12px; font-weight: 600;">
        ${(h.estimated_asphalt_m3 || 0.6).toFixed(2)} m³
      </td>
      <td style="padding: 10px 8px; font-size: 11px; color: #334155;">
        ${h.why_ranked_here}
      </td>
    </tr>
  `
    )
    .join('');

  return `
    <div id="work-order-document" style="font-family: 'Inter', system-ui, sans-serif; color: #0f172a; padding: 24px; max-width: 900px; margin: 0 auto; background: #ffffff;">
      <!-- GVMC Official Letterhead -->
      <div style="border-bottom: 3px double #0b2545; padding-bottom: 16px; margin-bottom: 20px;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <div>
            <div style="font-size: 12px; text-transform: uppercase; letter-spacing: 1.5px; color: #006b5f; font-weight: 800;">
              Government of Andhra Pradesh • Municipal Administration
            </div>
            <h1 style="margin: 4px 0; font-size: 22px; color: #0b2545; font-family: 'Plus Jakarta Sans', sans-serif;">
              GREATER VISAKHAPATNAM MUNICIPAL CORPORATION (GVMC)
            </h1>
            <div style="font-size: 13px; color: #334155; font-weight: 600;">
              Engineering Department • Road Infrastructure Rapid Triage Division (CivicLens Telemetry)
            </div>
          </div>
          <div style="text-align: right;">
            <div style="background: #eff4ff; border: 1px solid #bfdbfe; padding: 6px 12px; border-radius: 8px;">
              <div style="font-size: 10px; text-transform: uppercase; color: #1e40af; font-weight: 700;">Work Order No.</div>
              <div style="font-size: 15px; font-weight: 800; font-family: monospace; color: #0b2545;">${orderNumber}</div>
            </div>
          </div>
        </div>
        <div style="display: flex; justify-content: space-between; margin-top: 14px; font-size: 12px; color: #475569; background: #f8fafc; padding: 8px 12px; border-radius: 6px;">
          <div><strong>Date of Issuance:</strong> ${dateStr}</div>
          <div><strong>Assigned Crew:</strong> ${crewName}</div>
          <div><strong>Total Hazards:</strong> ${hazards.length} Sites</div>
          <div><strong>Total Asphalt Mix:</strong> ${totalAsphalt} m³</div>
        </div>
      </div>

      <!-- Actionable Hazards Table -->
      <table style="width: 100%; border-collapse: collapse; text-align: left; margin-bottom: 24px;">
        <thead>
          <tr style="background: #0b2545; color: #ffffff; font-size: 11px; text-transform: uppercase;">
            <th style="padding: 10px 8px; width: 30px;">#</th>
            <th style="padding: 10px 8px;">Hazard ID & Location</th>
            <th style="padding: 10px 8px; width: 100px;">Triage Severity</th>
            <th style="padding: 10px 8px; width: 90px;">Dimensions</th>
            <th style="padding: 10px 8px; width: 90px;">Est. Asphalt</th>
            <th style="padding: 10px 8px;">Engineering Priority Justification</th>
          </tr>
        </thead>
        <tbody>
          ${rows}
        </tbody>
      </table>

      <!-- Execution Instructions & Signatures -->
      <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 20px; border-top: 1px solid #e2e8f0; padding-top: 16px; margin-top: 16px;">
        <div style="font-size: 11px; color: #475569; line-height: 1.5;">
          <strong>Standard Operating Protocol (SOP-RT-04):</strong>
          <ol style="margin: 4px 0 0 16px; padding: 0;">
            <li>Deploy reflective safety cones 20m ahead of each hazard.</li>
            <li>Cold-milling and tack-coat application mandatory prior to hot-mix compaction.</li>
            <li>Post-repair verification photo must be uploaded via CivicLens AE portal for ticket closure.</li>
          </ol>
        </div>
        <div style="text-align: right; padding-top: 24px;">
          <div style="border-top: 1px solid #94a3b8; display: inline-block; width: 180px; text-align: center; font-size: 12px; font-weight: 700; color: #0b2545;">
            Superintending Engineer
            <div style="font-size: 10px; font-weight: normal; color: #64748b;">GVMC Smart City Mission</div>
          </div>
        </div>
      </div>
    </div>
  `;
}

export async function exportWorkOrderPDF(hazards: HazardReport[], crewName: string = 'Ward 18 Rapid Action Road Crew Alpha'): Promise<void> {
  const htmlContent = generateWorkOrderHTML(hazards, crewName);

  // Check if running in browser
  if (typeof window === 'undefined') return;

  // Use dynamic script injection for html2pdf if available, or native print preview window
  const printWindow = window.open('', '_blank', 'width=950,height=800');
  if (printWindow) {
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>GVMC Work Order - CivicLens Dispatch</title>
          <style>
            @media print {
              body { margin: 0; padding: 10mm; }
              @page { size: A4; margin: 10mm; }
            }
          </style>
        </head>
        <body onload="window.print();">
          ${htmlContent}
        </body>
      </html>
    `);
    printWindow.document.close();
  }
}
