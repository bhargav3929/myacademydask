
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
    if (percentage >= 90) return 'percentage-high';
    if (percentage >= 60) return 'percentage-medium';
    return 'percentage-low';
}

const generateReportHTML = (props: GeneratePdfProps): string => {
    const { reportData, newJoiners, revenueData, stadiumName, dateRange } = props;

    const attendanceHeader = reportData.dates.map(date => `<th>${format(date, 'd')}</th>`).join('');
    
    const attendanceBody = reportData.studentData.map(student => `
        <tr>
            <td>${student.name}</td>
            ${reportData.dates.map(date => {
                const status = student.attendance[format(date, "yyyy-MM-dd")];
                if (status === 'present') return `<td class="present">✔</td>`;
                if (status === 'absent') return `<td class="absent">✘</td>`;
                return `<td>-</td>`;
            }).join('')}
            <td class="summary-cell">${student.presents}</td>
            <td class="summary-cell">${student.absents}</td>
            <td class="percentage-cell ${getPercentageClass(student.percentage)}">${student.percentage}%</td>
        </tr>
    `).join('');

    const newJoinersBody = newJoiners.map(joiner => `
        <tr>
            <td>${joiner.name}</td>
            <td>${format(joiner.joinDate, 'MMM d, yyyy')}</td>
            <td>${joiner.coachName}</td>
            <td>${joiner.stadiumName}</td>
        </tr>
    `).join('');

    const dateRangeText = dateRange.to 
        ? `${format(dateRange.from!, 'LLL dd, yyyy')} - ${format(dateRange.to, 'LLL dd, yyyy')}` 
        : format(dateRange.from!, 'LLLL yyyy');

    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>Premium Attendance Report</title>
      <style>
        body { font-family: 'Inter', sans-serif; background: #fff; color: #374151; margin: 0; padding: 0; }
        .report-container { max-width: 1100px; margin: auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #1E3A8A 0%, #3B82F6 100%); color: white; padding: 24px; display: flex; justify-content: space-between; align-items: center; }
        .stadium-name { font-size: 24px; font-weight: 700; }
        .report-title { font-size: 20px; font-weight: 600; flex-grow: 1; text-align: center; }
        .date-range { font-size: 14px; text-align: right; }
        .header-divider { height: 4px; background: linear-gradient(90deg, #047857, #10B981); }
        .section-title { font-size: 18px; font-weight: 600; color: #1E3A8A; margin: 24px 0 12px; border-bottom: 2px solid #E5E7EB; padding-bottom: 6px; }
        .attendance-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 10px; }
        .attendance-table th { background: linear-gradient(135deg, #1E3A8A, #3B82F6); color: white; padding: 8px 4px; font-size: 10px; }
        .attendance-table th.summary-col { background: linear-gradient(135deg, #047857, #10B981); }
        .attendance-table td { padding: 6px 4px; text-align: center; border: 1px solid #E5E7EB; font-size: 10px; }
        .attendance-table td:first-child { text-align: left; font-weight: 600; }
        .present { color: #10B981; font-weight: 700; }
        .absent { color: #EF4444; font-weight: 700; }
        .summary-cell, .percentage-cell { font-weight: bold; }
        .percentage-high { color: #10B981; }
        .percentage-medium { color: #F59E0B; }
        .percentage-low { color: #EF4444; }
        .summary-card { background: #F9FAFB; padding: 20px; border-radius: 12px; margin-bottom: 20px; }
        .summary-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }
        .summary-item { display: flex; align-items: center; gap: 12px; }
        .summary-icon { font-size: 22px; width: 40px; height: 40px; background: white; border-radius: 10px; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .summary-label { font-size: 13px; color: #6B7280; }
        .summary-value { font-size: 20px; font-weight: 700; color: #1E3A8A; }
        .joiners-table { width: 100%; border-collapse: collapse; }
        .joiners-table th { background: linear-gradient(135deg, #047857, #10B981); color: white; padding: 10px; text-align: left; }
        .joiners-table td { padding: 10px; border: 1px solid #E5E7EB; }
        .joiners-table tr:nth-child(even) td { background: #F9FAFB; }
        .footer { border-top: 2px solid #E5E7EB; margin-top: 30px; padding: 10px; display: flex; justify-content: space-between; font-size: 12px; color: #6B7280; }
        /* Fix for html2canvas rendering */
        body { -webkit-print-color-adjust: exact; color-adjust: exact; }
      </style>
    </head>
    <body>
      <div class="report-container" id="report-content">
        <div class="header">
          <div class="stadium-name">${stadiumName}</div>
          <div class="report-title">Attendance Report</div>
          <div class="date-range">${dateRangeText}<br>Generated: ${format(new Date(), 'LLL d, yyyy')}</div>
        </div>
        <div class="header-divider"></div>
        <h2 class="section-title">Attendance Register</h2>
        <table class="attendance-table">
          <thead><tr><th>Student Name</th>${attendanceHeader}<th class="summary-col">P</th><th class="summary-col">A</th><th class="summary-col">%</th></tr></thead>
          <tbody>${attendanceBody}</tbody>
        </table>
        <h2 class="section-title">Summary</h2>
        <div class="summary-card">
          <div class="summary-grid">
            <div class="summary-item"><div class="summary-icon">👥</div><div><div class="summary-label">Total Students</div><div class="summary-value">${reportData.summary.totalStudents}</div></div></div>
            <div class="summary-item"><div class="summary-icon">📊</div><div><div class="summary-label">Average Attendance</div><div class="summary-value">${reportData.summary.averageAttendance}%</div></div></div>
            <div class="summary-item"><div class="summary-icon">🌟</div><div><div class="summary-label">Perfect Attendance</div><div class="summary-value">${reportData.summary.alwaysPresent.length}</div></div></div>
            <div class="summary-item"><div class="summary-icon">❌</div><div><div class="summary-label">0% Attendance</div><div class="summary-value">${reportData.summary.zeroAttendance.length}</div></div></div>
          </div>
        </div>
        <h2 class="section-title">Revenue</h2>
        <div class="summary-card">
          <div class="summary-grid">
            <div class="summary-item"><div class="summary-icon">💰</div><div><div class="summary-label">Total Revenue</div><div class="summary-value">$${revenueData.totalRevenue.toLocaleString()}</div></div></div>
            <div class="summary-item"><div class="summary-icon">📅</div><div><div class="summary-label">Month</div><div class="summary-value">${revenueData.monthName}</div></div></div>
            <div class="summary-item"><div class="summary-icon">🏆</div><div><div class="summary-label">Highest Day</div><div class="summary-value">${revenueData.highestRevenueDay.date ? `${format(new Date(revenueData.highestRevenueDay.date), 'LLL d')} – $${revenueData.highestRevenueDay.amount.toLocaleString()}` : 'N/A'}</div></div></div>
            <div class="summary-item"><div class="summary-icon">📈</div><div><div class="summary-label">Growth</div><div class="summary-value">${revenueData.growth}%</div></div></div>
          </div>
        </div>
        ${newJoinersBody.length > 0 ? `
            <h2 class="section-title">New Students</h2>
            <table class="joiners-table">
                <thead><tr><th>Name</th><th>Join Date</th><th>Coach</th><th>Stadium</th></tr></thead>
                <tbody>${newJoinersBody}</tbody>
            </table>
        ` : ''}
      </div>
    </body>
    </html>
    `;
};


export const generatePdf = async (props: GeneratePdfProps) => {
    const reportHtml = generateReportHTML(props);
    const { stadiumName } = props;

    // Create a hidden iframe to render the HTML
    const iframe = document.createElement('iframe');
    iframe.style.position = 'absolute';
    iframe.style.width = '1200px';
    iframe.style.height = '1px';
    iframe.style.opacity = '0';
    iframe.style.border = 'none';
    document.body.appendChild(iframe);

    const iFrameDoc = iframe.contentWindow?.document;
    if (!iFrameDoc) {
        document.body.removeChild(iframe);
        throw new Error("Could not access iframe document.");
    }
    
    iFrameDoc.open();
    iFrameDoc.write(reportHtml);
    iFrameDoc.close();

    await new Promise(resolve => setTimeout(resolve, 1000)); // Wait for render

    const reportElement = iFrameDoc.getElementById('report-content');
    if (!reportElement) {
        document.body.removeChild(iframe);
        throw new Error('Report content not found in rendered HTML.');
    }

    const canvas = await html2canvas(reportElement, {
        scale: 2, // Higher scale for better quality
        useCORS: true,
        logging: false,
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'pt',
        format: 'a4',
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;
    const ratio = canvasWidth / pdfWidth;
    const imgHeight = canvasHeight / ratio;

    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
    heightLeft -= pdfHeight;

    while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
        heightLeft -= pdfHeight;
    }
    
    pdf.save(`CourtCommand_Report_${stadiumName.replace(/ /g, '_')}_${format(new Date(), 'yyyy-MM-dd')}.pdf`);
    
    // Cleanup
    document.body.removeChild(iframe);
};
