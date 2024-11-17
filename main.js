const express = require('express');
const fs = require('fs');
const pdfToText = require('pdf-to-text');
const PDFDocument = require('pdfkit');


const app = express();
const PORT = 3000;

app.get('/extract-pdf', (req, res) => {
  const pdfPath = './soal3.pdf';

  const options = {
    layout: 'layout' 
  };

  pdfToText.pdfToText(pdfPath, options, (err, data) => {
    if (err) {
      console.error('Error extracting PDF:', err);
      return res.status(500).send('Failed to extract PDF');
    }

    var cleanText = data.replace(/\n/g, ' ');
    cleanText = cleanText.replace(/  /g, '');


    const doc = new PDFDocument();

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="generated.pdf"');

    doc.pipe(res);

    // extractData(cleanText)

    doc.fontSize(25).text(extractData(cleanText), 100, 100);

    console.log(cleanText)
    doc.end();
    // res.send(cleanText);
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});


function extractData(text) {
    // const regexH1 = /H\.1 NOMOR\s*:\s*(\d{1,20})/; // Menangkap nomor H.1
    const regexH1 = /H\.1 NOMOR\s*:\s*(\d+\s*\d*\s*\d*\s*\d*\s*\d*)/;
    const regexH2 = /H\.2\s*X/;
    const regexA1 = /A\.1 NPWP\s*(\d{15})/;
    const regexInstansiNPWP = /C\.1 NPWP Instansi Pemerintah\s*(\d{15})/;
    const regexPenandatangan = /C\.5 Nama Penandatangan\s*([A-Za-z\s]+)/;
  
    const h1Nomor = text.match(regexH1) ? text.match(regexH1)[1] : null;
    const h2 = text.match(regexH2) ? "X" : null;
    const a1Npwp = text.match(regexA1) ? text.match(regexA1)[1] : null;
    const instansiNpwp = text.match(regexInstansiNPWP) ? text.match(regexInstansiNPWP)[1] : null;
    const penandatangan = text.match(regexPenandatangan) ? text.match(regexPenandatangan)[1] : null;
  

    let resultString = '';
    if (h1Nomor) resultString += `H.1 NOMOR: ${h1Nomor}\n`;
    if (h2) resultString += `H.2: ${h2}\n`;
    if (a1Npwp) resultString += `A.1 NPWP: ${a1Npwp}\n`;
    if (instansiNpwp) resultString += `NPWP Instansi Pemerintah: ${instansiNpwp}\n`;
    if (penandatangan) resultString += `C.5 Nama Penandatangan: ${penandatangan}\n`;
    
    return resultString
    
  }