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

  return (
    <main className="max-w-3xl mx-auto p-8 bg-white shadow-lg rounded-xl mt-10">
      <h1 className="text-4xl font-extrabold text-center text-pink-500">
        Polaroidfy
      </h1>
      <p className="text-center mt-2 text-gray-600">
        Faça upload das suas fotos, ajuste o crop para a área Polaroid e gere
        seu PDF personalizado!
      </p>

      <div className="my-6 flex flex-col items-center">
        <label className="cursor-pointer inline-block px-6 py-3 bg-pink-500 text-white font-medium rounded-lg shadow hover:bg-pink-600 transition-colors">
          Selecionar Fotos
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleFiles}
            className="hidden"
          />
        </label>
        <span className="mt-2 text-gray-500 text-sm">
          Você pode selecionar várias imagens
        </span>
      </div>

      {fileList.length > 0 && isCropping && (
        <div className="space-y-4">
          <div className="text-center text-gray-700">
            Foto {current} de {total}
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
                Zoom:
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
              {current < total ? "Próxima Foto" : "Finalizar e Ver Preview"}
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
            {({ loading }) => (loading ? "Preparando..." : "Download do PDF")}
          </PDFDownloadLink>
        </div>
      )}
    </main>
  );
}
