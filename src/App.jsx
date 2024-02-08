import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, serverTimestamp, getDocs, deleteDoc, doc } from 'firebase/firestore';
import './App.css';


const firebaseConfig = {
  apiKey: "AIzaSyC1knvNSqsSu-9SFPivRHk6QcOypWw5emY",
  authDomain: "db-upload-dd7f4.firebaseapp.com",
  projectId: "db-upload-dd7f4",
  storageBucket: "db-upload-dd7f4.appspot.com",
  messagingSenderId: "382587648271",
  appId: "1:382587648271:web:51b75e026e02a6a746267a"
};
// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);

const firestore = getFirestore(firebaseApp);

function App() {
  const [textInput, setTextInput] = useState('');
  const [fileName, setFileName] = useState('textFile.txt');
  const [previousFiles, setPreviousFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);

  useEffect(() => {
    const fetchPreviousFiles = async () => {
      const querySnapshot = await getDocs(collection(firestore, 'textCollection'));
      const files = [];
      querySnapshot.forEach((doc) => {
        files.push({ id: doc.id, ...doc.data() });
      });
      setPreviousFiles(files);
    };

    fetchPreviousFiles();
  }, []);

  const handleSave = async () => {
    try {
      await addDoc(collection(firestore, 'textCollection'), {
        text: textInput,
        timestamp: serverTimestamp(),
      });
      console.log('Text saved to Firestore');
    } catch (error) {
      console.error('Error saving text to Firestore', error);
    }
  };

  const handleDownload = () => {
    const content = selectedFile ? selectedFile.text : textInput;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = selectedFile ? `${selectedFile.fileName}.txt` : `${fileName}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleDelete = async () => {
    if (selectedFile) {
      try {
        await deleteDoc(doc(firestore, 'textCollection', selectedFile.id));
        console.log('Text deleted from Firestore');
        // Fetch the updated list of files after deletion
        const querySnapshot = await getDocs(collection(firestore, 'textCollection'));
        const files = [];
        querySnapshot.forEach((doc) => {
          files.push({ id: doc.id, ...doc.data() });
        });
        setPreviousFiles(files);
      } catch (error) {
        console.error('Error deleting text from Firestore', error);
      }
    }
  };

  return (
    <div className="App">
      <textarea rows="10" cols="50" value={textInput} onChange={(e) => setTextInput(e.target.value)} />
      <br />
      {/* <input
        type="text"
        placeholder="Enter file name"
        value={fileName}
        onChange={(e) => setFileName(e.target.value)}
      /> */}
      <br />
      <button onClick={handleSave}>Save</button>
      <button onClick={handleDownload}>Download</button>
      <button onClick={handleDelete} disabled={!selectedFile}>
        Delete
      </button>

      <div>
        <h2>Previous Files:</h2>
        <ul>
          {previousFiles.map((file) => (
            <li key={file.id}>
              <button onClick={() => setSelectedFile(file)}>Select</button>
              {`file - ${file.timestamp.toDate().toLocaleString()}`}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default App;