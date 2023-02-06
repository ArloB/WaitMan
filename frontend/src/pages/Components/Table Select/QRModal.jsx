import { Html5Qrcode } from "html5-qrcode";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const QRModal = () => {
  const [QRScanner, setQRScanner] = useState();
  const navigate = useNavigate();

  const teardown = () => {
    if (QRScanner) {
      if (QRScanner.isScanning) {
        QRScanner.stop().then(() => QRScanner.clear());
      } else {
        QRScanner.clear();
      }
    }
  };

  useEffect(() => {
    const qrscanner = new Html5Qrcode("qrcode-div");

    setQRScanner(qrscanner);

    return teardown;
  }, []);

  const handleScan = (decodedText, _) => {
    const url = new URL(decodedText);

    if (url.hostname !== process.env.REACT_APP_HOST) {
      toast.error("Invalid URL");
    } else {
      teardown();
      navigate(url.pathname);
    }
  };

  const toggleQR = (off) => {
    if (off.checked) {
      QRScanner.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        handleScan
      ).catch((e) => {
        off.checked = false;
        toast.error(e);
      });
    } else {
      if (QRScanner.isScanning) {
        QRScanner.stop();
      }
    }
  };

  return (
    <>
      <label htmlFor="qr-modal" className="btn modal-button mb-4">
        Scan QR Code
      </label>

      <input
        type="checkbox"
        id="qr-modal"
        className="modal-toggle"
        onChange={(e) => toggleQR(e.target)}
      />
      <label htmlFor="qr-modal" className="modal cursor-pointer">
        <label className="modal-box relative" htmlFor="">
          <h3 className="font-bold text-lg">Scan QR Code</h3>
          <div id="qrcode-div" />
        </label>
      </label>
    </>
  );
};

export default QRModal;
