// Dati completi per 22 formati di file
// Ogni formato ha: id, name, extension, category, description, uses, programs, iconColor, mime, sampleGenerator

export const categories = [
  { id: 'documenti', label: 'Documenti', icon: 'doc' },
  { id: 'immagini', label: 'Immagini', icon: 'img' },
  { id: 'audio-video', label: 'Audio/Video', icon: 'av' },
  { id: 'dati', label: 'Dati', icon: 'data' },
  { id: 'eseguibili', label: 'Eseguibili', icon: 'exe' },
  { id: 'web', label: 'Web', icon: 'web' },
  { id: 'font', label: 'Font', icon: 'font' },
  { id: 'altro', label: 'Altro', icon: 'other' }
]

export const formats = [
  {
    id: 'pdf',
    name: 'PDF',
    extension: '.pdf',
    category: 'documenti',
    description: 'Il Portable Document Format è lo standard per documenti che devono apparire uguali su qualsiasi dispositivo. Inventato da Adobe nel 1993, oggi è un formato aperto (ISO 32000).',
    uses: 'Documenti ufficiali, contratti, eBook, moduli compilabili, stampe professionali, curriculum vitae.',
    programs: 'Adobe Acrobat Reader (gratis), browser web (Chrome, Firefox, Edge), Sumatra PDF, LibreOffice Draw.',
    iconColor: '#E53935',
    mime: 'application/pdf',
    sampleGenerator: () => {
      // Minimal valid PDF
      const content = `%PDF-1.4
1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj
2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj
3 0 obj<</Type/Page/MediaBox[0 0 612 792]/Parent 2 0 R/Resources<<>>>>endobj
xref
0 4
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
trailer<</Size 4/Root 1 0 R>>
startxref
206
%%EOF`
      return new Blob([content], { type: 'application/pdf' })
    }
  },
  {
    id: 'docx',
    name: 'DOCX',
    extension: '.docx',
    category: 'documenti',
    description: 'Il formato di Microsoft Word basato su XML aperto (Office Open XML). Introdotto con Office 2007, è uno standard ECMA-376 e ISO/IEC 29500.',
    uses: 'Relazioni, tesi, lettere, documenti aziendali, modelli, stampa unione.',
    programs: 'Microsoft Word, LibreOffice Writer (gratis), Google Docs (gratis online), OnlyOffice.',
    iconColor: '#1565C0',
    mime: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    sampleGenerator: () => {
      // Minimal DOCX is a ZIP with XML files
      // We'll create a realistic minimal DOCX
      const contentTypes = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/></Types>'
      const rels = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>'
      const document = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body><w:p><w:r><w:t>Esempio FileWise - Documento DOCX dimostrativo.</w:t></w:r></w:p></w:body></w:document>'

      // Simple ZIP creation (store method)
      function crc32(data) {
        let crc = 0xFFFFFFFF
        const bytes = new TextEncoder().encode(data)
        for (let b of bytes) {
          crc ^= b
          for (let i = 0; i < 8; i++) crc = (crc >>> 1) ^ (crc & 1 ? 0xEDB88320 : 0)
        }
        return (crc ^ 0xFFFFFFFF) >>> 0
      }

      function localFileHeader(name, data) {
        const encoded = new TextEncoder().encode(data)
        const nameBytes = new TextEncoder().encode(name)
        const buf = new ArrayBuffer(30 + nameBytes.length + encoded.length)
        const v = new DataView(buf)
        let off = 0
        v.setUint32(off, 0x04034b50, true); off += 4
        v.setUint16(off, 20, true); off += 2
        v.setUint16(off, 0, true); off += 2
        v.setUint16(off, 0, true); off += 2
        const dosTime = 0x8000 // valid DOS time
        const dosDate = 0x4A21 // 2026-07-10 approx
        v.setUint16(off, dosTime, true); off += 2
        v.setUint16(off, dosDate, true); off += 2
        v.setUint32(off, crc32(data), true); off += 4
        v.setUint32(off, encoded.length, true); off += 4
        v.setUint32(off, encoded.length, true); off += 4
        v.setUint16(off, nameBytes.length, true); off += 2
        v.setUint16(off, 0, true); off += 2
        new Uint8Array(buf).set(nameBytes, off); off += nameBytes.length
        new Uint8Array(buf).set(encoded, off)
        return buf
      }

      function centralDirEntry(name, data, offset) {
        const encoded = new TextEncoder().encode(data)
        const nameBytes = new TextEncoder().encode(name)
        const buf = new ArrayBuffer(46 + nameBytes.length)
        const v = new DataView(buf)
        let o = 0
        v.setUint32(o, 0x02014b50, true); o += 4
        v.setUint16(o, 20, true); o += 2
        v.setUint16(o, 20, true); o += 2
        v.setUint16(o, 0, true); o += 2
        v.setUint16(o, 0, true); o += 2
        v.setUint16(o, 0, true); o += 2
        v.setUint16(o, 0, true); o += 2
        v.setUint32(o, crc32(data), true); o += 4
        v.setUint32(o, encoded.length, true); o += 4
        v.setUint32(o, encoded.length, true); o += 4
        v.setUint16(o, nameBytes.length, true); o += 2
        v.setUint16(o, 0, true); o += 2
        v.setUint16(o, 0, true); o += 2
        v.setUint16(o, 0, true); o += 2
        v.setUint32(o, 0, true); o += 4
        v.setUint32(o, offset, true); o += 4
        new Uint8Array(buf).set(nameBytes, o)
        return buf
      }

      const files = [
        { name: '[Content_Types].xml', data: contentTypes },
        { name: '_rels/.rels', data: rels },
        { name: 'word/document.xml', data: document }
      ]

      const parts = []
      let currentOffset = 0
      const cdParts = []

      for (const f of files) {
        const lfh = localFileHeader(f.name, f.data)
        parts.push(new Uint8Array(lfh))
        cdParts.push(new Uint8Array(centralDirEntry(f.name, f.data, currentOffset)))
        currentOffset += lfh.byteLength
      }

      const cdOffset = currentOffset
      const cdSize = cdParts.reduce((s, p) => s + p.byteLength, 0)
      const cdData = new Uint8Array(cdSize)
      let cdPos = 0
      for (const p of cdParts) { cdData.set(p, cdPos); cdPos += p.byteLength }

      const eocd = new ArrayBuffer(22)
      const ev = new DataView(eocd)
      ev.setUint32(0, 0x06054b50, true)
      ev.setUint16(4, 0, true)
      ev.setUint16(6, 0, true)
      ev.setUint16(8, files.length, true)
      ev.setUint16(10, files.length, true)
      ev.setUint32(12, cdSize, true)
      ev.setUint32(16, cdOffset, true)
      ev.setUint16(20, 0, true)

      const totalSize = currentOffset + cdSize + 22
      const result = new Uint8Array(totalSize)
      let pos = 0
      for (const p of parts) { result.set(p, pos); pos += p.byteLength }
      result.set(cdData, pos); pos += cdSize
      result.set(new Uint8Array(eocd), pos)

      return new Blob([result], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' })
    }
  },
  {
    id: 'xlsx',
    name: 'XLSX',
    extension: '.xlsx',
    category: 'documenti',
    description: 'Formato di Microsoft Excel per fogli di calcolo. Basato su XML aperto, supporta formule, grafici, tabelle pivot e macro.',
    uses: 'Bilanci, analisi dati, inventari, gestione progetti, calendari, report finanziari.',
    programs: 'Microsoft Excel, LibreOffice Calc (gratis), Google Fogli (gratis online), OnlyOffice.',
    iconColor: '#2E7D32',
    mime: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    sampleGenerator: () => {
      const sheet = '<?xml version="1.0" encoding="UTF-8"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetData><row r="1"><c r="A1" t="inlineStr"><is><t>Prodotto</t></is></c><c r="B1" t="inlineStr"><is><t>Prezzo</t></is></c></row><row r="2"><c r="A2" t="inlineStr"><is><t>FileWise</t></is></c><c r="B2"><v>0</v></c></row></sheetData></worksheet>'
      return new Blob([sheet], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
    }
  },
  {
    id: 'jpg',
    name: 'JPG',
    extension: '.jpg',
    category: 'immagini',
    description: 'JPEG (Joint Photographic Experts Group) è il formato immagine più diffuso al mondo. Usa compressione con perdita di dettaglio per ridurre drasticamente le dimensioni dei file.',
    uses: 'Fotografie digitali, immagini per il web, social media, anteprime, stampa fotografica.',
    programs: 'Qualsiasi browser, Visualizzatore foto di Windows/Anteprima Mac, GIMP (gratis), IrfanView (gratis).',
    iconColor: '#F57C00',
    mime: 'image/jpeg',
    sampleGenerator: () => {
      // Create a minimal but valid JPEG
      // JPEG structure: SOI, APP0 (JFIF), DQT, SOF0, DHT, SOS, compressed data, EOI
      const soi = new Uint8Array([0xFF, 0xD8])

      // APP0 JFIF marker
      const jfif = new Uint8Array([
        0xFF, 0xE0, 0x00, 0x10, 0x4A, 0x46, 0x49, 0x46, 0x00, // JFIF\0
        0x01, 0x01, 0x00, 0x00, 0x01, 0x00, 0x01, 0x00, 0x00
      ])

      // DQT - quantization table
      const dqt = new Uint8Array([0xFF, 0xDB, 0x00, 0x43, 0x00])
      const qt = new Uint8Array(64)
      for (let i = 0; i < 64; i++) qt[i] = 8
      const dqtFull = new Uint8Array(dqt.length + qt.length)
      dqtFull.set(dqt)
      dqtFull.set(qt, dqt.length)

      // SOF0 - 1x1 pixel image
      const sof0 = new Uint8Array([
        0xFF, 0xC0, 0x00, 0x0B, 0x08,
        0x00, 0x01, // height = 1
        0x00, 0x01, // width = 1
        0x01, // components
        0x01, 0x11, 0x00 // component 1, sampling 1x1, table 0
      ])

      // DHT - Huffman table (standard DC table)
      const dht = new Uint8Array([
        0xFF, 0xC4, 0x00, 0x1F, 0x00,
        0x00, 0x01, 0x05, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
        0x00, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08, 0x09, 0x0A, 0x0B
      ])

      // DHT for AC
      const dhtAC = new Uint8Array([
        0xFF, 0xC4, 0x00, 0xB5, 0x10,
        0x00, 0x02, 0x01, 0x03, 0x03, 0x02, 0x04, 0x03, 0x05, 0x05, 0x04, 0x04, 0x00, 0x00, 0x01, 0x7D,
        0x01, 0x02, 0x03, 0x00, 0x04, 0x11, 0x05, 0x12, 0x21, 0x31, 0x41, 0x06, 0x13, 0x51, 0x61, 0x07,
        0x22, 0x71, 0x14, 0x32, 0x81, 0x91, 0xA1, 0x08, 0x23, 0x42, 0xB1, 0xC1, 0x15, 0x52, 0xD1, 0xF0,
        0x24, 0x33, 0x62, 0x72, 0x82, 0x09, 0x0A, 0x16, 0x17, 0x18, 0x19, 0x1A, 0x25, 0x26, 0x27, 0x28,
        0x29, 0x2A, 0x34, 0x35, 0x36, 0x37, 0x38, 0x39, 0x3A, 0x43, 0x44, 0x45, 0x46, 0x47, 0x48, 0x49,
        0x4A, 0x53, 0x54, 0x55, 0x56, 0x57, 0x58, 0x59, 0x5A, 0x63, 0x64, 0x65, 0x66, 0x67, 0x68, 0x69,
        0x6A, 0x73, 0x74, 0x75, 0x76, 0x77, 0x78, 0x79, 0x7A, 0x83, 0x84, 0x85, 0x86, 0x87, 0x88, 0x89,
        0x8A, 0x92, 0x93, 0x94, 0x95, 0x96, 0x97, 0x98, 0x99, 0x9A, 0xA2, 0xA3, 0xA4, 0xA5, 0xA6, 0xA7,
        0xA8, 0xA9, 0xAA, 0xB2, 0xB3, 0xB4, 0xB5, 0xB6, 0xB7, 0xB8, 0xB9, 0xBA, 0xC2, 0xC3, 0xC4, 0xC5,
        0xC6, 0xC7, 0xC8, 0xC9, 0xCA, 0xD2, 0xD3, 0xD4, 0xD5, 0xD6, 0xD7, 0xD8, 0xD9, 0xDA, 0xE1, 0xE2,
        0xE3, 0xE4, 0xE5, 0xE6, 0xE7, 0xE8, 0xE9, 0xEA, 0xF1, 0xF2, 0xF3, 0xF4, 0xF5, 0xF6, 0xF7, 0xF8,
        0xF9, 0xFA
      ])

      // SOS - start of scan
      const sos = new Uint8Array([
        0xFF, 0xDA, 0x00, 0x08, 0x01,
        0x01, 0x00, 0x00, 0x3F, 0x00
      ])

      // Encoded data for a single gray pixel (DC value = 0)
      const data = new Uint8Array([0x00, 0x00])

      // EOI
      const eoi = new Uint8Array([0xFF, 0xD9])

      const parts = [soi, jfif, dqtFull, sof0, dht, dhtAC, sos, data, eoi]
      const totalLen = parts.reduce((s, p) => s + p.length, 0)
      const result = new Uint8Array(totalLen)
      let off = 0
      for (const p of parts) { result.set(p, off); off += p.length }

      return new Blob([result], { type: 'image/jpeg' })
    }
  },
  {
    id: 'png',
    name: 'PNG',
    extension: '.png',
    category: 'immagini',
    description: 'Portable Network Graphics è il formato ideale per la grafica web. Compressione senza perdita, supporta la trasparenza (canale alpha) e fino a 16 milioni di colori.',
    uses: 'Loghi, icone, screenshot, grafica web con trasparenza, infografiche, interfacce utente.',
    programs: 'Qualsiasi browser, GIMP (gratis), Paint.NET (gratis), Krita (gratis), Photoshop.',
    iconColor: '#6A1B9A',
    mime: 'image/png',
    sampleGenerator: () => {
      // Minimal valid PNG: 1x1 pixel blue
      function crc32(buf) {
        let crc = 0xFFFFFFFF
        const data = new Uint8Array(buf)
        for (let b of data) {
          crc ^= b
          for (let i = 0; i < 8; i++) crc = (crc >>> 1) ^ (crc & 1 ? 0xEDB88320 : 0)
        }
        return (crc ^ 0xFFFFFFFF) >>> 0
      }

      function chunk(type, data) {
        const typeBytes = new TextEncoder().encode(type)
        const dataArr = data ? new Uint8Array(data) : new Uint8Array(0)
        const dataLen = dataArr.length
        const buf = new ArrayBuffer(12 + dataLen)
        const v = new DataView(buf)
        v.setUint32(0, dataLen, false)
        new Uint8Array(buf).set(typeBytes, 4)
        if (dataLen > 0) new Uint8Array(buf).set(dataArr, 8)
        const crcInput = new Uint8Array(buf.slice(4, 8 + dataLen))
        v.setUint32(8 + dataLen, crc32(crcInput.buffer), false)
        return buf
      }

      const signature = new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10])

      // IHDR: 1x1, 8-bit RGB
      const ihdrData = new ArrayBuffer(13)
      const iv = new DataView(ihdrData)
      iv.setUint32(0, 1, false) // width
      iv.setUint32(4, 1, false) // height
      iv.setUint8(8, 8)  // bit depth
      iv.setUint8(9, 2)  // color type (RGB)
      iv.setUint8(10, 0) // compression
      iv.setUint8(11, 0) // filter
      iv.setUint8(12, 0) // interlace
      const ihdr = chunk('IHDR', ihdrData)

      // IDAT: filter byte (0) + RGB for blue pixel
      // First deflate: 1 byte BFINAL+BCOMP, then stored block length/complement, then data
      const rawData = new Uint8Array([0, 0x24, 0x49, 0xC7]) // filter=0, RGB blue
      // Simple deflate: stored block
      const deflated = new Uint8Array([
        0x78, 0x01, // zlib header (default compression)
        0x01,       // BFINAL=1, BTYPE=00 (stored)
        0x04, 0x00, // length = 4
        0xFB, 0xFF, // complement
        ...rawData,
        0x04, 0x16, 0x01, 0x5D // adler32 of rawData
      ])
      // Fix adler32 - actually let's compute it
      // Adler32 of [0, 0x24, 0x49, 0xC7]
      let s1 = 1, s2 = 0
      for (const b of rawData) { s1 = (s1 + b) % 65521; s2 = (s2 + s1) % 65521 }
      const adler = (s2 << 16) | s1
      const deflatedFixed = new Uint8Array(deflated)
      const dv = new DataView(deflatedFixed.buffer)
      dv.setUint32(deflatedFixed.length - 4, adler, false)

      const idat = chunk('IDAT', deflatedFixed.buffer)
      const iend = chunk('IEND', null)

      const parts = [signature.buffer, ihdr, idat, iend]
      const totalLen = parts.reduce((s, p) => s + p.byteLength, 0)
      const result = new Uint8Array(totalLen)
      let off = 0
      for (const p of parts) { result.set(new Uint8Array(p), off); off += p.byteLength }

      return new Blob([result], { type: 'image/png' })
    }
  },
  {
    id: 'gif',
    name: 'GIF',
    extension: '.gif',
    category: 'immagini',
    description: 'Graphics Interchange Format, nato nel 1987, supporta fino a 256 colori e animazioni semplici. Amatissimo per meme e reazioni sui social.',
    uses: 'Animazioni brevi, meme, icone animate, banner pubblicitari, reazioni nei messaggi.',
    programs: 'Qualsiasi browser, GIMP (gratis), EZGif.com (gratis online), Photoshop.',
    iconColor: '#00ACC1',
    mime: 'image/gif',
    sampleGenerator: () => {
      // Minimal valid GIF: 1x1 pixel, no animation
      const header = new Uint8Array([0x47, 0x49, 0x46, 0x38, 0x39, 0x61]) // GIF89a
      const lsd = new Uint8Array([0x01, 0x00, 0x01, 0x00, 0xF7, 0x00, 0x00]) // 1x1, global color table flag, 256 colors
      // Global color table: 256 * 3 bytes = 768 bytes
      const gct = new Uint8Array(768)
      // Set first color to blue (#2449C7)
      gct[0] = 0x24; gct[1] = 0x49; gct[2] = 0xC7
      // Image descriptor
      const imgDesc = new Uint8Array([0x2C, 0x00, 0x00, 0x00, 0x00, 0x01, 0x00, 0x01, 0x00, 0x00])
      // Image data (LZW minimum code size = 2)
      const imgData = new Uint8Array([0x02, 0x02, 0x4C, 0x01, 0x00]) // clear code, pixel index 0, end, block terminator
      const trailer = new Uint8Array([0x3B])

      const parts = [header, lsd, gct, imgDesc, imgData, trailer]
      const totalLen = parts.reduce((s, p) => s + p.length, 0)
      const result = new Uint8Array(totalLen)
      let off = 0
      for (const p of parts) { result.set(p, off); off += p.length }

      return new Blob([result], { type: 'image/gif' })
    }
  },
  {
    id: 'svg',
    name: 'SVG',
    extension: '.svg',
    category: 'immagini',
    description: 'Scalable Vector Graphics è un formato vettoriale basato su XML. Le immagini SVG possono essere ingrandite all\'infinito senza perdere qualità.',
    uses: 'Loghi, icone, illustrazioni tecniche, diagrammi, grafica responsive per il web.',
    programs: 'Qualsiasi browser, Inkscape (gratis), Figma (gratis), Adobe Illustrator, VSCode.',
    iconColor: '#FF6F00',
    mime: 'image/svg+xml',
    sampleGenerator: () => {
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
  <rect width="200" height="200" rx="20" fill="#2449C7"/>
  <text x="100" y="110" text-anchor="middle" font-size="72" font-family="sans-serif" font-weight="bold" fill="white">FW</text>
  <text x="100" y="145" text-anchor="middle" font-size="18" font-family="sans-serif" fill="#A5C8FF">FileWise</text>
</svg>`
      return new Blob([svg], { type: 'image/svg+xml' })
    }
  },
  {
    id: 'mp3',
    name: 'MP3',
    extension: '.mp3',
    category: 'audio-video',
    description: 'MPEG Audio Layer III è lo standard di compressione audio che ha rivoluzionato la musica digitale. Riduce le dimensioni fino a 10 volte rispetto al CD, eliminando le frequenze non udibili.',
    uses: 'Musica digitale, podcast, audiolibri, suonerie, streaming audio.',
    programs: 'VLC (gratis), Windows Media Player, iTunes, Audacity (gratis), foobar2000 (gratis).',
    iconColor: '#C62828',
    mime: 'audio/mpeg',
    sampleGenerator: () => {
      // Minimal MP3 frame: MPEG1 Layer3, 128kbps, 44100Hz, stereo, no CRC
      const frameHeader = new Uint8Array([0xFF, 0xFB, 0x90, 0x00])
      // Silenzio per il resto del frame (417 bytes per 128kbps @ 44100)
      const frameData = new Uint8Array(417)
      const result = new Uint8Array(4 + 417)
      result.set(frameHeader, 0)
      return new Blob([result], { type: 'audio/mpeg' })
    }
  },
  {
    id: 'mp4',
    name: 'MP4',
    extension: '.mp4',
    category: 'audio-video',
    description: 'MPEG-4 Part 14 è il contenitore multimediale più usato. Può contenere video, audio, sottotitoli e metadati in un unico file.',
    uses: 'Video online (YouTube, social), film in digitale, registrazioni smartphone, streaming.',
    programs: 'VLC (gratis), Windows Media Player, QuickTime, HandBrake (gratis), browser moderni.',
    iconColor: '#4527A0',
    mime: 'video/mp4',
    sampleGenerator: () => {
      // Minimal MP4 with ftyp and moov atoms
      function atom(type, data) {
        const size = 8 + (data ? data.length : 0)
        const buf = new ArrayBuffer(size)
        const v = new DataView(buf)
        v.setUint32(0, size, false)
        new Uint8Array(buf).set(new TextEncoder().encode(type), 4)
        if (data) new Uint8Array(buf).set(data, 8)
        return new Uint8Array(buf)
      }

      const ftyp = atom('ftyp', new Uint8Array([
        ...new TextEncoder().encode('mp42'),
        0x00, 0x00, 0x00, 0x00,
        ...new TextEncoder().encode('mp42'),
        ...new TextEncoder().encode('isom')
      ]))

      // moov atom with a minimal mvhd
      const mvhd = (() => {
        const buf = new ArrayBuffer(108)
        const v = new DataView(buf)
        v.setUint8(0, 0) // version
        // flags
        v.setUint8(1, 0); v.setUint8(2, 0); v.setUint8(3, 0)
        // creation/modification time
        v.setUint32(4, 0, false); v.setUint32(8, 0, false)
        // timescale
        v.setUint32(12, 1000, false)
        // duration
        v.setUint32(16, 0, false)
        // rate
        v.setUint32(20, 0x00010000, false)
        // volume
        v.setUint16(24, 0x0100, false)
        // reserved + matrix + pre_defined
        for (let i = 26; i < 108; i++) v.setUint8(i, 0)
        v.setUint32(64, 0x00010000, false); v.setUint32(72, 0x00010000, false); v.setUint32(80, 0x40000000, false)
        return new Uint8Array(buf)
      })()

      const moov = atom('moov', atom('mvhd', mvhd))
      const parts = [ftyp, moov]
      const totalLen = parts.reduce((s, p) => s + p.length, 0)
      const result = new Uint8Array(totalLen)
      let off = 0
      for (const p of parts) { result.set(p, off); off += p.length }

      return new Blob([result], { type: 'video/mp4' })
    }
  },
  {
    id: 'json',
    name: 'JSON',
    extension: '.json',
    category: 'dati',
    description: 'JavaScript Object Notation è il formato universale per lo scambio di dati sul web. Leggibile sia dagli umani che dalle macchine.',
    uses: 'API web, file di configurazione, archiviazione dati strutturati, scambio dati tra applicazioni.',
    programs: 'Qualsiasi editor di testo, browser web, VSCode (gratis), Notepad++ (gratis), Postman.',
    iconColor: '#FFA000',
    mime: 'application/json',
    sampleGenerator: () => {
      const data = {
        nome: "FileWise",
        versione: "1.0.0",
        formati: ["PDF", "DOCX", "JPG", "PNG", "MP3"],
        attivo: true,
        autore: {
          nome: "Cristian Porco",
          sito: "https://cristianporco.it"
        }
      }
      return new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    }
  },
  {
    id: 'csv',
    name: 'CSV',
    extension: '.csv',
    category: 'dati',
    description: 'Comma-Separated Values è il formato tabellare più semplice: ogni riga è un record, le colonne sono separate da virgole (o punto e virgola).',
    uses: 'Esportazione dati da database, fogli di calcolo, import/export tra software, analisi dati.',
    programs: 'Microsoft Excel, LibreOffice Calc (gratis), Google Fogli (gratis), qualsiasi editor di testo.',
    iconColor: '#43A047',
    mime: 'text/csv',
    sampleGenerator: () => {
      const csv = `Nome,Categoria,Estensione,Dimensione\nPDF,Documenti,.pdf,"3,2 MB"\nJPG,Immagini,.jpg,"1,8 MB"\nMP3,Audio,.mp3,"5,7 MB"\nZIP,Archivi,.zip,"12 MB"\nJSON,Dati,.json,"45 KB"\nHTML,Web,.html,"8 KB"\nCSS,Web,.css,"3 KB"\nJS,Web,.js,"15 KB"`
      return new Blob([csv], { type: 'text/csv' })
    }
  },
  {
    id: 'xml',
    name: 'XML',
    extension: '.xml',
    category: 'dati',
    description: 'eXtensible Markup Language è un formato strutturato a tag, simile all\'HTML ma progettato per trasportare dati. È alla base di molti formati moderni (DOCX, SVG, RSS).',
    uses: 'Configurazioni software, scambio dati tra sistemi, feed RSS, documenti strutturati, API SOAP.',
    programs: 'Qualsiasi editor di testo, browser web, VSCode (gratis), Notepad++ (gratis), Excel.',
    iconColor: '#E65100',
    mime: 'application/xml',
    sampleGenerator: () => {
      const xml = `<?xml version="1.0" encoding="UTF-8"?>
<libreria>
  <libro id="1">
    <titolo>Guida ai formati di file</titolo>
    <autore>Cristian Porco</autore>
    <anno>2026</anno>
    <prezzo valuta="EUR">0.00</prezzo>
  </libro>
  <libro id="2">
    <titolo>FileWise - Il vademecum</titolo>
    <autore>FileWise Team</autore>
    <anno>2026</anno>
    <prezzo valuta="EUR">0.00</prezzo>
  </libro>
</libreria>`
      return new Blob([xml], { type: 'application/xml' })
    }
  },
  {
    id: 'zip',
    name: 'ZIP',
    extension: '.zip',
    category: 'altro',
    description: 'Il formato di archivio compresso più diffuso. Raggruppa più file in uno solo, riducendone le dimensioni con algoritmi di compressione.',
    uses: 'Compressione file, invio di gruppi di documenti, backup, distribuzione software, archiviazione.',
    programs: 'Windows (integrato), macOS (integrato), 7-Zip (gratis), WinRAR, PeaZip (gratis).',
    iconColor: '#795548',
    mime: 'application/zip',
    sampleGenerator: () => {
      // Minimal ZIP with one stored file
      const content = 'Questo è un file di esempio creato da FileWise - Vademecum visivo dei formati di file.\n'
      const filename = 'esempio-filewise.txt'
      const nameBytes = new TextEncoder().encode(filename)
      const encoded = new TextEncoder().encode(content)

      function crc32(data) {
        let crc = 0xFFFFFFFF
        for (let b of data) {
          crc ^= b
          for (let i = 0; i < 8; i++) crc = (crc >>> 1) ^ (crc & 1 ? 0xEDB88320 : 0)
        }
        return (crc ^ 0xFFFFFFFF) >>> 0
      }

      // Local file header
      const lfh = new ArrayBuffer(30 + nameBytes.length + encoded.length)
      const lv = new DataView(lfh)
      let off = 0
      lv.setUint32(off, 0x04034b50, true); off += 4
      lv.setUint16(off, 20, true); off += 2
      lv.setUint16(off, 0, true); off += 2
      lv.setUint16(off, 0, true); off += 2
      lv.setUint16(off, 0x8000, true); off += 2
      lv.setUint16(off, 0x4A21, true); off += 2
      lv.setUint32(off, crc32(encoded), true); off += 4
      lv.setUint32(off, encoded.length, true); off += 4
      lv.setUint32(off, encoded.length, true); off += 4
      lv.setUint16(off, nameBytes.length, true); off += 2
      lv.setUint16(off, 0, true); off += 2
      new Uint8Array(lfh).set(nameBytes, off); off += nameBytes.length
      new Uint8Array(lfh).set(encoded, off)

      // Central directory
      const cd = new ArrayBuffer(46 + nameBytes.length)
      const cv = new DataView(cd)
      off = 0
      cv.setUint32(off, 0x02014b50, true); off += 4
      cv.setUint16(off, 20, true); off += 2
      cv.setUint16(off, 20, true); off += 2
      cv.setUint16(off, 0, true); off += 2
      cv.setUint16(off, 0, true); off += 2
      cv.setUint16(off, 0, true); off += 2
      cv.setUint16(off, 0, true); off += 2
      cv.setUint32(off, crc32(encoded), true); off += 4
      cv.setUint32(off, encoded.length, true); off += 4
      cv.setUint32(off, encoded.length, true); off += 4
      cv.setUint16(off, nameBytes.length, true); off += 2
      cv.setUint16(off, 0, true); off += 2
      cv.setUint16(off, 0, true); off += 2
      cv.setUint16(off, 0, true); off += 2
      cv.setUint32(off, 0, true); off += 4
      cv.setUint32(off, 0, true); off += 4
      new Uint8Array(cd).set(nameBytes, off)

      // EOCD
      const eocd = new ArrayBuffer(22)
      const ev = new DataView(eocd)
      ev.setUint32(0, 0x06054b50, true)
      ev.setUint16(4, 0, true); ev.setUint16(6, 0, true)
      ev.setUint16(8, 1, true); ev.setUint16(10, 1, true)
      ev.setUint32(12, cd.byteLength, true)
      ev.setUint32(16, lfh.byteLength, true)
      ev.setUint16(20, 0, true)

      const totalSize = lfh.byteLength + cd.byteLength + 22
      const result = new Uint8Array(totalSize)
      result.set(new Uint8Array(lfh), 0)
      result.set(new Uint8Array(cd), lfh.byteLength)
      result.set(new Uint8Array(eocd), lfh.byteLength + cd.byteLength)

      return new Blob([result], { type: 'application/zip' })
    }
  },
  {
    id: 'exe',
    name: 'EXE',
    extension: '.exe',
    category: 'eseguibili',
    description: 'Il formato eseguibile di Windows. Contiene codice macchina che il sistema operativo carica direttamente in memoria per eseguire il programma.',
    uses: 'Applicazioni Windows, installer, strumenti di sistema, videogiochi per PC.',
    programs: 'Windows (esecuzione nativa), Wine su Linux/macOS (gratis), 7-Zip per ispezionare il contenuto.',
    iconColor: '#37474F',
    mime: 'application/vnd.microsoft.portable-executable',
    sampleGenerator: () => {
      // Minimal PE (Portable Executable) header
      // DOS header + stub + PE signature + COFF header
      const dosHeader = new Uint8Array(64)
      dosHeader[0] = 0x4D; dosHeader[1] = 0x5A // MZ
      dosHeader[60] = 0x40; dosHeader[61] = 0x00; dosHeader[62] = 0x00; dosHeader[63] = 0x00 // e_lfanew = 64

      const peSignature = new Uint8Array([0x50, 0x45, 0x00, 0x00]) // PE\0\0

      // COFF header (20 bytes)
      const coffHeader = new Uint8Array(20)
      const cv = new DataView(coffHeader.buffer)
      cv.setUint16(0, 0x8664, true) // Machine x64
      cv.setUint16(2, 0, true) // NumberOfSections
      cv.setUint32(4, 0, true) // TimeDateStamp
      cv.setUint32(8, 0, true) // PointerToSymbolTable
      cv.setUint32(12, 0, true) // NumberOfSymbols
      cv.setUint16(16, 0, true) // SizeOfOptionalHeader
      cv.setUint16(18, 0x0002, true) // Characteristics: EXECUTABLE_IMAGE

      const parts = [dosHeader, peSignature, coffHeader]
      const totalLen = parts.reduce((s, p) => s + p.length, 0)
      const result = new Uint8Array(totalLen)
      let off = 0
      for (const p of parts) { result.set(p, off); off += p.length }

      return new Blob([result], { type: 'application/vnd.microsoft.portable-executable' })
    }
  },
  {
    id: 'html',
    name: 'HTML',
    extension: '.html',
    category: 'web',
    description: 'HyperText Markup Language è il linguaggio fondamentale del web. Ogni pagina internet è scritta in HTML e interpretata dal browser.',
    uses: 'Pagine web, email HTML, template, documentazione, prototipi di interfacce.',
    programs: 'Qualsiasi browser, VSCode (gratis), Notepad++ (gratis), Sublime Text, Chrome DevTools.',
    iconColor: '#E44D26',
    mime: 'text/html',
    sampleGenerator: () => {
      const html = `<!DOCTYPE html>
<html lang="it">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>FileWise - Esempio HTML</title>
  <style>
    body { font-family: system-ui, sans-serif; max-width: 600px; margin: 40px auto; padding: 20px; background: #F8FAFE; color: #1A1A2E; }
    h1 { color: #2449C7; }
    .card { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
    code { background: #E8ECF4; padding: 2px 6px; border-radius: 3px; font-family: monospace; }
  </style>
</head>
<body>
  <div class="card">
    <h1>FileWise</h1>
    <p>Questo è un file <code>.html</code> di esempio generato dal <strong>Vademecum visivo dei formati di file</strong>.</p>
    <p>Apri questo file con qualsiasi browser per vederlo renderizzato.</p>
  </div>
</body>
</html>`
      return new Blob([html], { type: 'text/html' })
    }
  },
  {
    id: 'css',
    name: 'CSS',
    extension: '.css',
    category: 'web',
    description: 'Cascading Style Sheets è il linguaggio che definisce l\'aspetto visivo delle pagine web: colori, font, layout, animazioni.',
    uses: 'Stile di siti web, design responsivo, animazioni CSS, temi, personalizzazione interfacce.',
    programs: 'Qualsiasi browser, VSCode (gratis), Chrome DevTools, CodePen (gratis online).',
    iconColor: '#264DE4',
    mime: 'text/css',
    sampleGenerator: () => {
      const css = `/* FileWise - Esempio CSS */
/* Variabili di design (custom properties) */
:root {
  --color-primary: #2449C7;
  --color-surface: #F8FAFE;
  --color-text: #1A1A2E;
  --color-accent: #FF6F00;
  --font-body: system-ui, -apple-system, sans-serif;
  --font-mono: 'Courier New', monospace;
  --radius: 8px;
  --shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

/* Reset di base */
*,
*::before,
*::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: var(--font-body);
  font-size: 16px;
  line-height: 1.6;
  color: var(--color-text);
  background: var(--color-surface);
}

/* Tipografia */
h1 { font-size: 2rem; font-weight: 700; color: var(--color-primary); }
h2 { font-size: 1.5rem; font-weight: 600; }
h3 { font-size: 1.25rem; font-weight: 600; }

/* Link */
a {
  color: var(--color-primary);
  text-decoration: none;
}
a:hover {
  text-decoration: underline;
}

/* Card */
.card {
  background: white;
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  padding: 1.5rem;
}

/* Pulsante */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.625rem 1.25rem;
  border: none;
  border-radius: var(--radius);
  font-family: var(--font-body);
  font-size: 0.9375rem;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.15s, opacity 0.15s;
}
.btn:active { transform: scale(0.97); }
.btn--primary { background: var(--color-primary); color: white; }
.btn--primary:hover { opacity: 0.9; }

/* Utility */
.text-mono { font-family: var(--font-mono); }
.sr-only { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0,0,0,0); }`
      return new Blob([css], { type: 'text/css' })
    }
  },
  {
    id: 'js',
    name: 'JS',
    extension: '.js',
    category: 'web',
    description: 'JavaScript è il linguaggio di programmazione del web. Rende le pagine interattive e dinamiche, ed è usato anche lato server con Node.js.',
    uses: 'Interattività web, applicazioni lato server (Node.js), app mobile (React Native), automazione, giochi.',
    programs: 'Qualsiasi browser (console sviluppatore), VSCode (gratis), Node.js (gratis), CodePen.',
    iconColor: '#F7DF1E',
    mime: 'application/javascript',
    sampleGenerator: () => {
      const js = `/**
 * FileWise - Vademecum visivo dei formati di file
 * Esempio JavaScript
 */

// Formati supportati
const formati = [
  { nome: 'PDF', estensione: '.pdf', categoria: 'documenti' },
  { nome: 'JPG', estensione: '.jpg', categoria: 'immagini' },
  { nome: 'MP3', estensione: '.mp3', categoria: 'audio' },
  { nome: 'JSON', estensione: '.json', categoria: 'dati' },
  { nome: 'HTML', estensione: '.html', categoria: 'web' }
]

// Funzione per filtrare formati per categoria
function filtraPerCategoria(categoria) {
  return formati.filter(f => f.categoria === categoria)
}

// Esempio di utilizzo
const formatiWeb = filtraPerCategoria('web')
console.log('Formati web:', formatiWeb)

// Classe per rappresentare un formato
class FormatoFile {
  constructor(nome, estensione, descrizione) {
    this.nome = nome
    this.estensione = estensione
    this.descrizione = descrizione
  }

  get infoCompleta() {
    return \`\${this.nome} (\${this.estensione}): \${this.descrizione}\`
  }
}

const pdf = new FormatoFile('PDF', '.pdf', 'Formato documento portatile')
console.log(pdf.infoCompleta)

export { filtraPerCategoria, FormatoFile }`
      return new Blob([js], { type: 'application/javascript' })
    }
  },
  {
    id: 'py',
    name: 'PY',
    extension: '.py',
    category: 'eseguibili',
    description: 'Python è un linguaggio di programmazione interpretato, noto per la sua sintassi chiara e leggibile. I file .py contengono codice sorgente Python.',
    uses: 'Data science, automazione, sviluppo web (Django, Flask), intelligenza artificiale, scripting.',
    programs: 'Python (gratis), VSCode (gratis), PyCharm Community (gratis), Jupyter Notebook (gratis), IDLE.',
    iconColor: '#3776AB',
    mime: 'text/x-python',
    sampleGenerator: () => {
      const py = `"""
FileWise - Vademecum visivo dei formati di file
Esempio Python
"""

from dataclasses import dataclass
from typing import List, Optional


@dataclass
class FormatoFile:
    """Rappresenta un formato di file con i suoi metadati."""
    nome: str
    estensione: str
    categoria: str
    descrizione: str = ""

    @property
    def nome_completo(self) -> str:
        return f"{self.nome} ({self.estensione})"


class Vademecum:
    """Gestisce la raccolta di formati di file."""

    CATEGORIE = ["documenti", "immagini", "audio", "dati", "web", "eseguibili"]

    def __init__(self):
        self.formati: List[FormatoFile] = []

    def aggiungi(self, formato: FormatoFile) -> None:
        self.formati.append(formato)

    def filtra_per_categoria(self, categoria: str) -> List[FormatoFile]:
        return [f for f in self.formati if f.categoria == categoria]

    def cerca(self, query: str) -> List[FormatoFile]:
        query = query.lower()
        return [f for f in self.formati
                if query in f.nome.lower() or query in f.estensione.lower()]


# Esempio di utilizzo
if __name__ == "__main__":
    v = Vademecum()
    v.aggiungi(FormatoFile("PDF", ".pdf", "documenti",
                           "Formato documento portatile"))
    v.aggiungi(FormatoFile("JPG", ".jpg", "immagini",
                           "Immagine compressa JPEG"))
    v.aggiungi(FormatoFile("MP3", ".mp3", "audio",
                           "Audio compresso MPEG Layer 3"))

    print("=== FileWise Vademecum ===")
    for f in v.formati:
        print(f"  {f.nome_completo} [{f.categoria}]")

    print(f"\\nTotale formati: {len(v.formati)}")`
      return new Blob([py], { type: 'text/x-python' })
    }
  },
  {
    id: 'ttf',
    name: 'TTF',
    extension: '.ttf',
    category: 'font',
    description: 'TrueType Font è un formato di caratteri tipografici sviluppato da Apple e Microsoft. Definisce la forma di ogni glifo tramite curve di Bézier.',
    uses: 'Tipografia digitale, design grafico, interfacce utente, editoria, siti web (con @font-face).',
    programs: 'Windows (integrato), macOS (integrato), FontForge (gratis), Google Fonts.',
    iconColor: '#00897B',
    mime: 'font/ttf',
    sampleGenerator: () => {
      // Minimal TTF: offset table + basic tables
      function stringToBytes(s) { return new TextEncoder().encode(s) }

      // We'll create a minimal but structurally valid TTF
      // Offset table (12 bytes)
      const sfVersion = new Uint8Array([0x00, 0x01, 0x00, 0x00]) // TrueType outline
      const numTables = new Uint8Array([0x00, 0x02]) // 2 tables: cmap, name
      // searchRange, entrySelector, rangeShift
      const searchRange = new Uint8Array([0x00, 0x04])
      const entrySelector = new Uint8Array([0x00, 0x01])
      const rangeShift = new Uint8Array([0x00, 0x00])

      // Table directory starts at offset 12
      // Each entry: 4-byte tag + 4-byte checksum + 4-byte offset + 4-byte length

      // We'll put cmap first, then name
      // cmap header: version(2) + numTables(2) + encoding records
      const cmapData = (() => {
        const buf = new ArrayBuffer(20)
        const v = new DataView(buf)
        v.setUint16(0, 0, false)    // version
        v.setUint16(2, 1, false)    // numTables
        v.setUint16(4, 0, false)    // platformID 0 (Unicode)
        v.setUint16(6, 4, false)    // encodingID 4 (Unicode BMP)
        v.setUint32(8, 20, false)   // subtable offset
        // Format 4 subtable (minimal)
        v.setUint16(12, 4, false)   // format
        v.setUint16(14, 24, false)  // length
        v.setUint16(16, 0, false)   // language
        v.setUint16(18, 0, false)   // segCountX2 (0 = minimal)
        return new Uint8Array(buf)
      })()

      // name table
      const nameData = (() => {
        const buf = new ArrayBuffer(15)
        const v = new DataView(buf)
        v.setUint16(0, 0, false)  // format
        v.setUint16(2, 0, false)  // count
        v.setUint16(4, 0, false)  // stringOffset
        // no name records
        return new Uint8Array(buf)
      })()

      // Build the whole thing manually
      const cmapTag = stringToBytes('cmap')
      const nameTag = stringToBytes('name')

      const offsetTable = 12
      const tableDirSize = 16 * 2 // 2 tables * 16 bytes
      const cmapOffset = offsetTable + tableDirSize
      const nameOffset = cmapOffset + cmapData.length

      // Calculate checksums
      function calcChecksum(data) {
        const buf = new Uint8Array(data)
        let sum = 0
        for (let i = 0; i < buf.length; i += 4) {
          let val = (buf[i] || 0) << 24 | (buf[i+1] || 0) << 16 | (buf[i+2] || 0) << 8 | (buf[i+3] || 0)
          sum = (sum + val) >>> 0
        }
        return sum
      }

      const totalSize = nameOffset + nameData.length
      const result = new Uint8Array(totalSize)

      // Offset table
      result.set(sfVersion, 0)
      result.set(numTables, 4)
      result.set(searchRange, 6)
      result.set(entrySelector, 8)
      result.set(rangeShift, 10)

      // Table directory entries
      let pos = 12
      const cmapChecksum = calcChecksum(cmapData.buffer)
      const nameChecksum = calcChecksum(nameData.buffer)

      const writeEntry = (tag, checksum, offset, length) => {
        result.set(tag, pos)
        const v = new DataView(result.buffer)
        v.setUint32(pos + 4, checksum, false)
        v.setUint32(pos + 8, offset, false)
        v.setUint32(pos + 12, length, false)
        pos += 16
      }

      writeEntry(cmapTag, cmapChecksum, cmapOffset, cmapData.length)
      writeEntry(nameTag, nameChecksum, nameOffset, nameData.length)

      // Table data
      result.set(cmapData, cmapOffset)
      result.set(nameData, nameOffset)

      return new Blob([result], { type: 'font/ttf' })
    }
  },
  {
    id: 'ico',
    name: 'ICO',
    extension: '.ico',
    category: 'altro',
    description: 'Il formato icona di Windows. Può contenere più dimensioni della stessa immagine per adattarsi a diverse risoluzioni dello schermo.',
    uses: 'Icone di applicazioni, favicon dei siti web, icone di file e cartelle, pulsanti delle barre degli strumenti.',
    programs: 'Windows (integrato), GIMP (gratis), IcoFX, ImageMagick (gratis), browser per favicon.',
    iconColor: '#5C6BC0',
    mime: 'image/x-icon',
    sampleGenerator: () => {
      // Minimal ICO with one 16x16 entry + PNG data
      // ICO header: reserved(2), type(2), count(2)
      const header = new Uint8Array([0x00, 0x00, 0x01, 0x00, 0x01, 0x00])
      // Directory entry: w, h, colors, reserved, planes, bpp, size, offset
      const entry = new Uint8Array([
        0x10, 0x10, 0x00, 0x00, 0x01, 0x00, 0x20, 0x00,
        0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00
      ])
      // Entry size will be set based on PNG data
      // Minimal PNG for 16x16 blue icon
      // ... let's just use a small embedded PNG-like blob
      const pngLike = new Uint8Array([
        0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A
      ])
      // Actually ICO files embed a full PNG or BMP. Let's create a proper small PNG.
      // For simplicity, I'll generate a minimal 16x16 PNG inside the ICO.

      // Set the size in the entry
      const ev = new DataView(entry.buffer)
      const entryOffset = 6 + 16 // header + entry

      // Let's create a real minimal PNG for this
      function crc32(buf) {
        let crc = 0xFFFFFFFF
        const data = new Uint8Array(buf)
        for (let b of data) {
          crc ^= b
          for (let i = 0; i < 8; i++) crc = (crc >>> 1) ^ (crc & 1 ? 0xEDB88320 : 0)
        }
        return (crc ^ 0xFFFFFFFF) >>> 0
      }

      function pngChunk(type, data) {
        const typeBytes = new TextEncoder().encode(type)
        const dataArr = data ? new Uint8Array(data) : new Uint8Array(0)
        const dataLen = dataArr.length
        const buf = new ArrayBuffer(12 + dataLen)
        const v = new DataView(buf)
        v.setUint32(0, dataLen, false)
        new Uint8Array(buf).set(typeBytes, 4)
        if (dataLen > 0) new Uint8Array(buf).set(dataArr, 8)
        const crcInput = new Uint8Array(buf.slice(4, 8 + dataLen))
        v.setUint32(8 + dataLen, crc32(crcInput.buffer), false)
        return new Uint8Array(buf)
      }

      const pngSig = new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10])

      const ihdrData = new ArrayBuffer(13)
      const iv = new DataView(ihdrData)
      iv.setUint32(0, 16, false)
      iv.setUint32(4, 16, false)
      iv.setUint8(8, 8)
      iv.setUint8(9, 2)
      iv.setUint8(10, 0)
      iv.setUint8(11, 0)
      iv.setUint8(12, 0)

      // Create 16 scanlines of RGB blue pixels
      const rawLines = []
      for (let y = 0; y < 16; y++) {
        const line = new Uint8Array(1 + 16 * 3) // filter byte + 16 RGB pixels
        line[0] = 0 // filter none
        for (let x = 0; x < 16; x++) {
          line[1 + x * 3] = 0x24     // R
          line[1 + x * 3 + 1] = 0x49 // G
          line[1 + x * 3 + 2] = 0xC7 // B
        }
        rawLines.push(line)
      }

      const rawData = new Uint8Array(rawLines.reduce((s, l) => s + l.length, 0))
      let roff = 0
      for (const line of rawLines) {
        rawData.set(line, roff)
        roff += line.length
      }

      // Simple zlib stored block
      const rawLen = rawData.length
      const deflateData = new Uint8Array(6 + rawLen + 4)
      deflateData[0] = 0x78; deflateData[1] = 0x01 // zlib header
      deflateData[2] = 0x01 // final block, stored
      deflateData[3] = rawLen & 0xFF
      deflateData[4] = (rawLen >> 8) & 0xFF
      deflateData[5] = (~rawLen) & 0xFF
      deflateData[6] = ((~rawLen) >> 8) & 0xFF
      deflateData.set(rawData, 6)

      let s1 = 1, s2 = 0
      for (const b of rawData) { s1 = (s1 + b) % 65521; s2 = (s2 + s1) % 65521 }
      const adler = (s2 << 16) | s1
      const dv2 = new DataView(deflateData.buffer)
      dv2.setUint32(deflateData.length - 4, adler, false)

      const ihdr = pngChunk('IHDR', ihdrData)
      const idat = pngChunk('IDAT', deflateData.buffer)
      const iend = pngChunk('IEND', null)

      const pngParts = [pngSig, ihdr, idat, iend]
      const pngLen = pngParts.reduce((s, p) => s + p.byteLength, 0)
      const pngFull = new Uint8Array(pngLen)
      let ppos = 0
      for (const p of pngParts) { pngFull.set(p, ppos); ppos += p.byteLength }

      ev.setUint32(8, pngLen, false) // size
      ev.setUint32(12, entryOffset, false) // offset

      const result = new Uint8Array(entryOffset + pngLen)
      result.set(header, 0)
      result.set(entry, 6)
      result.set(pngFull, entryOffset)

      return new Blob([result], { type: 'image/x-icon' })
    }
  },
  {
    id: 'txt',
    name: 'TXT',
    extension: '.txt',
    category: 'documenti',
    description: 'Il formato testo puro è il più semplice e universale: contiene solo caratteri senza formattazione. Può essere aperto su qualsiasi dispositivo.',
    uses: 'Appunti, note, readme, file di configurazione, log di sistema, qualunque testo semplice.',
    programs: 'Blocco note (Windows), TextEdit (macOS), VSCode (gratis), qualsiasi editor di testo, terminale.',
    iconColor: '#607D8B',
    mime: 'text/plain',
    sampleGenerator: () => {
      const txt = `FILEWISE - VADEMECUM VISIVO DEI FORMATI DI FILE
=====================================================

Questo è un file .txt di esempio.

I file di testo puro (.txt) sono il formato più semplice e universale:
- Contengono solo caratteri leggibili
- Nessuna formattazione (niente grassetto, corsivo, colori)
- Possono essere aperti su QUALSIASI dispositivo
- Sono il formato ideale per appunti, note e readme

Formati di file comuni:
  DOCUMENTI: .pdf, .docx, .txt
  IMMAGINI:  .jpg, .png, .gif, .svg
  AUDIO:     .mp3, .wav, .flac
  VIDEO:     .mp4, .avi, .mkv
  DATI:      .json, .csv, .xml
  WEB:       .html, .css, .js

Creato da FileWise - https://cristianporco.it/app/filewise/`
      return new Blob([txt], { type: 'text/plain' })
    }
  },
  {
    id: 'md',
    name: 'MD',
    extension: '.md',
    category: 'documenti',
    description: 'Markdown è un formato di testo leggero con marcatori semplici per aggiungere struttura (titoli, grassetto, link, elenchi). Usatissimo nella documentazione tecnica.',
    uses: 'Documentazione software (README), blogging, note tecniche, messaggi su GitHub/GitLab, Wiki.',
    programs: 'Qualsiasi editor di testo, VSCode con anteprima (gratis), Obsidian (gratis), Typora, GitHub.',
    iconColor: '#546E7A',
    mime: 'text/markdown',
    sampleGenerator: () => {
      const md = `# FileWise — Vademecum visivo dei formati di file

Uno strumento interattivo per **riconoscere e capire** i formati di file.

## Formati supportati

| Formato | Categoria | Estensione |
|---------|-----------|------------|
| PDF     | Documenti | \`.pdf\`   |
| JPG     | Immagini  | \`.jpg\`   |
| MP3     | Audio     | \`.mp3\`   |
| JSON    | Dati      | \`.json\`  |
| HTML    | Web       | \`.html\`  |

## Come usare FileWise

1. 🔍 **Cerca** un formato nella barra di ricerca
2. 🏷️ **Filtra** per categoria usando i pulsanti
3. 👆 **Clicca** su un formato per vedere i dettagli
4. 📥 **Scarica** un file di esempio

## Codice di esempio

Ecco come generare un file JSON in JavaScript:

\`\`\`javascript
const data = { nome: "FileWise", versione: "1.0.0" }
const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
\`\`\`

---

*Creato da [Cristian Porco](https://cristianporco.it)*`
      return new Blob([md], { type: 'text/markdown' })
    }
  }
]

// Helper per ottenere un formato dal suo id
export function getFormatById(id) {
  return formats.find(f => f.id === id) || null
}

// Filtra formati per query e categoria
export function filterFormats(query, category) {
  let result = formats
  if (category && category !== 'tutti') {
    result = result.filter(f => f.category === category)
  }
  if (query && query.trim()) {
    const q = query.toLowerCase().trim()
    result = result.filter(f =>
      f.name.toLowerCase().includes(q) ||
      f.extension.toLowerCase().includes(q) ||
      f.description.toLowerCase().includes(q) ||
      f.uses.toLowerCase().includes(q)
    )
  }
  return result
}
