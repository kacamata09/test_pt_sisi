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

    const cleanText = data.replace(/\n/g, ' ').replace(/  +/g, ' ');

    const outputPdfPath = path.join(__dirname, 'uploads', 'result.pdf');
    const doc = new PDFDocument();
    doc.pipe(fs.createWriteStream(outputPdfPath));
    doc.fontSize(12).text(cleanText, 100, 100);
    doc.end();

    res.render('result', { downloadLink: '/uploads/result.pdf' });
  });
});

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
