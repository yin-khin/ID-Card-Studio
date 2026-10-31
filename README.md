# ID Card Studio – Employee ID Card Generator

React + Tailwind CSS + Lucide React. Live front/back preview, logo/photo/signature upload,
dynamic QR code + barcode, templates and design controls, PNG / PDF export and print at exact
CR80 size (85.60 x 53.98 mm, portrait by default, landscape optional).

## Run
    npm install
    npm run dev        # development
    npm run build      # builds a single self-contained dist/index.html

## How exact sizing works
- Cards are laid out on a 10 px = 1 mm canvas (856 x 539.8 px), front and back identical.
- PNG: rendered at 300 / 600 / 900 DPI with the DPI written into the file (pHYs chunk).
- PDF (jsPDF): two pages, each exactly 85.60 x 53.98 mm, containing only the card artwork.
- Print: hidden iframe with @page size 85.6mm 53.98mm, so only the cards are printed.
  Choose "Actual size / 100%" and no margins in the print dialog.
- The export uses an off-screen full-size copy of the cards, never the dashboard.

## Structure
src/App.jsx               dashboard, form, actions
src/components/IdCard.jsx front/back artwork (3 layouts x 2 orientations)
src/components/*          Barcode (jsbarcode), QrImage (qrcode), LogoMark, CardFrame, PreviewModal, ui
src/lib/helpers.js        dimensions, templates, defaults, colour utils
src/lib/exporter.js       PNG/PDF/print
