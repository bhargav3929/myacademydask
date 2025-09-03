
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

export const generatePdf = async ({ reportData, newJoiners, stadiumName, dateRange }: GeneratePdfProps) => {
  const doc = new jsPDF({
    orientation: "landscape",
    unit: "px",
    format: "a4",
  });

  const { dates, studentData, summary } = reportData;
  const checkMark = "✓"; 
  const crossMark = "✗"; 

  // --- PDF Header ---
  const addHeader = () => {
    // Add Logo if you have one
    // const logoImg = new Image();
    // logoImg.src = "/logo.png"; 
    // doc.addImage(logoImg, "PNG", 40, 25, 80, 20);

    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text("Attendance Report", doc.internal.pageSize.getWidth() / 2, 40, { align: "center" });

    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.text(`Stadium: ${stadiumName}`, 40, 60);
    
    const dateRangeText = dateRange.from && dateRange.to 
        ? `${format(dateRange.from, "dd MMM, yyyy")} to ${format(dateRange.to, "dd MMM, yyyy")}`
        : "N/A";
    doc.text(`Period: ${dateRangeText}`, 40, 75);
  };
  
  addHeader();

  // --- Attendance Register Table ---
  const tableHead = [
    { content: "Student Name", styles: { halign: 'left', fontStyle: 'bold' } },
    ...dates.map(date => ({ content: format(date, "d"), styles: { minCellWidth: 15 } })),
    { content: "P", styles: { fontStyle: 'bold' } },
    { content: "A", styles: { fontStyle: 'bold' } },
    { content: "%", styles: { fontStyle: 'bold' } },
  ];

  const tableBody = studentData.map(student => {
    const row = [
        student.name,
        ...dates.map(date => {
            const status = student.attendance[format(date, "yyyy-MM-dd")];
            if (status === 'present') return checkMark;
            if (status === 'absent') return crossMark;
            return '-';
        }),
        student.presents.toString(),
        student.absents.toString(),
        `${student.percentage}%`
    ];
    return row;
  });

  autoTable(doc, {
    startY: 90,
    head: [tableHead],
    body: tableBody,
    theme: "grid",
    headStyles: {
        fillColor: [22, 163, 74],
        textColor: 255,
        fontSize: 8,
        halign: 'center',
    },
    styles: {
        fontSize: 8,
        cellPadding: 3,
        halign: 'center',
    },
    columnStyles: {
        0: { halign: 'left', cellWidth: 'auto' },
    }
  });

  let finalY = (doc as any).lastAutoTable.finalY + 20;

  // --- Summary & New Joiners Sections ---
  if (finalY > doc.internal.pageSize.getHeight() - 100) {
      doc.addPage();
      finalY = 40;
  }

  // Summary Table
  const summaryBody = [
      ["Total Students", summary.totalStudents.toString()],
      ["Average Attendance", `${summary.averageAttendance}%`],
      ["Perfect Attendance", summary.alwaysPresent.join(", ") || "None"],
      ["Complete Absentees", summary.alwaysAbsent.join(", ") || "None"],
  ];
  
  autoTable(doc, {
      startY: finalY,
      head: [[{content: 'Report Summary', colSpan: 2, styles: {halign: 'center', fillColor: [51, 65, 85]}}]],
      body: summaryBody,
      theme: 'grid',
      columnStyles: {
          0: { fontStyle: 'bold' },
      },
      tableWidth: 'auto'
  });

  // New Joiners Table
  if (newJoiners.length > 0) {
    const joinersBody = newJoiners.map(j => [j.name, format(j.joinDate, "dd MMM, yyyy")]);
    autoTable(doc, {
        startY: finalY,
        head: [[{content: 'New Joiners', colSpan: 2, styles: {halign: 'center', fillColor: [51, 65, 85]}}]],
        body: joinersBody,
        theme: 'grid',
        margin: { left: doc.internal.pageSize.getWidth() / 2 + 10 },
        tableWidth: 'auto'
    });
  }

  doc.save("report.pdf");
};
