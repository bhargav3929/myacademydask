
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

const PRIMARY_COLOR = "#1E3A8A";
const GREEN_COLOR = "#10B981";
const RED_COLOR = "#EF4444";
const GRAY_BACKGROUND = "#F3F4F6";
const LIGHT_GRAY_BACKGROUND = "#F9FAFB";
const LOGO_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 22v-4a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v4"/><path d="M18 16.5V14a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v2.5"/><path d="M6 14.5V14a2 2 0 0 1 2-2v0a2 2 0 0 1 2 2v.5"/><path d="M12 8a4 4 0 0 0-4 4v2"/><path d="M12 8a4 4 0 0 1 4 4v2"/><path d="m5 16 1-1"/><path d="m19 16-1-1"/><path d="M12 8V2"/></svg>`;

export const generatePdf = async ({ reportData, newJoiners, stadiumName, dateRange }: GeneratePdfProps) => {
  const doc = new jsPDF({
    orientation: "landscape",
    unit: "px",
    format: "a4",
  });

  const { dates, studentData, summary } = reportData;
  const checkMark = "✓"; 
  const crossMark = "✗"; 

  const addHeader = (pageNumber: number) => {
    const pageWidth = doc.internal.pageSize.getWidth();
    // Blue Banner
    doc.setFillColor(PRIMARY_COLOR);
    doc.rect(0, 0, pageWidth, 50, 'F');
    
    // Logo and Stadium Name
    doc.addSvgAsImage(LOGO_SVG, 28, 14, 22, 22);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor("#FFFFFF");
    doc.text(stadiumName, 60, 28);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text("CourtCommand", 60, 40);

    // Report Title
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text("Attendance Report", pageWidth - 30, 28, { align: "right" });
    const dateRangeText = dateRange.from && dateRange.to 
        ? `${format(dateRange.from, "dd MMM yyyy")} – ${format(dateRange.to, "dd MMM yyyy")}`
        : "N/A";
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text(dateRangeText, pageWidth - 30, 40, { align: "right" });

    // Reset colors
    doc.setTextColor(0,0,0);
  };
  
  const addFooter = () => {
    const pageCount = (doc.internal as any).getNumberOfPages();
    const pageWidth = doc.internal.pageSize.getWidth();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setDrawColor("#E5E7EB");
        doc.line(30, doc.internal.pageSize.getHeight() - 35, pageWidth - 30, doc.internal.pageSize.getHeight() - 35);
        doc.setFontSize(8);
        doc.setTextColor("#6B7280");
        doc.text(
            `Report generated on: ${format(new Date(), "dd MMM yyyy, hh:mm a")}`,
            30,
            doc.internal.pageSize.getHeight() - 20
        );
         doc.text(
            `Page ${i} of ${pageCount}`,
            pageWidth - 30,
            doc.internal.pageSize.getHeight() - 20,
            { align: 'right' }
        );
    }
  };

  const tableHead = [
    { content: "Student Name", styles: { halign: 'left', fontStyle: 'bold', minCellWidth: 100 } },
    ...dates.map(date => ({ content: format(date, "d"), styles: { minCellWidth: 15, halign: 'center' } })),
    { content: "P", styles: { halign: 'center', fontStyle: 'bold' } },
    { content: "A", styles: { halign: 'center', fontStyle: 'bold' } },
    { content: "%", styles: { halign: 'center', fontStyle: 'bold' } },
  ];

  const tableBody = studentData.map(student => [
    { content: student.name, styles: { fontStyle: 'bold' } },
    ...dates.map(date => {
        const status = student.attendance[format(date, "yyyy-MM-dd")];
        return status === 'present' ? checkMark : status === 'absent' ? crossMark : '-';
    }),
    student.presents,
    student.absents,
    `${student.percentage}%`
  ]);

  autoTable(doc, {
    startY: 65,
    head: [tableHead],
    body: tableBody,
    theme: "grid",
    headStyles: { fillColor: PRIMARY_COLOR, textColor: 255, fontSize: 9, fontStyle: 'bold', cellPadding: { top: 4, bottom: 4 } },
    styles: { fontSize: 8, cellPadding: 3, halign: 'center', },
    columnStyles: {
        0: { halign: 'left' },
    },
    didDrawPage: (data) => {
        addHeader(data.pageNumber);
    },
    didDrawCell: (data) => {
        if (data.section === 'body' && data.row.index % 2 !== 0) {
            data.cell.styles.fillColor = LIGHT_GRAY_BACKGROUND;
        }
    },
    didParseCell: (data) => {
        if (data.section === 'body' && data.column.index > 0 && data.column.index <= dates.length) {
             if (data.cell.raw === checkMark) data.cell.styles.textColor = GREEN_COLOR;
             if (data.cell.raw === crossMark) data.cell.styles.textColor = RED_COLOR;
             data.cell.styles.fontStyle = 'bold';
        }
         if (data.section === 'body' && data.column.index === dates.length + 3) {
             const percentage = parseInt(String(data.cell.raw).replace('%', ''));
             if (percentage >= 90) data.cell.styles.textColor = GREEN_COLOR;
             else if (percentage >= 70) data.cell.styles.textColor = "#F59E0B"; // amber-500
             else data.cell.styles.textColor = RED_COLOR;
             data.cell.styles.fontStyle = 'bold';
        }
    }
  });

  let finalY = (doc as any).lastAutoTable.finalY + 25;
  if (finalY > doc.internal.pageSize.getHeight() - 150) {
      doc.addPage();
      finalY = 65;
  }
  
  // Two-column layout for summary and new joiners
  autoTable(doc, {
      startY: finalY,
      head: [[{content: '📊 Report Summary', colSpan: 2, styles: { halign: 'left', fillColor: PRIMARY_COLOR, textColor: 255 }}]],
      body: [
        ["Total Students", summary.totalStudents],
        ["Avg. Attendance", `${summary.averageAttendance}%`],
        ["Total Revenue", `$${summary.totalRevenue.toLocaleString()}`],
      ],
      theme: 'grid',
      columnStyles: { 0: { fontStyle: 'bold' } },
      margin: { left: 30, right: doc.internal.pageSize.getWidth() / 2 + 15 },
  });
  
  let summaryFinalY = (doc as any).lastAutoTable.finalY;
  
  autoTable(doc, {
      startY: summaryFinalY + 10,
      head: [[{content: '🌟 Perfect Attendance', styles: { halign: 'left', fillColor: PRIMARY_COLOR, textColor: 255 }}]],
      body: [[summary.alwaysPresent.join(", ") || "None"]],
      theme: 'grid',
      margin: { left: 30, right: doc.internal.pageSize.getWidth() / 2 + 15 },
  });
  
  summaryFinalY = (doc as any).lastAutoTable.finalY;

   autoTable(doc, {
      startY: summaryFinalY + 10,
      head: [[{content: '⚠️ Complete Absentees', styles: { halign: 'left', fillColor: PRIMARY_COLOR, textColor: 255 }}]],
      body: [[summary.alwaysAbsent.join(", ") || "None"]],
      theme: 'grid',
      margin: { left: 30, right: doc.internal.pageSize.getWidth() / 2 + 15 },
  });
  

  if (newJoiners.length > 0) {
    const joinersHead = [['Student Name', 'Joined On', 'Fee Paid']];
    const joinersBody = newJoiners.map(j => [j.name, format(j.joinDate, "dd MMM, yyyy"), `$${j.fees.toLocaleString()}`]);
    autoTable(doc, {
        startY: finalY,
        head: [[{content: '✨ New Joiners This Period', colSpan: 3, styles: { halign: 'left', fillColor: PRIMARY_COLOR, textColor: 255 }}]],
        body: [...joinersHead, ...joinersBody],
        theme: 'grid',
        headStyles: { fontStyle: 'bold' },
        didDrawCell: (data) => {
            if (data.section === 'body' && data.row.index > 0 && data.row.index % 2 === 0) { // Start striping from second body row
                data.cell.styles.fillColor = LIGHT_GRAY_BACKGROUND;
            }
        },
        margin: { left: doc.internal.pageSize.getWidth() / 2, right: 30 },
    });
  }

  addFooter();

  doc.save(`CourtCommand_Report_${stadiumName.replace(/ /g, '_')}_${format(new Date(), 'yyyy-MM-dd')}.pdf`);
};
