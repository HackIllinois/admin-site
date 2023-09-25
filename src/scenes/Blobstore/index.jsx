import { useReducer, useState } from 'react';
import JSONInput from 'react-json-editor-ajrm';
import locale from 'react-json-editor-ajrm/locale/en';
import { createBlob, getBlob, updateBlob } from 'util/api';

import './style.scss';

const initialPlaceholder = { text: 'placeholder' };
const defaultGetButtonText = 'Get Blob';
const defaultUpdateButtonText = 'Set Blob';
const resetTextTimeout = 2000; // the text of the buttons is used to indicate status, and we reset it to default after a short delay

const getFailedResponseData = async (res) => res.json ? await res.json() : null;
const createAPIErrorMessage = async (message, failedRes) => {
  const responseData = await getFailedResponseData(failedRes);
  if (responseData) {
    return `${message}, error: ${JSON.stringify(responseData)}`;
  }
  return message;
}

const Blobstore = () => {
  const [blobId, setBlobId] = useState('');
  const [initialBlobValue, setInitialBlobValue] = useState(initialPlaceholder);
  const [blobValue, setBlobValue] = useState(initialPlaceholder);
  const [getButtonText, setGetButtonText] = useState(defaultGetButtonText);
  const [updateButtonText, setUpdateButtonText] = useState(defaultUpdateButtonText);
  
  // calling forceReset() will cause the JSONInput to re-render with the initial value
  // (this works by incrementing the key passed to JSONInput when forceReset() is called)
  const [jsonInputKey, forceResetJSONInput] = useReducer(x => x + 1, 0);

  const getBlobData = () => {
    if (!blobId) {
      alert("Please specify a blob ID");
      setInitialBlobValue(initialPlaceholder);
    } else {
      setGetButtonText("Loading...");
      getBlob(blobId)
        .then(blob => {
          setInitialBlobValue(blob.data);
          forceResetJSONInput();
          setGetButtonText('Success!');
        })
        .catch(async (res) => {
          setGetButtonText('Error!');
          alert(await createAPIErrorMessage('Failed to get blob', res));
        })
        .finally(() => {
          setTimeout(() => setGetButtonText(defaultGetButtonText), resetTextTimeout)
        });
    }
  };

  const setBlobData = async () => {
    if (!blobId) { 
      alert("Please specify a blob ID");
    } else {
      setUpdateButtonText("Loading...");

      // First we see if the blob already exists in order to determine whether to create or update
      const doesBlobExist = await getBlob(blobId).then(() => true).catch(() => false);
      try {
        if (doesBlobExist) {
          await updateBlob(blobId, blobValue);
        } else {
          await createBlob(blobId, blobValue);
        }
        setUpdateButtonText("Success!");
      } catch (res) {
        setUpdateButtonText("Error!");
        alert(await createAPIErrorMessage('Failed to set blob', res));
      } finally {
        setTimeout(() => setUpdateButtonText(defaultUpdateButtonText), resetTextTimeout);
      }
    }
  };

  return (
    <div className="blobstore-page">
      <div className='blobstore-buttons'>
        <input className='blob-id-input' type="text" placeholder="Blob ID" value={blobId} onChange={e => setBlobId(e.target.value)} />
        <button className='get-blob-button' onClick={getBlobData} disabled={getButtonText !== defaultGetButtonText}>{getButtonText}</button>
        <button className='update-blob-button' onClick={setBlobData} disabled={updateButtonText !== defaultUpdateButtonText}>{updateButtonText}</button>
      </div>

      <JSONInput
        id='blobstore-json'
        placeholder={initialBlobValue}
        onChange={({ jsObject }) => setBlobValue(jsObject)}
        locale={locale}
        height={`${window.innerHeight*.8 - 50}px`}
        style={{
          outerBox: { width: 'auto' },
          container: { width: 'auto', borderRadius: '7px' },
          body: { fontSize: '14px' },
        }}
        key={jsonInputKey.toString()}
      />
    </div>
  )
}

export default Blobstore;
