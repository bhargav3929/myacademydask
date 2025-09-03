
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { format } from "date-fns";
import type { DateRange } from "react-day-picker";
import type { ProcessedReport, NewJoiner } from "@/components/reports/report-types";

interface GeneratePdfProps {
  reportData: ProcessedReport;
  newJoiners: NewJoiner[];
  stadiumName: string;
  dateRange: DateRange;
}

// HSL to RGB conversion
function hslToRgb(h: number, s: number, l: number): [number, number, number] {
    s /= 100;
    l /= 100;
    const k = (n: number) => (n + h / 30) % 12;
    const a = s * Math.min(l, 1 - l);
    const f = (n: number) =>
        l - a * Math.max(-1, Math.min(k(n) - 3, 9 - k(n), 1));
    return [255 * f(0), 255 * f(8), 255 * f(4)];
}

const PRIMARY_COLOR_RGB = hslToRgb(221, 83, 53); // From globals.css --primary
const LOGO_SVG = `
<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M10.6831 4.75L12.0001 2.5L13.3171 4.75L15.5001 5.43301L14.0671 7.25L14.7501 9.5L12.5001 8.31699L10.2501 9.5L10.9331 7.25L9.50006 5.43301L11.6831 4.75Z" stroke="#FFFFFF" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3" stroke="#FFFFFF" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M12 21C14.0755 21 16.0354 20.3162 17.6534 19.1039" stroke="#FFFFFF" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
`;

export const generatePdf = async ({ reportData, newJoiners, stadiumName, dateRange }: GeneratePdfProps) => {
  const doc = new jsPDF({
    orientation: "landscape",
    unit: "px",
    format: "a4",
  });

  const { dates, studentData, summary } = reportData;
  const checkMark = "✓"; 
  const crossMark = "✗"; 

  const addHeader = () => {
    const pageWidth = doc.internal.pageSize.getWidth();
    doc.setFillColor(...PRIMARY_COLOR_RGB);
    doc.rect(0, 0, pageWidth, 60, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    if (LOGO_SVG) {
      doc.addSvgAsImage(LOGO_SVG, 28, 18, 24, 24);
      doc.text("CourtCommand Attendance Report", 60, 35);
    } else {
      doc.text("CourtCommand Attendance Report", 30, 35);
    }

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    const dateRangeText = dateRange.from && dateRange.to 
        ? `${format(dateRange.from, "dd MMM, yyyy")} to ${format(dateRange.to, "dd MMM, yyyy")}`
        : "N/A";
    doc.text(`Stadium: ${stadiumName}`, 30, 80);
    doc.text(`Period: ${dateRangeText}`, pageWidth - 30, 80, { align: "right" });
  };
  
  const addFooter = () => {
    const pageCount = doc.internal.pages.length;
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text(
            `Page ${i} of ${pageCount}`,
            doc.internal.pageSize.getWidth() / 2,
            doc.internal.pageSize.getHeight() - 15,
            { align: 'center' }
        );
         doc.text(
            `Report generated on ${format(new Date(), "dd MMM, yyyy")}`,
            doc.internal.pageSize.getWidth() - 30,
            doc.internal.pageSize.getHeight() - 15,
            { align: 'right' }
        );
    }
  };

  addHeader();

  const tableHead = [
    { content: "Student Name", styles: { halign: 'left' } },
    ...dates.map(date => ({ content: format(date, "d"), styles: { minCellWidth: 15 } })),
    { content: "P", styles: { halign: 'center' } },
    { content: "A", styles: { halign: 'center' } },
    { content: "%", styles: { halign: 'center' } },
  ];

  const tableBody = studentData.map(student => [
    student.name,
    ...dates.map(date => {
        const status = student.attendance[format(date, "yyyy-MM-dd")];
        return status === 'present' ? checkMark : status === 'absent' ? crossMark : '-';
    }),
    student.presents,
    student.absents,
    `${student.percentage}%`
  ]);

  autoTable(doc, {
    startY: 95,
    head: [tableHead],
    body: tableBody,
    theme: "grid",
    headStyles: { fillColor: PRIMARY_COLOR_RGB, textColor: 255, fontSize: 9, fontStyle: 'bold' },
    styles: { fontSize: 8, cellPadding: 2.5, halign: 'center' },
    columnStyles: {
        0: { halign: 'left', cellWidth: 100, fontStyle: 'bold' },
        [dates.length + 1]: { fontStyle: 'bold', halign: 'center' },
        [dates.length + 2]: { fontStyle: 'bold', halign: 'center' },
        [dates.length + 3]: { fontStyle: 'bold', halign: 'center' },
    },
    didParseCell: (data) => {
        if (data.section === 'body' && data.column.index > 0 && data.column.index <= dates.length) {
             if (data.cell.raw === checkMark) data.cell.styles.textColor = [0, 150, 0];
             if (data.cell.raw === crossMark) data.cell.styles.textColor = [200, 0, 0];
        }
         if (data.section === 'body' && data.column.index === dates.length + 3) {
             const percentage = parseInt(String(data.cell.raw).replace('%', ''));
             if (percentage >= 90) data.cell.styles.textColor = [0, 150, 0];
             else if (percentage >= 70) data.cell.styles.textColor = [200, 150, 0];
             else data.cell.styles.textColor = [200, 0, 0];
        }
    }
  });

  let finalY = (doc as any).lastAutoTable.finalY + 25;
  if (finalY > doc.internal.pageSize.getHeight() - 100) {
      doc.addPage();
      finalY = 40;
  }

  // Two-column layout for summary and new joiners
  const summaryBody = [
      ["Total Students", summary.totalStudents],
      ["Avg. Attendance", `${summary.averageAttendance}%`],
      ["Total Revenue", `$${summary.totalRevenue.toLocaleString()}`],
      [{ content: "Perfect Attendance", colSpan: 2, styles: { fontStyle: 'bold', fillColor: [240, 240, 240] }}],
      [{ content: summary.alwaysPresent.join(", ") || "None", colSpan: 2 }],
      [{ content: "Complete Absentees", colSpan: 2, styles: { fontStyle: 'bold', fillColor: [240, 240, 240] }}],
      [{ content: summary.alwaysAbsent.join(", ") || "None", colSpan: 2 }],
  ];
  
  autoTable(doc, {
      startY: finalY,
      head: [[{content: 'Report Summary', colSpan: 2, styles: { halign: 'center', fillColor: PRIMARY_COLOR_RGB, textColor: 255 }}]],
      body: summaryBody,
      theme: 'grid',
      columnStyles: { 0: { fontStyle: 'bold' } },
      margin: { left: 30, right: doc.internal.pageSize.getWidth() / 2 + 15 },
  });

  if (newJoiners.length > 0) {
    const joinersHead = [['Student Name', 'Joined On', 'Fee Paid']];
    const joinersBody = newJoiners.map(j => [j.name, format(j.joinDate, "dd MMM, yyyy"), `$${j.fees.toLocaleString()}`]);
    autoTable(doc, {
        startY: finalY,
        head: joinersHead,
        body: joinersBody,
        theme: 'grid',
        headStyles: { fillColor: PRIMARY_COLOR_RGB, textColor: 255, fontStyle: 'bold' },
        margin: { left: doc.internal.pageSize.getWidth() / 2 - 15 },
    });
  }

  addFooter();

  doc.save(`CourtCommand_Report_${stadiumName.replace(/ /g, '_')}_${format(new Date(), 'yyyy-MM-dd')}.pdf`);
};
