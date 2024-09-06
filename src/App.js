import React, { useState, useCallback } from 'react';
import * as XLSX from 'xlsx';

function App() {
  const [urls, setUrls] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isOpening, setIsOpening] = useState(false);

  const handleFileUpload = useCallback((event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: 'array' });
          if (!workbook.SheetNames.includes('리스트')) {
            throw new Error("'리스트' 시트를 찾을 수 없습니다.");
          }
          const worksheet = workbook.Sheets['리스트'];
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: "" });
          const extractedUrls = jsonData.map(row => row[2]).filter(url => 
            typeof url === 'string' && url.trim().startsWith('http')
          );
          setUrls(extractedUrls);
          setCurrentIndex(0);
        } catch (error) {
          console.error('엑셀 파일 처리 중 오류 발생:', error);
          alert(error.message || '엑셀 파일 처리 중 오류가 발생했습니다.');
        }
      };
      reader.readAsArrayBuffer(file);
    }
  }, []);

  const openNextGroup = useCallback(() => {
    setIsOpening(true);
    const endIndex = Math.min(currentIndex + 10, urls.length);
    let i = currentIndex;
    const intervalId = setInterval(() => {
      if (i < endIndex) {
        window.open(urls[i], '_blank');
        i++;
      } else {
        clearInterval(intervalId);
        setCurrentIndex(endIndex);
        setIsOpening(false);
      }
    }, 5000);
  }, [currentIndex, urls]);

  return (
    <div className="App">
      <h1>엑셀 파일 업로드</h1>
      <input type="file" accept=".xlsx, .xls" onChange={handleFileUpload} />
      {urls.length > 0 && (
        <div>
          <p>{urls.length}개의 URL이 추출되었습니다.</p>
          {currentIndex < urls.length ? (
            <button onClick={openNextGroup} disabled={isOpening}>
              {isOpening ? '열기 중...' : '다음 10개 열기'}
            </button>
          ) : (
            <p>모든 URL 오픈</p>
          )}
          <p>현재 진행: {currentIndex}/{urls.length}</p>
        </div>
      )}
    </div>
  );
}

export default App;