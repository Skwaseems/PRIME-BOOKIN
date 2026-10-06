import {useState} from 'react';
import {useDispatch} from 'react-redux';

import {errorMessage} from '../api';
import {pbApi, EnquiryInput, Enquiry} from './api';
import {rememberRequest} from './pbSlice';
import {buildMessage, openWhatsApp} from './whatsapp';

// Records a request with the API (which prices it and alerts the partners),
// remembers it for the Bookings screen, then hands over to WhatsApp.
export const useSendRequest = (onError: (message: string) => void) => {
  const dispatch = useDispatch();
  const [sending, setSending] = useState(false);

  const send = async (input: EnquiryInput): Promise<Enquiry | null> => {
    setSending(true);
    try {
      const {enquiry, accessKey, whatsapp} = await pbApi.send(input);
      dispatch(rememberRequest(`${enquiry._id}:${accessKey}`));
      openWhatsApp(buildMessage(enquiry, accessKey), whatsapp);
      return enquiry;
    } catch (err) {
      onError(errorMessage(err));
      return null;
    } finally {
      setSending(false);
    }
  };

  return {send, sending};
};

// Shrinks a camera photo to a JPEG data URL small enough to upload quickly.
export const compressImage = (file: File, maxSide = 1280, quality = 0.75): Promise<string> =>
  new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, maxSide / Math.max(img.width, img.height));
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL('image/jpeg', quality));
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('That file is not an image'));
    };
    img.src = url;
  });
