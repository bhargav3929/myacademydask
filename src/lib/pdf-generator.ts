
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { format } from "date-fns";
import type { DateRange } from "react-day-picker";
import type { ProcessedReport, NewJoiner, RevenueData } from "@/components/reports/report-types";

interface GeneratePdfProps {
  reportData: ProcessedReport;
  newJoiners: NewJoiner[];
  revenueData: RevenueData;
  stadiumName: string;
  dateRange: DateRange;
}

const getPercentageClass = (percentage: number) => {
    if (percentage >= 90) return "percentage-high";
    if (percentage >= 60) return "percentage-medium";
    return "percentage-low";
};

const generateReportHTML = ({ reportData, newJoiners, revenueData, stadiumName, dateRange }: GeneratePdfProps): string => {
    const { dates, studentData, summary } = reportData;

    const attendanceRows = studentData.map(student => `
        <tr>
            <td>${student.name}</td>
            ${dates.map(date => {
                const status = student.attendance[format(date, "yyyy-MM-dd")];
                if (status === 'present') return `<td class="present">✓</td>`;
                if (status === 'absent') return `<td class="absent">✗</td>`;
                return `<td>-</td>`;
            }).join('')}
            <td class="summary-cell">${student.presents}</td>
            <td class="summary-cell">${student.absents}</td>
            <td class="percentage-cell ${getPercentageClass(student.percentage)}">${student.percentage}%</td>
        </tr>
    `).join('');

    const joinerRows = newJoiners.map(joiner => `
        <tr>
            <td>${joiner.name}</td>
            <td class="join-date">${format(joiner.joinDate, "MMM dd, yyyy")}</td>
            <td>${joiner.coachName}</td>
        </tr>
    `).join('');

    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <title>Premium Attendance Report</title>
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: 'Inter', sans-serif; background-color: #ffffff; color: #374151; line-height: 1.6; }
            .report-container { max-width: 1200px; margin: 0 auto; background: white; }
            .page-wrapper {
                padding: 30px;
                border: 2px solid #1E3A8A;
                min-height: calc(100vh - 60px);
                position: relative;
                margin: 0;
            }
            .page-break { page-break-after: always; }
            .header { background: linear-gradient(135deg, #1E3A8A 0%, #3B82F6 100%); color: white; padding: 24px; display: flex; justify-content: space-between; align-items: center; }
            .stadium-name { font-size: 24px; font-weight: 700; }
            .report-title { font-size: 20px; font-weight: 600; text-align: center; flex-grow: 1; }
            .date-range { font-size: 13px; font-weight: 400; text-align: right; }
            .content { padding: 30px 10px; }
            .section { margin-bottom: 32px; }
            .section-title { font-size: 18px; font-weight: 600; color: #1E3A8A; margin-bottom: 16px; border-bottom: 2px solid #E5E7EB; padding-bottom: 6px; }
            .attendance-table { width: 100%; border-collapse: collapse; overflow: hidden; font-size: 10px; }
            .attendance-table th { background: linear-gradient(135deg, #1E3A8A 0%, #3B82F6 100%); color: white; padding: 10px 6px; font-weight: 600; text-align: center; }
            .attendance-table th:first-child { text-align: left; width: 120px; }
            .attendance-table th.summary-col { background: linear-gradient(135deg, #047857 0%, #10B981 100%); }
            .attendance-table td { padding: 8px 6px; border: 1px solid #E5E7EB; text-align: center; }
            .attendance-table td:first-child { text-align: left; font-weight: 500; }
            .attendance-table tr:nth-child(even) { background-color: #F9FAFB; }
            .present { color: #10B981; font-weight: 600; font-size: 12px; }
            .absent { color: #EF4444; font-weight: 600; font-size: 12px; }
            .summary-cell, .percentage-cell { font-weight: 600; }
            .percentage-high { color: #10B981; } .percentage-medium { color: #F59E0B; } .percentage-low { color: #EF4444; }
            
            .summary-card { background: #F9FAFB; border-radius: 12px; padding: 24px; border: 1px solid #E5E7EB; }
            .summary-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; }
            .summary-item { display: flex; align-items: center; gap: 12px; }
            .summary-icon { font-size: 24px; width: 48px; height: 48px; background: white; border-radius: 12px; display: flex; align-items: center; justify-content: center; box-shadow: 0 1px 3px rgba(0,0,0,0.05); }
            .summary-label { font-size: 13px; color: #6B7280; font-weight: 500; }
            .summary-value { font-size: 22px; font-weight: 700; color: #1E3A8A; }
            
            .joiners-table { width: 100%; border-collapse: collapse; }
            .joiners-table th { background: linear-gradient(135deg, #047857 0%, #10B981 100%); color: white; padding: 10px; font-weight: 600; text-align: left; font-size: 13px; }
            .joiners-table td { padding: 10px; border-bottom: 1px solid #E5E7EB; font-size: 12px; }
            .joiners-table tr:nth-child(even) td { background-color: #F9FAFB; }
            .join-date { font-weight: 500; color: #047857; }
        </style>
    </head>
    <body>
        <div class="report-container">
            <div class="page-wrapper">
                <div class="header">
                    <div class="stadium-name">${stadiumName}</div>
                    <div class="report-title">Attendance Report</div>
                    <div class="date-range">
                        ${dateRange.to ? `${format(dateRange.from!, 'MMM d, yyyy')} – ${format(dateRange.to, 'MMM d, yyyy')}` : format(dateRange.from!, 'MMMM yyyy')}<br>
                        Generated: ${format(new Date(), 'MMM d, yyyy')}
                    </div>
                </div>
                
                <div class="content">
                    <div class="section">
                        <h2 class="section-title">Attendance Register</h2>
                        <table class="attendance-table">
                            <thead>
                                <tr>
                                    <th>Student Name</th>
                                    ${dates.map(d => `<th>${format(d, 'd')}</th>`).join('')}
                                    <th class="summary-col">P</th>
                                    <th class="summary-col">A</th>
                                    <th class="summary-col">%</th>
                                </tr>
                            </thead>
                            <tbody>${attendanceRows}</tbody>
                        </table>
                    </div>
                    <div class="section">
                        <h2 class="section-title">Report Summary</h2>
                        <div class="summary-grid">
                            <div class="summary-item"><div class="summary-icon">👥</div><div><div class="summary-label">Total Students</div><div class="summary-value">${summary.totalStudents}</div></div></div>
                            <div class="summary-item"><div class="summary-icon">📊</div><div><div class="summary-label">Average Attendance</div><div class="summary-value">${summary.averageAttendance}%</div></div></div>
                            <div class="summary-item"><div class="summary-icon">🌟</div><div><div class="summary-label">Perfect Attendance</div><div class="summary-value">${summary.alwaysPresent.length}</div></div></div>
                            <div class="summary-item"><div class="summary-icon">⚠️</div><div><div class="summary-label">Below 60% Attendance</div><div class="summary-value">${summary.below60Attendance.length}</div></div></div>
                            <div class="summary-item"><div class="summary-icon">💰</div><div><div class="summary-label">Total Revenue</div><div class="summary-value">$${revenueData.totalRevenue.toLocaleString()}</div></div></div>
                            <div class="summary-item"><div class="summary-icon">📈</div><div><div class="summary-label">Growth (vs Last Period)</div><div class="summary-value">${revenueData.growth > 0 ? `+${revenueData.growth}` : revenueData.growth}%</div></div></div>
                        </div>
                    </div>
                    <div class="section">
                        <h2 class="section-title">New Joiners</h2>
                        <table class="joiners-table">
                            <thead><tr><th>Name</th><th>Join Date</th><th>Assigned Coach</th></tr></thead>
                            <tbody>${joinerRows.length > 0 ? joinerRows : `<tr><td colspan="3" style="text-align:center; padding: 20px;">No new students in this period.</td></tr>`}</tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    </body>
    </html>
    `;
};


export const generatePdf = async (props: GeneratePdfProps) => {
    const reportHtml = generateReportHTML(props);
    
    // Create an off-screen iframe to render the HTML
    const iframe = document.createElement('iframe');
    iframe.style.position = 'absolute';
    iframe.style.width = '1200px';
    iframe.style.height = '1697px'; // A4 landscape-ish aspect ratio
    iframe.style.left = '-9999px';
    document.body.appendChild(iframe);

    const iframeDoc = iframe.contentWindow?.document;
    if (!iframeDoc) {
        document.body.removeChild(iframe);
        throw new Error("Could not create iframe for PDF generation.");
    }
    
    iframeDoc.open();
    iframeDoc.write(reportHtml);
    iframeDoc.close();

    await new Promise(resolve => setTimeout(resolve, 1500)); // Wait for render

    const reportContainer = iframeDoc.body.firstElementChild as HTMLElement;
    if (!reportContainer) {
        document.body.removeChild(iframe);
        throw new Error("Report container not found in iframe.");
    }

    const canvas = await html2canvas(reportContainer, {
        scale: 2,
        useCORS: true,
        logging: false,
        width: 1200,
        windowWidth: 1200,
    });

    document.body.removeChild(iframe);

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'px',
        format: 'a4',
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;
    const ratio = canvasWidth / pdfWidth;
    const pageHeight = canvasHeight / ratio;

    let heightLeft = pageHeight;
    let position = 0;

    pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pageHeight);
    heightLeft -= pdfHeight;

    while (heightLeft > 0) {
        position = heightLeft - pageHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pageHeight);
        heightLeft -= pdfHeight;
    }
    
    pdf.save(`CourtCommand_Report_${props.stadiumName.replace(/ /g, '_')}_${format(new Date(), 'yyyy-MM-dd')}.pdf`);
};
