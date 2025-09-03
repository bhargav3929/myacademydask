
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
            <td>${joiner.stadiumName}</td>
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
            .page-break { page-break-after: always; }
            .header { background: linear-gradient(135deg, #1E3A8A 0%, #3B82F6 100%); color: white; padding: 32px; display: flex; justify-content: space-between; align-items: center; }
            .stadium-name { font-size: 28px; font-weight: 700; }
            .report-title { font-size: 24px; font-weight: 600; text-align: center; flex-grow: 1; }
            .date-range { font-size: 14px; font-weight: 400; text-align: right; }
            .header-divider { height: 3px; background: linear-gradient(90deg, #047857, #10B981); }
            .content { padding: 40px; }
            .section { margin-bottom: 32px; }
            .section-title { font-size: 20px; font-weight: 600; color: #1E3A8A; margin-bottom: 20px; border-bottom: 2px solid #E5E7EB; padding-bottom: 8px; }
            .attendance-table { width: 100%; border-collapse: collapse; overflow: hidden; }
            .attendance-table th { background: linear-gradient(135deg, #1E3A8A 0%, #3B82F6 100%); color: white; padding: 12px; font-weight: 600; font-size: 13px; text-align: center; }
            .attendance-table th:first-child { text-align: left; min-width: 150px; }
            .attendance-table th.summary-col { background: linear-gradient(135deg, #047857 0%, #10B981 100%); }
            .attendance-table td { padding: 10px 12px; border-bottom: 1px solid #E5E7EB; text-align: center; font-size: 13px; }
            .attendance-table td:first-child { text-align: left; font-weight: 500; }
            .attendance-table tr:nth-child(even) { background-color: #F9FAFB; }
            .present { color: #10B981; font-weight: 600; font-size: 16px; }
            .absent { color: #EF4444; font-weight: 600; font-size: 16px; }
            .summary-cell, .percentage-cell { font-weight: 600; }
            .percentage-high { color: #10B981; } .percentage-medium { color: #F59E0B; } .percentage-low { color: #EF4444; }
            .summary-card { background: #F9FAFB; border-radius: 16px; padding: 24px; border: 1px solid #E5E7EB; }
            .summary-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 24px; }
            .summary-item { display: flex; align-items: center; gap: 16px; }
            .summary-icon { font-size: 28px; width: 52px; height: 52px; background: white; border-radius: 12px; display: flex; align-items: center; justify-content: center; box-shadow: 0 1px 3px rgba(0,0,0,0.05); }
            .summary-label { font-size: 14px; color: #6B7280; font-weight: 500; }
            .summary-value { font-size: 24px; font-weight: 700; color: #1E3A8A; }
            .joiners-table { width: 100%; border-collapse: collapse; }
            .joiners-table th { background: linear-gradient(135deg, #047857 0%, #10B981 100%); color: white; padding: 12px; font-weight: 600; text-align: left; }
            .joiners-table td { padding: 12px; border-bottom: 1px solid #E5E7EB; }
            .joiners-table tr:nth-child(even) td { background-color: #F9FAFB; }
            .join-date { font-weight: 500; color: #047857; }
        </style>
    </head>
    <body>
        <div class="report-container">
            <div class="header">
                <div class="stadium-name">${stadiumName}</div>
                <div class="report-title">Monthly Attendance Report</div>
                <div class="date-range">
                    ${format(dateRange.from!, 'MMM, yyyy')}<br>
                    Generated: ${format(new Date(), 'MMM d, yyyy')}
                </div>
            </div>
            <div class="header-divider"></div>
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
                    <h2 class="section-title">Summary</h2>
                    <div class="summary-card">
                        <div class="summary-grid">
                            <div class="summary-item"><div class="summary-icon">👥</div><div><div class="summary-label">Total Students</div><div class="summary-value">${summary.totalStudents}</div></div></div>
                            <div class="summary-item"><div class="summary-icon">📊</div><div><div class="summary-label">Average Attendance</div><div class="summary-value">${summary.averageAttendance}%</div></div></div>
                            <div class="summary-item"><div class="summary-icon">🌟</div><div><div class="summary-label">Perfect Attendance</div><div class="summary-value">${summary.alwaysPresent.length}</div></div></div>
                            <div class="summary-item"><div class="summary-icon">⚠️</div><div><div class="summary-label">Below 60% Attendance</div><div class="summary-value">${summary.below60Attendance.length}</div></div></div>
                        </div>
                    </div>
                </div>
                <div class="section">
                    <h2 class="section-title">Revenue Report</h2>
                    <div class="summary-card">
                        <div class="summary-grid">
                             <div class="summary-item"><div class="summary-icon">💰</div><div><div class="summary-label">Total Revenue</div><div class="summary-value">$${revenueData.totalRevenue.toLocaleString()}</div></div></div>
                             <div class="summary-item"><div class="summary-icon">📅</div><div><div class="summary-label">Month</div><div class="summary-value">${revenueData.monthName}</div></div></div>
                             <div class="summary-item"><div class="summary-icon">🏆</div><div><div class="summary-label">Highest Revenue Day</div><div class="summary-value">${revenueData.highestRevenueDay.date ? `${format(new Date(revenueData.highestRevenueDay.date), 'MMM d')} – $${revenueData.highestRevenueDay.amount.toLocaleString()}`: 'N/A'}</div></div></div>
                             <div class="summary-item"><div class="summary-icon">📈</div><div><div class="summary-label">Growth (vs Last Month)</div><div class="summary-value">${revenueData.growth > 0 ? `+${revenueData.growth}` : revenueData.growth}%</div></div></div>
                        </div>
                    </div>
                </div>
                <div class="section">
                    <h2 class="section-title">New Students This Month</h2>
                    <table class="joiners-table">
                        <thead><tr><th>Name</th><th>Join Date</th><th>Assigned Coach</th><th>Stadium</th></tr></thead>
                        <tbody>${joinerRows.length > 0 ? joinerRows : `<tr><td colspan="4" style="text-align:center; padding: 20px;">No new students this month.</td></tr>`}</tbody>
                    </table>
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
    iframe.style.width = '1200px'; // Corresponds to max-width in CSS
    iframe.style.height = '100vh';
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

    await new Promise(resolve => setTimeout(resolve, 1000)); // Wait for render

    const reportContainer = iframeDoc.body.firstElementChild as HTMLElement;
    if (!reportContainer) {
        document.body.removeChild(iframe);
        throw new Error("Report container not found in iframe.");
    }

    const canvas = await html2canvas(reportContainer, {
        scale: 2, // Higher scale for better quality
        useCORS: true,
        logging: false,
    });

    document.body.removeChild(iframe); // Clean up iframe

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
