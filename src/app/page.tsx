/* eslint-disable */
"use client";
import { useState, useCallback } from "react";
import { PDFDownloadLink, PDFViewer } from "@react-pdf/renderer";
import { PolaroidPDF } from "../components/PolaroidPDF";
import Cropper from "react-easy-crop";

async function getCroppedImage(imageSrc: string, area: any) {
  const img = new Image();
  img.src = imageSrc;
  await new Promise((r) => (img.onload = r));
  const canvas = document.createElement("canvas");
  canvas.width = area.width;
  canvas.height = area.height;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(
    img,
    area.x,
    area.y,
    area.width,
    area.height,
    0,
    0,
    area.width,
    area.height
  );
  return canvas.toDataURL("image/jpeg");
}

export default function Home() {
  const [fileList, setFileList] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [areaPixels, setAreaPixels] = useState<any>(null);
  const [croppedImages, setCroppedImages] = useState<string[]>([]);
  const [language, setLanguage] = useState<'en' | 'pt'>('pt'); // Default to Portuguese

  const translations = {
    en: {
      title: "Polaroidfy",
      subtitle: "Upload your photos, adjust the crop for the Polaroid area, and generate your custom PDF!",
      selectPhotos: "Select Photos",
      multipleSelection: "You can select multiple images",
      photoCount: "Photo {current} of {total}",
      zoom: "Zoom:",
      nextPhoto: "Next Photo",
      finishPreview: "Finish and Preview",
      preparing: "Preparing...",
      downloadPdf: "Download PDF"
    },
    pt: {
      title: "Polaroidfy",
      subtitle: "Faça upload das suas fotos, ajuste o crop para a área Polaroid e gere seu PDF personalizado!",
      selectPhotos: "Selecionar Fotos",
      multipleSelection: "Você pode selecionar várias imagens",
      photoCount: "Foto {current} de {total}",
      zoom: "Zoom:",
      nextPhoto: "Próxima Foto",
      finishPreview: "Finalizar e Ver Preview",
      preparing: "Preparando...",
      downloadPdf: "Download do PDF"
    }
  };

  interface AreaPixels {
    width: number;
    height: number;
    x: number;
    y: number;
  }

  type OnCropComplete = (
    croppedArea: any,
    croppedAreaPixels: AreaPixels
  ) => void;

  const onCropComplete: OnCropComplete = useCallback(
    (_: any, croppedAreaPixels: AreaPixels) => {
      setAreaPixels(croppedAreaPixels);
    },
    []
  );

  function handleFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files) return;
    const urls = Array.from(files).map((f) => URL.createObjectURL(f));
    setFileList(urls);
    setCurrentIndex(0);
    setCroppedImages([]);
  }

  const confirmCrop = async () => {
    if (!areaPixels) return;
    const cropped = await getCroppedImage(fileList[currentIndex], areaPixels);
    setCroppedImages((prev) => [...prev, cropped]);
    const nextIndex = currentIndex + 1;
    if (nextIndex < fileList.length) {
      setCurrentIndex(nextIndex);
      setCrop({ x: 0, y: 0 });
      setZoom(1);
    } else {
      setCurrentIndex(nextIndex);
    }
  };

  const isCropping = currentIndex < fileList.length;
  const total = fileList.length;
  const current = currentIndex + 1;

  // Helper function to get translations
  const t = (key: keyof typeof translations.en) => {
    return translations[language][key]
      .replace('{current}', current.toString())
      .replace('{total}', total.toString());
  };

  return (
    <main className="max-w-3xl mx-auto p-8 bg-white shadow-lg rounded-xl mt-10 relative">
      {/* Language selector */}
      <div className="absolute top-4 right-4 flex space-x-2">
        <button
          onClick={() => setLanguage('pt')}
          className={`px-2 py-1 rounded ${language === 'pt' ? 'bg-pink-500 text-white' : 'bg-gray-200 text-gray-700'}`}
        >
          PT
        </button>
        <button
          onClick={() => setLanguage('en')}
          className={`px-2 py-1 rounded ${language === 'en' ? 'bg-pink-500 text-white' : 'bg-gray-200 text-gray-700'}`}
        >
          EN
        </button>
      </div>

      <h1 className="text-4xl font-extrabold text-center text-pink-500">
        {t('title')}
      </h1>
      <p className="text-center mt-2 text-gray-600">
        {t('subtitle')}
      </p>

      <div className="my-6 flex flex-col items-center">
        <label className="cursor-pointer inline-block px-6 py-3 bg-pink-500 text-white font-medium rounded-lg shadow hover:bg-pink-600 transition-colors">
          {t('selectPhotos')}
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleFiles}
            className="hidden"
          />
        </label>
        <span className="mt-2 text-gray-500 text-sm">
          {t('multipleSelection')}
        </span>
      </div>

      {fileList.length > 0 && isCropping && (
        <div className="space-y-4">
          <div className="text-center text-gray-700">
            {t('photoCount')}
          </div>
          <div className="relative w-full h-[500px] bg-gray-200 rounded-lg overflow-hidden text-black">
            <Cropper
              image={fileList[currentIndex]}
              crop={crop}
              zoom={zoom}
              aspect={1}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={onCropComplete}
            />
          </div>
           <div className="flex items-center space-x-4">
            <label className="flex-1 text-black">
              <p className="text-black">
                {t('zoom')}
              </p>
              <input
                type="range"
                min={1}
                max={3}
                step={0.1}
                value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
                className="w-full"
              />
            </label>
            <button
              onClick={confirmCrop}
              className="px-6 py-2 bg-pink-500 text-white font-medium rounded-lg shadow hover:bg-pink-600"
            >
              {current < total ? t('nextPhoto') : t('finishPreview')}
            </button>
          </div>
        </div>
      )}

      {fileList.length > 0 && !isCropping && (
        <div className="border rounded-lg overflow-hidden h-[600px]">
          <PDFViewer className="w-full h-full">
            <PolaroidPDF images={croppedImages} />
          </PDFViewer>
        </div>
      )}

      {croppedImages.length > 0 && !isCropping && (
        <div className="text-center mt-4">
          <PDFDownloadLink
            document={<PolaroidPDF images={croppedImages} />}
            fileName="polaroids.pdf"
            className="inline-block px-6 py-3 bg-pink-500 text-white font-medium rounded-lg shadow hover:bg-pink-600"
          >
            {({ loading }) => (loading ? t('preparing') : t('downloadPdf'))}
          </PDFDownloadLink>
        </div>
      )}
    </main>
  );
}