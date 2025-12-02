import {PDFDocument, StandardFonts,rgb,degrees} from 'pdf-lib'

async function createPDF(form) {
    const url = "application.pdf"
    const existingPDFBytes = await fetch(url).then(res => res.arrayBuffer())
    const pdfDoc = await PDFDocument.load(existingPDFBytes)
    const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica)

    const pages = pdfDoc.getPages()
    const firstPage = pages[0]
    const {width,height} = firstPage.getSize()


    // enter data

    firstPage.drawText(form["What is your legal first name?"] + " " + form["What is your legal last name?"], {
    x: 60,
    y: 665,
    size: 14,
    font: helveticaFont,
    color: rgb(255,0,0),

  })

  firstPage.drawText(form["What is your legal last name?"], {
    x: 200,
    y: 665,
    size: 14,
    font: helveticaFont,
    color: rgb(255,0,0),
  })

  const pdfBytes = await pdfDoc.save()
  const blob = new Blob([pdfBytes],{type:"application/pdf"} )
  const downloadUrl = URL.createObjectURL(blob)
  window.open(downloadUrl)
}

export default createPDF