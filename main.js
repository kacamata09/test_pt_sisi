const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const pdfToText = require('pdf-to-text');
const PDFDocument = require('pdfkit');

const app = express();
const PORT = 3000;

app.set('view engine', 'ejs');
const upload = multer({ dest: 'uploads/' });

app.get('/', (req, res) => {
  res.render('index');
});

app.post('/upload', upload.single('pdf'), (req, res) => {
  const pdfPath = req.file.path;

  pdfToText.pdfToText(pdfPath, {}, (err, data) => {
    if (err) {
      console.error('Error euy:', err);
      return res.status(500).send('Gagal extract PDF');
    }

    let cleanText = data.replace(/\n/g, ' ')
    cleanText = cleanText.replace(/  /g, '');


    const outputPdfPath = path.join(__dirname, 'uploads', 'result.pdf');
    const doc = new PDFDocument();
    doc.pipe(fs.createWriteStream(outputPdfPath));
    doc.fontSize(12).text(extractData(cleanText), 100, 100);
    doc.end();

    res.render('result', { downloadLink: '/uploads/result.pdf' });
  });
});

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});


function extractData(text) {
  // const regexH1 = /H\.1 NOMOR\s*:\s*(\d{1,20})/; // Menangkap nomor H.1
  // const regexH1 = /H\.1 NOMOR\s*:\s*(\d+\s*\d*\s*\d*\s*\d*\s*\d*)/;
  const regexH1 = /H\.1 NOMOR\s*:\s*([\d\s]+)/;
  const regexH2 = /H\.2\s*X/;
  const regexA1 = /A\.1 NPWP\s*(\d{15})/;
  const regexNama = /A*?.3 Nama \s*([A-Za-z\s]+)/;
  // const regexInstansiNPWP = /C\.1 NPWP Instansi Pemerintah\s*(\d+\s*\d*\s*\d*\s*\d*\s*\d*)/;
  // const regexInstansiNPWP = /C\.1 NPWP Instansi Pemerintah\s*([\d\s]+)/
  const regexInstansiNPWP = /c*?NPWP Instansi Pemerintah\s*([\d\s]+)/; 
  const regexNamaInstansi = /C\.2Nama \s*([A-Za-z\s.]+)/;
  const regexPenandatangan = /C\.5 Nama Penandatangan\s*([A-Za-z\s]+)/;


  
  const h1Nomor = text.match(regexH1) ? text.match(regexH1)[1] : null;
  const h2 = text.match(regexH2) ? "X" : null;
  const a1Npwp = text.match(regexA1) ? text.match(regexA1)[1] : null;
  const a3Nama = text.match(regexNama) ? text.match(regexNama)[1] : null;
  const instansiNpwp = text.match(regexInstansiNPWP) ? text.match(regexInstansiNPWP)[1] : null;
  const c2NamaInstansi = text.match(regexNamaInstansi) ? text.match(regexNamaInstansi)[1] : null;
  const penandatangan = text.match(regexPenandatangan) ? text.match(regexPenandatangan)[1] : null;


  let resultString = '';
  if (h1Nomor) resultString += `H.1 NOMOR: ${h1Nomor}\n`;
  if (h2) resultString += `H.2: ${h2}\n`;
  if (a1Npwp) resultString += `A.1 NPWP: ${a1Npwp}\n`;
  if (a3Nama) resultString += `A.3 Nama: ${a3Nama}\n`;
  if (instansiNpwp) resultString += `C.1 NPWP Instansi Pemerintah: ${instansiNpwp}\n`;
  if (c2NamaInstansi) resultString += `C.2 Nama ${c2NamaInstansi}\n`;
  if (penandatangan) resultString += `C.5 Nama Penandatangan: ${penandatangan}\n`;
  
  return resultString
  
}