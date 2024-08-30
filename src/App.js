import React, { useState } from 'react';
import * as XLSX from 'xlsx';

function App() {
  const [urls, setUrls] = useState([]);

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

  const openUrlsSequentially = () => {
    let index = 0;

    const openNextUrl = () => {
      if (index < urls.length) {
        window.open(urls[index], '_blank'); // 새 탭 열기
        index++;
        setTimeout(openNextUrl, 5000); // 5초 후 다음 URL 열기
      }
    };

    openNextUrl();
  };

  return (
    <div className="App">
      <h1>엑셀 파일 업로드</h1>
      <input type="file" accept=".xlsx, .xls" onChange={handleFileUpload} />
      {urls.length > 0 && (
        <button onClick={openUrlsSequentially}>URL 열기</button>
      )}
    </div>
  );
}

export default App;