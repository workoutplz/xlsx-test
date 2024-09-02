import React, { useState } from 'react';
import * as XLSX from 'xlsx';

function App() {
  const [urls, setUrls] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [buttonText, setButtonText] = useState('URL 열기'); // 버튼 텍스트 상태 추가

  const handleFileUpload = (event) => {
    const file = event.target.files[0];

    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        // URL 가져오기
        const extractedUrls = jsonData.slice(1).map((row) => row[2]).filter(Boolean);
        setUrls(extractedUrls); // 상태에 저장
      };
      reader.readAsArrayBuffer(file);
    }
  };

  const openUrlsInBatches = () => {
    const batchSize = 10;
    const nextBatch = urls.slice(currentIndex, currentIndex + batchSize);

    let index = 0;

    const openNextUrl = () => {
      if (index < nextBatch.length) {
        window.open(nextBatch[index], '_blank'); // 새 탭 열기
        index++;

        const randomDelay = Math.random() * 2000 + 3000; // 3000ms ~ 5000ms 사이의 랜덤 시간
        setTimeout(openNextUrl, randomDelay); // 다음 URL 열기
      } else {
        setCurrentIndex(currentIndex + batchSize); // 현재 인덱스를 다음 배치로 증가
        setButtonText('다음'); // 첫 번째 배치 이후 버튼 텍스트를 '다음'으로 변경
      }
    };

    openNextUrl();
  };

  return (
    <div className="App">
      <h1>엑셀 파일 업로드</h1>
      <input type="file" accept=".xlsx, .xls" onChange={handleFileUpload} />
      {urls.length > 0 && currentIndex < urls.length && (
        <button onClick={openUrlsInBatches}>{buttonText}</button>
      )}
    </div>
  );
}

export default App;