import { Document, Page, View, Image, StyleSheet } from "@react-pdf/renderer";
const PAGE_W = 210,
  PAGE_H = 297,
  POLA_W = 89,
  POLA_H = 108,
  MARGIN = 5;
const styles = StyleSheet.create({
  page: { flexDirection: "row", flexWrap: "wrap", padding: `${MARGIN}mm` },
  polaroid: {
    width: `${POLA_W}mm`,
    height: `${POLA_H}mm`,
    margin: `${MARGIN}mm`,
    backgroundColor: "#fff",
    alignItems: "center",
    borderWidth: 0.5,
    borderColor: "#000",
    borderDashArray: [2, 2],
  },
  photo: {
    width: `${POLA_W - 10}mm`,
    height: `${POLA_W - 10}mm`,
    marginTop: "5mm",
  },
});
interface PolaroidPDFProps {
  images: string[];
}
export function PolaroidPDF({ images }: PolaroidPDFProps) {
  const cols = Math.floor((PAGE_W - 2 * MARGIN) / (POLA_W + 2 * MARGIN));
  const rows = Math.floor((PAGE_H - 2 * MARGIN) / (POLA_H + 2 * MARGIN));
  const perPage = cols * rows;
  const pages: string[][] = [];
  for (let i = 0; i < images.length; i += perPage)
    pages.push(images.slice(i, i + perPage));
  return (
    <Document>
      {pages.map((slice, pi) => (
        <Page key={pi} size="A4" style={styles.page} wrap>
          {slice.map((src, i) => (
            <View key={i} style={styles.polaroid}>
              <Image src={src} style={styles.photo} />
            </View>
          ))}
        </Page>
      ))}
    </Document>
  );
}
