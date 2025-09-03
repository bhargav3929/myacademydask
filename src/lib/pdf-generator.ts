
import jsPDF from "jspdf";
import autoTable from 'jspdf-autotable';
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

// Extend jsPDF with the autoTable plugin
interface jsPDFWithAutoTable extends jsPDF {
  autoTable: (options: any) => jsPDFWithAutoTable;
}

const addHeader = (doc: jsPDF, stadiumName: string, dateRange: DateRange) => {
    const pageW = doc.internal.pageSize.getWidth();
    
    // Header background
    doc.setFillColor("#1E3A8A");
    doc.rect(0, 0, pageW, 60, 'F');
    doc.saveGraphicsState();
    doc.setGState(new doc.GState({opacity: 0.8}));
    doc.setFillColor("#3B82F6");
    doc.rect(0, 0, pageW, 60, 'F');
    doc.restoreGraphicsState();
    
    // Stadium Name
    doc.setFontSize(22);
    doc.setTextColor("#FFFFFF");
    doc.setFont("helvetica", "bold");
    doc.text(stadiumName, 30, 35);
    
    // Report Title
    doc.setFontSize(16);
    doc.setFont("helvetica", "normal");
    const reportTitle = "Attendance Report";
    const titleWidth = doc.getTextWidth(reportTitle);
    doc.text(reportTitle, (pageW - titleWidth) / 2, 35);

    // Date Range
    doc.setFontSize(10);
    const dateText = dateRange.to 
        ? `${format(dateRange.from!, 'MMM d, yyyy')} – ${format(dateRange.to, 'MMM d, yyyy')}` 
        : format(dateRange.from!, 'MMMM yyyy');
    const genDate = `Generated: ${format(new Date(), 'MMM d, yyyy')}`;
    doc.text(dateText, pageW - 30, 30, { align: 'right' });
    doc.text(genDate, pageW - 30, 42, { align: 'right' });

    // Divider
    doc.setFillColor("#047857");
    doc.rect(0, 60, pageW, 2, 'F');
};

const addFooter = (doc: jsPDF) => {
    const pageCount = (doc as any).internal.getNumberOfPages();
    const pageW = doc.internal.pageSize.getWidth();

    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setDrawColor("#E5E7EB");
        doc.line(30, doc.internal.pageSize.getHeight() - 25, pageW - 30, doc.internal.pageSize.getHeight() - 25);
        doc.setFontSize(8);
        doc.setTextColor("#6B7280");
        doc.text(`Report generated on: ${format(new Date(), 'MMM d, yyyy HH:mm')}`, 30, doc.internal.pageSize.getHeight() - 15);
        doc.text(`Page ${i} of ${pageCount}`, pageW - 30, doc.internal.pageSize.getHeight() - 15, { align: 'right' });
    }
};

export const generatePdf = async (props: GeneratePdfProps) => {
    const { reportData, newJoiners, revenueData, stadiumName, dateRange } = props;
    const doc = new jsPDF({
        orientation: 'landscape',
        unit: 'pt',
        format: 'a4',
    }) as jsPDFWithAutoTable;

    const headStyles = { fillColor: "#1E3A8A", textColor: "#FFFFFF", fontStyle: 'bold', fontSize: 7, halign: 'center' };
    const summaryHeadStyles = { ...headStyles, fillColor: "#047857" };
    const bodyStyles = { fontSize: 7, cellPadding: 4, minCellHeight: 15 };

    // --- Page 1: Attendance Table ---
    const attendanceBody = reportData.studentData.map(student => {
        const attendanceSymbols = reportData.dates.map(date => {
            const status = student.attendance[format(date, "yyyy-MM-dd")];
            if (status === 'present') return "✓";
            if (status === 'absent') return "✗";
            return "-";
        });
        return [
            student.name,
            ...attendanceSymbols,
            student.presents,
            student.absents,
            `${student.percentage}%`
        ];
    });

    autoTable(doc, {
        startY: 80,
        head: [['Student Name', ...reportData.dates.map(d => format(d, 'd')), "P", "A", "%"]],
        body: attendanceBody,
        theme: 'grid',
        headStyles: headStyles,
        bodyStyles: bodyStyles,
        alternateRowStyles: { fillColor: '#F9FAFB' },
        styles: { font: 'helvetica', lineColor: '#E5E7EB', lineWidth: 0.5 },
        columnStyles: {
            0: { halign: 'left', fontStyle: 'bold', cellWidth: 100 },
            [reportData.dates.length + 1]: { halign: 'center', fontStyle: 'bold', cellWidth: 25 },
            [reportData.dates.length + 2]: { halign: 'center', fontStyle: 'bold', cellWidth: 25 },
            [reportData.dates.length + 3]: { halign: 'center', fontStyle: 'bold', cellWidth: 35 },
        },
        didDrawCell: (data) => {
            if (data.section === 'body' && data.column.index > 0 && data.column.index <= reportData.dates.length) {
                if (data.cell.text[0] === "✓") {
                    doc.setTextColor("#10B981");
                } else if (data.cell.text[0] === "✗") {
                    doc.setTextColor("#EF4444");
                }
            }
        },
        didDrawPage: (data) => {
            addHeader(doc, stadiumName, dateRange);
        }
    });

    // --- New Page for Summaries ---
    doc.addPage();
    let finalY = (doc as any).lastAutoTable.finalY || 80;
    if (finalY > doc.internal.pageSize.getHeight() - 250) {
        doc.addPage();
        finalY = 80;
    }

    // --- Summary Section ---
    const summaryData = [
        ['Total Students', reportData.summary.totalStudents],
        ['Average Attendance', `${reportData.summary.averageAttendance}%`],
        ['Perfect Attendance', reportData.summary.alwaysPresent.join(', ') || 'None'],
        ['Below 60% Attendance', reportData.summary.below60Attendance.join(', ') || 'None'],
        ['Zero Attendance', reportData.summary.zeroAttendance.join(', ') || 'None'],
    ];

    autoTable(doc, {
        startY: finalY,
        head: [['Summary', '']],
        body: summaryData,
        theme: 'plain',
        headStyles: { ...headStyles, halign: 'left', fontSize: 14, fillColor: undefined, textColor: '#1E3A8A' },
        columnStyles: { 0: { fontStyle: 'bold' } },
        didDrawPage: (data) => addHeader(doc, stadiumName, dateRange)
    });
    
    finalY = (doc as any).lastAutoTable.finalY + 20;


    // --- Revenue Section ---
    const revenueDataArr = [
        ['Total Revenue', `$${revenueData.totalRevenue.toLocaleString()}`],
        ['Month', revenueData.monthName],
        ['Highest Revenue Day', revenueData.highestRevenueDay.date ? `${format(new Date(revenueData.highestRevenueDay.date), 'MMM d')} – $${revenueData.highestRevenueDay.amount.toLocaleString()}`: 'N/A'],
        ['Growth vs Last Period', `${revenueData.growth}%`],
    ];
    autoTable(doc, {
        startY: finalY,
        head: [['Revenue Report', '']],
        body: revenueDataArr,
        theme: 'plain',
        headStyles: { ...headStyles, halign: 'left', fontSize: 14, fillColor: undefined, textColor: '#1E3A8A' },
        columnStyles: { 0: { fontStyle: 'bold' } },
         didDrawPage: (data) => addHeader(doc, stadiumName, dateRange)
    });
    finalY = (doc as any).lastAutoTable.finalY + 20;

    // --- New Joiners Section ---
    if (newJoiners.length > 0) {
         if (finalY > doc.internal.pageSize.getHeight() - 150) {
            doc.addPage();
            finalY = 80;
        }
        autoTable(doc, {
            startY: finalY,
            head: [['New Students This Month', 'Join Date', 'Assigned Coach']],
            body: newJoiners.map(j => [j.name, format(j.joinDate, 'MMM dd, yyyy'), j.coachName]),
            theme: 'striped',
            headStyles: summaryHeadStyles,
            didDrawPage: (data) => addHeader(doc, stadiumName, dateRange)
        });
    }


    addFooter(doc);
    doc.save(`CourtCommand_Report_${stadiumName.replace(/ /g, '_')}_${format(new Date(), 'yyyy-MM-dd')}.pdf`);
};
