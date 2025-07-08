import React, { useState } from 'react';
import { useParent } from '../context/ParentContext';

const MarksheetDownload = ({ studentId }) => {
  const { getMarksheetData } = useParent();
  const [loading, setLoading] = useState(false);

  const generatePDF = async () => {
    try {
      setLoading(true);
      
      // Import jsPDF dynamically (note: jsPDF needs to be installed)
      // npm install jspdf
      const jsPDF = (await import('jspdf')).default;
      
      // Fetch marksheet data
      const response = await getMarksheetData(studentId);
      
      if (!response.ok || !response.data.success) {
        alert('मार्कशीट डेटा प्राप्त करने में त्रुटि / Error fetching marksheet data');
        return;
      }
      
      const { student, marks, stats } = response.data.data;
      
      // Create new PDF document
      const doc = new jsPDF();
      
      // Set font
      doc.setFont('helvetica');
      
      // Header
      doc.setFontSize(20);
      doc.setTextColor(0, 43, 91); // Dark blue
      doc.text('Saraswati School', 20, 20);
      
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      doc.text('Goddess of Knowledge - Center of Learning', 20, 30);
      doc.text('Academic Year: ' + stats.academicYear, 20, 40);
      
      // Student Information
      doc.setFontSize(14);
      doc.setTextColor(0, 43, 91);
      doc.text('Student Information', 20, 60);
      
      doc.setFontSize(11);
      doc.setTextColor(0, 0, 0);
      doc.text(`Name: ${student.name}`, 20, 75);
      doc.text(`Father's Name: ${student.fatherName}`, 20, 85);
      doc.text(`Mother's Name: ${student.motherName}`, 20, 95);
      doc.text(`Class: ${student.class}`, 20, 105);
      doc.text(`Medium: ${student.medium}`, 120, 75);
      doc.text(`SR Number: ${student.srNumber}`, 120, 85);
      doc.text(`Date of Birth: ${new Date(student.dateOfBirth).toLocaleDateString('en-IN')}`, 120, 95);
      doc.text(`Generated: ${new Date().toLocaleDateString('en-IN')}`, 120, 105);
      
      // Line separator
      doc.setDrawColor(0, 43, 91);
      doc.line(20, 115, 190, 115);
      
      // Marks Table Header
      doc.setFontSize(14);
      doc.setTextColor(0, 43, 91);
      doc.text('Academic Performance', 20, 130);
      
      // Create marks table
      let yPosition = 145;
      const examTypes = stats.examTypes;
      
      // Table headers
      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      doc.text('Subject', 20, yPosition);
      
      let xPosition = 60;
      examTypes.forEach(examType => {
        doc.text(examType, xPosition, yPosition);
        xPosition += 35;
      });
      
      yPosition += 10;
      doc.line(20, yPosition - 5, 190, yPosition - 5); // Header underline
      
      // Table data
      Object.keys(marks).forEach(subject => {
        doc.text(subject, 20, yPosition);
        
        xPosition = 60;
        examTypes.forEach(examType => {
          const mark = marks[subject][examType];
          if (mark) {
            doc.text(`${mark.score}/${mark.maxMarks}`, xPosition, yPosition);
            doc.text(`(${mark.percentage}%)`, xPosition, yPosition + 5);
          } else {
            doc.text('-', xPosition, yPosition);
          }
          xPosition += 35;
        });
        
        yPosition += 15;
        
        // Check if we need a new page
        if (yPosition > 250) {
          doc.addPage();
          yPosition = 30;
        }
      });
      
      // Summary
      if (yPosition > 220) {
        doc.addPage();
        yPosition = 30;
      }
      
      yPosition += 10;
      doc.line(20, yPosition, 190, yPosition);
      yPosition += 15;
      
      doc.setFontSize(12);
      doc.setTextColor(0, 43, 91);
      doc.text('Performance Summary', 20, yPosition);
      
      yPosition += 10;
      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      doc.text(`Total Subjects: ${stats.totalSubjects}`, 20, yPosition);
      doc.text(`Exam Types: ${stats.examTypes.length}`, 20, yPosition + 10);
      
      // Footer
      doc.setFontSize(8);
      doc.setTextColor(128, 128, 128);
      doc.text('Generated via Saraswati School Parent Portal', 20, 280);
      doc.text('This is a computer-generated document.', 20, 285);
      
      // Save the PDF
      const fileName = `${student.name}_Marksheet_${stats.academicYear}.pdf`;
      doc.save(fileName);
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      
      if (error.message.includes('Cannot resolve module')) {
        alert('PDF सुविधा उपलब्ध नहीं है। jsPDF library install करें:\nnpm install jspdf\n\nPDF feature not available. Please install jsPDF library:\nnpm install jspdf');
      } else {
        alert('PDF बनाने में त्रुटि / Error generating PDF: ' + error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={generatePDF}
      disabled={loading}
      className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 disabled:bg-green-300 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200"
    >
      {loading ? (
        <>
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          <span>PDF बन रहा है... / Generating PDF...</span>
        </>
      ) : (
        <>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <span>मार्कशीट डाउनलोड करें / Download Marksheet</span>
        </>
      )}
    </button>
  );
};

// Alternative implementation without jsPDF dependency
// This creates a printable HTML version
export const MarksheetPrint = ({ studentId }) => {
  const { getMarksheetData } = useParent();
  const [loading, setLoading] = useState(false);

  const generatePrintableMarksheet = async () => {
    try {
      setLoading(true);
      
      const response = await getMarksheetData(studentId);
      
      if (!response.ok || !response.data.success) {
        alert('मार्कशीट डेटा प्राप्त करने में त्रुटि / Error fetching marksheet data');
        return;
      }
      
      const { student, marks, stats } = response.data.data;
      
      // Create a new window for printing
      const printWindow = window.open('', '_blank');
      
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Marksheet - ${student.name}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 20px;
              color: #333;
            }
            .header {
              text-align: center;
              border-bottom: 2px solid #002b5b;
              padding-bottom: 20px;
              margin-bottom: 30px;
            }
            .school-name {
              font-size: 24px;
              font-weight: bold;
              color: #002b5b;
              margin-bottom: 5px;
            }
            .school-subtitle {
              font-size: 16px;
              color: #666;
            }
            .student-info {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 10px;
              margin-bottom: 30px;
              background-color: #f8f9fa;
              padding: 20px;
              border-radius: 8px;
            }
            .info-item {
              display: flex;
            }
            .info-label {
              font-weight: bold;
              min-width: 120px;
            }
            .marks-table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 30px;
            }
            .marks-table th,
            .marks-table td {
              border: 1px solid #ddd;
              padding: 10px;
              text-align: center;
            }
            .marks-table th {
              background-color: #002b5b;
              color: white;
              font-weight: bold;
            }
            .marks-table tr:nth-child(even) {
              background-color: #f9f9f9;
            }
            .subject-name {
              text-align: left !important;
              font-weight: bold;
            }
            .summary {
              background-color: #e3f2fd;
              padding: 20px;
              border-radius: 8px;
              margin-bottom: 20px;
            }
            .footer {
              text-align: center;
              font-size: 12px;
              color: #666;
              border-top: 1px solid #ddd;
              padding-top: 20px;
            }
            @media print {
              body { margin: 0; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
                    <div class="school-name">Saraswati School</div>
        <div class="school-subtitle">Goddess of Knowledge - Center of Learning</div>
            <div style="margin-top: 10px; font-size: 14px;">Academic Year: ${stats.academicYear}</div>
          </div>
          
          <div class="student-info">
            <div class="info-item">
              <span class="info-label">Name:</span>
              <span>${student.name}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Father's Name:</span>
              <span>${student.fatherName}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Mother's Name:</span>
              <span>${student.motherName}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Class:</span>
              <span>${student.class}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Medium:</span>
              <span>${student.medium}</span>
            </div>
            <div class="info-item">
              <span class="info-label">SR Number:</span>
              <span>${student.srNumber}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Date of Birth:</span>
              <span>${new Date(student.dateOfBirth).toLocaleDateString('en-IN')}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Generated:</span>
              <span>${new Date().toLocaleDateString('en-IN')}</span>
            </div>
          </div>
          
          <h3 style="color: #002b5b; border-bottom: 1px solid #ddd; padding-bottom: 10px;">Academic Performance</h3>
          
          <table class="marks-table">
            <thead>
              <tr>
                <th>Subject</th>
                ${stats.examTypes.map(examType => `<th>${examType}</th>`).join('')}
              </tr>
            </thead>
            <tbody>
              ${Object.keys(marks).map(subject => `
                <tr>
                  <td class="subject-name">${subject}</td>
                  ${stats.examTypes.map(examType => {
                    const mark = marks[subject][examType];
                    return mark 
                      ? `<td>${mark.score}/${mark.maxMarks}<br><small>(${mark.percentage}%)</small></td>`
                      : '<td>-</td>';
                  }).join('')}
                </tr>
              `).join('')}
            </tbody>
          </table>
          
          <div class="summary">
            <h4 style="margin-top: 0; color: #002b5b;">Performance Summary</h4>
            <p><strong>Total Subjects:</strong> ${stats.totalSubjects}</p>
            <p><strong>Exam Types:</strong> ${stats.examTypes.length}</p>
            <p><strong>Report Generated:</strong> ${new Date().toLocaleDateString('en-IN')}</p>
          </div>
          
          <div class="footer">
            <p>Generated via Saraswati School Parent Portal</p>
            <p>This is a computer-generated document.</p>
          </div>
          
          <div class="no-print" style="margin-top: 30px; text-align: center;">
            <button onclick="window.print()" style="background: #002b5b; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer;">
              Print Marksheet
            </button>
            <button onclick="window.close()" style="background: #666; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer; margin-left: 10px;">
              Close
            </button>
          </div>
        </body>
        </html>
      `;
      
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      
    } catch (error) {
      console.error('Error generating printable marksheet:', error);
      alert('मार्कशीट बनाने में त्रुटि / Error generating marksheet: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={generatePrintableMarksheet}
      disabled={loading}
      className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200"
    >
      {loading ? (
        <>
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          <span>तैयार हो रहा है... / Preparing...</span>
        </>
      ) : (
        <>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
          </svg>
          <span>मार्कशीट प्रिंट करें / Print Marksheet</span>
        </>
      )}
    </button>
  );
};

export default MarksheetDownload; 