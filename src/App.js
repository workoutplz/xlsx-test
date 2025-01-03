import React, { useState, useCallback } from 'react';
import * as XLSX from 'xlsx';
import './App.css';
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
          const worksheet = workbook.Sheets[workbook.SheetNames[0]];
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: "" });
          const extractedUrls = jsonData.flatMap(row => 
            row.filter(cell => 
              typeof cell === 'string' && cell.trim().startsWith('http')
            )
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

  const [groupSize, setGroupSize] = useState(10);

  const openNextGroup = useCallback(() => {
    setIsOpening(true);
    const endIndex = Math.min(currentIndex + groupSize, urls.length);
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
  }, [currentIndex, urls, groupSize]);

  return (
    <div className="container">
      <div className="card">
        <h1>링크드인 프로필 오픈</h1>
        <div className="upload-section">
          <label className="file-upload">
            <input type="file" accept=".xlsx, .xls" onChange={handleFileUpload} />
            <span>프로필 리스트 가져오기</span>
          </label>
        </div>
        
        {urls.length > 0 && (
          <div className="control-section">
            <div className="status-info">
              <p className="url-count">총 {urls.length}개의 URL</p>
              <p className="progress">진행률: {Math.round((currentIndex/urls.length) * 100)}%</p>
            </div>
            
            <div className="group-control">
              <label className="group-size-input">
                한 번에 열 URL 개수: 
                <input 
                  type="number" 
                  min="1"
                  max={urls.length}
                  value={groupSize}
                  onChange={(e) => setGroupSize(Math.max(1, parseInt(e.target.value) || 1))}
                />
              </label>
            </div>
            
            {currentIndex < urls.length ? (
              <button 
                className={`action-button ${isOpening ? 'loading' : ''}`}
                onClick={openNextGroup} 
                disabled={isOpening}
              >
                {isOpening ? '열기 중...' : `다음 ${groupSize}개 열기`}
              </button>
            ) : (
              <p className="complete-message">모든 URL을 열었습니다! 🎉</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;